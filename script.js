const MAIN_WRAPPER = document.getElementById("main-wrapper");
const MAP_WRAPPER = document.getElementById("map-wrapper");
const OBJECT_SVG = document.getElementById("map");

const SECTIONS = MAIN_WRAPPER.getElementsByTagName("section");

const BTN_MAP_FULLSCREEN = document.getElementById("map-fullscreen");

let SVG;

OBJECT_SVG.addEventListener("load", function () {
    let svgDoc = OBJECT_SVG.contentDocument;
    SVG = svgDoc.querySelector("svg");

    svgDoc.addEventListener("mousedown", () => {
        svgDoc.addEventListener("mousemove", onDrag);
        svgDoc.addEventListener("mouseup", () => {
            svgDoc.removeEventListener("mousemove", onDrag);
        });
    });

    // let area;
    // let lastArea;

    // svgDoc.addEventListener("click", (e) => {
    //     if (e.target.tagName !== "path") return;
    //     area = e.target;
    //     let list;

    //     if (area.classList[0] !== undefined) {
    //         list = [...svgDoc.querySelectorAll(`.${area.classList[0]}`)];
    //     } else {
    //         list = [area];
    //     }

    //     console.log(list);

    //     if (lastArea && lastArea !== area) {
    //         unfocusArea(lastArea);
    //         focusArea(area);
    //     } else if (lastArea == area) toggleAreaFocus(lastArea);
    //     else toggleAreaFocus(area);

    //     lastArea = e.target;
    // });

    // function toggleAreaFocus(area) {
    //     area.classList.toggle("selected");
    // }

    // function focusArea(area) {
    //     area.classList.add("selected");
    // }
    // function unfocusArea(area) {
    //     area.classList.remove("selected");
    // }

    let area;
    let lastArea = [];
    let list;

    svgDoc.addEventListener("click", (e) => {
        if (e.target.tagName !== "path") return;
        area = e.target;
        if (area.classList[0] !== undefined) {
            list = [...svgDoc.querySelectorAll(`.${area.classList[0]}`)];
            list = list.filter((item) => {
                return String(item.classList) === String(area.classList);
            });
        } else {
            list = [area];
        }

        if (lastArea && lastArea[0] !== list[0]) {
            for (let item of lastArea) {
                unfocusArea(item);
            }

            for (let item of list) {
                focusArea(item);
            }
        } else if (lastArea[0] == list[0]) {
            for (let item of lastArea) {
                toggleAreaFocus(item);
            }
        } else {
            for (let item of list) {
                toggleAreaFocus(item);
            }
        }

        //Reassurence that selected svg is on top.
        for (let area of list) {
            area.remove();
            SVG.appendChild(area);
        }
        lastArea = list;
    });

    function toggleAreaFocus(area) {
        area.classList.toggle("selected");
    }

    function focusArea(area) {
        area.classList.add("selected");
    }
    function unfocusArea(area) {
        area.classList.remove("selected");
    }

    // svgDoc.addEventListener("mouseover", () => {
    //     svgDoc.addEventListener("wheel", (event) => {
    //         if (event.deltaY < 0) {
    //             scrollPos += 1;
    //         } else if (event.deltaY > 0) {
    //             scrollPos -= 1;
    //         }
    //         mapZoom(scrollPos);
    //     });
    //     BODY.style.overflow = "hidden";
    // });

    // OBJECT_SVG.addEventListener("mouseout", () => {
    //     BODY.style.overflow = "auto";
    // });
});

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
