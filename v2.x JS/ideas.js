/* 
- REOPEN: To understand better how input works: https://www.w3schools.com/jsref/met_document_addeventlistener.asp



FUTURE VERSIONS

2.3
- Put a prompt bar at the bottom of the canvas where the game displays text, like when it asks if the player wants a new game
  - May be able to implement this fairly easily with two things: 
    - Increasing canvas height by the height of the prompt bar
    - Changing the canvasSize and/or gridIndexPx variables (the ones used to draw things) to correct for that increased canvas size before applying it to drawing functions
- Add a "Start Game" button and game settings to the main menu
  - Inputs are passed into the startNewGame() function
  - 3 options each for field dimensions, percentage of holes, vision range and exploration mode
  - Let the defaults be the same parameters as the last game

2.4
- (?) Try drawing wizard bigger on menu screen by using a third canvas which uses the same CSS rules but starts at half the size (80px)?
- Use new function drawMessageBoard() or something like that to make it more modular to draw the menu and background for messages dispalyed in the game scene. 
- Make sure the game can handle a situation where it can't generate a valid field within the limit of attempts, especially once manual settings are implemented (simply use the new drawMessageBoard() function to tell the user to reduce the percentage of holes)
- Implement manual settings at the main menu (grid size modifications should probably be just a few pre-set sizes, to make sure the imgCanvas size always works to display it right; percent of holes and vision range should be much simpler)

2.5: 
- Improve pathfinder even more (more for the purposes of future games than really a necessity for the hat game, as it's adequate for this simple game)
  - After a path is found, starting from the closest path tile to the starting location and working along the path, find the path again to that tile. If it finds a shorter path (fewer steps compared to the old path), set that segment as the new solution path and keep checking for shorter paths between the start and that last path tile checked. (No need to check the ones closer to the player again, because it was already determined that there was no shorter route to those. But think about it, maybe there are fringe cases where checking those again would yield a shorter route now that the path has been updated). Keep checking until it gets all the way to the last tile in the path. This process makes sure that long detours are eliminated (like those that happen when it tries to get closer to the hat and hits a place it has to get back out of, but isn't a dead end, so instead of backtracking it loops around in a weird way). Two nested for loops checking each step against each subsequent step could be a way to be sure that the shortest path was taken. 
    - This implementation will require findPath() to have the solution-building functionality split into a separate function so that I can save the first path generated, then call findPath() multiple times to recheck and shorten the path without resetting the solution field each time, which would mess up the whole process. So save the current version of findPath(), but rework it to where it takes in two coordinates and finds the path between them. 
    - Have the new findPath() function return (or update a variable with) an array of coordinates for the path. Then 
    - As part of this, maybe make a new findTile(tileToFind) function that takes either 'hat' or 'player' as an argument and returns the coordinates for use in other things, especially the new version of findPath().
    - NOTE: Make sure this process can handle a path with the same coordinate appearing twice, as I found can happen when it trims the path down. 
  - Out of curiosity, (not necessarily to implement, as the pathfinder is good enough for such a simple game), look up logic for finding the shortest path without too much processing involved, in case I want to implement that in future games like Zombots. 

  */