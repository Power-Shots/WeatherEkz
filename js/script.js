const searchCityInput = document.querySelector('#searchCity'),
      searchCityBtn = document.querySelector('#searchBtn');

const main = document.querySelector('main'),
      switchBlock = main.querySelector('#switchBlock');

const regEx = {
    city: /^[a-zA-Z-, ]{3,100}$/
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


function getPressKey(e){
    if(e.code === 'Enter'){
        getCity(e);
    }
}


function showTodayWeather(data){
    console.log(data);
}


function getTodayWeather(data){
    let errorImg = main.querySelector('.error-img');

    if(data.cod >= 400 && !errorImg){
        errorImg = document.createElement('img');
        errorImg.src = 'img/404_error.png';
        errorImg.classList.add('error-img');
        main.append(errorImg);
    }
    else if(data.cod < 400){
        if(errorImg){
            errorImg.remove();
        };
        showTodayWeather(data);
    };
};


function getCity(e){
    e.preventDefault();
    let countDays = document.querySelector('.switch-day-active').getAttribute('data-countDays');
    searchCityInput.value = searchCityInput.value.toLowerCase();
    searchCityInput.value = searchCityInput.value.trim();

    if(countDays === '1'){
        fetchAsync(`https://api.openweathermap.org/data/2.5/weather?q=${searchCityInput.value}&lang=ru&appid=2e45c48feaeca4beaf24076750d9e0c7`)
        .then(data => getTodayWeather(data));
    }
    else if(countDays === '5'){
        console.log('five days');
    };
};





// Поиск города при нажатии на кнопку поиска
searchCityBtn.addEventListener('click', getCity);


//Поиск города при нажатии на клавиатуру
searchCityInput.addEventListener('keydown', getPressKey);


//Переключение количества дней
switchBlock.addEventListener('click', switchCountDay);

window.addEventListener('load', getCity)





// const myUrlToday = `https://api.openweathermap.org/data/2.5/weather?q=${searchCityInput.value}&lang=ru&appid=2e45c48feaeca4beaf24076750d9e0c7`;