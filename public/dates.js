document.addEventListener('DOMContentLoaded', () => {

  const toggleContainer = document.getElementById('theme-toggle');
  const toggleText = toggleContainer.querySelector('.toggle-text');
  const body = document.body;

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark');
    toggleText.textContent = 'DARK';
    toggleContainer.classList.add('active');
  }

  // Toggle theme
  toggleContainer.addEventListener('click', () => {
    body.classList.toggle('dark');
    toggleContainer.classList.toggle('active');
    toggleText.textContent = body.classList.contains('dark') ? 'DARK' : 'LIGHT';
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  });

  const addTaskForm = document.getElementById('add-dated-task-form');
  const taskInput = document.getElementById('task-input');
  const taskDate = document.getElementById('task-date');
  const taskList = document.getElementById('task-list');

  // Add Dated Task
addTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const date = taskDate.value;
  if (!text) {
    alert('Task description is required');
    return;
  }
  if (!date) {
    alert('Due date is required');
    return;
  }

  try {
    const response = await fetch('/dates/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date })
    });
    const result = await response.json();
    console.log('Add Dated Task Response:', { status: response.status, result });

    if (response.ok) {
      const task = result.tasks ? result.tasks[result.tasks.length - 1] : null;
      if (!task) {
        console.error('No task found in response:', result);
        alert('Task added but could not update UI');
        location.reload(); // Fallback to reload
        return;
      }
      const li = document.createElement('li');
      li.className = `task-item ${task.done ? 'done' : ''}`;
      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" data-id="${task._id}" ${task.done ? 'checked' : ''}>
        <span class="task-text">${task.text} (Due: ${new Date(task.date).toLocaleDateString()})</span>
        <button class="delete-task" data-id="${task._id}">Delete</button>
      `;
      taskList.appendChild(li);
      taskInput.value = '';
      taskDate.value = '';
    } else {
      console.error('Server error:', result.message);
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Add Dated Task Error:', error);
    alert(`Network error: ${error.message}`);
  }
});

  // Toggle Dated Task
  taskList.addEventListener('change', async (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      const taskId = e.target.dataset.id;
      try {
        const response = await fetch('/dates/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        });
        const result = await response.json();
        if (response.ok) {
          const li = e.target.closest('li');
          li.className = `task-item ${e.target.checked ? 'done' : ''}`;
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Toggle Dated Task Error:', error);
        alert('Error updating dated task');
      }
    }
  });

  // Delete Dated Task
  taskList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-task')) {
      const taskId = e.target.dataset.id;
      try {
        const response = await fetch('/dates/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        });
        const result = await response.json();
        if (response.ok) {
          e.target.closest('li').remove();
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Delete Dated Task Error:', error);
        alert('Error deleting dated task');
      }
    }
  });
});