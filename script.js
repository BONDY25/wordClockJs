// Get elements from UI --------------------------------------------------------------------------------
const timeLabel = document.querySelector('#time');
const dateLabel = document.querySelector('#date');
const weekLabel = document.querySelector('#week');
const secondsBar = document.querySelector('.seconds-bar');
const stopwatchDisplay = document.getElementById('stopwatch');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const settingsBtn = document.getElementById('settings');
const settingsPanel = document.getElementById('settings-panel');
const fontSelect = document.getElementById('font-select');
const themeSelect = document.getElementById('theme-select');
const analogClock = document.getElementById('analog-clock');
const clockModeSelect = document.getElementById('clock-mode-select');

let clockMode = 'none';

// =========================================================================================
// Settings Panel
// =========================================================================================

// Settings Button -----------------------------------------------------------------------
settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
    settingsBtn.parentElement.classList.toggle('open'); // shift button too
});

// Font Select -----------------------------------------------------------------------
fontSelect.addEventListener('change', (e) => {
    document.documentElement.style.setProperty(
        '--defFont',
        `${e.target.value}, sans-serif`
    );
});

// Theme Select -----------------------------------------------------------------------
themeSelect.addEventListener('change', (e) => {
    if (e.target.value === "Light") {
        document.documentElement.style.setProperty("--bgColor", "white");
        document.documentElement.style.setProperty("--fontColor", "black");
        secondsBar.style.background = "Black"
    } else {
        document.documentElement.style.setProperty("--bgColor", "black");
        document.documentElement.style.setProperty("--fontColor", "white");
        secondsBar.style.background = "White"
    }
});

// =========================================================================================
// Stop watch Functions
// =========================================================================================

let startTime = 0;
let timeElapsed = 0;
let timeInterval = null;
let isRunning = false;

// Format Time ---------------------------------------------------------------------------------
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Update Display -------------------------------------------------------------------------------
function updateDisplay() {
    if (timeElapsed === 0) {
        stopwatchDisplay.textContent = "Press Start"
    } else {
        stopwatchDisplay.textContent = formatTime(timeElapsed);
    }
}

// Start Stopwatch -------------------------------------------------------------------------------
function startStopwatch() {
    startTime = Date.now() - timeElapsed;
    timeInterval = setInterval(() => {
        timeElapsed = Date.now() - startTime;
        updateDisplay();
    }, 100);
    isRunning = true;
    startButton.textContent = "Pause";
    resetButton.disabled = false;
}

// Pause Stopwatch -------------------------------------------------------------------------------
function pauseStopwatch() {
    clearInterval(timeInterval);
    isRunning = false;
    startButton.textContent = "Start";
    resetButton.disabled = timeElapsed <= 0;
}

// Reset Stopwatch -------------------------------------------------------------------------------
function resetStopwatch() {
    clearInterval(timeInterval);
    timeElapsed = 0;
    isRunning = false;
    updateDisplay();
    startButton.textContent = "Start";
    resetButton.disabled = true;
}

// Button Handlers -------------------------------------------------------------------------------
startButton.addEventListener('click', () => {
    if (isRunning) {
        pauseStopwatch();
    } else {
        startStopwatch();
    }
});

resetButton.addEventListener('click', () => {
    if (!isRunning || timeElapsed > 0) {
        resetStopwatch();
    }
})

// =========================================================================================
// Analog Clock Functions
// =========================================================================================

// Event Listener for mode change -------------------------------------------------------------------------------
clockModeSelect.addEventListener('change', (e) => {
    clockMode = e.target.value;
    updateClockVisibility();
});

// Update Clock Visibility -------------------------------------------------------------------------------
function updateClockVisibility() {
    analogClock.classList.remove('analog-background', 'analog-solid', 'analog-hidden');
    timeLabel.style.display = 'block';

    if (clockMode === 'background') {
        analogClock.classList.add('analog-background');
    } else if (clockMode === 'solid') {
        analogClock.classList.add('analog-solid');
        timeLabel.style.display = 'none';
    } else {
        analogClock.classList.add('analog-hidden');
    }
}

