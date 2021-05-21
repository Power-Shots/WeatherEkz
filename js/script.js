const style = document.querySelector('#style');

const searchCityInput = document.querySelector('#searchCity'),
      searchCityBtn = document.querySelector('#searchBtn');

const main = document.querySelector('main'),
      switchBlock = main.querySelector('#switchBlock'),
      switchTheamBlock = main.querySelector('#switchTheam');

let coords = [];

const serverLocks = {
    today: {
        currentForCity: 'https://api.openweathermap.org/data/2.5/weather?q=${searchCityInput.value}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7',
        currentForCoords: 'https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7',
    }
}

const regEx = {
    cityByName: /^[a-zA-Z-,' ]{3,100}$/,
    // cityByCoords: /^-?[0-9]{1,2).[0-9]{1,},\-?\[0]$/
}
const dateOptions = {
    currentDate: {
        month: '2-digit',
        year: 'numeric',
        day: '2-digit', 
    },
    time: {
        hour: '2-digit',
        minute: '2-digit',
    },
    dayOfWeek: {
        weekday: 'long',
    },
    monthDay: {
        month: 'short',
        day: '2-digit',
    }
}

const fetchAsync = async (url) => {
    try {
      let response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Ошибка:", error);
    }
};

function transormUNIX(date, option="add"){
    if(option ==='add'){
        return new Date(date*1000-10800000).toLocaleString('ru', dateOptions.time);
    }
    else if(option === "weekday"){
        return new Date(date*1000).toLocaleString('en', dateOptions.dayOfWeek);
    }
    else if(option === "month-day"){
        return new Date(date*1000).toLocaleString('en', dateOptions.monthDay);
    }
    else{
        return new Date(date*1000).toLocaleString('ru', dateOptions.time);
    }
}

function transformDegreesToCardinalPoints(deg){
    if(deg>337 || deg<=22){
        return 'N';
    }
    else if(deg>22 && deg<=67){
        return 'NE';
    }
    else if(deg>67 && deg<=112){
        return 'E';
    }
    else if(deg>112 && deg<=157){
        return 'SE';
    }
    else if(deg>157 && deg<=202){
        return 'S';
    }
    else if(deg>202 && deg<=247){
        return 'SW';
    }
    else if(deg>247 && deg<=292){
        return 'W'
    }
    else if(deg>292 && deg<=337){
        return 'NW'
    }
}

function getLocation(e){
    let theam = JSON.parse(localStorage.getItem('theam'));
    if(theam){
        main.querySelector(`#${theam.selectBtn}`).classList.add('theam-active');
        style.href = theam.href;
    }
    else{
        main.querySelector('#dayTheam').classList.add('theam-active')
    }

    function success(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let altitude = position.coords.altitude;
        let speed = position.coords.speed;
        if(latitude && longitude){
            searchCityInput.value = `${latitude}, ${longitude}`;
            getCity(e);
        }
    };
     
    function error(obj) {
        searchCityInput.value = `Kiev`;
        getCity(e)
    };

    let geo = navigator.geolocation.getCurrentPosition(success, error);
}


function switchCountDay(e){
    e.preventDefault();
    let myTarget = e.target.closest('.switch-day');
    let activeDay = main.querySelector('.switch-day-active');
    if(myTarget){
        activeDay.classList.remove('switch-day-active');
        myTarget.classList.add('switch-day-active');
        getCity(e);
    };
};

function switchTheam(e){
    e.preventDefault();
    let myTarget = e.target.closest('.theam');
    let activeTheam = main.querySelector('.theam-active');
    if (myTarget){
        let theamValue = myTarget.getAttribute('data-theam');
        let dataTheam = {
            selectBtn: myTarget.id,
        }
        if(activeTheam){
            activeTheam.classList.remove('theam-active');
        }

        myTarget.classList.add('theam-active');
        if(theamValue === 'day'){
            style.href = 'css/style.css';
            dataTheam.href = 'css/style.css';
            localStorage.setItem('theam', JSON.stringify(dataTheam));
        }
        else {
            style.href = 'css/styleDark.css';
            dataTheam.href = 'css/styleDark.css';
            localStorage.setItem('theam', JSON.stringify(dataTheam));
        }
    }
}

function getPressKey(e){
    if(e.code === 'Enter'){
        getCity(e);
    }
}

function changeCity(e){
    let myTarget = e.target.closest('.item');
    if(myTarget){
       searchCityInput.value = myTarget.getAttribute('data-cityTitle');
       getCity(e);
    }
}

function createError(){
    console.log(1)
    let errorBlock = document.createElement('div');
    let errorImg = document.createElement('img');
    if(main.querySelector('#weather')){
        main.querySelector('#weather').remove()
    }
    errorBlock.classList.add('error-block');
    errorImg.src = 'img/404_error.png';
    errorImg.classList.add('error-img');
    errorBlock.innerHTML = `
    <div class="container block">
        <div>
            ${errorImg.outerHTML}
        </div>
        <p><span>${searchCityInput.value}</span> not found</p>
    </div>
    `
    console.log(errorBlock)
    main.append(errorBlock)
}

function createHourlyWeather(data, index){
    index = +index;
    let hourlyWeather = main.querySelector('.hourly-weather');
    let hoursContent = '';

    for(let i= index;i<=data.list.length; i++){
        if(i === index){
            hoursContent += `
                    <div class="item info">
                        <p class="time"><span>${transormUNIX(data.list[i].dt, 'weekday')}</span></p>
                        <div class="hour-weather-icon"></div>
                        <p>Forecast</p>
                        <p>Temp (&#176;C)</p>
                        <p>RealFeel</p>
                        <p>Wind (km/h)</p>
                    </div>
                    <div class="item">
                        <p class="time">${transormUNIX(data.list[i].dt, 'add')}</p>
                        <div class="hour-weather-icon">
                            <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                        </div>
                        <p>${data.list[i].weather[0].main}</p>
                        <p>${Math.round(data.list[i].main.temp)}&#176;</p>
                        <p>${Math.round(data.list[i].main['feels_like'])}&#176;</p>
                        <p>${Math.round(data.list[i].wind.speed)} ${transformDegreesToCardinalPoints(data.list[i].wind.deg)}</p>  
                    </div>
            `;
        }
        else if(i> index){
            hoursContent += `
                <div class="item">
                    <p class="time">${transormUNIX(data.list[i].dt, 'add')}</p>
                    <div class="hour-weather-icon">
                        <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                    </div>
                    <p>${data.list[i].weather[0].main}</p>
                    <p>${Math.round(data.list[i].main.temp)}&#176;</p>
                    <p>${Math.round(data.list[i].main['feels_like'])}&#176;</p>
                    <p>${Math.round(data.list[i].wind.speed)} ${transformDegreesToCardinalPoints(data.list[i].wind.deg)}</p>  
                </div>
            `;
        };
        if(i === index+4){
            hourlyWeather.innerHTML = `
                <h2>Hourly</h2>
                <div class="flex">
                    ${hoursContent}
                </div>
                `;
            return '';
        };
    };
};

function showCityInCircle(data){
    let weatherBlock = main.querySelector('#weather .container');
    let citysBlock = main.querySelector('.citys-block');

    if(!citysBlock){
        citysBlock = document.createElement('section');
        citysBlock.classList.add('citys-block');
    }
    
    citysBlock.innerHTML = `
        <h2>Nearby places</h2>
        <div class="grid">
            <div class="item" data-cityTitle="${data.list[1].name}">
                <div class="city-title">${data.list[1].name}</div>
                <div class="city-weather">
                    <div>
                        <img src="http://openweathermap.org/img/wn/${data.list[1].weather[0].icon}.png">
                    </div>
                    <p>${Math.round(data.list[1].main.temp)}&#176;C</p>
                </div>
            </div>

            <div class="item" data-cityTitle="${data.list[2].name}">
                <div class="city-title">${data.list[2].name}</div>
                <div class="city-weather">
                    <div>
                        <img src="http://openweathermap.org/img/wn/${data.list[2].weather[0].icon}.png">
                    </div>
                    <p>${Math.round(data.list[2].main.temp)}&#176;C</p>
                </div>
            </div>

            <div class="item" data-cityTitle="${data.list[3].name}">
                <div class="city-title">${data.list[3].name}</div>
                <div class="city-weather">
                    <div>
                        <img src="http://openweathermap.org/img/wn/${data.list[3].weather[0].icon}.png">
                    </div>
                    <p>${Math.round(data.list[3].main.temp)}&#176;C</p>
                </div>
            </div>

            <div class="item" data-cityTitle="${data.list[4].name}">
                <div class="city-title">${data.list[4].name}</div>
                <div class="city-weather">
                    <div>
                        <img src="http://openweathermap.org/img/wn/${data.list[4].weather[0].icon}.png">
                    </div>
                    <p>${Math.round(data.list[4].main.temp)}&#176;C</p>
                </div>
            </div>
        </div>
    `;
    citysBlock.addEventListener('click', changeCity);
    weatherBlock.append(citysBlock);
}

//Проверка кликнутого элемента
function checkTarget(e,data){
    myTarget = e.target.closest('.item');
    if(myTarget){
        let activeDay = document.querySelector('.active-day');
        activeDay.classList.remove('active-day');
        myTarget.classList.add('active-day');
        let index = myTarget.getAttribute('data-index');
        createHourlyWeather(data, index)

    };
};

function showFiveDayWeather(data){
    console.log(data);
    searchCityInput.value = `${data.city.name}, ${data.city.country}`;
    let weatherBlock = main.querySelector('#weather');
    let weekdayBlock = main.querySelector('.weekday-block');
    let hourlyWeather = main.querySelector('.hourly-weather');
    let todayWeatherBlock = main.querySelector('.today-weather');
    let fiveDayWeather = main.querySelector('.five-day-weather');

    if(todayWeatherBlock){
        todayWeatherBlock.remove();
    }

    if(!weatherBlock){
        weatherBlock = document.createElement('div');
        weatherBlock.id = 'weather';
        weatherBlock.classList.add('weather-block');
        main.append(weatherBlock);
    }

    if(!fiveDayWeather){
        weekdayBlock = document.createElement('section');
        weekdayBlock.classList.add('weekday-block');
        
        hourlyWeather = document.createElement('section');
        hourlyWeather.classList.add('hourly-weather');   
    }

    let weekdayContent = '';
    for(let i=0; i<data.list.length; i+=8){
        if(i==0){
            weekdayContent += `
            <div class="item active-day" data-index="${i}">
                <p class="weekday">${transormUNIX(data.list[i].dt, 'weekday')}</p>
                <p>${transormUNIX(data.list[i].dt, 'month-day')}</p>
                <div class="icon-block">
                    <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                </div>
                <p class="temp">${Math.round(data.list[i].main.temp)}&#176;C</p>
                <p class="description">${data.list[i].weather[0].description}</p>
            </div>`;
        }
        else{
            weekdayContent += `
            <div class="item" data-index="${i}">
                <p class="weekday">${transormUNIX(data.list[i].dt, 'weekday')}</p>
                <p>${transormUNIX(data.list[i].dt, 'month-day')}</p>
                <div class="icon-block">
                    <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                </div>
                <p class="temp">${Math.round(data.list[i].main.temp)}&#176;C</p>
                <p class="description">${data.list[i].weather[0].description}</p>
            </div>`;
        }
    };
    weekdayBlock.innerHTML = weekdayContent;
    



console.log(hourlyWeather)


    weatherBlock.innerHTML = `
        <div class="container five-day-weather">
            ${weekdayBlock.outerHTML}
            ${hourlyWeather.outerHTML}
        </div>
    `;
    createHourlyWeather(data, 0);

    weekdayBlock = main.querySelector('.weekday-block');
    weekdayBlock.addEventListener('click', (e)=>{
        checkTarget(e,data);
    });
    
}

function showTodayWeather(data){
    coords = [data.city.coord.lat, data.city.coord.lon];
    searchCityInput.value = `${data.city.name}, ${data.city.country}`
    let weatherBlock = main.querySelector('#weather');
    let currentWeatherBlock = main.querySelector('.current-weather');
    let hourlyWeather = main.querySelector('.hourly-weather');
    let todayDate = new Date().toLocaleDateString('ru', dateOptions.currentDate);
    let fiveDayWeather = main.querySelector('.five-day-weather');
    let todayWeatherBlock = main.querySelector('.today-weather');
    if(fiveDayWeather){
        fiveDayWeather.remove();
    }
    if(!weatherBlock){
        weatherBlock = document.createElement('div');
        weatherBlock.id = 'weather';
        weatherBlock.classList.add('weather-block');
        main.append(weatherBlock);
    }
    if(!todayWeatherBlock){
        currentWeatherBlock = document.createElement('section');
        currentWeatherBlock.classList.add('current-weather');
        hourlyWeather = document.createElement('section');
        hourlyWeather.classList.add('hourly-weather');
    }

    currentWeatherBlock.innerHTML = `
        <h2 class="today-date">Погода сейчас <span>${todayDate}</span></h2>
        <div class="flex">
            <div class="item">
                <img src="http://openweathermap.org/img/wn/${data.list['0'].weather[0].icon}.png" class="weather-icon">
                <p>${data.list['0'].weather[0].description}</p>
            </div>
            <div class="item">
                <p class="current-temp">${Math.round(data.list['0'].main.temp)}&#176;C</p>
                <p>Real feel ${Math.round(data.list['0'].main['feels_like'])}&#176;C</p>
                <p></p>
            </div>
            <div class="item">
                <p>Sunrise: ${transormUNIX(data.city.sunrise,'no-add')}</p>
                <p>Sunset: ${transormUNIX(data.city.sunset,'no-add')}</p>
            </div>
        </div>
    `;

    let fiveHours = data.list.slice(0,5);
    let hourWeather = fiveHours.map(item =>`
        <div class="item">
            <p class="time">${transormUNIX(item.dt)}</p>
            <div class="hour-weather-icon">
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png">
            </div>
            <p>${item.weather[0].main}</p>
            <p>${Math.round(item.main.temp)}&#176;</p>
            <p>${Math.round(item.main['feels_like'])}&#176;</p>
            <p>${Math.round(item.wind.speed)} ${transformDegreesToCardinalPoints(item.wind.deg)}</p>  
        </div>
    `);

    hourlyWeather.innerHTML = `
        <h2>Hourly</h2>
        <div class="flex">
            <div class="item info">
                <p class="time"><span>Today</span></p>
                <div class="hour-weather-icon"></div>
                <p>Forecast</p>
                <p>Temp (&#176;C)</p>
                <p>RealFeel</p>
                <p>Wind (km/h)</p>
            </div>
            ${hourWeather.join('')}
        </div>
    `;

    weatherBlock.innerHTML = `
    <div class="container today-weather">
        ${currentWeatherBlock.outerHTML}
        ${hourlyWeather.outerHTML}
    </div>
`;

    fetchAsync(`https://api.openweathermap.org/data/2.5/find?lat=${coords[0]}&lon=${coords[1]}&cnt=5&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
    .then(data => checkWeather(data));
}


function checkWeather(data){
    let errorBlock = main.querySelector('.error-block');
    let countDays = document.querySelector('.switch-day-active').getAttribute('data-countDays');

    if(data.cod >= 400 && !errorBlock){
        createError();
    }
    else if(data.cod < 400){
        if(errorBlock){
            errorBlock.remove();
        };

        if(countDays === '1'){
            if(data.count === 5){
                showCityInCircle(data)
             }
             else{
                showTodayWeather(data);
             }
        }
        else if(countDays === '5'){
            showFiveDayWeather(data);
        }
    };
};


function getCity(e){
    e.preventDefault();
    searchCityInput.value = searchCityInput.value.toLowerCase();
    searchCityInput.value = searchCityInput.value.trim();

    if(regEx.cityByName.test(searchCityInput.value) === true){
        fetchAsync(`https://api.openweathermap.org/data/2.5/forecast?q=${searchCityInput.value}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
        .then(data => checkWeather(data));
    }
    //Поиск по кординатам
    else if(regEx.cityByName.test(searchCityInput.value) === false){
        searchCityInput.value = searchCityInput.value.replace(/\s+/g, '')
        coords = searchCityInput.value.split(',');
        fetchAsync(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords[0]}&lon=${coords[1]}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
        .then(data => checkWeather(data));
    }
};





// Поиск города при нажатии на кнопку поиска
searchCityBtn.addEventListener('click', getCity);


//Поиск города при нажатии на клавиатуру
searchCityInput.addEventListener('keydown', getPressKey);


//Переключение количества дней
switchBlock.addEventListener('click', switchCountDay);

switchTheamBlock.addEventListener('click', switchTheam);

//Определить место положение пользователя при запуске
window.addEventListener('load', getLocation);





// const myUrlToday = `https://api.openweathermap.org/data/2.5/weather?q=${searchCityInput.value}&lang=ru&appid=2e45c48feaeca4beaf24076750d9e0c7`;

