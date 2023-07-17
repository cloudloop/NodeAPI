import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure server and its settings:
const app = express();
const port = 3000;
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));
// Set EJS as the template engine
app.set('view engine', 'ejs');
// Set Express to pretty-print JSON
app.set('json spaces', 2);
//Supress the https warning
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


// Firebase initialization
// Firebase compat packages are API compatible with namespaced code
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore, collection, addDoc, setDoc} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { write } from 'fs';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZWPVc1B4TiZ22fpvpZuCQS00lXfUYtoU",
  authDomain: "kiteweather-d40b6.firebaseapp.com",
  databaseURL: "https://kiteweather-d40b6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kiteweather-d40b6",
  storageBucket: "kiteweather-d40b6.appspot.com",
  messagingSenderId: "320809676319",
  appId: "1:320809676319:web:2926b3d4adba188c876f2a",
  measurementId: "G-CGBLL2J1LF",
  databaseURL: "https://kiteweather-d40b6-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const FBapp = initializeApp(firebaseConfig);
//const analytics.isSupported() = getAnalytics(FBapp);
const db = getFirestore(FBapp);
async function writeData(PlaceName, data) {
    console.log('writeData function called');

    const postData = {
        place: PlaceName,
        latestUpdate: data.properties.meta.updated_at,
        Weatherdata : data
    };
    // try {
    //   console.log(`Trying to overwrite existing document...`);
    //   await setDoc(doc(db, 'weather', 'someId'), postData);
    //   console.log("Overwrote existing document in the database ...");
    //   console.log(postData);
    // } catch (error) {
    //   console.log(`Overwriting failed. Creating new document...`);
    try {
    await addDoc(collection(db, 'w2'), postData);
    console.log("Created new document in the database ...");
    console.log(postData);
    } catch (error) {
    console.log(`Error writing to database: `, error);
    }
}




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
            writeData(place, weatherData);
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
