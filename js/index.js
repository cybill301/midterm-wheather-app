const WEATHER_API_KEY = config.wheatherApi;

const btn = document.getElementsByClassName('btn')[0];
const selecetBox = document.getElementById('favoriteCities');

//return a favorite city from droppdown
const getSelectedData = () => {
  let element = document.getElementById('favoriteCities');
  let cityName = element.options[element.selectedIndex].text;
  // console.log(cityName);
  return cityName;
};

//showing favorite cities dropdown
const showDropdown = () => {
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i) !== 'weblioObjFlg') {
      const option = document.createElement('option');
      option.value = localStorage.key(i);
      option.text = localStorage.key(i);
      selecetBox.add(option);
    }
  }
};

//add favorite city data in localStrage and selectbox
const addFavoriteCities = (selectedCity) => {
  if (localStorage.getItem(selectedCity) !== null) {
    localStorage.removeItem(selectedCity, selectedCity);
    for (let i = 0; i < selecetBox.length; i++) {
      if (selecetBox.options[i].value == selectedCity) {
        selecetBox.remove(i);
      }
    }
  } else {
    if (selectedCity !== undefined) {
      localStorage.setItem(selectedCity, selectedCity);
      const option = document.createElement('option');
      option.value = selectedCity;
      option.text = selectedCity;
      selecetBox.add(option);
    }
  }
};

selecetBox.onchange = () => {
  getSelectedData();
};

btn.addEventListener('click', () => {
  addFavoriteCities(searchedCity);
});

// get placeInfo;
let localData;
let data;
let weatherInfo = {
  myKey: WEATHER_API_KEY,
  defaultCity: 'Vancouver',
  getWeatherInfo: async function (city) {
    const res = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.myKey}`
    );
    const data = await res.json();
    this.showData(data);
  },
  showData: function (data) {
    const { list } = data;
    let next5DaysData = [list[8], list[16], list[24], list[32], list[39]];
    //3hoursList
    this.every3HoursList(list);
    //next5days
    this.next5daysList(next5DaysData);
  },
  every3HoursList: function (list) {
    let container = document.getElementById('every_3hours');
    for (let i = 0; i < list.length; i++) {
      let day = this.datemodifiyer(list[i].dt_txt)[0];
      let time = this.datemodifiyer(list[i].dt_txt)[1];
      let icon = list[i].weather[0].icon;
      let iconImg = `http://openweathermap.org/img/wn/${icon}@2x.png`;
      let temp = list[i].main.temp;
      let innerItem = this.innerContent(day, time, iconImg, temp);
      let li = document.createElement('li');
      let input = document.getElementById('autocomplete').value;
      if (input.length !== 0 && i === 0) {
        let newList = [...container.children].filter((children) => {
          return children.getElementsByTagName('li');
        });
        this.removeChildren(newList);
      }
      li.insertAdjacentHTML('afterbegin', innerItem);
      container.appendChild(li);
    }
  },
  datemodifiyer: function (date) {
    let newDateStr = date.substr(5, 11);
    let newDate = newDateStr.split(' ');
    return newDate;
  },
  innerContent: function (day, time, icon, temp) {
    let innerElem = `
        <div class="el_container">
            <p>${day}</p>
            <p>${time}</p>
            <p class="my_icon"><img src=${icon}></p>
            <p class="my_temp">${temp}°C</p>
        </div>
        `;
    return innerElem;
  },
  next5daysList: function (list) {
    let container = document.getElementById('next_5days');
    for (let i = 0; i < list.length; i++) {
      let day = this.datemodifiyer(list[i].dt_txt)[0];
      let icon = list[i].weather[0].icon;
      let iconImg = `http://openweathermap.org/img/wn/${icon}@2x.png`;
      let temp = list[i].main.temp;
      let minTemp = list[i].main.temp_min;
      let maxTemp = list[i].main.temp_max;
      let innerItem = this.innerContent5Days(
        day,
        iconImg,
        temp,
        minTemp,
        maxTemp
      );
      let input = document.getElementById('autocomplete').value;
      if (input.length !== 0 && i === 0) {
        let newList = [...container.children].filter((children) => {
          return children.getElementsByTagName('li');
        });
        this.removeChildren(newList);
      }
      let li = document.createElement('li');
      li.insertAdjacentHTML('afterbegin', innerItem);
      container.appendChild(li);
    }
  },
  removeChildren: function (children) {
    for (let i = 0; i < children.length; i++) {
      children[i].remove();
    }
  },
  innerContent5Days: function (day, icon, temp, min, max) {
    let innerItem = `
        <div class='item_container'>
            <h4>${day}</h4>
            <img src=${icon}>
            <h4>${temp}</h4>
            <h4><span>${min}℃</span>/<span>${max}℃</span></h4>
        </div>
        `;
    return innerItem;
  },
};

weatherInfo.getWeatherInfo(weatherInfo.defaultCity);

//////////////////////////////////////////////////////////
let searchedCity;

// get lat and lng
let autocomplete;
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'),
    {
      types: ['(cities)'],
    }
  );
  autocomplete.addListener('place_changed', onPlaceChanged);
}
async function onPlaceChanged() {
  let place = autocomplete.getPlace();

  if (!place.geometry) {
    document.getElementById('autocomplete').placeholder = 'Enter';
  } else {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
      );
      const googleChosenCity = await response.json();
      searchedCity = place.name;
      // console.log('success', searchedCity);
      weatherInfo.getWeatherInfo(googleChosenCity.name);
    } catch (err) {
      console.log('err', err);
      return err;
    }
  }
}

showDropdown();
getSelectedData();
