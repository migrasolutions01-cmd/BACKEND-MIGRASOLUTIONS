/**
 * Configuración de Google Places API
 * Verifica que las variables de entorno necesarias estén configuradas
 */

/**
 * Verifica si Google está configurado correctamente
 * @returns {boolean}
 */
export const isGoogleConfigured = () => {
	const apiKey = process.env.GOOGLE_API_KEY?.trim();
	if (!apiKey) return false;
	// Vale con API key + Place ID o con API key + nombre del negocio (BUSINESS_QUERY)
	const hasPlaceId = !!process.env.GOOGLE_PLACE_ID?.trim();
	const hasBusinessQuery = !!process.env.GOOGLE_BUSINESS_QUERY?.trim();
	return hasPlaceId || hasBusinessQuery;
};
