/*
    v 1.5
    Autor: Alexey Zhidkov.
    date: 28.06.2021

    Weather Ekzamen
*/

'use strict';

class Theam{
    constructor(cssStyle, switchTheamBlock){
        this.cssStyle = document.querySelector(cssStyle);
        this.switchTheamBlock = document.querySelector(switchTheamBlock);
        this.start();
    }

    start(){
        this.getTheam();
        this.switchTheamBlock.addEventListener('click', this.switchTheam.bind(this));
    }

    getTheam(){
        let theam = JSON.parse(localStorage.getItem('theam'));
        if(theam){
            document.querySelector(`#${theam.selectBtn}`).classList.add('theam-active');
            this.cssStyle.href = theam.href;
        }
        else{
            document.querySelector('#dayTheam').classList.add('theam-active');
        };
    }

    switchTheam(e){
        e.preventDefault();
        let myTarget = e.target.closest('.theam');
        let activeTheam = document.querySelector('.theam-active');
        if (myTarget){
            let theamValue = myTarget.getAttribute('data-theam');
            let dataTheam = {
                selectBtn: myTarget.id,
            }
            if(activeTheam){
                activeTheam.classList.remove('theam-active');
            }

            myTarget.classList.add('theam-active');
            let urlCss = 'css/styleDark.css'
            if(theamValue === 'day'){
                urlCss = 'css/style.css'
            }
            
            this.cssStyle.href = urlCss;
            dataTheam.href = urlCss;
            this.toLocaleStorage(dataTheam);
        }
    }

    toLocaleStorage(obj){
        localStorage.setItem('theam', JSON.stringify(obj));
    }
}

class ServerLock{
    constructor(){
    }

    async getWeather(url){
        const response = await fetch(url);
        let data = await response.json();
        return data;
    }
}

class Weather{
    constructor(block, searchCityInput, searchCityBtn, switchDayBlock){
        this.api = new ServerLock();
        this.block = document.querySelector(block);
        this.searchCityInput = document.querySelector(searchCityInput);
        this.searchCityBtn = document.querySelector(searchCityBtn);
        this.switchDayBlock = document.querySelector(switchDayBlock);
        this.coords = [];
        this.dateOptions = {
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
        };
        this.start();
    }

    start(){
        this.getLocation();
        this.searchCityBtn.addEventListener('click', this.getCity.bind(this));
        this.searchCityInput.addEventListener('keydown', this.getPressKey.bind(this));
        this.switchDayBlock.addEventListener('click', this.switchCountDay.bind(this));
    };

    getPressKey(e){
        if(e.code === 'Enter'){
            this.getCity(e);
        };
    };

    switchCountDay(e){
        e.preventDefault();
        let myTarget = e.target.closest('.switch-day');
        let activeDay = document.querySelector('.switch-day-active');
        if(myTarget){
            activeDay.classList.remove('switch-day-active');
            myTarget.classList.add('switch-day-active');
            this.getCity(e);
        };
    };

    getLocation(e){
        function success(position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            if(latitude && longitude){
                this.searchCityInput.value = `${latitude}, ${longitude}`;
                this.getCity(e);
            }
        };
        
        function error(obj) {
            this.searchCityInput.value = `Kiev`;
            this.getCity(e);
        };

        let geo = navigator.geolocation.getCurrentPosition(success.bind(this), error.bind(this));
    };