// Draw Clock -------------------------------------------------------------------------------
function drawAnalogClock() {
    const ctx = analogClock.getContext('2d');
    const radius = analogClock.width / 2;
    ctx.clearRect(0, 0, analogClock.width, analogClock.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(-Math.PI / 2);

    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Clock face
    ctx.lineWidth = 10;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fontColor');
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Hour marks
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.rotate(Math.PI / 6);
        ctx.moveTo(radius - 20, 0);
        ctx.lineTo(radius - 10, 0);
        ctx.stroke();
    }

    // Minute marks
    ctx.lineWidth = 2;
    for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) {
            ctx.beginPath();
            ctx.moveTo(radius - 15, 0);
            ctx.lineTo(radius - 10, 0);
            ctx.stroke();
        }
        ctx.rotate(Math.PI / 30);
    }

    ctx.save();

    // Hour hand
    ctx.rotate((Math.PI / 6) * (hour + minute / 60 + second / 3600));
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(radius * 0.5, 0);
    ctx.stroke();
    ctx.restore();

    // Minute hand
    ctx.save();
    ctx.rotate((Math.PI / 30) * (minute + second / 60));
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(radius * 0.75, 0);
    ctx.stroke();
    ctx.restore();

    // Second hand
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.rotate((Math.PI / 30) * second);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(radius * 0.85, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

function resizeClock() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    analogClock.width = size;
    analogClock.height = size;
}
resizeClock();
window.addEventListener('resize', resizeClock);


// =========================================================================================
// Word Clock Functions
// =========================================================================================

// Convert Time to words --------------------------------------------------------------------------------
function convertTimeToWords(time, mode = 1) {
    const numbersToWords = {
        0: "Twelve", 1: "One", 2: "Two", 3: "Three", 4: "Four",
        5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine",
        10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen",
        14: "Fourteen", 15: "Fifteen", 16: "Sixteen", 17: "Seventeen",
        18: "Eighteen", 19: "Nineteen", 20: "Twenty", 30: "Thirty",
        40: "Forty", 50: "Fifty"
    };

    const numberToWords = (num) => {
        if (numbersToWords[num]) return numbersToWords[num];
        return numbersToWords[Math.floor(num / 10) * 10] + "-" + numbersToWords[num % 10];
    };

    const timePeriod = (hour) => {
        if (hour < 12) return "In The Morning";
        else if (hour < 17) return "In The Afternoon";
        else if (hour < 20) return "In The Evening";
        else return "At Night";
    };

    const hour = time.getHours();
    const minute = time.getMinutes();
    const period = timePeriod(hour);

    let timeString = "";

    // Evaluate how to present the time
    if (mode === 1) {
        const hourIn12 = hour % 12 === 0 ? 12 : hour % 12;
        const nextHourIn12 = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;

        if (minute === 0) {
            timeString = `${numberToWords(hourIn12)} O'Clock ${period}`;
        } else if (minute === 1) {
            timeString = `${numberToWords(minute)} Minute Past ${numberToWords(hourIn12)} ${period}`;
        } else if (minute === 59) {
            timeString = `${numberToWords(60 - minute)} Minute To ${numberToWords(nextHourIn12)} ${period}`;
        } else if (minute === 15) {
            timeString = `Quarter Past ${numberToWords(hourIn12)} ${period}`;
        } else if (minute === 30) {
            timeString = `Half Past ${numberToWords(hourIn12)} ${period}`;
        } else if (minute === 45) {
            timeString = `Quarter To ${numberToWords(nextHourIn12)} ${period}`;
        } else if (minute < 30) {
            timeString = `${numberToWords(minute)} Minutes Past ${numberToWords(hourIn12)} ${period}`;
        } else {
            timeString = `${numberToWords(60 - minute)} Minutes To ${numberToWords(nextHourIn12)} ${period}`;
        }
    }
    return timeString;
}

