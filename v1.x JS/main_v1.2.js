/*
VERSION 1.2

- Implemented new solution path finder that is much better at finding the shortest path in open fields. It simply prioritizes moves that bring it closer to the hat, so in more complicated fields, it can still be pushed to take a roundabout path.
- Fixed lots of little bugs that popped up in implementation of the new path finder. 

*/

// SETTINGS: TILE CHARACTERS
// The printed characters that make up the field. Change according to how you'd like to customize your game! (To make the field look like it's made up of more square tiles instead of tall rectangles, each 'character' should actually be two characters, as seen in the defaults.)
const hat = '/\\';
const hole = '()';
const fieldCharacter = '░░';
const pathCharacter = '--'
const playerCharacter = ':D';
const hiddenTileCharacter = '? ';

// SETTINGS: FIELD PARAMETERS --- Change these to modify field parameters
const fieldHeight = 10; 
const fieldWidth = 10;
const percentageHoles = 30;
const visionDistance = 3;
// Set for preset fields or a randomly generated one
const fieldType = 'generate'; // Set to 'test', 'manual', 'rawTest' or 'generate'
const explorationType = 'unhidden'; // Set to 'unhidden,' 'permanentReveal' or 'temporaryReveal' for different exploration difficulties

// Field options for testing purposes and manual map-building, to be used with the 'test' and 'manual' options in the fieldType above.
const testField = [
  [':D', '░░', '░░'],
  ['░░', '░░', '░░'],
  ['░░', '░░', '/\\']
];
const manualFieldOld1 = [
['░░', '()', '()', '░░', '░░', '()', '()', '░░', '()', '░░'], 
['()', '()', '░░', '()', '░░', '░░', '░░', '░░', '()', '░░'], 
['░░', '()', '()', '░░', '░░', '░░', '░░', '░░', '░░', '░░'], 
['░░', '░░', '░░', '░░', '░░', '()', '░░', '()', '()', '░░'], 
['░░', '░░', '()', '░░', '░░', '░░', '()', '░░', '()', '()'], 
['░░', '░░', '░░', '░░', '()', '░░', '░░', '░░', '░░', '░░'], 
['░░', '░░', '()', '░░', '░░', '()', '░░', '░░', '()', '░░'], 
['░░', '░░', '░░', '()', '░░', '/\\', '░░', '░░', '░░', '░░'], 
[':D', '░░', '()', '░░', '░░', '░░', '()', '░░', '░░', '░░'], 
['()', '░░', '░░', '()', '()', '()', '()', '░░', '░░', '░░']
]
const manualField = [
['░░','░░','░░','░░','░░','()','░░','()','░░','░░'],
['░░','░░','░░','/\\','░░','░░','()','░░','░░','░░'],
['()','░░','()','()','()','()','░░','()','░░','()'],
['░░','░░','░░','()','()','░░','()','()','░░','░░'],
['░░','░░','░░',':D','░░','░░','░░','()','()','░░'],
['()','()','()','░░','()','░░','░░','()','░░','░░'],
['░░','░░','░░','░░','()','()','()','░░','░░','░░'],
['()','░░','░░','░░','░░','()','░░','░░','()','░░'],
['░░','░░','░░','░░','░░','░░','░░','()','░░','()'],
['░░','()','░░','░░','░░','░░','░░','░░','░░','░░']
];

const copyBlankField = [
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░'],
  ['░░','░░','░░','░░','░░','░░','░░','░░','░░','░░']
  ];

// NOT USED
function convertRawField(field) {
  let updatedField = [];
  for (let i = 0; i < field.length; i++) {
    updatedField.push([]);
    for (let j = 0; j < field[i].length; j+=2) {
      if (field[i][j] === fieldCharacter[0]) {
        //
      } else if (field[i][j] === playerCharacter[0]) {
        //
      } else if (field[i][j] === hat[0]) {
        //
      } else if (field[i][j] === hole[0]) {
        //
      } 
    }
  }

  return updatedField
}; 

// Initializing variables (DO NOT change these!)
const prompt = require('prompt-sync')({sigint: true});