    getCity(e){
        if(e){e.preventDefault();}

        let regEx = {
            cityByName: /^[a-zA-Zа-яА-Яá-źÁ-Ź-,' ]{3,100}$/,
        };
        this.searchCityInput.value = this.searchCityInput.value.toLowerCase();
        this.searchCityInput.value = this.searchCityInput.value.trim();
        if(regEx.cityByName.test(this.searchCityInput.value)){
            this.api.getWeather(`https://api.openweathermap.org/data/2.5/forecast?q=${this.searchCityInput.value}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
                .then(data => this.checkWeather(data)).catch();
        }
        else if(!regEx.cityByName.test(this.searchCityInput.value)){
            this.searchCityInput.value = this.searchCityInput.value.replace(/\s+/g, '');
            this.coords = this.searchCityInput.value.split(',');
            this.api.getWeather(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.coords[0]}&lon=${this.coords[1]}&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
                .then(data => this.checkWeather(data)).catch();
        };
    };

    checkWeather(data){
        let errorBlock = document.querySelector('.error-block');
        let countDays = document.querySelector('.switch-day-active').getAttribute('data-countDays');

        if(data.cod >= 400){
            if(!errorBlock){
                this.createError();
            }
            else {
                let unknownСity = document.querySelector('#unknownСity')
                unknownСity.innerHTML = this.searchCityInput.value;
            }
            
        }
        else if(data.cod < 400){
            if(errorBlock){
                errorBlock.remove();
            };

            if(countDays === '1'){
                if(data.count === 5){
                    this.showCityInCircle(data);
                }
                else{
                    this.showTodayWeather(data);
                }
            }
            else if(countDays === '5'){
                this.showFiveDayWeather(data);
            }
        };
    };

    showFiveDayWeather(data){
        this.searchCityInput.value = `${data.city.name}, ${data.city.country}`;
        let weatherBlock = this.block.querySelector('#weather');
        let weekdayBlock = this.block.querySelector('.weekday-block');
        let hourlyWeather = this.block.querySelector('.hourly-weather');
        let todayWeatherBlock = this.block.querySelector('.today-weather');
        let fiveDayWeather = this.block.querySelector('.five-day-weather');

        if(todayWeatherBlock){
            todayWeatherBlock.remove();
        }

        if(!weatherBlock){
            weatherBlock = document.createElement('div');
            weatherBlock.id = 'weather';
            weatherBlock.classList.add('weather-block');
            this.block.append(weatherBlock);
        }

        if(!fiveDayWeather){
            weekdayBlock = document.createElement('section');
            weekdayBlock.classList.add('weekday-block');
            
            hourlyWeather = document.createElement('section');
            hourlyWeather.classList.add('hourly-weather');   
        }

        let weekdayContent = '';
        for(let i=0; i<data.list.length; i+=8){
            let dayItem = i===0 ? 'item active-day': 'item';

            weekdayContent += `
            <div class="${dayItem}" data-index="${i}">
                <p class="weekday">${this.transormUNIX(data.list[i].dt, 'weekday')}</p>
                <p>${this.transormUNIX(data.list[i].dt, 'month-day')}</p>
                <div class="icon-block">
                    <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                </div>
                <p class="temp">${Math.round(data.list[i].main.temp)}&#176;C</p>
                <p class="description">${data.list[i].weather[0].description}</p>
            </div>`;
        };
        weekdayBlock.innerHTML = weekdayContent;


        weatherBlock.innerHTML = `
            <div class="container five-day-weather">
                ${weekdayBlock.outerHTML}
                ${hourlyWeather.outerHTML}
            </div>
        `;
        this.createHourlyWeather(data, 0);

        weekdayBlock = this.block.querySelector('.weekday-block');
        weekdayBlock.addEventListener('click', (e)=>{
            this.checkTarget(e,data);
        });
    };

    showTodayWeather(data){
        this.coords = [data.city.coord.lat, data.city.coord.lon];
        this.searchCityInput.value = `${data.city.name}, ${data.city.country}`
        let weatherBlock = this.block.querySelector('#weather');
        let currentWeatherBlock = this.block.querySelector('.current-weather');
        let hourlyWeather = this.block.querySelector('.hourly-weather');
        let todayDate = new Date().toLocaleDateString('ru', this.dateOptions.currentDate);
        let duration = data.city.sunset - data.city.sunrise;
        let fiveDayWeather = this.block.querySelector('.five-day-weather');
        let todayWeatherBlock = this.block.querySelector('.today-weather');
        if(fiveDayWeather){
            fiveDayWeather.remove();
        }
        if(!weatherBlock){
            weatherBlock = document.createElement('div');
            weatherBlock.id = 'weather';
            weatherBlock.classList.add('weather-block');
            this.block.append(weatherBlock);
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
                    <p>Sunrise: ${this.transormUNIX(data.city.sunrise,'no-remove')}</p>
                    <p>Sunset: ${this.transormUNIX(data.city.sunset,'no-remove')}</p>
                    <p>Duration: ${this.transormUNIX(duration)}</p>
                </div>
            </div>
        `;

        weatherBlock.innerHTML = `
            <div class="container today-weather">
                ${currentWeatherBlock.outerHTML}
                ${hourlyWeather.outerHTML}
            </div>
        `;

        this.createHourlyWeather(data,0,'Today');

        this.api.getWeather(`https://api.openweathermap.org/data/2.5/find?lat=${this.coords[0]}&lon=${this.coords[1]}&cnt=5&lang=en&units=metric&appid=2e45c48feaeca4beaf24076750d9e0c7`)
        .then(data => this.checkWeather(data)).catch();
    };

    showCityInCircle(data){
        let weatherBlock = this.block.querySelector('#weather .container');
        let citysBlock = this.block.querySelector('.citys-block');
        let citysBlockContent = '';

        if(!citysBlock){
            citysBlock = document.createElement('section');
            citysBlock.classList.add('citys-block');
        };
        

        for(let i=1; i<=data.list.length;i++){
            citysBlockContent += `
                <div class="item" data-cityTitle="${data.list[i].name}">
                    <div class="city-title">${data.list[i].name}</div>
                    <div class="city-weather">
                        <div>
                            <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                        </div>
                        <p>${Math.round(data.list[i].main.temp)}&#176;C</p>
                    </div>
                </div>
            `;
            if(i===4){
                citysBlock.innerHTML = `
                    <h2>Nearby places</h2>
                    <div class="grid">
                        ${citysBlockContent}
                    </div>
                `;
                break;
            }
        }

        // переключить город на один из ближайших
        citysBlock.addEventListener('click', this.changeCity.bind(this));
        weatherBlock.append(citysBlock);
    };

    changeCity(e){
        let myTarget = e.target.closest('.item');
        if(myTarget){
            this.searchCityInput.value = myTarget.getAttribute('data-cityTitle');
            this.getCity(e);
        }
    };

    checkTarget(e,data){
        let myTarget = e.target.closest('.item');
        if(myTarget){
            let activeDay = document.querySelector('.active-day');
            activeDay.classList.remove('active-day');
            myTarget.classList.add('active-day');
            let index = myTarget.getAttribute('data-index');
            this.createHourlyWeather(data, index);
        };
    };

    createHourlyWeather(data, index, countDays){
        index = +index;
        let hourlyWeather = this.block.querySelector('.hourly-weather');
        let hoursContent = '';
        let weekday = countDays?  "Today": this.transormUNIX(data.list[index].dt, 'weekday');

        for(let i= index;i<=data.list.length; i++){
            let strItem = `
                <div class="item">
                    <p class="time">${this.transormUNIX(data.list[i].dt, 'remove')}</p>
                    <div class="hour-weather-icon">
                        <img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                    </div>
                    <p>${data.list[i].weather[0].main}</p>
                    <p>${Math.round(data.list[i].main.temp)}&#176;</p>
                    <p>${Math.round(data.list[i].main['feels_like'])}&#176;</p>
                    <p>${Math.round(data.list[i].wind.speed)} ${this.transformDegreesToCardinalPoints(data.list[i].wind.deg)}</p>  
                </div>
            `
            if(i === index){
                hoursContent += `
                        <div class="item info">
                            <p class="time"><span>${weekday}</span></p>
                            <div class="hour-weather-icon"></div>
                            <p>Forecast</p>
                            <p>Temp (&#176;C)</p>
                            <p>RealFeel</p>
                            <p>Wind (km/h)</p>
                        </div>
                        ${strItem}
                `;
            }
            else if(i> index){
                hoursContent += strItem;
            };
            if(i === index+4){
                hourlyWeather.innerHTML = `
                    <h2>Hourly</h2>
                    <div class="flex">
                        ${hoursContent}
                    </div>
                    `;
                return ;
            };
        };
    };

    createError(){
        let errorBlock = document.createElement('div');
        let errorImg = document.createElement('img');
        if(this.block.querySelector('#weather')){
            this.block.querySelector('#weather').remove()
        }
        errorBlock.classList.add('error-block');
        errorImg.src = 'img/404_error.png';
        errorImg.classList.add('error-img');
        errorBlock.innerHTML = `
        <div class="container block">
            <div>
                ${errorImg.outerHTML}
            </div>
            <p><span id="unknownСity">${this.searchCityInput.value}</span> not found</p>
        </div>
        `;
        this.block.append(errorBlock)
    };

    transformDegreesToCardinalPoints(deg){
        if(deg>337 || deg<=22){
            return 'N';
        }
        if(deg>22 && deg<=67){
            return 'NE';
        }
        if(deg>67 && deg<=112){
            return 'E';
        }
        if(deg>112 && deg<=157){
            return 'SE';
        }
        if(deg>157 && deg<=202){
            return 'S';
        }
        if(deg>202 && deg<=247){
            return 'SW';
        }
        if(deg>247 && deg<=292){
            return 'W';
        }
        if(deg>292 && deg<=337){
            return 'NW';
        }
    };

    transormUNIX(date, option='remove'){
        if(option ==='remove'){
            return new Date(date*1000-10800000).toLocaleString('ru', this.dateOptions.time);
        }
        if(option === "weekday"){
            return new Date(date*1000).toLocaleString('en', this.dateOptions.dayOfWeek);
        }
        if(option === "month-day"){
            return new Date(date*1000).toLocaleString('en', this.dateOptions.monthDay);
        }
        if(option !== "remove"){
            return new Date(date*1000).toLocaleString('ru', this.dateOptions.time);
        }
    };
};



let theam1 = new Theam('#style', '#switchTheam');
let weather1 = new Weather('#content',
                           '#searchCity',
                           '#searchBtn',
                           '#switchBlock');

