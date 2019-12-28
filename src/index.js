const fs = require('fs');
const AV_KEY = process.env.AV_KEY;
const alpha = require('alphavantage')({AV_KEY});
const symbols = ['^BVSP', 'ALPA4', 'AMAR3', 'ARZZ3', 'BBAS3', 'BBDC3', 'BBDC4', 'BOVA11', 'CAML3', 'CMIG4', 'COGN3', 'CPFE3', 'CPLE6', 'CSMG3', 'CSNA3', 'CYRE3', 'DTEX3', 'EGIE3', 'ENBR3', 'ENEV3', 'ENGI11', 'EQTL3', 'FESA4', 'FLRY3', 'GGBR4', 'GOAU3', 'GOLL4', 'GRND3', 'GUAR3', 'ITSA4', 'ITUB3', 'ITUB4', 'JHSF3', 'LREN3', 'MDIA3', 'MRVE3', 'MULT3', 'ODPV3', 'OFSA3', 'PARD3', 'QUAL3', 'RADL3', 'RENT3', 'SANB11', 'SAPR4', 'SBSP3', 'SEER3', 'SMTO3', 'TEND3', 'TRIS3', 'TRPL4', 'USIM3', 'VIVT4', 'VULC3', 'WEGE3', 'YDUQ3'];

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
        while((timeNow - startTime) < 70000){
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
            const data = await alpha.data.daily_adjusted((symbol == '^BVSP')?symbol:(symbol + '.SA'), "full", "json");
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
    try{
        fs.unlinkSync(CSV_FILE);
    }
    catch(e){
        console.log('Alert: Arquivo ' + CSV_FILE + ' não existe');
        console.log('Criando...');
    }

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