let gameField = [];
let solutionField = [];
let displayField = [];
let playerLocation = [0, 0];
let hatLocation = [0, 0];
let playGame = false;
let foundHat = false;
let pathFound = false;

function getDistance(point1, point2) {
  let distanceY = Math.abs(point1[0] - point2[0]);
  let distanceX = Math.abs(point1[1] - point2[1]);
  let distance = Math.sqrt(distanceY**2 + distanceX**2);
  return distance;
};

function generateField(height, width, percentHoles) {
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
};

// FIND PATH
function findPath(field) {
  let startCoords = [];
  let endCoords = [];

  // STEP 1: Find starting (player spawn) and ending (hat) coordinates
  for (let i = 0; i < field.length; i++) {
    // Outer loop iterates through rows.
    for (let j = 0; j < field[0].length; j++) {
      // Inner loop iterates through individual tiles/elements.
      if (field[i][j] === playerCharacter) {
        startCoords = [i, j];
      } else if (field[i][j] === hat) {
        endCoords = [i, j];
      }
    }
  }

  //let currentTile = startCoords;
  let currentTile = [0, 0];
  currentTile[0] = startCoords[0];
  currentTile[1] = startCoords[1];
  let pathMap = [];
  let visitedTiles = [];
  // Gives the function a timeout limit of 1000 moves to find a solution to the field.
  let timeOut = 0;
  let timeOutLimit = 100;

  //console.log('');
  //console.log('Testing generated field...');
  //console.log(`startCoords: ${startCoords}`);
  printField(gameField);

  while (timeOut < timeOutLimit) {
    timeOut++;
    //console.log('--------------------');
    //console.log(`Cycle ${timeOut}`);
    //console.log(`startCoords: ${startCoords}`);
    //console.log(`currentTile: ${currentTile}`);
    //console.log(`visitedTiles: ${visitedTiles}`);
    //console.log(`     pathMap: ${pathMap}`);
    //console.log(`if() expression to add to visitedTiles returns: ${!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])}`);
    //console.log(`if() expression to add to      pathMap returns: ${!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])}`);

    // STEP 2: Add the current tile to the pathMap and visitedTiles arrays, if it has not been added already.
    if (!pathMap.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      pathMap.push([currentTile[0], currentTile[1]]);
      //console.log(`     add to pathMap: ${currentTile} (${pathMap.length} tiles in array)`);
    } 
    if (!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      visitedTiles.push([currentTile[0], currentTile[1]]);
      //console.log(`add to visitedTiles: ${currentTile} (${visitedTiles.length} tiles in array)`);
    }
    //console.log('***ADD TO ARRAY***');
    //console.log(`visitedTiles: ${visitedTiles}`);
    //console.log(`     pathMap: ${pathMap}`);
    //console.log(`if() expression to add to visitedTiles returns: ${!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])}`);
    //console.log(`if() expression to add to      pathMap returns: ${!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])}`);

    // STEP 3: If there is at least 1 valid tile and it is not already in the pathMap array, move to one.
    // Priority is arbitrary; in this case, for simplicity, priority is in this order: up, right, down, left.
    let moveUp = [currentTile[0] - 1, currentTile[1]];
    let moveRt = [currentTile[0], currentTile[1] + 1];
    let moveDn = [currentTile[0] + 1, currentTile[1]];
    let moveLf = [currentTile[0], currentTile[1] - 1];

    let validMoveFound = false;
    let closestValidMoveDistance = fieldHeight + fieldWidth;
    let moveUpDistToHat = getDistance(moveUp, endCoords);
    let moveRtDistToHat = getDistance(moveRt, endCoords);
    let moveDnDistToHat = getDistance(moveDn, endCoords);
    let moveLfDistToHat = getDistance(moveLf, endCoords);
    let selectedMove = false;
    

    if (checkMove(moveUp) === 'hat') {
      currentTile = moveUp;
      validMoveFound = true;
      //console.log('Moved up, found hat, reassigned current tile');
    } else if (checkMove(moveRt) === 'hat') {
      currentTile = moveRt;
      validMoveFound = true;
      //console.log('Moved right, found hat, reassigned current tile');
    } else if (checkMove(moveDn) === 'hat') {
      currentTile = moveDn;
      validMoveFound = true;
      //console.log('Moved down, found hat, reassigned current tile');
    } else if (checkMove(moveLf) === 'hat') {
      currentTile = moveLf;
      validMoveFound = true;
      //console.log('Moved left, found hat, reassigned current tile');
    } else {
      if (checkMove(moveUp) === 'field' && (!visitedTiles.some(el => el[0] === moveUp[0] && el[1] === moveUp[1])) && moveUpDistToHat < closestValidMoveDistance) {
        selectedMove = moveUp;
        closestValidMoveDistance = moveUpDistToHat;
        validMoveFound = true;
        //console.log(`moveUp selected --- moveUpDistToHat: ${moveUpDistToHat}`);
      }
      if (checkMove(moveRt) === 'field' && (!visitedTiles.some(el => el[0] === moveRt[0] && el[1] === moveRt[1])) && moveRtDistToHat < closestValidMoveDistance) {
        selectedMove = moveRt;
        closestValidMoveDistance = moveRtDistToHat;
        validMoveFound = true;
        //console.log(`moveRt selected --- moveRtDistToHat: ${moveRtDistToHat}`);
      }
      if (checkMove(moveDn) === 'field' && (!visitedTiles.some(el => el[0] === moveDn[0] && el[1] === moveDn[1])) && moveDnDistToHat < closestValidMoveDistance) {
        selectedMove = moveDn;
        closestValidMoveDistance = moveDnDistToHat;
        validMoveFound = true;
        //console.log(`moveDn selected --- moveDnDistToHat: ${moveDnDistToHat}`);
      }
      if (checkMove(moveLf) === 'field' && (!visitedTiles.some(el => el[0] === moveLf[0] && el[1] === moveLf[1])) && moveLfDistToHat < closestValidMoveDistance) {
        selectedMove = moveLf;
        closestValidMoveDistance = moveLfDistToHat;
        validMoveFound = true;
        //console.log(`moveLf selected --- moveLfDistToHat: ${moveLfDistToHat}`);
      } 
    }

    //console.log(`selectedMove: ${selectedMove}`);
    if (selectedMove) {
      //currentTile = selectedMove;
      currentTile[0] = selectedMove[0];
      currentTile[1] = selectedMove[1];
    }


    // STEP 4: If no valid moves are available from the new tile, try to navigate back to the previous tile in the path, and take that previous dead-end tile out of the pathMap array.
    if (!validMoveFound && pathMap.length >= 2) {
      //currentTile = pathMap[pathMap.length - 2];
      //console.log(`validMoveFound: ${validMoveFound}`);
      currentTile[0] = pathMap[pathMap.length - 2][0];
      currentTile[1] = pathMap[pathMap.length - 2][1];
      pathMap.pop(); 
    }

    // STEP 5: If the current tile has no valid moves and the pathMap array is empty, return false, indicating there is no valid path between the starting location and the hat in this field.
    // *** CHANGE THIS TO ELSE/IF?
    else if (!validMoveFound && pathMap.length === 1) {
      console.log(`No path found! (took ${timeOut}/${timeOutLimit} moves)`);
      pathFound = false;
      return false;
    }

    // STEP 6: If the function has moved to the hat tile, draw a path that was found (not necessarily the shortest) in the solutionField array, and return true, indicating there is a valid path between the starting location and the hat in this field.
    if (currentTile[0] === endCoords[0] && currentTile[1] === endCoords[1]) {
      // STEP 6.1: Generate a blank solutionField of only field characters, exactly the same size of gameField, so that the gameField can be copied to it.
      for (let i = 0; i < gameField.length; i++) {
        // Outer loop iterates through rows.
        solutionField.push([]);
        // Inner loop iterates through individual tiles/elements.
        for (let j = 0; j < gameField[0].length; j++) {
          solutionField[i].push(fieldCharacter);
        }
      }

      // STEP 6.2: Copy gameField to solutionField one tile at a time to prevent the variables from linking erroneously.
      // Outer loop iterates through rows.
      for (let i = 0; i < solutionField.length; i++) {
        // Inner loop iterates through individual tiles/elements.
        for (let j = 0; j < solutionField[0].length; j++) {
            solutionField[i][j] = gameField[i][j];
        }
      }

      // STEP 6.3: Find the coordinates that are in the pathMap array and change them to pathCharacters in the solutionField.
      //console.log(`Pasting path for pathMap: ${pathMap}`);
      //console.log(`startCoords: ${startCoords}`);
      for (let i = 0; i < solutionField.length; i++) {
        // Outer loop iterates through rows.
        for (let j = 0; j < solutionField[0].length; j++) {
          // Inner loop iterates through individual tiles/elements.
          if (pathMap.some(el => (i === el[0] && j === el[1]) && !(i === startCoords[0] && j === startCoords[1]))) {
            //console.log(`!(i === startCoords[0] && j === startCoords[1]) (index is NOT startCoords) returns: ${!(i === startCoords[0] && j === startCoords[1])}`);
            //console.log(`${i},${j} === ${[startCoords[0], startCoords[1]]} : ${(i === startCoords[0] && j === startCoords[1])}`);
            solutionField[i][j] = pathCharacter;
            //console.log(`Pasted pathCharacter at: ${i},${j}`);
          } 
        }
      }

      // STEP 6.4: Finally, once the path has been found and the solutionField has been generated, set the pathFound flag to true and return true. Also print a message telling the user how many moves it took the function to reach the hat (not usually the shortest path). 
      console.log(`Path found! (took ${timeOut}/${timeOutLimit} moves)`);
      //console.log(`startCoords: ${startCoords}`);
      pathFound = true;
      return true;
    }
  }

  // Stop the function if it takes too many moves to reach the hat.
  if (timeOut >= timeOutLimit) {
    console.log('No path found: timeOut exceeded');
    console.log(`Total moves made: ${timeOut}/${timeOutLimit}`);
    return false;
  }
};

