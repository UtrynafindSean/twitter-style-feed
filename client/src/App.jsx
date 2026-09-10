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

function normalizePosts(posts) {
  if (!Array.isArray(posts)) return DEFAULT_POSTS;

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
   AUTH
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

      if (users.some((user) => user.email?.toLowerCase() === cleanEmail)) {
        setError("An account with this email already exists.");
        return;
      }

      if (
        users.some((user) => user.username?.toLowerCase() === cleanUsername)
      ) {
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

      localStorage.setItem("users", JSON.stringify([...users, newUser]));

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
        item.email?.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password,
    );

    if (!user) {
      setError("Incorrect email or password.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    onLogin(user);
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
     POSTS
  ========================= */

  const handlePost = () => {
    if (!postText.trim()) return;

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

    setPosts((prev) => [newPost, ...prev]);

    setPostText("");
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) =>
      prev.filter((post) => {
        if (post.id !== postId) {
          return true;
        }

        return post.username !== currentUser.username;
      }),
    );

    setComments((prev) => {
      const updated = { ...prev };

      delete updated[postId];

      return updated;
    });
  };

  const handleLike = (postId) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) return;

    const wasLiked = Boolean(targetPost.liked);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !wasLiked,
              likeCount: wasLiked
                ? Math.max((post.likeCount || 0) - 1, 0)
                : (post.likeCount || 0) + 1,
            }
          : post,
      ),
    );

    if (!wasLiked) {
      addNotification(`You liked a post by @${targetPost.username}.`, "like");
    }
  };

  const handleRepost = (postId) => {
    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) return;

    const wasReposted = Boolean(targetPost.reposted);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              reposted: !wasReposted,
              repostCount: wasReposted
                ? Math.max(0, (post.repostCount || 0) - 1)
                : (post.repostCount || 0) + 1,
            }
          : post,
      ),
    );

    if (!wasReposted && targetPost.username !== currentUser.username) {
      addNotification(
        `${currentUser.name} reposted ${targetPost.authorName}'s post.`,
        "repost",
      );
    }
  };

  const handleBookmark = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
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

  const handleFollow = (username) => {
    const alreadyFollowing = followedUsers.includes(username);

    if (alreadyFollowing) {
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
     COMMENTS
  ========================= */

  const handleComment = (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) return;

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

    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
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

                  <p className="post-text">{post.text}</p>

                  <div className="post-actions">
                    <button
                      onClick={() =>
                        setActivePost(activePost === post.id ? null : post.id)
                      }
                    >
                      💬 {(comments[post.id] || []).length}
                    </button>

                    <button onClick={() => handleRepost(post.id)}>
                      🔁 {post.repostCount}
                    </button>

                    <button onClick={() => handleLike(post.id)}>
                      {post.liked ? "❤️" : "♡"} {post.likeCount}
                    </button>

                    <button onClick={() => handleBookmark(post.id)}>
                      {post.bookmarked ? "🔖" : "📑"}
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

  const MessagesPage = () => {
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
              🔍
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
                <div className="empty-chat-icon">💬</div>

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
            <div className="empty-bookmarks-icon">🔖</div>

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

                <p className="post-text">{post.text}</p>

                <div className="post-actions">
                  <button
                    onClick={() =>
                      setActivePost(activePost === post.id ? null : post.id)
                    }
                  >
                    💬 {(comments[post.id] || []).length}
                  </button>

                  <button onClick={() => handleRepost(post.id)}>
                    🔁 {post.repostCount}
                  </button>

                  <button onClick={() => handleLike(post.id)}>
                    {post.liked ? "❤️" : "♡"} {post.likeCount}
                  </button>

                  <button onClick={() => handleBookmark(post.id)}>
                    🔖 Remove
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
                          💬 {(comments[post.id] || []).length}
                        </button>

                        <button onClick={() => handleRepost(post.id)}>
                          🔁 {post.repostCount}
                        </button>

                        <button onClick={() => handleLike(post.id)}>
                          {post.liked ? "❤️" : "♡"} {post.likeCount}
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

                        <button onClick={() => handleLike(post.id)}>
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
     HOME PAGE
  ========================= */

  const HomePage = () => (
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

                  <button onClick={() => handleRepost(post.id)}>
                    🔁 {post.repostCount}
                  </button>

                  <button onClick={() => handleLike(post.id)}>
                    {post.liked ? "❤️" : "♡"} {post.likeCount}
                  </button>

                  <button onClick={() => handleBookmark(post.id)}>
                    {post.bookmarked ? "🔖" : "📑"}
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
              <span>⌂</span>

              <strong>Home</strong>
            </div>

            <div
              className={`nav-item ${activePage === "explore" ? "active" : ""}`}
              onClick={() => setActivePage("explore")}
            >
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

            <div
              className={`nav-item ${
                activePage === "messages" ? "active" : ""
              }`}
              onClick={() => setActivePage("messages")}
            >
              <span className="notification-nav-icon">
                ✉️
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

            <div
              className={`nav-item ${
                activePage === "settings" ? "active" : ""
              }`}
              onClick={() => setActivePage("settings")}
            >
              <span>⚙️</span>

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
          {activePage === "profile" && <ProfilePage />}

          {activePage === "notifications" && <NotificationsPage />}

          {activePage === "explore" && <ExplorePage />}

          {activePage === "messages" && <MessagesPage />}

          {activePage === "bookmarks" && <BookmarksPage />}

          {activePage === "settings" && <SettingsPage />}

          {activePage === "home" && <HomePage />}
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
          ⌂
        </span>

        <span
          className={activePage === "explore" ? "mobile-active" : ""}
          onClick={() => setActivePage("explore")}
        >
          🔍
        </span>

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

        <span
          className={activePage === "notifications" ? "mobile-active" : ""}
          onClick={() => setActivePage("notifications")}
        >
          🔔
        </span>

        <span
          className={activePage === "profile" ? "mobile-active" : ""}
          onClick={() => setActivePage("profile")}
        >
          👤
        </span>
      </div>
    </div>
  );
}

export default App;
