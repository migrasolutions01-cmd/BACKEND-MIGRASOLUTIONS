import 'dotenv/config';
import app from './app.js';
import { serverConfig, isSharePointConfigured } from './config/sharepoint.config.js';

const PORT = serverConfig.port;

app.listen(PORT, () => {
	console.log(`🚀 Backend servidor corriendo en http://localhost:${PORT}`);
	console.log(`📋 Endpoints disponibles:`);
	console.log(`   - GET  /api/forms/health`);
	console.log(`   - POST /api/forms/:id`);
	console.log(`\n📁 SharePoint: ${isSharePointConfigured() ? '✅ Configurado' : '⚠️ No configurado'}`);
	console.log(`🔗 CORS habilitado para: ${serverConfig.corsOrigin}`);
});

