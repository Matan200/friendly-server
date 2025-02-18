const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  participationToEvent,
  removeParticipantFromEvent,
} = require("../controller/eventsController");
router.get("/", getAllEvents);
router.put("/:id", participationToEvent);
router.put("/:id/remove-participant", removeParticipantFromEvent);
module.exports = router;
