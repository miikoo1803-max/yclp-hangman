let answer = "";
let guessedLetters = new Set();
let wrongGuesses = [];
let wrongLimit = 6;
let gameOver = false;

function loadGameFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const encodedGame = params.get("game");

    if (encodedGame) {
        try {
            const decoded = JSON.parse(atob(encodedGame));

            document.getElementById("wordInput").value = decoded.word || "";
            document.getElementById("revealedInput").value = decoded.revealed || "";
            document.getElementById("wrongLimitInput").value = decoded.limit || 6;

            startGame();
        } catch (error) {
            console.error("Invalid game link");
        }
    }
}

function generateShareLink() {
    const word = document.getElementById("wordInput").value.trim();
    const revealed = document.getElementById("revealedInput").value.trim();
    const limit = document.getElementById("wrongLimitInput").value || 6;

    if (!word) {
        alert("Please enter a word before generating a link.");
        return;
    }

    // Compact format: word|revealed|limit
    const compactData = `${word}|${revealed}|${limit}`;

    // Encode
    const encodedGame = btoa(compactData);

    // Generate link
    const link =
        `${window.location.origin}${window.location.pathname}?game=${encodedGame}`;

    // Display link
    const shareLinkBox = document.getElementById("shareLinkBox");

    shareLinkBox.innerHTML =
        `Share this link:<br><input value="${link}" readonly onclick="this.select()">`;
}

function startGame() {
    answer = document.getElementById("wordInput").value.trim().toUpperCase();
    const revealed = document.getElementById("revealedInput").value.toUpperCase().replace(/[^A-Z]/g, "");
    wrongLimit = parseInt(document.getElementById("wrongLimitInput").value) || 6;

    if (wrongLimit > 10) wrongLimit = 10;
    if (wrongLimit < 1) wrongLimit = 1;

    if (!answer) {
    alert("Please enter a word or phrase.");
    return;
    }

    guessedLetters = new Set(revealed.split(""));
    wrongGuesses = [];
    gameOver = false;

    document.getElementById("setupArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";

    hideAllBodyParts();
    updateHangmanDrawing();
    document.getElementById("hangmanPerson").classList.remove("game-over");
    document.getElementById("gameOverBanner").classList.remove("show");
    document.getElementById("correctBanner").classList.remove("show");
    document.getElementById("wordDisplay").classList.remove("correct-flash");
    createKeyboard();
    updateDisplay();
}

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";

    const rows = [
    "ABCDEFGHIJ",
    "KLMNOPQRST",
    "UVWXYZ"
    ];

    rows.forEach((rowLetters, index) => {
    const row = document.createElement("div");
    row.className = `keyboard-row ${index < 2 ? "row-10" : "row-6"}`;

    for (const letter of rowLetters) {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.onclick = () => guessLetter(letter, btn);

        if (guessedLetters.has(letter)) {
        btn.disabled = true;
        }

        row.appendChild(btn);
    }

    keyboard.appendChild(row);
    });
}

function guessLetter(letter, btn) {
    if (gameOver) return;
    if (guessedLetters.has(letter)) return;

    guessedLetters.add(letter);

    if (btn) {
    btn.disabled = true;
    } else {
    const matchingButton = [...document.querySelectorAll("#keyboard button")]
        .find(button => button.textContent === letter);
    if (matchingButton) matchingButton.disabled = true;
    }

    if (!answer.includes(letter)) {
    wrongGuesses.push(letter);
    updateHangmanDrawing();
    }

    updateDisplay();
    checkGameStatus();
}

function handleKeyPress(event) {
    const letter = event.key.toUpperCase();
    const isLetter = /^[A-Z]$/.test(letter);

    if (!isLetter) return;
    if (document.getElementById("gameArea").style.display !== "block") return;
    if (gameOver) return;

    guessLetter(letter, null);
}

function playCorrectAnimation() {
    const wordDisplay = document.getElementById("wordDisplay");
    const correctBanner = document.getElementById("correctBanner");

    wordDisplay.classList.remove("correct-flash");
    correctBanner.classList.remove("show");

    void wordDisplay.offsetWidth;

    wordDisplay.classList.add("correct-flash");
    correctBanner.classList.add("show");

    setTimeout(() => {
    correctBanner.classList.remove("show");
    }, 1800);
}

function updateDisplay() {
    let display = "";

    for (const char of answer) {
    if (char === " ") {
        display += " / ";
    } else if (!/[A-Z]/.test(char)) {
        display += char;
    } else if (guessedLetters.has(char)) {
        display += char;
    } else {
        display += "_";
    }
    }

    document.getElementById("wordDisplay").textContent = display;
    document.getElementById("wrongGuesses").textContent =
    `Wrong guesses: ${wrongGuesses.join(", ") || "None"}`;
}

function updateHangmanDrawing() {
    hideAllBodyParts();

    if (wrongLimit <= 6) {
    // Always show full gallows for classic mode
    for (let i = 0; i < 4; i++) {
        const gallowsPart = document.getElementById(`part${i}`);
        if (gallowsPart) gallowsPart.style.display = "block";
    }

    // Draw only body parts based on wrong guesses
    for (let i = 0; i < wrongGuesses.length; i++) {
        const bodyPart = document.getElementById(`part${i + 4}`);
        if (bodyPart) bodyPart.style.display = "block";
    }
    } else {
    // Full progressive mode: gallows then body
    for (let i = 0; i < wrongGuesses.length; i++) {
        const part = document.getElementById(`part${i}`);
        if (part) part.style.display = "block";
    }
    }
}

function hideAllBodyParts() {
    for (let i = 0; i < 10; i++) {
    const part = document.getElementById(`part${i}`);
    if (part) part.style.display = "none";
    }
}

function checkGameStatus() {
    const allGuessed = answer.split("").every(char => {
    return char === " " || !/[A-Z]/.test(char) || guessedLetters.has(char);
    });

    const status = document.getElementById("status");

    if (allGuessed) {
    status.textContent = "🎉 Correct! You solved the word!";
    playCorrectAnimation();
    gameOver = true;
    disableKeyboard();
    } else if (wrongGuesses.length >= wrongLimit) {
    status.textContent = `The answer was ${answer}.`;
    document.getElementById("hangmanPerson").classList.add("game-over");
    document.getElementById("gameOverBanner").classList.add("show");
    gameOver = true;
    disableKeyboard();
    } else {
    status.textContent = "";
    }
}

function disableKeyboard() {
    document.querySelectorAll("#keyboard button").forEach(btn => btn.disabled = true);
}

function resetGame() {
    document.getElementById("setupArea").style.display = "block";
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("status").textContent = "";
    document.getElementById("hangmanPerson").classList.remove("game-over");
    document.getElementById("gameOverBanner").classList.remove("show");
    document.getElementById("correctBanner").classList.remove("show");
    hideAllBodyParts();
}


document.addEventListener("keydown", handleKeyPress);
window.addEventListener("load", loadGameFromUrl);
