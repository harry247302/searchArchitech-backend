const express = require("express");
const { protect } = require("../middleware/Auth.middleware");
const {
  createTicket,
  fetchTicketsOfArchitect,
  getAllTickets,
  getTicketDetails,
  addReply,
  updateTicketStatus,
  getArchitectTicketsWithReplies,
} = require("../controllers/Tickets.controller");
const ticketRrouter = express.Router();

ticketRrouter.post("/generate-ticket", protect, createTicket);
ticketRrouter.get("/my-tickets", protect, fetchTicketsOfArchitect);
ticketRrouter.get(
  "/FetchArchitectTicketsWithReplies/:uuid",
  getArchitectTicketsWithReplies
);
ticketRrouter.get("/all", getAllTickets);
ticketRrouter.get("/:id", protect, getTicketDetails);
ticketRrouter.post("/replies/:id", protect, addReply);
ticketRrouter.patch("/:id/status", protect, updateTicketStatus);

module.exports = ticketRrouter;
