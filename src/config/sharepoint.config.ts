import 'dotenv/config';

export interface SharePointConfig {
	tenantId: string;
	clientId: string;
	clientSecret: string;
	siteId: string;
	driveId?: string;
}

export const sharePointConfig: SharePointConfig = {
	tenantId: process.env.SHAREPOINT_TENANT_ID || '',
	clientId: process.env.SHAREPOINT_CLIENT_ID || '',
	clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
	siteId: process.env.SHAREPOINT_SITE_ID || '',
	driveId: process.env.SHAREPOINT_DRIVE_ID,
};

export const serverConfig = {
	port: parseInt(process.env.PORT || '3001', 10),
	corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4321',
};

export function isSharePointConfigured(): boolean {
	return !!(
		sharePointConfig.tenantId &&
		sharePointConfig.clientId &&
		sharePointConfig.clientSecret &&
		sharePointConfig.siteId
	);
}

