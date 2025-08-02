const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { createTicket, getTicketsForArchitect, getAllTickets, getTicketDetails, addReply, updateTicketStatus } = require('../controllers/Tickets.controller');
const ticketRrouter = express.Router();


ticketRrouter.post('/generate-ticket', protect, createTicket);
ticketRrouter.get('/my-tickets', protect, getTicketsForArchitect);
ticketRrouter.get('/', protect, getAllTickets);
ticketRrouter.get('/:id', protect, getTicketDetails);
ticketRrouter.post('/:id/replies', protect, addReply);
ticketRrouter.patch('/:id/status', protect, updateTicketStatus);

module.exports = ticketRrouter;
