import 'dotenv/config';

export const googleConfig = {
	apiKey: process.env.GOOGLE_API_KEY || '',
	// Business ID (CID) para la API legacy
	businessId: process.env.GOOGLE_BUSINESS_ID || '',
};

/**
 * Verifica si Google está configurado correctamente
 */
export function isGoogleConfigured() {
	return !!(googleConfig.apiKey && googleConfig.businessId);
}
