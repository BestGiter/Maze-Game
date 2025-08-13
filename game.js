let coins, dimensions, player, done, hasKey;
let currentLevel = 0;
let processedLevels = [];
let editorMode = false;
let playerskin = 0;
player = [1, 2];
const convert = {
  "#": "🧱",
  "_": " ",
  "$": "💵",
  "0": "🪙",
  "P0": "😀",
  "P1": "☹️",
  "P2": "🥱",
  "K": "🗝️",
  "D": "🚪",
  "f": "🔥",
  "x": "❓"
};
const levels = [
  {"level":[
    ['#','#','#','#','#','#','#','#'],
    ['#','0','_','_','#','_','_','#'],
    ['#','_','_','_','D','$','_','#'],
    ['#','K','_','0','#','_','_','#'],
    ['#','_','_','_','f','_','_','#'],
    ['#','#','#','#','#','#','#','#']
  ],"player":[1,2]},
  {"level":[
    ['#','#','#','#','#','#','#','#'],
    ['#','_','_','0','#','x','x','#'],
    ['#','_','K','_','D','_','x','#'],
    ['#','_','_','_','#','_','_','#'],
    ['#','0','_','_','f','_','_','#'],
    ['#','#','#','#','#','#','_','#'],
    ['#','#','#','#','#','#','_','#'],
    ['#','_','_','0','#','_','_','#'],
    ['#','_','K','_','D','$','_','#'],
    ['#','_','_','_','#','_','x','#'],
    ['#','0','_','_','f','x','x','#'],
    ['#','#','#','#','#','#','#','#'],
  ],"player":[1,2]}
];
document.addEventListener("keydown", function(event) {
  const keysToBlock = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keysToBlock.includes(event.key)) {
    event.preventDefault();
  }

  if (editorMode) {
    const keyMap = {
      "1": "_",
      "2": "#",
      "3": "0",
      "4": "$",
      "5": "K",
      "6": "D",
      "7": "f",
      "8": "x",
      "9": "P"
    };
    if (keyMap[event.key]) {
      selectedType = keyMap[event.key];
      updateSelectedTileDisplay();
    }
    if (event.key === "e") {
      console.log("Exported level:");
      console.log(JSON.stringify(game));
    }
    return;
  }

  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      up();
      break;
    case "ArrowDown":
    case "s":
    case "S":
      down();
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      left();
      break;
    case "ArrowRight":
    case "d":
    case "D":
      right();
      break;
    case "r":
    case "R":
      document.getElementById("retryBtn").onclick();
      break;
  }
});

document.getElementById("editorBtn").onclick = () => {
  if (editorMode) {
    // Exit editor and play the level
    editorMode = false;
    processedLevels = []; // clear cache so 'x' tiles re-randomize if needed
    levels.push({"level":JSON.parse(JSON.stringify(game)),"player":JSON.parse(JSON.stringify(player))}); // add edited level to levels
    currentLevel = levels.length - 1;
    start();
  } else {
    editorMode = true;
    startEditor();
  }
};

start();

function start() {
  document.getElementById("coincounter").innerText = "Coins: 0";
  document.getElementById("retryBtn").style.display = "none";
  hasKey = false;
  coins = 0;
  done = false;

  if (!processedLevels[currentLevel]) {
    // First time loading this level — randomize 'x'
    let raw = JSON.parse(JSON.stringify(levels[currentLevel]))["level"];
    for (let r = 0; r < raw.length; r++) {
      for (let c = 0; c < raw[r].length; c++) {
        if (raw[r][c] === "x") {
          raw[r][c] = Math.random() < 0.5 ? "_" : "f";
        }
      }
    }
    processedLevels[currentLevel] = {"level":raw,"player":JSON.parse(JSON.stringify(levels[currentLevel]))["player"]};
  }
  
  game = JSON.parse(JSON.stringify(processedLevels[currentLevel]))["level"];
  player = JSON.parse(JSON.stringify(processedLevels[currentLevel]))["player"];
  dimensions = [game.length, game[0].length];
  doUpdate();
}

function playSound(src) {
  const sound = new Audio(src);
  sound.play();
}

