import React, { useState, useEffect, useRef } from "react";

const API = "https://taskplanet-social-1.onrender.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("tp_token");
const headers = (isForm = false) => ({
  Authorization: `Bearer ${token()}`,
  ...(isForm ? {} : { "Content-Type": "application/json" }),
});
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const avatar = (name = "?") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true&size=80`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "#f4f6fb",
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    maxWidth: 430,
    margin: "0 auto",
    position: "relative",
  },
  topBar: {
    background: "#fff",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 8px rgba(0,0,0,.07)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoText: { fontWeight: 900, fontSize: 20, color: "#1a1a2e", letterSpacing: -0.5 },
  logoBadge: {
    background: "linear-gradient(135deg,#f7971e,#ffd200)",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 12,
    fontWeight: 800,
    color: "#fff",
    marginLeft: 6,
  },
  pointsChip: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#fff8e1",
    border: "1.5px solid #ffd200",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 13,
    fontWeight: 700,
    color: "#b8860b",
  },
  banner: {
    background: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)",
    margin: "12px 14px",
    borderRadius: 14,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 4px 14px rgba(247,151,30,.3)",
  },
  bannerText: { color: "#fff", fontWeight: 700, fontSize: 14 },
  card: {
    background: "#fff",
    borderRadius: 16,
    margin: "10px 14px",
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,.06)",
  },
  createPostBox: {
    background: "#fff",
    borderRadius: 16,
    margin: "10px 14px",
    padding: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,.06)",
  },
  textarea: {
    width: "100%",
    border: "1.5px solid #e8ecf4",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .2s",
  },
  btnPrimary: {
    background: "linear-gradient(135deg,#4776e6,#8e54e9)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "opacity .2s,transform .1s",
  },
  btnOutline: {
    background: "#fff",
    color: "#4776e6",
    border: "1.5px solid #4776e6",
    borderRadius: 10,
    padding: "9px 18px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  postCard: {
    background: "#fff",
    borderRadius: 16,
    margin: "10px 14px",
    boxShadow: "0 2px 12px rgba(0,0,0,.06)",
    overflow: "hidden",
    transition: "box-shadow .2s",
  },
  postHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px 8px",
  },
  avatarImg: { width: 38, height: 38, borderRadius: "50%", objectFit: "cover" },
  username: { fontWeight: 800, fontSize: 14, color: "#1a1a2e" },
  timeText: { fontSize: 11, color: "#aaa", marginTop: 1 },
  postText: { padding: "0 14px 10px", fontSize: 14, color: "#333", lineHeight: 1.5 },
  postImg: { width: "100%", maxHeight: 300, objectFit: "cover" },
  postActions: {
    display: "flex",
    gap: 8,
    padding: "8px 14px 12px",
    borderTop: "1px solid #f0f0f0",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    padding: "6px 12px",
    borderRadius: 20,
    transition: "background .15s",
  },
  commentSection: { padding: "0 14px 12px" },
  commentInput: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  commentInputField: {
    flex: 1,
    border: "1.5px solid #e8ecf4",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "linear-gradient(135deg,#4776e6,#8e54e9)",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  commentItem: {
    background: "#f7f9ff",
    borderRadius: 10,
    padding: "7px 11px",
    marginTop: 6,
    fontSize: 13,
    color: "#333",
  },
  commentUser: { fontWeight: 800, color: "#4776e6", marginRight: 5 },
  divider: { height: 1, background: "#f0f0f0", margin: "4px 0" },
  authWrap: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  authCard: {
    background: "#fff",
    borderRadius: 24,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 380,
    boxShadow: "0 24px 60px rgba(0,0,0,.4)",
  },
  authTitle: { fontWeight: 900, fontSize: 28, color: "#1a1a2e", textAlign: "center", marginBottom: 6 },
  authSub: { textAlign: "center", color: "#888", fontSize: 14, marginBottom: 24 },
  input: {
    width: "100%",
    border: "1.5px solid #e0e6ff",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
    transition: "border .2s",
  },
  label: { fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4, display: "block" },
  error: {
    background: "#fff0f0",
    border: "1px solid #ffcdd2",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#c62828",
    fontSize: 13,
    marginBottom: 12,
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: "#fff",
    boxShadow: "0 -2px 16px rgba(0,0,0,.09)",
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 0 12px",
    zIndex: 100,
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    color: "#aaa",
    padding: "4px 12px",
  },
  navItemActive: { color: "#4776e6" },
  rewardCard: {
    background: "linear-gradient(135deg,#6a11cb,#2575fc)",
    borderRadius: 16,
    margin: "10px 14px",
    padding: "16px",
    color: "#fff",
    boxShadow: "0 4px 18px rgba(106,17,203,.35)",
  },
  trendingCard: {
    background: "#fff8e1",
    borderRadius: 16,
    margin: "10px 14px",
    padding: 16,
    border: "2px solid #ffd200",
    boxShadow: "0 2px 10px rgba(255,210,0,.2)",
  },
  statsRow: {
    display: "flex",
    gap: 10,
    margin: "10px 14px",
  },
  statBox: {
    flex: 1,
    background: "#fff",
    borderRadius: 14,
    padding: "14px 10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
  },
  statValue: { fontWeight: 900, fontSize: 20, color: "#1a1a2e" },
  statLabel: { fontSize: 11, color: "#999", fontWeight: 600, marginTop: 2 },
};

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Fill all required fields");
    if (mode === "signup" && !form.username) return setError("Username required");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("tp_token", data.token);
      localStorage.setItem("tp_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={S.authWrap}>
      <div style={S.authCard}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ ...S.logoText, fontSize: 26 }}>Task</span>
          <span style={{ ...S.logoBadge, fontSize: 14, padding: "3px 12px" }}>Planet</span>
        </div>
        <div style={S.authTitle}>{mode === "login" ? "Welcome Back! 👋" : "Join TaskPlanet 🚀"}</div>
        <div style={S.authSub}>{mode === "login" ? "Login to your account" : "Create your account"}</div>

        {error && <div style={S.error}>{error}</div>}

        {mode === "signup" && (
          <>
            <label style={S.label}>Username</label>
            <input
              style={S.input}
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </>
        )}
        <label style={S.label}>Email</label>
        <input
          style={S.input}
          type="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label style={S.label}>Password</label>
        <input
          style={S.input}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <button
          style={{ ...S.btnPrimary, width: "100%", padding: "13px", fontSize: 15, marginTop: 4 }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login →" : "Create Account →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{ color: "#4776e6", fontWeight: 700, cursor: "pointer" }}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Create Post ──────────────────────────────────────────────────────────────
function CreatePost({ user, onPost }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!text && !image) return;
    setLoading(true);
    try {
      const fd = new FormData();
      if (text) fd.append("text", text);
      if (image) fd.append("image", image);
      const res = await fetch(`${API}/posts`, { method: "POST", headers: headers(true), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onPost(data);
      setText("");
      setImage(null);
      setPreview("");
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={S.createPostBox}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <img src={avatar(user.username)} alt="" style={S.avatarImg} />
        <textarea
          style={{ ...S.textarea, flex: 1, minHeight: 60 }}
          placeholder={`What's on your mind, ${user.username}? ✨`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {preview && (
        <div style={{ position: "relative", marginBottom: 10 }}>
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover" }} />
          <button
            onClick={() => { setImage(null); setPreview(""); }}
            style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.5)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14 }}
          >✕</button>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button style={{ ...S.btnOutline, fontSize: 13, padding: "7px 14px" }} onClick={() => fileRef.current.click()}>
          📷 Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        <button
          style={{ ...S.btnPrimary, opacity: (!text && !image) ? 0.5 : 1 }}
          onClick={submit}
          disabled={loading || (!text && !image)}
        >
          {loading ? "Posting..." : "Post 🚀"}
        </button>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const liked = post.likes.includes(currentUser.username);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post._id, commentText);
    setCommentText("");
    setSubmitting(false);
  };

  const isOwner = post.author?._id === currentUser.id || post.author?._id === currentUser._id;

  return (
    <div style={S.postCard}>
      <div style={S.postHeader}>
        <img src={avatar(post.author?.username)} alt="" style={S.avatarImg} />
        <div style={{ flex: 1 }}>
          <div style={S.username}>@{post.author?.username}</div>
          <div style={S.timeText}>{timeAgo(post.createdAt)}</div>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(post._id)}
            style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, padding: 4 }}
            title="Delete post"
          >🗑</button>
        )}
      </div>

      {post.text && <div style={S.postText}>{post.text}</div>}
      {post.image && <img src={`http://localhost:5000${post.image}`} alt="post" style={S.postImg} />}

      <div style={S.postActions}>
        <button
          style={{
            ...S.actionBtn,
            background: liked ? "#fff0f7" : "#f7f9ff",
            color: liked ? "#e91e63" : "#666",
          }}
          onClick={() => onLike(post._id)}
        >
          {liked ? "❤️" : "🤍"} {post.likes.length}
        </button>
        <button
          style={{ ...S.actionBtn, background: "#f7f9ff", color: "#666" }}
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div style={S.commentSection}>
          {post.comments.slice(-3).map((c, i) => (
            <div key={i} style={S.commentItem}>
              <span style={S.commentUser}>@{c.username}</span>
              {c.text}
            </div>
          ))}
          {post.comments.length > 3 && (
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>+{post.comments.length - 3} more</div>
          )}
          <div style={S.commentInput}>
            <input
              style={S.commentInputField}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />
            <button style={S.sendBtn} onClick={submitComment} disabled={submitting}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Home Feed ────────────────────────────────────────────────────────────────
