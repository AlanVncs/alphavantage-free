const fs = require('fs');
const updater = require('./updater');
const express = require('express');
const app = express();

const PORT = '80';

app.use(express.static('public'));
app.use(express.static('files'));

var updating = false;
var taxa = 0;

app.get('/update', function(req, res){
    if(!updating){
        updating = true;
        taxa = 0;
        updater(0, function(status){
            taxa = status;
            if(taxa >= 1){
                backupCopy('open.csv');
                backupCopy('high.csv');
                backupCopy('low.csv');
                backupCopy('close.csv');
                backupCopy('adj.csv');
                backupCopy('vol.csv');
                backupCopy('div.csv');
                backupCopy('split.csv');
                updating = false;
                fs.writeFileSync("lastUpdate", getDate());
            }
        });
    }
    res.redirect('/status');
});

app.get('/status', function(req, res){
    try{
        var lastUpdate = fs.readFileSync("lastUpdate");
    }
    catch(e){
        var lastUpdate = "Nunca"
    }
    res.json({
        updating: updating,
        taxa: taxa,
        lastUpdate: lastUpdate.toString()
    });
});

app.listen(PORT);

async function backupCopy(fileName){
    try{
        fs.copyFileSync('files/backup/' + fileName + '.bkp1', 'files/backup/' + fileName + '.bkp2');
    }
    catch(e){}
    finally{
        try{
            fs.copyFileSync('files/' + fileName, 'files/backup/' + fileName + '.bkp1');
        }
        catch(e){}
        finally{
            try{
                fs.copyFileSync('tmpFiles/' + fileName, 'files/' + fileName);
            }
            catch(e){
                console.log("Erro ao copiar arquivo " + fileName);
                console.log(e);
            }
        }
    }
}

function getDate(){
    var date = new Date();
    date.setHours(date.getHours()-3); // Brazil
    return date.toUTCString();
}