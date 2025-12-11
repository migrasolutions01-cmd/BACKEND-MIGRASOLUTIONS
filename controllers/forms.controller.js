import {
	uploadFileToSharePoint,
	getClientId,
	buildFolderPath,
} from '../services/sharepoint.service.js';
import { sharePointConfig, isSharePointConfigured } from '../config/sharepoint.config.js';

/**
 * Serializa los datos del formulario a texto plano
 * @param {Record<string, string>} formData
 * @param {Array} files
 * @returns {string}
 */
const serializeFormData = (formData, files) => {
	const parts = [];
	const filesList = [];

	for (const [key, value] of Object.entries(formData)) {
		if (typeof value === 'string') {
			parts.push(`${key}: ${value}`);
		}
	}

	for (const file of files) {
		const fileSize = (file.size / 1024).toFixed(2);
		filesList.push(`  - ${file.originalname} (${fileSize} KB, tipo: ${file.mimetype})`);
	}

	let result = parts.join('\n');

	if (filesList.length > 0) {
		result += '\n\nArchivos adjuntos:\n' + filesList.join('\n');
	}

	return result;
};

/**
 * Extrae todos los archivos del request de multer
 * @param {Object} req
 * @returns {Array}
 */
const extractFiles = (req) => {
	const allFiles = [];

	if (Array.isArray(req.files)) {
		allFiles.push(...req.files);
	} else if (req.files && typeof req.files === 'object') {
		for (const fieldFiles of Object.values(req.files)) {
			allFiles.push(...fieldFiles);
		}
	}

	return allFiles;
};

/**
 * Controlador para procesar formularios
 * @param {Object} req
 * @param {Object} res
 */
export const submitForm = async (req, res) => {
	try {
		const formId = req.params.id ?? 'formulario';
		const timestamp = new Date().toISOString();
		const files = extractFiles(req);

		const plainText = `Formulario: ${formId}\nFecha: ${timestamp}\n\n${serializeFormData(
			req.body,
			files
		)}\n`;

		// Subir a SharePoint si está configurado
		if (isSharePointConfigured()) {
			try {
				const clientId = getClientId(req.body);
				const folderPath = buildFolderPath(clientId, formId);

				// Subir archivo de texto del formulario
				const textFileName = `${formId}-${Date.now()}.txt`;

				const textUploadResult = await uploadFileToSharePoint(
					sharePointConfig,
					folderPath,
					textFileName,
					plainText,
					'text/plain; charset=utf-8'
				);

				if (!textUploadResult.success) {
					console.error(
						'Error subiendo archivo de texto a SharePoint:',
						textUploadResult.error
					);
				}

				// Subir todos los archivos adjuntos
				for (const file of files) {
					if (!file.originalname || file.originalname.trim() === '' || file.size === 0) {
						console.warn(`Archivo ignorado: nombre vacío o tamaño 0`);
						continue;
					}

					const fileUploadResult = await uploadFileToSharePoint(
						sharePointConfig,
						folderPath,
						file.originalname,
						file.buffer,
						file.mimetype || 'application/octet-stream'
					);

					if (!fileUploadResult.success) {
						console.error(
							`Error subiendo archivo ${file.originalname} a SharePoint:`,
							fileUploadResult.error
						);
					}
				}
			} catch (error) {
				console.error('Error en proceso de SharePoint:', error);
			}
		}

		res.status(200).json({
			success: true,
			message: 'Formulario recibido correctamente',
		});
	} catch (error) {
		console.error('Error procesando formulario:', error);
		res.status(500).json({
			success: false,
			message: 'Error interno del servidor',
		});
	}
};

/**
 * Health check endpoint
 * @param {Object} _req
 * @param {Object} res
 */
export const healthCheck = (_req, res) => {
	res.status(200).json({
		status: 'ok',
		sharepoint: isSharePointConfigured() ? 'configured' : 'not_configured',
		timestamp: new Date().toISOString(),
	});
};

