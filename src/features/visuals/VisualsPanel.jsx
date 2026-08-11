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
                                className={
                                    currentVisuals.backgroundType === "image"
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    updateVisuals(
                                        "backgroundType",
                                        "image"
                                    )
                                }
                            >
                                Image
                            </button>

                            <button
                                type="button"
                                className={
                                    currentVisuals.backgroundType === "video"
                                        ? "is-active"
                                        : ""
                                }
                                onClick={() =>
                                    updateVisuals(
                                        "backgroundType",
                                        "video"
                                    )
                                }
                            >
                                Video
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="visuals-background-color">
                            Background Color
                        </label>

                        {currentVisuals.backgroundType === "image" && (
                            <div className="form-group">
                                <label htmlFor="visuals-background-image">
                                    Background Image
                                </label>

                                <input
                                    id="visuals-background-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0];

                                        if (!file) {
                                            return;
                                        }

                                        updateVisuals(
                                            "backgroundImage",
                                            file
                                        );
                                    }}
                                />

                                {currentVisuals.backgroundImage && (
                                    <span className="visuals-panel__asset-name">
                                        {currentVisuals.backgroundImage.name}
                                    </span>
                                )}

                                <div className="form-group">
                                    <label>Image Fit</label>

                                    <div className="visuals-panel__segmented">
                                        <button
                                            type="button"
                                            className={
                                                currentVisuals.fit === "cover"
                                                    ? "is-active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                updateVisuals("fit", "cover")
                                            }
                                        >
                                            Cover
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                currentVisuals.fit === "contain"
                                                    ? "is-active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                updateVisuals("fit", "contain")
                                            }
                                        >
                                            Contain
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Image Position</label>

                                    <div className="visuals-panel__segmented">
                                        {[
                                            ["top", "Top"],
                                            ["center", "Center"],
                                            ["bottom", "Bottom"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={
                                                    currentVisuals.position === value
                                                        ? "is-active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    updateVisuals(
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
                            </div>
                        )}

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

                        {currentVisuals.backgroundType === "video" && (
                            <div className="form-group">
                                <label htmlFor="visuals-background-video">
                                    Background Video
                                </label>

                                <input
                                    id="visuals-background-video"
                                    type="file"
                                    accept="video/*"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0];

                                        if (!file) {
                                            return;
                                        }

                                        updateVisuals(
                                            "backgroundVideo",
                                            file
                                        );
                                    }}
                                />

                                {currentVisuals.backgroundVideo && (
                                    <span className="visuals-panel__asset-name">
                                        {currentVisuals.backgroundVideo.name}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </Panel>
    );
}

export default VisualsPanel;