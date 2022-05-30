const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const { loadPlanetsData } = require("../models/planets.model");
const { loadLaunchData } = require("../models/launches.model");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// server setup
const MONGO_URL = "mongodb://localhost:27017/nasa";

// use once if you are sure that event will be emitted once

mongoose.connection.once("open", () => {
  console.log("connected to mongoose");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function startServer() {
  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
  });
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`Server is listening to the port ${PORT}`);
  });

  await loadLaunchData();
}

startServer();
