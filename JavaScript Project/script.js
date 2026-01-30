
const currentUser = "BalaVamsi";

const questions = [
    { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
    { question: "Which data structure is used in recursion?", options: ["Queue", "Stack", "Array", "Tree"], answer: 1 },
    { question: "Which is NOT a programming paradigm?", options: ["OOP", "Functional", "Procedural", "Relational"], answer: 3 },
    { question: "Deadlock occurs when?", options: ["Processes wait indefinitely", "CPU is idle", "Memory is full", "Cache fails"], answer: 0 },
    { question: "Which scheduling algorithm gives minimum waiting time?", options: ["FCFS", "SJF", "Round Robin", "Priority"], answer: 1 },
    { question: "Which normal form removes transitive dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 2 },
    { question: "Which traversal uses stack?", options: ["BFS", "DFS", "Level Order", "Heap"], answer: 1 },
    { question: "Which is NOT an OS?", options: ["Linux", "Windows", "Oracle", "MacOS"], answer: 2 },
    { question: "Which is used for synchronization?", options: ["Semaphore", "Compiler", "Loader", "Assembler"], answer: 0 },
    { question: "What does ACID stand for?", options: ["Atomicity Consistency Isolation Durability", "Accuracy Control Integrity Data", "Access Control Index Data", "None"], answer: 0 }
];

let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;

let answers = new Array(10).fill(null);
let timeSpent = new Array(10).fill(0);
let questionStartTime = 0;

const navItems = document.querySelectorAll(".nav-item");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.value = 800;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}


function startTest() {
    audioCtx.resume(); 

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "block";

    loadQuestion();
    startTimer();
}

function loadQuestion() {
    questionStartTime = Date.now(); 
    const q = questions[currentIndex];
    document.getElementById("questionText").innerText = q.question;
    document.getElementById("pageNumber").innerText = `${currentIndex + 1} / 10`;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.className = "option";
        div.innerText = opt;

        if (answers[currentIndex] !== null) {
            if (i === answers[currentIndex]) {
                div.classList.add(i === q.answer ? "correct" : "wrong");
            }
        } else {
            div.onclick = () => selectOption(i);
        }

        optionsDiv.appendChild(div);
    });

    updateProgress();
    updateNav();
}

function selectOption(selected) {
    clearInterval(timer);

    timeSpent[currentIndex] += Math.floor(
        (Date.now() - questionStartTime) / 1000
    );

    answers[currentIndex] = selected;
    if (selected === questions[currentIndex].answer) score++;

    loadQuestion();
}

function nextQuestion() {
    clearInterval(timer);

    timeSpent[currentIndex] += Math.floor(
        (Date.now() - questionStartTime) / 1000
    );

    if (answers[currentIndex] === null) {
        navItems[currentIndex].classList.add("skipped");
    }

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        timeLeft = 10;
        loadQuestion();
        startTimer();
    } else {
        showResult();
    }
}

function startTimer() {
    document.getElementById("timer").innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;

        if (timeLeft <= 3 && timeLeft > 0) playBeep(); // 🔔 alarm

        if (timeLeft === 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function updateProgress() {
    const percent = (currentIndex / 10) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressLabel").innerText = Math.round(percent) + "%";
}

navItems.forEach(item => {
    item.onclick = () => {
        currentIndex = Number(item.dataset.index);
        timeLeft = 10;
        loadQuestion();
        startTimer();
    };
});

function updateNav() {
    navItems.forEach((item, i) => {
        item.classList.remove("active", "responded");
        if (answers[i] !== null) item.classList.add("responded");
    });
    navItems[currentIndex].classList.add("active");
}

function showResult() {
    document.getElementById("quizScreen").style.display = "none";
    document.getElementById("resultScreen").style.display = "block";

    const accuracy = ((score / questions.length) * 100).toFixed(1);
    document.getElementById("score").innerText = score;
    document.getElementById("accuracy").innerText = accuracy;

    const labels = questions.map((_, i) => `Q${i + 1}`);
    const accuracyData = answers.map(
        (ans, i) => ans === questions[i].answer ? 1 : 0
    );

    new Chart(document.getElementById("resultChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Time Spent (sec)",
                    data: timeSpent,
                    backgroundColor: "#6366f1",
                    yAxisID: "y"
                },
                {
                    label: "Accuracy (1 = Correct, 0 = Wrong)",
                    data: accuracyData,
                    backgroundColor: "#22c55e",
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Time (seconds)" }
                },
                y1: {
                    beginAtZero: true,
                    max: 1,
                    position: "right",
                    grid: { drawOnChartArea: false },
                    ticks: {
                        stepSize: 1,
                        callback: v => v === 1 ? "Correct" : "Wrong"
                    }
                }
            }
        }
    });
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark");

    const isDark = body.classList.contains("dark");
    const toggleBtn = document.querySelector(".theme-toggle");

    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem(`theme_${currentUser}`, isDark ? "dark" : "light");
}

(function () {
    const savedTheme = localStorage.getItem(`theme_${currentUser}`);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        const toggleBtn = document.querySelector(".theme-toggle");
        if (toggleBtn) toggleBtn.textContent = "☀️";
    }
})();
