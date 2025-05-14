const giftForm = document.getElementById('gift-form');
const giftInput = document.getElementById('gift-input');
const giftList = document.getElementById('gift-list');

// Load theme

  
  document.addEventListener('DOMContentLoaded', () => {



  // Load saved items
  const savedItems = JSON.parse(localStorage.getItem('giftList')) || [];
  savedItems.forEach(item => {
    createListItem(item.text, item.bought);
  });
});

// Create list item
function createListItem(text, isBought = false) {
  const li = document.createElement('li');
  if (isBought) li.classList.add('bought');

  const span = document.createElement('span');
  span.textContent = text;

  const boughtBtn = document.createElement('button');
  boughtBtn.textContent = isBought ? 'Undo' : 'Bought';
  boughtBtn.addEventListener('click', () => {
    li.classList.toggle('bought');
    boughtBtn.textContent = li.classList.contains('bought') ? 'Undo' : 'Bought';
    updateLocalStorage();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    li.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
      li.remove();
      updateLocalStorage();
    }, 500);
  });

  li.appendChild(span);
  li.appendChild(boughtBtn);
  li.appendChild(deleteBtn);
  giftList.appendChild(li);
  updateLocalStorage();
}

// Handle submit
giftForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = giftInput.value.trim();
  if (text !== '') {
    createListItem(text);
    giftInput.value = '';
  }
});

// Save to localStorage
function updateLocalStorage() {
  const items = [];
  document.querySelectorAll('#gift-list li').forEach(li => {
    const text = li.querySelector('span').textContent;
    const bought = li.classList.contains('bought');
    items.push({ text, bought });
  });
  localStorage.setItem('giftList', JSON.stringify(items));
}
