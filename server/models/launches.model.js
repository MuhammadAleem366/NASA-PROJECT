const launchesDatabase = require("./launches.mongo");
const planetsDatabase = require("./planets.mongo");
const axios = require("axios");
const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: DEFAULT_FLIGHT_NUMBER,
  mission: "",
  launchDate: new Date("january 17,2008"),
  target: "Kepler-1652 b",
  customers: ["1", "2"],
  success: true,
  upcoming: true,
};

// launches.set(launch.flightNumber, launch);
saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
async function loadLaunchData() {
  console.log("Downloading data from space x api ", SPACEX_API_URL);
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
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
      target: "Kepler-1652 b",
      customers: customers,
      success: launchDoc["success"],
      upcoming: launchDoc["upcoming"],
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
}

async function saveLaunch(incomingLaunch) {
  // checking if launch target exists in planets collection

  const planet = await planetsDatabase.findOne({
    keplerName: incomingLaunch.target,
  });

  if (!planet) {
    throw new Error("No match found with this target planet");
  }

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
        flightNumber: launch.flightNumber,
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

async function getAllLaunches() {
  return await launchesDatabase.find({}, { __v: 0, _id: 0 });
}

async function scheduleNewLaunch(incomingLaunch) {
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
