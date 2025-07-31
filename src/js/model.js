import { fetchDataProgram, fetchDataMovie } from './helpers.js';
import { RESULTS_PER_PAGE } from './config.js';



export const state = {
  movieDetail: {
    titleOriginal: '',
    country: '',
    language: '',
    year: '',
    genre: '',
    length: '',
    director: '',
    actors: '',
    description: '',
    image: '',
    youtubeId: '',
  },
  cinemaProgram: [],
  page: 1,
  pagesTotal: 1,
  filtersActive: false,
  filters: {
    startDate: '',
    endDate: '',
    cinema: '',
  },
  filteredCinemaProgram: [],
};



export const getProgramLumiereFilmEurope = async function(url, cinema) {
  try {
    const programList = await fetchDataProgram(url, cinema);

    const regexMovieId = /film-\d\d\d\d\d\d?\d?\d?\d?/gm;

    const movieDates = programList.map(mov => mov.querySelector('.ap_date').textContent);
    // console.log(movieDates);
    // find index of a movie where month of the movie is less than month of the movie before (for example Dec, next movie Jan) - LUM and FEU do not show year in dates; -1 if not found
    const newYearIndex = movieDates.findIndex((date, i) => Number(date.split('.')[1]) < Number(movieDates[i === 0 ? 0 : i - 1].split('.')[1]));
    // console.log(newYearIndex);


    const programDetails = programList.map((mov, i) => {
      const scrapedTime = mov.querySelector('.ap_time');
      const scrapedCalEventItem = mov.querySelector('.cal-event-item');

      // date as in movie program
      const dateString = mov.querySelector('.ap_date').textContent;
      // this date doesn't work in Safari
      // const date = new Date(`${dateString.split('.')[1]}-${dateString.split('.')[0]}-${newYearIndex === -1 ? new Date().getFullYear() : i < newYearIndex ? new Date().getFullYear() : new Date().getFullYear() + 1} ${mov.querySelector('.ap_time').textContent}`);
      // works in Safari, format - new Date(2024, 6, 25, 17, 30) (year, month (0-11), day, hour, minute); year + 1 for each movie index is less then newYearIndex (or -1 - see declared newYearIndex variable)
      const date = new Date(newYearIndex === -1 || i < newYearIndex  ? new Date().getFullYear() : new Date().getFullYear() + 1, Number(dateString.split('.')[1] - 1), dateString.split('.')[0], scrapedTime.textContent.split(':')[0], scrapedTime.textContent.split(':')[1]);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('sk-SK', {month: 'long'}).slice(0, 3);
      const weekday = mov.querySelector('.dlhyDen')?.textContent ?? mov.querySelector('.ap_day').textContent;
      const time = scrapedTime.textContent;
      const title = mov.querySelector('.text-underline')?.innerText ?? mov.querySelector('.shortName').innerText;
      const id = (cinema === 'LUM' ? 'LUM' : 'FEU') + scrapedCalEventItem.href.match(regexMovieId).toString().slice(5);
      const url = cinema === 'LUM' ? 'https://www.kino-lumiere.sk' + scrapedCalEventItem.pathname : 'https://www.kino.filmeurope.sk' + scrapedCalEventItem.pathname;

      return {
        cinemaShort: cinema,
        cinema: cinema === 'LUM' ? 'Lumière' : 'Film Europe',
        dateString,
        date,
        day,
        month,
        weekday,
        time,
        title,
        id,
        url,
      };
    });

    // console.log(programDetails);
    state.cinemaProgram.push(...programDetails);
    // console.log(state);
  } catch(err) {
    // console.log(err);
    throw err;
  }
};


// Film Europe only - new website
export const getProgramFilmEurope = async function(url, cinema) {
  try {
    const programList = await fetchDataProgram(url, cinema);

    const today = new Date().toLocaleDateString();
    const tomorrow = addDays(today, 1).toLocaleDateString();
    // console.log(today, tomorrow);


    const programDetails = programList.map((mov, i) => {
      const date = new Date(mov.startsAt);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('sk-SK', { month: 'long' }).slice(0, 3);

      let weekday;
      if (date.toLocaleDateString() === today) {
        weekday = 'dnes';
      } else if (date.toLocaleDateString() === tomorrow) {
        weekday = 'zajtra';
      } else {
        weekday = date.toLocaleString('sk-SK', { weekday: 'long' });
      };

      const time = date.toLocaleString('sk-SK', { hour: '2-digit', minute: '2-digit' });
      const title = mov.names.sk;
      const id = mov.show.id;
      const url = 'https://www.kino.filmeurope.sk/film/' + id;

      return {
        cinemaShort: cinema,
        cinema: cinema === 'LUM' ? 'Lumière' : 'Film Europe',
        // dateString,
        date,
        day,
        month,
        weekday,
        time,
        title,
        id,
        url,
      };
    });

    // console.log(programDetails);
    state.cinemaProgram.push(...programDetails);
    // console.log(state);
  } catch(err) {
    // console.log(err);
    throw err;
  }
};



