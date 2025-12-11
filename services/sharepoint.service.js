/**
 * Obtiene un token de acceso de Microsoft Graph API usando Client Credentials
 * @param {Object} config
 * @returns {Promise<string>}
 */
async function getAccessToken(config) {
	const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;

	const params = new URLSearchParams({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		scope: 'https://graph.microsoft.com/.default',
		grant_type: 'client_credentials',
	});

	const response = await fetch(tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Error obteniendo token: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	return data.access_token;
}

/**
 * Obtiene el ID del site de SharePoint a partir de la URL del sitio
 * @param {string} accessToken
 * @param {string} siteId
 * @returns {Promise<string>}
 */
async function resolveSiteId(accessToken, siteId) {
	if (siteId.includes(',')) {
		return siteId;
	}

	if (siteId.startsWith('http')) {
		const url = new URL(siteId);
		const hostname = url.hostname;
		const sitePath = url.pathname;

		const siteUrl = `https://graph.microsoft.com/v1.0/sites/${hostname}:${sitePath}`;
		const response = await fetch(siteUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Error resolviendo site desde URL: ${response.status} - ${errorText}`);
		}

		const site = await response.json();
		return site.id;
	}

	return siteId;
}

/**
 * Obtiene el ID del drive de SharePoint
 * @param {string} accessToken
 * @param {string} siteId
 * @param {string} [driveId]
 * @returns {Promise<string>}
 */
async function getDriveId(accessToken, siteId, driveId) {
	if (driveId) {
		return driveId;
	}

	const resolvedSiteId = await resolveSiteId(accessToken, siteId);
	const driveUrl = `https://graph.microsoft.com/v1.0/sites/${resolvedSiteId}/drive`;

	const response = await fetch(driveUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Error obteniendo drive: ${response.status} - ${errorText}`);
	}

	const drive = await response.json();
	return drive.id;
}

/**
 * Crea una carpeta en SharePoint si no existe
 * @param {string} accessToken
 * @param {string} driveId
 * @param {string} folderPath
 * @returns {Promise<string>}
 */
async function ensureFolder(accessToken, driveId, folderPath) {
	const baseUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:`;
	const normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
	const fullPath = `${baseUrl}${normalizedPath}:`;

	try {
		const response = await fetch(fullPath, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (response.ok) {
			const folder = await response.json();
			return folder.id;
		}
	} catch {
		// La carpeta no existe, continuar para crearla
	}

	const pathParts = normalizedPath.split('/').filter(Boolean);
	let currentPath = '';
	let parentId = 'root';

	for (const part of pathParts) {
		currentPath += `/${part}`;
		const checkPath = `${baseUrl}${currentPath}:`;

		try {
			const checkResponse = await fetch(checkPath, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (checkResponse.ok) {
				const folder = await checkResponse.json();
				parentId = folder.id;
			} else {
				const createUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${parentId}/children`;

				const createResponse = await fetch(createUrl, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: part,
						folder: {},
						'@microsoft.graph.conflictBehavior': 'rename',
					}),
				});

				if (!createResponse.ok) {
					const errorText = await createResponse.text();
					throw new Error(`Error creando carpeta ${part}: ${createResponse.status} - ${errorText}`);
				}

				const newFolder = await createResponse.json();
				parentId = newFolder.id;
			}
		} catch (error) {
			throw new Error(`Error procesando carpeta ${part}: ${error}`);
		}
	}

	return parentId;
}

/**
 * Sube un archivo a SharePoint
 * @param {Object} config
 * @param {string} folderPath
 * @param {string} fileName
 * @param {Buffer|string} fileContent
 * @param {string} [contentType='application/octet-stream']
 * @returns {Promise<{success: boolean, fileId?: string, webUrl?: string, error?: string}>}
 */
export async function uploadFileToSharePoint(
	config,
	folderPath,
	fileName,
	fileContent,
	contentType = 'application/octet-stream'
) {
	try {
		const accessToken = await getAccessToken(config);
		const driveId = await getDriveId(accessToken, config.siteId, config.driveId);
		await ensureFolder(accessToken, driveId, folderPath);

		let fileBuffer;
		if (Buffer.isBuffer(fileContent)) {
			const uint8Array = new Uint8Array(fileContent);
			fileBuffer = uint8Array.buffer.slice(
				uint8Array.byteOffset,
				uint8Array.byteOffset + uint8Array.byteLength
			);
		} else {
			const encoder = new TextEncoder();
			const encoded = encoder.encode(fileContent);
			fileBuffer = encoded.buffer.slice(
				encoded.byteOffset,
				encoded.byteOffset + encoded.byteLength
			);
		}

		const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
		const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${fullPath}:/content`;

		const uploadResponse = await fetch(uploadUrl, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': contentType,
			},
			body: fileBuffer,
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			return {
				success: false,
				error: `Error subiendo archivo: ${uploadResponse.status} - ${errorText}`,
			};
		}

		const uploadedFile = await uploadResponse.json();

		return {
			success: true,
			fileId: uploadedFile.id,
			webUrl: uploadedFile.webUrl,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido',
		};
	}
}

/**
 * Extrae el número alien de los datos del formulario
 * @param {Record<string, string>} formData
 * @returns {string|null}
 */
export function extractAlienNumber(formData) {
	const possibleFields = [
		'numeroA',
		'numeroExtranjero',
		'numeroAlien',
		'alienNumber',
		'numeroAAbusador',
	];

	for (const field of possibleFields) {
		const value = formData[field];
		if (value && typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}

	return null;
}

/**
 * Extrae el número de teléfono de los datos del formulario
 * @param {Record<string, string>} formData
 * @returns {string|null}
 */
export function extractPhoneNumber(formData) {
	const possibleFields = [
		'telefono',
		'telefonoContacto',
		'phone',
		'phoneNumber',
		'celular',
		'movil',
		'telefonoCelular',
		'tel',
	];

	for (const field of possibleFields) {
		const value = formData[field];
		if (value && typeof value === 'string' && value.trim()) {
			const cleanPhone = value.trim().replace(/[^0-9]/g, '');
			if (cleanPhone.length >= 7) {
				return cleanPhone;
			}
		}
	}

	return null;
}

/**
 * Obtiene el ID del cliente: número alien, teléfono, o ID temporal
 * @param {Record<string, string>} formData
 * @returns {string}
 */
export function getClientId(formData) {
	const alienNumber = extractAlienNumber(formData);
	if (alienNumber) {
		return alienNumber;
	}

	const phoneNumber = extractPhoneNumber(formData);
	if (phoneNumber) {
		return `tel-${phoneNumber}`;
	}

	return `temp-${Date.now()}`;
}

/**
 * Construye la ruta de carpeta: {año}/{numero_a || id_temporal}/{tipo_proceso}
 * @param {string} clientId
 * @param {string} processType
 * @returns {string}
 */
export function buildFolderPath(clientId, processType) {
	const year = new Date().getFullYear();
	return `${year}/${clientId}/${processType}`;
}