function printField(field) {
  //console.log('printField() runs!');
  // General function to print out a field in a nice format
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

function promptNewGame() {
  solutionField = [];
  pathFound = false;

  let newGameResponse = '';
  let fieldGenerationAttempts = 0;
  let fieldGenerationAttemptsLimit = 5;
  while (newGameResponse !== 'y' && newGameResponse !== 'n') {
    newGameResponse = prompt('New game? (y/n) ');
    if (newGameResponse === 'y') {
      // Nice formatting for each new game
      console.log('------------------------------');
      console.log(' New game! Find the lost hat! ');
      console.log('------------------------------');

      playGame = true;
      foundHat = false;

      if (fieldType === 'test') {
        gameField = testField;
        findPath(gameField);
      } else if (fieldType === 'manual') {
        gameField = manualField;
        findPath(gameField);
      } else if (fieldType === 'testRaw') {
        //gameField = convertRawField(testFieldRaw);
        //findPath(gameField);
      } else if (fieldType === 'generate') {
        do {
          gameField = generateField(fieldHeight, fieldWidth, percentageHoles);
          findPath(gameField);
          fieldGenerationAttempts++;
        } while (!pathFound && fieldGenerationAttempts < fieldGenerationAttemptsLimit);
        
        console.log(`fieldGenerationAttempts: ${fieldGenerationAttempts}`);
        //console.log(`playerLocation: ${playerLocation}`);
        //printField(gameField);
        //console.log('-------------------------');
      };
      
      if (fieldGenerationAttempts === fieldGenerationAttemptsLimit) {
        console.log(`ERROR: Could not generate a field with a valid path within the limit of ${fieldGenerationAttemptsLimit} attempts. Please reduce the percentage of holes and restart the program.`)
      };

    } else if (newGameResponse === 'n') {
      playGame = false;
      console.log('Okay, the lost hat wasn\'t that nice anyway...');
    };
  };
};

function checkMove(coordinates) {
  let y = coordinates[0];
  let x = coordinates[1];
  //console.log(`coordinates intake in checkMove: ${coordinates}`);

  // If attempted move location is out of bounds, returns 'boundary'
  if (y < 0 || x < 0 || y >= gameField.length || x >= gameField[0].length) {
    return 'boundary';
  } 
  // If attempted move location is a field tile, returns 'field'
  else if (gameField[y][x] === fieldCharacter) {
    return 'field';
  }
  // If attempted move location is the hat, returns 'hat'
  else if (gameField[y][x] === hat) {
    return 'hat';
  }
  // If attempted move location is a hole, returns 'hole'
  else if (gameField[y][x] === hole) {
    return 'hole'
  }
  // If attempted move location is somehow none of the above, returns 'error'
  else {
    return 'error';
  }
};

function movePlayer(currentLocation, newLocation) {
  // Brings in the player's current location
  let currentY = currentLocation[0];
  let currentX = currentLocation[1];

  // Brings in the player's new location after the move
  let newY = newLocation[0];
  let newX = newLocation[1];

  // Sets the player's old position back to a field character
  gameField[currentY][currentX] = fieldCharacter;
  // Sets the player's new position to the player character
  gameField[newY][newX] = playerCharacter;

  // Updates the player's location after completing the move
  playerLocation[0] = newLocation[0];
  playerLocation[1] = newLocation[1];

  // CALL updateVision() FUNCTION TO UPDATE WHICH TILES CAN BE SEEN
  // 
};

function updateVision() {}; // Needs to be built

function endGame(endReason) {
  // If the game ends, print out the appropriate message based on if they won, or how they lost
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

//gameField = manualField;
//findPath(manualField);
//printField(manualField);
//console.log('^^^manualField^^^');
//printField(solutionField);
//console.log('^^^solutionField^^^');
//printField(displayField);
//console.log('^^^displayField^^^');

// Asks the user if they want to start a new game when the program runs
promptNewGame();
//printField(gameField);

// MAIN GAME LOOP
// after testing, condition should be while (playGame && pathFound)
while (playGame) {
  // Prints the updated game field after every move, showing the new current player position
  printField(gameField);

  //console.log(`playerLocation: ${playerLocation}`);

  // Asks for user input to get a move direction
  let userInput = prompt('View a solution (type "solution") start a new game ("n") or move (w/a/s/d) ');
  let attemptMoveTo = [playerLocation[0], playerLocation[1]];
  let playerAttemptedMove = false;
  let keepPlaying = '';

  // Translates user input into a coordinate to try to move to
  switch (userInput) {
    case 'w':
      attemptMoveTo = [playerLocation[0] - 1, playerLocation[1]]; 
      playerAttemptedMove = true;
      break;
    case 'a':
      attemptMoveTo = [playerLocation[0], playerLocation[1] - 1]; 
      playerAttemptedMove = true;
      break;
    case 's':
      attemptMoveTo = [playerLocation[0] + 1, playerLocation[1]]; 
      playerAttemptedMove = true;
      break;
    case 'd':
      attemptMoveTo = [playerLocation[0], playerLocation[1] + 1]; 
      playerAttemptedMove = true;
      break;
    case 'n': 
      //keepPlaying = 'n';
      promptNewGame();
      break;
    case 'solution': 
      // Prints a solution to the field if the player asks for it, then asks if they want to keep trying to start a new game instead
      //console.log('--------------------');
      printField(solutionField);
      console.log('Here\'s a path to the hat!');

      while (keepPlaying !== 'y' && keepPlaying !== 'n') {

        //console.log(`keepPlaying: ${keepPlaying}`);
        keepPlaying = prompt('Keep trying? (y/n) ');
        //console.log(`keepPlaying: ${keepPlaying}`);
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

  // Calls the appropriate functions to test and make the move, and end the game if it was invalid
  //console.log(`keepPlaying: ${keepPlaying}`);
  //console.log('');
  if (playerAttemptedMove) {
    if (checkMove(attemptMoveTo) === 'field') {
      movePlayer(playerLocation, attemptMoveTo);
    } else if (checkMove(attemptMoveTo) === 'error') {
      console.log(`Error: unhandled movement check at coordinates: Y=${attemptMoveTo[0]}, X=${attemptMoveTo[1]}`);
    } else {
      endGame(checkMove(attemptMoveTo));
    }
  }
  //console.log('----- END WHILE LOOP, NEW GAME CYCLE -----');
  //console.log('');
}






