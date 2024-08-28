document.addEventListener('DOMContentLoaded', function () {
    // Time intervals for study sessions
    const studyIntervals = [
        { start: '11:30', end: '13:30', subject: null },
        { start: '14:30', end: '16:30', subject: null },
        { start: '17:30', end: '19:30', subject: null },
        { start: '21:00', end: '23:00', subject: null }
    ];

    // List of subjects
    const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];

    // Select elements
    const intervalTimeElem = document.getElementById('interval-time');
    const subjectElem = document.getElementById('current-subject');
    const timerElem = document.getElementById('timer');
    const breakTimeElem = document.getElementById('break-time');
    const breakNotification = document.getElementById('break-notification');
    const breakOkButton = document.getElementById('break-ok-button');
    const moodNotification = document.getElementById('mood-notification');
    const okButton = document.getElementById('ok-button');
    const pagesReadInput = document.getElementById('pages-read');
    const bookmarkInput = document.getElementById('bookmark');
    const trackingTable = document.getElementById('tracking-container');
    const saveFoodButton = document.getElementById('save-food-button');
    const clearFoodButton = document.getElementById('clear-food-button');
    const foodInputs = {
        morning: document.getElementById('morning-food'),
        afternoon: document.getElementById('afternoon-food'),
        evening: document.getElementById('evening-food')
    };

    // Load saved data
    function loadSavedData() {
        // Load saved study progress
        const subjectsData = JSON.parse(localStorage.getItem('subjectsData')) || {};
        Object.keys(subjectsData).forEach(subject => {
            const data = subjectsData[subject];
            document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-bookmark`).innerText = data.bookmark || 'N/A';
            document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-pages`).innerText = data.pagesRead || '0';
        });

        // Load saved food tracker
        const foodData = JSON.parse(localStorage.getItem('foodData')) || {};
        Object.keys(foodInputs).forEach(meal => {
            foodInputs[meal].value = foodData[meal] || '';
        });
    }

    // Save data
    function saveData() {
        const subjectsData = {};
        subjects.forEach(subject => {
            subjectsData[subject] = {
                bookmark: document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-bookmark`).innerText,
                pagesRead: document.getElementById(`${subject.toLowerCase().replace(/ /g, '-')}-pages`).innerText
            };
        });
        localStorage.setItem('subjectsData', JSON.stringify(subjectsData));

        const foodData = {
            morning: foodInputs.morning.value,
            afternoon: foodInputs.afternoon.value,
            evening: foodInputs.evening.value
        };
        localStorage.setItem('foodData', JSON.stringify(foodData));
    }

    // Randomize subjects
    function getRandomSubject() {
        return subjects[Math.floor(Math.random() * subjects.length)];
    }

    // Start study interval
    function startStudyInterval() {
        const now = new Date();
        let interval = studyIntervals.find(interval => {
            const start = new Date(`1970-01-01T${interval.start}:00`);
            const end = new Date(`1970-01-01T${interval.end}:00`);
            return now >= start && now <= end;
        });

        if (!interval) {
            // No active study interval
            intervalTimeElem.innerText = 'No active interval';
            subjectElem.innerText = '';
            timerElem.innerText = '';
            return;
        }

        // Randomize subject
        interval.subject = getRandomSubject();
        subjectElem.innerText = interval.subject;

        // Set interval timer
        const [intervalStart, intervalEnd] = [interval.start, interval.end].map(time => new Date(`1970-01-01T${time}:00`));
        const remainingTime = Math.max(0, intervalEnd - now);
        const timer = Math.ceil(remainingTime / 1000);

        function updateTimer() {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerElem.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timer > 0) {
                timer--;
                setTimeout(updateTimer, 1000);
            }
        }

        updateTimer();
    }

    // Start break timer
    function startBreakTimer() {
        const breakTime = 25 * 60; // 25 minutes in seconds
        let timeLeft = breakTime;

        function updateBreakTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            breakTimeElem.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft > 0) {
                timeLeft--;
                setTimeout(updateBreakTimer, 1000);
            } else {
                breakNotification.style.display = 'block';
            }
        }

        updateBreakTimer();
    }

    // Set up event listeners
    okButton.addEventListener('click', function () {
        const pagesRead = parseInt(pagesReadInput.value) || 0;
        const bookmark = parseInt(bookmarkInput.value) || 0;
        const currentSubject = subjectElem.innerText;

        if (currentSubject) {
            const subjectData = document.getElementById(`${currentSubject.toLowerCase().replace(/ /g, '-')}-pages`);
            const totalPages = (parseInt(subjectData.innerText) || 0) + pagesRead;
            subjectData.innerText = totalPages;

            const bookmarkData = document.getElementById(`${currentSubject.toLowerCase().replace(/ /g, '-')}-bookmark`);
            bookmarkData.innerText = bookmark;
        }

        saveData();
        pagesReadInput.value = '';
        bookmarkInput.value = '';
        moodNotification.style.display = 'block';
    });

    breakOkButton.addEventListener('click', function () {
        breakNotification.style.display = 'none';
        moodNotification.style.display = 'block';
    });

    // Event listeners for food tracker buttons
    saveFoodButton.addEventListener('click', function () {
        saveData();
    });

    clearFoodButton.addEventListener('click', function () {
        Object.keys(foodInputs).forEach(meal => {
            foodInputs[meal].value = '';
        });
        saveData();
    });

    // Initial setup
    loadSavedData();
    startStudyInterval();
    startBreakTimer();
});
