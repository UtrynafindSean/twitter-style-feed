import { useEffect, useState } from "react";

const DEFAULT_POSTS = [
  {
    id: "sample-1",
    authorName: "John Smith",
    username: "johnsmith",
    avatar: "J",
    text: "Just finished working on an exciting new project! 🚀",
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

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function getStoredUser() {
  try {
    const saved = localStorage.getItem("currentUser");

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function normalizePosts(posts) {
  if (!Array.isArray(posts)) {
    return DEFAULT_POSTS;
  }

  return posts.map((post) => ({
    ...post,
    authorName: post.authorName || "User",
    username: post.username || "user",
    avatar: post.avatar || "U",
    text: post.text || "",
    time: post.time || "now",
    likeCount: Number(post.likeCount) || 0,
    liked: Boolean(post.liked),
    repostCount: Number(post.repostCount) || 0,
    reposted: Boolean(post.reposted),
    bookmarked: Boolean(post.bookmarked),
  }));
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("signin");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const users = getStoredData("users", []);

    if (mode === "signup") {
      if (!name.trim() || !username.trim() || !email.trim() || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const emailExists = users.some(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (emailExists) {
        setError("An account with this email already exists.");
        return;
      }

      const cleanUsername = username.trim().replace(/\s+/g, "");

      const usernameExists = users.some(
        (user) => user.username.toLowerCase() === cleanUsername.toLowerCase(),
      );

      if (usernameExists) {
        setError("That username is already taken.");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        password,
        avatar: name.trim().charAt(0).toUpperCase(),
      };

      const updatedUsers = [...users, newUser];

      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      onLogin(newUser);

      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );

    if (!user) {
      setError("Incorrect email or password.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    onLogin(user);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            𝕏
          </div>

          <h1 style={{ margin: 0 }}>
            {mode === "signin" ? "Sign in to X" : "Create your account"}
          </h1>

          <p style={{ color: "#536471" }}>
            {mode === "signin"
              ? "Welcome back!"
              : "Join the conversation today."}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#ffe8e8",
              color: "#d93025",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "25px",
              border: "none",
              background: "#000",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#536471",
          }}
        >
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            style={{
              border: "none",
              background: "none",
              color: "#1d9bf0",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginBottom: "12px",
  border: "1px solid #cfd9de",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
};

function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  const [posts, setPosts] = useState(() =>
    normalizePosts(getStoredData("posts", DEFAULT_POSTS)),
  );

  const [postText, setPostText] = useState("");
  const [searchText, setSearchText] = useState("");

  const [comments, setComments] = useState(() => getStoredData("comments", {}));

  const [commentText, setCommentText] = useState({});
  const [activePost, setActivePost] = useState(null);

  const [followedUsers, setFollowedUsers] = useState(() =>
    getStoredData("followedUsers", []),
  );

  const [activePage, setActivePage] = useState("home");

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("followedUsers", JSON.stringify(followedUsers));
  }, [followedUsers]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActivePage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setActivePost(null);
  };

  const handlePost = () => {
    if (!postText.trim()) {
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      authorName: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar || currentUser.name.charAt(0).toUpperCase(),
      text: postText.trim(),
      time: "now",
      likeCount: 0,
      liked: false,
      repostCount: 0,
      reposted: false,
      bookmarked: false,
      isUserPost: true,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setPostText("");
    setActivePage("home");
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => {
        if (post.id !== postId) {
          return true;
        }

        return post.username !== currentUser.username;
      }),
    );

    setComments((prevComments) => {
      const updated = { ...prevComments };
      delete updated[postId];
      return updated;
    });
  };

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          liked: !post.liked,
          likeCount: post.liked
            ? Math.max(0, post.likeCount - 1)
            : post.likeCount + 1,
        };
      }),
    );
  };

  const handleRepost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          reposted: !post.reposted,
          repostCount: post.reposted
            ? Math.max(0, post.repostCount - 1)
            : post.repostCount + 1,
        };
      }),
    );
  };

  const handleBookmark = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              bookmarked: !post.bookmarked,
            }
          : post,
      ),
    );
  };

  const handleFollow = (username) => {
    setFollowedUsers((prev) => {
      if (prev.includes(username)) {
        return prev.filter((item) => item !== username);
      }

      return [...prev, username];
    });
  };

  const handleComment = (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      return;
    }

    const newComment = {
      id: Date.now().toString(),
      text,
      authorName: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar || currentUser.name.charAt(0).toUpperCase(),
    };

    setComments((prevComments) => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), newComment],
    }));

    setCommentText((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const filteredPosts = posts.filter((post) => {
    const search = searchText.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      post.text.toLowerCase().includes(search) ||
      post.authorName.toLowerCase().includes(search) ||
      post.username.toLowerCase().includes(search)
    );
  });

  const ownPosts = posts.filter(
    (post) => post.username === currentUser.username,
  );

  const bookmarkedPosts = posts.filter((post) => post.bookmarked);

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

  const renderPost = (post) => {
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
                style={{
                  marginLeft: "auto",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#f4212e",
                }}
                title="Delete post"
              >
                🗑️
              </button>
            )}
          </div>

          <p className="post-text">{post.text}</p>

          <div className="post-actions">
            <button
              onClick={() =>
                setActivePost(activePost === post.id ? null : post.id)
              }
            >
              💬 {postComments.length}
            </button>

            <button
              onClick={() => handleRepost(post.id)}
              style={{
                color: post.reposted ? "#00ba7c" : "inherit",
              }}
            >
              🔁 {post.repostCount}
            </button>

            <button
              onClick={() => handleLike(post.id)}
              style={{
                color: post.liked ? "#f91880" : "inherit",
              }}
            >
              {post.liked ? "❤️" : "♡"} {post.likeCount}
            </button>

            <button
              onClick={() => handleBookmark(post.id)}
              style={{
                color: post.bookmarked ? "#1d9bf0" : "inherit",
              }}
            >
              {post.bookmarked ? "🔖" : "📑"}
            </button>

            <button>↗️</button>
          </div>

          {activePost === post.id && (
            <div
              style={{
                marginTop: "15px",
                borderTop: "1px solid #eff3f4",
                paddingTop: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
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
                  style={{
                    flex: 1,
                    border: "1px solid #cfd9de",
                    borderRadius: "20px",
                    padding: "10px 15px",
                    outline: "none",
                  }}
                />

                <button
                  onClick={() => handleComment(post.id)}
                  style={{
                    border: "none",
                    borderRadius: "20px",
                    background: "#000",
                    color: "#fff",
                    padding: "8px 15px",
                    cursor: "pointer",
                  }}
                >
                  Reply
                </button>
              </div>

              {postComments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div className="small-avatar">{comment.avatar}</div>

                  <div>
                    <strong>{comment.authorName}</strong>{" "}
                    <span
                      style={{
                        color: "#536471",
                      }}
                    >
                      @{comment.username}
                    </span>
                    <p
                      style={{
                        margin: "5px 0 0",
                      }}
                    >
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="layout">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">𝕏</div>

          <nav>
            <div
              className={`nav-item ${activePage === "home" ? "active" : ""}`}
              onClick={() => handleNavigation("home")}
              style={{ cursor: "pointer" }}
            >
              <span>⌂</span>
              <strong>Home</strong>
            </div>

            <div
              className={`nav-item ${activePage === "explore" ? "active" : ""}`}
              onClick={() => handleNavigation("explore")}
              style={{ cursor: "pointer" }}
            >
              <span>🔍</span>
              <strong>Explore</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "notifications" ? "active" : ""
              }`}
              onClick={() => handleNavigation("notifications")}
              style={{ cursor: "pointer" }}
            >
              <span>🔔</span>
              <strong>Notifications</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "messages" ? "active" : ""
              }`}
              onClick={() => handleNavigation("messages")}
              style={{ cursor: "pointer" }}
            >
              <span>✉️</span>
              <strong>Messages</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "bookmarks" ? "active" : ""
              }`}
              onClick={() => handleNavigation("bookmarks")}
              style={{ cursor: "pointer" }}
            >
              <span>🔖</span>
              <strong>Bookmarks</strong>
            </div>

            <div
              className={`nav-item ${activePage === "profile" ? "active" : ""}`}
              onClick={() => handleNavigation("profile")}
              style={{ cursor: "pointer" }}
            >
              <span>👤</span>
              <strong>Profile</strong>
            </div>
          </nav>

          <button
            className="post-button"
            onClick={() => {
              handleNavigation("home");

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
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ⋯
            </button>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #cfd9de",
              borderRadius: "20px",
              background: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            Sign Out
          </button>
        </aside>

        {/* MAIN FEED */}
        <main className="feed">
          {/* HOME */}
          {activePage === "home" && (
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

                  <div className="compose-bottom">
                    <div className="compose-icons">
                      <span>🖼️</span>
                      <span>GIF</span>
                      <span>😊</span>
                      <span>📍</span>
                    </div>

                    <button
                      onClick={handlePost}
                      disabled={!postText.trim()}
                      className="small-post-button"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 18px",
                    borderRadius: "25px",
                    border: "1px solid #cfd9de",
                    outline: "none",
                    fontSize: "15px",
                  }}
                />
              </div>

              {filteredPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#536471",
                  }}
                >
                  No posts found.
                </div>
              ) : (
                filteredPosts.map(renderPost)
              )}
            </>
          )}

          {/* EXPLORE */}
          {activePage === "explore" && (
            <>
              <header className="feed-header">
                <h2>Explore</h2>
              </header>

              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <input
                  type="text"
                  placeholder="Search X"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 18px",
                    borderRadius: "25px",
                    border: "1px solid #cfd9de",
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <h3>What's happening</h3>

                <div className="trend">
                  <span>Trending in Nigeria</span>
                  <strong>#TechNigeria</strong>
                  <small>12.5K posts</small>
                </div>

                <div className="trend">
                  <span>Trending</span>
                  <strong>React</strong>
                  <small>8,421 posts</small>
                </div>

                <div className="trend">
                  <span>Trending</span>
                  <strong>JavaScript</strong>
                  <small>6,892 posts</small>
                </div>

                <div className="trend">
                  <span>Trending</span>
                  <strong>#WebDevelopment</strong>
                  <small>4,321 posts</small>
                </div>
              </div>

              <div>
                {filteredPosts.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#536471",
                    }}
                  >
                    No posts found.
                  </div>
                ) : (
                  filteredPosts.map(renderPost)
                )}
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activePage === "notifications" && (
            <>
              <header className="feed-header">
                <h2>Notifications</h2>
              </header>

              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <div
                  style={{
                    padding: "18px 5px",
                    borderBottom: "1px solid #eff3f4",
                  }}
                >
                  ❤️ Someone liked your post.
                </div>

                <div
                  style={{
                    padding: "18px 5px",
                    borderBottom: "1px solid #eff3f4",
                  }}
                >
                  🔁 Someone reposted your post.
                </div>

                <div
                  style={{
                    padding: "18px 5px",
                    borderBottom: "1px solid #eff3f4",
                  }}
                >
                  👤 Someone followed you.
                </div>

                <div
                  style={{
                    padding: "18px 5px",
                  }}
                >
                  💬 Someone replied to your post.
                </div>
              </div>
            </>
          )}

          {/* MESSAGES */}
          {activePage === "messages" && (
            <>
              <header className="feed-header">
                <h2>Messages</h2>
              </header>

              <div
                style={{
                  padding: "20px",
                }}
              >
                <h3>Your messages</h3>

                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #eff3f4",
                    borderRadius: "15px",
                    marginTop: "15px",
                  }}
                >
                  <strong>John Smith</strong>

                  <p
                    style={{
                      color: "#536471",
                    }}
                  >
                    Hey! How is your project going?
                  </p>
                </div>

                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #eff3f4",
                    borderRadius: "15px",
                    marginTop: "15px",
                  }}
                >
                  <strong>Sarah Williams</strong>

                  <p
                    style={{
                      color: "#536471",
                    }}
                  >
                    Great work on the React project!
                  </p>
                </div>
              </div>
            </>
          )}

          {/* BOOKMARKS */}
          {activePage === "bookmarks" && (
            <>
              <header className="feed-header">
                <h2>Bookmarks</h2>
              </header>

              {bookmarkedPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 20px",
                    color: "#536471",
                  }}
                >
                  <h3>No bookmarks yet</h3>
                  <p>Posts you bookmark will appear here.</p>
                </div>
              ) : (
                bookmarkedPosts.map(renderPost)
              )}
            </>
          )}

          {/* PROFILE */}
          {activePage === "profile" && (
            <>
              <header className="feed-header">
                <h2>Profile</h2>
              </header>

              <div
                style={{
                  padding: "30px 20px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#000",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                  }}
                >
                  {currentUser.avatar || currentUser.name.charAt(0)}
                </div>

                <h2 style={{ margin: "5px 0" }}>{currentUser.name}</h2>

                <p
                  style={{
                    color: "#536471",
                    margin: "5px 0",
                  }}
                >
                  @{currentUser.username}
                </p>

                <p
                  style={{
                    color: "#536471",
                  }}
                >
                  {currentUser.email}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "25px",
                    marginTop: "20px",
                  }}
                >
                  <strong>{ownPosts.length} Posts</strong>

                  <strong>{followedUsers.length} Following</strong>
                </div>
              </div>

              <div
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #eff3f4",
                }}
              >
                <h3>Your Posts</h3>
              </div>

              {ownPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 20px",
                    color: "#536471",
                  }}
                >
                  You haven't posted anything yet.
                </div>
              ) : (
                ownPosts.map(renderPost)
              )}
            </>
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
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "20px",
                border: "1px solid #cfd9de",
              }}
            />
          </div>

          <div className="sidebar-card">
            <h3>What's happening</h3>

            <div className="trend">
              <span>Trending in Nigeria</span>
              <strong>#TechNigeria</strong>
              <small>12.5K posts</small>
            </div>

            <div className="trend">
              <span>Trending</span>
              <strong>React</strong>
              <small>8,421 posts</small>
            </div>

            <div className="trend">
              <span>Trending</span>
              <strong>JavaScript</strong>
              <small>6,892 posts</small>
            </div>

            <div className="trend">
              <span>Trending</span>
              <strong>#WebDevelopment</strong>
              <small>4,321 posts</small>
            </div>
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

                  <button
                    onClick={() => handleFollow(user.username)}
                    style={{
                      background: isFollowed ? "#fff" : "#000",
                      color: isFollowed ? "#000" : "#fff",
                      border: isFollowed ? "1px solid #cfd9de" : "none",
                      borderRadius: "20px",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
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
          onClick={() => handleNavigation("home")}
          style={{ cursor: "pointer" }}
        >
          ⌂
        </span>

        <span
          onClick={() => handleNavigation("explore")}
          style={{ cursor: "pointer" }}
        >
          🔍
        </span>

        <span
          onClick={() => handleNavigation("notifications")}
          style={{ cursor: "pointer" }}
        >
          🔔
        </span>

        <span
          onClick={() => handleNavigation("messages")}
          style={{ cursor: "pointer" }}
        >
          ✉️
        </span>

        <span
          onClick={() => handleNavigation("profile")}
          style={{ cursor: "pointer" }}
        >
          👤
        </span>
      </div>
    </div>
  );
}

export default App;
