import icons from 'url:../../img/icons.svg';

export default class View {
  data;

  render(data) {
    this.data = data;
    const markup = this.generateMarkup();
    // console.log(this.parentEl);
    this.parentEl.insertAdjacentHTML('beforeend', markup);
  }

  clear() {
    this.parentEl.innerHTML = '';
  }

  // load more button
  renderLoadMore() {
    const markup = `
      <button class="load-more">ďalšie...</button>
    `;
  // this.clear();
    this.parentEl.insertAdjacentHTML('beforeend', markup);
  }

  // 'load more' button when last page (no more results)
  renderLastPage() {
    const markup = `
      <button class="load-more load-more-end">všetko má svoj koniec...</button>
    `;
    this.parentEl.insertAdjacentHTML('beforeend', markup);
  }

  // 'loading' animation
  renderLoader() {
    const markup = `
      <div class="loader-box">
        <div class="loader"></div>
      </div>
    `;
    // this.clear();
    this.parentEl.insertAdjacentHTML('beforeend', markup);
  }

  // error message
  renderError(message, movieUrl = null) {
    const markup = `
      <div class="error-box">
        <p class="error__msg">${message}${movieUrl ? ` Alebo tu je <a class="error__link" href="${movieUrl}" target="_blank">web filmu</a>.` : ''}</p>
        <button class="error__reload">
          <svg class="icon icon-reload">
            <use href="${icons}#reload"></use>
          </svg>
        </button>
      </div>
    `;
    this.clear();
    this.parentEl.insertAdjacentHTML('beforeend', markup);
  }
}