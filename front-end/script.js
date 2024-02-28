const deploy = true;

const MAIN_WRAPPER = document.getElementById("main-wrapper");
const MAP_WRAPPER = document.getElementById("map-wrapper");
const MAP = document.getElementById("map");
const INPUT_SEARCH = document.getElementById("search-input");
const SECTIONS = MAIN_WRAPPER.getElementsByTagName("section");
const MAIN_WEATHER_WRAPPER = document.getElementById("main-weather-wrapper");
const BTN_MAP_FULLSCREEN = document.getElementById("map-fullscreen");
const BTN_SEARCH = document.getElementById("search-btn");

let mapSVG;

MAP.addEventListener("load", initializeMap);
BTN_MAP_FULLSCREEN.addEventListener("click", toggleFullScreen);
BTN_SEARCH.addEventListener("click", handleSearch);

const successCallback = async (position) => {
    let { latitude, longitude } = position.coords;
    let forecast = await requestForecast(latitude, longitude);

    updateMainForecast(forecast.name, forecast.sys.country, null, forecast);
};

const errorCallback = (error) => {
    console.log(error);
};

navigator.geolocation.options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: Infinity,
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

function initializeMap() {
    let lastAreas;
    const MAP_DOCUMENT = MAP.contentDocument;
    mapSVG = MAP_DOCUMENT.querySelector("svg");

    MAP_DOCUMENT.addEventListener("click", handleClickOnArea);
    MAP_DOCUMENT.addEventListener("mousedown", handleMapPanning);

    async function handleClickOnArea(e) {
        if (e.target.tagName !== "path") return;
        let newAreas = await getAllAreasOfCountry(e);
        let selectingSameArea = [...newAreas[0].classList].includes("selected");

        handleAreaHighlight(newAreas);
        bringSelectedSvgToTop(newAreas);

        if (selectingSameArea) return;

        let countryName = await getCountryName(newAreas);
        let capitol = await getCapitol(countryName);

        let lat, lon;

        let coordinates = await requestCoordinates(capitol, countryName);

        ({ lat, lon } = coordinates[0]);

        let forecast = await requestForecast(lat, lon);

        updateMainForecast(capitol, countryName, undefined, forecast);

        // centerMapOnCountry(e.target);
    }

    function getAllAreasOfCountry(e) {
        let selectedArea = e.target;

        if (selectedArea.classList[0]) {
            return [
                ...MAP_DOCUMENT.querySelectorAll(
                    `.${selectedArea.classList[0]}`
                ),
            ].filter(
                (item) =>
                    String(item.classList) === String(selectedArea.classList)
            );
        }
        return [selectedArea];
    }

    function handleAreaHighlight(newAreas) {
        if (lastAreas) {
            lastAreas.forEach((area) => {
                if (!newAreas.includes(area)) {
                    unfocusArea(area);
                }
            });
        }

        newAreas.forEach((area) => toggleAreaFocus(area));

        lastAreas = newAreas;
    }

    function bringSelectedSvgToTop(newAreas) {
        newAreas.forEach((area) => {
            area.remove();
            mapSVG.appendChild(area);
        });
    }

    function getCountryName(newAreas) {
        if (newAreas[0].getAttribute("name")) {
            return newAreas[0].getAttribute("name");
        }

        let classList = newAreas[0].classList;
        return String(classList).endsWith("selected")
            ? String(classList).slice(0, -9)
            : String(classList);
    }

    async function getCapitol(countryName) {
        let countriesCapitolsJSON = await fetchJSONCountryCapitol();
        let matchingObject = countriesCapitolsJSON.find(
            (object) => object.country === countryName
        );
        return matchingObject ? matchingObject.city : null;
    }

    function handleMapPanning() {
        MAP_DOCUMENT.addEventListener("mousemove", onDrag);
        MAP_DOCUMENT.addEventListener("mouseup", () => {
            MAP_DOCUMENT.removeEventListener("mousemove", onDrag);
        });
    }

    // function centerMapOnCountry(countryPath) {
    //     var bbox = countryPath.getBBox();

    //     var centerX = bbox.x + bbox.width / 2;
    //     var centerY = bbox.y + bbox.height / 2;

    //     mapSVG.setAttribute(
    //         "viewBox",
    //         `${centerX - 250} ${centerY - 125} 2000 857`
    //     );
    // }

    function toggleAreaFocus(area) {
        area.classList.toggle("selected");
    }

    function unfocusArea(area) {
        area.classList.remove("selected");
    }
}

