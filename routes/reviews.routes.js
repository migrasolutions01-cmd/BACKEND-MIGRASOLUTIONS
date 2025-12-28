import { Router } from 'express';
import { getReviews, getStats } from '../controllers/reviews.controller.js';

const router = Router();

// Obtener lista de reseñas formateadas
router.get('/', getReviews);

// Obtener estadísticas (rating promedio, total de reseñas)
router.get('/stats', getStats);

export default router;
