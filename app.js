import express from 'express';
import cors from 'cors';
import formsRoutes from './routes/forms.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import { serverConfig } from './config/sharepoint.config.js';

const app = express();

// Middleware de CORS - Permitir todo
app.use(cors());

// IMPORTANTE para preflight
app.options("*", cors());


// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL encoded
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/forms', formsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Ruta raíz
app.get('/', (_req, res) => {
	res.json({
		name: 'm-migration-backend',
		version: '1.0.0',
		endpoints: {
			health: '/api/forms/health',
			submitForm: 'POST /api/forms/:id',
			reviews: '/api/reviews',
		},
	});
});

// Manejo de errores 404
app.use((_req, res) => {
	res.status(404).json({ error: 'Endpoint no encontrado' });
});

export default app;


