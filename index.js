import 'dotenv/config';
import app from './app.js';
import { serverConfig, isSharePointConfigured } from './config/sharepoint.config.js';
import { isGoogleConfigured } from './config/google.config.js';

const PORT = serverConfig.port;

app.listen(PORT, () => {
	console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
	console.log(`📋 Endpoints:`);
	console.log(`   - GET  /api/forms/health`);
	console.log(`   - POST /api/forms/:id`);
	console.log(`   - GET  /api/reviews`);
	console.log(`   - GET  /api/reviews/stats`);
	console.log(`\n📁 SharePoint: ${isSharePointConfigured() ? '✅' : '⚠️'}`);
	console.log(`⭐ Google Reviews: ${isGoogleConfigured() ? '✅' : '⚠️'}`);
});
