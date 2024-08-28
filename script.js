// Interval setup
const intervals = [
    { start: "09:00", end: "11:00", subject: "Polity" },
    { start: "11:00", end: "13:00", subject: "Science and Tech" },
    { start: "13:00", end: "15:00", subject: "Geography" },
    { start: "15:00", end: "17:00", subject: "Economics" },
    { start: "17:00", end: "19:00", subject: "History" }
];

let currentInterval = null;
let timerInterval;
let breakTimerInterval;

// Helper function to format time in "Minute:Second" manner
function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

// Save data to local storage
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Load data from local storage
function loadFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

// Update Schedule and Timer
function updateScheduleAndTimer() {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

    currentInterval = intervals.find(interval => {
        const startMinutes = parseInt(interval.start.split(':')[0]) * 60 + parseInt(interval.start.split(':')[1]);
        const endMinutes = parseInt(interval.end.split(':')[0]) * 60 + parseInt(interval.end.split(':')[1]);
        return minutesSinceMidnight >= startMinutes && minutesSinceMidnight < endMinutes;
    });

    if (currentInterval) {
        document.getElementById("current-subject").innerText = currentInterval.subject;
        const intervalEndMinutes = parseInt(currentInterval.end.split(':')[0]) * 60 + parseInt(currentInterval.end.split(':')[1]);
        let timeLeft = (intervalEndMinutes - minutesSinceMidnight) * 60;

        // Start the countdown timer
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                document.getElementById("timer").innerText = formatTime(timeLeft);
            } else {
                clearInterval(timerInterval);
                document.getElementById("timer").innerText = "00:00";
                showBreakNotification();
            }
        }, 1000);

    } else {
        document.getElementById("current-subject").innerText = "Not Study Interval";
        document.getElementById("timer").innerText = "";
        clearInterval(timerInterval);
    }
}

// Break Timer Setup
function showBreakNotification() {
    document.getElementById("break-notification").style.display = "block";
    clearInterval(breakTimerInterval);
}

document.getElementById("break-ok-button").addEventListener("click", function () {
    document.getElementById("break-notification").style.display = "none";
    startBreakTimer(5);
    showMoodNotification();
});

function startBreakTimer(durationMinutes) {
    let time = durationMinutes * 60;
    clearInterval(breakTimerInterval);
    document.getElementById("break-timer").innerText = "Break Left: " + formatTime(time);
    breakTimerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            document.getElementById("break-timer").innerText = "Break Left: " + formatTime(time);
        } else {
            clearInterval(breakTimerInterval);
            startStudyTimer(25);
        }
    }, 1000);
}

function startStudyTimer(durationMinutes) {
    let time = durationMinutes * 60;
    document.getElementById("break-timer").innerText = "Next Break: " + formatTime(time);
    breakTimerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            document.getElementById("break-timer").innerText = "Next Break: " + formatTime(time);
        } else {
            clearInterval(breakTimerInterval);
            showBreakNotification();
        }
    }, 1000);
}

// Mood Tracker
let moodData = loadFromLocalStorage("moodData") || {
    "Motivated": 0,
    "Depressed": 0,
    "Creative": 0,
    "Lazy": 0,
    "Bored": 0,
    totalClicks: 0
};

function showMoodNotification() {
    document.getElementById("mood-notification").style.display = "block";
}

document.querySelectorAll(".mood-button").forEach(button => {
    button.addEventListener("click", function () {
        const mood = this.getAttribute("data-mood");
        moodData[mood]++;
        moodData.totalClicks++;
        saveToLocalStorage("moodData", moodData);
        updateMoodPercentages();
        document.getElementById("mood-notification").style.display = "none";
    });
});

function updateMoodPercentages() {
    for (let mood in moodData) {
        if (mood !== "totalClicks") {
            const percentage = ((moodData[mood] / moodData.totalClicks) * 100).toFixed(2) + "%";
            document.getElementById(mood.toLowerCase() + "-percent").innerText = percentage;
        }
    }
}

updateMoodPercentages();

// Pages Read and Bookmark Recording
document.getElementById("ok-button").addEventListener("click", function () {
    const pagesRead = parseInt(document.getElementById("pages-read").value);
    const bookmark = parseInt(document.getElementById("bookmark").value);

    if (currentInterval && !isNaN(pagesRead) && !isNaN(bookmark)) {
        const subject = currentInterval.subject;
        let totalPages = loadFromLocalStorage(`${subject.toLowerCase()}-pages`) || 0;
        totalPages += pagesRead;

        saveToLocalStorage(`${subject.toLowerCase()}-pages`, totalPages);
        saveToLocalStorage(`${subject.toLowerCase()}-bookmark`, bookmark);

        document.getElementById(`${subject.toLowerCase()}-pages`).innerText = totalPages;
        document.getElementById(`${subject.toLowerCase()}-bookmark`).innerText = bookmark;

        // Update total pages read today
        let totalPagesToday = loadFromLocalStorage("totalPagesToday") || 0;
        totalPagesToday += pagesRead;
        saveToLocalStorage("totalPagesToday", totalPagesToday);
        document.getElementById("total-pages-today").innerText = totalPagesToday;
    }

    // Hide input fields
    document.getElementById("input-fields").style.display = "none";
});

function loadSavedData() {
    intervals.forEach(interval => {
        const subject = interval.subject.toLowerCase();
        const pages = loadFromLocalStorage(`${subject}-pages`);
        const bookmark = loadFromLocalStorage(`${subject}-bookmark`);

        if (pages !== null) document.getElementById(`${subject}-pages`).innerText = pages;
        if (bookmark !== null) document.getElementById(`${subject}-bookmark`).innerText = bookmark;
    });

    const totalPagesToday = loadFromLocalStorage("totalPagesToday");
    if (totalPagesToday !== null) {
        document.getElementById("total-pages-today").innerText = totalPagesToday;
    }
}

// Initialize
loadSavedData();
updateScheduleAndTimer();
setInterval(updateScheduleAndTimer, 60000);  // Update every minute
