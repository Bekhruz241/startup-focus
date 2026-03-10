// ==========================================
// POMODORO TIMER LOGIC
// ==========================================
let timer;
let timeLeft = 25 * 60; // 25 minutes default
let isRunning = false;
let currentMode = 'pomodoro'; // 'pomodoro' or 'shortBreak'

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const pomodoroModeBtn = document.getElementById('pomodoroMode');
const shortBreakModeBtn = document.getElementById('shortBreakMode');
const timerDisplayElement = document.querySelector('.timer-display');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Update Document Title to reflect timer
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - StartupFocus`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timer);
                isRunning = false;
                playAlarm();
                switchMode(currentMode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = currentMode === 'pomodoro' ? 25 * 60 : 5 * 60;
    updateDisplay();
    startBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
}

function switchMode(mode) {
    currentMode = mode;
    resetTimer();
    
    // Update Active Button UI
    if (mode === 'pomodoro') {
        pomodoroModeBtn.classList.add('active');
        shortBreakModeBtn.classList.remove('active');
        timerDisplayElement.classList.replace('break-mode', 'neon-glow');
        if(!timerDisplayElement.classList.contains('neon-glow')) {
             timerDisplayElement.classList.add('neon-glow');
        }
    } else {
        shortBreakModeBtn.classList.add('active');
        pomodoroModeBtn.classList.remove('active');
         timerDisplayElement.classList.replace('neon-glow', 'break-mode');
         if(!timerDisplayElement.classList.contains('break-mode')) {
             timerDisplayElement.classList.add('break-mode');
        }
    }
}

function playAlarm() {
    // Simple beep using Web Audio API so we don't need external files
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; // Hz
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1);
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

pomodoroModeBtn.addEventListener('click', () => {
    if(currentMode !== 'pomodoro') switchMode('pomodoro');
});

shortBreakModeBtn.addEventListener('click', () => {
    if(currentMode !== 'shortBreak') switchMode('shortBreak');
});


// ==========================================
// TASK MANAGER LOGIC
// ==========================================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCountElement = document.getElementById('taskCount');

let tasks = JSON.parse(localStorage.getItem('startupFocusTasks')) || [];

function saveTasks() {
    localStorage.setItem('startupFocusTasks', JSON.stringify(tasks));
    updateTaskCount();
}

function updateTaskCount() {
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    taskCountElement.textContent = incompleteTasks;
}

function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            <span class="task-text">${escapeHTML(task.text)}</span>
            <button class="delete-task-btn" onclick="deleteTask(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        taskList.appendChild(li);
    });
    updateTaskCount();
}

function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        tasks.push({ text, completed: false });
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }
}

// Attach functions to window so inline onclick handlers work
window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
};

window.deleteTask = function(index) {
    // Add fade out animation class before removing
    const item = taskList.children[index];
    item.style.animation = 'slideIn 0.3s ease-in reverse forwards';
    
    setTimeout(() => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }, 280); // Wait for animation to mostly finish
};

// Utility to prevent XSS if used dynamically
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Event Listeners for Tasks
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Initialize on Load
updateDisplay();
renderTasks();
