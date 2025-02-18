const Event = require("../models/eventsModel");
const User = require("../models/userModel");

const getAllEvents = async (req, res) => {
  try {
    //return res.status(200).json("events");

    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events !" });
  }
};

const removeParticipantFromEvent = async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;

  try {
    // Find the event by its ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the user by userId
    const currUser = await User.findOne({ email: userId });
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already a participant
    if (event.participants.includes(currUser._id)) {
      // Remove the user from the participants list
      event.participants = event.participants.filter(
        (participant) => participant.toString() !== currUser._id.toString()
      );

      // Save the updated event
      await event.save();
      return res.status(200).json(event); // Return the updated event
    } else {
      return res.status(400).json({
        message: "User is not registered for this event",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error removing participant", error });
  }
};

// const getOneEvent=async(req, res) =>{
//   const eventId = req.params.id;
//   try {
//     const event = await Event.findById(eventId);
//     if(!event){
//       return res.status(404).json({ message: "Event not found" });
//     }
//     return res.status(200).json(event);
//   } catch (error) {

//   }
// }
const participationToEvent = async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;
  //return res.status(200).json(userId);

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    //return res.status(200).json(event.eventName);
    const currUser = await User.findOne({ email: userId });
    if (currUser) {
      if (!event.participants.includes(currUser._id)) {
        //return res.status(200).json("userId");
        event.participants.push(currUser._id);
        await event.save();
        return res.status(200).json(event);
      } else {
        return res
          .status(400)
          .json({ message: "User already registered for this event" });
      }
      //return res.status(200).json(currUser._id);
    } else {
      console.log("User not found");
      return null;
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding participant", error });
  }
};
module.exports = {
  getAllEvents,
  participationToEvent,
  removeParticipantFromEvent,
};
