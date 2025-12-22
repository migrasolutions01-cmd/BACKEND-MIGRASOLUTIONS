import "dotenv/config";

export const sharePointConfig = {
  tenantId: process.env.SHAREPOINT_TENANT_ID || "",
  clientId: process.env.SHAREPOINT_CLIENT_ID || "",
  clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || "",
  siteId: process.env.SHAREPOINT_SITE_ID || "",
  driveId: process.env.SHAREPOINT_DRIVE_ID,
};

const allowedOrigins = [
  `https://${process.env.CORS_ORIGIN}`,
  `https://www.${process.env.CORS_ORIGIN}`,
];

const corsOrigin = function (origin, callback) {
  // Permitir llamadas sin origin (Postman, curl, health checks)
  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(new Error("Not allowed by CORS"));
};


export const serverConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  corsOrigin,
};

export function isSharePointConfigured() {
  return !!(
    sharePointConfig.tenantId &&
    sharePointConfig.clientId &&
    sharePointConfig.clientSecret &&
    sharePointConfig.siteId
  );
}
