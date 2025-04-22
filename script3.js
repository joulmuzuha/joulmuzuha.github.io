const cells = document.querySelectorAll("[data-cell]");
const message = document.getElementById("message");
const redWinsDisplay = document.getElementById("redWins");
const blueWinsDisplay = document.getElementById("blueWins");
const aiWinsDisplay = document.getElementById("aiWins");
const playerWinsDisplay = document.getElementById("playerWins");
const toggleModeBtn = document.getElementById("toggleMode");
const restartBtn = document.getElementById("restart");
const difficultySelect = document.getElementById("aiDifficulty");

// Game mode: "PvP" or "AI". In AI mode, aiEnabled is true.
let gameMode = "PvP";
let aiEnabled = false;

// Player symbols in PvP mode are "🔥" and "💎".
// In AI mode, the AI picks one symbol and the human gets the other.
let currentPlayer = null;
let aiCartel = null;
let playerCartel = null;

let gameActive = true;
let aiThinking = false;

let aiWins = 0;
let playerWins = 0;
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
  [2, 4, 6]
];

function handleClick(e) {
  if (!gameActive) return;
  // In AI mode, block clicks while AI is thinking or if it’s not the human's turn.
  if (aiEnabled && aiThinking) return;
  if (aiEnabled && currentPlayer === aiCartel) return;

  const cell = e.target;
  if (cell.textContent !== "") return;

  // Place the symbol for the current player
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer);

  // Check for win
  if (checkWin(currentPlayer)) {
    message.textContent = `${currentPlayer} wins!`;
    highlightWinningCells(currentPlayer);
    updateScore(currentPlayer);
    gameActive = false;
    return;
  }
  if (isDraw()) {
    message.textContent = "It's a Draw!";
    gameActive = false;
    return;
  }

  // Switch turns
  if (!aiEnabled) {
    // PvP mode: alternate between "🔥" and "💎"
    currentPlayer = currentPlayer === "🔥" ? "💎" : "🔥";
    message.textContent = `${currentPlayer}'s turn`;
  } else {
    // In AI mode, after the human moves, switch turn to AI.
    currentPlayer = aiCartel;
    message.textContent = `AI's turn (${aiCartel})`;
    aiThinking = true;
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  // Get current AI difficulty level from select
  let diff = difficultySelect.value;
  
  if (diff === "easy") {
    // Easy: choose a random move.
    const emptyCells = [...cells].filter(cell => cell.textContent === "");
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      randomCell.textContent = aiCartel;
      randomCell.classList.add(aiCartel);
      finalizeAIMove();
      return;
    }
  } else if (diff === "medium") {
    // Medium: Simple strategy – try to win, block, then take center if available,
    // else make a random move.
    const emptyCells = [...cells].filter(cell => cell.textContent === "");
    // 1. Try to win.
    for (let combination of winCombinations) {
      let countAI = combination.filter(idx => cells[idx].textContent === aiCartel).length;
      let emptyIdx = combination.find(idx => cells[idx].textContent === "");
      if (countAI === 2 && emptyIdx !== undefined) {
        cells[emptyIdx].textContent = aiCartel;
        cells[emptyIdx].classList.add(aiCartel);
        finalizeAIMove();
        return;
      }
    }
    // 2. Block player.
    for (let combination of winCombinations) {
      let countPlayer = combination.filter(idx => cells[idx].textContent === playerCartel).length;
      let emptyIdx = combination.find(idx => cells[idx].textContent === "");
      if (countPlayer === 2 && emptyIdx !== undefined) {
        cells[emptyIdx].textContent = aiCartel;
        cells[emptyIdx].classList.add(aiCartel);
        finalizeAIMove();
        return;
      }
    }
    // 3. Take center if available.
    if (cells[4].textContent === "") {
      cells[4].textContent = aiCartel;
      cells[4].classList.add(aiCartel);
      finalizeAIMove();
      return;
    }
    // 4. Otherwise, pick a random move.
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      randomCell.textContent = aiCartel;
      randomCell.classList.add(aiCartel);
      finalizeAIMove();
      return;
    }
  } else if (diff === "hard") {
    // Hard: Use the minimax algorithm for optimal play.
    let board = getBoardState();
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = aiCartel;
        let score = minimax(board, 0, false);
        board[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    if (move !== -1) {
      cells[move].textContent = aiCartel;
      cells[move].classList.add(aiCartel);
    }
    finalizeAIMove();
  }
}

