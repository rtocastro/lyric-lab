import Button from "../components/Button";

function HomePage({
  hasSavedProject,
  onCreateProject,
  onResumeProject,
}) {
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

          <Button
            variant="secondary"
            onClick={onResumeProject}
            disabled={!hasSavedProject}
          >
            Resume Last Project
          </Button>
        </div>

        <p className="home-card__status">
          {hasSavedProject
            ? "Your latest project is saved locally"
            : "Version 0.1 — Project foundation"}
        </p>
      </section>
    </main>
  );
}

export default HomePage;