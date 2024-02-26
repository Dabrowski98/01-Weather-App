const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const fetchForecast = async (lat, lon) => {
    if (!lat || !lon) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_KEY}&units=metric`;
    console.log(url);
    try {
        const forecast = await fetch(url, {
            method: "GET",
        });
        const forecastJson = await forecast.json();
        return forecastJson;
    } catch (err) {
        return { Error: err.stack };
    }
};

router.get("/", (req, res) => {
    res.json({ success: "FORECAST API RELAY" });
});

router.get("/:lat/:lon", async (req, res) => {
    const lat = req.params.lat;
    const lon = req.params.lon;
    const data = await fetchForecast(lat, lon);
    res.json(data);
});

router.post("/", async (req, res) => {
    const lat = req.body.lat;
    const lon = req.body.lon;
    const data = await fetchForecast(lat, lon);
    res.json(data);
});

module.exports = router;
