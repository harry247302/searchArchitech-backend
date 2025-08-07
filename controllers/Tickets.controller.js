const { client } = require("../config/client");
const generateUniqueTicketId = async () => {
  const generateId = () => Math.floor(100000 + Math.random() * 900000).toString(); // Always 6-digit

  let newId;
  let isUnique = false;

  while (!isUnique) {
    newId = generateId();

    const existing = await client.query(
      'SELECT 1 FROM tickets WHERE ticket_id = $1 LIMIT 1',
      [newId]
    );

    if (existing.rowCount === 0) {
      isUnique = true;
    }
  }

  return newId;
};

const createTicket = async (req, res) => {
  const { subject, message, priority, status, department } = req.body;

  // console.log(req.body, ":::::::::::::::::::::::::::::::::::::::");

  const architectUuid = req.user?.uuid;
  const architectEmail = req.user?.email;

  if (!architectUuid) {
    return res.status(400).json({ error: 'Architect UUID is required' });
  }

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  try {
    const ticketId = await generateUniqueTicketId(); // 🆕 Generate ticket ID

    const result = await client.query(
      `INSERT INTO tickets 
        (ticket_id, subject, message, priority, status, architech_uuid, architech_email, department)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        ticketId,
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



const fetchTicketsOfArchitect = async (req, res) => {
  const architectId = req.params.id;
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
    // Step 1: Fetch all tickets
    const ticketsResult = await client.query(`
      SELECT * FROM tickets ORDER BY created_at DESC
    `);
    const tickets = ticketsResult.rows;

    // Step 2: Get unique architect UUIDs
    const uuids = [...new Set(tickets.map(t => t.architech_uuid))];

    if (uuids.length === 0) {
      return res.json({ tickets });
    }

    // Step 3: Fetch all relevant architects
    const architechResult = await client.query(
      `SELECT * FROM architech WHERE uuid = ANY($1)`,
      [uuids]
    );

    // Step 4: Create a lookup map for quick access
    const architectMap = {};
    architechResult.rows.forEach(arch => {
      architectMap[arch.uuid] = arch;
    });

    // Step 5: Combine architect data into ticket (like populate)
    const enrichedTickets = tickets.map(ticket => ({
      ...ticket,
      architect_details: architectMap[ticket.architech_uuid] || null,
    }));

    res.json({ tickets: enrichedTickets });
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
  const ticketId = req.params.id; // UUID from URL
  const { message, sender_role: rawSenderRole, sender_id } = req.body;

  // Normalize sender_role to allowed DB values
  let sender_role = rawSenderRole?.toLowerCase() || "";

  if (sender_role === "super admin" || sender_role === "hr") {
    sender_role = "admin";
  }

  try {
    const ticketResult = await client.query(
      `SELECT * FROM tickets WHERE uuid = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Insert the reply
    const insertResult = await client.query(
      `INSERT INTO ticket_replies (ticket_id, sender_role, sender_id, message) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticketId, sender_role, sender_id, message]
    );

    // Update ticket's updated_at timestamp
    await client.query(
      `UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE uuid = $1`,
      [ticketId]
    );

    res.status(201).json({ reply: insertResult.rows[0] });
  } catch (err) {
    console.error("Add Reply Error:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
};


const getArchitectTicketsWithReplies = async (req, res) => {
  const { uuid } = req.params;
  console.log(uuid, "********************************************");

  try {
    const result = await client.query(`
      SELECT 
        a.uuid,
        a.first_name,
        a.last_name,
        a.email,
        a.phone_number,
        a.city,
        a.state_name,
        a.company_name,
        a.experience,
        a.average_rating,
        a.profile_url,
        a.category,
        COALESCE(json_agg(
          json_build_object(
            'ticket_id', t.ticket_id,
            'subject', t.subject,
            'message', t.message,
            'status', t.status,
            'priority', t.priority,
            'department', t.department,
            'created_at', t.created_at,
            'uuid',t.uuid,
            'replies', (
              SELECT COALESCE(json_agg(
                json_build_object(
                  'id', tr.id,
                  'message', tr.message,
                  'sender_role', tr.sender_role,
                  'created_at', tr.created_at
                )
              ), '[]'::json)
              FROM ticket_replies tr
              WHERE tr.ticket_id = t.uuid
            )
          )
        ) FILTER (WHERE t.uuid IS NOT NULL), '[]'::json) AS tickets
      FROM architech a
      LEFT JOIN tickets t ON a.uuid = t.architech_uuid
      WHERE a.uuid = $1
      GROUP BY a.uuid, a.first_name, a.last_name, a.email, a.phone_number, a.city, a.state_name, a.company_name, a.experience, a.average_rating, a.profile_url, a.category
    `, [uuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Architect not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching architect tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




"360437"

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
  getArchitectTicketsWithReplies,
  createTicket,
  fetchTicketsOfArchitect,
  getAllTickets,
  getTicketDetails,
  addReply,
  updateTicketStatus,
};
