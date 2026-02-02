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
		'GOOGLE_API_KEY',
		'GOOGLE_PLACE_ID',
		'GOOGLE_BUSINESS_ID',
	];
	return requiredVars.every((varName) => {
		const value = process.env[varName];
		return value && value.trim() !== '';
	});
};
