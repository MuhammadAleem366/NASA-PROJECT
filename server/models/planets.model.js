const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const { resolve } = require("path");
const { rejects } = require("assert");
const planetsModel = require("./planets.mongo");
const { get } = require("http");
const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, rejects) => {
    fs.createReadStream(path.join(__dirname, "kepler_data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          save(data.kepler_name);
        }
      })
      .on("error", (err) => {
        console.log(err);
        rejects(err);
      })
      .on("end", async () => {
        const planetsCount = (await getAllPlanets()).length;
        console.log(`${planetsCount} habitable planets found!`);
        resolve();
      });
  });
}

async function save(keplerName) {
  try {
    await planetsModel.updateOne(
      {
        keplerName: keplerName,
      },
      {
        keplerName: keplerName,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Could Not Save Planets ${error}`);
  }
}

async function getAllPlanets() {
  return await planetsModel.find({}, { __v: 0, _id: 0 });
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
