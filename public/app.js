const { useEffect, useMemo, useState } = React;

const GROWTH_NEEDS = ["Sales", "Branding", "Marketing", "Combination"];
const BUSINESS_STAGES = ["Early", "Growing", "Scaling"];

const STATUSES = [
  "New",
  "Contacted",
  "Meeting Booked",
  "Proposal Sent",
  "Won",
  "Lost",
];

const STATUS_COLORS = {
  New: "#e2e8f0",
  Contacted: "#bae6fd",
  "Meeting Booked": "#c4b5fd",
  "Proposal Sent": "#fde68a",
  Won: "#bbf7d0",
  Lost: "#fecaca",
};

const formatDate = (value) => new Date(value).toLocaleString();

const defaultFormState = {
  name: "",
  phone: "",
  businessName: "",
  city: "",
  growthNeed: "",
  businessStage: "",
  budgetRange: "",
};

function App() {
  const [formState, setFormState] = useState(defaultFormState);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [growthFilter, setGrowthFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leads");
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });

    if (response.ok) {
      setMessage("Lead captured! The team will follow up shortly.");
      setFormState(defaultFormState);
      fetchLeads();
    } else {
      setMessage("Please complete the required fields before submitting.");
    }
  };

  const handleUpdate = async (leadId, status, note) => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, note }),
    });

    if (response.ok) {
      fetchLeads();
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesGrowth =
        growthFilter === "All" || lead.growth_need === growthFilter;
      const matchesStage =
        stageFilter === "All" || lead.business_stage === stageFilter;
      return matchesGrowth && matchesStage;
    });
  }, [leads, growthFilter, stageFilter]);

  return (
    <div>
      <header>
        <h1>HDMS Lead Management</h1>
        <p>
          High Dreams Management Services — every client is treated equally, no
          matter the industry or size.
        </p>
      </header>
      <main>
        <section className="grid" style={{ marginBottom: "32px" }}>
          <div className="card">
            <div className="section-title">Capture a new lead</div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Jane Carter"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 018-2490"
                  required
                />
              </div>
              <div>
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  value={formState.businessName}
                  onChange={handleChange}
                  placeholder="Brightline Studios"
                  required
                />
              </div>
              <div>
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={formState.city}
                  onChange={handleChange}
                  placeholder="Austin"
                  required
                />
              </div>
              <div>
                <label htmlFor="growthNeed">Primary Growth Need</label>
                <select
                  id="growthNeed"
                  name="growthNeed"
                  value={formState.growthNeed}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a growth need</option>
                  {GROWTH_NEEDS.map((need) => (
                    <option key={need} value={need}>
                      {need}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="businessStage">Business Stage</label>
                <select
                  id="businessStage"
                  name="businessStage"
                  value={formState.businessStage}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a stage</option>
                  {BUSINESS_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budgetRange">Budget Range (optional)</label>
                <input
                  id="budgetRange"
                  name="budgetRange"
                  value={formState.budgetRange}
                  onChange={handleChange}
                  placeholder="$5k - $15k"
                />
              </div>
              <button type="submit">Save Lead</button>
              {message && <div className="alert">{message}</div>}
            </form>
          </div>
          <div className="card">
            <div className="section-title">Status workflow</div>
            <p className="lead-meta">
              Keep the team aligned with the HDMS lead progression path.
            </p>
            <div className="notes">
              {STATUSES.map((status, index) => (
                <div className="note-item" key={status}>
                  <strong>{`${index + 1}. ${status}`}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-title">Admin dashboard</div>
          <div className="card filter-bar">
            <div>
              <label htmlFor="filter-growth">Filter by growth need</label>
              <select
                id="filter-growth"
                value={growthFilter}
                onChange={(event) => setGrowthFilter(event.target.value)}
              >
                <option value="All">All</option>
                {GROWTH_NEEDS.map((need) => (
                  <option key={need} value={need}>
                    {need}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-stage">Filter by stage</label>
              <select
                id="filter-stage"
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
              >
                <option value="All">All</option>
                {BUSINESS_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-summary">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>
          {loading ? (
            <div className="card">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="card">
              No leads match the selected filters. Adjust the filters or add a
              new lead.
            </div>
          ) : (
            <div className="grid">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function LeadCard({ lead, onUpdate }) {
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");

  const statusStyle = useMemo(
    () => ({
      background: STATUS_COLORS[status] || "#e2e8f0",
      color: "#0f172a",
    }),
    [status]
  );

  const handleSave = () => {
    onUpdate(lead.id, status, note.trim());
    setNote("");
  };

  return (
    <div className="card">
      <div className="lead-header">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-meta">
            <span>{lead.business_name}</span>
            <span>{lead.phone}</span>
            <span>{lead.city}</span>
            <span>
              {lead.growth_need} · {lead.business_stage}
            </span>
            <span>
              Budget: {lead.budget_range ? lead.budget_range : "Not provided"}
            </span>
          </div>
        </div>
        <span className="status-pill" style={statusStyle}>
          {status}
        </span>
      </div>

      <div className="actions">
        <div>
          <label htmlFor={`status-${lead.id}`}>Update status</label>
          <select
            id={`status-${lead.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`note-${lead.id}`}>Add follow-up note</label>
          <textarea
            id={`note-${lead.id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Share follow-up details..."
          ></textarea>
        </div>
        <button type="button" onClick={handleSave}>
          Save Update
        </button>
      </div>

      {lead.notes.length > 0 && (
        <div className="notes">
          {lead.notes.map((item, index) => (
            <div className="note-item" key={`${lead.id}-note-${index}`}>
              {item.text}
              <time>{formatDate(item.createdAt)}</time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
