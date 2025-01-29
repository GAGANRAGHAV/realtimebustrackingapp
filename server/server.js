const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");


mongoose
  .connect(
    "mongodb+srv://gaganraghav143:ayHEUY9M3RLalIKG@cluster0.wddo2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to database"))
  .catch(() => console.log("Could not connect to database"));


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
