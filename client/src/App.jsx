import { useState, useEffect } from "react";

function App() {
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

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);
  const filteredPosts = posts.filter((post) =>
    post.text.toLowerCase().includes(searchText.toLowerCase()),
  );
  const handlePost = () => {
    if (postText.trim() === "") return;

    const newPost = {
      id: Date.now(),
      text: postText,
    };

    setPosts([newPost, ...posts]);
    setPostText("");
  };

  const handleComment = (postId) => {
    if (commentText.trim() === "") return;

    const newComment = {
      id: Date.now(),
      postId: postId,
      text: commentText,
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setActivePost(null);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));

    setComments(comments.filter((comment) => comment.postId !== postId));

    setActivePost(null);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };
  const handleRepost = () => {
    setReposted(!reposted);
    setRepostCount(reposted ? repostCount - 1 : repostCount + 1);
  };
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };
  const handleFollow = (username) => {
    if (followedUsers.includes(username)) {
      setFollowedUsers(followedUsers.filter((user) => user !== username));
    } else {
      setFollowedUsers([...followedUsers, username]);
    }
  };

  return (
    <div className="app">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <h1 className="logo">𝕏</h1>

        <nav>
          <a href="#">Home</a>
          <a href="#">Explore</a>
          <a href="#">Notifications</a>
          <a href="#">Messages</a>
          <a href="#">Bookmarks</a>
          <a href="#">Profile</a>
        </nav>

        <button className="post-button">Post</button>
      </aside>

      {/* MAIN FEED */}
      <main className="feed">
        <header className="feed-header">
          <h2>Home</h2>
        </header>

        {/* COMPOSE */}
        <section className="compose">
          <div className="avatar">I</div>

          <div className="compose-content">
            <textarea
              placeholder="Share your thoughts...."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            ></textarea>

            <button onClick={handlePost}>Post</button>
          </div>
        </section>

        {/* POSTS */}
        <section className="posts">
          {/* USER CREATED POSTS */}
          {filteredPosts.map((post) => (
            <article className="post" key={post.id}>
              <div className="avatar">I</div>

              <div className="post-content">
                <div className="post-author">
                  <strong>Idienumah Sokombie</strong>
                  <span>@sokombie · now</span>

                  <button
                    className="more-button"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    🗑️
                  </button>
                </div>

                <p>{post.text}</p>

                <div className="post-actions">
                  {/* COMMENT */}
                  <button
                    onClick={() =>
                      setActivePost(activePost === post.id ? null : post.id)
                    }
                  >
                    💬{" "}
                    <span>
                      {
                        comments.filter((comment) => comment.postId === post.id)
                          .length
                      }
                    </span>
                  </button>

                  {/* REPOST */}
                  <button onClick={handleRepost}>
                    🔁 <span>{repostCount}</span>
                  </button>

                  {/* LIKE */}
                  <button
                    className={post.liked ? "liked" : ""}
                    onClick={() => handlePostLike(post.id)}
                  >
                    {post.liked ? "❤️" : "♡"} <span>{post.likeCount}</span>
                  </button>

                  {/* BOOKMARK */}
                  <button onClick={() => handleBookmark(post.id)}>
                    {bookmarked ? "🔖" : "♡"}
                  </button>
                </div>

                {/* COMMENTS */}
                {activePost === post.id && (
                  <>
                    <div className="comments-box">
                      <textarea
                        placeholder="Post your reply..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      ></textarea>

                      <button onClick={() => handleComment(post.id)}>
                        Reply
                      </button>
                    </div>

                    <div className="comments-list">
                      {comments
                        .filter((comment) => comment.postId === post.id)
                        .map((comment) => (
                          <div className="comment" key={comment.id}>
                            <div className="small-avatar">I</div>

                            <div>
                              <strong>Idienumah Sokombie</strong>

                              <p>{comment.text}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}

          {/* ORIGINAL SAMPLE POST */}
          <article className="post">
            <div className="avatar">S</div>

            <div className="post-content">
              <div className="post-author">
                <strong>Idienumah Sokombie</strong>
                <span>@sokombie · 2h</span>

                <button className="more-button">•••</button>
              </div>

              <p>
                Just started working on my new project. Excited to see how
                everything comes together!
              </p>

              <div className="post-media">
                <div className="media-placeholder">
                  <span>Project Preview</span>
                </div>
              </div>

              <div className="post-actions">
                <button>
                  💬 <span>12</span>
                </button>

                <button onClick={handleRepost}>
                  🔁 <span>{repostCount}</span>
                </button>

                <button className={liked ? "liked" : ""} onClick={handleLike}>
                  {liked ? "❤️" : "♡"} <span>{likeCount}</span>
                </button>

                <button onClick={handleBookmark}>
                  {bookmarked ? "🔖" : "♡"}
                </button>
              </div>
            </div>
          </article>

          {/* ALEX JOHNSON */}
          <article className="post">
            <div className="avatar">A</div>

            <div className="post-content">
              <div className="post-author">
                <strong>Alex Johnson</strong>
                <span>@alexj · 4h</span>

                <button className="more-button">•••</button>
              </div>

              <p>
                Learning React and building reusable components makes
                development so much easier.
              </p>

              <div className="post-actions">
                <button>
                  💬 <span>8</span>
                </button>

                <button onClick={handleRepost}>
                  🔁 <span>{repostCount}</span>
                </button>

                <button onClick={handleLike}>
                  {liked ? "❤️" : "♡"} <span>{likeCount}</span>
                </button>

                <button onClick={handleBookmark}>
                  {bookmarked ? "🔖" : "♡"}
                </button>
              </div>
            </div>
          </article>

          {/* MICHAEL BROWN */}
          <article className="post">
            <div className="avatar">M</div>

            <div className="post-content">
              <div className="post-author">
                <strong>Michael Brown</strong>
                <span>@michaelb · 6h</span>

                <button className="more-button">•••</button>
              </div>

              <p>What's everyone working on today? Drop your projects below.</p>

              <div className="post-actions">
                <button>
                  💬 <span>15</span>
                </button>

                <button onClick={handleRepost}>
                  🔁 <span>{repostCount}</span>
                </button>

                <button onClick={handleLike}>
                  {liked ? "❤️" : "♡"} <span>{likeCount}</span>
                </button>

                <button onClick={handleBookmark}>
                  {bookmarked ? "🔖" : "♡"}
                </button>
              </div>
            </div>
          </article>
        </section>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">
        <div className="search">
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="sidebar-card trends-card">
          <h3>What's happening</h3>

          <div className="trend">
            <span>Trending in Nigeria</span>
            <strong>#Tech</strong>
            <small>12.4K posts</small>
          </div>

          <div className="trend">
            <span>Trending</span>
            <strong>#ReactJS</strong>
            <small>8,532 posts</small>
          </div>

          <div className="trend">
            <span>Trending in Nigeria</span>
            <strong>#Football</strong>
            <small>24.8K posts</small>
          </div>

          <div className="trend">
            <span>Trending</span>
            <strong>#JavaScript</strong>
            <small>6,921 posts</small>
          </div>

          <a href="#" className="show-more">
            Show more
          </a>
        </div>

        <div className="sidebar-card">
          <h3>Who to follow</h3>

          <div className="follow-user">
            <div className="small-avatar">J</div>

            <div className="follow-info">
              <strong>John Smith</strong>
              <span>@johnsmith</span>
            </div>

            <button onClick={() => handleFollow("johnsmith")}>
              {followedUsers.includes("johnsmith") ? "Following" : "Follow"}
            </button>
          </div>

          <div className="follow-user">
            <div className="small-avatar">D</div>

            <div className="follow-info">
              <strong>David James</strong>
              <span>@davidjames</span>
            </div>

            <button onClick={() => handleFollow("davidjames")}>
              {followedUsers.includes("davidjames") ? "Following" : "Follow"}
            </button>
          </div>

          <div className="follow-user">
            <div className="small-avatar">E</div>

            <div className="follow-info">
              <strong>Emily Rose</strong>
              <span>@emilyrose</span>
            </div>

            <button onClick={() => handleFollow("emilyrose")}>
              {followedUsers.includes("emilyrose") ? "Following" : "Follow"}
            </button>
          </div>

          <a href="#" className="show-more">
            Show more
          </a>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <a href="#">⌂</a>
        <a href="#">⌕</a>
        <a href="#">＋</a>
        <a href="#">♡</a>
        <a href="#">◯</a>
      </nav>
    </div>
  );
}

export default App;
