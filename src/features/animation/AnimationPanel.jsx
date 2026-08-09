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
  animation,
  onAnimationChange,
}) {
  const currentAnimation = {
    intro: "fade",
    introDuration: 0.3,
    outro: "fade",
    outroDuration: 0.3,
    ...animation,
  };

  const updateAnimation = (property, value) => {
    onAnimationChange({
      [property]: value,
    });
  };

  return (
    <Panel title="Animation">
      <div className="animation-panel">
        <section className="animation-panel__section">
          <div className="animation-panel__heading">
            <span>Intro</span>
            <strong>Global</strong>
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
              {INTRO_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="animation-panel__label-row">
              <label htmlFor="animation-intro-duration">
                Duration
              </label>

              <strong>
                {currentAnimation.introDuration.toFixed(2)}s
              </strong>
            </div>

            <input
              id="animation-intro-duration"
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={currentAnimation.introDuration}
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
              {OUTRO_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="animation-panel__label-row">
              <label htmlFor="animation-outro-duration">
                Duration
              </label>

              <strong>
                {currentAnimation.outroDuration.toFixed(2)}s
              </strong>
            </div>

            <input
              id="animation-outro-duration"
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={currentAnimation.outroDuration}
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