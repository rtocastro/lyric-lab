import Panel from "../../components/Panel";

const FONT_OPTIONS = [
  "Arial",
  "Arial Black",
  "Impact",
  "Georgia",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Montserrat",
];

function StylePanel({
  style,
  onStyleChange,
  preview,
}) {
  const currentStyle = {
    fontFamily: "Montserrat",
    fontSize: 72,
    color: "#FFFFFF",
    outlineColor: "#000000",
    outlineWidth: 2,
    shadow: true,
    glow: false,
    position: "center",
    textAlign: "center",
    ...style,
  };

  const updateStyle = (property, value) => {
    onStyleChange({
      [property]: value,
    });
  };

return (
  <Panel title="Style">
    <div className="style-workspace">
      <div className="style-workspace__preview">
        {preview}
      </div>

      <div className="style-panel">
        <section className="style-panel__section">
          <div className="style-panel__section-heading">
            <span>Typography</span>
            <strong>Global</strong>
          </div>

          <div className="form-group">
            <label htmlFor="style-font-family">
              Font
            </label>

            <select
              id="style-font-family"
              value={currentStyle.fontFamily}
              onChange={(event) =>
                updateStyle(
                  "fontFamily",
                  event.target.value
                )
              }
            >
              {FONT_OPTIONS.map((font) => (
                <option
                  key={font}
                  value={font}
                  style={{ fontFamily: font }}
                >
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="style-panel__label-row">
              <label htmlFor="style-font-size">
                Font Size
              </label>

              <strong>
                {currentStyle.fontSize}px
              </strong>
            </div>

            <div className="style-panel__range-row">
              <input
                id="style-font-size"
                type="range"
                min="20"
                max="180"
                step="1"
                value={currentStyle.fontSize}
                onChange={(event) =>
                  updateStyle(
                    "fontSize",
                    Number(event.target.value)
                  )
                }
              />

              <input
                className="style-panel__number"
                type="number"
                min="20"
                max="240"
                step="1"
                value={currentStyle.fontSize}
                onChange={(event) =>
                  updateStyle(
                    "fontSize",
                    Number(event.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="style-color">
              Text Color
            </label>

            <div className="style-panel__color-row">
              <input
                id="style-color"
                type="color"
                value={currentStyle.color}
                onChange={(event) =>
                  updateStyle(
                    "color",
                    event.target.value
                  )
                }
              />

              <span>{currentStyle.color}</span>
            </div>
          </div>
        </section>

        <section className="style-panel__section">
          <div className="style-panel__section-heading">
            <span>Edges + Light</span>
          </div>

          <div className="form-group">
            <div className="style-panel__label-row">
              <label htmlFor="style-outline-width">
                Outline
              </label>

              <strong>
                {currentStyle.outlineWidth}px
              </strong>
            </div>

            <input
              id="style-outline-width"
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={currentStyle.outlineWidth}
              onChange={(event) =>
                updateStyle(
                  "outlineWidth",
                  Number(event.target.value)
                )
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="style-outline-color">
              Outline Color
            </label>

            <div className="style-panel__color-row">
              <input
                id="style-outline-color"
                type="color"
                value={currentStyle.outlineColor}
                onChange={(event) =>
                  updateStyle(
                    "outlineColor",
                    event.target.value
                  )
                }
              />

              <span>
                {currentStyle.outlineColor}
              </span>
            </div>
          </div>

          <div className="style-panel__toggles">
            <label className="style-panel__toggle">
              <input
                type="checkbox"
                checked={currentStyle.shadow}
                onChange={(event) =>
                  updateStyle(
                    "shadow",
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>Shadow</strong>
                <span>
                  Add depth behind the lyrics
                </span>
              </div>
            </label>

            <label className="style-panel__toggle">
              <input
                type="checkbox"
                checked={currentStyle.glow}
                onChange={(event) =>
                  updateStyle(
                    "glow",
                    event.target.checked
                  )
                }
              />

              <div>
                <strong>Glow</strong>
                <span>
                  Glow using the text color
                </span>
              </div>
            </label>
          </div>
        </section>

        <section className="style-panel__section">
          <div className="style-panel__section-heading">
            <span>Placement</span>
          </div>

          <div className="form-group">
            <label>Vertical Position</label>

            <div className="style-panel__segmented">
              {[
                ["top", "Top"],
                ["center", "Center"],
                ["bottom", "Bottom"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    currentStyle.position === value
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    updateStyle(
                      "position",
                      value
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Text Alignment</label>

            <div className="style-panel__segmented">
              {[
                ["left", "Left"],
                ["center", "Center"],
                ["right", "Right"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    currentStyle.textAlign === value
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    updateStyle(
                      "textAlign",
                      value
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  </Panel>
);
}

export default StylePanel;