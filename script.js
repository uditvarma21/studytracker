document.addEventListener("DOMContentLoaded", function () {
    // Constants for subjects and time intervals
    const subjects = ["Polity", "Science and Tech", "Geography", "Economics", "History"];
    const timeIntervals = [
        { subject: "Polity", time: 60 },
        { subject: "Science and Tech", time: 120 },
        { subject: "Geography", time: 180 },
        { subject: "Economics", time: 240 },
        { subject: "History", time: 300 },
    ];

    // Variables to keep track of state
    let currentIntervalIndex = 0;
    let breakInterval, studyInterval, breakTimer, totalStudyMinutes = 0;

    const intervalTimeSpan = document.getElementById("interval-time");
    const currentSubjectSpan = document.getElementById("current-subject");
    const timerSpan = document.getElementById("timer");
    const breakTimeSpan = document.getElementById("break-time");
    const breakNotificationDiv = document.getElementById("break-notification");
    const moodNotificationDiv = document.getElementById("mood-notification");
    const totalPagesToday = document.getElementById("total-pages-today");

    const pagesReadInput = document.getElementById("pages-read");
    const bookmarkInput = document.getElementById("bookmark");
    const okButton = document.getElementById("ok-button");

    const foodMorningInput = document.getElementById("food-morning");
    const foodAfternoonInput = document.getElementById("food-afternoon");
    const foodEveningInput = document.getElementById("food-evening");

    let moodCounts = { Motivated: 0, Depressed: 0, Creative: 0, Lazy: 0, Bored: 0 };
    let totalMoodClicks = 0;

    // Initialize the schedule
    function initializeSchedule() {
        const currentInterval = timeIntervals[currentIntervalIndex];
        intervalTimeSpan.textContent = formatTime(currentInterval.time);
        currentSubjectSpan.textContent = currentInterval.subject;
        startStudyTimer(currentInterval.time * 60); // Convert minutes to seconds
    }

    // Start the study timer
    function startStudyTimer(duration) {
        let timer = duration;
        studyInterval = setInterval(function () {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerSpan.textContent = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            if (--timer < 0) {
                clearInterval(studyInterval);
                showBreakNotification();
            }
        }, 1000);
    }

    // Show break notification
    function showBreakNotification() {
        breakNotificationDiv.style.display = "block";
    }

    // Handle Break OK button click
    document.getElementById("break-ok-button").addEventListener("click", function () {
        breakNotificationDiv.style.display = "none";
        moodNotificationDiv.style.display = "block";
        startBreakTimer(5 * 60); // 5 minutes break in seconds
    });

    // Start break timer
    function startBreakTimer(duration) {
        breakTimeSpan.textContent = "Break Left: ";
        let timer = duration;
        breakInterval = setInterval(function () {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            breakTimeSpan.textContent = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
            if (--timer < 0) {
                clearInterval(breakInterval);
                moveToNextInterval();
            }
        }, 1000);
    }

    // Move to the next interval or reset for the next day
    function moveToNextInterval() {
        currentIntervalIndex++;
        if (currentIntervalIndex >= timeIntervals.length) {
            // Reset for the next day
            currentIntervalIndex = 0;
            totalStudyMinutes = 0;
            // Reset mood counts for the day
            Object.keys(moodCounts).forEach(mood => {
                moodCounts[mood] = 0;
                document.getElementById(`${mood.toLowerCase()}-percent`).textContent = "0%";
            });
            totalMoodClicks = 0;
        }
        initializeSchedule();
    }

    // Format time in HH:MM format
    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins < 10 ? "0" + mins : mins}`;
    }

    // Handle OK button click to save progress
    okButton.addEventListener("click", function () {
        const pagesRead = parseInt(pagesReadInput.value) || 0;
        const bookmark = parseInt(bookmarkInput.value) || 0;

        const currentSubject = subjects[currentIntervalIndex];
        const currentPages = document.getElementById(`${currentSubject.toLowerCase()}-pages`);
        const currentBookmark = document.getElementById(`${currentSubject.toLowerCase()}-bookmark`);

        const newTotalPages = (parseInt(currentPages.textContent) || 0) + pagesRead;
        currentPages.textContent = newTotalPages;
        currentBookmark.textContent = bookmark;

        totalStudyMinutes += pagesRead;
        totalPagesToday.textContent = totalStudyMinutes;

        pagesReadInput.value = "";
        bookmarkInput.value = "";
    });

    // Handle Mood button clicks
    document.querySelectorAll(".mood-button").forEach(button => {
        button.addEventListener("click", function () {
            const mood = button.dataset.mood;
            moodCounts[mood]++;
            totalMoodClicks++;
            document.getElementById(`${mood.toLowerCase()}-percent`).textContent =
                `${Math.round((moodCounts[mood] / totalMoodClicks) * 100)}%`;

            moodNotificationDiv.style.display = "none";
        });
    });

    // Initialize the Food Tracker input fields
    [foodMorningInput, foodAfternoonInput, foodEveningInput].forEach(input => {
        input.value = localStorage.getItem(input.id) || "Nothing";
        input.addEventListener("input", function () {
            localStorage.setItem(input.id, input.value);
        });
    });

    // Clear food tracker inputs at the end of the day
    function resetFoodTracker() {
        localStorage.removeItem("food-morning");
        localStorage.removeItem("food-afternoon");
        localStorage.removeItem("food-evening");

        foodMorningInput.value = "Nothing";
        foodAfternoonInput.value = "Nothing";
        foodEveningInput.value = "Nothing";
    }

    // Reset food tracker at midnight
    const now = new Date();
    const timeUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(function () {
        resetFoodTracker();
        setInterval(resetFoodTracker, 24 * 60 * 60 * 1000); // Reset every 24 hours
    }, timeUntilMidnight);

    // Initialize schedule on page load
    initializeSchedule();
});
