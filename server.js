const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const alertRoutes = require("./routes/threat.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", alertRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });