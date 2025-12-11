# M-Migration Backend

Backend Express para el manejo de formularios y conexión con SharePoint.

## Estructura

```
backend/
├── src/
│   ├── config/
│   │   └── sharepoint.config.ts    # Configuración de SharePoint y servidor
│   ├── controllers/
│   │   └── forms.controller.ts     # Controlador de formularios
│   ├── routes/
│   │   └── forms.routes.ts         # Rutas de la API
│   ├── services/
│   │   └── sharepoint.service.ts   # Servicio de SharePoint Graph API
│   ├── app.ts                      # Configuración de Express
│   └── index.ts                    # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación

```bash
cd backend
npm install
```

## Configuración

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# SharePoint Configuration
SHAREPOINT_TENANT_ID=tu-tenant-id
SHAREPOINT_CLIENT_ID=tu-client-id
SHAREPOINT_CLIENT_SECRET=tu-client-secret
SHAREPOINT_SITE_ID=tu-site-id
SHAREPOINT_DRIVE_ID=tu-drive-id  # Opcional

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:4321
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Información del API |
| GET | `/api/forms/health` | Health check |
| POST | `/api/forms/:id` | Enviar formulario |

## Envío de Formularios

El endpoint `POST /api/forms/:id` acepta:
- `multipart/form-data` con campos del formulario
- Archivos en el campo `files` (múltiples archivos soportados)
- Archivos individuales en otros campos

### Ejemplo

```javascript
const formData = new FormData();
formData.append('nombre', 'Juan Pérez');
formData.append('email', 'juan@example.com');
formData.append('files', archivo1);
formData.append('files', archivo2);

const response = await fetch('http://localhost:3001/api/forms/intake-vawa', {
  method: 'POST',
  body: formData,
});
```

## Organización en SharePoint

Los archivos se organizan en la siguiente estructura:

```
{año}/{clientId}/{tipoFormulario}/
```

Donde `clientId` se determina por:
1. Número A (número alien) si está disponible
2. Número de teléfono (prefijo `tel-`)
3. ID temporal (prefijo `temp-`)

Ejemplo: `2025/A123456789/intake-vawa/`

