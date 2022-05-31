const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { limit, skip } = getPagination(req.query);
  const launches = await getAllLaunches(limit, skip);
  return res.status(200).json(launches);
}

async function httpAddLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.rocket ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Some missing properties are required",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Date is not valid",
    });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId(launchId);

  if (!existsLaunch) {
    return res.status(404).json({
      error: `launch with ${launchId} not found`,
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}
module.exports = {
  httpGetAllLaunches,
  httpAddLaunch,
  httpAbortLaunch,
};
