// התחברות משתמש
function loginUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (username && password) {
    localStorage.setItem('loggedInUser', username);
    window.location.href = '../index.html';
  }
}

// טעינה ראשונית
window.onload = () => {
  const username = localStorage.getItem('loggedInUser');
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login.html');

  if (!username && !isLoginPage) {
    window.location.href = 'pages/login.html';
    return;
  }

  if (username && isLoginPage) {
    window.location.href = '../index.html';
    return;
  }

  if (document.getElementById('polls-container')) {
    const sortType = document.body.getAttribute('data-sort') || 'newest';
    const onlyMine = document.body.getAttribute('data-only-mine') === 'true';
    loadPolls(sortType, onlyMine);
  }
};

// יצירת משאל
function createPoll(event) {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const imageInput = document.getElementById('image');
  const file = imageInput.files[0];
  const username = localStorage.getItem('loggedInUser');

  if (title && file && username) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageBase64 = e.target.result;
      const polls = JSON.parse(localStorage.getItem('polls') || '[]');
      polls.push({
        id: Date.now(),
        title,
        image: imageBase64,
        votesUp: 0,
        votesDown: 0,
        creator: username
      });
      localStorage.setItem('polls', JSON.stringify(polls));
      window.location.href = '../index.html';
    };
    reader.readAsDataURL(file);
  }
}

// טעינת משאלים
function loadPolls(sortType = 'newest', onlyMine = false) {
  let polls = JSON.parse(localStorage.getItem('polls') || '[]');
  const username = localStorage.getItem('loggedInUser');

  if (onlyMine) {
    polls = polls.filter(poll => poll.creator === username);
  }

  if (sortType === 'most') {
    polls.sort((a, b) => (b.votesUp + b.votesDown) - (a.votesUp + a.votesDown));
  } else if (sortType === 'newest') {
    polls.sort((a, b) => b.id - a.id);
  } else if (sortType === 'random') {
    for (let i = polls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [polls[i], polls[j]] = [polls[j], polls[i]];
    }
  }

  const container = document.getElementById('polls-container');
  if (!container) return;
  container.innerHTML = '';

  polls.forEach(poll => {
    const votesExist = poll.votesUp > 0 || poll.votesDown > 0;
    const canVote = username && !votesExist;
    const isAccountPage = document.body.getAttribute('data-only-mine') === 'true';

    const pollCard = document.createElement('div');
    pollCard.className = 'poll-card';
    pollCard.innerHTML = `
      <img src="${poll.image}" alt="${poll.title}" />
      <h3>${poll.title}</h3>
      ${canVote ? `
        <div class="vote-buttons">
          <div class="vote-btn up" onclick="vote(${poll.id}, 'up')"></div>
          <div class="vote-btn down" onclick="vote(${poll.id}, 'down')"></div>
        </div>
      ` : `
        <div class="vote-results">
          בעד: ${poll.votesUp || 0} | נגד: ${poll.votesDown || 0}
        </div>
      `}
      ${isAccountPage ? `<button onclick="deletePoll(${poll.id})">מחק</button>` : ''}
    `;
    container.appendChild(pollCard);
  });
}

// הצבעה
function vote(pollId, type) {
  const polls = JSON.parse(localStorage.getItem('polls') || '[]');
  const index = polls.findIndex(p => p.id === pollId);
  if (index === -1) return;

  if (type === 'up') polls[index].votesUp++;
  if (type === 'down') polls[index].votesDown++;

  localStorage.setItem('polls', JSON.stringify(polls));
  loadPolls();
}

// מחיקת משאל
function deletePoll(pollId) {
  let polls = JSON.parse(localStorage.getItem('polls') || '[]');
  polls = polls.filter(p => p.id !== pollId);
  localStorage.setItem('polls', JSON.stringify(polls));
  loadPolls(undefined, true);
}

// מעבר לעמוד יצירת משאל
function goToCreatePoll() {
  window.location.href = 'pages/create.html';
}

// התנתקות
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = '/login.html';
}

// תפריט המבורגר
function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

// סגירת התפריט בלחיצה מחוץ
document.addEventListener('click', function (event) {
  const menu = document.getElementById('menu');
  const hamburger = document.querySelector('.hamburger');

  if (
    menu &&
    hamburger &&
    menu.style.display === 'flex' &&
    !menu.contains(event.target) &&
    !hamburger.contains(event.target)
  ) {
    menu.style.display = 'none';
  }
});

// מיון משאלים מהבר התחתון
function sortPolls(type) {
  document.body.setAttribute('data-sort', type);
  const onlyMine = document.body.getAttribute('data-only-mine') === 'true';
  loadPolls(type, onlyMine);
}

document.addEventListener('DOMContentLoaded', () => {
  const sortIcons = document.querySelectorAll('[data-sort]');
  sortIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const type = icon.getAttribute('data-sort');
      sortPolls(type);
    });
  });
});
