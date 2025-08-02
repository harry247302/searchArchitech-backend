const { client } = require("../config/client");

const createTicket = async (req, res) => {
  const { subject, message, priority, status, department } = req.body;

  console.log(req.body,":::::::::::::::::::::::::::::::::::::::");
  
  const architectUuid = req.user?.uuid;
  const architectEmail = req.user?.email;

  if (!architectUuid) {
    return res.status(400).json({ error: 'Architect UUID is required' });
  }

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  try {
    const result = await client.query(
      `INSERT INTO tickets 
        (subject, message, priority, status, architech_uuid, architech_email, department)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        subject,
        message,
        priority || 'normal',
        status || 'open',
        architectUuid,
        architectEmail,
        department || null
      ]
    );

    res.status(201).json({ ticket: result.rows[0] });
  } catch (err) {
    console.error('Failed to create ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};


const getTicketsForArchitect = async (req, res) => {
  const architectId = req.user.id;
  try {
    const result = await client.query(
      `SELECT * FROM tickets WHERE architech_id = $1 ORDER BY created_at DESC`,
      [architectId]
    );
    res.json({ tickets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM tickets ORDER BY created_at DESC`);
    res.json({ tickets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

const getTicketDetails = async (req, res) => {
  const ticketId = req.params.id;
  const user = req.user; 

  try {
  
    const ticketResult = await client.query(`SELECT * FROM tickets WHERE id = $1`, [ticketId]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const ticket = ticketResult.rows[0];

    if (user.role === 'architech' && ticket.architech_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }


    const repliesResult = await client.query(
      `SELECT * FROM ticket_replies WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketId]
    );

    res.json({ ticket, replies: repliesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};

const addReply = async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;
  const user = req.user; // { id, role }

  try {
    
    const ticketResult = await client.query(`SELECT * FROM tickets WHERE id = $1`, [ticketId]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

   
    const ticket = ticketResult.rows[0];
    if (user.role === 'architech' && ticket.architech_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

   
    const insertResult = await client.query(
      `INSERT INTO ticket_replies (ticket_id, sender_role, sender_id, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticketId, user.role, user.id, message]
    );

    await client.query(
      `UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [ticketId]
    );

    res.status(201).json({ reply: insertResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add reply' });
  }
};

const updateTicketStatus = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const ticketId = req.params.id;
  const { status } = req.body;

  try {
    const result = await client.query(
      `UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, ticketId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

module.exports = {
  createTicket,
  getTicketsForArchitect,
  getAllTickets,
  getTicketDetails,
  addReply,
  updateTicketStatus,
};
