const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  age: {
    type: [Number],
    validate: {
      validator: function (value) {
        return value.length === 2 && value[0] < value[1];
      },
      message: "Age range must contain two values: a minimum and a maximum.",
    },
  },
  date: {
    type: String,
    required: true,
  },
  hour: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  gender: {
    type: String,
    require: true,
  },
  price:{
    type: Number,
  },
  imageUrl: {    
    type: String,

  },
});

const Event = mongoose.model("Event", eventsSchema);
module.exports = Event;