export const getProgramNostalgiaMladost = async function(url, cinema) {
  try {
    const programList = await fetchDataProgram(url, cinema);

    const regexMovieIdNostalgia = /event\/\d\d\d\d\d\d\d?\d?\d?\//gm;
    const regexMovieIdMladost = /film-\d\d\d\d\d\d\d?\d?\d?/gm;

    // NOST and MLA return movies and inside movies are dates (here named listItems)
    const programDetails = programList.flatMap((mov, i) => {
      // console.log([...mov.children[3].children]);
      const scrapedLink = mov.querySelector('.media-heading > a');
      const listItems = [...mov.querySelectorAll('.list-group-item')].map(item => {
        const scrapedBtnBuy = item.querySelector('.btn-buy');

        // date as in movie program
        const dateString = item.children[0].textContent.slice(0, -5).replace(' ', '');
        const dateStringFull = item.children[0].textContent.replace(' ', '');
        // this date doesn't work in Safari
        // const date = new Date(`${dateStringFull.split('.')[1]}-${dateStringFull.split('.')[0]}-${dateStringFull.split('.')[2]} ${item.querySelector('.btn-buy').textContent}`);
        // works in Safari, format - new Date(2024, 6, 25, 17, 30) (year, month (0-11), day, hour, minute)
        const date = new Date(dateStringFull.split('.')[2], Number(dateStringFull.split('.')[1]) - 1, dateStringFull.split('.')[0], scrapedBtnBuy.textContent.split(':')[0], scrapedBtnBuy.textContent.split(':')[1]);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('sk-SK', {month: 'long'}).slice(0, 3);
        const weekday = item.children[1].textContent.slice(1, -1).toLowerCase();
        const time = scrapedBtnBuy.textContent;
        const title = scrapedLink.textContent;
        const id = cinema === 'NOS' ? 'NOS' + scrapedLink.href.match(regexMovieIdNostalgia).toString().slice(6, -1) : 'MLA' + scrapedLink.href.match(regexMovieIdMladost).toString().slice(5);
        const url = cinema === 'NOS' ? 'https://www.nostalgia.sk' + scrapedLink.pathname : 'https://www.kinomladost.sk' + scrapedLink.pathname;

        return {
          cinemaShort: cinema,
          cinema: cinema === 'NOS' ? 'Nostalgia' : 'Mladosť',
          dateString,
          date,
          day,
          month,
          weekday,
          time,
          title,
          id,
          url,
        };

      });
      // console.log(listItems);
      return listItems;
    });

    // console.log(programDetails);
    state.cinemaProgram.push(...programDetails);
    // console.log(state);
  } catch(err) {
    // console.log(err);
    throw err;
  } 
};



export const sortProgram = function(programList) {
  // sort - if it returns a negative value, a will be ordered before b; if  0, the ordering of a and b won’t change; if a positive value, b will be ordered before a - doesn't seem to be 100% reliable when using 'greater than' and 'less than', replaced with getTime method which returns the nr of milliseconds since the unix epoch
  // const sortedProgram = programList.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));
  const sortedProgram = programList.sort((a, b) => a.date.getTime() - b.date.getTime());
  // console.log(new Date());

  // filter out movies that had already started
  state.cinemaProgram = sortedProgram.filter(mov => mov.date > new Date());

  state.pagesTotal = Math.ceil(state.cinemaProgram.length / RESULTS_PER_PAGE);
  // console.log(state.pagesTotal);
};



