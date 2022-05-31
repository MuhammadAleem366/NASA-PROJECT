const launchesDatabase = require("./launches.mongo");
const planetsDatabase = require("./planets.mongo");
const axios = require("axios");
const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading data from space x api ", SPACEX_API_URL);
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log(`Data downloading failed`);
    throw new Error("data downloading failed");
  }
  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers: customers,
      success: launchDoc["success"],
      upcoming: launchDoc["upcoming"],
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log(`Launch Data Already exists`);
  } else {
    populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}
async function saveLaunch(incomingLaunch) {
  // checking if launch target exists in planets collection

  /**
   * we can use updateOne() method but when adding new launch it returns
   * $setOnInsert
   * according to docs it can give potential hackers detail.
   * we do not want to give hackers info that we are using mongo or mongoose
   * so we will use findOneAndUpdate()
   */

  try {
    await launchesDatabase.findOneAndUpdate(
      {
        flightNumber: incomingLaunch.flightNumber,
      },
      incomingLaunch,
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Error inserting launch ${error}`);
  }
}

async function getAllLaunches(limit, skip) {
  /**
   * find() second parameter is a projection and skips the values that are 0
   * in our case it will skip __v and _id if we want to include som values we can set 0 to 1
   *
   * limit() sets how many values we should return
   * skip() skips the values that are passed in
   * sort() is used to sort result basis on some criteria
   * in sort {flightNumber:1} sorts in ascending order -1 will sort in descending order if specified
   */

  return await launchesDatabase
    .find({}, { __v: 0, _id: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(incomingLaunch) {
  const planet = await planetsDatabase.findOne({
    keplerName: incomingLaunch.target,
  });

  if (!planet) {
    throw new Error("No match found with this target planet");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(incomingLaunch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
  });

  await saveLaunch(newLaunch);
}

async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({
    flightNumber: launchId,
  });
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.ok === 1 && aborted.nModified === 1;
}

module.exports = {
  loadLaunchData,
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
};