function HomeFeed({ user, posts, setPosts, onLike, onComment, onDelete }) {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((a, p) => a + p.likes.length, 0);

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Top Banner */}
      <div style={S.banner}>
        <span style={{ fontSize: 22 }}>📢</span>
        <div style={S.bannerText}>Complete tasks &amp; earn rewards! 🎉</div>
      </div>

      {/* Stats Row */}
      <div style={S.statsRow}>
        <div style={S.statBox}>
          <div style={S.statValue}>💰 {user.points || 100}</div>
          <div style={S.statLabel}>Points</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>📝 {totalPosts}</div>
          <div style={S.statLabel}>Posts</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statValue}>❤️ {totalLikes}</div>
          <div style={S.statLabel}>Likes</div>
        </div>
      </div>

      {/* Reward Card */}
      <div style={S.rewardCard}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>🏆 Active Referrals Reward</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Earn up to <b>100 ⭐ Daily</b> from active referrals</div>
        <button style={{ ...S.btnPrimary, marginTop: 12, background: "rgba(255,255,255,.2)", border: "1.5px solid rgba(255,255,255,.4)" }}>
          Invite Friends →
        </button>
      </div>

      {/* Create Post */}
      <CreatePost user={user} onPost={(p) => setPosts([p, ...posts])} />

      {/* Trending */}
      <div style={S.trendingCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: "#b8860b" }}>🔥 Earn Up to 10,00,000 Points/Month!</div>
          <span style={{ background: "#e53935", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 800 }}>TRENDING</span>
        </div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>Complete Tasks and Boost your rank. From Sign up, surveys to app installs...</div>
        <button style={{ ...S.btnPrimary, marginTop: 12, background: "linear-gradient(135deg,#f7971e,#ffd200)", width: "100%", padding: 12 }}>
          Start Earning 🚀
        </button>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>No posts yet. Be the first!</div>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={user}
            onLike={onLike}
            onComment={onComment}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen({ user, posts, onLogout }) {
  const myPosts = posts.filter((p) => p.author?.username === user.username);
  const myLikes = posts.reduce((a, p) => a + (p.likes.includes(user.username) ? 1 : 0), 0);

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ ...S.card, textAlign: "center", padding: "24px 16px" }}>
        <img src={avatar(user.username)} alt="" style={{ width: 70, height: 70, borderRadius: "50%", margin: "0 auto 12px" }} />
        <div style={{ fontWeight: 900, fontSize: 20, color: "#1a1a2e" }}>@{user.username}</div>
        <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>{user.email}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <div><div style={{ fontWeight: 900, fontSize: 22 }}>{myPosts.length}</div><div style={{ fontSize: 12, color: "#999" }}>Posts</div></div>
          <div><div style={{ fontWeight: 900, fontSize: 22 }}>{myLikes}</div><div style={{ fontSize: 12, color: "#999" }}>Liked</div></div>
          <div><div style={{ fontWeight: 900, fontSize: 22 }}>{user.points || 100}</div><div style={{ fontSize: 12, color: "#999" }}>Points</div></div>
        </div>
      </div>
      <div style={{ margin: "0 14px 10px", fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>My Posts</div>
      {myPosts.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: 30 }}>No posts yet</div>
      ) : (
        myPosts.map((p) => (
          <div key={p._id} style={S.card}>
            {p.text && <div style={{ fontSize: 14, color: "#333", marginBottom: p.image ? 8 : 0 }}>{p.text}</div>}
            {p.image && <img src={`http://localhost:5000${p.image}`} alt="" style={{ width: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover" }} />}
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>❤️ {p.likes.length} &nbsp; 💬 {p.comments.length} &nbsp; · {timeAgo(p.createdAt)}</div>
          </div>
        ))
      )}
      <div style={{ margin: "10px 14px" }}>
        <button style={{ ...S.btnOutline, width: "100%", padding: 13, color: "#e53935", borderColor: "#e53935" }} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  const items = [
    { key: "home", icon: "🏠", label: "Home" },
    { key: "feed", icon: "📰", label: "Feed" },
    { key: "post", icon: "➕", label: "Post" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <div style={S.bottomNav}>
      {items.map((item) => (
        <button
          key={item.key}
          style={{ ...S.navItem, ...(tab === item.key ? S.navItemActive : {}) }}
          onClick={() => setTab(item.key)}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Feed Only Tab ────────────────────────────────────────────────────────────
function FeedTab({ user, posts, onLike, onComment, onDelete }) {
  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ margin: "14px 14px 6px", fontWeight: 900, fontSize: 18, color: "#1a1a2e" }}>
        📰 Social Feed
      </div>
      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>No posts yet</div>
        </div>
      ) : (
        posts.map((p) => (
          <PostCard key={p._id} post={p} currentUser={user} onLike={onLike} onComment={onComment} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}

// ─── Create Post Tab ──────────────────────────────────────────────────────────
function CreatePostTab({ user, setPosts, setTab }) {
  return (
    <div style={{ padding: "14px 0 90px" }}>
      <div style={{ margin: "0 14px 10px", fontWeight: 900, fontSize: 18, color: "#1a1a2e" }}>✍️ Create Post</div>
      <CreatePost user={user} onPost={(p) => { setPosts((prev) => [p, ...prev]); setTab("feed"); }} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tp_user")); } catch { return null; }
  });
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts`, { headers: headers() });
      if (res.ok) setPosts(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API}/posts/${postId}/like`, { method: "POST", headers: headers() });
      const data = await res.json();
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch {}
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await fetch(`${API}/posts/${postId}/comment`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: data.comments } : p));
    } catch {}
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await fetch(`${API}/posts/${postId}`, { method: "DELETE", headers: headers() });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_user");
    setUser(null);
    setPosts([]);
  };

  if (!user) return <AuthScreen onAuth={(u) => setUser(u)} />;

  return (
    <div style={S.app}>
      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.logoText}>Task</span>
          <span style={S.logoBadge}>Planet</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.pointsChip}>⭐ {user.points || 100}</div>
          <img src={avatar(user.username)} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Content */}
      {loading && <div style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Loading...</div>}

      {tab === "home" && (
        <HomeFeed user={user} posts={posts} setPosts={setPosts} onLike={handleLike} onComment={handleComment} onDelete={handleDelete} />
      )}
      {tab === "feed" && (
        <FeedTab user={user} posts={posts} onLike={handleLike} onComment={handleComment} onDelete={handleDelete} />
      )}
      {tab === "post" && (
        <CreatePostTab user={user} setPosts={setPosts} setTab={setTab} />
      )}
      {tab === "profile" && (
        <ProfileScreen user={user} posts={posts} onLogout={handleLogout} />
      )}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