export const getMovieDetails = async function(movieUrl, cinema) {
  try {
    const html = await fetchDataMovie(movieUrl);
    // console.log(html);

    let titleOriginal, country, language, year, genre, length, director, actors, description, image, youtubeId;

    const tableRowsLumFeu = [...html.querySelectorAll('tr')];
    const detailTabLumFeu = [...html.querySelectorAll('#lavyPanel > .detailfullsize > .padding')];

    // LUMIERE OR FILM EUROPE (JUST LUMIERE - FE WEBSITE CHANGED)
    // if (cinema === 'LUM' || cinema === 'FEU') {
    if (cinema === 'LUM') {
      language = [...html.querySelectorAll('.iconsContainer > .btn')].filter(el => el.className === 'btn').map(el => el.attributes.title.textContent).join(', ');
      // console.log(language);
      genre = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Žáner:')[0]?.children[1].textContent;
      // console.log(genre);
      length = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Dĺžka:')[0]?.children[1].textContent;
      // console.log(length);

      //either from inf table placed on image or from details tab
      const director1 = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Réžia:')[0]?.children[1]?.textContent;
      const director2temp = [...detailTabLumFeu.filter(el => el.className === 'padding')[0].querySelectorAll('p')].filter(el => el.textContent && [...el.children].filter(childEl => childEl.tagName === 'STRONG' && childEl.textContent.toLowerCase().includes('réžia')).length)[0];
      const director2 = director2temp ? [...director2temp.childNodes].filter(el => el.textContent.toLowerCase().includes('réžia'))[0].nextSibling.textContent.replaceAll('•', '').trim() : '';
      director = director1 ? director1 : director2 ? director2 : '';
      // console.log(director);

      //either from inf table placed on image or from details tab
      const actors1 = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Hrajú:')[0]?.children[1].textContent;
      const actors2temp = [...detailTabLumFeu.filter(el => el.className === 'padding')[0].querySelectorAll('p')].filter(el => el.textContent && [...el.children].filter(childEl => childEl.tagName === 'STRONG' && childEl.textContent.toLowerCase().includes('hrajú')).length)[0];
      const actors2 = actors2temp ? [...actors2temp.childNodes].filter(el => el.textContent.toLowerCase().includes('hrajú'))[0].nextSibling.textContent.replaceAll('•', '').trim() : '';
      actors = actors1 ? actors1 : actors2 ? actors2 : '';
      // console.log(actors);

      // h2 and p elements with text content, excluding button and those with rezia, hraju, etc. in content
      description = [...detailTabLumFeu.filter(el => el.className === 'padding')[0].querySelectorAll('h2, p')].filter(el => el.textContent && ![...el.children].filter(childEl => childEl.tagName === 'BUTTON' || (childEl.tagName === 'STRONG' && (childEl.textContent.toLowerCase().includes('réžia') || childEl.textContent.toLowerCase().includes('hrajú') || childEl.textContent.toLowerCase().includes('výroby') || childEl.textContent.toLowerCase().includes('premiéry') || childEl.textContent.toLowerCase().includes('pôvodu') || childEl.textContent.toLowerCase().includes('jazyková')))).length).map(el => el.outerHTML).join('');
      // console.log(description);
      image = html.querySelector('.hlavnePlatnoPlatno > img').attributes.src.textContent;
      // console.log(image);
      youtubeId = html.querySelector('.playYTTrailer')?.dataset?.ytid;
      // console.log(youtubeId);


      // director, actors, description - another method
      // director = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Réžia:')[0]?.children[1].textContent;
      // console.log(director);
      // actors = tableRowsLumFeu.filter(row => row.children[0].textContent === 'Hrajú:')[0]?.children[1].textContent;
      // console.log(actors);
      // description = [...detailTabLumFeu.filter(el => el.className === 'padding')[0].querySelectorAll('h2, p')].filter(el => el.textContent && !el.children.length).map(el => el.textContent).join('<br><br>');
    };

    // LUMIERE
    if (cinema === 'LUM') {
      titleOriginal = html.querySelector('.platno-header-inner > h1').attributes?.title?.textContent.trim() ?? html.querySelector('.platno-header-inner > h1').textContent.trim();
      // console.log(titleOriginal);
      country = [...html.querySelectorAll('.col > .flags > *')].map(country => country.textContent.trim()).join(', ');
      // console.log(country);
      year = html.querySelector('.event-subheader').textContent.match(/, \d\d\d\d,/gm)?.toString().slice(2, -1);
      // console.log(year);
    };

    // FILM EUROPE - FE WEBSITE CHANGED
    // if (cinema === 'FEU') {
    //   titleOriginal = html.querySelector('.info > .right > h1').attributes?.title?.textContent.trim() ?? html.querySelector('.info > .right > h1').textContent.trim();
    //   // console.log(titleOriginal);
    //   country = [...html.querySelectorAll('.detailfullsize > .padding > .flags > li')].map(country => country.textContent.trim()).join(', ');
    //   // console.log(country);
    //   year = [...html.querySelectorAll('.detailfullsize > .padding > p')].map(el => [...el.childNodes]).flat().filter(el => el.previousSibling?.textContent === 'Rok výroby:')[0]?.textContent.trim();
    //   // console.log(year);
    // };


    // FILM EUROPE


    // NOSTALGIA AND MLADOST (get some information helper function)
    const infoNosMla = function(info) {
      return [...html.querySelectorAll('.film-platno-right > p')].filter(row => row.children[0].textContent === info)[0]?.childNodes[1]?.textContent?.trim();
    };

    // NOSTALGIA
    if (cinema === 'NOS') {
      const titleOriginalTemp = html.querySelector('.program-title > .left')?.textContent;
      const titleOriginalTemp2 = (titleOriginalTemp && titleOriginalTemp.includes('/')) ? titleOriginalTemp.slice(0, titleOriginalTemp.indexOf('/')).trim() : '';
      titleOriginal = titleOriginalTemp2 ? titleOriginalTemp2 : titleOriginalTemp;
      // console.log(titleOriginal);
      country = infoNosMla('Krajina pôvodu: ');
      // console.log(country);
      language = infoNosMla('Verzia: ');
      // console.log(language);
      year = infoNosMla('Rok výroby: ');
      // console.log(year);
      genre = infoNosMla('Žáner: ');
      // console.log(genre);
      length = infoNosMla('Trvanie: ');
      // console.log(length);
      director = [...[...html.querySelectorAll('.filmOsoby > p')][0].childNodes].filter(el => el.previousSibling?.textContent === 'Réžia: ')[0].textContent.replaceAll('•', '').trim();
      // console.log(director);
      actors = [...[...html.querySelectorAll('.filmOsoby > p')][0].childNodes].filter(el => el.previousSibling?.textContent === 'Hrajú: ')[0]?.textContent;
      // console.log(actors);
      //children of popis except deskriptory obsahu
      description = [...html.querySelector('.popis').children].filter(el => el.textContent && !el.textContent.includes('Deskriptory obsahu')).map(el => el.outerHTML).join('');
      // console.log(description);
      image = html.querySelector('.img-trailer > img').attributes.src.textContent;
      // console.log(image);
      youtubeId = html.getElementById('trailerYT')?.attributes?.youtubeid?.value;
      // console.log(youtubeId);
    };

    // MLADOST
    if (cinema === 'MLA') {
      titleOriginal = html.querySelector('.film-platno-right > p')?.textContent;
      // console.log(titleOriginal);
      country = infoNosMla('Krajina pôvodu: ');
      // console.log(country);
      language = html.querySelector('.pull-right').children[0]?.textContent;
      // console.log(language);
      const yearTemp = infoNosMla('Premiéra: ');
      year = yearTemp ? yearTemp.match(/\d\d\d\d/gm)[0] : undefined;
      // console.log(year);
      genre = infoNosMla('Žáner: ');
      // console.log(genre);
      length = infoNosMla('Dĺžka: ');
      // console.log(length);
      director = [...html.querySelectorAll('.filmOsoby > p')][0] && [...[...html.querySelectorAll('.filmOsoby > p')][0].childNodes].filter(el => el.previousSibling?.textContent === 'Réžia: ')[0]?.textContent.replaceAll('•', '').trim();
      // console.log(director);
      actors = [...html.querySelectorAll('.filmOsoby > p')][0] && [...[...html.querySelectorAll('.filmOsoby > p')][0].childNodes].filter(el => el.previousSibling?.textContent === 'Hrajú: ')[0]?.textContent;
      // console.log(actors);
      description = [...html.querySelector('.popis').children].filter(el => (el.tagName === 'H3' || el.tagName === 'P') && el.textContent && !el.children.length).map(el => el.outerHTML).join('');
      // console.log(description);
      image = html.querySelector('.topPanel > div > img').attributes.src.textContent;
      // console.log(image);
      youtubeId = html.getElementById('trailerYT')?.attributes?.youtubeid?.value;
      // console.log(youtubeId);
    };

    state.movieDetail.titleOriginal = titleOriginal;
    state.movieDetail.director = director;
    state.movieDetail.actors = actors;
    state.movieDetail.year = year;
    state.movieDetail.country = country;
    state.movieDetail.length = length;
    state.movieDetail.genre = genre;
    state.movieDetail.language = language;
    state.movieDetail.description = description;
    state.movieDetail.image = image;
    state.movieDetail.url = movieUrl;
    state.movieDetail.youtubeId = youtubeId;
    // console.log(state);
  } catch(err) {
    // console.log(err);
    throw err;
  }
};



