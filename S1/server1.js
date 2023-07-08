const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.get('/api/greeting', (req, res) => {
    res.json({ message: 'Hello from Server 1!' });
});

const fetchWeatherData = async (lat, lon) => {
    const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';
    try {
        const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, {
            headers: {
                'User-Agent': userAgent
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
};

app.get('/api/weather/latlon/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const weatherData = await fetchWeatherData(lat, lon);
        if (weatherData) {
            res.json({ latitude: lat, longitude: lon, weatherData });
        } else  {
            res.status(500).json({ message: 'Error fetching weather data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weather data', error: error.message });
    }
});

app.get('/api/weather/place/:place', async (req, res) => {
    try {
        const place = req.params.place;
        const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';

        const response = await axios.get(`https://nominatim.openstreetmap.org/search?city=${place}&format=json`, {
            headers: {
                'User-Agent': userAgent
            }
        });

        if (response.data && response.data.length > 0) {
            let lat = parseFloat(response.data[0].lat).toFixed(2);
            let lon = parseFloat(response.data[0].lon).toFixed(2);

            const weatherData = await fetchWeatherData(lat, lon);
            if (weatherData) {
                res.json({ latitude: lat, longitude: lon, weatherData });
            } else {
                res.status(500).json({ message: 'Error fetching weather data' });
            }
        } else {
            res.status(404).json({ message: 'No results found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching geocoding data', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server 1 listening at http://localhost:${port}`);
});
