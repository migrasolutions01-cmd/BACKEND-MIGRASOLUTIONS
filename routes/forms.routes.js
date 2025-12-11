import { Router } from 'express';
import multer from 'multer';
import { submitForm, healthCheck } from '../controllers/forms.controller.js';

const router = Router();

// Configuración de multer para manejo de archivos en memoria
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB máximo por archivo
		files: 20, // Máximo 20 archivos
	},
});

// Health check
router.get('/health', healthCheck);

// Endpoint para enviar formularios
// Acepta archivos en el campo 'files' y cualquier otro campo de archivo
router.post('/:id', upload.any(), submitForm);

export default router;

