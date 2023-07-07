const express = require('express');
const app = express();
const port = 5000;

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Define a route that renders the HTML
app.get('/', async (req, res) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // Fetch data from an API (replace this URL with the actual API endpoint)
    const apiUrl = 'https://dummyjson.com/products';
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data.products)

    // Render the EJS template with the data
    res.render('index', { products: data.products });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
