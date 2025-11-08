// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const helmet = require('helmet');

const app = express();
app.use(express.json());
app.use(helmet());

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);
const cache = new NodeCache({ stdTTL: CACHE_TTL });

const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
if (!mapsKey) {
  console.error('Missing GOOGLE_MAPS_API_KEY in .env');
  process.exit(1);
}

const llmApiUrl = process.env.LLM_API_URL;
if (!llmApiUrl) {
  console.error('Missing LLM_API_URL in .env');
  process.exit(1);
}

// basic rate limiter to protect both our backend and Google Maps usage
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
});
app.use(limiter);

/**
 * Helper: call local LLM to parse user prompt into structured JSON like:
 * { intent: "find", place_type: "restaurant", keywords: "sushi", radius: 3000, location: {lat, lng}, limit:5 }
 *
 * We keep the prompt deterministic, asking LLM to return JSON only (helps safety & parsing).
 */
async function parsePromptWithLLM(prompt, fallbackLocation) {
  const instruction = `
You are a parser assistant. Receive a user text prompt and output ONLY valid JSON (no extra text).
Fields:
- intent: "find" or "directions" or "details"
- place_type: (e.g. "restaurant", "cafe", "museum") or null
- keywords: additional free-text keywords or null
- radius_m: integer radius in meters or null
- limit: integer max results
- location: { lat: number, lng: number } or null  (if null, server will use fallback)
Return JSON only.
User prompt: """${prompt}"""
`;

  // Example POST for Open WebUI-like API. Adjust to your runner's API shape.
  const payload = {
    // adapt to the API you have: this is an example shape
    model: "llama3.2:3b",
    prompt: instruction,
    stream: false,
    options: {
        temperature: 0.8
    }
  };

  try {
    const headers = {};
    if (process.env.LLM_API_KEY) headers['Authorization'] = `Bearer ${process.env.LLM_API_KEY}`;
    const r = await axios.post(llmApiUrl, payload, { headers});
    // adapt extraction depending on your runner; here we try a few shapes:
    let text = null;
    if (r.data && typeof r.data === 'string') text = r.data;
    else if (r.data && r.data.output) text = r.data.output;
    else if (r.data && r.data.response) text = r.data.response;
    else if (r.data && r.data[0] && r.data[0].generated_text) text = r.data[0].generated_text;
    else text = JSON.stringify(r.data);

    // Find first JSON in the text:
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;

    const parsed = JSON.parse(jsonStr);

    // if location missing, fill fallback
    if (!parsed.location && fallbackLocation) parsed.location = fallbackLocation;
    return parsed;
  } catch (err) {
    console.warn('LLM parse failed, using fallback simple parser', err.message);
    // fallback naive parsing: try find numbers or simple words
    return {
      intent: 'find',
      place_type: null,
      keywords: prompt,
      radius_m: 3000,
      limit: 5,
      location: fallbackLocation
    };
  }
}

// Helper: call Google Places Nearby Search (or Text Search if keywords only)
async function searchPlaces({ location, radius_m = 3000, place_type, keywords, limit = 5 }) {
  // Build a cache key
  const cacheKey = `places:${location.lat},${location.lng}:${radius_m}:${place_type}:${keywords}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Choose appropriate API: use "nearbysearch" if we have lat/lng
  const params = new URLSearchParams({
    key: mapsKey,
    location: `${location.lat},${location.lng}`,
    radius: String(radius_m),
    // we will request only fields in the Place Details step to reduce billing
    // note: restrict fields returned where API supports FieldMask
  });
  if (place_type) params.set('type', place_type);
  if (keywords) params.set('keyword', keywords);

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;

  const resp = await axios.get(url);

  const results = (resp.data && resp.data.results) ? resp.data.results.slice(0, limit) : [];
  // map to a light object
  const mapped = results.map(p => ({
    place_id: p.place_id,
    name: p.name,
    rating: p.rating,
    user_ratings_total: p.user_ratings_total,
    vicinity: p.vicinity || p.formatted_address,
    location: p.geometry && p.geometry.location,
    maps_url: `https://www.google.com/maps/search/?api=1&query=place_id:${p.place_id}`,
    directions_url: `https://www.google.com/maps/dir/?api=1&destination=place_id:${p.place_id}`
  }));

  cache.set(cacheKey, mapped);
  return mapped;
}

/**
 * POST /api/search
 * body: { prompt: string, user_location?: {lat,lng} }
 * returns: { parsed, places }
 */
app.post('/api/search', async (req, res) => {
  try {
    const { prompt, user_location } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    // fallback location: if user didn't provide, we could ask client to provide.
    // Here we assume Jakarta center if none provided (as an example). Replace in production.
    const fallbackLocation = user_location || { lat: -6.200000, lng: 106.816666 };

    const parsed = await parsePromptWithLLM(prompt, fallbackLocation);

    // Basic validation / defaults
    parsed.radius_m = parsed.radius_m || 3000;
    parsed.limit = parsed.limit || 5;
    parsed.location = parsed.location || fallbackLocation;

    if (parsed.intent === 'directions' && parsed.destination_place_id) {
      // return direction link if user asked directions
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${parsed.location.lat},${parsed.location.lng}&destination=place_id:${parsed.destination_place_id}`;
      return res.json({ parsed, directions_url: directionsUrl });
    }

    const places = await searchPlaces({
      location: parsed.location,
      radius_m: parsed.radius_m,
      place_type: parsed.place_type,
      keywords: parsed.keywords,
      limit: parsed.limit
    });

    return res.json({ parsed, places });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error', details: err.message });
  }
});

/**
 * GET /api/place/:placeId -> Place Details server-side
 */
app.get('/api/place/:placeId', async (req, res) => {
  try {
    const placeId = req.params.placeId;
    const cacheKey = `place:${placeId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const params = new URLSearchParams({
      key: mapsKey,
      place_id: placeId,
      fields: 'name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photo'
    });
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const r = await axios.get(url);
    cache.set(cacheKey, r.data);
    res.json(r.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed_to_get_place' });
  }
});

/**
 * GET /api/directions?origin=lat,lng&destination_place_id=...
 * returns a redirectable Google Maps URL (or can fetch Directions API server-side)
 */
app.get('/api/directions', async (req, res) => {
  try {
    const { origin, destination_place_id } = req.query;
    if (!origin || !destination_place_id) {
      return res.status(400).json({ error: 'origin and destination_place_id required' });
    }
    const [lat, lng] = origin.split(',');
    // we simply return Google Maps web directions link so client can open/embed
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=place_id:${destination_place_id}`;
    res.json({ directions_url: directionsUrl });
  } catch (err) {
    res.status(500).json({ error: 'directions_error' });
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
