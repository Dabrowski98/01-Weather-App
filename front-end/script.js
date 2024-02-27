const DEPLOY = false;
const MAIN_WRAPPER = document.getElementById("main-wrapper");
const MAP_WRAPPER = document.getElementById("map-wrapper");
const MAP = document.getElementById("map");
const INPUT_SEARCH = document.getElementById("search-input");
const SECTIONS = MAIN_WRAPPER.getElementsByTagName("section");
const BTN_MAP_FULLSCREEN = document.getElementById("map-fullscreen");
const BTN_SEARCH = document.getElementById("search-btn");

let SVG;

MAP.addEventListener("load", initializeMap);
BTN_MAP_FULLSCREEN.addEventListener("click", toggleFullScreen);
BTN_SEARCH.addEventListener("click", handleSearch);

function initializeMap() {
    let lastAreas, newArea, newAreas;
    let svgDoc = MAP.contentDocument;

    SVG = svgDoc.querySelector("svg");
    panMap();
    //handleAreaClick();

    svgDoc.addEventListener("click", handleClickOnSVGPath);

    async function handleClickOnSVGPath(e) {
        if (e.target.tagName !== "path") return;

        let newAreas = await getAllAreasOfCountry(e);
        let selectingNewArea = [...newAreas[0].classList].includes("selected");
        handleAreaHighlight(newAreas);
        bringSelectedSvgToTop(newAreas);

        if (selectingNewArea) return;

        let countryName = await getCountryName(newAreas);
        let capitol = await findCapitolforCountry(countryName);

        let lat;
        let lon;

        await requestCoordinates(capitol, countryName).then((value) => {
            let obj = value[0];
            lat = obj.lat;
            lon = obj.lon;
        });
        setTimeout(() => {
            requestForecast(lat, lon).then((value) => {
                updateMainForecast(capitol, countryName, undefined, value);
            });
        }, 1000);

        // centerMapOnCountry(e.target);
    }

    function getCountryName(newAreas) {
        let classList = newAreas[0].classList;
        let countryName;
        if (newAreas[0].getAttribute("name")) {
            countryName = newAreas[0].getAttribute("name");
        } else {
            countryName = String(classList).endsWith("selected")
                ? String(classList).slice(0, -9)
                : String(classList);
        }
        return countryName;
    }

    function centerMapOnCountry(countryPath) {
        var bbox = countryPath.getBBox();

        var centerX = bbox.x + bbox.width / 2;
        var centerY = bbox.y + bbox.height / 2;

        SVG.setAttribute(
            "viewBox",
            `${centerX - 250} ${centerY - 125} 2000 857`
        );
    }

    function findCapitolforCountry(countryName) {
        console.log(countryName);
        return fetchJSONCountryCapitol().then((value) => {
            let correctObject = value.filter(
                (object) => object.country === countryName
            );
            return correctObject[0].city;
        });
    }

    function panMap() {
        svgDoc.addEventListener("mousedown", () => {
            svgDoc.addEventListener("mousemove", onDrag);
            svgDoc.addEventListener("mouseup", () => {
                svgDoc.removeEventListener("mousemove", onDrag);
            });
        });
    }

    function getAllAreasOfCountry(e) {
        newArea = e.target;

        if (newArea.classList[0] !== undefined) {
            newAreas = [...svgDoc.querySelectorAll(`.${newArea.classList[0]}`)];
            newAreas = newAreas.filter((item) => {
                return String(item.classList) === String(newArea.classList);
            });
        } else {
            newAreas = [newArea];
        }

        return newAreas;
    }

    function handleAreaHighlight(newAreas) {
        if (lastAreas) {
            for (let item of lastAreas) {
                if (!newAreas.includes(item)) {
                    unfocusArea(item);
                }
            }
        }

        for (let item of newAreas) {
            toggleAreaFocus(item);
        }

        lastAreas = newAreas;
    }

    function bringSelectedSvgToTop(newAreas) {
        for (let newArea of newAreas) {
            newArea.remove();
            SVG.appendChild(newArea);
        }
    }

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


    let sign = mainInfo.temp >= 0 ? "+" : ""
    CURR_WEATHER_PIC.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@4x.png`
    // setWeatherPic(weatherDesc)

    CURR_CITY.textContent = city
    CURR_CITY.appendChild(CURR_COUNTRY)
    CURR_COUNTRY.textContent = country

    CURR_MAIN_TEMPERATURE.textContent = `${sign + Math.round(mainInfo.temp)}°C`;
    CURR_MAIN_TEMPERATURE.appendChild(TEMP_SPAN)

    CURR_MAIN_HUMIDITY.textContent = `${mainInfo.humidity}`;
    CURR_MAIN_HUMIDITY.appendChild(HUMIDITY_SPAN)
    CURR_MAIN_HUMIDITY.appendChild(HUMIDITY_SPAN2)

    CURR_MAIN_WIND.textContent = `${Math.round(wind.speed)}`;
    CURR_MAIN_WIND.appendChild(WIND_SPAN)
    CURR_MAIN_WIND.appendChild(WIND_SPAN2)

}

function toggleFullScreen() {
    let fullscreenMode = false;
    let sectionsFiltered = [...SECTIONS].filter((element) => {
        return element !== MAP_WRAPPER;
    });

    let getStyle = window.getComputedStyle(MAP);
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);
    let smallWindowWidth;
    let bigWindowWidth;
    let bigWindowHeight;
    let bbox = SVG.getBBox();

    if (!fullscreenMode) {
        smallWindowWidth = MAP_WRAPPER.clientWidth;
    } else {
        bigWindowWidth = MAP_WRAPPER.clientWidth;
        bigWindowHeight = MAP_WRAPPER.clientHeight;
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

        //Handling coords when changing fs mode
        bigWindowWidth = MAP_WRAPPER.clientWidth;
        bigWindowHeight = MAP_WRAPPER.clientHeight;

        left = left + (bigWindowWidth - smallWindowWidth) / 2;

        if (top < bigWindowHeight - bbox.height)
            top = bigWindowHeight - bbox.height;
        if (left < bigWindowWidth - bbox.width)
            left = bigWindowWidth - bbox.width;
        if (left > 0) left = 0;
    } else {
        fullscreenMode = false;
        sectionsFiltered.forEach((element) => {
            element.style.visibility = "visible";
            element.style.position = "relative";
            MAP_WRAPPER.style.gridColumnEnd = "auto";
            MAIN_WRAPPER.style.gridTemplateRows = "none";
        });

        //Handling coords when changing fs mode
        smallWindowWidth = MAP_WRAPPER.clientWidth;

        left = left - (bigWindowWidth - smallWindowWidth) / 2;
    }

    MAP.style.left = `${Math.ceil(left)}px`;
    MAP.style.top = `${Math.ceil(top)}px`;
}

async function handleSearch() {
    let input = `${INPUT_SEARCH.value}`.split(",");
    let city = input[0] ? `${input[0]}`.trim() : " ";
    let country = input[1] ? `${input[1]}`.trim() : " ";
    let usState = input[2] ? `${input[2]}`.trim() : " ";
    let lat;
    let lon;
    await requestCoordinates(city, country, usState).then((data) => {
        let obj = data[0];
        lat = obj.lat;
        lon = obj.lon;
    });

    await requestForecast(lat, lon).then((data) => {
        updateMainForecast(city, data.sys.country, usState, data);
    });
}

function requestCoordinates(city, country, usState) {
    let url = DEPLOY
        ? `https://01-weather-app-back-end.vercel.app/geocoding/${city}`
        : `http://localhost:3000/geocoding/${city}`;
    let params;

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
    let url = DEPLOY
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
    let getStyle = window.getComputedStyle(MAP);
    let bbox = SVG.getBBox();
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);

    // console.log(`LEFT ${left} TOP ${top}`);

    if (
        top + movementY < 0 &&
        top + movementY > -bbox.height + MAP_WRAPPER.clientHeight
    ) {
        MAP.style.top = `${top + movementY}px`;
    }
    if (
        left + movementX < 0 &&
        left + movementX > -bbox.width + MAP_WRAPPER.clientWidth
    ) {
        MAP.style.left = `${left + movementX}px`;
    }
}

function fetchJSONCountryCapitol() {
    return fetch("./country-capitol.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => data)
        .catch((error) => console.error("Unable to fetch data:", error));
}

function setWeatherPic(weatherDesc) {
    return;
}
