const fs = require('fs');
const AV_KEY = process.env.AV_KEY;
const alpha = require('alphavantage')({AV_KEY});
const symbols = ['^BVSP', 'ALPA4.SA', 'AMAR3.SA', 'ARZZ3.SA', 'BBAS3.SA', 'BBDC3.SA', 'BBDC4.SA', 'BOVA11.SA', 'CAML3.SA', 'CMIG4.SA', 'COGN3.SA', 'CPFE3.SA', 'CPLE6.SA', 'CSMG3.SA', 'CSNA3.SA', 'CYRE3.SA', 'DTEX3.SA', 'EGIE3.SA', 'ENBR3.SA', 'ENEV3.SA', 'ENGI11.SA', 'EQTL3.SA', 'EQTL3.SA', 'FESA4.SA', 'FLRY3.SA', 'GGBR4.SA', 'GOAU3.SA', 'GOLL4.SA', 'GRND3.SA', 'GUAR3.SA', 'ITSA4.SA', 'ITUB3.SA', 'ITUB4.SA', 'JHSF3.SA', 'LREN3.SA', 'MDIA3.SA', 'MRVE3.SA', 'MULT3.SA', 'ODPV3.SA', 'OFSA3.SA', 'PARD3.SA', 'QUAL3.SA', 'RADL3.SA', 'RENT3.SA', 'SANB11.SA', 'SAPR4.SA', 'SBSP3.SA', 'SEER3.SA', 'SMTO3.SA', 'TEND3.SA', 'TRIS3.SA', 'TRPL4.SA', 'USIM3.SA', 'VIVT4.SA', 'VULC3.SA', 'WEGE3.SA', 'YDUQ3.SA'];

const CSV_FILE = 'cota.csv';

var table = [];

pullData();

async function pullData(index = 0){

    const startTime = Date.now();

    symbolA = symbols[index];
    symbolB = symbols[index + 1];
    symbolC = symbols[index + 2];
    symbolD = symbols[index + 3];
    symbolE = symbols[index + 4];

    await setData(symbolA);
    await setData(symbolB);
    await setData(symbolC);
    await setData(symbolD);
    await setData(symbolE);

    if(index < symbols.length - 5){
        var timeNow = Date.now();
        while((timeNow - startTime) < 65000){
            timeNow = Date.now();
        }
        pullData(index + 5);
    }
    else{
        newTable = {};
        Object.keys(table).sort().forEach(key => {
            if(key > '2009-12-31'){ // Retira datas anteriores a 2010
                newTable[key] = table[key];
            }
        });
        writeCSV(newTable);
    }
}

async function setData(symbol){
    if(symbol){
        try {
            const data = await alpha.data.daily_adjusted(symbol, "full", "json");
            var hist = data['Time Series (Daily)'];
            for (var key in hist){
                if(!table[key]){
                    table[key] = [];
                }
                table[key][symbol] = hist[key]['5. adjusted close'].replace('.', ',');
            }
        }
        catch(e){
            console.log('ERRO AO BAIXAR INFORMAÇÕES SOBRE O ATIVO ' + symbol);
            console.log(e);
        }
    }
}

async function writeCSV(table){

    fs.unlinkSync(CSV_FILE);

    // Escreve o cabeçalho
    writeText('Data');
    symbols.forEach(symbol => {
        writeText(';' + symbol);
    });
    writeText('\n');


    // Escreve as datas e suas respectivas cotações
    for(date in table){
        writeText(date);
        symbols.forEach(symbol => {
            writeText(';' + (table[date][symbol] || 'FALSO'));
        });
        writeText('\n');
    }
}

function writeText(text){
    fs.appendFileSync(CSV_FILE, text);
}