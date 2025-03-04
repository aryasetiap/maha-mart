console.log("MongoDB connection file executed");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mahamart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
