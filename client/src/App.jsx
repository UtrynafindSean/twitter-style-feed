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

    const user = JSON.parse(saved);

    if (!user || typeof user !== "object") {
      return null;
    }

    if (!user.id || !user.email || !user.username) {
      return null;
    }

    return user;
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

/* =========================
   AUTH SCREEN
========================= */

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

    /* =========================
       SIGN UP
    ========================= */

    if (mode === "signup") {
      if (!name.trim() || !username.trim() || !email.trim() || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const cleanName = name.trim();

      const cleanUsername = username.trim().replace(/\s+/g, "").toLowerCase();

      const cleanEmail = email.trim().toLowerCase();

      const emailExists = users.some(
        (user) => user.email?.toLowerCase() === cleanEmail,
      );

      if (emailExists) {
        setError("An account with this email already exists.");
        return;
      }

      const usernameExists = users.some(
        (user) => user.username?.toLowerCase() === cleanUsername,
      );

      if (usernameExists) {
        setError("That username is already taken.");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password,
        avatar: cleanName.charAt(0).toUpperCase(),
        bio: "",
      };

      const updatedUsers = [...users, newUser];

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      /*
        Save the logged-in user immediately.
        This makes the session survive page refreshes.
      */
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      onLogin(newUser);

      return;
    }

    /* =========================
       SIGN IN
    ========================= */

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) =>
        item.email?.toLowerCase() === cleanEmail && item.password === password,
    );

    if (!user) {
      setError("Incorrect email or password.");
      return;
    }

    /*
      Save the authenticated user.
      App also saves it through handleLogin.
    */
    localStorage.setItem("currentUser", JSON.stringify(user));

    onLogin(user);
  };

  const switchMode = () => {
    setMode((currentMode) => (currentMode === "signin" ? "signup" : "signin"));

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

          <button type="submit" className="auth-submit">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button type="button" onClick={switchMode}>
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

  const [notifications, setNotifications] = useState(() =>
    getStoredData("notifications", []),
  );

  const [activePage, setActivePage] = useState("home");
  const [profileTab, setProfileTab] = useState("posts");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [profileError, setProfileError] = useState("");

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

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = (user) => {
    /*
      Always save the current session here.
      This means both Sign In and Sign Up
      behave consistently.
    */
    localStorage.setItem("currentUser", JSON.stringify(user));

    setCurrentUser(user);

    setActivePage("home");

    setIsEditingProfile(false);

    setProfileError("");
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    /*
      Only remove the current session.
      Do NOT delete users, posts, comments,
      notifications, or followed users.
    */
    localStorage.removeItem("currentUser");

    setCurrentUser(null);

    setActivePage("home");

    setIsEditingProfile(false);

    setProfileError("");
  };

  /* =========================
     NOTIFICATIONS
  ========================= */

  const addNotification = (message, type = "activity") => {
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
     EDIT PROFILE
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

    const newUsername = editUsername.trim().replace(/\s+/g, "").toLowerCase();

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

    const updatedPosts = posts.map((post) =>
      post.username === oldUsername
        ? {
            ...post,
            authorName: newName,
            username: newUsername,
            avatar: newAvatar,
          }
        : post,
    );

    setPosts(updatedPosts);

    setCurrentUser(updatedUser);

    setIsEditingProfile(false);

    setProfileError("");
  };

  /* =========================
     POST
  ========================= */

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
  };

  /* =========================
     DELETE
  ========================= */

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

  /* =========================
     LIKE
  ========================= */

  const handleLike = (postId) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const wasLiked = Boolean(targetPost.liked);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          liked: !wasLiked,
          likeCount: wasLiked
            ? Math.max((post.likeCount || 0) - 1, 0)
            : (post.likeCount || 0) + 1,
        };
      }),
    );

    /*
      Exactly ONE notification when liking.
      Unliking does not create a notification.
    */
    if (!wasLiked) {
      addNotification(`You liked a post by @${targetPost.username}.`, "like");
    }
  };

  /* =========================
     REPOST
  ========================= */

  const handleRepost = (postId) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    const wasReposted = Boolean(targetPost.reposted);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          reposted: !wasReposted,
          repostCount: wasReposted
            ? Math.max(0, post.repostCount - 1)
            : post.repostCount + 1,
        };
      }),
    );

    if (!wasReposted && targetPost.username !== currentUser.username) {
      addNotification(
        `${currentUser.name} reposted ${targetPost.authorName}'s post.`,
        "repost",
      );
    }
  };

  /* =========================
     BOOKMARK
  ========================= */

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

  /* =========================
     FOLLOW
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

  const handleFollow = (username) => {
    const isAlreadyFollowing = followedUsers.includes(username);

    if (isAlreadyFollowing) {
      setFollowedUsers((prev) => prev.filter((item) => item !== username));

      return;
    }

    const followedUser = suggestedUsers.find(
      (user) => user.username === username,
    );

    setFollowedUsers((prev) => [...prev, username]);

    if (followedUser) {
      addNotification(`You are now following ${followedUser.name}.`, "follow");
    }
  };

  /* =========================
     COMMENT
  ========================= */

  const handleComment = (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      return;
    }

    const post = posts.find((item) => item.id === postId);

    const newComment = {
      id: Date.now().toString(),
      text,
      authorName: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar || currentUser.name.charAt(0).toUpperCase(),
    };

    if (post && post.username !== currentUser.username) {
      addNotification(
        `${currentUser.name} replied to ${post.authorName}'s post.`,
        "comment",
      );
    }

    setComments((prevComments) => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), newComment],
    }));

    setCommentText((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  /* =========================
     SEARCH
  ========================= */

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

  /* =========================
     NOTIFICATIONS PAGE
  ========================= */

  const NotificationsPage = () => {
    const unreadCount = notifications.filter(
      (notification) => !notification.read,
    ).length;

    const markAllNotificationsRead = () => {
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
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up"}
            </p>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              className="mark-read-button"
              onClick={markAllNotificationsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-notifications-icon">🔔</div>

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
                  {notification.type === "like" && "❤️"}
                  {notification.type === "repost" && "🔁"}
                  {notification.type === "comment" && "💬"}
                  {notification.type === "follow" && "👤"}
                  {notification.type === "activity" && "🔔"}
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
     PROFILE PAGE
  ========================= */

  const ProfilePage = () => {
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

        {/* EDIT PROFILE POPUP */}

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
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                  />
                </label>

                <label>
                  Username
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="username"
                    maxLength={30}
                  />
                </label>

                <label>
                  Bio
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell people about yourself"
                    maxLength={160}
                    rows={4}
                  />
                </label>

                <label>
                  Avatar initial
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) =>
                      setEditAvatar(e.target.value.charAt(0).toUpperCase())
                    }
                    maxLength={1}
                    placeholder="A"
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

        {/* PROFILE TABS */}

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

        {/* PROFILE POSTS */}

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
                myPosts.map((post) => {
                  const postComments = comments[post.id] || [];

                  return (
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
                        </div>

                        <p className="post-text">{post.text}</p>

                        <div className="post-actions">
                          <button
                            onClick={() =>
                              setActivePost(
                                activePost === post.id ? null : post.id,
                              )
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
                                {currentUser.avatar ||
                                  currentUser.name.charAt(0)}
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
                                <div className="small-avatar">
                                  {comment.avatar}
                                </div>

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
                })
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

                      <p className="post-text">{post.text}</p>

                      <div className="post-actions">
                        <button>💬 {(comments[post.id] || []).length}</button>

                        <button>🔁 {post.repostCount}</button>

                        <button
                          onClick={() => handleLike(post.id)}
                          style={{
                            color: "#f91880",
                          }}
                        >
                          ❤️ {post.likeCount}
                        </button>

                        <button onClick={() => handleBookmark(post.id)}>
                          {post.bookmarked ? "🔖" : "📑"}
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
     MAIN RETURN
  ========================= */

  return (
    <div className="app">
      <div className="layout">
        {/* LEFT SIDEBAR */}

        <aside className="sidebar">
          <div className="logo">𝕏</div>

          <nav>
            <div
              className={`nav-item ${activePage === "home" ? "active" : ""}`}
              onClick={() => setActivePage("home")}
            >
              <span>⌂</span>
              <strong>Home</strong>
            </div>

            <div className="nav-item">
              <span>🔍</span>
              <strong>Explore</strong>
            </div>

            <div
              className={`nav-item ${
                activePage === "notifications" ? "active" : ""
              }`}
              onClick={() => setActivePage("notifications")}
            >
              <span className="notification-nav-icon">
                🔔
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

            <div className="nav-item">
              <span>✉️</span>
              <strong>Messages</strong>
            </div>

            <div className="nav-item">
              <span>🔖</span>
              <strong>Bookmarks</strong>
            </div>

            <div
              className={`nav-item ${activePage === "profile" ? "active" : ""}`}
              onClick={() => setActivePage("profile")}
            >
              <span>👤</span>
              <strong>Profile</strong>
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

        {/* CENTER */}

        <main className="feed">
          {activePage === "profile" ? (
            <ProfilePage />
          ) : activePage === "notifications" ? (
            <NotificationsPage />
          ) : (
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

              {/* SEARCH */}

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

              {/* POSTS */}

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
                              setActivePost(
                                activePost === post.id ? null : post.id,
                              )
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

                        {/* COMMENTS */}

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
                                {currentUser.avatar ||
                                  currentUser.name.charAt(0)}
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
                                <div className="small-avatar">
                                  {comment.avatar}
                                </div>

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
                })
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
            <h3>What’s happening</h3>

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
        <span onClick={() => setActivePage("home")}>⌂</span>

        <span>🔍</span>

        <span
          onClick={() => {
            setActivePage("home");

            setTimeout(() => {
              document.querySelector(".compose-input")?.focus();
            }, 100);
          }}
        >
          ＋
        </span>

        <span onClick={() => setActivePage("notifications")}>🔔</span>

        <span onClick={() => setActivePage("profile")}>👤</span>
      </div>
    </div>
  );
}

export default App;
