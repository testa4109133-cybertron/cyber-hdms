 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/.gitignore b/.gitignore
new file mode 100644
index 0000000000000000000000000000000000000000..f15eb515a7e4eaea42f8236c719554840e033a1e
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,5 @@
+node_modules/
+data/
+*.sqlite
+*.db
+.DS_Store
diff --git a/package.json b/package.json
new file mode 100644
index 0000000000000000000000000000000000000000..0acdf0e8e3237ae2ce98f8c3ca70b2c61e25f7a6
--- /dev/null
+++ b/package.json
@@ -0,0 +1,13 @@
+{
+  "name": "hdms-lead-management",
+  "version": "1.0.0",
+  "description": "HDMS lead management system",
+  "main": "server.js",
+  "scripts": {
+    "start": "node server.js"
+  },
+  "dependencies": {
+    "express": "^4.18.2",
+    "sqlite3": "^5.1.7"
+  }
+}
diff --git a/public/app.js b/public/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..fc86cc9658e1bb76916795f8f5c5c280f167ae50
--- /dev/null
+++ b/public/app.js
@@ -0,0 +1,372 @@
+const { useEffect, useMemo, useState } = React;
+
+const GROWTH_NEEDS = ["Sales", "Branding", "Marketing", "Combination"];
+const BUSINESS_STAGES = ["Early", "Growing", "Scaling"];
+
+const STATUSES = [
+  "New",
+  "Contacted",
+  "Meeting Booked",
+  "Proposal Sent",
+  "Won",
+  "Lost",
+];
+
+const STATUS_COLORS = {
+  New: "#e2e8f0",
+  Contacted: "#bae6fd",
+  "Meeting Booked": "#c4b5fd",
+  "Proposal Sent": "#fde68a",
+  Won: "#bbf7d0",
+  Lost: "#fecaca",
+};
+
+const formatDate = (value) => new Date(value).toLocaleString();
+
+const defaultFormState = {
+  name: "",
+  phone: "",
+  businessName: "",
+  city: "",
+  growthNeed: "",
+  businessStage: "",
+  budgetRange: "",
+};
+
+function App() {
+  const [formState, setFormState] = useState(defaultFormState);
+  const [leads, setLeads] = useState([]);
+  const [loading, setLoading] = useState(true);
+  const [message, setMessage] = useState("");
+  const [growthFilter, setGrowthFilter] = useState("All");
+  const [stageFilter, setStageFilter] = useState("All");
+
+  const fetchLeads = async () => {
+    try {
+      setLoading(true);
+      const response = await fetch("/api/leads");
+      const data = await response.json();
+      setLeads(data);
+    } catch (error) {
+      console.error(error);
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  useEffect(() => {
+    fetchLeads();
+  }, []);
+
+  const handleChange = (event) => {
+    const { name, value } = event.target;
+    setFormState((prev) => ({ ...prev, [name]: value }));
+  };
+
+  const handleSubmit = async (event) => {
+    event.preventDefault();
+    setMessage("");
+
+    const response = await fetch("/api/leads", {
+      method: "POST",
+      headers: {
+        "Content-Type": "application/json",
+      },
+      body: JSON.stringify(formState),
+    });
+
+    if (response.ok) {
+      setMessage("Lead captured! The team will follow up shortly.");
+      setFormState(defaultFormState);
+      fetchLeads();
+    } else {
+      setMessage("Please complete the required fields before submitting.");
+    }
+  };
+
+  const handleUpdate = async (leadId, status, note) => {
+    const response = await fetch(`/api/leads/${leadId}`, {
+      method: "PATCH",
+      headers: {
+        "Content-Type": "application/json",
+      },
+      body: JSON.stringify({ status, note }),
+    });
+
+    if (response.ok) {
+      fetchLeads();
+    }
+  };
+
+  const filteredLeads = useMemo(() => {
+    return leads.filter((lead) => {
+      const matchesGrowth =
+        growthFilter === "All" || lead.growth_need === growthFilter;
+      const matchesStage =
+        stageFilter === "All" || lead.business_stage === stageFilter;
+      return matchesGrowth && matchesStage;
+    });
+  }, [leads, growthFilter, stageFilter]);
+
+  return (
+    <div>
+      <header>
+        <h1>HDMS Lead Management</h1>
+        <p>
+          High Dreams Management Services — every client is treated equally, no
+          matter the industry or size.
+        </p>
+      </header>
+      <main>
+        <section className="grid" style={{ marginBottom: "32px" }}>
+          <div className="card">
+            <div className="section-title">Capture a new lead</div>
+            <form className="form-grid" onSubmit={handleSubmit}>
+              <div>
+                <label htmlFor="name">Name</label>
+                <input
+                  id="name"
+                  name="name"
+                  value={formState.name}
+                  onChange={handleChange}
+                  placeholder="Jane Carter"
+                  required
+                />
+              </div>
+              <div>
+                <label htmlFor="phone">Phone</label>
+                <input
+                  id="phone"
+                  name="phone"
+                  value={formState.phone}
+                  onChange={handleChange}
+                  placeholder="+1 (555) 018-2490"
+                  required
+                />
+              </div>
+              <div>
+                <label htmlFor="businessName">Business Name</label>
+                <input
+                  id="businessName"
+                  name="businessName"
+                  value={formState.businessName}
+                  onChange={handleChange}
+                  placeholder="Brightline Studios"
+                  required
+                />
+              </div>
+              <div>
+                <label htmlFor="city">City</label>
+                <input
+                  id="city"
+                  name="city"
+                  value={formState.city}
+                  onChange={handleChange}
+                  placeholder="Austin"
+                  required
+                />
+              </div>
+              <div>
+                <label htmlFor="growthNeed">Primary Growth Need</label>
+                <select
+                  id="growthNeed"
+                  name="growthNeed"
+                  value={formState.growthNeed}
+                  onChange={handleChange}
+                  required
+                >
+                  <option value="">Select a growth need</option>
+                  {GROWTH_NEEDS.map((need) => (
+                    <option key={need} value={need}>
+                      {need}
+                    </option>
+                  ))}
+                </select>
+              </div>
+              <div>
+                <label htmlFor="businessStage">Business Stage</label>
+                <select
+                  id="businessStage"
+                  name="businessStage"
+                  value={formState.businessStage}
+                  onChange={handleChange}
+                  required
+                >
+                  <option value="">Select a stage</option>
+                  {BUSINESS_STAGES.map((stage) => (
+                    <option key={stage} value={stage}>
+                      {stage}
+                    </option>
+                  ))}
+                </select>
+              </div>
+              <div>
+                <label htmlFor="budgetRange">Budget Range (optional)</label>
+                <input
+                  id="budgetRange"
+                  name="budgetRange"
+                  value={formState.budgetRange}
+                  onChange={handleChange}
+                  placeholder="$5k - $15k"
+                />
+              </div>
+              <button type="submit">Save Lead</button>
+              {message && <div className="alert">{message}</div>}
+            </form>
+          </div>
+          <div className="card">
+            <div className="section-title">Status workflow</div>
+            <p className="lead-meta">
+              Keep the team aligned with the HDMS lead progression path.
+            </p>
+            <div className="notes">
+              {STATUSES.map((status, index) => (
+                <div className="note-item" key={status}>
+                  <strong>{`${index + 1}. ${status}`}</strong>
+                </div>
+              ))}
+            </div>
+          </div>
+        </section>
+
+        <section>
+          <div className="section-title">Admin dashboard</div>
+          <div className="card filter-bar">
+            <div>
+              <label htmlFor="filter-growth">Filter by growth need</label>
+              <select
+                id="filter-growth"
+                value={growthFilter}
+                onChange={(event) => setGrowthFilter(event.target.value)}
+              >
+                <option value="All">All</option>
+                {GROWTH_NEEDS.map((need) => (
+                  <option key={need} value={need}>
+                    {need}
+                  </option>
+                ))}
+              </select>
+            </div>
+            <div>
+              <label htmlFor="filter-stage">Filter by stage</label>
+              <select
+                id="filter-stage"
+                value={stageFilter}
+                onChange={(event) => setStageFilter(event.target.value)}
+              >
+                <option value="All">All</option>
+                {BUSINESS_STAGES.map((stage) => (
+                  <option key={stage} value={stage}>
+                    {stage}
+                  </option>
+                ))}
+              </select>
+            </div>
+            <div className="filter-summary">
+              Showing {filteredLeads.length} of {leads.length} leads
+            </div>
+          </div>
+          {loading ? (
+            <div className="card">Loading leads...</div>
+          ) : filteredLeads.length === 0 ? (
+            <div className="card">
+              No leads match the selected filters. Adjust the filters or add a
+              new lead.
+            </div>
+          ) : (
+            <div className="grid">
+              {filteredLeads.map((lead) => (
+                <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} />
+              ))}
+            </div>
+          )}
+        </section>
+      </main>
+    </div>
+  );
+}
+
+function LeadCard({ lead, onUpdate }) {
+  const [status, setStatus] = useState(lead.status);
+  const [note, setNote] = useState("");
+
+  const statusStyle = useMemo(
+    () => ({
+      background: STATUS_COLORS[status] || "#e2e8f0",
+      color: "#0f172a",
+    }),
+    [status]
+  );
+
+  const handleSave = () => {
+    onUpdate(lead.id, status, note.trim());
+    setNote("");
+  };
+
+  return (
+    <div className="card">
+      <div className="lead-header">
+        <div>
+          <div className="lead-name">{lead.name}</div>
+          <div className="lead-meta">
+            <span>{lead.business_name}</span>
+            <span>{lead.phone}</span>
+            <span>{lead.city}</span>
+            <span>
+              {lead.growth_need} · {lead.business_stage}
+            </span>
+            <span>
+              Budget: {lead.budget_range ? lead.budget_range : "Not provided"}
+            </span>
+          </div>
+        </div>
+        <span className="status-pill" style={statusStyle}>
+          {status}
+        </span>
+      </div>
+
+      <div className="actions">
+        <div>
+          <label htmlFor={`status-${lead.id}`}>Update status</label>
+          <select
+            id={`status-${lead.id}`}
+            value={status}
+            onChange={(event) => setStatus(event.target.value)}
+          >
+            {STATUSES.map((item) => (
+              <option key={item} value={item}>
+                {item}
+              </option>
+            ))}
+          </select>
+        </div>
+        <div>
+          <label htmlFor={`note-${lead.id}`}>Add follow-up note</label>
+          <textarea
+            id={`note-${lead.id}`}
+            value={note}
+            onChange={(event) => setNote(event.target.value)}
+            placeholder="Share follow-up details..."
+          ></textarea>
+        </div>
+        <button type="button" onClick={handleSave}>
+          Save Update
+        </button>
+      </div>
+
+      {lead.notes.length > 0 && (
+        <div className="notes">
+          {lead.notes.map((item, index) => (
+            <div className="note-item" key={`${lead.id}-note-${index}`}>
+              {item.text}
+              <time>{formatDate(item.createdAt)}</time>
+            </div>
+          ))}
+        </div>
+      )}
+    </div>
+  );
+}
+
+const root = ReactDOM.createRoot(document.getElementById("root"));
+root.render(<App />);
diff --git a/public/index.html b/public/index.html
new file mode 100644
index 0000000000000000000000000000000000000000..3be49c9776b6a67c257cbcd3a4a9614229a459b4
--- /dev/null
+++ b/public/index.html
@@ -0,0 +1,29 @@
+<!DOCTYPE html>
+<html lang="en">
+  <head>
+    <meta charset="UTF-8" />
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <title>HDMS Lead Manager</title>
+    <link rel="preconnect" href="https://fonts.googleapis.com" />
+    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
+    <link
+      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
+      rel="stylesheet"
+    />
+    <link rel="stylesheet" href="styles.css" />
+  </head>
+  <body>
+    <div id="root"></div>
+
+    <script
+      crossorigin
+      src="https://unpkg.com/react@18/umd/react.development.js"
+    ></script>
+    <script
+      crossorigin
+      src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"
+    ></script>
+    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
+    <script type="text/babel" src="app.js"></script>
+  </body>
+</html>
diff --git a/public/styles.css b/public/styles.css
new file mode 100644
index 0000000000000000000000000000000000000000..ed36e56337f491cebdc2f06a2821bd09ade35ff7
--- /dev/null
+++ b/public/styles.css
@@ -0,0 +1,208 @@
+:root {
+  color-scheme: light;
+  font-family: "Inter", system-ui, sans-serif;
+  background: #f5f7fb;
+  color: #0f172a;
+}
+
+* {
+  box-sizing: border-box;
+}
+
+body {
+  margin: 0;
+  min-height: 100vh;
+  background: #f5f7fb;
+}
+
+header {
+  background: #0f172a;
+  color: #f8fafc;
+  padding: 24px 20px;
+}
+
+header h1 {
+  margin: 0;
+  font-size: 1.8rem;
+  font-weight: 700;
+}
+
+header p {
+  margin: 8px 0 0;
+  color: #cbd5f5;
+}
+
+main {
+  max-width: 1100px;
+  margin: 0 auto;
+  padding: 24px 20px 48px;
+}
+
+.section-title {
+  font-size: 1.2rem;
+  font-weight: 600;
+  margin-bottom: 16px;
+}
+
+.grid {
+  display: grid;
+  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
+  gap: 24px;
+}
+
+.card {
+  background: #fff;
+  border-radius: 16px;
+  padding: 20px;
+  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
+}
+
+label {
+  display: block;
+  font-size: 0.85rem;
+  font-weight: 600;
+  margin-bottom: 6px;
+  color: #334155;
+}
+
+input,
+select,
+textarea {
+  width: 100%;
+  padding: 10px 12px;
+  border-radius: 10px;
+  border: 1px solid #cbd5f5;
+  font-size: 0.95rem;
+  font-family: inherit;
+  background: #fff;
+}
+
+textarea {
+  resize: vertical;
+  min-height: 80px;
+}
+
+.form-grid {
+  display: grid;
+  gap: 16px;
+}
+
+button {
+  background: #2563eb;
+  color: #fff;
+  border: none;
+  border-radius: 999px;
+  padding: 10px 18px;
+  font-weight: 600;
+  cursor: pointer;
+  transition: transform 0.2s ease, box-shadow 0.2s ease;
+}
+
+button:hover {
+  transform: translateY(-1px);
+  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
+}
+
+button.secondary {
+  background: #e2e8f0;
+  color: #1e293b;
+  box-shadow: none;
+}
+
+.status-pill {
+  display: inline-flex;
+  align-items: center;
+  padding: 4px 12px;
+  border-radius: 999px;
+  font-size: 0.75rem;
+  font-weight: 600;
+  background: #e2e8f0;
+  color: #475569;
+}
+
+.lead-meta {
+  display: grid;
+  gap: 4px;
+  font-size: 0.9rem;
+  color: #475569;
+}
+
+.lead-header {
+  display: flex;
+  align-items: flex-start;
+  justify-content: space-between;
+  gap: 12px;
+  margin-bottom: 12px;
+}
+
+.lead-name {
+  font-size: 1.05rem;
+  font-weight: 600;
+  color: #0f172a;
+}
+
+.notes {
+  margin-top: 16px;
+  display: grid;
+  gap: 8px;
+  font-size: 0.85rem;
+  color: #475569;
+}
+
+.note-item {
+  padding: 10px 12px;
+  border-radius: 10px;
+  background: #f8fafc;
+  border: 1px solid #e2e8f0;
+}
+
+.note-item time {
+  display: block;
+  font-size: 0.75rem;
+  color: #94a3b8;
+  margin-top: 4px;
+}
+
+.actions {
+  display: grid;
+  gap: 10px;
+  margin-top: 16px;
+}
+
+.alert {
+  padding: 12px 14px;
+  background: #ecfeff;
+  border: 1px solid #cffafe;
+  border-radius: 10px;
+  color: #155e75;
+  font-size: 0.9rem;
+}
+
+.filter-bar {
+  display: grid;
+  gap: 12px;
+  margin-bottom: 20px;
+}
+
+.filter-summary {
+  font-size: 0.9rem;
+  color: #475569;
+  align-self: end;
+}
+
+@media (min-width: 720px) {
+  .filter-bar {
+    grid-template-columns: repeat(3, minmax(0, 1fr));
+    align-items: end;
+  }
+}
+
+@media (max-width: 720px) {
+  header {
+    text-align: left;
+  }
+
+  button {
+    width: 100%;
+  }
+}
diff --git a/server.js b/server.js
new file mode 100644
index 0000000000000000000000000000000000000000..0585d9d59bcf60aaaf9a0f2b12b2dd00add4c11a
--- /dev/null
+++ b/server.js
@@ -0,0 +1,177 @@
+const express = require("express");
+const path = require("path");
+const fs = require("fs");
+const sqlite3 = require("sqlite3").verbose();
+
+const app = express();
+const port = process.env.PORT || 3000;
+
+const dataDir = path.join(__dirname, "data");
+const dbPath = path.join(dataDir, "leads.db");
+
+if (!fs.existsSync(dataDir)) {
+  fs.mkdirSync(dataDir);
+}
+
+const db = new sqlite3.Database(dbPath);
+
+const allowedStatuses = [
+  "New",
+  "Contacted",
+  "Meeting Booked",
+  "Proposal Sent",
+  "Won",
+  "Lost",
+];
+
+const ensureTables = () => {
+  db.run(
+    `CREATE TABLE IF NOT EXISTS leads (
+      id INTEGER PRIMARY KEY AUTOINCREMENT,
+      name TEXT NOT NULL,
+      phone TEXT NOT NULL,
+      business_name TEXT NOT NULL,
+      city TEXT NOT NULL,
+      growth_need TEXT NOT NULL,
+      business_stage TEXT NOT NULL,
+      budget_range TEXT,
+      status TEXT NOT NULL,
+      notes TEXT NOT NULL,
+      created_at TEXT NOT NULL,
+      updated_at TEXT NOT NULL
+    )`
+  );
+};
+
+ensureTables();
+
+app.use(express.json());
+app.use(express.static(path.join(__dirname, "public")));
+
+app.get("/api/health", (req, res) => {
+  res.json({ status: "ok" });
+});
+
+app.get("/api/leads", (req, res) => {
+  db.all("SELECT * FROM leads ORDER BY created_at DESC", [], (err, rows) => {
+    if (err) {
+      res.status(500).json({ error: "Failed to load leads" });
+      return;
+    }
+
+    const leads = rows.map((row) => ({
+      ...row,
+      notes: JSON.parse(row.notes),
+    }));
+
+    res.json(leads);
+  });
+});
+
+app.post("/api/leads", (req, res) => {
+  const {
+    name,
+    phone,
+    businessName,
+    city,
+    growthNeed,
+    businessStage,
+    budgetRange,
+  } = req.body;
+
+  if (!name || !phone || !businessName || !city || !growthNeed || !businessStage) {
+    res.status(400).json({ error: "Required fields are missing" });
+    return;
+  }
+
+  const now = new Date().toISOString();
+  const status = "New";
+  const notes = JSON.stringify([]);
+
+  db.run(
+    `INSERT INTO leads (
+      name,
+      phone,
+      business_name,
+      city,
+      growth_need,
+      business_stage,
+      budget_range,
+      status,
+      notes,
+      created_at,
+      updated_at
+    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
+    ,
+    [
+      name,
+      phone,
+      businessName,
+      city,
+      growthNeed,
+      businessStage,
+      budgetRange || null,
+      status,
+      notes,
+      now,
+      now,
+    ],
+    function insertLead(err) {
+      if (err) {
+        res.status(500).json({ error: "Failed to save lead" });
+        return;
+      }
+
+      res.status(201).json({ id: this.lastID });
+    }
+  );
+});
+
+app.patch("/api/leads/:id", (req, res) => {
+  const { id } = req.params;
+  const { status, note } = req.body;
+
+  if (status && !allowedStatuses.includes(status)) {
+    res.status(400).json({ error: "Invalid status" });
+    return;
+  }
+
+  db.get("SELECT * FROM leads WHERE id = ?", [id], (err, row) => {
+    if (err || !row) {
+      res.status(404).json({ error: "Lead not found" });
+      return;
+    }
+
+    const notes = JSON.parse(row.notes || "[]");
+    if (note) {
+      notes.push({
+        text: note,
+        createdAt: new Date().toISOString(),
+      });
+    }
+
+    const nextStatus = status || row.status;
+    const updatedAt = new Date().toISOString();
+
+    db.run(
+      "UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?",
+      [nextStatus, JSON.stringify(notes), updatedAt, id],
+      (updateErr) => {
+        if (updateErr) {
+          res.status(500).json({ error: "Failed to update lead" });
+          return;
+        }
+
+        res.json({ success: true });
+      }
+    );
+  });
+});
+
+app.get("*", (req, res) => {
+  res.sendFile(path.join(__dirname, "public", "index.html"));
+});
+
+app.listen(port, () => {
+  console.log(`HDMS Lead Manager running on port ${port}`);
+});
 
EOF
)