function doUpdate() {
  retrybtn = document.getElementById("retryBtn")
  switch (game[player[0]][player[1]]) {
    case "$":
      playSound("winsound.m4a");
      currentLevel++;
      if (currentLevel >= levels.length) {
        document.getElementById("game").innerText = "You beat all levels!";
        done = true;
        retrybtn.innerText = "Restart to beginning"
        retrybtn.onclick = function() {
          currentLevel = 0;
          document.getElementById("levelcounter").innerText = "Level: 0";
          retrybtn = document.getElementById("retryBtn");
          retrybtn.innerText = "Retry";
          retrybtn.onclick = function () { start(); };
          start();
        };
        retrybtn.style.display = "inline-block";
        const grid = document.getElementById("game");
        grid.style.gridTemplateColumns = "none";
        grid.style.gridTemplateRows = "none";
      } else {
        document.getElementById("levelcounter").innerText = "Level: "+currentLevel;
        start(); // Load next level
      }
      return;
    case "0":
      coins++;
      document.getElementById("coincounter").innerText = "Coins: " + coins;
      playSound("coinsound.m4a");
      game[player[0]][player[1]] = "_";
      break;
    case "K":
      game[player[0]][player[1]] = "_";
      hasKey = true;
      break;
    case "D":
      playSound("doorsound.m4a")
      game[player[0]][player[1]] = "_";
      break;
    case "f":
      done = true;
      document.getElementById("game").innerText = "You died";
      retrybtn.style.display = "inline-block";
      playSound("deathsound.m4a")
      const grid = document.getElementById("game");
      grid.style.gridTemplateColumns = "none";
      grid.style.gridTemplateRows = "none";
      return;
  }
  renderGame();
}

function canMoveTo(r, c) {
  return game[r][c] !== "#" && (game[r][c] !== "D" || (game[r][c] == "D" && hasKey));
}

function move(deltaRow, deltaCol) {
  if (done) return;
  let newRow = player[0] + deltaRow;
  let newCol = player[1] + deltaCol;
  if (
    newRow < 0 || newRow >= dimensions[0] ||
    newCol < 0 || newCol >= dimensions[1] ||
    !canMoveTo(newRow, newCol)
  ) return;
  player = [newRow, newCol];
  doUpdate();
}

function updateSelectedTileDisplay() {
  document.getElementById("selectedTile").textContent =
    "Selected: " + (convert[selectedType] || selectedType);
}

function up() {
  move(-1, 0);
}

function down() {
  move(1, 0);
}

function left() {
  move(0, -1);
}

function right() {
  move(0, 1);
}

let selectedType = "_";
const tileTypes = ["_", "#", "0", "$", "K", "D", "f", "x", "P"];

function startEditor() {
  const width = parseInt(prompt("Enter grid width:", "8"));
  const height = parseInt(prompt("Enter grid height:", "6"));
  if (isNaN(width) || isNaN(height)) return;

  // Create empty level
  game = [];
  for (let r = 0; r < height; r++) {
    const row = [];
    for (let c = 0; c < width; c++) {
      row.push("_");
    }
    game.push(row);
  }

  dimensions = [height, width];
  player = [0, 0]; // default player position
  renderGame();
}

function updateSelectedTileDisplay() {
  const display = document.getElementById("selectedTile");
  if (display) {
    display.textContent = "Selected: " + (convert[selectedType] || selectedType);
  }
}

function renderGame() {
  const grid = document.getElementById("game");
  grid.innerHTML = "";

  grid.style.gridTemplateColumns = `repeat(${dimensions[1]}, 40px)`;
  grid.style.gridTemplateRows = `repeat(${dimensions[0]}, 40px)`;

  for (let r = 0; r < dimensions[0]; r++) {
    for (let c = 0; c < dimensions[1]; c++) {
      const cell = document.createElement("div");
      cell.className = "game-cell";

      let symbol = game[r][c];
      if (r === player[0] && c === player[1]) symbol = "P"+(playerskin%3);

      cell.textContent = convert[symbol] || symbol;

      if (editorMode) {
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          if (selectedType === "P") {
            player = [r, c];
          } else {
            game[r][c] = selectedType;
          }
          renderGame();
        });
      }

      grid.appendChild(cell);
    }
  }
}
