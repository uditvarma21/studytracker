// Define study intervals and subjects
const intervals = [
    { start: "11:30", end: "13:30" },
    { start: "14:30", end: "16:30" },
    { start: "17:30", end: "19:30" },
    { start: "21:00", end: "23:00" }
];
const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];
const breakInterval = 25 * 60; // 25 minutes in seconds
const breakDuration = 5 * 60; // 5 minutes in seconds
let currentSubject = '';
let moodCounts = { Motivated: 0, Depressed: 0, Creative: 0, Lazy: 0, Bored: 0 };
let totalMoodClicks = 0;
let breakTimerId, intervalTimerId;

// Randomize subjects for each interval
function getRandomSubject() {
    return subjects[Math.floor(Math.random() * subjects.length)];
}

// Convert time string to minutes since midnight
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Get the next interval
function getNextInterval() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const interval of intervals) {
        const startTime = timeToMinutes(interval.start);
        if (currentTime < startTime) {
            return interval;
        }
    }
    // If no interval is in the future, return the first interval of the next day
    return intervals[0];
}

// Update the interval display
function updateInterval() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentInterval = intervals.find(interval => {
        const startTime = timeToMinutes(interval.start);
        const endTime = timeToMinutes(interval.end);
        return currentTime >= startTime && currentTime <= endTime;
    });

    if (currentInterval) {
        currentSubject = getRandomSubject();
        document.getElementById('current-subject').textContent = currentSubject;
        document.getElementById('interval-time').textContent = `${currentInterval.start} - ${currentInterval.end}`;
        startIntervalTimer(currentInterval);
    } else {
        const nextInterval = getNextInterval();
        document.getElementById('current-subject').textContent = "No current study session";
        document.getElementById('interval-time').textContent = `Next Interval: ${nextInterval.start} - ${nextInterval.end}`;
        document.getElementById('timer').textContent = "00:00";
        clearInterval(intervalTimerId);
        document.getElementById('input-fields').style.display = 'none';
    }
}

// Start interval timer
function startIntervalTimer(interval) {
    const [startHours, startMinutes] = interval.start.split(':').map(Number);
    const [endHours, endMinutes] = interval.end.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(startHours, startMinutes, 0, 0);
    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, 0, 0);
    const duration = (endTime - startTime) / 1000; // Duration in seconds

    let timer = duration;
    clearInterval(intervalTimerId);
    intervalTimerId = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = Math.floor(timer % 60);
        document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timer <= 0) {
            clearInterval(intervalTimerId);
            document.getElementById('input-fields').style.display = 'block';
            document.getElementById('break-notification').style.display = 'none';
        } else {
            timer--;
        }
    }, 1000);
}

// Handle OK button click
document.getElementById('ok-button').addEventListener('click', () => {
    const pagesRead = Number(document.getElementById('pages-read').value);
    const bookmark = Number(document.getElementById('bookmark').value);
    updateStudyProgress(currentSubject, pagesRead, bookmark);
    document.getElementById('input-fields').style.display = 'none';
    startBreakManager();
});

// Update study progress
function updateStudyProgress(subject, pagesRead, bookmark) {
    const pagesId = `${subject.toLowerCase().replace(/ /g, '-')}-pages`;
    const bookmarkId = `${subject.toLowerCase().replace(/ /g, '-')}-bookmark`;
    const pagesElem = document.getElementById(pagesId);
    const bookmarkElem = document.getElementById(bookmarkId);

    const currentPages = Number(pagesElem.textContent) || 0;
    const currentBookmark = Number(bookmarkElem.textContent) || 0;

    pagesElem.textContent = currentPages + pagesRead;
    bookmarkElem.textContent = bookmark;
}

// Start break manager
function startBreakManager() {
    let timer = breakInterval;
    clearInterval(breakTimerId);
    breakTimerId = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = Math.floor(timer % 60);
        document.getElementById('break-time').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timer <= 0) {
            clearInterval(breakTimerId);
            document.getElementById('break-notification').style.display = 'block';
        } else {
            timer--;
        }
    }, 1000);
}

// Handle break OK button click
document.getElementById('break-ok-button').addEventListener('click', () => {
    document.getElementById('break-notification').style.display = 'none';
    showMoodNotification();
});

// Show mood notification
function showMoodNotification() {
    document.getElementById('mood-notification').style.display = 'block';
}

// Mood button handlers
document.querySelectorAll('#mood-tracker .mood-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const mood = event.target.dataset.mood;
        moodCounts[mood]++;
        totalMoodClicks++;
        updateMoodSummary();
    });
});

// Handle mood OK button click
document.getElementById('mood-ok-button').addEventListener('click', () => {
    document.getElementById('mood-notification').style.display = 'none';
});

// Update mood summary
function updateMoodSummary() {
    for (let mood in moodCounts) {
        const percentage = totalMoodClicks === 0 ? 0 : (moodCounts[mood] / totalMoodClicks) * 100;
        document.getElementById(`${mood.toLowerCase()}-percent`).textContent = `${percentage.toFixed(2)}%`;
    }
}

// Initial setup
updateInterval();
