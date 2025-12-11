import express from 'express';
import cors from 'cors';
import formsRoutes from './routes/forms.routes.js';
import { serverConfig } from './config/sharepoint.config.js';

const app = express();

// Middleware de CORS
app.use(
	cors({
		origin: serverConfig.corsOrigin,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL encoded
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/forms', formsRoutes);

// Ruta raíz
app.get('/', (_req, res) => {
	res.json({
		name: 'm-migration-backend',
		version: '1.0.0',
		endpoints: {
			health: '/api/forms/health',
			submitForm: 'POST /api/forms/:id',
		},
	});
});

// Manejo de errores 404
app.use((_req, res) => {
	res.status(404).json({ error: 'Endpoint no encontrado' });
});

export default app;

