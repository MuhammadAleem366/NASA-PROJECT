const mongoose = require("mongoose");

// server setup
const MONGO_URL = "mongodb://localhost:27017/nasa";

// use once if you are sure that event will be emitted once

mongoose.connection.once("open", () => {
  console.log("connected to mongoose");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function connectMongo() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
  });
}

module.exports = {
  connectMongo,
};