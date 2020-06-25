/*
VERSION 1.0

This is the first mostly-working version with all the main features. 
*/

const prompt = require('prompt-sync')({sigint: true});

const hat = '/\\';
const hole = '()';
const fieldCharacter = '░░';
const pathCharacter = '--'
const playerCharacter = ':D';

class Field {
  constructor() {
    //this.field = fieldArray;
    this.uselessProperty = 0;
  }

  print() {
    let fieldString = '';
    // Outer loop adds a row
    for (let i = 0; i < this.field.length; i++) {
      let rowString = '';
      // Inner loop adds each character to the row
      for (let j = 0; j < this.field[i].length; j++) {
        rowString = rowString + this.field[i][j];
      };
      fieldString = fieldString + rowString + '\n';
    };
    console.log(fieldString);
  }

  static generateField(height, width, percentHoles) {
    let numOfHoles = Math.floor((percentHoles/100) * height * width);
    //let numOfHoles = 100;
    let generatedField = [];
    // Generates the field
    // Outer loop generates a row
    for (let i = 0; i < height; i++) {
      generatedField.push([]);
      // Inner loop generates each tile
      for (let j = 0; j < width; j++) {
        generatedField[i].push(fieldCharacter);
      }
    }

    // Digs the holes in the field
    let randIndexHeight = 0;
    let randIndexWidth = 0;
    let holesMade = 0;
    let attemptsLimit = 500;
    let attempts = 0;
    while (holesMade < numOfHoles && attempts < attemptsLimit) {
      randIndexHeight = Math.floor(Math.random() * height);
      randIndexWidth = Math.floor(Math.random() * width);
      if (generatedField[randIndexHeight][randIndexWidth] != hole) {
        generatedField[randIndexHeight][randIndexWidth] = hole;
        holesMade++;
      }
      attempts++;
      if (attempts >= attemptsLimit) {
        console.log(`Hole generator stopped after ${attemptsLimit} attempts.`);
      }
    };

    // Hides the hat in the field
    let hatPlaced = false;
    attempts = 0;
    while (!hatPlaced && attempts < attemptsLimit) {
      randIndexHeight = Math.floor(Math.random() * height);
      randIndexWidth = Math.floor(Math.random() * width);
      if (generatedField[randIndexHeight][randIndexWidth] === fieldCharacter) {
        generatedField[randIndexHeight][randIndexWidth] = hat;
        hatLocation = [[randIndexHeight], [randIndexWidth]];
        hatPlaced = true;
      }
      attempts++;
      if (attempts >= attemptsLimit) {
        console.log(`Hat placer stopped after ${attemptsLimit} attempts.`);
      }
    };

    // Determines player's starting location
    let playerPlaced = false;
    attempts = 0;
    while (!playerPlaced && attempts < attemptsLimit) {
      randIndexHeight = Math.floor(Math.random() * height);
      randIndexWidth = Math.floor(Math.random() * width);
      if (generatedField[randIndexHeight][randIndexWidth] === fieldCharacter) {
        generatedField[randIndexHeight][randIndexWidth] = playerCharacter;
        playerLocation = [randIndexHeight, randIndexWidth];
        playerPlaced = true;
      }
      attempts++;
      if (attempts >= attemptsLimit) {
        console.log(`Player placer stopped after ${attemptsLimit} attempts.`);
      }
    };
    return generatedField;
  }
}

const gameField = new Field();

// Initializing variables
// Set to 'manual' or 'generate' based on testing or playing
const fieldType = 'generate';
const testField = [
  ['░', '░', '░'],
  ['░', '*', '░'],
  ['░', '^', '░']
];
const manualField = [
  ['*', 'O', '░', 'O', '░'], 
  ['░', 'O', '░', 'O', '░'], 
  ['░', 'O', '░', 'O', '░'], 
  ['░', 'O', '░', '░', '░'], 
  ['░', '░', '░', 'O', '^']
];
let solutionField = [];

// Change these to modify field parameters
let fieldHeight = 10; 
let fieldWidth = 10;
let percentageHoles = 30;

// Do not change these!
let playerLocation = [0, 0];
let hatLocation = [0, 0];
let playGame = false;
let foundHat = false;
let pathFound = false;

