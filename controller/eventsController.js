const Event = require("../models/eventsModel");
const User = require("../models/userModel");

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events!" });
  }
};

const participationToEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const { userId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = await User.findOne({ email: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!event.participants.includes(user._id)) {
      event.participants.push(user._id);
      await event.save();
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error adding participant", error });
  }
};

const removeParticipantFromEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const { userId } = req.body;

  try {
    const event = await Event.findById(eventId);
    const user = await User.findOne({ email: userId });

    if (!event || !user) return res.status(404).json({ message: "Not found" });

    event.participants = event.participants.filter(
      (id) => id.toString() !== user._id.toString()
    );
    await event.save();

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error removing participant", error });
  }
};
const getFilteredEvents = async (req, res) => {
  try {
    const { gender, minAge, maxAge, place } = req.query;

    let events = await Event.find();

    if (gender && gender !== "") {
      events = events.filter(event => event.gender === gender || event.gender === "all");
    }

    if (minAge && maxAge) {
      events = events.filter(event =>
        event.age &&
        event.age[0] <= maxAge &&
        event.age[1] >= minAge
      );
    }

    if (place && place.trim() !== "") {
      events = events.filter(event =>
        event.place.toLowerCase().includes(place.toLowerCase())
      );
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "שגיאה בסינון אירועים", error });
  }
};

module.exports = {
  getAllEvents,
  participationToEvent,
  removeParticipantFromEvent,
};
