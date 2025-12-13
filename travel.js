// app.js — simple but professional frontend logic (mocked data)
const form = document.getElementById('search-form');
const qInput = document.getElementById('q');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const guestsInput = document.getElementById('guests');
const resultsEl = document.getElementById('results');
const resultsCount = document.getElementById('results-count');
const priceRange = document.getElementById('price');
const priceOutput = document.getElementById('price-output');
const starsSelect = document.getElementById('stars');
const favoritesListEl = document.getElementById('favorites-list');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const yearSpan = document.getElementById('year');

yearSpan.textContent = new Date().getFullYear();
priceOutput.textContent = priceRange.value;

// localStorage favorites helper
function loadFavorites(){
  try { return JSON.parse(localStorage.getItem('tf_favs') || '[]'); } catch { return []; }
}
function saveFavorites(arr){ localStorage.setItem('tf_favs', JSON.stringify(arr)); }

let favorites = loadFavorites();
renderFavorites();

// wire price UI
priceRange.addEventListener('input', () => priceOutput.textContent = priceRange.value);

// mock generator
function generateMock(q, count=12){
  const city = q || 'Dream City';
  return Array.from({length: count}).map((_, i) => {
    const price = Math.round(Math.random() * 22000) + 1500;
    const stars = Math.ceil(Math.random() * 5);
    return {
      id: `${Date.now()}-${i}`,
      title: `${city} Stay #${i+1}`,
      location: `${city}, Country`,
      price, stars,
      nights: Math.ceil(Math.random()*7)+1,
      image: `https://source.unsplash.com/collection/190727/800x600?sig=${i}`,
      description: 'Comfortable stay with great location and reviews.'
    };
  });
}

// apply filters
function applyFilters(items){
  const maxPrice = Number(priceRange.value);
  const minStars = Number(starsSelect.value);
  return items.filter(it => it.price <= maxPrice && it.stars >= minStars);
}

// render results
function renderResults(items){
  resultsEl.innerHTML = '';
  if(!items.length){
    resultsEl.innerHTML = `<div class="card" style="padding:20px"><p class="muted">No results — try searching or relax filters.</p></div>`;
  } else {
    items.forEach(it => resultsEl.appendChild(cardFor(it)));
  }
  resultsCount.textContent = `(${items.length})`;
}

// create card element
function cardFor(item){
  const art = document.createElement('article');
  art.className = 'card';
  art.innerHTML = `
    <img src="${item.image}" alt="Photo of ${escapeHtml(item.title)}" />
    <div class="card-body">
      <h4>${escapeHtml(item.title)}</h4>
      <div class="meta">${escapeHtml(item.location)} • ${item.nights} nights</div>
      <div class="card-meta" style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="price">₹${item.price}</div><div class="meta">${item.stars} ★</div></div>
      </div>
      <p class="meta" style="margin:8px 0 0 0">${escapeHtml(item.description)}</p>
      <div class="card-actions">
        <button class="btn-view" data-id="${item.id}">View</button>
        <button class="btn-save" data-id="${item.id}">${isFav(item.id) ? 'Saved' : 'Save'}</button>
      </div>
    </div>
  `;
  // wire buttons
  art.querySelector('.btn-view').addEventListener('click', ()=> openModal(item));
  art.querySelector('.btn-save').addEventListener('click', (e)=>{
    e.target.textContent = toggleFavorite(item) ? 'Saved' : 'Save';
  });
  return art;
}

// favorites helpers
function isFav(id){ return favorites.some(f => f.id === id); }
function toggleFavorite(item){
  const exists = isFav(item.id);
  if(exists){
    favorites = favorites.filter(f => f.id !== item.id);
  } else {
    favorites = [item, ...favorites];
  }
  saveFavorites(favorites);
  renderFavorites();
  return !exists;
}

// render favorites list
function renderFavorites(){
  favoritesListEl.innerHTML = '';
  if(!favorites.length){
    favoritesListEl.innerHTML = `<li class="muted">No saved trips yet.</li>`;
    return;
  }
  favorites.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><strong>${escapeHtml(f.title)}</strong><div class="meta" style="font-size:13px">${escapeHtml(f.location)}</div></div>
      <div><button class="fav-remove" data-id="${f.id}">Remove</button></div>
    </div>`;
    li.querySelector('.fav-remove').addEventListener('click', ()=>{
      favorites = favorites.filter(x => x.id !== f.id);
      saveFavorites(favorites);
      renderFavorites();
      // re-render results to update Save buttons if present
      const currentItems = Array.from(resultsEl.querySelectorAll('.btn-save'));
      currentItems.forEach(b => {
        const id = b.getAttribute('data-id');
        b.textContent = isFav(id) ? 'Saved' : 'Save';
      });
    });
    favoritesListEl.appendChild(li);
  });
}

// modal
function openModal(item){
  modalContent.innerHTML = `
    <h3>${escapeHtml(item.title)}</h3>
    <p class="meta">${escapeHtml(item.location)}</p>
    <img src="${item.image}" alt="" style="width:100%;height:220px;object-fit:cover;margin-top:12px;border-radius:8px" />
    <p style="margin-top:12px">${escapeHtml(item.description)}</p>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
      <div style="font-weight:700">₹${item.price}</div>
      <button id="book-now">Book</button>
    </div>
  `;
  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('book-now').addEventListener('click', ()=> alert('Booking flow placeholder — implement backend.'));
}

function closeModal(){
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// helper: simple escape
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); }

// wire modal close
modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

// handle form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = qInput.value.trim();
  searchAndRender(q);
});

// search function
async function searchAndRender(q){
  // show loading skeleton
  resultsEl.innerHTML = '<div class="card" style="padding:18px">Searching…</div>';
  await delay(450); // simulate network
  let results = generateMock(q, 12);
  results = applyFilters(results);
  renderResults(results);
}

// utility delay
function delay(ms){ return new Promise(r => setTimeout(r, ms)); }

// initial render (empty)
renderResults([]);

// listen filter changes
priceRange.addEventListener('change', ()=> {
  // re-run search using existing query
  searchAndRender(qInput.value.trim());
});
starsSelect.addEventListener('change', ()=> searchAndRender(qInput.value.trim()));

// expose for debug
window.tf = { searchAndRender, generateMock };

// small accessibility: focus management for results
resultsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(btn && btn.dataset && btn.dataset.id){
    const id = btn.dataset.id;
    const found = Array.from(resultsEl.querySelectorAll('.card')).find(c => c.querySelector('.btn-view')?.dataset.id === id);
    if(found) found.querySelector('.btn-view').focus();
  }
});
