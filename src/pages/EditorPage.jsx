import { useCallback, useState } from "react";
import EditorLayout from "../components/EditorLayout";
import Panel from "../components/Panel";
import AudioPanel from "../features/audio/AudioPanel";
import useAudioTransport from "../features/audio/useAudioTransport";
import LyricPanel from "../features/lyrics/LyricPanel";

function EditorPage({
  project,
  onProjectChange,
  onReturnHome,
}) {
  const [activeSection, setActiveSection] =
    useState("project");

  const audioTransport = useAudioTransport(
    project.audioFile
  );

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

  const handleLyricsChange = useCallback(
    (lyrics) => {
      onProjectChange((currentProject) => ({
        ...currentProject,
        lyrics,
      }));
    },
    [onProjectChange]
  );

  const renderActivePanel = () => {
    if (activeSection === "audio") {
      return (
        <AudioPanel
          audioFile={project.audioFile}
          audioUrl={audioTransport.audioUrl}
          isPlaying={audioTransport.isPlaying}
          currentTime={audioTransport.currentTime}
          duration={audioTransport.duration}
          errorMessage={audioTransport.errorMessage}
          onAudioChange={handleAudioChange}
          onTogglePlayback={audioTransport.togglePlayback}
          onSeek={audioTransport.seek}
          onResetPlayback={audioTransport.reset}
          onClearError={audioTransport.setErrorMessage}
        />
      );
    }

    if (activeSection === "lyrics") {
      return (
        <LyricPanel
          lyrics={project.lyrics}
          currentTime={audioTransport.currentTime}
          duration={audioTransport.duration}
          isPlaying={audioTransport.isPlaying}
          hasAudio={Boolean(project.audioFile)}
          onLyricsChange={handleLyricsChange}
          onTogglePlayback={audioTransport.togglePlayback}
          onSeek={audioTransport.seek}
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
      {audioTransport.audioElement}

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

            <div className="project-summary">
              <span>Playback</span>

              <strong>
                {audioTransport.isPlaying
                  ? "Playing"
                  : "Paused"}
              </strong>
            </div>
          </Panel>
        </aside>

        <section className="editor-grid__timeline">
          <Panel title="Timeline">
            <div className="timeline-placeholder">
              <span>00:00</span>

              <div className="timeline-placeholder__track">
                <div
                  className="timeline-placeholder__playhead"
                  style={{
                    left:
                      audioTransport.duration > 0
                        ? `${Math.min(
                            (audioTransport.currentTime /
                              audioTransport.duration) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              <span>
                {Math.floor(audioTransport.duration / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor(audioTransport.duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
          </Panel>
        </section>
      </div>
    </EditorLayout>
  );
}

export default EditorPage;