function printField (field) {
  let fieldString = '';
  // Outer loop adds a row
  for (let i = 0; i < field.length; i++) {
    let rowString = '';
    // Inner loop adds each character to the row
    for (let j = 0; j < field[i].length; j++) {
      rowString = rowString + field[i][j];
    };
    fieldString = fieldString + rowString + '\n';
  };
  console.log(fieldString);
};

function findPath(field) {
  // Figure out how to document the path; just update another array with coordinates, either adding or subtracting as the algorithm finds out what paths are open? (Basically, it places markers down in the form of coordinates in yet another array, "pathCoords", and picks up those markers when it back-tracks by removing the coordinates from the array.)
  let startCoords = [];
  let endCoords = [];

  // STEP 1: Find starting (player spawn) and ending (hat) coordinates
  // Outer loop iterates through rows
  for (let i = 0; i < field.length; i++) {
    // Inner loop iterates through individual tiles/elements to find player and hat coordinates
    for (let j = 0; j < field[0].length; j++) {
      if (field[i][j] === playerCharacter) {
        startCoords = [i, j];
      } else if (field[i][j] === hat) {
        endCoords = [i, j];
      }
    }
  }
  //console.log(`findPath() startCoords: ${startCoords[0]},${startCoords[1]}`);
  //console.log(`findPath()   endCoords: ${endCoords[0]},${endCoords[1]}`);

  let currentTile = startCoords;
  let pathMap = [];
  let visitedTiles = [];
  let timeOut = 0;
  let timeOutLimit = 1000;

  while (timeOut < timeOutLimit) {
    // STEP 2: Add the current tile to the pathMap and visitedTiles arrays. Then if the current tile has any valid moves, do one
    //console.log('');
    timeOut++;
    //console.log(`    timeOut: ${timeOut}`);
    //console.log(`currentTile: ${currentTile}`);
    let validMoveFound = true;
    if (!pathMap.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      pathMap.push(currentTile);
    } 
    if (!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      visitedTiles.push(currentTile);
      //console.log(`currentTile => visitedTiles[] with value: ${currentTile}`);
    }
    for (let i = 0; i < visitedTiles.length; i++) {
      //console.log(`visitedTiles[${i}]: ${visitedTiles[i]}`);
    }

    // STEP 3: If there is at least 1 valid tile and it is not already in the pathMap array, move to one
    // Priority is arbitrary; in this case, for simplicity, priority is up, right, down, left
    let moveUp = [currentTile[0] - 1, currentTile[1]];
    let moveRt = [currentTile[0], currentTile[1] + 1];
    let moveDn = [currentTile[0] + 1, currentTile[1]];
    let moveLf = [currentTile[0], currentTile[1] - 1];

    if (checkMove(moveUp) === 'hat') {
      currentTile = moveUp;
    } else if (checkMove(moveRt) === 'hat') {
      currentTile = moveRt;
    } else if (checkMove(moveDn) === 'hat') {
      currentTile = moveDn;
    } else if (checkMove(moveLf) === 'hat') {
      currentTile = moveLf;
    } else if (checkMove(moveUp) === 'field' && (!visitedTiles.some(el => el[0] === moveUp[0] && el[1] === moveUp[1]))) {
      currentTile = moveUp;
      //console.log(`moveUp: ${moveUp}`);
      //console.log(`currentTile: ${currentTile}`);
    } else if (checkMove(moveRt) === 'field' && (!visitedTiles.some(el => el[0] === moveRt[0] && el[1] === moveRt[1]))) {
      currentTile = moveRt;
      //console.log(`moveRt: ${moveRt}`);
      //console.log(`currentTile: ${currentTile}`);
    } else if (checkMove(moveDn) === 'field' && (!visitedTiles.some(el => el[0] === moveDn[0] && el[1] === moveDn[1]))) {
      currentTile = moveDn;
      //console.log(`moveDn: ${moveDn}`);
      //console.log(`currentTile: ${currentTile}`);
    } else if (checkMove(moveLf) === 'field' && (!visitedTiles.some(el => el[0] === moveLf[0] && el[1] === moveLf[1]))) {
      currentTile = moveLf;
      //console.log(`moveLf: ${moveLf}`);
      //console.log(`currentTile: ${currentTile}`);
    } else {
      validMoveFound = false;
      //console.log(`move--: no move`);
    }
    
    // STEP 4: If no valid moves are available from the new tile, try to navigate back to the previous tile in the path; else, repeat steps 1 and 2
    if (!validMoveFound && pathMap.length >= 2) {
      currentTile = pathMap[pathMap.length - 2];
      //console.log(`currentTile: ${currentTile}`);
      pathMap.pop(); 
    }

    // STEP 5: If the current tile has no valid moves and the tilesWithValidMoves array is empty, announce there is no path
    if (!validMoveFound && pathMap.length === 1) {
      console.log(`No path found! (took ${timeOut}/${timeOutLimit} moves)`);
      pathFound = false;
      return false;
    }

    // STEP 6: If it has moved to the end/exit tile (or the hat), announce that a way has been found, optionally drawing a path that was found (not necessarily the shortest)
    //console.log(`  endCoords: ${endCoords}`);
    //console.log(`currentTile[0] === endCoords[0] && currentTile[1] === endCoords[1] evaluates to: ${currentTile[0] === endCoords[0] && currentTile[1] === endCoords[1]}`);

    if (currentTile[0] === endCoords[0] && currentTile[1] === endCoords[1]) {
      // STEP 6.1: In case the player wants to see a solution, change the field characters in the pathMap array to show the path found on a separate solutionField nested array
      
      //solutionField = gameField.field;

      // *****Initialize solutionField to an empty field exactly the size of the game field in order to be able to copy the field over to it
      // Outer loop iterates through rows
      for (let i = 0; i < gameField.field.length; i++) {
        solutionField.push([]);
        // Inner loop iterates through individual tiles/elements to find coordinates that are in the pathMap array
        for (let j = 0; j < gameField.field[0].length; j++) {
          solutionField[i].push(fieldCharacter);
        }
      }

      // Copy gameField to solutionField one tile at a time to prevent the variables from linking erroneously
      // Outer loop iterates through rows
      for (let i = 0; i < solutionField.length; i++) {
        // Inner loop iterates through individual tiles/elements to find coordinates that are in the pathMap array
        for (let j = 0; j < solutionField[0].length; j++) {
            solutionField[i][j] = gameField.field[i][j];
        }
      }

      // Outer loop iterates through rows
      for (let i = 0; i < solutionField.length; i++) {
        // Inner loop iterates through individual tiles/elements to find coordinates that are in the pathMap array
        for (let j = 0; j < solutionField[0].length; j++) {
          if (pathMap.some(el => (i === el[0] && j === el[1]) && !(i === startCoords[0] && j === startCoords[1]))) {
            solutionField[i][j] = pathCharacter;
          } 
        }
      }
      console.log(`Path found! (took ${timeOut}/${timeOutLimit} moves)`);
      pathFound = true;
      return true;
    }
  }

  if (timeOut >= timeOutLimit) {
    console.log('No path found: timeOut exceeded');
    console.log(`Total moves made: ${timeOut}/${timeOutLimit}`);
    return false;
  }
};

