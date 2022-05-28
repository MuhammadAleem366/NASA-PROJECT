const http = require("http");
const app = require("./app");
const { loadPlanetsData } = require("../models/planets.model");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// server setup
const MONGO_URL = "http://localhost:27017/nasa";

async function startServer() {
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`Server is listening to the port ${PORT}`);
  });
}

startServer();
