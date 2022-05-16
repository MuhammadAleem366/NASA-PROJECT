const http = require("http");
const app = require("./app");
const { loadPlanetsData } = require("../models/planets.model");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// server setup

async function startServer() {
  await loadPlanetsData();
  server.listen(PORT, () => {
    console.log(`Server is listening to the port ${PORT}`);
  });
}

startServer();