export const removeActive = function() {
  const active = [...document.querySelectorAll('.active')];
  active.forEach(mov => mov.classList.remove('active'));
};



export const removeAriaExpanded = function() {
  const expanded = [...document.querySelectorAll('.movie__overview[aria-expanded=true]')];
  expanded.forEach(mov => mov.setAttribute('aria-expanded', false));
};


// for filterProgram f
const addDays = function(date, days) {
  // setHours() is used for midnight
  const newDate1 = new Date(new Date(date).setHours(0, 0, 0, 0));
  const newDate2 = new Date(newDate1.setDate(newDate1.getDate() + days));
  return newDate2;
};


// for filterProgram f
const changeDateFilters = function(startDateOffset, endDateOffset) {
  state.filters.startDate = addDays(new Date(), startDateOffset);
  state.filters.endDate = addDays(new Date(), endDateOffset);
};



export const filterProgram = function(filter, value) {
  // if (filter === 'startDate') state.filters[filter] = value ? new Date(`${value} 00:00`) : ''; //for calendar picker
  // if (filter === 'endDate') state.filters[filter] = value ? new Date(`${value} 23:59`) : ''; //for calendar picker
  if (filter === 'date') {
    // TOD = today, TOM = tomorrow, DAT = day after tomorrow, TW = this week, NW = next week
    if (value === 'TOD') changeDateFilters(0, 1);
    if (value === 'TOM') changeDateFilters(1, 2);
    if (value === 'DAT') changeDateFilters(2, 3);
    // calculate how many days left till the end of the week (SUN is 0 in getDay())
    if (value === 'TW') changeDateFilters(0, 7 - (new Date().getDay() === 0 ? 7 : new Date().getDay()) + 1);
    // calculate when next week and ends (SUN is 0 in getDay())
    if (value === 'NW') changeDateFilters(7 - (new Date().getDay() === 0 ? 7 : new Date().getDay()) + 1, 14 - (new Date().getDay() === 0 ? 7 : new Date().getDay()) + 1);
    if (value === 'ALL') {
      state.filters.startDate = '';
      state.filters.endDate = '';
    }
  }
  if (filter === 'cinema') state.filters[filter] = value === 'ALL' ? '' : value;
  // console.log(value);

  // change filtersActive boolean state if filters exist
  Object.values(state.filters).join('') ? state.filtersActive = true : state.filtersActive = false;
  // console.log(state.filters);
  // console.log(state.filtersActive);
  state.page = 1;

  if (state.filtersActive) {
    // filter cinemaProgram array using filters (true in ternary is fallback to execute function, but filters are not applied)
    state.filteredCinemaProgram = state.cinemaProgram.filter(mov => (state.filters.startDate ? mov.date >= state.filters.startDate : true) && (state.filters.endDate ? mov.date <= state.filters.endDate : true) && (state.filters.cinema ? mov.cinemaShort === state.filters.cinema : true));
    state.pagesTotal = Math.ceil(state.filteredCinemaProgram.length / RESULTS_PER_PAGE);
    // console.log(state.pagesTotal);
    return state.filteredCinemaProgram;
  };

  if (!state.filtersActive) {
    state.filteredCinemaProgram = [];
    state.pagesTotal = Math.ceil(state.cinemaProgram.length / RESULTS_PER_PAGE);
  };
};



export const resetFilteredProgram = function() {
  // document.querySelector('.filter__start-date').value = ''; //for calendar picker
  // document.querySelector('.filter__end-date').value = ''; //for calendar picker
  document.querySelector('.filter__date').value = 'ALL';
  document.querySelector('.filter__cinema').value = 'ALL';
  state.filtersActive = false;
  state.filters.startDate = '';
  state.filters.endDate = '';
  state.filters.cinema = '';
  state.page = 1;
  state.pagesTotal = Math.ceil(state.cinemaProgram.length / RESULTS_PER_PAGE);
  state.filteredCinemaProgram = [];
  // console.log(state);
};