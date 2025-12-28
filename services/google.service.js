import { googleConfig, isGoogleConfigured } from '../config/google.config.js';

/**
 * Obtiene las reseñas de Google usando Places API Legacy con CID (Business ID)
 * @returns {Promise<Array>}
 */
export const getGoogleReviews = async () => {
	if (!isGoogleConfigured()) {
		throw new Error('Google no está configurado. Se requiere GOOGLE_API_KEY y GOOGLE_BUSINESS_ID');
	}

	const { apiKey, businessId } = googleConfig;

	try {
		// Usar Places API Legacy con CID (Business ID)
		const url = `https://maps.googleapis.com/maps/api/place/details/json?cid=${businessId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Error de Google API: ${response.status}`);
		}

		const data = await response.json();

		if (data.status !== 'OK') {
			console.error('Error de Google Places API:', data.status, data.error_message);
			throw new Error(`Error de Google API: ${data.status} - ${data.error_message || ''}`);
		}

		const reviews = data.result?.reviews || [];

		// Formatear reseñas para el frontend - solo datos públicos
		return reviews.map((review) => ({
			author: review.author_name || 'Anónimo',
			profilePhoto: review.profile_photo_url || null,
			rating: review.rating || 0,
			comment: review.text || '',
			date: formatDate(review.time),
			relativeDate: review.relative_time_description || '',
		}));
	} catch (error) {
		console.error('Error obteniendo reseñas:', error.message);
		throw error;
	}
};

/**
 * Obtiene estadísticas del lugar (rating promedio y total de reseñas)
 * @returns {Promise<Object>}
 */
export const getPlaceStats = async () => {
	if (!isGoogleConfigured()) {
		throw new Error('Google no está configurado. Se requiere GOOGLE_API_KEY y GOOGLE_BUSINESS_ID');
	}

	const { apiKey, businessId } = googleConfig;

	try {
		const url = `https://maps.googleapis.com/maps/api/place/details/json?cid=${businessId}&fields=name,rating,user_ratings_total&key=${apiKey}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Error de Google API: ${response.status}`);
		}

		const data = await response.json();

		if (data.status !== 'OK') {
			throw new Error(`Error de Google API: ${data.status} - ${data.error_message || ''}`);
		}

		return {
			name: data.result?.name || '',
			averageRating: data.result?.rating || 0,
			totalReviews: data.result?.user_ratings_total || 0,
		};
	} catch (error) {
		console.error('Error obteniendo estadísticas:', error.message);
		throw error;
	}
};

/**
 * Convierte timestamp Unix a fecha legible
 * @param {number} timestamp
 * @returns {string}
 */
const formatDate = (timestamp) => {
	if (!timestamp) return '';
	try {
		const date = new Date(timestamp * 1000);
		return date.toISOString().split('T')[0];
	} catch {
		return '';
	}
};
