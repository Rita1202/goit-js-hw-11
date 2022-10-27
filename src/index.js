import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const inputEl = document.querySelector('[name="searchQuery"]');
const btnEl = document.querySelector('button');
const galleryEl = document.querySelector('.gallery');
const formEl = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');
const BASE_URL = 'https://pixabay.com/api/';
const KEY = '30799425-c4e9026dcaafc7c45135155af';
let page = 1;
let total = 0;
const axios = require('axios').default;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

loadMoreBtn.style.display = 'none';

async function fetchPhotos(value) {
  const params = new URLSearchParams({
    key: KEY,
    q: value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: page,
  });
  try {
    const response = await axios.get(`${BASE_URL}?${params}`);
    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (response.data.hits.length > 0) {
      if (page === 1) {
        Notiflix.Notify.success(
          `Hooray! We found ${response.data.totalHits} images.`
        );
      }
      if (response.data.hits.length < 40) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        total += response.data.hits.length;
      } else if (response.data.hits.length >= 40) {
        loadMoreBtn.style.display = 'block';
        total = response.data.hits.length * page;
      }
      renderMarkup(response.data.hits);
    }
  } catch (error) {
    console.log(error.message);
  }
}

formEl.addEventListener('submit', onBtnClickHandler);

function onBtnClickHandler(event) {
  event.preventDefault();
  page = 1;
  total = 0;
  galleryEl.innerHTML = '';
  value = event.target.elements.searchQuery.value.trim();
  fetchPhotos(value);
}

function renderMarkup(array) {
  const markup = array
    .map(
      ({
        webformatURL,
        comments,
        likes,
        views,
        downloads,
        tags,
        largeImageURL,
      }) => {
        return `<div class="photo-card">
  <a target="_self" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy"  />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
            ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
            ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
            ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

loadMoreBtn.addEventListener('click', loadMorePhotos);
function loadMorePhotos() {
  page += 1;
  value = inputEl.value;
  fetchPhotos(value);
}
