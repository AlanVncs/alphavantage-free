const fs = require('fs');
const alpha = require('alphavantage')({key: process.env.AV_KEY});
const symbols = ['^BVSP', 'ALPA4', 'AMAR3', 'ARZZ3', 'BBAS3', 'BBDC3', 'BBDC4', 'BOVA11', 'CAML3', 'CMIG4', 'COGN3', 'CPFE3', 'CPLE6', 'CSMG3', 'CSNA3', 'CYRE3', 'DTEX3', 'EGIE3', 'ENBR3', 'ENEV3', 'ENGI11', 'EQTL3', 'FESA4', 'FLRY3', 'GGBR4', 'GOAU3', 'GOLL4', 'GRND3', 'GUAR3', 'ITSA4', 'ITUB3', 'ITUB4', 'JHSF3', 'LREN3', 'MDIA3', 'MRVE3', 'MULT3', 'ODPV3', 'OFSA3', 'PARD3', 'QUAL3', 'RADL3', 'RENT3', 'SANB11', 'SAPR4', 'SBSP3', 'SEER3', 'SMTO3', 'TEND3', 'TRIS3', 'TRPL4', 'USIM3', 'VIVT4', 'VULC3', 'WEGE3', 'YDUQ3'];

var table = [];

async function pullData(index = 0, callback){

    const startTime = Date.now();

    symbolA = symbols[index];
    symbolB = symbols[index + 1];
    symbolC = symbols[index + 2];
    symbolD = symbols[index + 3];
    symbolE = symbols[index + 4];

    await setData(symbolA);
    callback((index + 1)/symbols.length);
    await setData(symbolB);
    callback((index + 2)/symbols.length);
    await setData(symbolC);
    callback((index + 3)/symbols.length);
    await setData(symbolD);
    callback((index + 4)/symbols.length);
    await setData(symbolE);
    callback((index + 5)/symbols.length);

    if(index < symbols.length - 5){
        var timeNow = Date.now();
        while((timeNow - startTime) < 70000){
            timeNow = Date.now();
        }
        pullData(index + 5, callback);
    }
    else{
        newTable = {};
        Object.keys(table).sort(dateCmp).forEach(key => { // Ordena as datas
            if(key > '2009-12-31'){ // Retira datas anteriores a 2010
                newTable[key] = table[key];
            }
        });
        writeCSV(newTable);
        callback(1);
    }
}

function dateCmp(date1, date2){
    return (date1<date2)?1:-1;
}

async function setData(symbol){
    if(symbol){
        try {
            const data = await alpha.data.daily_adjusted((symbol == '^BVSP')?symbol:(symbol + '.SA'), "full", "json");
            var hist = data['Time Series (Daily)'];
            for (var key in hist){
                if(!table[key]){
                    table[key] = [];
                }
                table[key][symbol] = [];
                table[key][symbol]['open']  = hist[key]['1. open'].replace('.', ',');
                table[key][symbol]['high']  = hist[key]['2. high'].replace('.', ',');
                table[key][symbol]['low']   = hist[key]['3. low'].replace('.', ',');
                table[key][symbol]['close'] = hist[key]['4. close'].replace('.', ',');
                table[key][symbol]['adj']   = hist[key]['5. adjusted close'].replace('.', ',');
                table[key][symbol]['vol']   = hist[key]['6. volume'].replace('.', ',');
                table[key][symbol]['div']   = hist[key]['7. dividend amount'].replace('.', ',');
                table[key][symbol]['split'] = hist[key]['8. split coefficient'].replace('.', ',');
            }
        }
        catch(e){
            console.log('ERRO AO BAIXAR INFORMAÇÕES SOBRE O ATIVO ' + symbol);
            console.log(e);
        }
    }
}

function writeCSV(table){
    
    deleteAll();

    // Escreve o cabeçalho
    writeAll('Data');
    symbols.forEach(symbol => {
        writeAll(';' + symbol);
    });
    writeAll('\n');


    // Escreve as datas e suas respectivas cotações
    for(date in table){
        writeAll(date);
        symbols.forEach(symbol => {
            writeAll(';');
            if(table[date][symbol]){
                writeAll(table[date][symbol], true);
            }
            else{
                writeAll('FALSO');
            }
        });
        writeAll('\n');
    }
}

function deleteAll(){
    try{
        fs.unlinkSync('tmpFiles/open.csv');
    }
    catch(e){}
    finally{
        try{
            fs.unlinkSync('tmpFiles/high.csv');
        }
        catch(e){}
        finally{
            try{
                fs.unlinkSync('tmpFiles/low.csv');
            }
            catch(e){}
            finally{
                try{
                    fs.unlinkSync('tmpFiles/close.csv');
                }
                catch(e){}
                finally{
                    try{
                        fs.unlinkSync('tmpFiles/adj.csv');
                    }
                    catch(e){}
                    finally{
                        try{
                            fs.unlinkSync('tmpFiles/vol.csv');
                        }
                        catch(e){}
                        finally{
                            try{
                                fs.unlinkSync('tmpFiles/div.csv');
                            }
                            catch(e){}
                            finally{
                                try{
                                    fs.unlinkSync('tmpFiles/split.csv');
                                }
                                catch(e){}
                            }
                        }
                    }
                }
            }
        }
    }
}

function writeAll(content, flag){
    fs.appendFileSync('tmpFiles/open.csv', flag?(content['open'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/high.csv', flag?(content['high'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/low.csv', flag?(content['low'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/close.csv', flag?(content['close'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/adj.csv', flag?(content['adj'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/vol.csv', flag?(content['vol'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/div.csv', flag?(content['div'] || 'FALSO'):content);
    fs.appendFileSync('tmpFiles/split.csv', flag?(content['split'] || 'FALSO'):content);
}

module.exports = pullData;