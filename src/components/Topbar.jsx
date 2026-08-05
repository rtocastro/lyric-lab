import Button from "./Button";

function Topbar({
  projectTitle,
  onReturnHome,
}) {
  return (
    <header className="topbar">
      <button
        className="topbar__brand"
        type="button"
        onClick={onReturnHome}
      >
        <span className="topbar__brand-mark">
          LL
        </span>

        <span>Lyric Lab</span>
      </button>

      <div className="topbar__project">
        <span className="topbar__project-label">
          Project
        </span>

        <span className="topbar__project-title">
          {projectTitle}
        </span>
      </div>

      <div className="topbar__actions">
        <Button variant="secondary" disabled>
          Save
        </Button>

        <Button disabled>
          Export
        </Button>
      </div>
    </header>
  );
}

export default Topbar;