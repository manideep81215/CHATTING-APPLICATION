import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { clearAuth } from "../lib/auth";

const TAB_MAP = {
  dashboard: "dashboard",
  profile: "profile",
  settings: "settings",
  search: "search",
  pending: "pending",
  friends: "friends",
};

const QUOTES = [
  { text: "Small daily improvements lead to stunning long-term results.", author: "Robin Sharma" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "First solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "Focus on progress, not perfection.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln (attributed)" },
];

function Card({ title, children }) {
  return (
    <article className="panel-card wide-card-light">
      <h2 className="card-title-light">{title}</h2>
      {children}
    </article>
  );
}

export default function DashboardPage() {
  const { tab } = useParams();
  const activeTab = TAB_MAP[tab] || "dashboard";
  const [me, setMe] = useState(null);
  const [searchUserId, setSearchUserId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    sounds: true,
    desktopNotifications: true,
    compactMode: false,
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("chat_theme") || "light");
  const navigate = useNavigate();
  const quoteOfTheSession = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );

  async function loadData() {
    try {
      const [meRes, pendingRes, friendsRes] = await Promise.all([
        api.get("/api/users/me"),
        api.get("/api/friends/requests"),
        api.get("/api/friends"),
      ]);
      setMe(meRes.data);
      setPendingRequests(pendingRes.data);
      setFriends(friendsRes.data);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please login again.");
        clearAuth();
        navigate("/auth", { replace: true });
        return;
      }
      toast.error("Could not load dashboard data. Check network/CORS and try again.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("chat_dashboard_settings");
    if (!stored) return;
    try {
      setSettings(JSON.parse(stored));
    } catch {
      // ignore corrupted local settings
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_dashboard_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("chat_theme", theme);
  }, [theme]);

  async function searchUser() {
    if (!searchUserId.trim()) return;
    try {
      const { data } = await api.get("/api/users/search", { params: { userId: searchUserId.trim() } });
      setSearchResult(data);
    } catch {
      setSearchResult(null);
      toast.error("User not found");
    }
  }

  async function sendRequest() {
    if (!searchResult?.userId) return;
    try {
      await api.post("/api/friends/request", { targetUserId: searchResult.userId });
      toast.success("Friend request sent");
      setSearchResult(null);
      setSearchUserId("");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send request");
    }
  }

  async function acceptRequest(requestId) {
    try {
      await api.post(`/api/friends/request/${requestId}/accept`);
      toast.success("Friend request accepted");
      await loadData();
    } catch {
      toast.error("Could not accept request");
    }
  }

  function toggleSetting(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleLogout() {
    clearAuth();
    window.location.replace("/auth");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function goTab(nextTab) {
    setSidebarOpen(false);
    navigate(`/dashboard/${nextTab}`);
  }

  function renderMainPanel() {
    if (activeTab === "profile") {
      return (
        <Card title="My Profile">
          <div className="profile-avatar-light">{(me?.displayName || "U").slice(0, 1).toUpperCase()}</div>
          <h3 className="profile-name-light">My Profile</h3>
          <p className="profile-meta-light">Username: {me?.username || "..."}</p>
          <div className="profile-id-light">User ID: {me?.userId || "..."}</div>
        </Card>
      );
    }

    if (activeTab === "search") {
      return (
        <Card title="Search User By ID">
          <div className="search-row-light">
            <input
              className="search-input-light"
              placeholder="Enter user ID (example: USRxxxx)"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
            />
            <button className="search-btn-light" onClick={searchUser}>Search</button>
          </div>
          {searchResult && (
            <div className="search-result-light">
              <div>
                {searchResult.displayName} ({searchResult.username})
                <div className="muted-light">{searchResult.userId}</div>
              </div>
              <button className="request-btn-light" onClick={sendRequest}>Send Request</button>
            </div>
          )}
        </Card>
      );
    }

    if (activeTab === "pending") {
      return (
        <Card title="Pending Friend Requests">
          {pendingRequests.length === 0 && <p className="muted-light">No pending requests</p>}
          <div className="stack-list-light">
            {pendingRequests.map((req) => (
              <div key={req.requestId} className="list-item-light">
                <div>
                  <div className="strong-light">{req.fromUsername}</div>
                  <div className="muted-light">{req.fromUserId}</div>
                </div>
                <button className="request-btn-light" onClick={() => acceptRequest(req.requestId)}>Accept</button>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (activeTab === "friends") {
      return (
        <Card title="My Friends">
          {friends.length === 0 && <p className="muted-light">No friends yet</p>}
          <div className="stack-list-light">
            {friends.map((friend) => (
              <div key={friend.userId} className="list-item-light">
                <div>
                  <div className="strong-light">{friend.displayName}</div>
                  <div className="muted-light">{friend.userId}</div>
                </div>
                <Link className="search-btn-light text-decoration-none" to={`/chat/${friend.userId}`} state={{ friendName: friend.displayName }}>
                  Message
                </Link>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (activeTab === "settings") {
      return (
        <Card title="Settings">
          <div className="stack-list-light">
            <label className="list-item-light settings-row">
              <span className="strong-light">Message Sounds</span>
              <input type="checkbox" checked={settings.sounds} onChange={() => toggleSetting("sounds")} />
            </label>
            <label className="list-item-light settings-row">
              <span className="strong-light">Desktop Notifications</span>
              <input type="checkbox" checked={settings.desktopNotifications} onChange={() => toggleSetting("desktopNotifications")} />
            </label>
            <label className="list-item-light settings-row">
              <span className="strong-light">Compact Mode</span>
              <input type="checkbox" checked={settings.compactMode} onChange={() => toggleSetting("compactMode")} />
            </label>
          </div>
        </Card>
      );
    }

    return (
      <div className="dashboard-grid-light">
        <article className="panel-card profile-card-light">
          <h2 className="card-title-light">My Profile</h2>
          <div className="profile-avatar-light">{(me?.displayName || "U").slice(0, 1).toUpperCase()}</div>
          <h3 className="profile-name-light">My Profile</h3>
          <p className="profile-meta-light">Username: {me?.username || "..."}</p>
          <div className="profile-id-light">User ID: {me?.userId || "..."}</div>
        </article>
        <Card title="Pending Friend Requests">
          {pendingRequests.length === 0 && <p className="muted-light">No pending requests</p>}
          <div className="stack-list-light">
            {pendingRequests.slice(0, 3).map((req) => (
              <div key={req.requestId} className="list-item-light">
                <div>
                  <div className="strong-light">{req.fromUsername}</div>
                  <div className="muted-light">{req.fromUserId}</div>
                </div>
                <button className="request-btn-light" onClick={() => acceptRequest(req.requestId)}>Accept</button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Quote of the Session">
          <blockquote className="dashboard-quote">"{quoteOfTheSession.text}"</blockquote>
          <div className="dashboard-quote-author">- {quoteOfTheSession.author}</div>
        </Card>
        <Card title="Today Snapshot">
          <div className="stack-list-light">
            <div className="list-item-light">
              <div>
                <div className="strong-light">Friends</div>
                <div className="muted-light">{friends.length}</div>
              </div>
            </div>
            <div className="list-item-light">
              <div>
                <div className="strong-light">Pending Requests</div>
                <div className="muted-light">{pendingRequests.length}</div>
              </div>
            </div>
            <div className="list-item-light">
              <div>
                <div className="strong-light">Profile Status</div>
                <div className="muted-light">Ready to chat</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-shell-light">
      <aside className={`dashboard-sidebar-light ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand"> Chit-Chat </div>
        <button className={`sidebar-item-light ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => goTab("dashboard")} type="button">Dashboard</button>
        <button className={`sidebar-item-light ${activeTab === "profile" ? "active" : ""}`} onClick={() => goTab("profile")} type="button">My Profile</button>
        <button className={`sidebar-item-light ${activeTab === "settings" ? "active" : ""}`} onClick={() => goTab("settings")} type="button">Settings</button>
        <button className={`sidebar-item-light ${activeTab === "search" ? "active" : ""}`} onClick={() => goTab("search")} type="button">Search User By ID</button>
        <button className={`sidebar-item-light ${activeTab === "pending" ? "active" : ""}`} onClick={() => goTab("pending")} type="button">Pending Requests</button>
        <button className={`sidebar-item-light ${activeTab === "friends" ? "active" : ""}`} onClick={() => goTab("friends")} type="button">My Friends</button>
      </aside>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <section className="dashboard-main-light">
        <header className="dashboard-topbar-light">
          <button className="menu-icon-btn" onClick={() => setSidebarOpen((v) => !v)} type="button" title="Menu">
            <span className="hamburger-lines" />
          </button>
          <input
            className="dashboard-search-light"
            placeholder="Search User ID and press Enter"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goTab("search")}
          />
          <div className="top-actions">
            <button
              className="icon-action-btn"
              type="button"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀"}
            </button>
            <button
              className="icon-action-btn"
              type="button"
              title="My friends"
              onClick={() => goTab("friends")}
            >
              👥
            </button>
            <div className="top-avatar">{(me?.displayName || "U").slice(0, 1).toUpperCase()}</div>
            <button className="dashboard-logout-light" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        {renderMainPanel()}
      </section>
    </div>
  );
}
