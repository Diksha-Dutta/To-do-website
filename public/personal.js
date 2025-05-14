
const personalForm = document.getElementById('personal-form');
const personalInput = document.getElementById('personal-input');
const personalList = document.getElementById('personal-list');


document.addEventListener('DOMContentLoaded', () => {
  const savedItems = JSON.parse(localStorage.getItem('personalList')) || [];
  savedItems.forEach(item => {
    createListItem(item.text, item.bought);
  });
});



function createListItem(itemText, isBought = false) {
  const li = document.createElement('li');
  if (isBought) {
    li.classList.add('bought');
  }

  const span = document.createElement('span');
  span.textContent = itemText;
  li.appendChild(span);

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
    }, 500); 
  });
  li.appendChild(deleteButton);

  personalList.appendChild(li);
  updateLocalStorage();
}


personalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const itemText = personalInput.value.trim();
  if (itemText !== '') {
    createListItem(itemText);
    personalInput.value = ''; 
  }
});


function updateLocalStorage() {
  const items = [];
  document.querySelectorAll('#personal-list li').forEach((li) => {
    const itemText = li.querySelector('span').textContent;
    const isBought = li.classList.contains('bought');
    items.push({ text: itemText, bought: isBought });
  });
  localStorage.setItem('personalList', JSON.stringify(items));
}
