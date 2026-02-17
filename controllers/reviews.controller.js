import { getGoogleReviews, getPlaceStats, findPlaceByQuery } from '../services/google.service.js';
import { isGoogleConfigured } from '../config/google.config.js';

/**
 * Obtiene las reseñas - ENDPOINT PRINCIPAL PARA EL FRONTEND
 * Solo devuelve datos públicos formateados
 */
export const getReviews = async (_req, res) => {
	try {
		if (!isGoogleConfigured()) {
			return res.status(503).json({
				success: false,
				message: 'El servicio de reseñas no está configurado',
				data: [],
			});
		}

		const reviews = await getGoogleReviews();

		res.json({
			success: true,
			data: reviews,
			total: reviews.length,
		});
	} catch (error) {
		console.error('Error obteniendo reseñas:', error.message);

		res.status(500).json({
			success: false,
			message: 'Error al obtener las reseñas',
			data: [],
		});
	}
};

/**
 * Obtiene estadísticas del lugar - ENDPOINT PARA EL FRONTEND
 */
export const getStats = async (_req, res) => {
	try {
		if (!isGoogleConfigured()) {
			return res.status(503).json({
				success: false,
				message: 'El servicio de reseñas no está configurado',
				data: null,
			});
		}

		const stats = await getPlaceStats();

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error('Error obteniendo estadísticas:', error.message);

		res.status(500).json({
			success: false,
			message:  error.message,
			data: null,
		});
	}
};

/**
 * Resuelve el Place ID del negocio por nombre. Útil para obtener el ID correcto
 * (perfil del negocio, no la dirección) y ponerlo en GOOGLE_PLACE_ID.
 * GET /api/reviews/place-id?query=M-MIGRATION%20LLC%20Elmhurst
 */
export const resolvePlaceId = async (req, res) => {
	try {
		const query = req.query?.query?.trim();
		if (!query) {
			return res.status(400).json({
				success: false,
				message: 'Falta el parámetro query (ej: ?query=M-MIGRATION%20LLC%20Elmhurst)',
				data: null,
			});
		}

		const place = await findPlaceByQuery(query);
		if (!place) {
			return res.status(404).json({
				success: false,
				message: 'No se encontró ningún lugar con esa búsqueda',
				data: null,
			});
		}

		res.json({
			success: true,
			message: 'Copia place_id a GOOGLE_PLACE_ID en tu .env para usar este negocio.',
			data: place,
		});
	} catch (error) {
		console.error('Error resolviendo place id:', error.message);
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		});
	}
};
