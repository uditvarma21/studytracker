// JavaScript Code

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

// Helper function to format time
function formatTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
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
        const timeLeft = intervalEndMinutes - minutesSinceMidnight;
        document.getElementById("timer").innerText = formatTime(timeLeft);

        // Start the countdown timer
        clearInterval(timerInterval);
        clearInterval(breakTimerInterval); // Clear any existing break timer
        timerInterval = setInterval(() => {
            const now = new Date();
            const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
            const timeLeft = intervalEndMinutes - minutesSinceMidnight;

            if (timeLeft > 0) {
                document.getElementById("timer").innerText = formatTime(timeLeft);
            } else {
                clearInterval(timerInterval);
                document.getElementById("timer").innerText = "00:00";
                showBreakNotification();
            }
        }, 1000);

    } else {
        // Not a study interval
        document.getElementById("current-subject").innerText = "Not Study Interval";
        document.getElementById("timer").innerText = "";
        clearInterval(timerInterval);
        clearInterval(breakTimerInterval); // Clear any existing break timer
        document.getElementById("break-timer").innerText = "";
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
    document.getElementById("break-timer").innerText = "Break Left: " + formatTime(time / 60);
    breakTimerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            document.getElementById("break-timer").innerText = "Break Left: " + formatTime(Math.floor(time / 60)) + ":" + String(time % 60).padStart(2, '0');
        } else {
            clearInterval(breakTimerInterval);
            document.getElementById("break-timer").innerText = "Next Break: 25:00";
            startStudyTimer(25);
        }
    }, 1000);
}

// Study Timer Setup
function startStudyTimer(durationMinutes) {
    let time = durationMinutes * 60;
    clearInterval(breakTimerInterval);
    document.getElementById("break-timer").innerText = "Next Break: " + formatTime(durationMinutes);

    breakTimerInterval = setInterval(() => {
        if (time > 0) {
            time--;
            document.getElementById("break-timer").innerText = "Next Break: " + formatTime(Math.floor(time / 60)) + ":" + String(time % 60).padStart(2, '0');
        } else {
            clearInterval(breakTimerInterval);
            showBreakNotification();
        }
    }, 1000);
}

// Mood Tracker
let moodData = {
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

// Pages Read and Bookmark Recording
document.getElementById("ok-button").addEventListener("click", function () {
    const pagesRead = parseInt(document.getElementById("pages-read").value);
    const bookmark = parseInt(document.getElementById("bookmark").value);

    const subject = currentInterval ? currentInterval.subject : "None";

    if (!isNaN(pagesRead) && !isNaN(bookmark) && subject !== "None") {
        const subjectPagesElement = document.getElementById(subject.toLowerCase() + "-pages");
        const subjectBookmarkElement = document.getElementById(subject.toLowerCase() + "-bookmark");

        let totalPages = parseInt(subjectPagesElement.innerText) || 0;
        totalPages += pagesRead;
        subjectPagesElement.innerText = totalPages;
        subjectBookmarkElement.innerText = bookmark;

        // Update total pages read today
        const totalPagesTodayElement = document.getElementById("total-pages-today");
        let totalToday = parseInt(totalPagesTodayElement.innerText) || 0;
        totalToday += pagesRead;
        totalPagesTodayElement.innerText = totalToday;
    }

    // Hide input fields
    document.getElementById("input-fields").style.display = "none";
});

// Food Tracker Functionality
function saveFoodData() {
    const morningFood = document.getElementById("morning-food").value || "Nothing";
    const afternoonFood = document.getElementById("afternoon-food").value || "Nothing";
    const eveningFood = document.getElementById("evening-food").value || "Nothing";

    localStorage.setItem("morningFood", morningFood);
    localStorage.setItem("afternoonFood", afternoonFood);
    localStorage.setItem("eveningFood", eveningFood);
}

function loadFoodData() {
    document.getElementById("morning-food").value = localStorage.getItem("morningFood") || "";
    document.getElementById("afternoon-food").value = localStorage.getItem("afternoonFood") || "";
    document.getElementById("evening-food").value = localStorage.getItem("eveningFood") || "";
}

function clearFoodDataAtMidnight() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set to next midnight

    const timeUntilMidnight = midnight - now;
    setTimeout(() => {
        localStorage.removeItem("morningFood");
        localStorage.removeItem("afternoonFood");
        localStorage.removeItem("eveningFood");

        loadFoodData(); // Refresh inputs
        clearFoodDataAtMidnight(); // Schedule for next day
    }, timeUntilMidnight);
}

document.getElementById("morning-food").addEventListener("input", saveFoodData);
document.getElementById("afternoon-food").addEventListener("input", saveFoodData);
document.getElementById("evening-food").addEventListener("input", saveFoodData);

// Initialize
updateScheduleAndTimer();
setInterval(updateScheduleAndTimer, 60000); // Update every minute
loadFoodData(); // Load food tracker data
clearFoodDataAtMidnight(); // Schedule food data clearing at midnight
