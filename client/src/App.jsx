import { useEffect, useRef, useState } from "react";

const DEFAULT_POSTS = [
  {
    id: "sample-1",
    authorName: "John Smith",
    username: "johnsmith",
    avatar: "J",
    text: "Just finished working on an exciting new project! 🚀",
    image: "",
    time: "2h",
    likeCount: 24,
    liked: false,
    repostCount: 5,
    reposted: false,
    bookmarked: false,
    isUserPost: false,
  },
  {
    id: "sample-2",
    authorName: "Sarah Williams",
    username: "sarahw",
    avatar: "S",
    text: "Learning React has been challenging, but I'm finally starting to understand how everything works. 💻",
    image: "",
    time: "4h",
    likeCount: 41,
    liked: false,
    repostCount: 8,
    reposted: false,
    bookmarked: false,
    isUserPost: false,
  },
  {
    id: "sample-3",
    authorName: "Michael Brown",
    username: "michaelb",
    avatar: "M",
    text: "Beautiful day to build something amazing.",
    image: "",
    time: "6h",
    likeCount: 17,
    liked: false,
    repostCount: 3,
    reposted: false,
    bookmarked: false,
    isUserPost: false,
  },
];

function getStoredData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

/* =========================
CORRECTED USER STORAGE
========================= */

function getStoredUser() {
  try {
    const saved = localStorage.getItem("currentUser");

    if (!saved) return null;

    const user = JSON.parse(saved);

    if (!user || typeof user !== "object") {
      localStorage.removeItem("currentUser");
      return null;
    }

    if (!user.id || !user.email || !user.username) {
      localStorage.removeItem("currentUser");
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem("currentUser");
    return null;
  }
}

/* =========================
POST NORMALIZATION
========================= */

function normalizePosts(posts) {
  if (!Array.isArray(posts)) return DEFAULT_POSTS;

  return posts.map((post) => ({
    ...post,
    authorName: post.authorName || "User",
    username: post.username || "user",
    avatar: post.avatar || "U",
    text: post.text || "",
    image: post.image || "",
    time: post.time || "now",
    likeCount: Number(post.likeCount) || 0,
    liked: Boolean(post.liked),
    repostCount: Number(post.repostCount) || 0,
    reposted: Boolean(post.reposted),
    bookmarked: Boolean(post.bookmarked),
  }));
}

/* =========================
POST IMAGE COMPONENT
========================= */

function PostImage({ image }) {
  if (!image) return null;

  return (
    <div className="post-image-wrapper">
      <img src={image} alt="Post attachment" className="post-image" />
    </div>
  );
}

/* =========================
AUTH
========================= */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim() || !username.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const cleanUsername = username
        .trim()
        .replace(/\s+/g, "")
        .toLowerCase()
        .replace(/^@/, "");

      if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
        setError(
          "Username can only contain letters, numbers, dots, underscores, and hyphens.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "signin"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/register";

      const body =
        mode === "signin"
          ? {
              email: cleanEmail,
              password,
            }
          : {
              name: name.trim(),
              username: username
                .trim()
                .replace(/\s+/g, "")
                .toLowerCase()
                .replace(/^@/, ""),
              email: cleanEmail,
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            (mode === "signin"
              ? "Incorrect email or password."
              : "Unable to create your account."),
        );
        return;
      }

      onLogin(data.user);
    } catch (requestError) {
      console.error("Authentication error:", requestError);
      setError(
        "Unable to connect to the server. Make sure the backend is running on port 5000.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((current) => (current === "signin" ? "signup" : "signin"));

    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">𝕏</div>

        <div className="auth-header">
          <h1>{mode === "signin" ? "Sign in to X" : "Create your account"}</h1>

          <p>
            {mode === "signin"
              ? "Welcome back! Sign in to continue."
              : "Join the conversation and share your thoughts."}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="auth-field">
                <label>Full name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="auth-field">
                <label>Username</label>

                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button type="button" onClick={switchMode} disabled={isSubmitting}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>

        <p className="auth-footer">
          By continuing, you agree to use this demo application responsibly.
        </p>
      </div>
    </div>
  );
}

/* =========================
MAIN APP
========================= */

