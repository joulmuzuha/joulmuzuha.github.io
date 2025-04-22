const cells = document.querySelectorAll("[data-cell]");
const message = document.getElementById("message");
const redWinsDisplay = document.getElementById("redWins");
const blueWinsDisplay = document.getElementById("blueWins");

let currentPlayer = "Red";
let redWins = 0;
let blueWins = 0;
const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function handleClick(e) {
    const cell = e.target;
    if (cell.textContent !== "") return; // Skip if cell is already filled
    cell.textContent = currentPlayer === "Red" ? "🔥" : "💎"; // Use symbols
    cell.classList.add(currentPlayer);

    if (checkWin(currentPlayer)) {
        message.textContent = `${currentPlayer} Cartel Wins!`;
        highlightWinningCells(currentPlayer);
        if (currentPlayer === "Red") redWins++;
        else blueWins++;
        updateStats();
        endGame();
        return;
    }

    if (isDraw()) {
        message.textContent = "It's a Draw!";
        endGame();
        return;
    }

    currentPlayer = currentPlayer === "Red" ? "Blue" : "Red"; // Switch player
    message.textContent = `It's ${currentPlayer}'s turn!`;
    changeBackground();
}

function checkWin(player) {
    return winCombinations.some((combination) => {
        return combination.every((index) => {
            return cells[index].classList.contains(player);
        });
    });
}

function isDraw() {
    return [...cells].every((cell) => cell.textContent !== "");
}

function endGame() {
    cells.forEach((cell) => cell.removeEventListener("click", handleClick));
}

function restartGame() {
    cells.forEach((cell) => {
        cell.textContent = "";
        cell.classList.remove("Red", "Blue", "winning");
        cell.addEventListener("click", handleClick);
    });
    currentPlayer = "Red";
    message.textContent = "The Reds start the game!";
    changeBackground();
}

function highlightWinningCells(player) {
    winCombinations.forEach((combination) => {
        if (combination.every((index) => cells[index].classList.contains(player))) {
            combination.forEach((index) => {
                cells[index].classList.add("winning");
            });
        }
    });
}

function updateStats() {
    redWinsDisplay.textContent = redWins;
    blueWinsDisplay.textContent = blueWins;
}

function changeBackground() {
    document.body.style.background = currentPlayer === "Red"
        ? "linear-gradient(120deg, #c33764, #1d2671)"
        : "linear-gradient(120deg, #1e3c72, #2a5298)";
}

// Initialize the game
cells.forEach((cell) => cell.addEventListener("click", handleClick));
restartGame();
