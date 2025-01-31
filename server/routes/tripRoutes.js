const express = require("express");
const { startTrip, endTrip, getTrips,getdrivers,getDriverTrips,getTripByBusId } = require("../controllers/tripController");
const router = express.Router();

router.post("/", startTrip);
router.patch("/:tripId", endTrip);
router.get("/", getTrips);
router.get("/drivers", getdrivers);
router.get("/driver/:driverId", getDriverTrips);
router.get("/bus", getTripByBusId);
module.exports = router;
