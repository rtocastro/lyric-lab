import Button from "../components/Button";

function HomePage({ onCreateProject }) {
  return (
    <main className="home-page">
      <div className="home-page__glow" />

      <section className="home-card">
        <div className="home-card__badge">
          Audio + Lyrics + Motion
        </div>

        <h1 className="home-card__title">
          Lyric Lab
        </h1>

        <p className="home-card__description">
          Synchronize lyrics, design animated visuals,
          and build music videos from one focused workspace.
        </p>

        <div className="home-card__actions">
          <Button onClick={onCreateProject}>
            New Project
          </Button>

          <Button variant="secondary" disabled>
            Open Project
          </Button>
        </div>

        <p className="home-card__status">
          Version 0.1 — Project foundation
        </p>
      </section>
    </main>
  );
}

export default HomePage;