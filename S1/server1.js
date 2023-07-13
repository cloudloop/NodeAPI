const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set Express to pretty-print JSON
app.set('json spaces', 2);

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

const fetchPlaceCoordinates = async (place) => {
    const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?city=${place}&format=json`, {
        headers: {
            'User-Agent': userAgent
        }
    });
    if (response.data && response.data.length > 0) {
        let lat = parseFloat(response.data[0].lat).toFixed(2);
        let lon = parseFloat(response.data[0].lon).toFixed(2);
        return { lat, lon };
    } else {
        return null;
    }
};

const fetchPlaceName = async (lat,lon) => {
    const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=13&format=json`, {
        headers: {
            'User-Agent': userAgent
        }
    });
    if (response.data) {
        return place = response.data.address.village
    } else {
        return null;
    }
};

app.get('/api/weatherdata/latlon/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const weatherData = await fetchWeatherData(lat, lon);
    if (weatherData) {
        let place = await fetchPlaceName(lat, lon);
        res.json({placeName: place, latitude: lat, longitude: lon, weatherData});
    } else {
        res.status(500).json({ message: 'Error fetching weather data' });
    }
});

app.get('/api/weatherdata/place/:place', async (req, res) => {
    let place = req.params.place;
    if (place == "Schweitzerbadet") {
        place = "Dalarö"
    }
    const coordinates = await fetchPlaceCoordinates(place);
    if (coordinates) {
        const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
        if (weatherData) {
            res.json({ placeName: place, latitude: coordinates.lat, longitude: coordinates.lon, weatherData });
        } else {
            res.status(500).json({ message: 'Error fetching weather data' });
        }
    } else {
        res.status(404).json({ message: 'No results found' });
    }
});

app.get('/api/weather/latlon/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const weatherData = await fetchWeatherData(lat, lon);
    if (weatherData) {
        res.render('weather_index', { times: weatherData.properties.timeseries, response: weatherData });
    } else {
        res.status(500).json({ message: 'Error fetching weather data' });
    }
});

app.get('/api/weather/place/:place', async (req, res) => {
    const { place } = req.params;
    const coordinates = await fetchPlaceCoordinates(place);
    if (coordinates) {
        const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lon);
        if (weatherData) {
            res.render('weather_index', { times: weatherData.properties.timeseries, response: weatherData , place: place });
        } else {
            res.status(500).json({ message: 'Error fetching weather data' });
        }
    } else {
        res.status(404).json({ message: 'No results found' });
    }
});

app.listen(port, () => {
    console.log(`Server 1 listening at http://localhost:${port}`);
});
