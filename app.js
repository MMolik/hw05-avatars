// app.js

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const contactRoutes = require("./routes/api/contacts");
const usersRoutes = require("./routes/api/users");
const authenticate = require("./middlewares/authenticate");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Dodaj middleware do wszystkich tras /api/contacts
app.use("/api/contacts", authenticate, contactRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

module.exports = app;
