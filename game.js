/**
 * Desc.: Function used to check the operating system enviroment the program is ran on.  
 * param: none,
 * return: none, throws an exception for any other environment that is not win32.
*/
function checkOperatingSystem(){
    if(process.platform!=="win32"){
        throw new Error('Program can only be ran in a Microsoft Windows enviroment.');
    }
}


/**
 * Desc.: Function used to validate the file names that will be used for reading
 * and writing purposes. Returns a boolean true if a filename is valid.  
 * param: fileName: string,
 * return: boolean, i.e: true
*/
function checkFileName(fileName){
    let filePathPattern = /([C-Zc-z])+:\\([A-Za-z0-9]+(\\[A-Za-z0-9]+)+)8\.txt\t/i;
    let fileNamePattern = /[A-Za-z0-9]+\.txt/i;	
    
    if(filePathPattern.test(fileName) || fileNamePattern.test(fileName)){
        return true;
    }
    return false;
}


/**
 * Desc.: Function used to validate the arguments used to run the application.  
 * param: none,
 * return: object, i.e: {input: 'inputfile.txt', output: 'outputfile.txt'}
*/
function checkCorrectArgs(){

    var options = process.argv.slice(2);
    if(
        options.length == 4 &&
        options[0].toLowerCase() === "--in"  &&
        options[2].toLowerCase() === "--out" &&
        checkFileName(options[1]) && checkFileName(options[3])
    ){
        return {input: options[1], output: options[3]};
    }

    else if(
        options.length == 4 &&
        options[0].toLowerCase() === "--output"  &&
        options[2].toLowerCase() === "--input" &&
        checkFileName(options[3]) && checkFileName(options[1])
    ){
        return {input: options[3], output: options[1]}
    }

    throw new Error('Invalid arguments provided.');

}


/**
 * Desc.: Function used to iterate an array of face values/suit score and return
 * the total face value score and total suit score.  
 * param: playerCards: array<string>,
 * return: object, i.e: {43, 7}
*/
function calculateTotal(playerCards){
    var score = 0;
    var suitScore = 0;
    const suit = {"H":3,"S":4,"C":1,"D":2};
    const cards = {"J":11,"Q":12,"K":13,"A":11};

   for(let i=0;i<playerCards.length;i++){
        const suffix = playerCards[i].slice(playerCards[i].length -1);
        const prefix = playerCards[i].slice(0,playerCards[i].length -1);
        
        if(!/[0-9JQKA]/i.test(prefix)){
            throw new Error("Incorrect face value detected.");
        }
        if(!/[CDSH]/i.test(suffix)){
            throw new Error("Incorrect suit value detected.");
        }
        if(/^\d+$/.test(prefix)){
            score += (+prefix);
        }
        if(/[JQKA]/i.test(prefix)){
            score += cards[prefix];
        }
        suitScore += suit[suffix];
    }
    return {score, suitScore};
}


/**
 * Desc.: Function used to iterate the array and return name of the winner(s) and
 * their winning score.  
 * param: dataArray: string,
 * return: string, i.e: Player1: 43
*/
function getWinningPlayers(dataArray){
    
    const playerRecord = dataArray[0].split(":");
    const playerCards = playerRecord[1].split(",");
    const {score, suitScore} = calculateTotal(playerCards);

    let winner = {score: score, suitScore: suitScore};
    let winners = playerRecord[0]+":";
    let winningScore = score;

    for(let i=1;i<dataArray.length;i++){
        const playerRecord2 = dataArray[i].split(":");
        const playerCards2 = playerRecord2[1].split(",");
        const {score, suitScore} = calculateTotal(playerCards2);
        
        if(winner.score<score){
            winner = { score:score, suitScore:suitScore};
            winners = playerRecord2[0]+":";
            winningScore = score;
        }

        else if(winner.score==score && winner.suitScore<suitScore){
            winner = {score:score, suitScore:suitScore};
            winners = playerRecord2[0]+":";
            winningScore = suitScore;
        }

        else if(winner.score==score && winner.suitScore==suitScore){
            winner = { score:score, suitScore:suitScore};
            winners = winners.replace(":","");
            winners +=","+playerRecord2[0];
            winners+=":"; 
            winningScore = score;
        }
    }
    
    return winners + winningScore;
}


/**
 * Desc.: Function used to read data from a file and return an array of player data.  
 * param: fileName: string,
 * return: array<string>, i.e ['Player1:10C,3C,8C,JC,AH',...]
*/
function getPlayerRecords(fileName){
    const fs = require('fs');
    
    const data = fs.readFileSync(fileName, 'utf8');

    const playerRecords = data.trim().split("\n");

    if(playerRecords.length!==5){
        throw new Error("Number of players supplied is not correct.");
    }        
    return playerRecords;    
}


/**
 * Desc.: Function used to record winning players to a file.
 * param: filname:string, content:string,
 * return: none
*/
function recordWinner(fileName, content){
    const fs = require('fs');
    fs.writeFileSync(fileName, content);
}


/**
 * Desc.: Function serves as the entry point to the application
 * param: none,
 * return: none
*/
function main(){
    try{
        checkOperatingSystem();
        var {input, output} = checkCorrectArgs();
        var playerRecords = getPlayerRecords(input);
        var winningPlayers = getWinningPlayers(playerRecords);
        recordWinner(output,winningPlayers);
    }    
    catch(errorMessage){
        console.log("Exception:"+errorMessage.message);
    }
    return;
}

if(process.argv[1]===process.cwd()+"\\winner.js"){
    main();
}

module.exports = {
    checkCorrectArgs,
    checkFileName,
    getWinningPlayers,
    getPlayerRecords,
    calculateTotal,
    main
}