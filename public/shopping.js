// Select elements
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const shoppingList = document.getElementById('shopping-list');

// Load existing items from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedItems = JSON.parse(localStorage.getItem('shoppingList')) || [];
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

  shoppingList.appendChild(li);
  updateLocalStorage();
}

// Handle form submit
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const itemText = itemInput.value.trim();
  if (itemText !== '') {
    createListItem(itemText);
    itemInput.value = ''; // Clear input
  }
});

// Update the localStorage with the current list state
function updateLocalStorage() {
  const items = [];
  document.querySelectorAll('#shopping-list li').forEach((li) => {
    const itemText = li.querySelector('span').textContent;
    const isBought = li.classList.contains('bought');
    items.push({ text: itemText, bought: isBought });
  });
  localStorage.setItem('shoppingList', JSON.stringify(items));
}
