function App() {
  return (
    <div className="app">
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

      <main className="feed">
        <header className="feed-header">
          <h2>Home</h2>
        </header>

        <section className="compose">
          <div className="avatar">U</div>

          <div className="compose-content">
            <textarea placeholder="What is happening?!"></textarea>
            <button>Post</button>
          </div>
        </section>

        <section className="posts">
          <article className="post">
            <div className="avatar">U</div>

            <div className="post-content">
              <div className="post-author">
                <strong>User Name</strong>
                <span>@username · 2h</span>
              </div>

              <p>
                This is where the post content will appear. We're building the
                Twitter-style feed UI first.
              </p>

              <div className="post-actions">
                <button>💬</button>
                <button>🔁</button>
                <button>❤️</button>
                <button>🔖</button>
              </div>
            </div>
          </article>
        </section>
      </main>

      <aside className="right-sidebar">
        <div className="search">
          <input type="text" placeholder="Search" />
        </div>

        <div className="sidebar-card">
          <h3>What's happening</h3>
          <p>Trending topic #1</p>
          <p>Trending topic #2</p>
          <p>Trending topic #3</p>
        </div>

        <div className="sidebar-card">
          <h3>Who to follow</h3>
          <p>@userone</p>
          <p>@usertwo</p>
          <p>@userthree</p>
        </div>
      </aside>
    </div>
  );
}

export default App;
