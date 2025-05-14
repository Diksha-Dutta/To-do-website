// Select elements
const workForm = document.getElementById('work-form');
const workInput = document.getElementById('work-input');
const workList = document.getElementById('work-list');

// Load existing items from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedItems = JSON.parse(localStorage.getItem('workList')) || [];
  savedItems.forEach(item => {
    createListItem(item.text, item.bought);
  });
});

// Function to create a new list item
function createListItem(itemText, isBought = false) {
  const li = document.createElement('li');
  if (isBought) {
    li.classList.add('bought');
  }

  // Create span to display item name
  const span = document.createElement('span');
  span.textContent = itemText;
  li.appendChild(span);

  // Create bought button
  const boughtButton = document.createElement('button');
  boughtButton.textContent = isBought ? 'Undo' : 'Bought';
  boughtButton.addEventListener('click', () => {
    li.classList.toggle('bought');
    boughtButton.textContent = li.classList.contains('bought') ? 'Undo' : 'Bought';
    updateLocalStorage();
  });
  li.appendChild(boughtButton);

  // Create delete button
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    li.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
      li.remove();
      updateLocalStorage();
}, 500); // Wait for animation to finish before removal
});
li.appendChild(deleteButton);

workList.appendChild(li);
updateLocalStorage();
}

// Handle form submit
workForm.addEventListener('submit', (e) => {
e.preventDefault();

const itemText = workInput.value.trim();
if (itemText !== '') {
createListItem(itemText);
workInput.value = ''; // Clear input
}
});

// Update the localStorage with the current list state
function updateLocalStorage() {
const items = [];
document.querySelectorAll('#work-list li').forEach((li) => {
const itemText = li.querySelector('span').textContent;
const isBought = li.classList.contains('bought');
items.push({ text: itemText, bought: isBought });
});
localStorage.setItem('workList', JSON.stringify(items));
}
