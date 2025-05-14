
const toggleContainer = document.getElementById('theme-toggle');
const toggleText = document.querySelector('.toggle-text');
const body = document.body;


const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark');
  toggleText.textContent = 'DARK';
} else {
  body.classList.remove('dark');
  toggleText.textContent = 'LIGHT';
}

// Toggle theme
toggleContainer.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  toggleText.textContent = isDark ? 'DARK' : 'LIGHT';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


const addTaskForm = document.getElementById('add-task-form');
addTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskInput = document.getElementById('task-input');
  const text = taskInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch('/tasks/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    if (response.status === 201) {
      taskInput.value = '';
      updateTaskList(data.tasks);
    } else {
      alert(data.message || 'Error adding task');
    }
  } catch (error) {
    console.error('Add Task Error:', error);
    alert('Error adding task');
  }
});

// Delete Task
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-task')) {
    const taskId = e.target.dataset.id;
    try {
      const response = await fetch('/tasks/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const data = await response.json();
      if (response.status === 200) {
        updateTaskList(data.tasks);
      } else {
        alert(data.message || 'Error deleting task');
      }
    } catch (error) {
      console.error('Delete Task Error:', error);
      alert('Error deleting task');
    }
  }
});

// Task Done
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('task-checkbox')) {
    const taskId = e.target.dataset.id;
    try {
      const response = await fetch('/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const data = await response.json();
      if (response.status === 200) {
        updateTaskList(data.tasks);
      } else {
        alert(data.message || 'Error updating task');
      }
    } catch (error) {
      console.error('Toggle Task Error:', error);
      alert('Error updating task');
    }
  }
});


//update
function updateTaskList(tasks) {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" data-id="${task._id}" ${task.done ? 'checked' : ''}>
      <span class="task-text">${task.text}</span>
      <button class="delete-task" data-id="${task._id}">Delete</button>
    `;
    taskList.appendChild(li);
  });
}