let coins, dimensions, player, done, hasKey;
let currentLevel = 0;
let processedLevels = [];
const convert = {
  "#": "🧱",
  "_": " ",
  "$": "💵",
  "0": "🪙",
  "P": "😀",
  "K": "🗝️",
  "D": "🚪",
  "f": "🔥"
};
const levels = [
  [
    ['#','#','#','#','#','#','#','#'],
    ['#','0','_','_','#','_','_','#'],
    ['#','_','_','_','D','$','_','#'],
    ['#','K','_','0','#','_','_','#'],
    ['#','_','_','_','f','_','_','#'],
    ['#','#','#','#','#','#','#','#']
  ],
  [
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
  ]
];
document.addEventListener("keydown", function(event) {
  const keysToBlock = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keysToBlock.includes(event.key)) {
    event.preventDefault(); // Stops the browser from scrolling
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

start();

function start() {
  document.getElementById("coincounter").innerText = "Coins: 0";
  document.getElementById("retryBtn").style.display = "none";
  hasKey = false;
  coins = 0;
  done = false;

  if (!processedLevels[currentLevel]) {
    // First time loading this level — randomize 'x'
    let raw = JSON.parse(JSON.stringify(levels[currentLevel]));
    for (let r = 0; r < raw.length; r++) {
      for (let c = 0; c < raw[r].length; c++) {
        if (raw[r][c] === "x") {
          raw[r][c] = Math.random() < 0.5 ? "_" : "f";
        }
      }
    }
    processedLevels[currentLevel] = raw;
  }

  game = JSON.parse(JSON.stringify(processedLevels[currentLevel]));
  dimensions = [game.length, game[0].length];
  player = [1, 2];
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
      return;
  }
  renderGame();
}

function renderGame() {
  const grid = document.getElementById("game");
  grid.innerHTML = ""; // Clear previous

  grid.style.gridTemplateColumns = `repeat(${dimensions[1]}, 40px)`;
  grid.style.gridTemplateRows = `repeat(${dimensions[0]}, 40px)`;

  for (let r = 0; r < dimensions[0]; r++) {
    for (let c = 0; c < dimensions[1]; c++) {
      const cell = document.createElement("div");
      cell.className = "game-cell";

      let symbol = game[r][c];
      if (r === player[0] && c === player[1]) symbol = "P";

      cell.textContent = convert[symbol] || symbol;
      grid.appendChild(cell);
    }
  }
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