function HomePage({
  currentUser,
  postText,
  setPostText,
  postImage,
  removePostImage,
  imageInputRef,
  handleImageSelect,
  handlePost,
  searchText,
  setSearchText,
  filteredPosts,
  comments,
  activePost,
  setActivePost,
  handleDeletePost,
  handleRepost,
  handleLike,
  handleBookmark,
  commentText,
  setCommentText,
  handleComment,
}) {
  return (
    <>
      <header className="feed-header">
        <h2>Home</h2>
      </header>

      <div className="compose">
        <div className="avatar">
          {currentUser.avatar || currentUser.name.charAt(0)}
        </div>

        <div className="compose-content">
          <textarea
            className="compose-input"
            placeholder="What is happening?!"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />

          {postImage && (
            <div className="compose-image-preview">
              <img src={postImage} alt="Selected upload" />

              <button
                type="button"
                className="remove-image-button"
                onClick={removePostImage}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}

          <div className="compose-bottom">
            <div className="compose-icons">
              <button
                type="button"
                className="compose-image-button"
                onClick={() => imageInputRef.current?.click()}
                title="Add image"
                aria-label="Add image"
              >
                <Icon name="image" size={18} />
              </button>

              <button
                type="button"
                className="compose-tool-button"
                onClick={() =>
                  setPostText((prev) => prev + (prev ? " " : "") + "GIF")
                }
                title="Add GIF text"
              >
                GIF
              </button>

              <button
                type="button"
                className="compose-tool-button"
                onClick={() =>
                  setPostText((prev) => prev + (prev ? " " : "") + "😊")
                }
                title="Add emoji"
              >
                <Icon name="smile" size={18} />
              </button>

              <button
                type="button"
                className="compose-tool-button"
                onClick={() =>
                  setPostText((prev) => prev + (prev ? " " : "") + "📍")
                }
                title="Add location"
              >
                <Icon name="pin" size={18} />
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{
                  display: "none",
                }}
              />
            </div>

            <button
              onClick={handlePost}
              disabled={!postText.trim() && !postImage}
              className="small-post-button"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className="home-search">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="empty-profile">
          <h3>No posts found.</h3>

          <p>Try a different search.</p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const postComments = comments[post.id] || [];

          const isOwnPost = post.username === currentUser.username;

          return (
            <article className="post" key={post.id}>
              <div className="avatar">{post.avatar}</div>

              <div className="post-content">
                <div className="post-header">
                  <strong>{post.authorName}</strong>

                  <span>@{post.username}</span>

                  <span>·</span>

                  <span>{post.time}</span>

                  {isOwnPost && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="delete-post-button"
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  )}
                </div>

                {post.text && <p className="post-text">{post.text}</p>}

                <PostImage image={post.image} />

                <div className="post-actions">
                  <button
                    onClick={() =>
                      setActivePost(activePost === post.id ? null : post.id)
                    }
                  >
                    <Icon name="comment" size={18} />
                    <span>{postComments.length}</span>
                  </button>

                  <button
                    onClick={() => handleRepost(post.id)}
                    aria-label="Repost"
                  >
                    <Icon name="repost" size={18} />
                    <span>{post.repostCount}</span>
                  </button>

                  <button onClick={() => handleLike(post.id)} aria-label="Like">
                    <Icon name="heart" size={18} />
                    <span>{post.likeCount}</span>
                  </button>

                  <button
                    onClick={() => handleBookmark(post.id)}
                    className="bookmark-button"
                    style={{
                      color: post.bookmarked ? "#1d9bf0" : "inherit",
                      transform: post.bookmarked ? "scale(1.08)" : "scale(1)",
                    }}
                    aria-label={
                      post.bookmarked ? "Remove bookmark" : "Bookmark"
                    }
                    aria-pressed={post.bookmarked}
                  >
                    <Icon name="bookmark" size={18} />
                  </button>
                </div>

                {activePost === post.id && (
                  <div className="comments-box">
                    <div className="small-avatar">
                      {currentUser.avatar || currentUser.name.charAt(0)}
                    </div>

                    <input
                      type="text"
                      placeholder="Post your reply"
                      value={commentText[post.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleComment(post.id);
                        }
                      }}
                    />

                    <button
                      onClick={() => handleComment(post.id)}
                      className="reply-button"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {activePost === post.id && postComments.length > 0 && (
                  <div className="comments-list">
                    {postComments.map((comment) => (
                      <div className="comment" key={comment.id}>
                        <div className="small-avatar">{comment.avatar}</div>

                        <div>
                          <strong>{comment.authorName}</strong>

                          <span className="comment-username">
                            @{comment.username}
                          </span>

                          <p>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })
      )}
    </>
  );
}

function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `nav-svg-icon ${className}`.trim(),
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      );
    case "notifications":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "messages":
      return (
        <svg {...common}>
          <path d="M20 11.5a8 8 0 0 1-8.5 8A9.6 9.6 0 0 1 7 18.3L3 20l1.5-4A8.2 8.2 0 0 1 4 11.5a8 8 0 0 1 8-8 8 8 0 0 1 8 8Z" />
          <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21Z" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-1.41 1.41-.06-.06a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V20h-2v-.32a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-1.98.36l-.06.06-1.41-1.41.06-.06A1.8 1.8 0 0 0 8.2 15a1.8 1.8 0 0 0-1.65-1.1H6v-2h.32A1.8 1.8 0 0 0 7.97 10.8 1.8 1.8 0 0 0 7.6 8.82l-.06-.06 1.41-1.41.06.06A1.8 1.8 0 0 0 11 7.05 1.8 1.8 0 0 0 12.1 5.4V5h2v.32A1.8 1.8 0 0 0 15.2 6.97a1.8 1.8 0 0 0 1.98-.36l.06-.06 1.41 1.41-.06.06A1.8 1.8 0 0 0 18.95 10a1.8 1.8 0 0 0 1.65 1.1H21v2h-.32A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "comment":
      return (
        <svg {...common}>
          <path d="M20 11.5a8 8 0 0 1-8.5 8A9.6 9.6 0 0 1 7 18.3L3 20l1.5-4A8.2 8.2 0 0 1 4 11.5a8 8 0 0 1 8-8 8 8 0 0 1 8 8Z" />
        </svg>
      );
    case "repost":
      return (
        <svg {...common}>
          <path d="M7 7h10l-3-3m3 3-3 3" />
          <path d="M17 17H7l3 3m-3-3 3-3" />
          <path d="M5 9v2a4 4 0 0 0 4 4h8" />
          <path d="M19 15v-2a4 4 0 0 0-4-4H7" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.9c0 5.3-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.9A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8.8 2.1Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4 17 5-5 4 4 2.5-2.5L20 17.5" />
        </svg>
      );
    case "smile":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 14.5a4 4 0 0 0 7 0M9 9h.01M15 9h.01" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    default:
      return null;
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  const [posts, setPosts] = useState(() =>
    normalizePosts(getStoredData("posts", DEFAULT_POSTS)),
  );

  const [postText, setPostText] = useState("");

  const [postImage, setPostImage] = useState("");

  const imageInputRef = useRef(null);

  const [searchText, setSearchText] = useState("");

  const [comments, setComments] = useState(() => getStoredData("comments", {}));

  const [commentText, setCommentText] = useState({});
  const [activePost, setActivePost] = useState(null);

  const [followedUsers, setFollowedUsers] = useState(() => {
    const stored = getStoredData("followedUsers", []);
    return Array.isArray(stored) ? stored : [];
  });

  const [notifications, setNotifications] = useState(() =>
    getStoredData("notifications", []),
  );

  /* =========================
MESSAGES
========================= */

  const [messages, setMessages] = useState(() => getStoredData("messages", {}));

  const [selectedChat, setSelectedChat] = useState(null);

  const [messageText, setMessageText] = useState("");

  const [messageSearch, setMessageSearch] = useState("");

  /* =========================
EXPLORE
========================= */

  const [exploreSearch, setExploreSearch] = useState("");

  const [selectedTopic, setSelectedTopic] = useState("");

  const [activePage, setActivePage] = useState("home");

  const [profileTab, setProfileTab] = useState("posts");

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editName, setEditName] = useState("");

  const [editUsername, setEditUsername] = useState("");

  const [editBio, setEditBio] = useState("");

  const [editAvatar, setEditAvatar] = useState("");

  const [profileError, setProfileError] = useState("");

  /* =========================
SETTINGS
========================= */

  const [darkMode, setDarkMode] = useState(() =>
    getStoredData("darkMode", false),
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    getStoredData("notificationsEnabled", true),
  );

  const [privateAccount, setPrivateAccount] = useState(() =>
    getStoredData("privateAccount", false),
  );

  /* =========================
LOCAL STORAGE
========================= */

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("followedUsers", JSON.stringify(followedUsers));
  }, [followedUsers]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(notificationsEnabled),
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("privateAccount", JSON.stringify(privateAccount));
  }, [privateAccount]);

  /* =========================
  LOAD POSTS FROM MONGODB
  ========================= */

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadPosts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/posts?userId=${encodeURIComponent(currentUser.id)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to load posts:", data.message);
          return;
        }

        const mongoPosts = (data.posts || []).map((post) => ({
          ...post,
          id: post._id || post.id,
          time: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : "now",
          liked: Boolean(post.liked),
          reposted: Boolean(post.reposted),
          bookmarked: Boolean(post.bookmarked),
          isUserPost: post.username === currentUser.username,
        }));

        setPosts(mongoPosts);

        const nextComments = {};
        mongoPosts.forEach((post) => {
          nextComments[post.id] = Array.isArray(post.comments)
            ? post.comments
            : [];
        });
        setComments(nextComments);
      } catch (error) {
        console.error("Load posts error:", error);
      }
    };

    const loadFollowing = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${encodeURIComponent(currentUser.id)}/following`,
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("Load following failed:", data.message);
          return;
        }

        if (Array.isArray(data.following)) {
          setFollowedUsers(data.following);
          localStorage.setItem("followedUsers", JSON.stringify(data.following));
        }
      } catch (error) {
        console.error("Load following error:", error);
      }
    };

    loadPosts();
    loadFollowing();
  }, [currentUser]);

  /* =========================
LOGIN / LOGOUT
========================= */

  const handleLogin = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));

    setCurrentUser(user);
    setActivePage("home");
    setIsEditingProfile(false);
    setProfileError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");

    setCurrentUser(null);
    setActivePage("home");
    setIsEditingProfile(false);
    setProfileError("");
    setSelectedChat(null);
    setMessageText("");
  };

  /* =========================
NOTIFICATIONS
========================= */

  const addNotification = (message, type = "activity") => {
    if (!notificationsEnabled) return;

    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      message,
      type,
      time: "now",
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  /* =========================
PROFILE
========================= */

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || "");

    setEditUsername(currentUser?.username || "");

    setEditBio(currentUser?.bio || "");

    setEditAvatar(currentUser?.avatar || currentUser?.name?.charAt(0) || "");

    setProfileError("");

    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    const newName = editName.trim();

    const newUsername = editUsername
      .trim()
      .replace(/\s+/g, "")
      .toLowerCase()
      .replace(/^@/, "");

    const newBio = editBio.trim();

    const newAvatar =
      editAvatar.trim().charAt(0).toUpperCase() ||
      newName.charAt(0).toUpperCase();

    if (!newName) {
      setProfileError("Please enter your name.");
      return;
    }

    if (!newUsername) {
      setProfileError("Please enter a username.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(newUsername)) {
      setProfileError(
        "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      );
      return;
    }

    const users = getStoredData("users", []);

    const usernameTaken = users.some(
      (user) =>
        user.id !== currentUser.id &&
        user.username?.toLowerCase() === newUsername,
    );

    if (usernameTaken) {
      setProfileError("That username is already taken.");
      return;
    }

    const oldUsername = currentUser.username;

    const updatedUser = {
      ...currentUser,
      name: newName,
      username: newUsername,
      bio: newBio,
      avatar: newAvatar,
    };

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? updatedUser : user,
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setPosts((prev) =>
      prev.map((post) =>
        post.username === oldUsername
          ? {
              ...post,
              authorName: newName,
              username: newUsername,
              avatar: newAvatar,
            }
          : post,
      ),
    );

    setCurrentUser(updatedUser);

    setIsEditingProfile(false);

    setProfileError("");
  };

  /* =========================
IMAGE UPLOAD
========================= */

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      alert("Please choose an image smaller than 10MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const originalImage = event.target?.result;

      if (!originalImage) return;

      const img = new Image();

      img.onload = () => {
        const maxWidth = 1400;

        const scale = img.width > maxWidth ? maxWidth / img.width : 1;

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);

        canvas.height = Math.round(img.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          setPostImage(originalImage);
          return;
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

        setPostImage(compressedImage);
      };

      img.onerror = () => {
        alert("Unable to process this image.");
      };

      img.src = originalImage;
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const removePostImage = () => {
    setPostImage("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  /* =========================
POSTS
========================= */

  const handlePost = async () => {
    if (!postText.trim() && !postImage) return;

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          username: currentUser.username,
          avatar:
            currentUser.avatar ||
            currentUser.name?.charAt(0).toUpperCase() ||
            "U",
          text: postText.trim(),
          image: postImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Create post failed:", data.message);
        return;
      }

      const savedPost = {
        ...data.post,
        id: data.post._id,
        time: "now",
        liked: false,
        reposted: false,
        bookmarked: false,
        isUserPost: true,
      };

      setPosts((prev) => [savedPost, ...prev]);

      setPostText("");
      setPostImage("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Create post error:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUser.id }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete post failed:", data.message);
        return;
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setComments((prev) => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Like failed:", data.message);
        return;
      }

      const returnedPost = data.post;

      setPosts((prev) =>
        prev.map((post) =>
          String(post.id) === String(postId)
            ? {
                ...post,
                ...(returnedPost || {}),
                id: returnedPost?.id || post.id,
                liked: Boolean(returnedPost?.liked ?? data.liked),
                likeCount: Number(
                  returnedPost?.likeCount ?? data.likeCount ?? 0,
                ),
                reposted: Boolean(returnedPost?.reposted ?? post.reposted),
                repostCount: Number(
                  returnedPost?.repostCount ?? post.repostCount ?? 0,
                ),
                bookmarked: Boolean(
                  returnedPost?.bookmarked ?? post.bookmarked,
                ),
              }
            : post,
        ),
      );

      if (data.liked) {
        const targetPost = posts.find(
          (post) => String(post.id) === String(postId),
        );
        if (targetPost) {
          addNotification(
            `You liked a post by @${targetPost.username}.`,
            "like",
          );
        }
      }
    } catch (error) {
      console.error("Like post error:", error);
    }
  };

  const handleRepost = async (postId) => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/repost`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Repost failed:", data.message);
        return;
      }

      const returnedPost = data.post;

      setPosts((prev) =>
        prev.map((post) =>
          String(post.id) === String(postId)
            ? {
                ...post,
                ...(returnedPost || {}),
                id: returnedPost?.id || post.id,
                liked: Boolean(returnedPost?.liked ?? post.liked),
                likeCount: Number(
                  returnedPost?.likeCount ?? post.likeCount ?? 0,
                ),
                reposted: Boolean(returnedPost?.reposted ?? data.reposted),
                repostCount: Number(
                  returnedPost?.repostCount ?? data.repostCount ?? 0,
                ),
                bookmarked: Boolean(
                  returnedPost?.bookmarked ?? post.bookmarked,
                ),
              }
            : post,
        ),
      );

      if (data.reposted) {
        const targetPost = posts.find(
          (post) => String(post.id) === String(postId),
        );
        if (targetPost && targetPost.username !== currentUser.username) {
          addNotification(
            `${currentUser.name} reposted ${targetPost.authorName}'s post.`,
            "repost",
          );
        }
      }
    } catch (error) {
      console.error("Repost error:", error);
    }
  };

  const handleBookmark = async (postId) => {
    if (!currentUser?.id) return;

    const targetPost = posts.find((post) => String(post.id) === String(postId));

    if (!targetPost) return;

    const previousBookmarked = Boolean(targetPost.bookmarked);
    const optimisticBookmarked = !previousBookmarked;

    // Update the interface immediately.
    setPosts((prev) =>
      prev.map((post) =>
        String(post.id) === String(postId)
          ? {
              ...post,
              bookmarked: optimisticBookmarked,
            }
          : post,
      ),
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Bookmark failed:", data.message);

        // Restore the previous state if the backend rejects the request.
        setPosts((prev) =>
          prev.map((post) =>
            String(post.id) === String(postId)
              ? {
                  ...post,
                  bookmarked: previousBookmarked,
                }
              : post,
          ),
        );

        return;
      }

      const serverBookmarked = Boolean(
        data.post?.bookmarked ?? data.bookmarked ?? optimisticBookmarked,
      );

      // Sync the interface with the backend response.
      setPosts((prev) =>
        prev.map((post) =>
          String(post.id) === String(postId)
            ? {
                ...post,
                bookmarked: serverBookmarked,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("Bookmark error:", error);

      // Restore the previous state if the request fails.
      setPosts((prev) =>
        prev.map((post) =>
          String(post.id) === String(postId)
            ? {
                ...post,
                bookmarked: previousBookmarked,
              }
            : post,
        ),
      );
    }
  };

  /* =========================
USERS / FOLLOW
========================= */

  const suggestedUsers = [
    {
      name: "John Smith",
      username: "johnsmith",
      avatar: "J",
    },
    {
      name: "Sarah Williams",
      username: "sarahw",
      avatar: "S",
    },
    {
      name: "Michael Brown",
      username: "michaelb",
      avatar: "M",
    },
  ];

  const handleFollow = async (username) => {
    if (!currentUser?.id || !username) return;

    const followedUser = suggestedUsers.find(
      (user) => user.username === username,
    );

    const currentlyFollowing = followedUsers.includes(username);

    const optimisticFollowing = currentlyFollowing
      ? followedUsers.filter((item) => item !== username)
      : [...followedUsers, username];

    // Update the interface immediately.
    setFollowedUsers(optimisticFollowing);
    localStorage.setItem("followedUsers", JSON.stringify(optimisticFollowing));

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${currentUser.id}/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Follow failed:", data.message);
        return;
      }

      if (Array.isArray(data.following)) {
        setFollowedUsers(data.following);
        localStorage.setItem("followedUsers", JSON.stringify(data.following));
      }

      if (data.isFollowing && followedUser) {
        addNotification(
          `You are now following ${followedUser.name}.`,
          "follow",
        );
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  /* =========================
COMMENTS
========================= */

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    const post = posts.find((item) => item.id === postId);
    if (!post) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorId: currentUser.id,
            authorName: currentUser.name,
            username: currentUser.username,
            avatar:
              currentUser.avatar || currentUser.name.charAt(0).toUpperCase(),
            text,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Comment failed:", data.message);
        return;
      }

      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment],
      }));

      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      if (post.username !== currentUser.username) {
        addNotification(
          `${currentUser.name} replied to ${post.authorName}'s post.`,
          "comment",
        );
      }
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  /* =========================
SEARCH
========================= */

  const filteredPosts = posts.filter((post) => {
    const search = searchText.toLowerCase().trim();

    if (!search) return true;

    return (
      post.text.toLowerCase().includes(search) ||
      post.authorName.toLowerCase().includes(search) ||
      post.username.toLowerCase().includes(search)
    );
  });

  /* =========================
EXPLORE
========================= */

  const trends = [
    {
      category: "Technology · Trending",
      title: "#TechNigeria",
      posts: "12.5K posts",
    },
    {
      category: "Technology · Trending",
      title: "React",
      posts: "8,421 posts",
    },
    {
      category: "Programming · Trending",
      title: "JavaScript",
      posts: "6,892 posts",
    },
    {
      category: "Web Development · Trending",
      title: "#WebDevelopment",
      posts: "4,321 posts",
    },
    {
      category: "Trending in Nigeria",
      title: "#Nigeria",
      posts: "18.7K posts",
    },
  ];

  const explorePosts = posts.filter((post) => {
    const search = exploreSearch.toLowerCase().trim();

    const matchesSearch =
      !search ||
      post.text.toLowerCase().includes(search) ||
      post.authorName.toLowerCase().includes(search) ||
      post.username.toLowerCase().includes(search);

    const matchesTopic =
      !selectedTopic ||
      post.text.toLowerCase().includes(selectedTopic.toLowerCase());

    return matchesSearch && matchesTopic;
  });

  /* =========================
MESSAGES
========================= */

  const messageUsers = suggestedUsers.filter(
    (user) => user.username !== currentUser?.username,
  );

  const getChatMessages = (username) => messages[username] || [];

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text || !selectedChat) return;

    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),

      sender: currentUser.username,

      text,

      time: "now",

      read: true,
    };

    setMessages((prev) => ({
      ...prev,

      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }));

    setMessageText("");
  };

  const getLastMessage = (username) => {
    const chat = messages[username] || [];

    if (!chat.length) {
      return "Start a conversation";
    }

    return chat[chat.length - 1].text;
  };

  const getUnreadMessages = (username) => {
    const chat = messages[username] || [];

    return chat.filter(
      (message) => message.sender !== currentUser.username && !message.read,
    ).length;
  };

  const openChat = (username) => {
    setSelectedChat(username);

    setMessages((prev) => ({
      ...prev,

      [username]: (prev[username] || []).map((message) =>
        message.sender !== currentUser.username
          ? {
              ...message,
              read: true,
            }
          : message,
      ),
    }));
  };

  const totalUnreadMessages = messageUsers.reduce(
    (total, user) => total + getUnreadMessages(user.username),
    0,
  );

  /* =========================
AUTH CHECK
========================= */

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  /* =========================
PROFILE DATA
========================= */

  const myPosts = posts.filter(
    (post) => post.username === currentUser.username,
  );

  const myLikedPosts = posts.filter((post) => post.liked);

  const bookmarkedPosts = posts.filter((post) => post.bookmarked);

  /* =========================
NOTIFICATIONS PAGE
========================= */

  const NotificationsPage = () => {
    const unreadCount = notifications.filter(
      (notification) => !notification.read,
    ).length;

    const markAllRead = () => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    };

    return (
      <div className="notifications-page">
        <div className="feed-header notifications-header">
          <div>
            <h2>Notifications</h2>

            <p>
              {unreadCount
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button className="mark-read-button" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-notifications-icon">
              <Icon name="notifications" size={30} />
            </div>

            <h3>Nothing to see here — yet</h3>

            <p>
              When people interact with your posts, you'll see notifications
              here.
            </p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                className={`notification-item ${
                  notification.read ? "" : "unread"
                }`}
                key={notification.id}
              >
                <div className="notification-icon">
                  {notification.type === "like" && (
                    <Icon name="heart" size={18} />
                  )}
                  {notification.type === "repost" && (
                    <Icon name="repost" size={18} />
                  )}
                  {notification.type === "comment" && (
                    <Icon name="comment" size={18} />
                  )}
                  {notification.type === "follow" && (
                    <Icon name="profile" size={18} />
                  )}
                  {notification.type === "activity" && (
                    <Icon name="notifications" size={18} />
                  )}
                </div>

                <div className="notification-content">
                  <p>{notification.message}</p>

                  <span>{notification.time}</span>
                </div>

                {!notification.read && (
                  <span className="notification-dot"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* =========================
EXPLORE PAGE
========================= */

  const ExplorePage = () => {
    return (
      <div className="explore-page">
        <div className="feed-header explore-header">
          <div>
            <h2>Explore</h2>

            <p>Discover what's happening</p>
          </div>
        </div>

        <div className="explore-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search Explore"
            value={exploreSearch}
            onChange={(e) => setExploreSearch(e.target.value)}
          />
        </div>

        <section className="explore-section">
          <div className="explore-section-header">
            <h3>What's happening</h3>
          </div>

          {trends.map((trend) => (
            <button
              className={`explore-trend ${
                selectedTopic === trend.title ? "selected" : ""
              }`}
              key={trend.title}
              onClick={() =>
                setSelectedTopic(
                  selectedTopic === trend.title ? "" : trend.title,
                )
              }
            >
              <span>{trend.category}</span>

              <strong>{trend.title}</strong>

              <small>{trend.posts}</small>
            </button>
          ))}
        </section>

        <section className="explore-section">
          <div className="explore-section-header">
            <h3>Who to follow</h3>
          </div>

          {suggestedUsers.map((user) => {
            const isFollowed = followedUsers.includes(user.username);

            return (
              <div className="explore-user" key={user.username}>
                <div className="small-avatar">{user.avatar}</div>

                <div className="explore-user-info">
                  <strong>{user.name}</strong>

                  <span>@{user.username}</span>
                </div>

                <button
                  onClick={() => handleFollow(user.username)}
                  className={isFollowed ? "following-button" : "follow-button"}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </section>

        <section className="explore-section">
          <div className="explore-section-header">
            <div>
              <h3>Latest posts</h3>

              {selectedTopic && (
                <button
                  className="clear-topic"
                  onClick={() => setSelectedTopic("")}
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {explorePosts.length === 0 ? (
            <div className="empty-profile">
              <h3>No posts found</h3>

              <p>Try another search or trending topic.</p>
            </div>
          ) : (
            explorePosts.map((post) => (
              <article className="post" key={post.id}>
                <div className="avatar">{post.avatar}</div>

                <div className="post-content">
                  <div className="post-header">
                    <strong>{post.authorName}</strong>

                    <span>@{post.username}</span>

                    <span>·</span>

                    <span>{post.time}</span>
                  </div>

                  {post.text && <p className="post-text">{post.text}</p>}

                  <PostImage image={post.image} />

                  <div className="post-actions">
                    <button
                      onClick={() =>
                        setActivePost(activePost === post.id ? null : post.id)
                      }
                      aria-label="Comments"
                    >
                      <Icon name="comment" size={18} />
                      <span>{(comments[post.id] || []).length}</span>
                    </button>

                    <button
                      onClick={() => handleRepost(post.id)}
                      aria-label="Repost"
                    >
                      <Icon name="repost" size={18} />
                      <span>{post.repostCount}</span>
                    </button>

                    <button
                      onClick={() => handleLike(post.id)}
                      aria-label="Like"
                    >
                      <Icon name="heart" size={18} />
                      <span>{post.likeCount}</span>
                    </button>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className="bookmark-button"
                      style={{
                        color: post.bookmarked ? "#1d9bf0" : "inherit",
                        transform: post.bookmarked ? "scale(1.08)" : "scale(1)",
                      }}
                      aria-label={
                        post.bookmarked ? "Remove bookmark" : "Bookmark"
                      }
                      aria-pressed={post.bookmarked}
                    >
                      <Icon name="bookmark" size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    );
  };

  /* =========================
MESSAGES PAGE
========================= */

  const renderMessagesPage = () => {
    const filteredUsers = messageUsers.filter((user) => {
      const search = messageSearch.toLowerCase().trim();

      if (!search) return true;

      return (
        user.name.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search)
      );
    });

    const activeUser = messageUsers.find(
      (user) => user.username === selectedChat,
    );

    return (
      <div className="messages-page">
        <div className="messages-header">
          <div>
            <h2>Messages</h2>

            <p>Chat with people you know</p>
          </div>
        </div>

        <div className="messages-layout">
          <div className="conversation-panel">
            <div className="message-search">
              <Icon name="search" size={18} />
              <input
                type="text"
                placeholder="Search messages"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
              />
            </div>

            <div className="conversation-list">
              {filteredUsers.map((user) => {
                const unread = getUnreadMessages(user.username);

                return (
                  <button
                    className={`conversation ${
                      selectedChat === user.username ? "active" : ""
                    }`}
                    key={user.username}
                    onClick={() => openChat(user.username)}
                  >
                    <div className="small-avatar">{user.avatar}</div>

                    <div className="conversation-info">
                      <strong>{user.name}</strong>

                      <span>{getLastMessage(user.username)}</span>
                    </div>

                    {unread > 0 && (
                      <span className="message-unread-badge">{unread}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="chat-panel">
            {!activeUser ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">
                  <Icon name="messages" size={34} />
                </div>

                <h3>Select a conversation</h3>

                <p>Choose someone from the list to start messaging.</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div className="small-avatar">{activeUser.avatar}</div>

                  <div>
                    <strong>{activeUser.name}</strong>

                    <span>@{activeUser.username}</span>
                  </div>
                </div>

                <div className="chat-messages">
                  {getChatMessages(activeUser.username).length === 0 ? (
                    <div className="empty-chat">
                      <div className="small-avatar">{activeUser.avatar}</div>

                      <h3>Say hello to {activeUser.name}</h3>

                      <p>Start a new conversation.</p>
                    </div>
                  ) : (
                    getChatMessages(activeUser.username).map((message) => {
                      const own = message.sender === currentUser.username;

                      return (
                        <div
                          className={`chat-message ${own ? "own" : "received"}`}
                          key={message.id}
                        >
                          <div className="message-bubble">{message.text}</div>

                          <span>{message.time}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="message-compose">
                  <input
                    type="text"
                    placeholder={`Message @${activeUser.username}`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />

                  <button onClick={sendMessage} disabled={!messageText.trim()}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
BOOKMARKS PAGE
========================= */

  const BookmarksPage = () => {
    return (
      <div className="bookmarks-page">
        <div className="feed-header">
          <div>
            <h2>Bookmarks</h2>

            <p>Posts you've saved for later</p>
          </div>
        </div>

        {bookmarkedPosts.length === 0 ? (
          <div className="empty-bookmarks">
            <div className="empty-bookmarks-icon">
              <Icon name="bookmark" size={30} />
            </div>

            <h3>Save posts for later</h3>

            <p>Bookmark posts to easily find them again.</p>

            <button onClick={() => setActivePage("home")}>Browse posts</button>
          </div>
        ) : (
          bookmarkedPosts.map((post) => (
            <article className="post" key={post.id}>
              <div className="avatar">{post.avatar}</div>

              <div className="post-content">
                <div className="post-header">
                  <strong>{post.authorName}</strong>

                  <span>@{post.username}</span>

                  <span>·</span>

                  <span>{post.time}</span>
                </div>

                {post.text && <p className="post-text">{post.text}</p>}

                <PostImage image={post.image} />

                <div className="post-actions">
                  <button
                    onClick={() =>
                      setActivePost(activePost === post.id ? null : post.id)
                    }
                    aria-label="Comments"
                  >
                    <Icon name="comment" size={18} />
                    <span>{(comments[post.id] || []).length}</span>
                  </button>

                  <button
                    onClick={() => handleRepost(post.id)}
                    aria-label="Repost"
                  >
                    <Icon name="repost" size={18} />
                    <span>{post.repostCount}</span>
                  </button>

                  <button onClick={() => handleLike(post.id)} aria-label="Like">
                    <Icon name="heart" size={18} />
                    <span>{post.likeCount}</span>
                  </button>

                  <button
                    onClick={() => handleBookmark(post.id)}
                    className="bookmark-button"
                    style={{
                      color: post.bookmarked ? "#1d9bf0" : "inherit",
                      transform: post.bookmarked ? "scale(1.08)" : "scale(1)",
                    }}
                    aria-label={
                      post.bookmarked ? "Remove bookmark" : "Bookmark"
                    }
                    aria-pressed={post.bookmarked}
                  >
                    <Icon name="bookmark" size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    );
  };

  /* =========================
PROFILE PAGE
========================= */

  const renderProfilePage = () => {
    return (
      <div className="profile-page">
        <div className="profile-cover"></div>

        <div className="profile-info">
          <button
            className="edit-profile-button"
            onClick={handleOpenEditProfile}
          >
            Edit profile
          </button>

          <div className="profile-avatar">
            {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
          </div>

          <h2>{currentUser.name}</h2>

          <p className="profile-username">@{currentUser.username}</p>

          <p className="profile-bio">
            {currentUser.bio || "Welcome to my profile! 🚀"}
          </p>

          <div className="profile-stats">
            <div>
              <strong>{followedUsers.length}</strong>

              <span>Following</span>
            </div>

            <div>
              <strong>0</strong>

              <span>Followers</span>
            </div>
          </div>
        </div>

        {isEditingProfile && (
          <div className="edit-profile-overlay">
            <div className="edit-profile-card">
              <div className="edit-profile-header">
                <h2>Edit profile</h2>

                <button
                  className="close-edit-profile"
                  onClick={() => setIsEditingProfile(false)}
                >
                  ×
                </button>
              </div>

              {profileError && (
                <div className="profile-error">{profileError}</div>
              )}

              <div className="edit-profile-form">
                <label>
                  Name
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={50}
                  />
                </label>

                <label>
                  Username
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    maxLength={30}
                  />
                </label>

                <label>
                  Bio
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={160}
                    rows={4}
                  />
                </label>

                <label>
                  Avatar initial
                  <input
                    value={editAvatar}
                    onChange={(e) =>
                      setEditAvatar(e.target.value.charAt(0).toUpperCase())
                    }
                    maxLength={1}
                  />
                </label>
              </div>

              <div className="edit-profile-actions">
                <button
                  className="cancel-profile-button"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </button>

                <button
                  className="save-profile-button"
                  onClick={handleSaveProfile}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="profile-tabs">
          <button
            className={`profile-tab ${profileTab === "posts" ? "active" : ""}`}
            onClick={() => setProfileTab("posts")}
          >
            Posts
          </button>

          <button
            className={`profile-tab ${
              profileTab === "replies" ? "active" : ""
            }`}
            onClick={() => setProfileTab("replies")}
          >
            Replies
          </button>

          <button
            className={`profile-tab ${profileTab === "likes" ? "active" : ""}`}
            onClick={() => setProfileTab("likes")}
          >
            Likes
          </button>
        </div>

        <div className="profile-posts">
          {profileTab === "posts" && (
            <>
              {myPosts.length === 0 ? (
                <div className="empty-profile">
                  <h3>You haven't posted yet</h3>

                  <p>When you post something, it will appear here.</p>

                  <button
                    onClick={() => {
                      setActivePage("home");

                      setTimeout(() => {
                        document.querySelector(".compose-input")?.focus();
                      }, 100);
                    }}
                  >
                    Create your first post
                  </button>
                </div>
              ) : (
                myPosts.map((post) => (
                  <article className="post" key={post.id}>
                    <div className="avatar">{post.avatar}</div>

                    <div className="post-content">
                      <div className="post-header">
                        <strong>{post.authorName}</strong>

                        <span>@{post.username}</span>

                        <span>·</span>

                        <span>{post.time}</span>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="delete-post-button"
                          aria-label="Delete post"
                        >
                          <Icon name="trash" size={17} />
                        </button>
                      </div>

                      {post.text && <p className="post-text">{post.text}</p>}

                      <PostImage image={post.image} />

                      <div className="post-actions">
                        <button
                          onClick={() =>
                            setActivePost(
                              activePost === post.id ? null : post.id,
                            )
                          }
                          aria-label="Comments"
                        >
                          <Icon name="comment" size={18} />
                          <span>{(comments[post.id] || []).length}</span>
                        </button>

                        <button
                          onClick={() => handleRepost(post.id)}
                          aria-label="Repost"
                        >
                          <Icon name="repost" size={18} />
                          <span>{post.repostCount}</span>
                        </button>

                        <button
                          onClick={() => handleLike(post.id)}
                          aria-label="Like"
                        >
                          <Icon name="heart" size={18} />
                          <span>{post.likeCount}</span>
                        </button>

                        <button
                          onClick={() => handleBookmark(post.id)}
                          className="bookmark-button"
                          style={{
                            color: post.bookmarked ? "#1d9bf0" : "inherit",
                            transform: post.bookmarked
                              ? "scale(1.08)"
                              : "scale(1)",
                          }}
                          aria-label={
                            post.bookmarked ? "Remove bookmark" : "Bookmark"
                          }
                          aria-pressed={post.bookmarked}
                        >
                          <Icon name="bookmark" size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </>
          )}

          {profileTab === "replies" && (
            <div className="empty-profile">
              <h3>No replies yet</h3>

              <p>Replies you make will appear here.</p>
            </div>
          )}

          {profileTab === "likes" && (
            <>
              {myLikedPosts.length === 0 ? (
                <div className="empty-profile">
                  <h3>No liked posts yet</h3>

                  <p>Posts you like will appear here.</p>
                </div>
              ) : (
                myLikedPosts.map((post) => (
                  <article className="post" key={post.id}>
                    <div className="avatar">{post.avatar}</div>

                    <div className="post-content">
                      <div className="post-header">
                        <strong>{post.authorName}</strong>

                        <span>@{post.username}</span>

                        <span>·</span>

                        <span>{post.time}</span>
                      </div>

                      {post.text && <p className="post-text">{post.text}</p>}

                      <PostImage image={post.image} />

                      <div className="post-actions">
                        <button aria-label="Comments">
                          <Icon name="comment" size={18} />
                          <span>{(comments[post.id] || []).length}</span>
                        </button>

                        <button aria-label="Repost">
                          <Icon name="repost" size={18} />
                          <span>{post.repostCount}</span>
                        </button>

                        <button
                          onClick={() => handleLike(post.id)}
                          aria-label="Like"
                        >
                          <Icon name="heart" size={18} />
                          <span>{post.likeCount}</span>
                        </button>

                        <button
                          onClick={() => handleBookmark(post.id)}
                          className="bookmark-button"
                          style={{
                            color: post.bookmarked ? "#1d9bf0" : "inherit",
                            transform: post.bookmarked
                              ? "scale(1.08)"
                              : "scale(1)",
                          }}
                          aria-label={
                            post.bookmarked ? "Remove bookmark" : "Bookmark"
                          }
                          aria-pressed={post.bookmarked}
                        >
                          <Icon name="bookmark" size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  /* =========================
SETTINGS PAGE
========================= */

  const SettingsPage = () => {
    return (
      <div className="settings-page">
        <div className="feed-header">
          <div>
            <h2>Settings</h2>

            <p>Manage your account and preferences</p>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <h3>Appearance</h3>

            <p>Customize how the app looks.</p>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Dark mode</strong>

              <span>
                {darkMode
                  ? "Dark appearance is enabled."
                  : "Use the light appearance."}
              </span>
            </div>

            <button
              className={`settings-toggle ${darkMode ? "enabled" : ""}`}
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <h3>Notifications</h3>

            <p>Control how you receive notifications.</p>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Activity notifications</strong>

              <span>
                {notificationsEnabled
                  ? "Notifications are enabled."
                  : "Notifications are turned off."}
              </span>
            </div>

            <button
              className={`settings-toggle ${
                notificationsEnabled ? "enabled" : ""
              }`}
              onClick={() => setNotificationsEnabled((prev) => !prev)}
              aria-label="Toggle notifications"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <h3>Privacy</h3>

            <p>Manage who can interact with your account.</p>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Private account</strong>

              <span>
                {privateAccount
                  ? "Your account is private."
                  : "Your account is public."}
              </span>
            </div>

            <button
              className={`settings-toggle ${privateAccount ? "enabled" : ""}`}
              onClick={() => setPrivateAccount((prev) => !prev)}
              aria-label="Toggle private account"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <h3>Account</h3>

            <p>Manage your account session.</p>
          </div>

          <button className="settings-sign-out" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  /* =========================
MAIN RETURN
========================= */

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <div className="layout">
        {/* SIDEBAR */}

        <aside className="sidebar">
          <div className="logo">𝕏</div>

          <nav>
            <div
              className={`nav-item ${activePage === "home" ? "active" : ""}`}
              onClick={() => setActivePage("home")}
            >
              <span>
                <Icon name="home" />
              </span>

              <strong>Home</strong>
            </div>

            <div
              className={`nav-item ${activePage === "explore" ? "active" : ""}`}
              onClick={() => setActivePage("explore")}
            >
              <span>
                <Icon name="search" />
              </span>

              <strong>Explore</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "notifications" ? "active" : ""
              }`}
              onClick={() => setActivePage("notifications")}
            >
              <span className="notification-nav-icon">
                <Icon name="notifications" />
                {notifications.some((notification) => !notification.read) && (
                  <span className="notification-badge">
                    {
                      notifications.filter((notification) => !notification.read)
                        .length
                    }
                  </span>
                )}
              </span>

              <strong>Notifications</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "messages" ? "active" : ""
              }`}
              onClick={() => setActivePage("messages")}
            >
              <span className="notification-nav-icon">
                <Icon name="messages" />
                {totalUnreadMessages > 0 && (
                  <span className="notification-badge">
                    {totalUnreadMessages}
                  </span>
                )}
              </span>

              <strong>Messages</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "bookmarks" ? "active" : ""
              }`}
              onClick={() => setActivePage("bookmarks")}
            >
              <span>
                <Icon name="bookmark" />
              </span>

              <strong>Bookmarks</strong>
            </div>

            <div
              className={`nav-item ${activePage === "profile" ? "active" : ""}`}
              onClick={() => setActivePage("profile")}
            >
              <span>
                <Icon name="profile" />
              </span>

              <strong>Profile</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "settings" ? "active" : ""
              }`}
              onClick={() => setActivePage("settings")}
            >
              <span>
                <Icon name="settings" />
              </span>

              <strong>Settings</strong>
            </div>
          </nav>

          <button
            className="post-button"
            onClick={() => {
              setActivePage("home");

              setTimeout(() => {
                document.querySelector(".compose-input")?.focus();
              }, 100);
            }}
          >
            Post
          </button>

          <div className="current-user-card">
            <div className="avatar">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>

            <div className="current-user-info">
              <strong>{currentUser.name}</strong>

              <span>@{currentUser.username}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="user-menu-button"
            >
              ⋯
            </button>
          </div>

          <button onClick={handleLogout} className="sign-out-button">
            Sign Out
          </button>
        </aside>

        {/* CENTER */}

        <main className="feed">
          {activePage === "profile" && renderProfilePage()}

          {activePage === "notifications" && <NotificationsPage />}

          {activePage === "explore" && <ExplorePage />}

          {activePage === "messages" && renderMessagesPage()}

          {activePage === "bookmarks" && <BookmarksPage />}

          {activePage === "settings" && <SettingsPage />}

          {activePage === "home" && (
            <HomePage
              currentUser={currentUser}
              postText={postText}
              setPostText={setPostText}
              postImage={postImage}
              removePostImage={removePostImage}
              imageInputRef={imageInputRef}
              handleImageSelect={handleImageSelect}
              handlePost={handlePost}
              searchText={searchText}
              setSearchText={setSearchText}
              filteredPosts={filteredPosts}
              comments={comments}
              activePost={activePost}
              setActivePost={setActivePost}
              handleDeletePost={handleDeletePost}
              handleRepost={handleRepost}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
              commentText={commentText}
              setCommentText={setCommentText}
              handleComment={handleComment}
            />
          )}
        </main>

        {/* RIGHT SIDEBAR */}

        <aside className="right-sidebar">
          <div className="sidebar-card">
            <h3>Search</h3>

            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="sidebar-card">
            <h3>What's happening</h3>

            {trends.slice(0, 4).map((trend) => (
              <div
                className="trend"
                key={trend.title}
                onClick={() => {
                  setActivePage("explore");

                  setSelectedTopic(trend.title);
                }}
              >
                <span>{trend.category}</span>

                <strong>{trend.title}</strong>

                <small>{trend.posts}</small>
              </div>
            ))}
          </div>

          <div className="sidebar-card">
            <h3>Who to follow</h3>

            {suggestedUsers.map((user) => {
              const isFollowed = followedUsers.includes(user.username);

              return (
                <div className="follow-user" key={user.username}>
                  <div className="small-avatar">{user.avatar}</div>

                  <div className="follow-info">
                    <strong>{user.name}</strong>

                    <span>@{user.username}</span>
                  </div>

                  <button onClick={() => handleFollow(user.username)}>
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* MOBILE NAV */}

      <div className="mobile-nav">
        <span
          className={activePage === "home" ? "mobile-active" : ""}
          onClick={() => setActivePage("home")}
        >
          <Icon name="home" size={21} />
        </span>

        <span
          className={activePage === "explore" ? "mobile-active" : ""}
          onClick={() => setActivePage("explore")}
        >
          <Icon name="search" size={21} />
        </span>

        <span
          onClick={() => {
            setActivePage("home");

            setTimeout(() => {
              document.querySelector(".compose-input")?.focus();
            }, 100);
          }}
        >
          <Icon name="plus" size={22} />
        </span>

        <span
          className={activePage === "notifications" ? "mobile-active" : ""}
          onClick={() => setActivePage("notifications")}
        >
          <Icon name="notifications" size={21} />
        </span>

        <span
          className={activePage === "profile" ? "mobile-active" : ""}
          onClick={() => setActivePage("profile")}
        >
          <Icon name="profile" size={21} />
        </span>
      </div>
    </div>
  );
}
export default App;
