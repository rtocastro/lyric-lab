import Panel from "../../components/Panel";

function VisualsPanel({
    visuals,
    onVisualsChange,
    preview,
}) {
    const currentVisuals = {
        backgroundType: "color",
        backgroundColor: "#000000",
        backgroundImage: null,
        backgroundVideo: null,
        fit: "cover",
        position: "center",
        ...visuals,
    };

    const updateVisuals = (property, value) => {
        onVisualsChange({
            [property]: value,
        });
    };

    return (
        <Panel title="Visuals">
            <div className="visuals-panel">
                <div className="visuals-panel__preview">
                    {preview}
                </div>
                <section className="visuals-panel__section">
                    <div className="visuals-panel__heading">
                        <span>Background</span>
                        <strong>Global</strong>
                    </div>

                    <div className="form-group">
                        <label>Background Type</label>

                        <div className="visuals-panel__segmented">
                            <button
                                type="button"
                                className={
                                    currentVisuals.backgroundType ===
                                        "color"
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    updateVisuals(
                                        "backgroundType",
                                        "color"
                                    )
                                }
                            >
                                Color
                            </button>

                            <button
                                type="button"
                                disabled
                            >
                                Image
                            </button>

                            <button
                                type="button"
                                disabled
                            >
                                Video
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="visuals-background-color">
                            Background Color
                        </label>

                        <div className="visuals-panel__color-row">
                            <input
                                id="visuals-background-color"
                                type="color"
                                value={
                                    currentVisuals.backgroundColor
                                }
                                onChange={(event) =>
                                    updateVisuals(
                                        "backgroundColor",
                                        event.target.value
                                    )
                                }
                            />

                            <span>
                                {currentVisuals.backgroundColor}
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </Panel>
    );
}

export default VisualsPanel;