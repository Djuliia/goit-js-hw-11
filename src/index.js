import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { serviceGallery } from './api';

const gallery = new SimpleLightbox('.js-container a', {
  captions: true,
  captionDelay: 250,
  captionsData: 'alt',
});

const selectors = {
  form: document.querySelector('.search-form'),
  galleryList: document.querySelector('.js-container'),
  guard: document.querySelector('.js-guard'),
};

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

let page = 1;
let searchQuery;

const observer = new IntersectionObserver(handlerPagination, options);

async function handlerPagination(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      page += 1;

      try {
        const data = await serviceGallery(searchQuery, page);
        selectors.galleryList.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.hits)
        );
        gallery.refresh();
        if (page * 40 >= data.totalHits) {
          observer.unobserve(entry.target);
          Notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
        }
        const cardHeight =
          selectors.galleryList.firstElementChild.getBoundingClientRect()
            .height;

        window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
      } catch (err) {
        console.log(err);
      }
    }
  });
}

selectors.form.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();

  searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    Notiflix.Notify.warning('Please fill in the field!');
    return;
  }
  try {
    const data = await serviceGallery(searchQuery, (page = 1));

    if (data.hits.length === 0) {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

      selectors.galleryList.innerHTML = createMarkup(data.hits);
      gallery.refresh();

      const cardHeight =
        selectors.galleryList.firstElementChild.getBoundingClientRect().height;

      window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });

      if (page < data.totalHits) {
        observer.observe(selectors.guard);
      }
    }
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Oops! Something went wrong!');
  } finally {
    e.target.reset();
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy" />
      </a>
      <div class="info">
        <svg class="info-item">
          <use xlink:href="./images/sprite.svg#heart"></use>
        </svg>
        ${likes}
        <svg class="info-item">
          <use xlink:href="./images/sprite.svg#eye"></use>
        </svg> 
        ${views}
        <svg class="info-item">
          <use xlink:href="./images/sprite.svg#comment"></use>
        </svg>
        ${comments}
        <svg class="info-item">
          <use xlink:href="./images/sprite.svg#download"></use>
        </svg> 
        ${downloads}
      </div>
    </div>
    `
    )
    .join('');
}
// <div class="photo-card">
//   <a class="gallery-link" href="${largeImageURL}">
//     <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy" />
//   </a>
//   <div class="info">
//     <p class="info-item">
//       <b>Likes</b> ${likes}
//     </p>
//     <p class="info-item">
//       <b>Views</b> ${views}
//     </p>
//     <p class="info-item">
//       <b>Comments</b> ${comments}
//     </p>
//     <p class="info-item">
//       <b>Downloads</b> ${downloads}
//     </p>
//   </div>
// </div>
