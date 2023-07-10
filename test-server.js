const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 5000;

// Set EJS as the template engine
//app.set('view engine', 'ejs');

// Define a route that renders the HTML
app.get('/', async (req, res) => {
    // Fetch data from an API (replace this URL with the actual API endpoint)
    // const apiUrl = 'https://dummyjson.com/products';
    // const response = await fetch(apiUrl);
    // const data = await response.json();
    // console.log(data.products)

    // Render the EJS template with the data
    //res.render('index', { products: data.products });
    res.json({ hello: "World" });
});

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`);
});
