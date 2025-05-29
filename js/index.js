// DOM Elements
const timerText = document.querySelector(".init_time");
const accuracyText = document.querySelector(".init_accuracy");
const errorText = document.querySelector(".init_errors");
const wordsText = document.querySelector(".init_wpm");
const contentText = document.querySelector(".content");
const restartBtn = document.querySelector(".restart");
const contentWrapper = document.querySelector(".content-wrapper");
const keyboard = document.querySelector(".keyboard");
const timerElement = document.querySelector(".timer");

// State
let userInput = "";
let isContentActive = false;
let timeLeft = 30;
let timePassed = 0;
let totalErrors = 0;
let currentContent = "";
let timer = null;
let isTimerRunning = false;
let textsArray = [];
const TEXTS_JSON_PATH = "json/texts.json";

// Initialize
async function init() {
  textsArray = await loadTexts();
  currentContent = getRandomText();
  
  hideElements();
  
  contentText.innerHTML = currentContent
    .split("")
    .map(c => `<span>${c}</span>`)
    .join("");

  contentWrapper.addEventListener("click", activateContent);
}

// Helper functions
function hideElements() {
  document.querySelectorAll(".wpm, .errors, .accuracy").forEach(el => {
    el.style.display = "none";
  });
  restartBtn.style.display = "none";
}

function showElements() {
  document.querySelectorAll(".wpm, .errors, .accuracy").forEach(el => {
    el.style.display = "block";
  });
  restartBtn.style.display = "block";
}

async function loadTexts() {
  try {
    const response = await fetch(TEXTS_JSON_PATH);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    if (!data.texts || !Array.isArray(data.texts)) {
      throw new Error("Invalid JSON structure");
    }
    
    return data.texts;
  } catch (error) {
    console.error("Ошибка загрузки текстов:", error);
    return ["дверь радость камень музыка луна бумага часы снег кофе тень ветер книга яблоко мост шум окно река смех соль звезда дождь песок ключ огонь город тишина хлеб сон трава кот цифра зонт лужа парта шарф вино перо море диван"];
  }
}

function getRandomText() {
  return textsArray[Math.floor(Math.random() * textsArray.length)];
}

function activateContent() {
  if (!isContentActive) {
    isContentActive = true;
    contentText.classList.add("active");
    contentText.focus();
    
    if (!isTimerRunning && timeLeft > 0) {
      startTimer();
    }
    
    highlightNextKey();
  }
}

function highlightNextKey() {
  const nextChar = currentContent[userInput.length];
  const keys = document.querySelectorAll(".keyboard-key");
  
  keys.forEach(k => k.classList.remove("active"));
  if (!nextChar) return;
  
  keys.forEach(k => {
    const dataChar = k.getAttribute("data-char");
    if (dataChar === nextChar.toLowerCase() || 
        (nextChar === " " && dataChar === " ")) {
      k.classList.add("active");
    }
  });
}

// Event handlers
window.addEventListener("keydown", handleKeyDown);

function handleKeyDown(e) {
  if (!isContentActive) return;
  if (!isTimerRunning && timeLeft > 0) startTimer();
  
  const key = e.key;
  if (["Shift", "Control", "Alt"].includes(key)) return;
  
  if (key === "Backspace" && userInput.length > 0) {
    userInput = userInput.slice(0, -1);
    updateDisplay();
    highlightNextKey();
    return;
  }
  
  if (key.length === 1) {
    const expectedChar = currentContent[userInput.length];
    if (key !== expectedChar) totalErrors++;
    
    userInput += key;
    updateDisplay();
    highlightNextKey();
  }
}

function startTimer() {
  isTimerRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    timePassed++;
    timerText.textContent = timeLeft;
    
    if (timeLeft <= 0) finishTest();
  }, 1000);
}

function updateDisplay() {
  const spans = contentText.querySelectorAll("span");
  
  spans.forEach((span, i) => {
    span.classList.remove("correct", "incorrect");
    if (i >= userInput.length) return;
    
    if (userInput[i] === span.textContent) {
      span.classList.add("correct");
    } else {
      span.classList.add("incorrect");
    }
  });
  
  highlightNextKey();
}

function calculateStats() {
  const minutes = timePassed > 0 ? timePassed / 60 : 0.01;
  const wpm = Math.round(userInput.length / 5 / minutes);
  
  wordsText.textContent = isNaN(wpm) ? 0 : wpm;
  errorText.textContent = totalErrors;
  
  const accuracy = userInput.length > 0
    ? Math.round(((userInput.length - totalErrors) / userInput.length) * 100)
    : 100;
    
  accuracyText.textContent = accuracy + "%";
}

function finishTest() {
  clearInterval(timer);
  isTimerRunning = false;
  
  showElements();
  calculateStats();
  
  // Hide elements
  contentWrapper.style.display = "none";
  keyboard.style.display = "none";
  timerElement.style.display = "none";
}

// Restart handler
restartBtn.addEventListener("click", restartGame);

async function restartGame() {
  userInput = "";
  timeLeft = 30;
  timePassed = 0;
  totalErrors = 0;
  isTimerRunning = false;
  isContentActive = false;
  
  // Reset UI
  contentWrapper.style.display = "block";
  keyboard.style.display = "block";
  timerElement.style.display = "block";
  hideElements();
  
  contentText.classList.remove("active");
  contentText.innerHTML = "";
  
  await init();
  timerText.textContent = timeLeft;
}

// Start
init();
