/*
VERSION 2.1

- Game now displays both text and images sharply, using two overlaid canvases. 

*/



// SETTINGS: FIELD PARAMETERS --- Change these to modify field parameters
const txtCanvasSize = 634;
const imgCanvasSize = 160;
let gridSize = 10;
const gridIndexPx = imgCanvasSize/gridSize;
//let fieldHeight = 10; 
//let fieldWidth = 10;
let percentageHoles = 30;
let visionRange = 2.5;
let explorationType = 'temporaryReveal'; // Set to 'temporaryReveal,' 'permanentReveal' or 'unhidden' for different exploration difficulties
let imageDisplay = 'sprites'; // Set to 'sprites' or 'colors' for testing purposes

// FOR TESTING PURPOSES: Set for preset fields or a randomly generated one
const fieldType = 'generate'; // Set to 'test', 'manual', 'rawTest' or 'generate'

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

// SETTINGS: TILE CHARACTERS
// The printed characters that make up the field. Change according to how you'd like to customize your game! (To make the field look like it's made up of more square tiles instead of tall rectangles, each 'character' should actually be two characters, as seen in the defaults.)
const hat = '/\\';
const hole = '()';
const fieldCharacter = '░░';
const pathCharacter = '--'
const playerCharacter = ':D';
const hiddenTileCharacter1 = '. ';
const hiddenTileCharacter2 = ' .';

const imgField = new Image();
imgField.src = './resources/images/Grass.png';
const imgHole = new Image();
imgHole.src = './resources/images/Hole_Without_Background.png';
const imgHat= new Image();
imgHat.src = './resources/images/Hat_Without_Background.png';
const imgWizard = new Image();
imgWizard.src = './resources/images/Wizard_Without_Background.png';

const txtCanvas = document.getElementById('txtCanvas');
const tc = txtCanvas.getContext('2d');
const imgCanvas = document.getElementById('imgCanvas');
const ic = imgCanvas.getContext('2d');

//ctx.fillStyle = 'gray';
const hatColor = 'yellow';
const holeColor = 'red';
const fieldColor = 'green';
const playerColor = 'blue';
const hiddenTileColor = 'black';

// Initializing variables (DO NOT change these!)
//const prompt = require('prompt-sync')({sigint: true});

let gameField = [];
let solutionField = [];
let displayField = [];
let playerLocation = [0, 0];
//let playGame = false;
let pathFound = false;
let currentScene = 'unassigned';
let endGameReason = 'unassigned';



// ********** Helper/Background Functions **********

function getDistance(point1, point2) {
  let distanceY = Math.abs(point1[0] - point2[0]);
  let distanceX = Math.abs(point1[1] - point2[1]);
  let distance = Math.sqrt(distanceY**2 + distanceX**2);
  return distance;
};

function copy2DArray(source) {
  let copy = [];
  for (let i = 0; i < source.length; i++) {
    copy.push([]);
    for (let j = 0; j < source[0].length; j++) {
      copy[i].push(source[i][j]);
    }
  }
  return copy;
};


// ********** Drawing Functions **********

function clearCanvas(target) {
  // Clear whichever is targetted: txtCanvas or imgCanvas
  if (target === 'tc') {
    tc.clearRect(0, 0, txtCanvasSize, txtCanvasSize);
  } else if (target === 'ic') {
    ic.clearRect(0, 0, imgCanvasSize, imgCanvasSize);
  }
};

