const fs = require('fs');
const app = require('express')();
 
app.get('/cota.csv', function (req, res) {
    fs.readFile('cota.csv', (err, data) => {
        console.log(data.toString());
        res.type('text/plain; charset=utf-8');
        res.send(data.toString());
    });
})
 
app.listen(9001);