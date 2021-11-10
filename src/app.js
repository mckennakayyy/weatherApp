//wasn't sure how to use the time to get the date so I used the Date obj
import { convertDate } from "./utils";

const form = document.querySelector('.top-banner form');
const input = document.querySelector('.top-banner input');
const msg = document.querySelector('.top-banner .msg');

form.addEventListener('submit', e => {
    e.preventDefault();
    const inputVal = input.value;
    let coordinates = {};
    let city = '';
    //fetch current date
    const todaysDate = new Date();
    //format date
    const utc = todaysDate.toJSON().slice(0, 10).replace(/-/g, '/');
  
    //fetch latitude and longitude
    const geolocationUrl = `https://se-weather-api.herokuapp.com/api/v1/geo?zip_code=${inputVal}`;
    fetch(geolocationUrl)
        .then(response => response.json())
        .then(data => {
            coordinates['latitude'] = data.latitude;
            coordinates['longitude'] = data.longitude;
            city = data.city;
            const latitude = coordinates.latitude;
            const longitude = coordinates.longitude;
            
            //check that lat & long are populated
            if (latitude !== undefined && longitude !== undefined) {
                getWeatherData(latitude, longitude, utc)
                    .then(weatherData => {
                        const dayArr = weatherData.daily.data.slice(0, 3);
                        createForecast(dayArr, city, todaysDate)
                    })
            } else {
                throw new Error()
            }
        })
        .catch(() => {
            msg.textContent = 'Please search a valid city'
        })
    
    //reset form
    msg.textContent = '';
    form.reset();
    input.focus();
});

//data being returned does not change, issue with external weather API? City and coordinates seem to be changing as expected. Tested in the browser and was getting same information returned even when manually changing the lat/long
function getWeatherData(latitude, longitude, utc) {
    const weatherUrl = `https://se-weather-api.herokuapp.com/api/v1/forecast?latitude=${latitude}&longitude=${longitude}&date=${formatDate(utc)}`
    return fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(() => {
            msg.textContent = 'No weather to display'
        })
};

function createForecast(arr, str, date) {
    const [first, second, third] = arr;
    const today = document.getElementById('today');
    const tomorrow = document.getElementById('tomorrow');
    const nextDay = document.getElementById('next-day');
    const city = document.getElementById('city');

    city.innerHTML = `<h1>WEATHER FORECAST FOR ${str.toUpperCase()}</h1>`
    today.innerHTML = forecastHtml(date, first, 0);
    tomorrow.innerHTML = forecastHtml(date, second, 1);
    nextDay.innerHTML = forecastHtml(date, third, 2);
};

function trimWords(string) {
    return string.split(' ').slice(0, 2).join(' ');
};


function formatDate(date) {
    let year = date.slice(0, 4);
    let monthAndDay = date.slice(5) + '/';
    let newDate = monthAndDay + year;
    return newDate
};

function daysOfTheWeek(date) {
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let tomorrow = weekday[date.getDay() + 1];
    let nextDay;
    if (tomorrow === 'Saturday') {
        nextDay = 'Sunday';
    } else if (tomorrow === 'Sunday') {
        nextDay = 'Monday'
    } else {
        nextDay = weekday[date.getDay() + 2];
    }
    return ['Today', tomorrow, nextDay]
};

//can't get image to render, path changes when bundled with parcel
function forecastHtml(date, day, idx) {
    return `
    <h3 class="weekday">${daysOfTheWeek(date)[idx]}:</h3>
    <div class="weather">
        <img src=\"${day.icon}.png\">
        <div>
            <p>${trimWords(day.summary)}</p>
            <p><strong>${Math.round(day.temperatureHigh)}&deg</strong> / ${Math.round(day.temperatureLow)}&deg F</p>
        </div>
    </div>`
}







