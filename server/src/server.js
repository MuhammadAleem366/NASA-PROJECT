const http = require("http");
require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const { loadPlanetsData } = require("../models/planets.model");
const { loadLaunchData } = require("../models/launches.model");
const { connectMongo } = require("../services/mongo");
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

async function startServer() {
  await connectMongo();
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`Server is listening to the port ${PORT}`);
  });

  await loadLaunchData();
}

startServer();
