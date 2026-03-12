/**
 * Ticket Backend API
 * Receives tickets from Power Automate (Teams → Power Automate → here)
 * and exposes them to the Angular frontend.
 */

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());           // Allow Angular (localhost:4200) to call this API
app.use(express.json());   // Parse JSON request bodies

// ── In-memory ticket store ─────────────────────────────────────────────────
let tickets = [];

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId() {
  return 'TMS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function validatePriority(priority) {
  const allowed = ['Low', 'Medium', 'High'];
  if (allowed.includes(priority)) return priority;
  return 'Medium'; // safe default
}

// Strip HTML tags that Teams sends in message content
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// ── Routes ─────────────────────────────────────────────────────────────────

/**
 * POST /api/tickets
 * Called by Power Automate when a new message appears in Teams.
 *
 * Expected body:
 *   { "title": "...", "description": "...", "priority": "High", "source": "Microsoft Teams" }
 */
app.post('/api/tickets', (req, res) => {
  const { title, description, priority, source } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const ticket = {
    id:          generateId(),
    title:       stripHtml(title),
    description: stripHtml(description),
    priority:    validatePriority(priority),
    source:      source || 'Microsoft Teams',
    createdAt:   new Date().toISOString()
  };

  tickets.unshift(ticket); // newest first
  console.log('[POST /api/tickets] New ticket saved:', ticket.id, '-', ticket.title);
  res.status(201).json(ticket);
});

/**
 * GET /api/tickets
 * Called by Angular to fetch all tickets from Teams.
 */
app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

/**
 * DELETE /api/tickets
 * Development utility — clears all tickets from memory.
 */
app.delete('/api/tickets', (req, res) => {
  const count = tickets.length;
  tickets = [];
  console.log('[DELETE /api/tickets] Cleared', count, 'ticket(s)');
  res.json({ message: `Cleared ${count} ticket(s)` });
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', tickets: tickets.length }));

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Ticket API running → http://localhost:${PORT}`);
  console.log(`  POST /api/tickets    (Power Automate sends here)`);
  console.log(`  GET  /api/tickets    (Angular reads from here)`);
  console.log(`  GET  /health         (health check)`);
});
