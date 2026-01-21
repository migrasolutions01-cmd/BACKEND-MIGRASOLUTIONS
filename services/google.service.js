import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
);

// Configurar tokens desde variables de entorno
oauth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

/**
 * Obtiene las reseñas de Google My Business
 * @returns {Promise<Array>}
 */
export const getGoogleReviews = async () => {
	const accountId = process.env.GOOGLE_ACCOUNT_ID;
	const locationId = process.env.GOOGLE_LOCATION_ID;

	if (!accountId || !locationId) {
		throw new Error('GOOGLE_ACCOUNT_ID y GOOGLE_LOCATION_ID son requeridos');
	}

	const mybusinessReviews = google.mybusiness({
		version: 'v4',
		auth: oauth2Client,
	});

	const response = await mybusinessReviews.accounts.locations.reviews.list({
		parent: `accounts/${accountId}/locations/${locationId}`,
	});

	const reviews = response.data.reviews || [];

	return reviews.map((r) => ({
		author: r.reviewer?.displayName,
		rating: r.starRating,
		comment: r.comment,
		date: r.createTime,
	}));
};

/**
 * Obtiene las estadísticas del lugar de Google My Business
 * @returns {Promise<Object>}
 */
export const getPlaceStats = async () => {
	const accountId = process.env.GOOGLE_ACCOUNT_ID;
	const locationId = process.env.GOOGLE_LOCATION_ID;

	if (!accountId || !locationId) {
		throw new Error('GOOGLE_ACCOUNT_ID y GOOGLE_LOCATION_ID son requeridos');
	}

	const mybusiness = google.mybusiness({
		version: 'v4',
		auth: oauth2Client,
	});

	const response = await mybusiness.accounts.locations.get({
		name: `accounts/${accountId}/locations/${locationId}`,
	});

	const location = response.data;

	return {
		name: location.locationName,
		averageRating: location.locationState?.averageRating || null,
		totalReviews: location.locationState?.totalReviewCount || 0,
	};
};
