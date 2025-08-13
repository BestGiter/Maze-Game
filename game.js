let coins, dimensions, player, done, hasKey;

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

document.addEventListener("keydown", function(event) {
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
      start();
      break;
  }
});

start();

function start() {
  document.getElementById("retryBtn").style.display = "none";
  hasKey = false
  game = [
    ['#','#','#','#','#','#','#','#'],
    ['#','0','_','_','#','_','_','#'],
    ['#','_','_','_','D','$','_','#'],
    ['#','K','_','0','#','_','_','#'],
    ['#','_','_','_','f','_','_','#'],
    ['#','#','#','#','#','#','#','#']
  ];
  coins = 0;
  dimensions = [game.length, game[0].length];
  player = [1, 2]; // row, column
  done = false;
  renderGame();
}

function playSound(src) {
  const sound = new Audio(src);
  sound.play();
}

function doUpdate() {
  switch (game[player[0]][player[1]]) {
    case "$":
      done = true;
      document.getElementById("game").innerText = "You win";
      playSound("winsound.m4a");
      document.getElementById("retryBtn").style.display = "inline-block";
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
