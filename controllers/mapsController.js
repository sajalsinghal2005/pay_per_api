const axios = require('axios');

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

/**
 * Geocode address to coordinates
 */
async function geocodeAddress(req, res) {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Address is required'
            });
        }

        if (!MAPBOX_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Maps service not configured'
            });
        }

        const response = await axios.get(
            `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
            {
                params: {
                    access_token: MAPBOX_API_KEY,
                    limit: 1
                }
            }
        );

        if (response.data.features.length === 0) {
            return res.json({
                success: false,
                message: 'Address not found'
            });
        }

        const feature = response.data.features[0];
        const [longitude, latitude] = feature.geometry.coordinates;

        res.json({
            success: true,
            data: {
                address: feature.place_name,
                latitude,
                longitude,
                type: feature.place_type[0]
            }
        });
    } catch (err) {
        console.error('[Geocoding Error]:', err.message);
        res.status(500).json({
            success: false,
            message: 'Geocoding failed',
            error: err.message
        });
    }
}

/**
 * Get directions between two points
 */
async function getDirections(req, res) {
    try {
        const { start_lat, start_lng, end_lat, end_lng } = req.body;

        if (!start_lat || !start_lng || !end_lat || !end_lng) {
            return res.status(400).json({
                success: false,
                message: 'Coordinates required: start_lat, start_lng, end_lat, end_lng'
            });
        }

        if (!MAPBOX_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Maps service not configured'
            });
        }

        const coordinates = `${start_lng},${start_lat};${end_lng},${end_lat}`;
        const response = await axios.get(
            `${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${coordinates}`,
            {
                params: {
                    access_token: MAPBOX_API_KEY,
                    steps: true,
                    geometries: 'geojson'
                }
            }
        );

        if (response.data.routes.length === 0) {
            return res.json({
                success: false,
                message: 'No route found'
            });
        }

        const route = response.data.routes[0];

        res.json({
            success: true,
            data: {
                distance_km: (route.distance / 1000).toFixed(2),
                duration_minutes: Math.round(route.duration / 60),
                geometry: route.geometry
            }
        });
    } catch (err) {
        console.error('[Directions Error]:', err.message);
        res.status(500).json({
            success: false,
            message: 'Directions failed',
            error: err.message
        });
    }
}

module.exports = {
    geocodeAddress,
    getDirections
};
