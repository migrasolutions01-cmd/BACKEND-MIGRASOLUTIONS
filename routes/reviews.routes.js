import { Router } from 'express';
import { getReviews } from '../controllers/reviews.controller.js';

const router = Router();

// Obtener reseñas de Google My Business
router.get('/', getReviews);

export default router;
