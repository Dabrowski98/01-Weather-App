const MAP = document.getElementById("map");
const MAPWRAPPER = document.getElementById("map-wrapper");
const polska = document.getElementById("PL");

function onDrag({ deltaX, deltaY }) {
    let getStyle = window.getComputedStyle(MAPWRAPPER);
    let left = parseInt(getStyle.left);
    let top = parseInt(getStyle.top);
    MAPWRAPPER.style.left = `${left + deltaX}px`;
    MAPWRAPPER.style.top = `${top + deltaY}px`;
}

MAPWRAPPER.addEventListener("mousedown", () => {
    console.log("XD");
    MAPWRAPPER.addEventListener("mousemove", onDrag);
});

document.addEventListener("mouseup", () => {
    MAPWRAPPER.removeEventListener("mousemove", onDrag);
});

MAP.addEventListener("click", () => {
    console.log("click");
});

polska.addEventListener("click", () => {
    console.log("Polska");
});
