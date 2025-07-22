const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const messageBox = document.getElementById('message-box');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function showMessage(message, duration = 2000) {
    messageBox.textContent = message;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <input type="datetime-local" class="datetime-input" value="${task.dateTime || ''}" style="display: none;">
            <span class="task-datetime">${task.dateTime ? formatDateTime(task.dateTime) : ''}</span>
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        const checkbox = li.querySelector('input[type="checkbox"]');
        const taskTextSpan = li.querySelector('.task-text');
        const editButton = li.querySelector('.edit-btn');
        const deleteButton = li.querySelector('.delete-btn');
        const dateTimeInput = li.querySelector('.datetime-input');
        const taskDateTimeSpan = li.querySelector('.task-datetime');

        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            li.classList.toggle('completed', task.completed);
            saveTasks();
        });

        editButton.addEventListener('click', () => {
            if (li.classList.contains('editing')) {
                return;
            }

            li.classList.add('editing');
            const originalText = task.text;
            const originalDateTime = task.dateTime;

            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = originalText;
            taskTextSpan.replaceWith(editInput);

            dateTimeInput.style.display = 'block';
            taskDateTimeSpan.style.display = 'none';

            const saveButton = document.createElement('button');
            saveButton.className = 'save-btn';
            saveButton.textContent = 'Save';
            const cancelButton = document.createElement('button');
            cancelButton.className = 'cancel-btn';
            cancelButton.textContent = 'Cancel';

            editButton.replaceWith(saveButton);
            deleteButton.replaceWith(cancelButton);

            editInput.focus();

            saveButton.addEventListener('click', () => {
                task.text = editInput.value.trim();
                task.dateTime = dateTimeInput.value;
                if (task.text === '') {
                    showMessage('Task cannot be empty!', 2000);
                    task.text = originalText;
                }
                li.classList.remove('editing');
                editInput.replaceWith(taskTextSpan);
                taskTextSpan.textContent = task.text;
                taskDateTimeSpan.textContent = task.dateTime ? formatDateTime(task.dateTime) : '';
                dateTimeInput.style.display = 'none';
                taskDateTimeSpan.style.display = 'block';
                saveButton.replaceWith(editButton);
                cancelButton.replaceWith(deleteButton);
                saveTasks();
                showMessage('Task updated!', 1500);
            });

            cancelButton.addEventListener('click', () => {
                li.classList.remove('editing');
                editInput.replaceWith(taskTextSpan);
                taskTextSpan.textContent = originalText;
                dateTimeInput.value = originalDateTime;
                dateTimeInput.style.display = 'none';
                taskDateTimeSpan.style.display = 'block';
                saveButton.replaceWith(editButton);
                cancelButton.replaceWith(deleteButton);
                showMessage('Edit cancelled.', 1500);
            });
        });

        deleteButton.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
            showMessage('Task deleted!', 1500);
        });

        taskList.appendChild(li);
    });
}

function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') {
        showMessage('Task cannot be empty!', 2000);
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        dateTime: ''
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
    showMessage('Task added!', 1500);
}

function formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

addTaskBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

renderTasks();
