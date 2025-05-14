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





const calendarGrid = document.getElementById('calendar-grid');
const monthYear = document.getElementById('month-year');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const notesSection = document.getElementById('notes-section');

let currentDate = new Date();
let markedDates = {}; // Format: { "YYYY-MM-DD": "note text" }

// Load marked dates from localStorage (if available)
function loadMarkedDates() {
  const savedMarkedDates = localStorage.getItem('markedDates');
  if (savedMarkedDates) {
    markedDates = JSON.parse(savedMarkedDates);
  }
}

// Save marked dates to localStorage
function saveMarkedDates() {
  localStorage.setItem('markedDates', JSON.stringify(markedDates));
}

function renderCalendar(date) {
  calendarGrid.innerHTML = '';  // Clear previous grid
  notesSection.innerHTML = '';  // Clear previous notes section
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();  // First day of the month
  const lastDate = new Date(year, month + 1, 0).getDate(); // Last date of the month

  monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

  // Add empty divs for the days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += '<div></div>';
  }

  // Create a grid of days for the current month
  for (let i = 1; i <= lastDate; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // Check if the date is marked
    if (markedDates[dateKey]) {
      dayDiv.classList.add('marked');
    }

    // Add click event to mark/unmark date
    dayDiv.addEventListener('click', () => {
      if (markedDates[dateKey]) {
        // If the date is already marked, allow user to unmark it
        delete markedDates[dateKey];
        dayDiv.classList.remove('marked');
          // Re-render notes section
      } else {
        // If not marked, mark it and show the note input area below the calendar
        markedDates[dateKey] = ''; // Initially, set the note to an empty string
        dayDiv.classList.add('marked');
         // Re-render notes section
      }
      saveMarkedDates(); 
      renderNotesSection();// Save to localStorage after any change
    });

    calendarGrid.appendChild(dayDiv);  // Append the day div to the calendar grid
  }
  renderNotesSection();
}

function renderNotesSection() {
  notesSection.innerHTML = '';  // Clear the current notes section

  // Loop through marked dates and create a note input field for each one
  for (const [dateKey, note] of Object.entries(markedDates)) {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');

    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.value = note;
    dateInput.placeholder = `Note for ${dateKey}`;
    dateInput.addEventListener('input', (e) => {
      markedDates[dateKey] = e.target.value;
      saveMarkedDates();  // Save to localStorage when a note is edited
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', () => {
      delete markedDates[dateKey];
      saveMarkedDates();
      renderCalendar(currentDate);  // Re-render the calendar to remove the mark
       // Re-render notes section

    });

    noteDiv.appendChild(dateInput);
    noteDiv.appendChild(deleteBtn);
    notesSection.appendChild(noteDiv);
  }
}

// Handle previous and next month buttons
prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// Initial render for the current month
loadMarkedDates(); // Load saved marked dates from localStorage
renderCalendar(currentDate);