function finalizeAIMove() {
  if (checkWin(aiCartel)) {
    message.textContent = `AI wins! (${aiCartel})`;
    highlightWinningCells(aiCartel);
    updateScore(aiCartel);
    gameActive = false;
    aiThinking = false;
    return;
  }
  if (isDraw()) {
    message.textContent = "It's a Draw!";
    gameActive = false;
    aiThinking = false;
    return;
  }
  // Switch back to player's turn.
  currentPlayer = playerCartel;
  message.textContent = `Your turn (${playerCartel})`;
  aiThinking = false;
}

function checkWin(player) {
  return winCombinations.some(combination =>
    combination.every(idx => cells[idx].textContent === player)
  );
}

function isDraw() {
  return [...cells].every(cell => cell.textContent !== "");
}

function highlightWinningCells(player) {
  winCombinations.forEach(combination => {
    if (combination.every(idx => cells[idx].textContent === player)) {
      combination.forEach(idx => cells[idx].classList.add("winning"));
    }
  });
}

function updateScore(winner) {
  if (aiEnabled) {
    // AI vs. Player scores.
    if (winner === aiCartel) {
      aiWins++;
    } else if (winner === playerCartel) {
      playerWins++;
    }
  } else {
    // PvP mode: update based on symbol.
    if (winner === "🔥") redWins++;
    else if (winner === "💎") blueWins++;
  }
  redWinsDisplay.textContent = redWins;
  blueWinsDisplay.textContent = blueWins;
  aiWinsDisplay.textContent = aiWins;
  playerWinsDisplay.textContent = playerWins;
}

function restartGame() {
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("🔥", "💎", "winning");
  });
  gameActive = true;
  aiThinking = false;
  if (aiEnabled) {
    currentPlayer = playerCartel;
    message.textContent = `Your turn (${playerCartel})`;
  } else {
    currentPlayer = "🔥";
    message.textContent = `${currentPlayer}'s turn`;
  }
}

function toggleMode() {
  // Toggle between PvP mode and AI mode.
  if (gameMode === "PvP") {
    gameMode = "AI";
    aiEnabled = true;
    // Randomly assign AI's symbol.
    const choices = ["🔥", "💎"];
    aiCartel = choices[Math.floor(Math.random() * 2)];
    playerCartel = aiCartel === "🔥" ? "💎" : "🔥";
    message.textContent = `AI mode enabled. AI is ${aiCartel} and you are ${playerCartel}. Your turn (${playerCartel}).`;
    currentPlayer = playerCartel;
    toggleModeBtn.textContent = "Toggle Mode (Current: AI)";
  } else {
    gameMode = "PvP";
    aiEnabled = false;
    aiCartel = null;
    playerCartel = null;
    message.textContent = "Player vs Player mode enabled. 🔥 starts.";
    currentPlayer = "🔥";
    toggleModeBtn.textContent = "Toggle Mode (Current: PvP)";
  }
  restartGame();
}

// Helper functions for minimax (used in Hard difficulty)

function getBoardState() {
  const board = [];
  cells.forEach(cell => {
    board.push(cell.textContent);
  });
  return board;
}

function winningBoard(board, symbol) {
  return winCombinations.some(combination =>
    combination.every(idx => board[idx] === symbol)
  );
}

function isDrawBoard(board) {
  return board.every(cell => cell !== "");
}

function minimax(board, depth, isMaximizing) {
  if (winningBoard(board, aiCartel)) return 10 - depth;
  if (winningBoard(board, playerCartel)) return depth - 10;
  if (isDrawBoard(board)) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = aiCartel;
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = playerCartel;
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

toggleModeBtn.addEventListener("click", toggleMode);
restartBtn.addEventListener("click", restartGame);
cells.forEach(cell => cell.addEventListener("click", handleClick));

// Start the game in PvP mode by default.
restartGame();
