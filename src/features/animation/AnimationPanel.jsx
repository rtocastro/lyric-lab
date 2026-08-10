import { useState } from "react";
import Panel from "../../components/Panel";

const INTRO_OPTIONS = [
  ["none", "None"],
  ["fade", "Fade"],
  ["pop", "Pop"],
  ["zoom", "Zoom"],
  ["slide-up", "Slide Up"],
  ["slide-down", "Slide Down"],
  ["slide-left", "Slide Left"],
  ["slide-right", "Slide Right"],
  ["blur", "Blur In"],
];

const OUTRO_OPTIONS = [
  ["none", "None"],
  ["fade", "Fade"],
  ["shrink", "Shrink"],
  ["blur", "Blur Out"],
  ["slide-left", "Slide Left"],
  ["slide-right", "Slide Right"],
];

function AnimationPanel({
  globalAnimation,
  selectedAnimation,
  selectedCount,
  onGlobalAnimationChange,
  onSelectedAnimationChange,
}) {
  const [scope, setScope] = useState("global");

  const defaultAnimation = {
    intro: "fade",
    introDuration: 0.3,
    outro: "fade",
    outroDuration: 0.3,
  };

  const currentAnimation =
    scope === "selected"
      ? {
          ...defaultAnimation,
          ...globalAnimation,
          ...selectedAnimation,
        }
      : {
          ...defaultAnimation,
          ...globalAnimation,
        };

  const updateAnimation = (property, value) => {
    const updates = {
      [property]: value,
    };

    if (scope === "selected") {
      onSelectedAnimationChange(updates);
      return;
    }

    onGlobalAnimationChange(updates);
  };

  const selectedModeDisabled =
    selectedCount === 0;

  return (
    <Panel title="Animation">
      <div className="animation-panel">
        <section className="animation-panel__section">
          <div className="animation-panel__heading">
            <span>Animation Scope</span>
          </div>

          <div className="animation-panel__scope">
            <button
              type="button"
              className={
                scope === "global"
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setScope("global")
              }
            >
              Global
            </button>

            <button
              type="button"
              className={
                scope === "selected"
                  ? "is-active"
                  : ""
              }
              disabled={selectedModeDisabled}
              onClick={() =>
                setScope("selected")
              }
            >
              Selected Lyrics
            </button>
          </div>

          <div className="animation-panel__scope-status">
            {scope === "global" ? (
              <span>
                Applies to all lyrics unless
                overridden.
              </span>
            ) : (
              <span>
                Editing {selectedCount}{" "}
                {selectedCount === 1
                  ? "lyric"
                  : "lyrics"}
              </span>
            )}
          </div>
        </section>

        <section className="animation-panel__section">
          <div className="animation-panel__heading">
            <span>Intro</span>

            <strong>
              {scope === "global"
                ? "Global"
                : "Selection"}
            </strong>
          </div>

          <div className="form-group">
            <label htmlFor="animation-intro">
              Animation
            </label>

            <select
              id="animation-intro"
              value={currentAnimation.intro}
              onChange={(event) =>
                updateAnimation(
                  "intro",
                  event.target.value
                )
              }
            >
              {INTRO_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <div className="animation-panel__label-row">
              <label htmlFor="animation-intro-duration">
                Duration
              </label>

              <strong>
                {currentAnimation.introDuration.toFixed(
                  2
                )}
                s
              </strong>
            </div>

            <input
              id="animation-intro-duration"
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={
                currentAnimation.introDuration
              }
              onChange={(event) =>
                updateAnimation(
                  "introDuration",
                  Number(event.target.value)
                )
              }
            />
          </div>
        </section>

        <section className="animation-panel__section">
          <div className="animation-panel__heading">
            <span>Outro</span>

            <strong>
              {scope === "global"
                ? "Global"
                : "Selection"}
            </strong>
          </div>

          <div className="form-group">
            <label htmlFor="animation-outro">
              Animation
            </label>

            <select
              id="animation-outro"
              value={currentAnimation.outro}
              onChange={(event) =>
                updateAnimation(
                  "outro",
                  event.target.value
                )
              }
            >
              {OUTRO_OPTIONS.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <div className="animation-panel__label-row">
              <label htmlFor="animation-outro-duration">
                Duration
              </label>

              <strong>
                {currentAnimation.outroDuration.toFixed(
                  2
                )}
                s
              </strong>
            </div>

            <input
              id="animation-outro-duration"
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={
                currentAnimation.outroDuration
              }
              onChange={(event) =>
                updateAnimation(
                  "outroDuration",
                  Number(event.target.value)
                )
              }
            />
          </div>
        </section>
      </div>
    </Panel>
  );
}

export default AnimationPanel;