import View from "./view.js";

class errorView extends View {
  parentEl = document.querySelector('.program');


  addHandlerRefresh(handler) {
    this.parentEl.addEventListener('click', async function(e) {
      // console.log(e.target);
      const refreshBtn = e.target.closest('.error__reload');
      if (!refreshBtn) return;
      const movie = e.target.closest('.movie');

      movie ? await handler(movie) : location.reload();
    });
  };
}

export default new errorView();