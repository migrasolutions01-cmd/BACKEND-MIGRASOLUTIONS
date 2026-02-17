/** Cache del place_id cuando se usa GOOGLE_BUSINESS_QUERY */
let cachedPlaceId = null;

/**
 * Resuelve el Place ID del negocio por nombre (o dirección). Usa Find Place para obtener
 * el perfil del negocio, no solo la ubicación.
 * @param {string} query - Nombre del negocio o "Nombre + Ciudad" (ej. "M-MIGRATION LLC Elmhurst NY")
 * @returns {Promise<{ place_id: string, name: string, formatted_address: string } | null>}
 */
export const findPlaceByQuery = async (query) => {
	const apiKey = process.env.GOOGLE_API_KEY;
	if (!apiKey || !query?.trim()) return null;

	const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query.trim())}&inputtype=textquery&fields=place_id,name,formatted_address&language=es&key=${apiKey}`;

	const response = await fetch(url);
	const data = await response.json();

	if (data.status !== 'OK' || !data.candidates?.length) {
		return null;
	}

	const c = data.candidates[0];
	return {
		place_id: c.place_id,
		name: c.name || null,
		formatted_address: c.formatted_address || null,
	};
};

/**
 * Devuelve el place_id a usar: GOOGLE_PLACE_ID o el resuelto desde GOOGLE_BUSINESS_QUERY (con cache).
 * @returns {Promise<string|null>}
 */
async function getResolvedPlaceId() {
	const placeId = process.env.GOOGLE_PLACE_ID?.trim();
	if (placeId) return placeId;

	const query = process.env.GOOGLE_BUSINESS_QUERY?.trim();
	if (!query) return null;

	if (cachedPlaceId) return cachedPlaceId;

	const place = await findPlaceByQuery(query);
	if (place) {
		cachedPlaceId = place.place_id;
		return cachedPlaceId;
	}
	return null;
}

/**
 * Obtiene las reseñas de Google Places usando la API de Places
 * @returns {Promise<Array>}
 */
export const getGoogleReviews = async () => {
	const apiKey = process.env.GOOGLE_API_KEY;
	const placeId = await getResolvedPlaceId();

	if (!apiKey || !placeId) {
		throw new Error('Configura GOOGLE_PLACE_ID o GOOGLE_BUSINESS_QUERY (nombre del negocio) en .env');
	}

	const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,reviews&language=es&key=${apiKey}`;

	const response = await fetch(url);
	const data = await response.json();

	if (data.status !== 'OK') {
		throw new Error(`Error de Google Places API: ${data.status} - ${data.error_message || 'Error desconocido'}`);
	}

	const reviews = data.result?.reviews ?? [];
	if (reviews.length === 0 && data.result) {
		const keys = Object.keys(data.result);
		console.warn(
			'[Google Reviews] Sin reseñas en la respuesta. Place:', data.result.name ?? data.result.vicinity,
			'| user_ratings_total:', data.result.user_ratings_total,
			'| Campos devueltos por la API:', keys.join(', ')
		);
		// Si no viene 'reviews' ni 'rating', la API key suele estar restringida (ej. "Referentes HTTP").
		// En Cloud Console → Credenciales → tu API key → Restricciones de aplicación → "Ninguna" o "Direcciones IP".
		if (!keys.includes('reviews') || !keys.includes('rating')) {
			console.warn('[Google Reviews] La API no devolvió rating/reviews. Revisa restricciones de la API key (sin "Referentes HTTP" para uso en servidor).');
		}
	}

	return reviews.map((r) => ({
		author: r.author_name,
		rating: r.rating,
		comment: r.text,
		date: r.time,
		profilePhoto: r.profile_photo_url || null,
		relativeTime: r.relative_time_description || null,
	}));
};

/**
 * Obtiene las estadísticas del lugar de Google Places
 * @returns {Promise<Object>}
 */
export const getPlaceStats = async () => {
	const apiKey = process.env.GOOGLE_API_KEY;
	const placeId = await getResolvedPlaceId();

	if (!apiKey || !placeId) {
		throw new Error('Configura GOOGLE_PLACE_ID o GOOGLE_BUSINESS_QUERY (nombre del negocio) en .env');
	}

	const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total&key=${apiKey}`;

	const response = await fetch(url);
	const data = await response.json();

	if (data.status !== 'OK') {
		throw new Error(`Error de Google Places API: ${data.status} - ${data.error_message || 'Error desconocido'}`);
	}

	const place = data.result;

	return {
		name: place.name || null,
		averageRating: place.rating || null,
		totalReviews: place.user_ratings_total || 0,
	};
};
