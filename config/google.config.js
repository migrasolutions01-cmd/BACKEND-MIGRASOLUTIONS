/**
 * Configuración de Google My Business
 * Verifica que las variables de entorno necesarias estén configuradas
 */

/**
 * Verifica si Google está configurado correctamente
 * @returns {boolean}
 */
export const isGoogleConfigured = () => {
	const requiredVars = [
		'GOOGLE_CLIENT_ID',
		'GOOGLE_CLIENT_SECRET',
		'GOOGLE_REFRESH_TOKEN',
		'GOOGLE_ACCOUNT_ID',
		'GOOGLE_LOCATION_ID',
	];

	return requiredVars.every((varName) => {
		const value = process.env[varName];
		return value && value.trim() !== '';
	});
};
