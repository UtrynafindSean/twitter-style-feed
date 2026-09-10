import { useState, useEffect } from "react";

function App() {
  // =========================
  // AUTH
  // =========================
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authMode, setAuthMode] = useState("signin");
  const [authName, setAuthName] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // =========================
  // NAVIGATION
  // =========================
  const [view, setView] = useState("home");

  // =========================
  // PROFILE
  // =========================
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // =========================
  // FEED
  // =========================
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);

  const [postText, setPostText] = useState("");
  const [searchText, setSearchText] = useState("");

  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem("posts");
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  const [commentText, setCommentText] = useState("");

  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem("comments");
    return savedComments ? JSON.parse(savedComments) : [];
  });

  const [activePost, setActivePost] = useState(null);

  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);

  const [bookmarked, setBookmarked] = useState(false);

  const [followedUsers, setFollowedUsers] = useState([]);

  // =========================
  // LOCAL STORAGE
  // =========================
  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // =========================
  // SEARCH
  // =========================
  const filteredPosts = posts.filter((post) =>
    post.text.toLowerCase().includes(searchText.toLowerCase())
  );

  // =========================
  // SIGN UP
  // =========================
  const handleSignUp = (e) => {
    e.preventDefault();

    setAuthMessage("");

    if (
      !authName.trim() ||
      !authUsername.trim() ||
      !authEmail.trim() ||
      !authPassword.trim()
    ) {
      setAuthMessage("Please fill in all fields.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }

    const savedUsers = localStorage.getItem("users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const usernameExists = users.some(
      (user) =>
        user.username.toLowerCase() ===
        authUsername.trim().toLowerCase()
    );

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() === authEmail.trim().toLowerCase()
    );

    if (usernameExists) {
      setAuthMessage("Username already exists.");
      return;
    }

    if (emailExists) {
      setAuthMessage("Email already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: authName.trim(),
      username: authUsername.trim(),
      email: authEmail.trim(),
      password: authPassword,
    };

    localStorage.setItem(
      "users",
      JSON.stringify([...users, newUser])
    );

    setCurrentUser(newUser);

    setAuthName("");
    setAuthUsername("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthMessage("");
  };

  // =========================
  // SIGN IN
  // =========================
  const handleSignIn = (e) => {
    e.preventDefault();

    setAuthMessage("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage("Please enter your email and password.");
      return;
    }

    const savedUsers = localStorage.getItem("users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const user = users.find(
      (item) =>
        item.email.toLowerCase() ===
          authEmail.trim().toLowerCase() &&
        item.password === authPassword
    );

    if (!user) {
      setAuthMessage("Invalid email or password.");
      return;
    }

    setCurrentUser(user);

    setAuthEmail("");
    setAuthPassword("");
    setAuthMessage("");
  };

  // =========================
  // SIGN OUT
  // =========================
  const handleSignOut = () => {
    setCurrentUser(null);
    setView("home");
  };

  // =========================
  // CREATE POST
  // =========================
  const handlePost = () => {
    if (postText.trim() === "") return;

    const newPost = {
      id: Date.now(),
      text: postText.trim(),

      authorName: currentUser.name,
      authorUsername: currentUser.username,

      liked: false,
      likeCount: 0,

      reposted: false,
      repostCount: 0,

      bookmarked: false,
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setPostText("");
  };

  // =========================
  // COMMENTS
  // =========================
  const handleComment = (postId) => {
    if (commentText.trim() === "") return;

    const newComment = {
      id: Date.now(),
      postId,

      text: commentText.trim(),

      authorName: currentUser.name,
      authorUsername: currentUser.username,
    };

    setComments((currentComments) => [
      ...currentComments,
      newComment,
    ]);

    setCommentText("");
  };

  // =========================
  // DELETE POST
  // =========================
  const handleDeletePost = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId)
    );

    setComments((currentComments) =>
      currentComments.filter(
        (comment) => comment.postId !== postId
      )
    );

    setActivePost(null);
  };

  // =========================
  // LIKE SAMPLE POST
  // =========================
  const handleLike = () => {
    setLiked(!liked);

    setLikeCount(
      liked ? likeCount - 1 : likeCount + 1
    );
  };

  // =========================
  // LIKE USER POST
  // =========================
  const handlePostLike = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const currentlyLiked = post.liked || false;
        const currentCount = post.likeCount || 0;

        return {
          ...post,

          liked: !currentlyLiked,

          likeCount: currentlyLiked
            ? Math.max(0, currentCount - 1)
            : currentCount + 1,
        };
      })
    );
  };

  // =========================
  // REPOST SAMPLE POST
  // =========================
  const handleRepost = () => {
    setReposted(!reposted);

    setRepostCount(
      reposted ? repostCount - 1 : repostCount + 1
    );
  };

  // =========================
  // REPOST USER POST
  // =========================
  const handlePostRepost = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const currentlyReposted = post.reposted || false;
        const currentCount = post.repostCount || 0;

        return {
          ...post,

          reposted: !currentlyReposted,

          repostCount: currentlyReposted
            ? Math.max(0, currentCount - 1)
            : currentCount + 1,
        };
      })
    );
  };

  // =========================
  // BOOKMARK
  // =========================
  const handleBookmark = (postId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          bookmarked: !post.bookmarked,
        };
      })
    );
  };

  // =========================
  // FOLLOW
  // =========================
  const handleFollow = (username) => {
    if (followedUsers.includes(username)) {
      setFollowedUsers(
        followedUsers.filter(
          (user) => user !== username
        )
      );
    } else {
      setFollowedUsers([
        ...followedUsers,
        username,
      ]);
    }
  };

  // =========================
  // OPEN EDIT PROFILE
  // =========================
  const openEditProfile = () => {
    setEditName(currentUser.name);
    setEditUsername(currentUser.username);
    setProfileMessage("");
    setShowEditProfile(true);
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSaveProfile = () => {
    if (!editName.trim() || !editUsername.trim()) {
      setProfileMessage(
        "Name and username cannot be empty."
      );
      return;
    }

    const savedUsers = localStorage.getItem("users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    const usernameExists = users.some(
      (user) =>
        user.id !== currentUser.id &&
        user.username.toLowerCase() ===
          editUsername.trim().toLowerCase()
    );

    if (usernameExists) {
      setProfileMessage("That username is already taken.");
      return;
    }

    const oldUsername = currentUser.username;

    const updatedUser = {
      ...currentUser,

      name: editName.trim(),
      username: editUsername.trim(),
    };

    // Update users
    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? updatedUser
        : user
    );

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    // Update current user
    setCurrentUser(updatedUser);

    // Update user's posts
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.authorUsername !== oldUsername) {
          return post;
        }

        return {
          ...post,
          authorName: updatedUser.name,
          authorUsername: updatedUser.username,
        };
      })
    );

    // Update user's comments
    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (
          comment.authorUsername !== oldUsername
        ) {
          return comment;
        }

        return {
          ...comment,
          authorName: updatedUser.name,
          authorUsername: updatedUser.username,
        };
      })
    );

    setShowEditProfile(false);
    setProfileMessage("");
  };

  // =========================
  // AUTH SCREEN
  // =========================
  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <h1 className="auth-logo">𝕏</h1>

          {authMode === "signin" ? (
            <>
              <h2>Sign in to X</h2>

              <p className="auth-subtitle">
                Welcome back. Sign in to continue.
              </p>

              <form onSubmit={handleSignIn}>

                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(e.target.value)
                  }
                />

                {authMessage && (
                  <p className="auth-message">
                    {authMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-button"
                >
                  Sign In
                </button>

              </form>

              <p className="auth-switch">
                Don't have an account?{" "}

                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthMessage("");
                  }}
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Create your account</h2>

              <p className="auth-subtitle">
                Join the conversation.
              </p>

              <form onSubmit={handleSignUp}>

                <input
                  type="text"
                  placeholder="Full name"
                  value={authName}
                  onChange={(e) =>
                    setAuthName(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={authUsername}
                  onChange={(e) =>
                    setAuthUsername(e.target.value)
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(e.target.value)
                  }
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(e.target.value)
                  }
                />

                {authMessage && (
                  <p className="auth-message">
                    {authMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-button"
                >
                  Sign Up
                </button>

              </form>

              <p className="auth-switch">
                Already have an account?{" "}

                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthMessage("");
                  }}
                >
                  Sign in
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    );
  }

  // =========================
  // PROFILE PAGE
  // =========================
  if (view === "profile") {
    const userPostCount = posts.filter(
      (post) =>
        post.authorUsername === currentUser.username
    ).length;

    return (
      <div className="app">

        {/* LEFT SIDEBAR */}
        <aside className="sidebar">

          <h1 className="logo">𝕏</h1>

          <nav>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView("home");
              }}
            >
              Home
            </a>

            <a href="#">Explore</a>

            <a href="#">Notifications</a>

            <a href="#">Messages</a>

            <a href="#">Bookmarks</a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView("profile");
              }}
            >
              Profile
            </a>

          </nav>

          <button
            className="post-button"
            onClick={() => {
              setView("home");

              setTimeout(() => {
                document
                  .querySelector(".compose textarea")
                  ?.focus();
              }, 100);
            }}
          >
            Post
          </button>

          <div className="sidebar-user">

            <div className="small-avatar">
              {currentUser.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{currentUser.name}</strong>
              <span>
                @{currentUser.username}
              </span>
            </div>

            <button
              className="signout-button"
              onClick={handleSignOut}
            >
              ↪
            </button>

          </div>

        </aside>

        {/* PROFILE CONTENT */}
        <main className="feed">

          <header className="feed-header">
            <h2>Profile</h2>
          </header>

          <section
            style={{
              padding: "40px 25px",
              borderBottom: "1px solid #eee",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >

              <div
                className="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "32px",
                }}
              >
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <button
                onClick={openEditProfile}
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px",
                  border: "1px solid #222",
                  background: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>

            </div>

            <h1 style={{ marginBottom: "5px" }}>
              {currentUser.name}
            </h1>

            <p
              style={{
                color: "#666",
                marginTop: "0",
              }}
            >
              @{currentUser.username}
            </p>

            <p
              style={{
                marginTop: "20px",
              }}
            >
              {currentUser.email}
            </p>

            <div
              style={{
                display: "flex",
                gap: "30px",
                marginTop: "25px",
              }}
            >

              <div>
                <strong>{userPostCount}</strong>{" "}
                <span>Posts</span>
              </div>

              <div>
                <strong>
                  {followedUsers.length}
                </strong>{" "}
                <span>Following</span>
              </div>

            </div>

          </section>

          {/* USER POSTS */}
          <section className="posts">

            {userPostCount === 0 ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                }}
              >
                <h3>No posts yet</h3>

                <p>
                  Your posts will appear here.
                </p>

                <button
                  onClick={() => setView("home")}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    border: "none",
                    background: "#000",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Create a post
                </button>

              </div>
            ) : (
              filteredPosts
                .filter(
                  (post) =>
                    post.authorUsername ===
                    currentUser.username
                )
                .map((post) => (
                  <article
                    className="post"
                    key={post.id}
                  >

                    <div className="avatar">
                      {post.authorName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="post-content">

                      <div className="post-author">

                        <strong>
                          {post.authorName}
                        </strong>

                        <span>
                          @{post.authorUsername} · now
                        </span>

                        <button
                          className="more-button"
                          onClick={() =>
                            handleDeletePost(post.id)
                          }
                        >
                          🗑️
                        </button>

                      </div>

                      <p>{post.text}</p>

                      <div className="post-actions">

                        <button
                          onClick={() =>
                            setActivePost(
                              activePost === post.id
                                ? null
                                : post.id
                            )
                          }
                        >
                          💬{" "}
                          <span>
                            {
                              comments.filter(
                                (comment) =>
                                  comment.postId ===
                                  post.id
                              ).length
                            }
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            handlePostRepost(post.id)
                          }
                        >
                          🔁{" "}
                          <span>
                            {post.repostCount || 0}
                          </span>
                        </button>

                        <button
                          className={
                            post.liked
                              ? "liked"
                              : ""
                          }
                          onClick={() =>
                            handlePostLike(post.id)
                          }
                        >
                          {post.liked
                            ? "❤️"
                            : "♡"}{" "}
                          <span>
                            {post.likeCount || 0}
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            handleBookmark(post.id)
                          }
                        >
                          {post.bookmarked
                            ? "🔖"
                            : "♡"}
                        </button>

                      </div>

                    </div>

                  </article>
                ))
            )}

          </section>

        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="right-sidebar">

          <div className="sidebar-card">

            <h3>Your Profile</h3>

            <div className="follow-user">

              <div className="small-avatar">
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="follow-info">

                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  @{currentUser.username}
                </span>

              </div>

            </div>

            <button
              onClick={openEditProfile}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "10px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>

          </div>

        </aside>

        {/* EDIT PROFILE MODAL */}
        {showEditProfile && (
          <div
            style={{
              position: "fixed",
              inset: "0",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "1000",
            }}
          >

            <div
              style={{
                background: "white",
                width: "90%",
                maxWidth: "500px",
                borderRadius: "20px",
                padding: "25px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <h2>Edit Profile</h2>

                <button
                  onClick={() =>
                    setShowEditProfile(false)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>

              </div>

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Username
              </label>

              <input
                type="text"
                value={editUsername}
                onChange={(e) =>
                  setEditUsername(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Email
              </label>

              <input
                type="email"
                value={currentUser.email}
                disabled
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  background: "#f5f5f5",
                }}
              />

              {profileMessage && (
                <p
                  style={{
                    color: "red",
                    marginTop: "15px",
                  }}
                >
                  {profileMessage}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "25px",
                }}
              >

                <button
                  onClick={() =>
                    setShowEditProfile(false)
                  }
                  style={{
                    padding: "10px 18px",
                    borderRadius: "20px",
                    border: "1px solid #ccc",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "20px",
                    border: "none",
                    background: "#000",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>

              </div>

            </div>

          </div>
        )}

        <nav className="mobile-nav">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("home");
            }}
          >
            ⌂
          </a>

          <a href="#">⌕</a>
          <a href="#">＋</a>
          <a href="#">♡</a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("profile");
            }}
          >
            ◯
          </a>
        </nav>

      </div>
    );
  }

  // =========================
  // HOME PAGE
  // =========================
  return (
    <div className="app">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <h1 className="logo">𝕏</h1>

        <nav>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("home");
            }}
          >
            Home
          </a>

          <a href="#">Explore</a>

          <a href="#">Notifications</a>

          <a href="#">Messages</a>

          <a href="#">Bookmarks</a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setView("profile");
            }}
          >
            Profile
          </a>

        </nav>

        <button
          className="post-button"
          onClick={() =>
            document
              .querySelector(".compose textarea")
              ?.focus()
          }
        >
          Post
        </button>

        <div className="sidebar-user">

          <div className="small-avatar">
            {currentUser.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>{currentUser.name}</strong>

            <span>
              @{currentUser.username}
            </span>
          </div>

          <button
            className="signout-button"
            onClick={handleSignOut}
          >
            ↪
          </button>

        </div>

      </aside>

      {/* FEED */}
      <main className="feed">

        <header className="feed-header">
          <h2>Home</h2>
        </header>

        {/* COMPOSE */}
        <section className="compose">

          <div className="avatar">
            {currentUser.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="compose-content">

            <textarea
              placeholder="Share your thoughts...."
              value={postText}
              onChange={(e) =>
                setPostText(e.target.value)
              }
            />

            <button onClick={handlePost}>
              Post
            </button>

          </div>

        </section>

        {/* POSTS */}
        <section className="posts">

          {filteredPosts.map((post) => (
            <article
              className="post"
              key={post.id}
            >

              <div className="avatar">
                {post.authorName
                  ? post.authorName
                      .charAt(0)
                      .toUpperCase()
                  : "I"}
              </div>

              <div className="post-content">

                <div className="post-author">

                  <strong>
                    {post.authorName ||
                      "Idienumah Sokombie"}
                  </strong>

                  <span>
                    @
                    {post.authorUsername ||
                      "sokombie"}{" "}
                    · now
                  </span>

                  {post.authorUsername ===
                    currentUser.username && (
                    <button
                      className="more-button"
                      onClick={() =>
                        handleDeletePost(post.id)
                      }
                    >
                      🗑️
                    </button>
                  )}

                </div>

                <p>{post.text}</p>

                <div className="post-actions">

                  <button
                    onClick={() =>
                      setActivePost(
                        activePost === post.id
                          ? null
                          : post.id
                      )
                    }
                  >
                    💬{" "}
                    <span>
                      {
                        comments.filter(
                          (comment) =>
                            comment.postId ===
                            post.id
                        ).length
                      }
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handlePostRepost(post.id)
                    }
                  >
                    🔁{" "}
                    <span>
                      {post.repostCount || 0}
                    </span>
                  </button>

                  <button
                    className={
                      post.liked ? "liked" : ""
                    }
                    onClick={() =>
                      handlePostLike(post.id)
                    }
                  >
                    {post.liked
                      ? "❤️"
                      : "♡"}{" "}
                    <span>
                      {post.likeCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleBookmark(post.id)
                    }
                  >
                    {post.bookmarked
                      ? "🔖"
                      : "♡"}
                  </button>

                </div>

                {/* COMMENTS */}
                {activePost === post.id && (
                  <>
                    <div className="comments-box">

                      <textarea
                        placeholder="Post your reply..."
                        value={commentText}
                        onChange={(e) =>
                          setCommentText(
                            e.target.value
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          handleComment(post.id)
                        }
                      >
                        Reply
                      </button>

                    </div>

                    <div className="comments-list">

                      {comments
                        .filter(
                          (comment) =>
                            comment.postId ===
                            post.id
                        )
                        .map((comment) => (
                          <div
                            className="comment"
                            key={comment.id}
                          >

                            <div className="small-avatar">
                              {comment.authorName
                                ? comment.authorName
                                    .charAt(0)
                                    .toUpperCase()
                                : "I"}
                            </div>

                            <div>

                              <strong>
                                {comment.authorName ||
                                  currentUser.name}
                              </strong>

                              <p>
                                {comment.text}
                              </p>

                            </div>

                          </div>
                        ))}

                    </div>
                  </>
                )}

              </div>

            </article>
          ))}

          {/* SAMPLE POST 1 */}
          <article className="post">

            <div className="avatar">S</div>

            <div className="post-content">

              <div className="post-author">

                <strong>
                  Idienumah Sokombie
                </strong>

                <span>
                  @sokombie · 2h
                </span>

                <button className="more-button">
                  •••
                </button>

              </div>

              <p>
                Just started working on my new
                project. Excited to see how
                everything comes together!
              </p>

              <div className="post-media">
                <div className="media-placeholder">
                  <span>
                    Project Preview
                  </span>
                </div>
              </div>

              <div className="post-actions">

                <button>
                  💬 <span>12</span>
                </button>

                <button
                  onClick={handleRepost}
                >
                  🔁{" "}
                  <span>{repostCount}</span>
                </button>

                <button
                  className={
                    liked ? "liked" : ""
                  }
                  onClick={handleLike}
                >
                  {liked ? "❤️" : "♡"}{" "}
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={() =>
                    setBookmarked(!bookmarked)
                  }
                >
                  {bookmarked
                    ? "🔖"
                    : "♡"}
                </button>

              </div>

            </div>

          </article>

          {/* SAMPLE POST 2 */}
          <article className="post">

            <div className="avatar">A</div>

            <div className="post-content">

              <div className="post-author">

                <strong>
                  Alex Johnson
                </strong>

                <span>
                  @alexj · 4h
                </span>

                <button className="more-button">
                  •••
                </button>

              </div>

              <p>
                Learning React and building
                reusable components makes
                development so much easier.
              </p>

              <div className="post-actions">

                <button>
                  💬 <span>8</span>
                </button>

                <button>
                  🔁 <span>3</span>
                </button>

                <button>
                  ❤️ <span>18</span>
                </button>

                <button>
                  🔖
                </button>

              </div>

            </div>

          </article>

          {/* SAMPLE POST 3 */}
          <article className="post">

            <div className="avatar">M</div>

            <div className="post-content">

              <div className="post-author">

                <strong>
                  Michael Brown
                </strong>

                <span>
                  @michaelb · 6h
                </span>

                <button className="more-button">
                  •••
                </button>

              </div>

              <p>
                What's everyone working on
                today? Drop your projects below.
              </p>

              <div className="post-actions">

                <button>
                  💬 <span>15</span>
                </button>

                <button>
                  🔁 <span>7</span>
                </button>

                <button>
                  ❤️ <span>31</span>
                </button>

                <button>
                  🔖
                </button>

              </div>

            </div>

          </article>

        </section>

      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">

        {/* SEARCH */}
        <div className="search">

          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

        </div>

        {/* TRENDS */}
        <div className="sidebar-card trends-card">

          <h3>What's happening</h3>

          <div className="trend">
            <span>
              Trending in Nigeria
            </span>

            <strong>#Tech</strong>

            <small>
              12.4K posts
            </small>
          </div>

          <div className="trend">
            <span>Trending</span>

            <strong>#ReactJS</strong>

            <small>
              8,532 posts
            </small>
          </div>

          <div className="trend">
            <span>
              Trending in Nigeria
            </span>

            <strong>#Football</strong>

            <small>
              24.8K posts
            </small>
          </div>

          <div className="trend">
            <span>Trending</span>

            <strong>#JavaScript</strong>

            <small>
              6,921 posts
            </small>
          </div>

          <a
            href="#"
            className="show-more"
          >
            Show more
          </a>

        </div>

        {/* WHO TO FOLLOW */}
        <div className="sidebar-card">

          <h3>Who to follow</h3>

          <div className="follow-user">

            <div className="small-avatar">
              J
            </div>

            <div className="follow-info">

              <strong>
                John Smith
              </strong>

              <span>
                @johnsmith
              </span>

            </div>

            <button
              onClick={() =>
                handleFollow("johnsmith")
              }
            >
              {followedUsers.includes(
                "johnsmith"
              )
                ? "Following"
                : "Follow"}
            </button>

          </div>

          <div className="follow-user">

            <div className="small-avatar">
              D
            </div>

            <div className="follow-info">

              <strong>
                David James
              </strong>

              <span>
                @davidjames
              </span>

            </div>

            <button
              onClick={() =>
                handleFollow("davidjames")
              }
            >
              {followedUsers.includes(
                "davidjames"
              )
                ? "Following"
                : "Follow"}
            </button>

          </div>

          <div className="follow-user">

            <div className="small-avatar">
              E
            </div>

            <div className="follow-info">

              <strong>
                Emily Rose
              </strong>

              <span>
                @emilyrose
              </span>

            </div>

            <button
              onClick={() =>
                handleFollow("emilyrose")
              }
            >
              {followedUsers.includes(
                "emilyrose"
              )
                ? "Following"
                : "Follow"}
            </button>

          </div>

          <a
            href="#"
            className="show-more"
          >
            Show more
          </a>

        </div>

      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("home");
          }}
        >
          ⌂
        </a>

        <a href="#">⌕</a>

        <a href="#">＋</a>

        <a href="#">♡</a>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("profile");
          }}
        >
          ◯
        </a>

      </nav>

    </div>
  );
}

export default App;