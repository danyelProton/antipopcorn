import { TIMEOUT_SEC } from "./config.js";

export const timeout = function(sec) {
  return new Promise (function(_, reject) {
    setTimeout(function() {
      reject(new Error ('Request timed out.'));
    }, sec * 1000);
  });
};

export const fetchDataProgram = async function(url, cinema) {
  try {
    // const req = fetch(url); //local, with cors broser extension
    // local node server : prod
    const req = process.env.NODE_ENV === 'development' ? fetch(`http://localhost:3000/fetch?url=${decodeURIComponent(url)}`) : fetch(`/fetch?url=${encodeURIComponent(url)}`);
    
    const res = await Promise.race([req, timeout(TIMEOUT_SEC)]);
    // const res = await Promise.race([req, timeout(.5)]);
    // console.log(res);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    // for LUM and FEU we fetch their program webpage, response is text; for NOS and MLA we fetch json program, response json
    const data = cinema === 'LUM' || cinema === 'FEU' ? await res.text() : await res.json();
    // console.log(data);

    const html = cinema === 'LUM' || cinema === 'FEU' ? new DOMParser().parseFromString(data, 'text/html') : new DOMParser().parseFromString(data.html, 'text/html');
    // console.log(html);

    let movieList;
    // if (cinema === 'LUM' || cinema === 'FEU') movieList = [...html.querySelectorAll('.calendar-left-table-tr')]; // Film Europe changed website
    if (cinema === 'LUM') movieList = [...html.querySelectorAll('.calendar-left-table-tr')]; // returns array of html elements
    if (cinema === 'FEU') {
      const eventsListFromScript = [...html.querySelectorAll('script')].find(el => el.textContent.includes('15:[\\\"$\\\",\\\"$L1d\\\",\\\"eventsList-1')).textContent;
      const regexEventsList = /{\\"events\\":(.*),\\"localeCode\\":/m;
      eventsListMatchGroup = eventsListFromScript.match(regexEventsList)[1];
      movieList = JSON.parse(JSON.parse(`"${eventsListMatchGroup}"`));
    }; // returns array of json objects
    if (cinema === 'MLA' || cinema === 'NOS') movieList = [...html.querySelectorAll('.media')]; // returns array of html elements

    // const movieList = cinema === 'LUM' || cinema === 'FEU' ? [...html.querySelectorAll('.calendar-left-table-tr')] : [...html.querySelectorAll('.media')];
    // console.log(movieList);

    return movieList;
  } catch(err) {
    throw err;
  }
};

export const fetchDataMovie = async function(movieUrl) {
  try {
    // const req = fetch(movieUrl); //local, with cors broser extension
    // local node server : prod
    const req = process.env.NODE_ENV === 'development' ? fetch(`http://localhost:3000/fetch?url=${decodeURIComponent(movieUrl)}`) : fetch(`/fetch?url=${encodeURIComponent(movieUrl)}`);

    const res = await Promise.race([req, timeout(TIMEOUT_SEC)]);
    // const res = await Promise.race([req, timeout(.5)]);
    // console.log(res);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.text();
    const html = new DOMParser().parseFromString(data, 'text/html');
    return html;
  } catch(err) {
    throw err;
  }
};