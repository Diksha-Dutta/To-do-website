document.addEventListener('DOMContentLoaded', () => {
  // Alert for tasks due tomorrow
  const tasks = window.reminderTasks || [];
  if (tasks.length > 0) {
    const taskList = tasks.map(task => `${task.text} (Due: ${new Date(task.date).toLocaleDateString()})`).join('\n');
    alert(`Reminder: The following tasks are due tomorrow:\n\n${taskList}`);
  }

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

});