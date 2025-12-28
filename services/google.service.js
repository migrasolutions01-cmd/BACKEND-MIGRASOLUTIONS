import { googleConfig, isGoogleConfigured } from '../config/google.config.js';

/**
 * Obtiene las reseñas de Google usando Places API (New)
 * Solo necesita API Key y Place ID - sin OAuth
 * @returns {Promise<Array>}
 */
export const getGoogleReviews = async () => {
	if (!isGoogleConfigured()) {
		throw new Error('Google no está configurado. Se requiere GOOGLE_API_KEY y GOOGLE_PLACE_ID');
	}

	const { apiKey, placeId } = googleConfig;

	try {
		// Usar Google Places API (New)
		const response = await fetch(
			`https://places.googleapis.com/v1/places/${placeId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-Goog-Api-Key': apiKey,
					'X-Goog-FieldMask': 'reviews,rating,userRatingCount,displayName',
				},
			}
		);

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			
			// Mensaje específico si la API no está habilitada
			if (response.status === 403 && error.error?.message?.includes('has not been used')) {
				console.error('⚠️  Debes habilitar "Places API (New)" en Google Cloud Console:');
				console.error('   https://console.cloud.google.com/apis/library/places.googleapis.com');
				throw new Error('API_NOT_ENABLED');
			}
			
			console.error('Error de Google Places API:', error);
			throw new Error(`Error de Google API: ${response.status}`);
		}

		const data = await response.json();
		const reviews = data.reviews || [];

		// Formatear reseñas para el frontend - solo datos públicos
		return reviews.map((review) => ({
			author: review.authorAttribution?.displayName || 'Anónimo',
			profilePhoto: review.authorAttribution?.photoUri || null,
			rating: review.rating || 0,
			comment: review.text?.text || review.originalText?.text || '',
			relativeDate: review.relativePublishTimeDescription || '',
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
		throw new Error('Google no está configurado. Se requiere GOOGLE_API_KEY y GOOGLE_PLACE_ID');
	}

	const { apiKey, placeId } = googleConfig;

	try {
		const response = await fetch(
			`https://places.googleapis.com/v1/places/${placeId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-Goog-Api-Key': apiKey,
					'X-Goog-FieldMask': 'rating,userRatingCount,displayName',
				},
			}
		);

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			
			if (response.status === 403 && error.error?.message?.includes('has not been used')) {
				throw new Error('API_NOT_ENABLED');
			}
			
			throw new Error(`Error de Google API: ${response.status}`);
		}

		const data = await response.json();

		return {
			name: data.displayName?.text || '',
			averageRating: data.rating || 0,
			totalReviews: data.userRatingCount || 0,
		};
	} catch (error) {
		console.error('Error obteniendo estadísticas:', error.message);
		throw error;
	}
};
