import { getGoogleReviews, getPlaceStats } from '../services/google.service.js';
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
