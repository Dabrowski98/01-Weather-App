const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const fetchCoords = async (city, country) => {
    const url = `https://api.api-ninjas.com/v1/geocoding?city=${city}&country=${country}`;
    try {
        const coordinates = await fetch(url, {
            method: "GET",
            headers: {
                "X-Api-Key": process.env.API_NINJAS_KEY,
            },
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

router.get("/:city/:country?", async (req, res) => {
    const city = req.params.city;
    const country = req.params.country;
    const data = await fetchCoords(city, country);
    res.json(data);
});

router.post("/", async (req, res) => {
    const city = req.body.city;
    const country = req.body.country;
    const data = await fetchCoords(city, country);
    res.json(data);
});

module.exports = router;
