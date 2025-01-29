const Trip = require("../models/Trip");
const User = require("../models/User");


exports.startTrip = async (req, res) => {
  const {driverdetails, busId,  source, destinations } = req.body;

  if ( !driverdetails ||  !busId ||!source || !destinations ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const trip = await Trip.create({ driverId, busId, driverDetails, source, destinations, route });
    res.status(201).json({ success: true, trip });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.endTrip = async (req, res) => {
  const { tripId } = req.params;
  try {
    const trip = await Trip.findByIdAndUpdate(tripId, { status: "completed", endTime: Date.now() });
    res.status(200).json({ success: true, trip });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate("driverId");
    res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getdrivers = async (req, res) => {
  try{
    const drivers = await User.find({role: "driver"});
    res.status(200).json({ success: true, drivers });

  } catch(err){
    res.status(400).json({ error: err.message });
  }};