function promptNewGame() {
  solutionField = [];
  pathFound = false;

  let newGameResponse = '';
  let fieldGenerationAttempts = 0;
  let fieldGenerationAttemptsLimit = 3;
  while (newGameResponse !== 'y' && newGameResponse !== 'n') {
    newGameResponse = prompt('New game? (y/n) ');
    if (newGameResponse === 'y') {
      // Nice formatting
      console.log('------------------------------');
      console.log(' New game! Find the lost hat! ');
      console.log('------------------------------');

      playGame = true;
      foundHat = false;
      //playerLocation = [2, 2];
      if (fieldType === 'test') {
        gameField.field = testField;
      } else if (fieldType === 'manual') {
        gameField.field = manualField;
      } else if (fieldType === 'generate') {
        do {
          gameField.field = Field.generateField(fieldHeight, fieldWidth, percentageHoles);
          fieldGenerationAttempts++;
        } while (!findPath(gameField.field) && fieldGenerationAttempts < fieldGenerationAttemptsLimit);
        console.log(`fieldGenerationAttempts: ${fieldGenerationAttempts}`);
      };
      
      if (fieldGenerationAttempts === fieldGenerationAttemptsLimit) {
        console.log(`ERROR: Could not generate a field with a valid path within the limit of ${fieldGenerationAttemptsLimit} attempts. Please reduce the percentage of holes and restart the program.`)
      };

      //if (findPath(gameField.field)) {
      //  console.log(`Player Location: ${playerLocation}`);
      //  console.log(`   Hat Location: ${hatLocation}`);
      //};

    } else if (newGameResponse === 'n') {
      playGame = false;
      console.log('Okay, the lost hat wasn\'t that nice anyway...');
    };
  };
};

