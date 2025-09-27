document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const progressBar = document.getElementById('progress-bar');
    const clockElement = document.getElementById('clock');

    const updateClock = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        clockElement.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    };

    setInterval(updateClock, 1000);
    updateClock();

    const reminderInput = document.getElementById('reminder-input');

    if ('Notification' in window) {
        Notification.requestPermission();
    }

    const checkReminders = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (task.reminder && !task.completed) {
                const reminderTime = new Date(task.reminder);
                if (now.getFullYear() === reminderTime.getFullYear() &&
                    now.getMonth() === reminderTime.getMonth() &&
                    now.getDate() === reminderTime.getDate() &&
                    now.getHours() === reminderTime.getHours() &&
                    now.getMinutes() === reminderTime.getMinutes()) {
                    new Notification('Task Reminder', { body: task.text });
                }
            }
        });
    };

    setInterval(checkReminders, 1000);

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = `list-group-item ${task.completed ? 'completed' : ''}`;
            let reminderHTML = '';
            if (task.reminder) {
                const reminderTime = new Date(task.reminder);
                reminderHTML = `<span class="reminder-time">- Reminder: ${reminderTime.toLocaleString()}</span>`;
            }
            taskItem.innerHTML = `
                <span>${task.text} ${reminderHTML}</span>
                <div class="btn-group">
                    <button class="btn btn-success btn-sm complete-btn" data-index="${index}">Complete</button>
                    <button class="btn btn-warning btn-sm edit-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
        updateProgress();
    };

    const addTask = () => {
        const taskText = taskInput.value.trim();
        const reminder = reminderInput.value;
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false, reminder: reminder });
            taskInput.value = '';
            reminderInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    const completeTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    const editTask = (index) => {
        const newText = prompt('Enter new task text:', tasks[index].text);
        if (newText !== null) {
            tasks[index].text = newText.trim();
            saveTasks();
            renderTasks();
        }
    };

    const updateProgress = () => {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    };

    addTaskBtn.addEventListener('click', addTask);

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            completeTask(e.target.dataset.index);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(e.target.dataset.index);
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(e.target.dataset.index);
        }
    });

    renderTasks();
});