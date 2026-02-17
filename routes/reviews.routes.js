import { Router } from 'express';
import { getReviews, getStats, resolvePlaceId } from '../controllers/reviews.controller.js';

const router = Router();

// Resolver Place ID por nombre del negocio (para copiar a .env)
router.get('/place-id', resolvePlaceId);
// Estadísticas del lugar
router.get('/stats', getStats);
// Obtener reseñas de Google
router.get('/', getReviews);

export default router;