function refreshGrid() {
  // Clear canvas
  clearCanvas('ic');
  ic.fillStyle = 'gray';
  ic.fillRect(0, 0, imgCanvasSize, imgCanvasSize);

  updateDisplayField();

  // Draw grid of tiles
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (imageDisplay === 'colors') {
        if (displayField[i][j] === fieldCharacter) {
          ic.fillStyle = fieldColor;
        } else if (displayField[i][j] === hiddenTileCharacter1 || displayField[i][j] === hiddenTileCharacter2) {
          ic.fillStyle = hiddenTileColor;
        } else if (displayField[i][j] === hole) {
          ic.fillStyle = holeColor;
        } else if (displayField[i][j] === hat) {
          ic.fillStyle = hatColor;
        } else if (displayField[i][j] === playerCharacter) {
          ic.fillStyle = playerColor;
        } else {
          ic.fillStyle = 'pink'; // Error indicator; tile is none of the ones that should show up in the game
        }
        //ic.fillRect((j*gridIndexPx) + 3, (i*gridIndexPx) + 3, gridIndexPx - 5, gridIndexPx - 5);
        ic.fillRect(j*gridIndexPx + 1, i*gridIndexPx + 1, gridIndexPx - 1, gridIndexPx - 1);
        //ic.fillRect((j*txtCanvasSize/gridSize) + 3, (i*txtCanvasSize/gridSize) + 3, (txtCanvasSize/gridSize) - 5, (txtCanvasSize/gridSize) - 5);
      } 
      
      else if (imageDisplay === 'sprites') {
        if (displayField[i][j] === fieldCharacter) {
          // Draw a field image
          ic.drawImage(imgField, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
        } else if (displayField[i][j] === hiddenTileCharacter1 || displayField[i][j] === hiddenTileCharacter2) {
          // Draw a black box
          ic.fillStyle = 'black';
          ic.fillRect(j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
        } else if (displayField[i][j] === hole) {
          // Draw a field image, then a hole image over it
          ic.drawImage(imgField, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
          ic.drawImage(imgHole, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
        } else if (displayField[i][j] === hat) {
          // Draw a field image, then a hat image over it
          ic.drawImage(imgField, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
          ic.drawImage(imgHat, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
        } else if (displayField[i][j] === playerCharacter) {
          // Draw a field image, then a wizard image over it
          ic.drawImage(imgField, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
          ic.drawImage(imgWizard, j*gridIndexPx, i*gridIndexPx, gridIndexPx, gridIndexPx);
        } else {
          ic.fillStyle = 'pink'; // Error indicator; tile is none of the ones that should show up in the game
          ic.fillRect((j)*(gridIndexPx) + 3, (i)*(gridIndexPx) + 3, (gridIndexPx) - 5, (gridIndexPx) - 5);
        }
      }

    } 
  }
};

function loadScene(scene) {
  // Load different scenes
  if (scene === 'menu') {
    clearCanvas('tc');
    clearCanvas('ic');

    currentScene = 'menu';
    tc.lineWidth = 5;
    tc.fillStyle = 'white';
    tc.fillRect(txtCanvasSize*0.1, txtCanvasSize*0.1, txtCanvasSize*0.8, txtCanvasSize*0.8);
    
    tc.strokeStyle = 'blue';
    tc.strokeRect(txtCanvasSize*0.1, txtCanvasSize*0.1, txtCanvasSize*0.8, txtCanvasSize*0.8);
    tc.strokeStyle = 'yellow';
    tc.strokeRect(txtCanvasSize*0.11, txtCanvasSize*0.11, txtCanvasSize*0.78, txtCanvasSize*0.78);
    tc.strokeStyle = 'blue';
    tc.strokeRect(txtCanvasSize*0.12, txtCanvasSize*0.12, txtCanvasSize*0.76, txtCanvasSize*0.76);
    
    tc.fillStyle = 'black';
    tc.font = '36px Helvetica';
    tc.textAlign = 'center';
    tc.fillText('Magic Hat', txtCanvasSize/2, txtCanvasSize*0.2);
    
    tc.font = '24px Helvetica';
    tc.fillText('Press "g" for a new game!', txtCanvasSize/2, txtCanvasSize*0.3);
    tc.fillText('[Manual settings coming soon]', txtCanvasSize/2, txtCanvasSize*0.6);

    if (imageDisplay === 'sprites') {
      ic.drawImage(imgWizard, imgCanvasSize*0.45, imgCanvasSize*0.45, imgCanvasSize*0.1, imgCanvasSize*0.1);
    }

  } else if (scene === 'game') {
    clearCanvas('tc');
    clearCanvas('ic');

    currentScene = 'game';
    startNewGame();

    // Load the end-game card indicating why the game ended
  } else if (scene === 'endGame') {
    currentScene = 'endGame';

    ic.clearRect(imgCanvasSize*0.15, imgCanvasSize*0.3, imgCanvasSize*0.7, imgCanvasSize*0.4);
    tc.fillStyle = 'white'
    tc.fillRect(txtCanvasSize*0.15, txtCanvasSize*0.3, txtCanvasSize*0.7, txtCanvasSize*0.4);

    tc.strokeStyle = 'blue'
    tc.strokeRect(txtCanvasSize*0.15, txtCanvasSize*0.3, txtCanvasSize*0.7, txtCanvasSize*0.4);
    tc.strokeStyle = 'yellow'
    tc.strokeRect(txtCanvasSize*0.16, txtCanvasSize*0.31, txtCanvasSize*0.68, txtCanvasSize*0.38);
    tc.strokeStyle = 'blue'
    tc.strokeRect(txtCanvasSize*0.17, txtCanvasSize*0.32, txtCanvasSize*0.66, txtCanvasSize*0.36);

    tc.fillStyle = 'black';
    tc.textAlign = 'center';

    if (endGameReason === 'hat') {
      tc.font = '24px Helvetica';
      tc.fillText('Yay! You found the hat!', txtCanvasSize/2, txtCanvasSize*0.45);
    } else if (endGameReason === 'hole') {
      tc.font = '24px Helvetica';
      tc.fillText('Oh no! You fell into a hole!', txtCanvasSize/2, txtCanvasSize*0.45);
    } else {
      tc.font = '24px Helvetica';
      tc.fillText('[endGameReason not determined]', txtCanvasSize/2, txtCanvasSize*0.45);
    }

    tc.font = '12px Helvetica';
    tc.fillText('Press "m" to return to the menu', txtCanvasSize/2, txtCanvasSize*0.60);

  } else {
    console.log('Invalid scene in loadScene()');
  }
};

function promptMessage(message) {
  // Clear the prompt area, then re-draw the background color

  if (message === 'clear') {
    // draw prompt message: "~ ~ ~" (placeholder for when there's no active prompt)
    console.log('~ ~ ~');
  } else if (message === 'backToMenu') {
    // draw prompt message: "End game and return to the menu? (y/n)"
    // Make sure there's a listener set up to respons to this question
    console.log('End game and return to the menu? (y/n)');
  } else if (message === 'requestSolution') {
    // draw prompt message: "See a solution? (y/n)"
    // Make sure there's a listener set up to respons to this question
    console.log('See a solution? (y/n)');
  } else if (message === 'tooManyHoles') {
    // draw prompt message: "Too many holes. Reduce and restart the game."
    console.log('Too many holes. Reduce and restart the game.');
  } else if (message === 'boundaryWarning') {
    // draw prompt message: "Stay inside the boundaries!"
    console.log('Stay inside the boundaries!');
  } else if (message === 'endGameHole') {
    // draw prompt message: "You fell into a hole! Press "m" to return to the menu."
    console.log('You fell into a hole! Press "m" to return to the menu.');
  } else if (message === 'endGameHat') {
    // draw prompt message: "You found the hat! Press "m" to return to the menu."
    console.log('You found the hat! Press "m" to return to the menu.');
  } else {
    // draw prompt message: "Invalid message passed to promptMessage()"
    console.log('Invalid message passed to promptMessage()');
  }
};


// ********** Game Logic Functions **********

function generateField(height, width, percentHoles) {
  let numOfHoles = Math.floor((percentHoles/100) * height * width);
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

  let currentTile = [0, 0];
  currentTile[0] = startCoords[0];
  currentTile[1] = startCoords[1];
  let pathMap = [];
  let visitedTiles = [];
  // Gives the function a timeout limit of 1000 moves to find a solution to the field.
  let timeOut = 0;
  let timeOutLimit = 500;

  while (timeOut < timeOutLimit) {
    timeOut++;

    // STEP 2: Add the current tile to the pathMap and visitedTiles arrays, if it has not been added already.
    if (!pathMap.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      pathMap.push([currentTile[0], currentTile[1]]);
    } 
    if (!visitedTiles.some(el => el[0] === currentTile[0] && el[1] === currentTile[1])) {
      visitedTiles.push([currentTile[0], currentTile[1]]);
    }

    // STEP 3: If there is at least 1 valid tile and it is not already in the pathMap array, move to one.
    let moveUp = [currentTile[0] - 1, currentTile[1]];
    let moveRt = [currentTile[0], currentTile[1] + 1];
    let moveDn = [currentTile[0] + 1, currentTile[1]];
    let moveLf = [currentTile[0], currentTile[1] - 1];

    let validMoveFound = false;
    let closestValidMoveDistance = gridSize * 2;
    let moveUpDistToHat = getDistance(moveUp, endCoords);
    let moveRtDistToHat = getDistance(moveRt, endCoords);
    let moveDnDistToHat = getDistance(moveDn, endCoords);
    let moveLfDistToHat = getDistance(moveLf, endCoords);
    let selectedMove = false;
    
    if (checkMove(moveUp) === 'hat') {
      currentTile = moveUp;
      validMoveFound = true;
    } else if (checkMove(moveRt) === 'hat') {
      currentTile = moveRt;
      validMoveFound = true;
    } else if (checkMove(moveDn) === 'hat') {
      currentTile = moveDn;
      validMoveFound = true;
    } else if (checkMove(moveLf) === 'hat') {
      currentTile = moveLf;
      validMoveFound = true;
    } else {
      if (checkMove(moveUp) === 'field' && (!visitedTiles.some(el => el[0] === moveUp[0] && el[1] === moveUp[1])) && moveUpDistToHat < closestValidMoveDistance) {
        selectedMove = moveUp;
        closestValidMoveDistance = moveUpDistToHat;
        validMoveFound = true;
      }
      if (checkMove(moveRt) === 'field' && (!visitedTiles.some(el => el[0] === moveRt[0] && el[1] === moveRt[1])) && moveRtDistToHat < closestValidMoveDistance) {
        selectedMove = moveRt;
        closestValidMoveDistance = moveRtDistToHat;
        validMoveFound = true;
      }
      if (checkMove(moveDn) === 'field' && (!visitedTiles.some(el => el[0] === moveDn[0] && el[1] === moveDn[1])) && moveDnDistToHat < closestValidMoveDistance) {
        selectedMove = moveDn;
        closestValidMoveDistance = moveDnDistToHat;
        validMoveFound = true;
      }
      if (checkMove(moveLf) === 'field' && (!visitedTiles.some(el => el[0] === moveLf[0] && el[1] === moveLf[1])) && moveLfDistToHat < closestValidMoveDistance) {
        selectedMove = moveLf;
        closestValidMoveDistance = moveLfDistToHat;
        validMoveFound = true;
      } 
    }

    if (selectedMove) {
      currentTile[0] = selectedMove[0];
      currentTile[1] = selectedMove[1];
    }

    // STEP 4: If no valid moves are available from the new tile, try to navigate back to the previous tile in the path, and take that previous dead-end tile out of the pathMap array.
    if (!validMoveFound && pathMap.length >= 2) {
      currentTile[0] = pathMap[pathMap.length - 2][0];
      currentTile[1] = pathMap[pathMap.length - 2][1];
      pathMap.pop(); 
    }

    // STEP 5: If the current tile has no valid moves and the pathMap array is empty, return false, indicating there is no valid path between the starting location and the hat in this field.
    else if (!validMoveFound && pathMap.length === 1) {
      console.log(`No path found! (took ${timeOut}/${timeOutLimit} moves)`);
      pathFound = false;
      return false;
    }

    // STEP 6: If the function has moved to the hat tile, generate the displayField and solutionField needed to play the game.
    if (currentTile[0] === endCoords[0] && currentTile[1] === endCoords[1]) {
      // STEP 6.1: Generate blank fields (displayField of only hidden tiles and solutionField of only field tiles) exactly the same size of gameField so that the gameField can be copied to them.
      for (let i = 0; i < gameField.length; i++) {
        // Outer loop iterates through rows.
        solutionField.push([]);
        displayField.push([]);
        // Inner loop iterates through individual tiles/elements.
        for (let j = 0; j < gameField[0].length; j++) {
          solutionField[i].push(fieldCharacter);
          if (i % 2 === 0) {
            displayField[i].push(hiddenTileCharacter1);
          } else {
            displayField[i].push(hiddenTileCharacter2);
          }
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

function updateDisplayField() {
  if (explorationType === 'temporaryReveal') {
    displayField = [];
    for (let i = 0; i < gameField.length; i++) {
      // Outer loop iterates through rows.
      displayField.push([]);
      // Inner loop iterates through individual tiles/elements.
      for (let j = 0; j < gameField[0].length; j++) {
        if (i % 2 === 0) {
          displayField[i].push(hiddenTileCharacter1);
        } else {
          displayField[i].push(hiddenTileCharacter2);
        }
      }
    }
  } else if (explorationType === 'unhidden') {
      for (let i = 0; i < displayField.length; i++) {
        // Outer loop iterates through rows
        for (let j = 0; j < displayField[i].length; j++) {
          // Inner loop iterates through individual elements
            displayField[i][j] = gameField[i][j]
        }
      }
  }

  //console.log('activated in updateDisplayField()');
  for (let i = 0; i < displayField.length; i++) {
    // Outer loop iterates through rows
    for (let j = 0; j < displayField[i].length; j++) {
      // Inner loop iterates through individual elements
      if (getDistance([i,j], playerLocation) <= visionRange) {
        displayField[i][j] = gameField[i][j]
      }
    }
  }

};

function startNewGame() {
  endGameReason = 'unassigned';
  solutionField = [];
  displayField = [];
  gameField = [];
  pathFound = false;

  let fieldGenerationAttempts = 0;
  let fieldGenerationAttemptsLimit = 10;

  // Nice formatting for each new game
  console.log('/***********\\');
  console.log('| New game! |');
  console.log('\\___________/');

  while (!pathFound && fieldGenerationAttempts < fieldGenerationAttemptsLimit) {
    //playGame = true;
    //foundHat = false;

    if (fieldType === 'test') {
      gameField = testField;
      findPath(gameField);
      pathFound = true;
    } else if (fieldType === 'manual') {
      gameField = copy2DArray(manualField);
      findPath(gameField);
      pathFound = true;
    } else if (fieldType === 'generate') {
      do {
        gameField = generateField(gridSize, gridSize, percentageHoles);
        findPath(gameField);
        fieldGenerationAttempts++;
      } while (!pathFound && fieldGenerationAttempts < fieldGenerationAttemptsLimit);
      
      console.log(`fieldGenerationAttempts: ${fieldGenerationAttempts}`);
    };
    
    if (fieldGenerationAttempts === fieldGenerationAttemptsLimit) {
      console.log(`ERROR: Could not generate a field with a valid path within the limit of ${fieldGenerationAttemptsLimit} attempts. Please start a new game and reduce the percentage of holes.`)
      promptMessage('tooManyHoles');
      //playGame = false;
    };

    refreshGrid();

  };
};

function checkMove(coordinates) {
  let y = coordinates[0];
  let x = coordinates[1];

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
};

function endGame(endReason) {
  // If the game ends, print out the appropriate message based on if they won, or how they lost
  switch (endReason) {
    case 'hat':
      foundHat = true;
      console.log('You found the hat! You win!');
      endGameReason = 'hat';
      break;
    case 'hole':
      console.log('Game over! You fell into a hole!');
      endGameReason = 'hole';
      break;
    //case 'boundary':
      //console.log('Game over! You went outside the boundaries!');
      //break;
    default: 
      console.log('Error in endGame(): unhandled input');
  }
  //promptNewGame();

  loadScene('endGame');
};



// Start the game by loading the menu when the page is loaded
loadScene('menu');
imgWizard.onload = function() {
  if (imageDisplay === 'sprites') {
    ic.drawImage(imgWizard, imgCanvasSize*0.45, imgCanvasSize*0.45, imgCanvasSize*0.1, imgCanvasSize*0.1);
  }
};

// Input event listener
document.addEventListener('keydown', event => {

  //if (event.keyCode === 67) {
  //  clearCanvas('tc');
  //}

  // MENU: Listens for input in the menu
  if (currentScene === 'menu') {
    //console.log('Input triggered in MENU listener area');
    if (event.keyCode === 71) {
      loadScene('game');
      promptMessage('clear');
    }
  }

  // GAME: Listens for input in the game
  if (currentScene === 'game') {
    //console.log('Input triggered in GAME listener area');
    let attemptMoveTo = [playerLocation[0], playerLocation[1]];
    let playerAttemptedMove = false;

    //promptMessage('clear');
  
    switch (event.keyCode) {
      case 87: // w / Up
        //console.log('W (up) pressed');
        attemptMoveTo = [playerLocation[0] - 1, playerLocation[1]]; 
        playerAttemptedMove = true;
        break;
      case 68: // d / Right
        //console.log('D (right) pressed');
        attemptMoveTo = [playerLocation[0], playerLocation[1] + 1]; 
        playerAttemptedMove = true;
        break;
      case 83: // s / Down
        //console.log('S (down) pressed');
        attemptMoveTo = [playerLocation[0] + 1, playerLocation[1]]; 
        playerAttemptedMove = true;
        break;
      case 65: // a / Left
        //console.log('A (left) pressed');
        attemptMoveTo = [playerLocation[0], playerLocation[1] - 1]; 
        playerAttemptedMove = true;
        break;
      case 70: // f / Find Solution
        console.log('F (find solution) pressed');
        // Display solution somehow; maybe make a conditional inside refreshGrid() that allows it to display different fields depending on a flag set to 'play' or 'solution'?
        // promptMessage('backToMenu');
        break;
      case 77: // m / Back to Menu
        console.log('M (menu) pressed');
        // promptMessage('backToMenu');
        loadScene('menu');
        break;
    }

    if (playerAttemptedMove) {
      if (checkMove(attemptMoveTo) === 'field') {
        movePlayer(playerLocation, attemptMoveTo);
      } else if (checkMove(attemptMoveTo) === 'boundary') {
        promptMessage('boundaryWarning');
      } else if (checkMove(attemptMoveTo) === 'error') {
        console.log(`Error: unhandled movement check at coordinates: Y=${attemptMoveTo[0]}, X=${attemptMoveTo[1]}`);
      } else {
        endGame(checkMove(attemptMoveTo));
      }
    }

    if (currentScene === 'game') {
      refreshGrid();
    }

  }

  // ENDGAME: Listens for input on the end-game card
  if (currentScene === 'endGame') {
    //console.log('Input triggered in ENDGAME listener area');
    if (event.keyCode === 77) {
      //console.log('M (menu) pressed');
      loadScene('menu');
    }
  }
}); 







// **************************************************
// Old Functions
// **************************************************

function printField(field) {
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
