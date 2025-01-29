const express = require("express");
const { startTrip, endTrip, getTrips,getdrivers } = require("../controllers/tripController");
const router = express.Router();

router.post("/", startTrip);
router.patch("/:tripId", endTrip);
router.get("/", getTrips);
router.get("/drivers", getdrivers);
module.exports = router;
