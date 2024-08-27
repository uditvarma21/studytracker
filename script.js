document.addEventListener('DOMContentLoaded', function () {
    const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];
    const intervals = [
        { start: '11:30 AM', end: '1:30 PM' },
        { start: '2:30 PM', end: '4:30 PM' },
        { start: '5:30 PM', end: '7:30 PM' },
        { start: '9:00 PM', end: '11:00 PM' }
    ];

    let currentInterval = null;
    let timerInterval = null;
    let breakTimerInterval = null;
    let breakLeftTimerInterval = null;

    const randomizedSubjects = shuffleArray(subjects);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function calculateTimeLeft(endTime) {
        const now = new Date();
        const end = new Date();
        const [hours, minutes] = endTime.split(':').map(Number);
        end.setHours(hours, minutes, 0, 0);
        const diff = end - now;
        return diff > 0 ? diff : 0;
    }

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function startInterval(index) {
        const interval = intervals[index];
        const timeLeft = calculateTimeLeft(interval.end);
        if (timeLeft > 0) {
            document.getElementById('interval-time').textContent = `${interval.start} - ${interval.end}`;
            document.getElementById('current-subject').textContent = randomizedSubjects[index];
            document.getElementById('timer').textContent = formatTime(timeLeft);

            timerInterval = setInterval(() => {
                const timeLeft = calculateTimeLeft(interval.end);
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    document.getElementById('timer').textContent = '00:00';
                    showInputFields();
                } else {
                    document.getElementById('timer').textContent = formatTime(timeLeft);
                }
            }, 1000);
        } else {
            document.getElementById('interval-time').textContent = 'Not Study Interval';
            document.getElementById('timer').textContent = '00:00';
        }
    }

    function showInputFields() {
        document.getElementById('input-fields').style.display = 'block';
        document.getElementById('ok-button').addEventListener('click', function () {
            const pagesRead = parseInt(document.getElementById('pages-read').value) || 0;
            const bookmark = parseInt(document.getElementById('bookmark').value) || 0;
            const subject = document.getElementById('current-subject').textContent;
            updateTrackingData(subject, pagesRead, bookmark);
            document.getElementById('input-fields').style.display = 'none';
        });
    }

    function updateTrackingData(subject, pagesRead, bookmark) {
        const totalPages = document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-pages`);
        const totalBookmark = document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-bookmark`);
        const pagesToday = document.getElementById('pages-today');

        const currentTotalPages = parseInt(totalPages.textContent) || 0;
        const currentPagesToday = parseInt(pagesToday.textContent) || 0;

        totalPages.textContent = currentTotalPages + pagesRead;
        totalBookmark.textContent = bookmark;
        pagesToday.textContent = currentPagesToday + pagesRead;
    }

    function startBreakTimer() {
        let timeLeft = 25 * 60 * 1000; // 25 minutes

        breakTimerInterval = setInterval(() => {
            timeLeft -= 1000;
            if (timeLeft <= 0) {
                clearInterval(breakTimerInterval);
                document.getElementById('break-time').textContent = '00:00';
                showBreakNotification();
            } else {
                document.getElementById('break-time').textContent = formatTime(timeLeft);
            }
        }, 1000);
    }

    function showBreakNotification() {
        document.getElementById('break-notification').style.display = 'block';
        document.getElementById('break-ok-button').addEventListener('click', function () {
            document.getElementById('break-notification').style.display = 'none';
            document.getElementById('break-left-timer').style.display = 'block';
            startBreakLeftTimer();
            showMoodTracker();
        });
    }

    function startBreakLeftTimer() {
        let timeLeft = 5 * 60 * 1000; // 5 minutes

        breakLeftTimerInterval = setInterval(() => {
            timeLeft -= 1000;
            if (timeLeft <= 0) {
                clearInterval(breakLeftTimerInterval);
                document.getElementById('break-left-time').textContent = '00:00';
            } else {
                document.getElementById('break-left-time').textContent = formatTime(timeLeft);
            }
        }, 1000);
    }

    function showMoodTracker() {
        document.getElementById('mood-notification').style.display = 'block';
        document.querySelectorAll('.mood-button').forEach(button => {
            button.addEventListener('click', function () {
                const mood = button.getAttribute('data-mood');
                updateMoodData(mood);
                document.getElementById('mood-notification').style.display = 'none';
            });
        });
    }

    function updateMoodData(selectedMood) {
        const moodCounts = {
            'Motivated': parseInt(document.getElementById('motivated-percent').textContent) || 0,
            'Depressed': parseInt(document.getElementById('depressed-percent').textContent) || 0,
            'Creative': parseInt(document.getElementById('creative-percent').textContent) || 0,
            'Lazy': parseInt(document.getElementById('lazy-percent').textContent) || 0,
            'Bored': parseInt(document.getElementById('bored-percent').textContent) || 0
        };

        moodCounts[selectedMood]++;
        const totalMoods = moodCounts['Motivated'] + moodCounts['Depressed'] + moodCounts['Creative'] + moodCounts['Lazy'] + moodCounts['Bored'];

        document.getElementById('motivated-percent').textContent = Math.round((moodCounts['Motivated'] / totalMoods) * 100);
        document.getElementById('depressed-percent').textContent = Math.round((moodCounts['Depressed'] / totalMoods) * 100);
        document.getElementById('creative-percent').textContent = Math.round((moodCounts['Creative'] / totalMoods) * 100);
        document.getElementById('lazy-percent').textContent = Math.round((moodCounts['Lazy'] / totalMoods) * 100);
        document.getElementById('bored-percent').textContent = Math.round((moodCounts['Bored'] / totalMoods) * 100);
    }

    function checkIntervals() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        for (let i = 0; i < intervals.length; i++) {
            const start = intervals[i].start.split(' ')[0].split(':').map(Number);
            const end = intervals[i].end.split(' ')[0].split(':').map(Number);

            const startTime = start[0] * 60 + start[1];
            const endTime = end[0] * 60 + end[1];

            if (currentTime >= startTime && currentTime < endTime) {
                startInterval(i);
                break;
            } else if (i === intervals.length - 1 && currentTime >= endTime) {
                document.getElementById('interval-time').textContent = 'Not Study Interval';
                document.getElementById('timer').textContent = '00:00';
            }
        }
    }

    // Initialize the study tracker
    checkIntervals();
    setInterval(checkIntervals, 60000); // Check every minute
});
