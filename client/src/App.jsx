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
            <div className="avatar">S</div>

            <div className="post-content">
              <div className="post-author">
                <strong>Idienumah Sokombie</strong>
                <span>@sokombie · 2h</span>
              </div>

              <p>
                Just started working on my new project. Excited to see how
                everything comes together!
              </p>

              <div className="post-actions">
                <button>💬</button>
                <button>🔁</button>
                <button>❤️</button>
                <button>🔖</button>
              </div>
            </div>
          </article>

          <article className="post">
            <div className="avatar">A</div>

            <div className="post-content">
              <div className="post-author">
                <strong>Alex Johnson</strong>
                <span>@alexj · 4h</span>
              </div>

              <p>
                Learning React and building reusable components makes
                development so much easier.
              </p>

              <div className="post-actions">
                <button>💬</button>
                <button>🔁</button>
                <button>❤️</button>
                <button>🔖</button>
              </div>
            </div>
          </article>

          <section className="posts">
            <article className="post">
              <div className="avatar">S</div>

              <div className="post-content">
                <div className="post-author">
                  <strong>Stanley Okonkwo</strong>
                  <span>@stanley · 2h</span>
                  <button className="more-button">•••</button>
                </div>

                <p>
                  Just started working on my new project. Excited to see how
                  everything comes together!
                </p>

                <div className="post-actions">
                  <button>
                    💬 <span>12</span>
                  </button>
                  <button>
                    🔁 <span>5</span>
                  </button>
                  <button>
                    ❤️ <span>24</span>
                  </button>
                  <button>🔖</button>
                </div>
              </div>
            </article>

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
                  <button>
                    🔁 <span>3</span>
                  </button>
                  <button>
                    ❤️ <span>18</span>
                  </button>
                  <button>🔖</button>
                </div>
              </div>
            </article>

            <article className="post">
              <div className="avatar">M</div>

              <div className="post-content">
                <div className="post-author">
                  <strong>Michael Brown</strong>
                  <span>@michaelb · 6h</span>
                  <button className="more-button">•••</button>
                </div>

                <p>
                  What's everyone working on today? Drop your projects below.
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
                  <button>🔖</button>
                </div>
              </div>
            </article>
          </section>
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
