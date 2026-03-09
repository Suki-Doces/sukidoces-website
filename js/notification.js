const markAllBtn = document.getElementById('mark-as-read');


const notifications = document.querySelectorAll('.notificationCard');


markAllBtn.addEventListener('click', () => {
  notifications.forEach(card => {
    card.style.display = 'none';
  });
});


const closeButtons = document.querySelectorAll('.close-btn');

closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.notificationCard');
    if (card) {
      card.style.display = 'none';
    }
  });
});


