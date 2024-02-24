const MAIN_WRAPPER = document.getElementById("main-wrapper");
const MAP_WRAPPER = document.getElementById("map-wrapper");
const OBJECT_SVG = document.getElementById("map");
const INPUT_SEARCH = document.getElementById("search-input");

const SECTIONS = MAIN_WRAPPER.getElementsByTagName("section");

const BTN_MAP_FULLSCREEN = document.getElementById("map-fullscreen");
const BTN_SEARCH = document.getElementById("search-btn");
let SVG;

OBJECT_SVG.addEventListener("load", function () {
    let svgDoc = OBJECT_SVG.contentDocument;
    SVG = svgDoc.querySelector("svg");
    panMap();
    handleAreaClick();

    let newArea;
    let lastAreas = [];
    let newAreas;

    function handleAreaClick() {
        svgDoc.addEventListener("click", (e) => {
            if (e.target.tagName !== "path") return;
            let newAreas = allAreasOfCountry(e);
            handleSelectingAreas(newAreas);
            bringSelectedSvgToTop(newAreas);

            let countryName;
            const classList = newAreas[0].classList;

            if (newAreas[0].getAttribute("name")) {
                countryName = newAreas[0].getAttribute("name");
            } else {
                countryName = String(classList).endsWith("selected")
                    ? String(classList).slice(0, -9)
                    : String(classList);
            }

            findCapitolforCountry(countryName);
        });
    }

    function findCapitolforCountry(countryName) {
        console.log(countryName);
        fetchJSONCountryCapitol().then((value) => {
            let x = [...value].filter((object) => {
                return object.country === countryName;
            });
            console.log(x[0].city);
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

    function allAreasOfCountry(e) {
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

    function handleSelectingAreas(newAreas) {
        if (lastAreas && lastAreas[0] !== newAreas[0]) {
            for (let item of lastAreas) {
                unfocusArea(item);
            }

            for (let item of newAreas) {
                focusArea(item);
            }
        } else if (lastAreas[0] == newAreas[0]) {
            for (let item of lastAreas) {
                toggleAreaFocus(item);
            }
        } else {
            for (let item of newAreas) {
                toggleAreaFocus(item);
            }
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

    function focusArea(area) {
        area.classList.add("selected");
    }
    function unfocusArea(area) {
        area.classList.remove("selected");
    }
});

//MAP FULLSCREEN
let fullscreenMode = false;
BTN_MAP_FULLSCREEN.addEventListener("click", (e) => {
    let sectionsFiltered = [...SECTIONS].filter((element) => {
        return element !== MAP_WRAPPER;
    });

    let getStyle = window.getComputedStyle(OBJECT_SVG);
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

    OBJECT_SVG.classList.toggle("full-screened");
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

    OBJECT_SVG.style.left = `${Math.ceil(left)}px`;
    OBJECT_SVG.style.top = `${Math.ceil(top)}px`;
});

BTN_SEARCH.addEventListener("click", (e) => {
    let input = `${INPUT_SEARCH.value}`.split(",");
    let city = `${input[0]}`.trim();
    let country = `${input[1]}`.trim();

    let coordinatesPromise = requestCoordinates(city, country);
    coordinatesPromise.then((value) => {
        console.log(value);
    });
    //TODO: Request Weather API
});

function requestCoordinates(city, country) {
    let url = `https://01-weather-app-back-end.vercel.app/geocoding/${city}/${country}`;
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
    let getStyle = window.getComputedStyle(OBJECT_SVG);
    let bbox = SVG.getBBox();
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);

    // console.log(`LEFT ${left} TOP ${top}`);

    if (
        top + movementY < 0 &&
        top + movementY > -bbox.height + MAP_WRAPPER.clientHeight
    ) {
        OBJECT_SVG.style.top = `${top + movementY}px`;
    }
    if (
        left + movementX < 0 &&
        left + movementX > -bbox.width + MAP_WRAPPER.clientWidth
    ) {
        OBJECT_SVG.style.left = `${left + movementX}px`;
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
