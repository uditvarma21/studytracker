// Subject and time interval setup
const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];
const intervals = [
    { start: '04:45 AM', end: '05:00 AM', subject: 'Cold Shower' },
    { start: '05:30 AM', end: '07:00 AM', subject: 'Newspaper' },
    { start: '11:30 AM', end: '01:30 PM' },
    { start: '02:30 PM', end: '04:30 PM' },
    { start: '05:30 PM', end: '07:30 PM' },
    { start: '09:00 PM', end: '11:00 PM' }
];

let currentInterval = null;
let totalPagesToday = 0;

function updateSchedule() {
    const now = new Date();
    let foundInterval = false;

    intervals.forEach(interval => {
        const [startHour, startMin] = interval.start.split(/[: ]/);
        const [endHour, endMin] = interval.end.split(/[: ]/);

        const startDate = new Date(now);
        startDate.setHours(parseInt(startHour) % 12 + (interval.start.includes('PM') ? 12 : 0), parseInt(startMin));

        const endDate = new Date(now);
        endDate.setHours(parseInt(endHour) % 12 + (interval.end.includes('PM') ? 12 : 0), parseInt(endMin));

        if (now >= startDate && now <= endDate) {
            currentInterval = interval;
            foundInterval = true;

            document.getElementById('interval-time').textContent = `${interval.start} - ${interval.end}`;
            document.getElementById('current-subject').textContent = interval.subject || subjects[Math.floor(Math.random() * subjects.length)];

            startTimer(endDate);
            return;
        }
    });

    if (!foundInterval) {
        const nextInterval = intervals.find(interval => {
            const [startHour, startMin] = interval.start.split(/[: ]/);
            const startDate = new Date(now);
            startDate.setHours(parseInt(startHour) % 12 + (interval.start.includes('PM') ? 12 : 0), parseInt(startMin));
            return now < startDate;
        });

        if (nextInterval) {
            document.getElementById('interval-time').textContent = `Next Interval: ${nextInterval.start} - ${nextInterval.end}`;
            document.getElementById('current-subject').textContent = '';
            document.getElementById('timer').textContent = '';
        }
    }
}

function startTimer(endTime) {
    const timerInterval = setInterval(() => {
        const now = new Date();
        const timeRemaining = Math.max(0, endTime - now);

        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById('input-fields').style.display = 'block';
        }
    }, 1000);
}

// Accumulate total pages read today
document.getElementById('ok-button').addEventListener('click', function() {
    const pages = parseInt(document.getElementById('pages-read').value);
    const bookmark = parseInt(document.getElementById('bookmark').value);
    const subject = document.getElementById('current-subject').textContent;

    if (!isNaN(pages) && !isNaN(bookmark)) {
        const pagesElement = document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-pages`);
        pagesElement.textContent = parseInt(pagesElement.textContent || '0') + pages;

        const bookmarkElement = document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-bookmark`);
        bookmarkElement.textContent = bookmark;

        totalPagesToday += pages;
        updateTotalPagesRow();
    }

    document.getElementById('input-fields').style.display = 'none';
});

// Function to update or create the total pages row
function updateTotalPagesRow() {
    let totalRow = document.getElementById('total-pages-today');

    if (!totalRow) {
        const tbody = document.querySelector('#tracking-container tbody');
        totalRow = document.createElement('tr');
        totalRow.id = 'total-pages-today';

        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total Pages Today';
        totalLabelCell.colSpan = 2;

        const totalPagesCell = document.createElement('td');
        totalPagesCell.textContent = totalPagesToday;

        totalRow.appendChild(totalLabelCell);
        totalRow.appendChild(totalPagesCell);

        tbody.appendChild(totalRow);
    } else {
        totalRow.querySelector('td:last-child').textContent = totalPagesToday;
    }
}

// Reset total pages read today at midnight
function resetTotalPagesToday() {
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

    setTimeout(() => {
        totalPagesToday = 0;
        updateTotalPagesRow();  // Update the row with the reset value
        resetTotalPagesToday();  // Set the timeout again for the next day
    }, millisTillMidnight);
}

// Initialize the reset function
resetTotalPagesToday();

// Start the schedule updater
setInterval(updateSchedule, 60000);
updateSchedule();
