const toggle = document.querySelector('.dark-toggle');
const body = document.body;

toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
});
const destinationData = {
  paris: {
    img: 'Paris.jpg',
    title: 'Paris, France',
    time: 'April to June, September to November',
    budget: '$1500 - $2500'
  },
  bali: {
    img: 'Bali.jpg',
    title: 'Bali, Indonesia',
    time: 'April to October',
    budget: '$1000 - $1800'
  },
  kyoto: {
    img: 'Kyoto.jpg',
    title: 'Kyoto, Japan',
    time: 'March to May, October to November',
    budget: '$1200 - $2000'
  },
  newyork: {
    img: 'NewYork.jpg',
    title: 'New York, USA',
    time: 'April to June, September to early November',
    budget: '$1800 - $3000'
  },
  india: {
  img: 'India.jpg',
  title: 'India',
  time: 'October to March',
  budget: '$800 - $1500'
}
};

function openModal(place) {
  const data = destinationData[place];
  document.getElementById('modal-img').src = data.img;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-time').textContent = data.time;
  document.getElementById('modal-budget').textContent = data.budget;
  document.getElementById('modal').style.display = 'flex';
  document.body.classList.add('modal-open');
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.classList.remove('modal-open');
}
function toggleBlog(btn) {
  const card = btn.parentElement;
  const fullText = card.querySelector('.full');
  const shortText = card.querySelector('.short');

  if (fullText.classList.contains('hidden')) {
    fullText.classList.remove('hidden');
    btn.textContent = 'Read Less';
  } else {
    fullText.classList.add('hidden');
    btn.textContent = 'Read More';
  }
}

function filterPosts(type) {
  const cards = document.querySelectorAll('.blog-card');
  cards.forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function likePost(btn) {
  const title = btn.parentElement.querySelector('h3').textContent;
  let likes = localStorage.getItem(title) || 0;
  likes++;
  localStorage.setItem(title, likes);
  btn.querySelector('span').textContent = likes;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.blog-card').forEach(card => {
    const title = card.querySelector('h3').textContent;
    const likeBtn = card.querySelector('.like-btn span');
    likeBtn.textContent = localStorage.getItem(title) || 0;
  });
});

let places = JSON.parse(localStorage.getItem('bucketList')) || [];
renderList();

function addPlace() {
  const name = document.getElementById('place-name').value.trim();
  const status = document.getElementById('place-status').value;
  if (!name) return;
  places.push({ name, status });
  localStorage.setItem('bucketList', JSON.stringify(places));
  document.getElementById('place-name').value = '';
  renderList();
}

function editPlace(index) {
  const newName = prompt('Edit place name:', places[index].name);
  if (newName !== null && newName.trim() !== '') {
    places[index].name = newName.trim();
    localStorage.setItem('bucketList', JSON.stringify(places));
    renderList();
  }
}

function deletePlace(index) {
  if (confirm('Delete this destination?')) {
    places.splice(index, 1);
    localStorage.setItem('bucketList', JSON.stringify(places));
    renderList();
  }
}

function renderList() {
  const list = document.getElementById('bucket-list');
  list.innerHTML = '';
  let visitedCount = 0;
  places.forEach((place, index) => {
    if (place.status === 'visited') visitedCount++;
    const li = document.createElement('li');
    li.className = 'bucket-item';
    li.innerHTML = `
      <span><strong>${place.name}</strong> <span class="status ${place.status}">${place.status}</span></span>
      <span class="bucket-actions">
        <button onclick="editPlace(${index})"><i class="fas fa-edit"></i></button>
        <button onclick="deletePlace(${index})"><i class="fas fa-trash"></i></button>
      </span>
    `;
    list.appendChild(li);
  });
  animateCounter('visited-count', visitedCount);
}

function animateCounter(id, finalCount) {
  let current = 0;
  const increment = finalCount / 50;
  const counter = document.getElementById(id);
  const interval = setInterval(() => {
    current += increment;
    if (current >= finalCount) {
      current = finalCount;
      clearInterval(interval);
    }
    counter.textContent = Math.round(current);
  }, 20);
}

const form = document.getElementById('planner-form');
const historyList = document.getElementById('trip-history-list');
const summary = document.querySelector('.trip-summary');

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const destination = document.getElementById('trip-destination').value;
  const start = document.getElementById('trip-start').value;
  const end = document.getElementById('trip-end').value;
  const people = parseInt(document.getElementById('trip-people').value);
  const budget = parseFloat(document.getElementById('trip-budget').value);
  const perPerson = (budget / people).toFixed(2);

  document.getElementById('sum-destination').textContent = destination;
  document.getElementById('sum-dates').textContent = `${start} to ${end}`;
  document.getElementById('sum-people').textContent = people;
  document.getElementById('sum-per-person').textContent = perPerson;

  const weather = await getWeather(destination);
  document.getElementById('sum-weather').textContent = weather;
  summary.classList.remove('hidden');

  const trip = {
    destination, start, end, people, budget, perPerson, weather
  };
  saveTrip(trip);
  renderTripHistory();
  form.reset();
});

function saveTrip(trip) {
  const trips = JSON.parse(localStorage.getItem('tripHistory')) || [];
  trips.push(trip);
  localStorage.setItem('tripHistory', JSON.stringify(trips));
}

function renderTripHistory() {
  const trips = JSON.parse(localStorage.getItem('tripHistory')) || [];
  historyList.innerHTML = '';
  trips.forEach(trip => {
    const li = document.createElement('li');
    li.textContent = `${trip.destination} (${trip.start} to ${trip.end}) - ₹${trip.budget}`;
    historyList.appendChild(li);
  });
}

async function getWeather(city) {
  const apiKey = '92e431b65c8ff6c8dc897ba21003fa06'; // Replace with your OpenWeatherMap API key
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    if (data && data.weather && data.weather.length > 0) {
      return `${data.weather[0].description}, ${data.main.temp}°C`;
    } else {
      return 'Weather info unavailable';
    }
  } catch {
    return 'Weather fetch error';
  }
}

document.addEventListener('DOMContentLoaded', renderTripHistory);

  const backToTop = document.getElementById("backToTop");

  // Always hide it at the start
  backToTop.style.display = "none";

  // Show/hide on scroll
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY > 200) {
      backToTop.style.display = "block";
    } else {
      backToTop.style.display = "none";
    }
  });

  // Scroll to top on click
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


AOS.init();


