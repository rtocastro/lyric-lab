import { useState } from "react";
import EditorLayout from "../components/EditorLayout";
import Panel from "../components/Panel";
import AudioPanel from "../features/audio/AudioPanel";
import LyricPanel from "../features/lyrics/LyricPanel";

function EditorPage({
  project,
  onProjectChange,
  onReturnHome,
}) {
  const [activeSection, setActiveSection] =
    useState("project");

  const handleTitleChange = (event) => {
    onProjectChange({
      ...project,
      title: event.target.value,
    });
  };

  const handleArtistChange = (event) => {
    onProjectChange({
      ...project,
      artist: event.target.value,
    });
  };

  const handleAudioChange = (audioFile) => {
    onProjectChange({
      ...project,
      audioFile,
    });
  };

  const handleLyricsChange = (lyrics) => {
    onProjectChange({
      ...project,
      lyrics,
    });
  };

  const renderActivePanel = () => {
    if (activeSection === "audio") {
      return (
        <AudioPanel
          audioFile={project.audioFile}
          onAudioChange={handleAudioChange}
        />
      );
    }

    if (activeSection === "lyrics") {
      return (
        <LyricPanel
          lyrics={project.lyrics}
          onLyricsChange={handleLyricsChange}
        />
      );
    }

    return (
      <Panel title="Preview">
        <div className="preview">
          <div className="preview__canvas">
            <span className="preview__eyebrow">
              Video Preview
            </span>

            <strong className="preview__lyric">
              {project.lyrics.length > 0
                ? project.lyrics[0].text
                : "Your lyrics will appear here"}
            </strong>
          </div>
        </div>
      </Panel>
    );
  };

  return (
    <EditorLayout
      projectTitle={project.title}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onReturnHome={onReturnHome}
    >
      <div className="editor-grid">
        <section className="editor-grid__main">
          {renderActivePanel()}
        </section>

        <aside className="editor-grid__inspector">
          <Panel title="Project Settings">
            <div className="form-group">
              <label htmlFor="project-title">
                Project title
              </label>

              <input
                id="project-title"
                type="text"
                value={project.title}
                onChange={handleTitleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="artist-name">
                Artist
              </label>

              <input
                id="artist-name"
                type="text"
                value={project.artist}
                onChange={handleArtistChange}
                placeholder="Artist or band name"
              />
            </div>

            <div className="project-summary">
              <span>Active section</span>

              <strong>{activeSection}</strong>
            </div>

            <div className="project-summary">
              <span>Audio</span>

              <strong>
                {project.audioFile
                  ? project.audioFile.name
                  : "Not imported"}
              </strong>
            </div>

            <div className="project-summary">
              <span>Lyrics</span>

              <strong>
                {project.lyrics.length > 0
                  ? `${project.lyrics.length} lines`
                  : "Not imported"}
              </strong>
            </div>
          </Panel>
        </aside>

        <section className="editor-grid__timeline">
          <Panel title="Timeline">
            <div className="timeline-placeholder">
              <span>00:00</span>

              <div className="timeline-placeholder__track">
                <div className="timeline-placeholder__playhead" />
              </div>

              <span>00:00</span>
            </div>
          </Panel>
        </section>
      </div>
    </EditorLayout>
  );
}

export default EditorPage;