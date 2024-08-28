document.addEventListener('DOMContentLoaded', function () {
    // Time intervals and subjects
    const intervals = [
        { start: "11:30", end: "13:30" },
        { start: "14:30", end: "16:30" },
        { start: "17:30", end: "19:30" },
        { start: "21:00", end: "23:00" }
    ];

    const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];

    const permanentTimes = [
        { start: "04:45", end: "04:45", subject: "Cold Shower" },
        { start: "05:30", end: "07:00", subject: "Newspaper" }
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

    // Randomize subjects
    function getRandomSubject() {
        const shuffledSubjects = subjects.sort(() => 0.5 - Math.random());
        return shuffledSubjects.shift();
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
        const nowStr = now.toTimeString().substring(0, 5);

        // Check permanent times first
        let matchedPermanentTime = permanentTimes.find(p => p.start === nowStr);
        if (matchedPermanentTime) {
            document.getElementById("current-subject").innerText = matchedPermanentTime.subject;
            document.getElementById("timer").innerText = "";
            clearInterval(timerInterval);
            return;
        }

        // Determine current interval
        currentInterval = intervals.find(interval => nowStr >= interval.start && nowStr < interval.end);

        if (currentInterval) {
            // Randomize subject for the interval
            const subject = getRandomSubject();
            document.getElementById("current-subject").innerText = subject;

            const endMinutes = parseInt(currentInterval.end.split(':')[0]) * 60 + parseInt(currentInterval.end.split(':')[1]);
            const nowMinutes = parseInt(nowStr.split(':')[0]) * 60 + parseInt(nowStr.split(':')[1]);
            let timeLeft = (endMinutes - nowMinutes) * 60;

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
            const subject = document.getElementById("current-subject").innerText;
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

    // Food Tracker
    function loadFoodData() {
        const morning = loadFromLocalStorage("morningFood") || "Nothing";
        const afternoon = loadFromLocalStorage("afternoonFood") || "Nothing";
        const evening = loadFromLocalStorage("eveningFood") || "Nothing";

        document.getElementById("morning-food").value = morning;
        document.getElementById("afternoon-food").value = afternoon;
        document.getElementById("evening-food").value = evening;
    }

    function saveFoodData() {
        saveToLocalStorage("morningFood", document.getElementById("morning-food").value || "Nothing");
        saveToLocalStorage("afternoonFood", document.getElementById("afternoon-food").value || "Nothing");
        saveToLocalStorage("eveningFood", document.getElementById("evening-food").value || "Nothing");
    }

    document.getElementById("save-food-button").addEventListener("click", function () {
        saveFoodData();
    });

    document.getElementById("clear-food-button").addEventListener("click", function () {
        document.getElementById("morning-food").value = "";
        document.getElementById("afternoon-food").value = "";
        document.getElementById("evening-food").value = "";
        saveFoodData(); // Save "Nothing" if fields are cleared
    });

    // Clear food data at the end of the day
    function clearFoodDataAtEndOfDay() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours === 0 && minutes === 0) {
            saveToLocalStorage("morningFood", "Nothing");
            saveToLocalStorage("afternoonFood", "Nothing");
            saveToLocalStorage("eveningFood", "Nothing");
        }
    }

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

        loadFoodData();
    }

    // Initialize
    loadSavedData();
    updateScheduleAndTimer();
    setInterval(updateScheduleAndTimer, 60000);  // Update every minute

    // Schedule daily food data clearing
    setInterval(clearFoodDataAtEndOfDay, 60000);  // Check every minute
});
