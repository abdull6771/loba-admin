import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ═══════════════════════════════════════════════════
// LIVE DATA — Fetched from Google Sheets
// ═══════════════════════════════════════════════════

// ✅ Connected to live Google Sheet
const GOOGLE_SHEET_API =
  "https://script.google.com/macros/s/AKfycbzzRJpsUPIdmCnKbJemPdx2m7k4kID-JznNUsBszaowa7txP9lqqovy1qC7bth8gu5E/exec";

const GOLD = "#d4af37";
const DARK = "#0d1f14";
const CARD_BG = "#162a1d";
const CARD_BORDER = "rgba(212,175,55,0.12)";

const PIE_COLORS = [
  "#d4af37",
  "#27ae60",
  "#e67e22",
  "#3498db",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#f39c12",
];

// Convert a Google Drive `view` link into a direct-image thumbnail URL.
// The receipt must be shared "Anyone with the link → Viewer" for the
// browser to load it without auth.
function getDriveImageUrl(link, size = 1000) {
  if (!link) return null;
  const m = link.match(/\/file\/d\/([^/]+)/) || link.match(/[?&]id=([^&]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${size}` : null;
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("overview");
  const [selectedMember, setSelectedMember] = useState(null);
  const [payFilter, setPayFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [adminPwd, setAdminPwd] = useState(
    () => sessionStorage.getItem("oba_admin_pwd") || "",
  );
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [verifying, setVerifying] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Inject responsive CSS once. Inline styles win the specificity battle by
  // default, so the rules below use !important to override them on mobile.
  useEffect(() => {
    const id = "dash-responsive-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @media (max-width: 900px) {
        .dash-page { flex-direction: column !important; }
        .dash-sidebar {
          width: 100% !important;
          min-height: auto !important;
          position: static !important;
          padding: 10px 0 !important;
          flex-direction: row !important;
          align-items: center !important;
          align-self: stretch !important;
          border-right: none !important;
          border-bottom: 1px solid rgba(212,175,55,0.12) !important;
        }
        .dash-sidebar-header {
          border-bottom: none !important;
          padding: 0 14px !important;
          margin-bottom: 0 !important;
          flex-shrink: 0 !important;
        }
        .dash-sidebar-nav {
          flex: 1 !important;
          flex-direction: row !important;
          justify-content: flex-end !important;
          padding: 0 10px !important;
          overflow-x: auto !important;
          gap: 4px !important;
        }
        .dash-sidebar-nav button { padding: 8px 12px !important; }
        .dash-sidebar-footer { display: none !important; }
        .dash-main { padding: 16px !important; }
        .dash-topbar {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 12px !important;
        }
        .dash-page-title { font-size: 20px !important; }
        .dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
        .dash-charts { grid-template-columns: 1fr !important; }
        .dash-detail { grid-template-columns: 1fr !important; }
        .dash-detail-card { padding: 18px !important; }
        .dash-toolbar { width: 100% !important; }
        .dash-searchbox {
          min-width: 0 !important;
          width: 100% !important;
        }
        .dash-pay-grid {
          grid-template-columns: 1fr !important;
        }
        .dash-modal-card { padding: 20px !important; }
        table { min-width: 600px; }
      }
      @media (max-width: 480px) {
        .dash-stats { grid-template-columns: 1fr !important; }
        .dash-sidebar-nav button span:last-child { display: none !important; }
        .dash-sidebar-nav button { padding: 8px 10px !important; }
        .dash-page-title { font-size: 18px !important; }
        .dash-main { padding: 12px !important; }
        .dash-toast {
          left: 12px !important;
          right: 12px !important;
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (kind, message) => setToast({ kind, message });

  const refetch = () => {
    setLoading(true);
    return fetch(GOOGLE_SHEET_API)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // POST to Apps Script. Using text/plain avoids the CORS preflight that
  // fails on Apps Script web apps; e.postData.contents still receives the
  // raw JSON body on the server.
  const postAction = (payload) =>
    fetch(GOOGLE_SHEET_API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, password: adminPwd }),
    }).then((r) => r.json());

  const verifyOne = async (member) => {
    if (!member.email) {
      showToast("error", "This member has no email on file.");
      return;
    }
    setVerifying((s) => new Set(s).add(member.email));
    try {
      const res = await postAction({ action: "verify", email: member.email });
      if (res.result === "success") {
        showToast(
          "success",
          res.emailSent
            ? `Verified — receipt emailed to ${member.email}`
            : `Verified, but email failed: ${res.emailError || "unknown"}`,
        );
        await refetch();
        if (selectedMember?.email === member.email) {
          setSelectedMember((m) => ({ ...m, paymentStatus: "Verified" }));
        }
      } else {
        if ((res.message || "").toLowerCase().includes("unauth")) {
          sessionStorage.removeItem("oba_admin_pwd");
          setAdminPwd("");
          setPwdError("Session expired. Sign in again.");
        }
        showToast("error", res.message || "Verification failed");
      }
    } catch (e) {
      showToast("error", "Network error: " + e.message);
    } finally {
      setVerifying((s) => {
        const next = new Set(s);
        next.delete(member.email);
        return next;
      });
    }
  };

  const unverifyOne = async (member) => {
    if (!member.email) {
      showToast("error", "This member has no email on file.");
      return;
    }
    setVerifying((s) => new Set(s).add(member.email));
    try {
      const res = await postAction({ action: "unverify", email: member.email });
      if (res.result === "success") {
        showToast("success", `Reverted to pending — ${member.email}`);
        await refetch();
        if (selectedMember?.email === member.email) {
          setSelectedMember((m) => ({
            ...m,
            paymentStatus: m.paymentProofLink
              ? "Proof uploaded - PENDING VERIFICATION"
              : "No proof uploaded",
          }));
        }
      } else {
        if ((res.message || "").toLowerCase().includes("unauth")) {
          sessionStorage.removeItem("oba_admin_pwd");
          setAdminPwd("");
          setPwdError("Session expired. Sign in again.");
        }
        showToast("error", res.message || "Un-verify failed");
      }
    } catch (e) {
      showToast("error", "Network error: " + e.message);
    } finally {
      setVerifying((s) => {
        const next = new Set(s);
        next.delete(member.email);
        return next;
      });
    }
  };

  const rejectOne = async (member) => {
    if (!member.email) {
      showToast("error", "This member has no email — cannot identify the row.");
      return;
    }
    setVerifying((s) => new Set(s).add(member.email));
    try {
      const res = await postAction({ action: "reject", email: member.email });
      if (res.result === "success") {
        showToast(
          "success",
          `Deleted ${member.firstName} ${member.lastName} from the records`,
        );
        if (selectedMember?.email === member.email) {
          setSelectedMember(null);
        }
        await refetch();
      } else {
        if ((res.message || "").toLowerCase().includes("unauth")) {
          sessionStorage.removeItem("oba_admin_pwd");
          setAdminPwd("");
          setPwdError("Session expired. Sign in again.");
        }
        showToast("error", res.message || "Reject failed");
      }
    } catch (e) {
      showToast("error", "Network error: " + e.message);
    } finally {
      setVerifying((s) => {
        const next = new Set(s);
        next.delete(member.email);
        return next;
      });
    }
  };

  const verifyAll = async () => {
    setVerifying((s) => new Set(s).add("__all__"));
    try {
      const res = await postAction({ action: "verifyAll" });
      if (res.result === "success") {
        showToast(
          "success",
          `Verified ${res.verified} member${res.verified === 1 ? "" : "s"} — emailed ${res.emailed}${
            res.errors?.length ? ` (${res.errors.length} email failure${res.errors.length === 1 ? "" : "s"})` : ""
          }`,
        );
        await refetch();
      } else {
        if ((res.message || "").toLowerCase().includes("unauth")) {
          sessionStorage.removeItem("oba_admin_pwd");
          setAdminPwd("");
          setPwdError("Session expired. Sign in again.");
        }
        showToast("error", res.message || "Bulk verify failed");
      }
    } catch (e) {
      showToast("error", "Network error: " + e.message);
    } finally {
      setVerifying((s) => {
        const next = new Set(s);
        next.delete("__all__");
        return next;
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const pwd = pwdInput.trim();
    if (!pwd) return;
    sessionStorage.setItem("oba_admin_pwd", pwd);
    setAdminPwd(pwd);
    setPwdInput("");
    setPwdError("");
  };

  const logout = () => {
    sessionStorage.removeItem("oba_admin_pwd");
    setAdminPwd("");
  };

  // Live fetch from Google Sheet (only after admin login)
  useEffect(() => {
    if (!GOOGLE_SHEET_API || !adminPwd) return;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPwd]);

  // Analytics
  const stats = useMemo(() => {
    const total = data.length;
    const verified = data.filter(
      (d) =>
        d.paymentStatus?.toLowerCase().includes("verified") &&
        !d.paymentStatus?.toLowerCase().includes("pending"),
    ).length;
    const pending = data.filter((d) =>
      d.paymentStatus?.toLowerCase().includes("pending"),
    ).length;
    const noProof = total - verified - pending;
    const revenue = verified * 500;
    const expectedRevenue = total * 500;

    // Cities
    const cityMap = {};
    data.forEach((d) => {
      const c = (d.city || "").trim();
      if (c && c !== "Select LGA") cityMap[c] = (cityMap[c] || 0) + 1;
    });
    const cityData = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Occupations
    const occMap = {};
    data.forEach((d) => {
      let o = (d.occupation || "").trim();
      if (!o || o.toLowerCase() === "none") return;
      o = o.replace(/s$/i, "").replace(/civil servant/i, "Civil Servant");
      o = o.charAt(0).toUpperCase() + o.slice(1).toLowerCase();
      occMap[o] = (occMap[o] || 0) + 1;
    });
    const occData = Object.entries(occMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));

    // States
    const stateMap = {};
    data.forEach((d) => {
      const s = (d.state || "").trim();
      if (s) stateMap[s] = (stateMap[s] || 0) + 1;
    });
    const stateData = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    return {
      total,
      verified,
      pending,
      noProof,
      revenue,
      expectedRevenue,
      cityData,
      occData,
      stateData,
    };
  }, [data]);

  // Filtered members
  const filtered = useMemo(() => {
    let list = data;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          (d.firstName + " " + d.lastName).toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.city || "").toLowerCase().includes(q) ||
          (d.occupation || "").toLowerCase().includes(q),
      );
    }
    if (payFilter === "pending")
      list = list.filter((d) =>
        d.paymentStatus?.toLowerCase().includes("pending"),
      );
    else if (payFilter === "verified")
      list = list.filter(
        (d) =>
          d.paymentStatus?.toLowerCase().includes("verified") &&
          !d.paymentStatus?.toLowerCase().includes("pending"),
      );
    else if (payFilter === "none")
      list = list.filter(
        (d) => !d.paymentStatus || d.paymentStatus === "No proof uploaded",
      );
    return list;
  }, [data, search, payFilter]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div
          style={{
            background: "#1a3020",
            border: `1px solid ${GOLD}`,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            color: "#fff",
          }}
        >
          <strong>{payload[0].payload.name}</strong>: {payload[0].value}
        </div>
      );
    }
    return null;
  };

  if (!adminPwd) {
    return (
      <div style={S.loginPage}>
        <form style={S.loginCard} onSubmit={handleLogin}>
          <div style={S.logoRing}>🏫</div>
          <h1 style={S.loginTitle}>Admin Access</h1>
          <p style={S.loginSub}>
            SSS Lautai Gumel — Old Boys Association Dashboard
          </p>
          <input
            type="password"
            autoFocus
            value={pwdInput}
            onChange={(e) => setPwdInput(e.target.value)}
            placeholder="Admin password"
            style={S.loginInput}
          />
          {pwdError && <div style={S.loginError}>{pwdError}</div>}
          <button type="submit" style={S.loginBtn}>
            Sign In →
          </button>
          <div style={S.loginHint}>
            Password set in Google Apps Script → Project Settings →
            Script Properties → ADMIN_PASSWORD
          </div>
        </form>
      </div>
    );
  }

  const pendingCount = data.filter((d) =>
    d.paymentStatus?.toUpperCase().includes("PENDING"),
  ).length;
  const verifyAllBusy = verifying.has("__all__");

  return (
    <div style={S.page} className="dash-page">
      {/* Sidebar */}
      <aside style={S.sidebar} className="dash-sidebar">
        <div style={S.sidebarHeader} className="dash-sidebar-header">
          <div style={S.logoRing}>🏫</div>
          <div>
            <div style={S.logoTitle}>SSS Gumel</div>
            <div style={S.logoSub}>Admin Dashboard</div>
          </div>
        </div>
        <nav style={S.nav} className="dash-sidebar-nav">
          {[
            ["overview", "📊", "Overview"],
            ["members", "👥", "Members"],
            ["payments", "💳", "Payments"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                ...S.navBtn,
                ...(tab === id ? S.navBtnActive : {}),
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div style={S.sidebarFooter} className="dash-sidebar-footer">
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.6,
            }}
          >
            Set of 2016
            <br />
            Old Boys Association
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main} className="dash-main">
        {/* Top bar */}
        <header style={S.topbar} className="dash-topbar">
          <div>
            <h1 style={S.pageTitle} className="dash-page-title">
              {tab === "overview" && "Dashboard Overview"}
              {tab === "members" && "Registered Members"}
              {tab === "payments" && "Payment Tracking"}
            </h1>
            <p style={S.pageSubtitle}>
              Science Secondary School, Lautai Gumel — Set 2016
            </p>
          </div>
          <div style={S.topRight}>
            {loading && (
              <span style={{ color: GOLD, fontSize: 13 }}>Syncing...</span>
            )}
            <div style={S.liveBadge}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: data.length > 0 ? "#27ae60" : "#e67e22",
                }}
              />
              {data.length > 0 ? "Live - Data Loaded" : "Connecting..."}
            </div>
            <button onClick={logout} style={S.logoutBtn} title="Sign out">
              ⎋
            </button>
          </div>
        </header>

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && (
          <div style={S.tabContent}>
            {/* Stat Cards */}
            <div style={S.statsGrid} className="dash-stats">
              {[
                {
                  icon: "👥",
                  label: "Total Members",
                  value: stats.total,
                  accent: "#27ae60",
                },
                {
                  icon: "✅",
                  label: "Verified",
                  value: stats.verified,
                  accent: GOLD,
                },
                {
                  icon: "⏳",
                  label: "Pending",
                  value: stats.pending,
                  accent: "#e67e22",
                },
                {
                  icon: "💰",
                  label: "Expected Revenue",
                  value: `₦${stats.expectedRevenue.toLocaleString()}`,
                  accent: "#3498db",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{ ...S.statCard, borderTopColor: s.accent }}
                >
                  <div style={S.statIcon}>{s.icon}</div>
                  <div style={S.statValue}>{s.value}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={S.chartsRow} className="dash-charts">
              {/* City Distribution */}
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>
                  Members by City
                  <span style={S.chartCount}>{stats.cityData.length} cities</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={stats.cityData}
                    margin={{ top: 5, right: 10, left: -15, bottom: 70 }}
                  >
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-40}
                      textAnchor="end"
                      height={70}
                      tick={{
                        fill: "rgba(255,255,255,0.6)",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={GOLD} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Occupation Pie */}
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Occupations</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.occData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.occData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={S.legend}>
                  {stats.occData.map((o, i) => (
                    <span key={i} style={S.legendItem}>
                      <span
                        style={{
                          ...S.legendDot,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      {o.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* State + Payment summary row */}
            <div style={S.chartsRow} className="dash-charts">
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Members by State</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={stats.stateData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      tick={{
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{
                        fill: "rgba(255,255,255,0.6)",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Payment Overview</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    padding: "10px 0",
                  }}
                >
                  {[
                    {
                      label: "Verified Payments",
                      value: stats.verified,
                      total: stats.total,
                      color: "#27ae60",
                    },
                    {
                      label: "Pending Verification",
                      value: stats.pending,
                      total: stats.total,
                      color: "#e67e22",
                    },
                    {
                      label: "No Proof Uploaded",
                      value: stats.noProof,
                      total: stats.total,
                      color: "#e74c3c",
                    },
                  ].map((p, i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: 6,
                        }}
                      >
                        <span>{p.label}</span>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        >
                          {p.value} / {p.total}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(p.value / Math.max(p.total, 1)) * 100}%`,
                            background: p.color,
                            borderRadius: 4,
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: "rgba(212,175,55,0.08)",
                    borderRadius: 8,
                    border: `1px solid ${CARD_BORDER}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Verified Revenue
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: GOLD,
                      marginTop: 4,
                    }}
                  >
                    ₦{stats.revenue.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 2,
                    }}
                  >
                    of ₦{stats.expectedRevenue.toLocaleString()} expected
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations */}
            <div style={S.chartCard}>
              <h3 style={S.chartTitle}>Recent Registrations</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["Name", "City", "Occupation", "Payment", "Date"].map(
                        (h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data
                      .slice(-8)
                      .reverse()
                      .map((m, i) => (
                        <tr key={i} style={S.tr}>
                          <td style={S.td}>
                            <span style={S.avatar}>
                              {(m.firstName || "?")[0]}
                            </span>
                            {m.firstName} {m.lastName}
                          </td>
                          <td style={S.td}>{m.city}</td>
                          <td style={S.td}>{m.occupation || "—"}</td>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.badge,
                                background: m.paymentStatus?.includes("PENDING")
                                  ? "rgba(230,126,34,0.15)"
                                  : m.paymentStatus
                                        ?.toLowerCase()
                                        .includes("verified")
                                    ? "rgba(39,174,96,0.15)"
                                    : "rgba(231,76,60,0.15)",
                                color: m.paymentStatus?.includes("PENDING")
                                  ? "#e67e22"
                                  : m.paymentStatus
                                        ?.toLowerCase()
                                        .includes("verified")
                                    ? "#27ae60"
                                    : "#e74c3c",
                              }}
                            >
                              {m.paymentStatus?.includes("PENDING")
                                ? "Pending"
                                : m.paymentStatus
                                      ?.toLowerCase()
                                      .includes("verified")
                                  ? "Verified"
                                  : "No proof"}
                            </span>
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 12,
                            }}
                          >
                            {(m.timestamp || "").slice(0, 16)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MEMBERS TAB ═══ */}
        {tab === "members" && (
          <div style={S.tabContent}>
            <div style={S.toolbar} className="dash-toolbar">
              <div style={S.searchBox} className="dash-searchbox">
                <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
                <input
                  style={S.searchInput}
                  placeholder="Search by name, email, city, occupation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {filtered.length} members
              </span>
            </div>

            {selectedMember ? (
              <div style={S.detailCard} className="dash-detail-card">
                <button
                  style={S.backBtn}
                  onClick={() => setSelectedMember(null)}
                >
                  ← Back to list
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      ...S.avatar,
                      width: 56,
                      height: 56,
                      fontSize: 22,
                    }}
                  >
                    {selectedMember.firstName[0]}
                  </div>
                  <div>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 800,
                        margin: 0,
                      }}
                    >
                      {selectedMember.firstName} {selectedMember.middleName}{" "}
                      {selectedMember.lastName}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 13,
                        margin: "4px 0 0",
                      }}
                    >
                      Set of {selectedMember.setYear} • {selectedMember.city},{" "}
                      {selectedMember.state}
                    </p>
                  </div>
                </div>
                <div style={S.detailGrid} className="dash-detail">
                  {[
                    ["📧 Email", selectedMember.email],
                    ["📱 Phone", selectedMember.phone],
                    ["🏠 Address", selectedMember.address],
                    ["💼 Occupation", selectedMember.occupation || "—"],
                    ["🏢 Company", selectedMember.company || "—"],
                    ["🏆 Achievements", selectedMember.achievements || "—"],
                    ["⚽ Interests", selectedMember.interests || "—"],
                    ["💬 Message", selectedMember.message || "—"],
                  ].map(([l, v], i) => (
                    <div key={i} style={S.detailItem}>
                      <div style={S.detailLabel}>{l}</div>
                      <div style={S.detailValue}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={S.detailLabel}>💳 Payment Status</div>
                  <span
                    style={{
                      ...S.badge,
                      fontSize: 13,
                      padding: "6px 16px",
                      background: selectedMember.paymentStatus?.includes(
                        "PENDING",
                      )
                        ? "rgba(230,126,34,0.15)"
                        : "rgba(39,174,96,0.15)",
                      color: selectedMember.paymentStatus?.includes("PENDING")
                        ? "#e67e22"
                        : "#27ae60",
                    }}
                  >
                    {selectedMember.paymentStatus?.includes("PENDING")
                      ? "⏳ Pending Verification"
                      : "✅ Verified"}
                  </span>
                  {selectedMember.paymentProofLink && (
                    <a
                      href={selectedMember.paymentProofLink}
                      target="_blank"
                      rel="noreferrer"
                      style={S.proofLink}
                    >
                      Open in Drive →
                    </a>
                  )}
                  {selectedMember.paymentStatus
                    ?.toUpperCase()
                    .includes("PENDING") && (
                    <button
                      style={{
                        ...S.verifyBtn,
                        opacity: verifying.has(selectedMember.email) ? 0.6 : 1,
                      }}
                      disabled={verifying.has(selectedMember.email)}
                      onClick={() =>
                        setConfirm({
                          type: "one",
                          member: selectedMember,
                        })
                      }
                    >
                      {verifying.has(selectedMember.email)
                        ? "Verifying..."
                        : "✓ Verify & Email Receipt"}
                    </button>
                  )}
                  {selectedMember.paymentStatus
                    ?.toLowerCase()
                    .includes("verified") &&
                    !selectedMember.paymentStatus
                      ?.toUpperCase()
                      .includes("PENDING") && (
                      <button
                        style={{
                          ...S.unverifyBtn,
                          opacity: verifying.has(selectedMember.email) ? 0.6 : 1,
                        }}
                        disabled={verifying.has(selectedMember.email)}
                        onClick={() =>
                          setConfirm({
                            type: "unverify",
                            member: selectedMember,
                          })
                        }
                      >
                        {verifying.has(selectedMember.email)
                          ? "Reverting..."
                          : "↺ Un-verify"}
                      </button>
                    )}
                  <button
                    style={{
                      ...S.rejectBtn,
                      opacity: verifying.has(selectedMember.email) ? 0.6 : 1,
                    }}
                    disabled={verifying.has(selectedMember.email)}
                    onClick={() =>
                      setConfirm({ type: "reject", member: selectedMember })
                    }
                  >
                    {verifying.has(selectedMember.email)
                      ? "Deleting..."
                      : "✕ Reject & Delete"}
                  </button>
                </div>
                {selectedMember.paymentProofLink &&
                  getDriveImageUrl(selectedMember.paymentProofLink) && (
                    <div style={{ marginTop: 14 }}>
                      <div style={S.detailLabel}>🧾 Receipt Preview</div>
                      <div
                        style={S.proofThumbLarge}
                        onClick={() =>
                          setLightbox(
                            getDriveImageUrl(
                              selectedMember.paymentProofLink,
                              1600,
                            ),
                          )
                        }
                      >
                        <img
                          src={getDriveImageUrl(
                            selectedMember.paymentProofLink,
                            1200,
                          )}
                          alt="Payment receipt"
                          style={S.proofThumbImg}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML =
                              '<div style="padding:24px;color:rgba(255,255,255,0.4);font-size:12px;text-align:center">Preview unavailable. Make sure the Drive file is shared "Anyone with the link". Use Open in Drive above.</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {[
                        "#",
                        "Name",
                        "City",
                        "State",
                        "Occupation",
                        "Phone",
                        "Payment",
                        "",
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => (
                      <tr
                        key={i}
                        style={S.tr}
                        onClick={() => setSelectedMember(m)}
                      >
                        <td
                          style={{
                            ...S.td,
                            color: "rgba(255,255,255,0.3)",
                            fontSize: 12,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td style={S.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={S.avatar}>
                              {(m.firstName || "?")[0]}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#fff",
                                }}
                              >
                                {m.firstName} {m.lastName}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.4)",
                                }}
                              >
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>{m.city}</td>
                        <td style={S.td}>{m.state}</td>
                        <td style={S.td}>{m.occupation || "—"}</td>
                        <td
                          style={{
                            ...S.td,
                            fontSize: 12,
                          }}
                        >
                          {m.phone}
                        </td>
                        <td style={S.td}>
                          <span
                            style={{
                              ...S.badge,
                              background: m.paymentStatus?.includes("PENDING")
                                ? "rgba(230,126,34,0.15)"
                                : m.paymentStatus
                                      ?.toLowerCase()
                                      .includes("verified")
                                  ? "rgba(39,174,96,0.15)"
                                  : "rgba(231,76,60,0.15)",
                              color: m.paymentStatus?.includes("PENDING")
                                ? "#e67e22"
                                : m.paymentStatus
                                      ?.toLowerCase()
                                      .includes("verified")
                                  ? "#27ae60"
                                  : "#e74c3c",
                            }}
                          >
                            {m.paymentStatus?.includes("PENDING")
                              ? "Pending"
                              : m.paymentStatus
                                    ?.toLowerCase()
                                    .includes("verified")
                                ? "Verified"
                                : "None"}
                          </span>
                        </td>
                        <td
                          style={{
                            ...S.td,
                            fontSize: 12,
                            color: GOLD,
                            cursor: "pointer",
                          }}
                        >
                          View →
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ PAYMENTS TAB ═══ */}
        {tab === "payments" && (
          <div style={S.tabContent}>
            <div style={S.toolbar} className="dash-toolbar">
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["all", `All (${stats.total})`],
                  ["pending", `Pending (${stats.pending})`],
                  ["verified", `Verified (${stats.verified})`],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setPayFilter(id)}
                    style={{
                      ...S.filterBtn,
                      ...(payFilter === id
                        ? {
                            background: GOLD,
                            color: DARK,
                            fontWeight: 700,
                          }
                        : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {filtered.length} results
                </span>
                <button
                  style={{
                    ...S.verifyAllBtn,
                    opacity: pendingCount === 0 || verifyAllBusy ? 0.4 : 1,
                    cursor:
                      pendingCount === 0 || verifyAllBusy
                        ? "not-allowed"
                        : "pointer",
                  }}
                  disabled={pendingCount === 0 || verifyAllBusy}
                  onClick={() =>
                    setConfirm({ type: "all", count: pendingCount })
                  }
                >
                  {verifyAllBusy
                    ? "Verifying..."
                    : `✓ Verify All Pending (${pendingCount})`}
                </button>
              </div>
            </div>

            <div
              className="dash-pay-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {filtered.map((m, i) => (
                <div key={i} style={S.payCard}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <span style={S.avatar}>{(m.firstName || "?")[0]}</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#fff",
                            fontSize: 14,
                          }}
                        >
                          {m.firstName} {m.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {m.city}, {m.state}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        ...S.badge,
                        background: m.paymentStatus?.includes("PENDING")
                          ? "rgba(230,126,34,0.15)"
                          : "rgba(39,174,96,0.15)",
                        color: m.paymentStatus?.includes("PENDING")
                          ? "#e67e22"
                          : "#27ae60",
                      }}
                    >
                      {m.paymentStatus?.includes("PENDING")
                        ? "⏳ Pending"
                        : "✅ Verified"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Amount
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: GOLD,
                        }}
                      >
                        ₦500
                      </div>
                    </div>
                    {m.paymentProofLink ? (
                      <a
                        href={m.paymentProofLink}
                        target="_blank"
                        rel="noreferrer"
                        style={S.viewProofBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open ↗
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        No proof
                      </span>
                    )}
                  </div>
                  {m.paymentProofLink && getDriveImageUrl(m.paymentProofLink) && (
                    <div
                      style={S.proofThumb}
                      onClick={() =>
                        setLightbox(getDriveImageUrl(m.paymentProofLink, 1600))
                      }
                    >
                      <img
                        src={getDriveImageUrl(m.paymentProofLink, 600)}
                        alt="Receipt"
                        style={S.proofThumbImg}
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {m.paymentStatus?.toUpperCase().includes("PENDING") && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        style={{
                          ...S.verifyBtnSmall,
                          marginTop: 0,
                          flex: 1,
                          opacity: verifying.has(m.email) ? 0.6 : 1,
                        }}
                        disabled={verifying.has(m.email)}
                        onClick={() =>
                          setConfirm({ type: "one", member: m })
                        }
                      >
                        {verifying.has(m.email)
                          ? "Verifying..."
                          : "✓ Verify & Email"}
                      </button>
                      <button
                        style={{
                          ...S.rejectBtnSmall,
                          opacity: verifying.has(m.email) ? 0.6 : 1,
                        }}
                        disabled={verifying.has(m.email)}
                        onClick={() =>
                          setConfirm({ type: "reject", member: m })
                        }
                        title="Reject and delete this registration"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {m.paymentStatus?.toLowerCase().includes("verified") &&
                    !m.paymentStatus?.toUpperCase().includes("PENDING") && (
                      <button
                        style={{
                          ...S.unverifyBtnSmall,
                          opacity: verifying.has(m.email) ? 0.6 : 1,
                        }}
                        disabled={verifying.has(m.email)}
                        onClick={() =>
                          setConfirm({ type: "unverify", member: m })
                        }
                      >
                        {verifying.has(m.email)
                          ? "Reverting..."
                          : "↺ Un-verify"}
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {lightbox && (
        <div style={S.lightboxOverlay} onClick={() => setLightbox(null)}>
          <button
            style={S.lightboxClose}
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Receipt full size"
            style={S.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {confirm && (
        <div style={S.modalOverlay} onClick={() => setConfirm(null)}>
          <div
            style={S.modalCard}
            className="dash-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={S.modalTitle}>
              {confirm.type === "all"
                ? "Verify all pending payments?"
                : confirm.type === "unverify"
                  ? "Un-verify this payment?"
                  : confirm.type === "reject"
                    ? "Reject and permanently delete?"
                    : "Verify this payment?"}
            </h3>
            <p style={S.modalBody}>
              {confirm.type === "all" ? (
                <>
                  This will mark <strong style={{ color: GOLD }}>{confirm.count}</strong>{" "}
                  pending member{confirm.count === 1 ? "" : "s"} as Verified
                  and email each one a branded receipt. This cannot be undone.
                </>
              ) : confirm.type === "unverify" ? (
                <>
                  This will revert{" "}
                  <strong style={{ color: GOLD }}>
                    {confirm.member.firstName} {confirm.member.lastName}
                  </strong>{" "}
                  back to <strong>Pending Verification</strong>. The receipt
                  email already sent will <em>not</em> be recalled — they will
                  still have it in their inbox.
                </>
              ) : confirm.type === "reject" ? (
                <>
                  This will <strong style={{ color: "#e74c3c" }}>permanently delete</strong>{" "}
                  <strong style={{ color: GOLD }}>
                    {confirm.member.firstName} {confirm.member.lastName}
                  </strong>{" "}
                  ({confirm.member.email || "no email"}) from the Google Sheet.
                  All their data — name, contact, payment proof link — will be
                  removed. <strong>This cannot be undone.</strong>
                  {confirm.member.paymentStatus
                    ?.toLowerCase()
                    .includes("verified") &&
                    !confirm.member.paymentStatus
                      ?.toUpperCase()
                      .includes("PENDING") && (
                      <>
                        {" "}
                        <span style={{ color: "#e67e22" }}>
                          ⚠ This member is currently <strong>Verified</strong>{" "}
                          — make sure you really want to delete a paying member.
                        </span>
                      </>
                    )}
                </>
              ) : (
                <>
                  Mark{" "}
                  <strong style={{ color: GOLD }}>
                    {confirm.member.firstName} {confirm.member.lastName}
                  </strong>{" "}
                  as Verified and send a receipt to{" "}
                  <strong style={{ color: GOLD }}>
                    {confirm.member.email || "(no email on file)"}
                  </strong>
                  ?
                </>
              )}
            </p>
            <div style={S.modalActions}>
              <button
                style={S.modalCancel}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                style={
                  confirm.type === "unverify" || confirm.type === "reject"
                    ? S.modalConfirmDanger
                    : S.modalConfirm
                }
                onClick={() => {
                  const c = confirm;
                  setConfirm(null);
                  if (c.type === "all") verifyAll();
                  else if (c.type === "unverify") unverifyOne(c.member);
                  else if (c.type === "reject") rejectOne(c.member);
                  else verifyOne(c.member);
                }}
              >
                {confirm.type === "all"
                  ? `Yes, verify all ${confirm.count}`
                  : confirm.type === "unverify"
                    ? "Yes, un-verify"
                    : confirm.type === "reject"
                      ? "Yes, delete permanently"
                      : "Yes, verify & email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="dash-toast"
          style={{
            ...S.toast,
            background:
              toast.kind === "success"
                ? "rgba(39,174,96,0.95)"
                : "rgba(231,76,60,0.95)",
          }}
        >
          {toast.kind === "success" ? "✓" : "⚠"} {toast.message}
        </div>
      )}
    </div>
  );
}

const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: DARK,
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif",
    color: "rgba(255,255,255,0.75)",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0f2518, #0a1a10)",
    borderRight: `1px solid ${CARD_BORDER}`,
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px 20px",
    borderBottom: `1px solid ${CARD_BORDER}`,
    marginBottom: 8,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: `2px solid ${GOLD}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    background: "rgba(212,175,55,0.08)",
    flexShrink: 0,
  },
  logoTitle: {
    fontWeight: 800,
    fontSize: 15,
    color: GOLD,
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  nav: {
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  navBtnActive: {
    background: `rgba(212,175,55,0.1)`,
    color: GOLD,
    fontWeight: 700,
    boxShadow: `inset 3px 0 0 ${GOLD}`,
  },
  sidebarFooter: {
    padding: "16px 18px",
    borderTop: `1px solid ${CARD_BORDER}`,
  },
  main: {
    flex: 1,
    padding: "24px 28px",
    minWidth: 0,
    overflowX: "hidden",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
    margin: 0,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    margin: "4px 0 0",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${CARD_BORDER}`,
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  statCard: {
    background: CARD_BG,
    borderRadius: 12,
    padding: "20px 18px",
    border: `1px solid ${CARD_BORDER}`,
    borderTop: "3px solid",
    position: "relative",
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: {
    fontSize: 28,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 600,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  chartCard: {
    background: CARD_BG,
    borderRadius: 12,
    padding: "20px",
    border: `1px solid ${CARD_BORDER}`,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.75)",
    margin: "0 0 14px",
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartCount: {
    fontSize: 11,
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0,
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 14px",
    marginTop: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${CARD_BORDER}`,
  },
  tr: { cursor: "pointer", transition: "background 0.1s" },
  td: {
    padding: "12px 12px",
    fontSize: 13,
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    color: "rgba(255,255,255,0.65)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: `linear-gradient(135deg, rgba(212,175,55,0.25), rgba(39,174,96,0.25))`,
    border: `1.5px solid ${GOLD}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: GOLD,
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 10,
    padding: "10px 16px",
    minWidth: 300,
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    flex: 1,
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: `1px solid ${CARD_BORDER}`,
    background: CARD_BG,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  detailCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 14,
    padding: 24,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: GOLD,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 16,
    padding: 0,
    fontFamily: "inherit",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  detailItem: {
    padding: 12,
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    border: `1px solid rgba(255,255,255,0.04)`,
  },
  detailLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 1.5,
  },
  proofLink: {
    display: "inline-block",
    marginTop: 10,
    marginLeft: 12,
    color: GOLD,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    padding: "6px 14px",
    border: `1px solid ${GOLD}`,
    borderRadius: 8,
  },
  payCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 12,
    padding: 18,
  },
  viewProofBtn: {
    display: "inline-block",
    color: GOLD,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "none",
    padding: "6px 14px",
    border: `1px solid rgba(212,175,55,0.3)`,
    borderRadius: 8,
    transition: "all 0.15s",
  },
  proofThumb: {
    marginTop: 12,
    background: "rgba(0,0,0,0.3)",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 8,
    overflow: "hidden",
    cursor: "zoom-in",
    height: 140,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  proofThumbLarge: {
    marginTop: 8,
    background: "rgba(0,0,0,0.3)",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 10,
    overflow: "hidden",
    cursor: "zoom-in",
    maxHeight: 420,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  proofThumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    cursor: "zoom-out",
  },
  lightboxImg: {
    maxWidth: "92vw",
    maxHeight: "92vh",
    objectFit: "contain",
    borderRadius: 8,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    cursor: "default",
  },
  lightboxClose: {
    position: "absolute",
    top: 18,
    right: 22,
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: `1px solid ${CARD_BORDER}`,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  loginPage: {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at top, #1a3020, ${DARK})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif",
  },
  loginCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
  },
  loginTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    margin: "8px 0 0",
  },
  loginSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    margin: 0,
  },
  loginInput: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(0,0,0,0.3)",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    marginTop: 8,
    boxSizing: "border-box",
  },
  loginError: {
    color: "#e74c3c",
    fontSize: 12,
    width: "100%",
    textAlign: "center",
  },
  loginBtn: {
    width: "100%",
    padding: "12px 14px",
    background: GOLD,
    border: "none",
    borderRadius: 10,
    color: DARK,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.3,
  },
  loginHint: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    lineHeight: 1.5,
    marginTop: 4,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${CARD_BORDER}`,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  verifyBtn: {
    display: "inline-block",
    marginTop: 10,
    marginLeft: 12,
    background: GOLD,
    color: DARK,
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    padding: "7px 16px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.2,
  },
  verifyBtnSmall: {
    marginTop: 12,
    background: GOLD,
    color: DARK,
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 800,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
    letterSpacing: 0.3,
  },
  verifyAllBtn: {
    background: GOLD,
    color: DARK,
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 800,
    padding: "9px 16px",
    fontFamily: "inherit",
    letterSpacing: 0.3,
  },
  unverifyBtn: {
    display: "inline-block",
    marginTop: 10,
    marginLeft: 12,
    background: "transparent",
    color: "#e74c3c",
    border: "1px solid rgba(231,76,60,0.5)",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    padding: "7px 16px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.2,
  },
  unverifyBtnSmall: {
    marginTop: 12,
    background: "transparent",
    color: "#e74c3c",
    border: "1px solid rgba(231,76,60,0.5)",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
    letterSpacing: 0.3,
  },
  rejectBtn: {
    display: "inline-block",
    marginTop: 10,
    marginLeft: 12,
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    padding: "7px 16px",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.2,
  },
  rejectBtnSmall: {
    background: "rgba(231,76,60,0.15)",
    color: "#e74c3c",
    border: "1px solid rgba(231,76,60,0.4)",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    padding: "8px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    minWidth: 40,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 14,
    padding: 28,
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 800,
    margin: "0 0 12px",
  },
  modalBody: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 22px",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalCancel: {
    padding: "9px 18px",
    background: "transparent",
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 8,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  modalConfirm: {
    padding: "9px 18px",
    background: GOLD,
    border: "none",
    borderRadius: 8,
    color: DARK,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.2,
  },
  modalConfirmDanger: {
    padding: "9px 18px",
    background: "#e74c3c",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.2,
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    maxWidth: 380,
    padding: "12px 18px",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
    zIndex: 1200,
    lineHeight: 1.5,
  },
};
