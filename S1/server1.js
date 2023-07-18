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
// Increase number of event listeners
import EventEmitter from 'events';
EventEmitter.defaultMaxListeners = 20;



// Firebase initialization
// Firebase compat packages are API compatible with namespaced code
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp} from 'firebase/firestore';
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
  databaseURL: "https://kiteweather-d40b6-default-rtdb.europe-west1.firebasedatabase.app/",
  fireStoreCollection: "weather"
};

// Initialize Firebase
const FBapp = initializeApp(firebaseConfig);
//const analytics.isSupported() = getAnalytics(FBapp);
const db = getFirestore(FBapp);



async function writeData(PlaceName, data) {
    console.log('writeData function called');

    // Convert date string to Firestore Timestamp
    let date = new Date(data.properties.meta.updated_at);
    let timestamp = Timestamp.fromDate(date);

    const postData = {
        place: PlaceName,
        latestUpdate: timestamp,
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
    await addDoc(collection(db, firebaseConfig.fireStoreCollection), postData);
    console.log("Created new document in the database ...");
    console.log(postData);
    } catch (error) {
    console.log(`Error writing to database: `, error);
    }
}




app.get('/api/greeting', (req, res) => {
    res.json({ message: 'Hello from Server 1!' });
});

const fetchPlaceName = async (lat,lon) => {
    const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=12&format=json`, {
        headers: {
            'User-Agent': userAgent
        }
    });
    let place = "";
    if (response.data) {
        return place = response.data.address[Object.keys(response.data.address)[0]];
    } else {
        return null;
    }
};

const checkExistingData = async (place) => {
    console.log(`checkData function called for place ${place}`);
    const w2Ref = collection(db,firebaseConfig.fireStoreCollection)

    // Get documents where 'place' is 'PlaceName' and order by 'latestUpdate' in descending order
    const q = await query(w2Ref, where("place","==",place),orderBy("latestUpdate", "desc"),limit(1))
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Get the first (and only) document
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        console.log(`${data.place} data is begin analyzed`)

        // Get the current time
        const currentTime = new Date(Date.now());

        // Calculate the time difference in hours
        const timeDiff = Math.abs(currentTime - data.latestUpdate.toDate()) / 3600000;

        if (timeDiff > 1) {
            console.log('Data is more than 1 hour old');
            return false;
        } else {
            console.log('Data is less than 1 hour old');
            return data;
        }
    } else {
        console.log('No data found for this place');
        return false;
    }
};

const fetchWeatherData = async (place, lat, lon) => {
    console.log(`Checking weather data for ${place}`);
    let data = await checkExistingData(place);

    if (data === false) {
        const userAgent = 'nodeAPI-project https://github.com/cloudloop/NodeAPI';
        try {
            const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, {
                headers: {
                    'User-Agent': userAgent
                }
            });
            await writeData(place, response.data);
            let Weatherdata = response.data;
            data = {Weatherdata};
            console.log("Data has be retreived by API call");
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
        }
    } else {
        console.log("Loading existing data from DB...");
    }

    console.log("Returning weather data...");
    return data;
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

app.get('/api/weatherdata/latlon/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    let place = fetchPlaceName(lat, lon);
    const weatherData = await fetchWeatherData(place,lat, lon);
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
        const weatherData = await fetchWeatherData(place, coordinates.lat, coordinates.lon);
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
    let place = fetchPlaceName(lat, lon);
    const data = await fetchWeatherData(place, lat, lon);
    if (data) {
        res.render('weather_index', { times: data.weatherData.properties.timeseries, place: place });
    } else {
        res.status(500).json({ message: 'Error fetching weather data' });
    }
});

app.get('/api/weather/place/:place', async (req, res) => {
    const { place } = req.params;
    const coordinates = await fetchPlaceCoordinates(place);
    if (coordinates) {
        const data = await fetchWeatherData(place, coordinates.lat, coordinates.lon);
        if (data) {
            res.render('weather_index', { times: data.Weatherdata.properties.timeseries, place: place });
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
