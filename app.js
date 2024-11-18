require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "choose.html"));
});

app.get('/gma', (req, res) => {
    res.sendFile(path.join(__dirname, "gma", "gma.html"));
});

app.get('/mom', (req, res) => {
    res.sendFile(path.join(__dirname, "mom", "mom.html"));
});

app.listen(port, () => {
    console.log(`Server listening on Port: ${port}, go to http://localhost:3000`);
});
