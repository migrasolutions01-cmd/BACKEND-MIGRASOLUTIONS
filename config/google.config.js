import 'dotenv/config';

export const googleConfig = {
	// Solo se necesitan estas 2 variables para funcionar
	apiKey: process.env.GOOGLE_API_KEY || '',
	placeId: process.env.GOOGLE_PLACE_ID || '',
};

/**
 * Verifica si Google está configurado correctamente
 */
export function isGoogleConfigured() {
	return !!(googleConfig.apiKey && googleConfig.placeId);
}
