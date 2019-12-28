const fs = require('fs');
const express = require('express');
const app = express();

const PORT = '9002';

// app.use(express.static('public'));
 
app.get('/cota.csv', function (req, res) {
    fs.readFile('cota.csv', (err, data) => {
        console.log(data.toString());
        res.type('text/plain; charset=utf-8');
        res.send(data.toString());
    });
});

app.listen(PORT);

module.exports = app;