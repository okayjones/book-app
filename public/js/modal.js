// Modal js
console.log('hello');

const modal = document.getElementById('modal');
const modalButton = document.getElementById('editButton');
modalButton.onclick = function() {
  modal.style.display = 'block';
};

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};
