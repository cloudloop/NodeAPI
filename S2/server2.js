const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;

app.get('/api/call-server1', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/api/greeting');
        console.log(response)
        res.json({ message: 'Received from Server 1:', data: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Error calling Server 1', error: error.response.data });
    }
});

app.listen(port, () => {
    console.log(`Server 2 listening at http://localhost:${port}`);
});
