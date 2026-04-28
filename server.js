const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "leads.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new sqlite3.Database(dbPath);

const allowedStatuses = [
  "New",
  "Contacted",
  "Meeting Booked",
  "Proposal Sent",
  "Won",
  "Lost",
];

const ensureTables = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      business_name TEXT NOT NULL,
      city TEXT NOT NULL,
      growth_need TEXT NOT NULL,
      business_stage TEXT NOT NULL,
      budget_range TEXT,
      status TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  );
};

ensureTables();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/leads", (req, res) => {
  db.all("SELECT * FROM leads ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Failed to load leads" });
      return;
    }

    const leads = rows.map((row) => ({
      ...row,
      notes: JSON.parse(row.notes),
    }));

    res.json(leads);
  });
});

app.post("/api/leads", (req, res) => {
  const {
    name,
    phone,
    businessName,
    city,
    growthNeed,
    businessStage,
    budgetRange,
  } = req.body;

  if (!name || !phone || !businessName || !city || !growthNeed || !businessStage) {
    res.status(400).json({ error: "Required fields are missing" });
    return;
  }

  const now = new Date().toISOString();
  const status = "New";
  const notes = JSON.stringify([]);

  db.run(
    `INSERT INTO leads (
      name,
      phone,
      business_name,
      city,
      growth_need,
      business_stage,
      budget_range,
      status,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ,
    [
      name,
      phone,
      businessName,
      city,
      growthNeed,
      businessStage,
      budgetRange || null,
      status,
      notes,
      now,
      now,
    ],
    function insertLead(err) {
      if (err) {
        res.status(500).json({ error: "Failed to save lead" });
        return;
      }

      res.status(201).json({ id: this.lastID });
    }
  );
});

app.patch("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (status && !allowedStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  db.get("SELECT * FROM leads WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    const notes = JSON.parse(row.notes || "[]");
    if (note) {
      notes.push({
        text: note,
        createdAt: new Date().toISOString(),
      });
    }

    const nextStatus = status || row.status;
    const updatedAt = new Date().toISOString();

    db.run(
      "UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?",
      [nextStatus, JSON.stringify(notes), updatedAt, id],
      (updateErr) => {
        if (updateErr) {
          res.status(500).json({ error: "Failed to update lead" });
          return;
        }

        res.json({ success: true });
      }
    );
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`HDMS Lead Manager running on port ${port}`);
});
