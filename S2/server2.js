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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';


app.get('/api/call-server1', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/api/weatherdata/place/Stockholm');
        console.log(response);
        res.render('weather', { times: response.data.weatherData.properties.timeseries, response: response.data.weatherData });
    } catch (error) {
        console.error(error);
        if (error.response) {
            res.status(500).json({ message: 'Error calling Server 1', error: error.response.data });
        } else {
            // The error is not due to an HTTP response, so just return the entire error object
            res.status(500).json({ message: 'Error calling Server 1', error: error.message });
        }
    }
});

app.listen(port, () => {
    console.log(`Server 2 listening at http://localhost:${port}`);
});