// Convert Week To Words ---------------------------------------------------------------------------------
function getWeekNumberWords(date = new Date()) {
    const getISOWeekNumber = (date) => {
        const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = tempDate.getUTCDay() || 7;
        tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
        return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    };

    const weekNumber = getISOWeekNumber(date);

    const weekNumbersToWords = {
        1: "First Week", 2: "Second Week", 3: "Third Week", 4: "Fourth Week", 5: "Fifth Week",
        6: "Sixth Week", 7: "Seventh Week", 8: "Eighth Week", 9: "Ninth Week", 10: "Tenth Week",
        11: "Eleventh Week", 12: "Twelfth Week", 13: "Thirteenth Week", 14: "Fourteenth Week",
        15: "Fifteenth Week", 16: "Sixteenth Week", 17: "Seventeenth Week", 18: "Eighteenth Week",
        19: "Nineteenth Week", 20: "Twentieth Week", 21: "Twenty-First Week", 22: "Twenty-Second Week",
        23: "Twenty-Third Week", 24: "Twenty-Fourth Week", 25: "Twenty-Fifth Week", 26: "Twenty-Sixth Week",
        27: "Twenty-Seventh Week", 28: "Twenty-Eighth Week", 29: "Twenty-Ninth Week", 30: "Thirtieth Week",
        31: "Thirty-First Week", 32: "Thirty-Second Week", 33: "Thirty-Third Week", 34: "Thirty-Fourth Week",
        35: "Thirty-Fifth Week", 36: "Thirty-Sixth Week", 37: "Thirty-Seventh Week", 38: "Thirty-Eighth Week",
        39: "Thirty-Ninth Week", 40: "Fortieth Week", 41: "Forty-First Week", 42: "Forty-Second Week",
        43: "Forty-Third Week", 44: "Forty-Fourth Week", 45: "Forty-Fifth Week", 46: "Forty-Sixth Week",
        47: "Forty-Seventh Week", 48: "Forty-Eighth Week", 49: "Forty-Ninth Week", 50: "Fiftieth Week",
        51: "Fifty-First Week", 52: "Fifty-Second Week", 53: "Fifty-Third Week"
    };

    return weekNumbersToWords[weekNumber] || "Unknown Week";
}

// Convert date to words ---------------------------------------------------------------------------------
function convertDateToWords(date) {
    const numbersToWords = {
        1: "First", 2: "Second", 3: "Third", 4: "Fourth", 5: "Fifth",
        6: "Sixth", 7: "Seventh", 8: "Eighth", 9: "Ninth", 10: "Tenth",
        11: "Eleventh", 12: "Twelfth", 13: "Thirteenth", 14: "Fourteenth", 15: "Fifteenth",
        16: "Sixteenth", 17: "Seventeenth", 18: "Eighteenth", 19: "Nineteenth", 20: "Twentieth",
        21: "Twenty-First", 22: "Twenty-Second", 23: "Twenty-Third", 24: "Twenty-Fourth", 25: "Twenty-Fifth",
        26: "Twenty-Sixth", 27: "Twenty-Seventh", 28: "Twenty-Eighth", 29: "Twenty-Ninth", 30: "Thirtieth",
        31: "Thirty-First"
    };
    const dayName = date.toLocaleDateString("en-GB", {weekday: "long"});
    const dayNumberWord = numbersToWords[date.getDate()];
    const monthName = date.toLocaleDateString("en-GB", {month: "long"});
    const year = date.toLocaleDateString("en-GB", {year: "numeric"});

    return `${dayName} The ${dayNumberWord} of ${monthName}, ${year}`;

}

// Update Clock -----------------------------------------------------------------
function updateClock() {

    if (clockMode !== 'none') {
        drawAnalogClock();
    }
    const now = new Date();
    const seconds = now.getSeconds();
    const percent = (seconds / 60) * 100;
    const newTime = convertTimeToWords(now);
    if (timeLabel.innerText !== newTime) {
        fadeLabelText(timeLabel, newTime);
    }
    const newDate = convertDateToWords(now);
    if (dateLabel.innerText !== newDate) {
        fadeLabelText(dateLabel, newDate);
    }
    const newWeek = getWeekNumberWords(now)
    if (weekLabel.innerText !== newWeek) {
        fadeLabelText(weekLabel, newWeek);
    }
    secondsBar.style.width = `${percent}%`;
}

// Label Fade Effect ------------------------------------------------------------------
function fadeLabelText(element, newText, duration = 1000) {
    // Ensure fade class is present
    element.classList.add('fade');

    // Start fade-out
    element.classList.add('fade-out');

    setTimeout(() => {
        element.innerText = newText;

        // Fade back in
        requestAnimationFrame(() => {
            element.classList.remove('fade-out');
        });

    }, duration);
}

// Do the things with the stuff ------------------------------------------------------------
updateClock();
// Then update every half second
setInterval(updateClock, 500);
