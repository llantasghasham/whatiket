"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const search = async (req, res) => {
    if (!GOOGLE_API_KEY) {
        throw new AppError_1.default("GOOGLE_PLACES_API_KEY not configured", 500);
    }
    const { city, state, query, type, keyword, radius = 5000, openNow, minRating, minUserRatings, hasWebsite, pageToken } = req.query;
    if (!city || !state) {
        throw new AppError_1.default("CITY_AND_STATE_REQUIRED", 400);
    }
    try {
        // 1) Geocode city+state para obter lat/lng
        const address = `${city}, ${state}, Brazil`;
        const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";
        const geoResp = await axios_1.default.get(geocodeUrl, {
            params: {
                address,
                key: GOOGLE_API_KEY
            }
        });
        if (!geoResp.data.results?.length) {
            throw new AppError_1.default("GEOCODE_NOT_FOUND", 404);
        }
        const location = geoResp.data.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        // 2) Buscar lugares no Places Text Search
        const placesUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
        const textQuery = query || keyword || "";
        const placesParams = {
            key: GOOGLE_API_KEY,
            location: `${lat},${lng}`,
            radius,
            language: "pt-BR",
            region: "br"
        };
        if (textQuery) {
            placesParams.query = textQuery;
        }
        if (type) {
            placesParams.type = type;
        }
        if (keyword) {
            placesParams.keyword = keyword;
        }
        if (pageToken) {
            placesParams.pagetoken = pageToken;
        }
        if (typeof openNow !== "undefined") {
            placesParams.opennow = openNow === "true";
        }
        const placesResp = await axios_1.default.get(placesUrl, { params: placesParams });
        let results = placesResp.data.results || [];
        // 3) Filtros locais: rating e número de avaliações
        const minRatingNum = minRating ? Number(minRating) : undefined;
        const minUserRatingsNum = minUserRatings ? Number(minUserRatings) : undefined;
        if (minRatingNum) {
            results = results.filter((r) => (r.rating || 0) >= minRatingNum);
        }
        if (minUserRatingsNum) {
            results = results.filter((r) => (r.user_ratings_total || 0) >= minUserRatingsNum);
        }
        // 4) Se quiser filtrar por website, precisamos consultar Place Details
        let detailed = results;
        if (typeof hasWebsite !== "undefined") {
            const wantsWebsite = hasWebsite === "true";
            const detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json";
            detailed = [];
            for (const place of results) {
                try {
                    const detailsResp = await axios_1.default.get(detailsUrl, {
                        params: {
                            place_id: place.place_id,
                            fields: "name,formatted_address,geometry,website,formatted_phone_number,types,rating,user_ratings_total",
                            key: GOOGLE_API_KEY,
                            language: "pt-BR",
                            region: "br"
                        }
                    });
                    const det = detailsResp.data.result;
                    const hasSite = !!det.website;
                    if ((wantsWebsite && hasSite) || (!wantsWebsite && !hasSite)) {
                        detailed.push({ ...place, details: det });
                    }
                }
                catch {
                    // Ignorar erro individual de detalhe
                }
            }
        }
        const finalResults = (typeof hasWebsite !== "undefined" ? detailed : results).map((r) => {
            const base = r.details || r;
            return {
                name: base.name,
                address: base.formatted_address,
                lat: base.geometry?.location?.lat,
                lng: base.geometry?.location?.lng,
                rating: base.rating,
                userRatingsTotal: base.user_ratings_total,
                placeId: base.place_id || r.place_id,
                website: base.website || null,
                phone: base.formatted_phone_number || null,
                types: base.types || []
            };
        });
        return res.status(200).json({
            results: finalResults,
            nextPageToken: placesResp.data.next_page_token || null
        });
    }
    catch (err) {
        if (err instanceof AppError_1.default) {
            throw err;
        }
        throw new AppError_1.default("GOOGLE_PLACES_ERROR", 500);
    }
};
exports.search = search;
