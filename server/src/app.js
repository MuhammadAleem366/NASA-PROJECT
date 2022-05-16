const express = require("express");
const morgan = require("morgan");

const planetsRouter = require("../routes/planets/planets.routes");
const cors = require("cors");
const { launchesRouter } = require("../routes/launches/launches.routes");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(morgan("combined"));
app.use("/planets", planetsRouter);
app.use("/launches", launchesRouter);

module.exports = app;
