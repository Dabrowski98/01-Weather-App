const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const fetchCoords = async (city, country, usState) => {
    this.country = country ? country : "";
    this.usState = usState ? usState : "";

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${this.usState},${this.country}&limit=2&appid=${process.env.OPENWEATHERMAP_KEY}`;
    console.log(url);
    try {
        const coordinates = await fetch(url, {
            method: "GET",
        });
        const coordinatesJson = await coordinates.json();
        return coordinatesJson;
    } catch (err) {
        return { Error: err.stack };
    }
};

router.get("/", (req, res) => {
    res.json({ success: "GEOCODING API RELAY" });
});

router.get("/:city/:country?/:usState?", async (req, res) => {
    const city = req.params.city;
    const country = req.params.country;
    const usState = req.params.usState;
    const data = await fetchCoords(city, country, usState);
    res.json(data);
});

router.post("/", async (req, res) => {
    const city = req.body.city;
    const country = req.body.country;
    const data = await fetchCoords(city, country);
    res.json(data);
});

module.exports = router;