function checkMove(coordinates) {
  let y = coordinates[0];
  let x = coordinates[1];

  // If attempted move location is out of bounds, returns 'boundary'
  if (y < 0 || x < 0 || y >= gameField.field.length || x >= gameField.field[0].length) {
    return 'boundary';
  } 
  // If attempted move location is a field tile, returns 'field'
  else if (gameField.field[y][x] === fieldCharacter || gameField.field[y][x] === pathCharacter) {
    return 'field';
  }
  // If attempted move location is the hat, returns 'hat'
  else if (gameField.field[y][x] === hat) {
    return 'hat';
  }
  // If attempted move location is a hole, returns 'hole'
  else if (gameField.field[y][x] === hole) {
    return 'hole'
  }
  // If attempted move location is somehow none of the above, returns 'error'
  else {
    return 'error';
  }
};

function movePlayer(currentLocation, newLocation) {
  let currentY = currentLocation[0];
  let currentX = currentLocation[1];
  let newY = newLocation[0];
  let newX = newLocation[1];

  gameField.field[currentY][currentX] = fieldCharacter;
  gameField.field[newY][newX] = playerCharacter;

  playerLocation = newLocation;
};

function endGame(endReason) {
  switch (endReason) {
    case 'hat':
      foundHat = true;
      console.log('You found the hat! You win!');
      break;
    case 'hole':
      console.log('Game over! You fell into a hole!');
      break;
    case 'boundary':
      console.log('Game over! You went outside the boundaries!');
      break;
    default: 
      console.log('Error in endGame(): unhandled input');
  }
  promptNewGame();
};

promptNewGame();

// MAIN GAME LOOP
while (playGame) {
  gameField.print();

  let userInput = prompt('View a solution (type "solution") or move (W/A/S/D) ');
  let attemptMoveTo = [playerLocation[0], playerLocation[1]];
  let keepPlaying = '';

  switch (userInput) {
    case 'w':
      attemptMoveTo = [playerLocation[0] - 1, playerLocation[1]]; 
      break;
    case 'a':
      attemptMoveTo = [playerLocation[0], playerLocation[1] - 1]; 
      break;
    case 's':
      attemptMoveTo = [playerLocation[0] + 1, playerLocation[1]]; 
      break;
    case 'd':
      attemptMoveTo = [playerLocation[0], playerLocation[1] + 1]; 
      break;
    case 'solution':
      console.log('--------------------');
      printField(solutionField);
      console.log('Here\'s a path to the hat!');
      while (keepPlaying !== 'y' && keepPlaying !== 'n') {
        keepPlaying = prompt('Keep trying? (y/n) ');
        if (keepPlaying === 'n') {
          promptNewGame();
        } else if (keepPlaying === 'y') {
          console.log('Okay, find the hat!');
        } else {
          console.log('Please respond with "y" to keep trying or "n" to start a new game.');
        }
      }
      break;

    default: 
      console.log('Invalid input. Please use W/A/S/D to move or "solution" to view a solution.');
  }

  if (keepPlaying === '') {
    //console.log(`attemptMoveTo: ${attemptMoveTo}`);
    if (checkMove(attemptMoveTo) === 'field') {
      movePlayer(playerLocation, attemptMoveTo);
    } else if (checkMove(attemptMoveTo) === 'error') {
      console.log(`Error: unhandled movement check at coordinates: Y=${attemptMoveTo[0]}, X=${attemptMoveTo[1]}`);
    } else {
      endGame(checkMove(attemptMoveTo));
    }
  }
}






