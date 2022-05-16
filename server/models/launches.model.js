const launches = new Map();
let latestFlightNumber = 100;
const launch = {
  flightNumber: latestFlightNumber,
  mission: "",
  launchDate: new Date("january 17,2008"),
  target: "Kepler 2",
  customers: ["1", "2"],
  success: true,
  upcoming: true,
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
  return Array.from(launches.values());
}

function addNewLaunch(incominLaunch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(incominLaunch, {
      flightNumber: latestFlightNumber,
      customers: ["1", "2"],
      success: true,
      upcoming: true,
    })
  );
}

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