// prettier-ignore
function updateMainForecast(city, country, usState, info) {
    let mainInfo = info.main;
    let wind = info.wind;
    let weatherDesc = info.weather[0].main
    console.log(info)
    console.log(weatherDesc)
    const CURR_WEATHER_PIC = document.getElementById("curr-weather-pic")
    const CURR_COUNTRY = document.getElementById("curr-country")
    const CURR_CITY = document.getElementById("curr-city")
    const CURR_MAIN_TEMPERATURE = document.getElementById("curr-main-temperature")
    const TEMP_SPAN = CURR_MAIN_TEMPERATURE.children[0];
    const CURR_MAIN_HUMIDITY = document.getElementById("curr-main-humidity")
    const HUMIDITY_SPAN = CURR_MAIN_HUMIDITY.children[0];
    const HUMIDITY_SPAN2 = CURR_MAIN_HUMIDITY.children[1];
    const CURR_MAIN_WIND = document.getElementById("curr-main-wind")
    const WIND_SPAN = CURR_MAIN_WIND.children[0]
    const WIND_SPAN2 = CURR_MAIN_WIND.children[1]


    CURR_WEATHER_PIC.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@4x.png`
    // setWeatherPic(weatherDesc)
    
    CURR_CITY.textContent = city
    CURR_CITY.appendChild(CURR_COUNTRY)
    CURR_COUNTRY.textContent = usState ? `${country}, ${usState}` : country
    
    let sign = mainInfo.temp >= 0 ? "+" : ""
    // let unit = 
    CURR_MAIN_TEMPERATURE.textContent = `${sign + Math.round(mainInfo.temp)}°C`;
    CURR_MAIN_TEMPERATURE.appendChild(TEMP_SPAN)

    CURR_MAIN_HUMIDITY.textContent = `${mainInfo.humidity}`;
    CURR_MAIN_HUMIDITY.appendChild(HUMIDITY_SPAN)
    CURR_MAIN_HUMIDITY.appendChild(HUMIDITY_SPAN2)

    CURR_MAIN_WIND.textContent = `${Math.round(wind.speed)}`;
    CURR_MAIN_WIND.appendChild(WIND_SPAN)
    CURR_MAIN_WIND.appendChild(WIND_SPAN2)

}

let fullscreenMode = false;
function toggleFullScreen() {
    let sectionsFiltered = [...SECTIONS].filter((element) => {
        return element !== MAP_WRAPPER;
    });

    let mapObjectStyles = window.getComputedStyle(MAP);
    let left = parseInt(mapObjectStyles.left);
    let top = parseInt(mapObjectStyles.top);
    let smallscreenWidth;
    let fullscreenWidth;
    let fullscreenHeight;
    let bbox = mapSVG.getBBox();

    if (!fullscreenMode) {
        smallscreenWidth = MAP_WRAPPER.clientWidth;
    } else {
        fullscreenWidth = MAP_WRAPPER.clientWidth;
        fullscreenHeight = MAP_WRAPPER.clientHeight;
    }

    MAP.classList.toggle("full-screened");
    if (!fullscreenMode) {
        fullscreenMode = true;
        sectionsFiltered.forEach((element) => {
            element.style.visibility = "hidden";
            element.style.position = "absolute";
        });
        MAIN_WRAPPER.style.gridTemplateRows = "auto 1fr";
        MAP_WRAPPER.style.gridColumnEnd = "span 2";

        fullscreenWidth = MAP_WRAPPER.clientWidth;
        fullscreenHeight = MAP_WRAPPER.clientHeight;

        left = left + (fullscreenWidth - smallscreenWidth) / 2;

        if (top < fullscreenHeight - bbox.height)
            top = fullscreenHeight - bbox.height;
        if (left < fullscreenWidth - bbox.width)
            left = fullscreenWidth - bbox.width;
        if (left > 0) left = 0;
    } else {
        fullscreenMode = false;
        sectionsFiltered.forEach((element) => {
            element.style.visibility = "visible";
            element.style.position = "relative";
            MAP_WRAPPER.style.gridColumnEnd = "auto";
            MAIN_WRAPPER.style.gridTemplateRows = "none";
        });

        smallscreenWidth = MAP_WRAPPER.clientWidth;
        left = left - (fullscreenWidth - smallscreenWidth) / 2;
    }

    MAP.style.left = `${Math.ceil(left)}px`;
    MAP.style.top = `${Math.ceil(top)}px`;
}

async function handleSearch() {
    let input = `${INPUT_SEARCH.value}`.split(",");
    if (!input[0]) return;
    let city = `${input[0]}`.trim();
    let country = input[1] ? `${input[1]}`.trim() : null;
    let usState = input[2] ? `${input[2]}`.trim() : null;
    let lat, lon;

    let coordinates = await requestCoordinates(city, country, usState);
    ({ lat, lon } = coordinates[0]);

    let forecast = await requestForecast(lat, lon);

    updateMainForecast(city, forecast.sys.country, usState, forecast);
}

function requestCoordinates(city, country, usState) {
    let url = deploy
        ? `https://01-weather-app-back-end.vercel.app/geocoding/${city}`
        : `http://localhost:3000/geocoding/${city}`;

    let params = "";
    if (country) {
        params = usState ? `/${country}/${usState}` : `/${country}`;
    }

    return fetch(url + params)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Error:", error);
            throw error;
        });
}

function requestForecast(lat, lon) {
    let url = deploy
        ? `https://01-weather-app-back-end.vercel.app/forecast/${lat}/${lon}`
        : `http://localhost:3000/forecast/${lat}/${lon}`;

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Error:", error);
            throw error;
        });
}

function onDrag({ movementX, movementY }) {
    let mapObjectStyles = window.getComputedStyle(MAP);
    let bbox = mapSVG.getBBox();
    let left = parseInt(mapObjectStyles.left);
    let top = parseInt(mapObjectStyles.top);

    if (
        top + movementY < 0 &&
        top + movementY > -bbox.height + MAP_WRAPPER.clientHeight
    )
        MAP.style.top = `${top + movementY}px`;

    if (
        left + movementX < 0 &&
        left + movementX > -bbox.width + MAP_WRAPPER.clientWidth
    )
        MAP.style.left = `${left + movementX}px`;
}

function fetchJSONCountryCapitol() {
    return fetch("./countriesCapitols.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => data)
        .catch((error) => console.error("Unable to fetch data:", error));
}
