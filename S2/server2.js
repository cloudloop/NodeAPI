const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 4000;

// Set Express to pretty-print JSON
app.set('json spaces', 2);

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));


app.get('/api/call-server1', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/api/weather/place/Stockholm');
        // console.log(response.data.weatherData.properties.timeseries);
        // res.json({ message: 'Received from Server 1:', data: response.data });

        // Render the EJS template with the data
        res.render('weather_index', { times: response.data.weatherData.properties.timeseries, response: response.data  });

    } catch (error) {
        res.status(500).json({ message: 'Error calling Server 1', error: error.response.data });
    }
});

app.listen(port, () => {
    console.log(`Server 2 listening at http://localhost:${port}`);
});
