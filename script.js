const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];
const studyIntervals = [
    { start: "11:30 AM", end: "1:30 PM" },
    { start: "2:30 PM", end: "4:30 PM" },
    { start: "5:30 PM", end: "7:30 PM" },
    { start: "9:00 PM", end: "11:00 PM" }
];
let currentIntervalIndex = -1;
let currentSubject = '';
let totalPagesToday = 0;
let breakTime = 25 * 60; // 25 minutes in seconds
let breakIntervalId;
let studyIntervalStarted = false;
let breakOngoing = false;

// Initialize the schedule
function updateSchedule() {
    const now = new Date();
    let isInterval = false;

    // Check if we are in a study interval
    for (let i = 0; i < studyIntervals.length; i++) {
        const intervalStart = new Date(`${now.toDateString()} ${studyIntervals[i].start}`);
        const intervalEnd = new Date(`${now.toDateString()} ${studyIntervals[i].end}`);

        if (now >= intervalStart && now <= intervalEnd) {
            currentIntervalIndex = i;
            currentSubject = subjects[i];
            document.getElementById('current-subject').textContent = currentSubject;
            studyIntervalStarted = true;
            updateBreakTimer(); // Start the break timer
            break;
        } else {
            studyIntervalStarted = false;
        }
    }

    if (studyIntervalStarted) {
        const intervalEnd = new Date(`${now.toDateString()} ${studyIntervals[currentIntervalIndex].end}`);
        const timeLeft = intervalEnd - now;
        const minutesLeft = Math.floor(timeLeft / 60000);
        const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
        document.getElementById('timer').textContent = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
        document.getElementById('input-fields').style.display = 'none';
    } else {
        document.getElementById('timer').textContent = '';
        document.getElementById('input-fields').style.display = 'block';
    }
}

// Function to handle input submission
document.getElementById('ok-button').addEventListener('click', () => {
    const pagesRead = parseInt(document.getElementById('pages-read').value) || 0;
    const bookmark = parseInt(document.getElementById('bookmark').value) || 0;

    totalPagesToday += pagesRead;

    document.getElementById(`${currentSubject.toLowerCase().replace(/ /g, '-')}-pages`).textContent =
        (parseInt(document.getElementById(`${currentSubject.toLowerCase().replace(/ /g, '-')}-pages`).textContent) || 0) + pagesRead;
    document.getElementById(`${currentSubject.toLowerCase().replace(/ /g, '-')}-bookmark`).textContent = bookmark;

    updateTotalPagesRow();

    // Clear input fields
    document.getElementById('pages-read').value = '';
    document.getElementById('bookmark').value = '';
});

// Function to update the "Total Pages Today" row
function updateTotalPagesRow() {
    document.getElementById('total-pages-cell').textContent = totalPagesToday;
}

// Break Timer
function updateBreakTimer() {
    if (!studyIntervalStarted) {
        document.getElementById('break-status').textContent = 'Not Study Interval';
        document.getElementById('break-time').textContent = '25:00';
        clearInterval(breakIntervalId);
        breakTime = 25 * 60;
        return;
    }

    document.getElementById('break-status').textContent = breakOngoing ? 'Break Left:' : 'Next Break:';
    breakIntervalId = setInterval(() => {
        if (!studyIntervalStarted) {
            clearInterval(breakIntervalId);
            return;
        }

        const minutes = Math.floor(breakTime / 60);
        const seconds = breakTime % 60;
        document.getElementById('break-time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (breakTime > 0) {
            breakTime--;
        } else {
            clearInterval(breakIntervalId);
            if (breakOngoing) {
                breakOngoing = false;
                breakTime = 25 * 60;
                updateSchedule();
            } else {
                breakOngoing = true;
                breakTime = 5 * 60;
                document.getElementById('break-notification').style.display = 'block';
                document.getElementById('mood-notification').style.display = 'block';
                updateBreakTimer();
            }
        }
    }, 1000);
}

document.getElementById('break-ok-button').addEventListener('click', () => {
    document.getElementById('break-notification').style.display = 'none';
    document.getElementById('mood-notification').style.display = 'none';
    updateBreakTimer();
});

// Initialize everything
updateSchedule();
setInterval(updateSchedule, 1000);
