require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const app = express();
const port = 3000;

const geocoding = require("./geocoding");
const forecast = require("./forecast");

app.use(express.json());

const whiteList = process.env.WHITELIST.split(",");
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 1000,
    max: 10,
});
app.use(limiter);
//test route
app.get("/", (req, res) => res.json({ success: res.statusCode }));

app.use("/geocoding", geocoding);
app.use("/forecast", forecast);

app.listen(port, () => console.log(`App listening on port ${port}`));
