const express = require('express');
const app = express();
const port = 3000;

app.get('/api/greeting', (req, res) => {
    res.json({ message: 'Hello from Server 1!' });
});

// Catch-all route for handling non-existent endpoints
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
    console.error(res.status(404))
});

app.listen(port, () => {
    console.log(`Server 1 listening at http://localhost:${port}`);
});
