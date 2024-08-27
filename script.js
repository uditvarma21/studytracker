document.addEventListener("DOMContentLoaded", function () {
    const studyIntervals = [
        { start: "11:30", end: "13:30" },
        { start: "14:30", end: "16:30" },
        { start: "17:30", end: "19:30" },
        { start: "21:00", end: "23:00" }
    ];

    const subjects = ['Polity', 'Science and Tech', 'Geography', 'Economics', 'History'];
    let currentSubjectIndex = 0;
    let currentInterval = null;
    let pagesToday = 0;

    let moodCount = {
        Motivated: 0,
        Depressed: 0,
        Creative: 0,
        Lazy: 0,
        Bored: 0
    };

    let totalMoodClicks = 0;

    function updateMoodTable() {
        for (let mood in moodCount) {
            const percent = totalMoodClicks > 0 ? ((moodCount[mood] / totalMoodClicks) * 100).toFixed(2) : 0;
            document.getElementById(`${mood.toLowerCase()}-percent`).innerText = `${percent}%`;
        }
    }

    function startTimer(duration, display, callback) {
        let timer = duration, minutes, seconds;
        const interval = setInterval(function () {
            minutes = Math.floor(timer / 60);
            seconds = timer % 60;

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 1000);
    }

    function checkStudyInterval() {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

        currentInterval = studyIntervals.find(interval =>
            currentTime >= interval.start && currentTime < interval.end
        );

        if (currentInterval) {
            const subject = subjects[currentSubjectIndex % subjects.length];
            document.getElementById("current-subject").innerText = subject;
            startTimer(1500, document.getElementById("timer"), function () {
                showInputFields();
            });
            document.getElementById("break-time").innerText = "25:00";
            startTimer(1500, document.getElementById("break-time"), function () {
                showBreakNotification();
            });
        } else {
            document.getElementById("timer").innerText = "Not Study Interval";
            document.getElementById("break-time").innerText = "Not Study Interval";
            document.getElementById("current-subject").innerText = "";
        }

        updateNextInterval();
    }

    function showInputFields() {
        document.getElementById("input-fields").style.display = "block";
        document.getElementById("ok-button").addEventListener("click", function () {
            const pagesRead = parseInt(document.getElementById("pages-read").value);
            const bookmark = parseInt(document.getElementById("bookmark").value);
            const subject = subjects[currentSubjectIndex % subjects.length];
            
            document.getElementById(`${subject.toLowerCase()}-bookmark`).innerText = bookmark;
            const currentPages = parseInt(document.getElementById(`${subject.toLowerCase()}-pages`).innerText) || 0;
            document.getElementById(`${subject.toLowerCase()}-pages`).innerText = currentPages + pagesRead;
            pagesToday += pagesRead;
            document.getElementById("total-pages-today").innerText = pagesToday;

            document.getElementById("input-fields").style.display = "none";
        });
    }

    function showBreakNotification() {
        document.getElementById("break-notification").style.display = "block";
        document.getElementById("break-ok-button").addEventListener("click", function () {
            document.getElementById("break-notification").style.display = "none";
            startBreakTimer();
        });
    }

    function startBreakTimer() {
        document.getElementById("break-time").innerText = "5:00";
        startTimer(300, document.getElementById("break-time"), function () {
            document.getElementById("mood-notification").style.display = "block";
        });

        document.querySelectorAll(".mood-button").forEach(button => {
            button.addEventListener("click", function () {
                const mood = this.getAttribute("data-mood");
                moodCount[mood]++;
                totalMoodClicks++;
                updateMoodTable();
                document.getElementById("mood-notification").style.display = "none";
            });
        });
    }

    function updateNextInterval() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const nextInterval = studyIntervals.find(interval => {
            const startTime = parseInt(interval.start.split(':')[0]) * 60 + parseInt(interval.start.split(':')[1]);
            return startTime > currentTime;
        });

        if (nextInterval) {
            document.getElementById("interval-time").innerText = nextInterval.start;
        } else {
            document.getElementById("interval-time").innerText = studyIntervals[0].start;
        }
    }

    checkStudyInterval();
    setInterval(checkStudyInterval, 1000 * 60);
});

