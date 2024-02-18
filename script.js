const MAIN_WRAPPER = document.getElementById("main-wrapper");
const MAP_WRAPPER = document.getElementById("map-wrapper");
const OBJECT_SVG = document.getElementById("map");

const SECTIONS = MAIN_WRAPPER.getElementsByTagName("section");

const BTN_MAP_FULLSCREEN = document.getElementById("map-fullscreen");

let SVG;
let scrollPos = 0;

OBJECT_SVG.addEventListener("load", function () {
    let svgDoc = OBJECT_SVG.contentDocument;
    SVG = svgDoc.querySelector("svg");

    svgDoc.addEventListener("mousedown", () => {
        svgDoc.addEventListener("mousemove", onDrag);
        svgDoc.addEventListener("mouseup", () => {
            svgDoc.removeEventListener("mousemove", onDrag);
        });
    });

    let lastTarget;

    svgDoc.addEventListener("click", (e) => {
        if (e.target.tagName !== "path") return;

        if (e.target.style.fill === "") {
            e.target.style.fill = "#fff3";
        } else if (e.target.style.fill === "rgba(255, 255, 255, 0.2)")
            e.target.style.fill = "";

        else if (
            lastTarget &&
            lastTarget.style.fill === "rgba(255, 255, 255, 0.2)"
        ) {
            lastTarget.style.fill = "";
            lastTarget = undefined;
        }

        lastTarget = e.target;
    });

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
        console.log(element.id);
        return element !== MAP_WRAPPER;
    });

    if (!fullscreenMode) {
        fullscreenMode = true;
        sectionsFiltered.forEach((element) => {
            // element.style.display = "none";
            element.style.visibility = "hidden";
            element.style.position = "absolute";
        });

        MAIN_WRAPPER.style.gridTemplateRows = "auto 1fr";
        MAP_WRAPPER.style.gridColumnEnd = "span 2";
    } else {
        sectionsFiltered.forEach((element) => {
            // element.style.display = "block";
            element.style.visibility = "visible";
            element.style.position = "relative";
            MAP_WRAPPER.style.gridColumnEnd = "auto";
            MAIN_WRAPPER.style.gridTemplateRows = "none";
        });
        fullscreenMode = false;
    }
});

function onDrag({ movementX, movementY }) {
    let getStyle = window.getComputedStyle(OBJECT_SVG);
    let bbox = SVG.getBBox();
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);

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

// function mapZoom(scrollPos) {
//     let transform = window.getComputedStyle(OBJECT_SVG).transform;

//     let newScale = 1 + parseFloat(scrollPos / 1000);
//     OBJECT_SVG.style.transform = `scale(${newScale}) translate(-450px, 90px)`;
//     console.log(newScale);
// }
