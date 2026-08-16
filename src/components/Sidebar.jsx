const sidebarItems = [
    {
        id: "project",
        icon: "◆",
        label: "Project",
    },
    {
        id: "lyrics",
        icon: "T",
        label: "Lyrics",
    },
    {
        id: "audio",
        icon: "♪",
        label: "Audio",
    },
    {
        id: "style",
        icon: "✎",
        label: "Style",
    },
    {
        id: "animation",
        icon: "✦",
        label: "Animation",
    },
    {
        id: "visuals",
        icon: "◉",
        label: "Visuals",
    },
];

function Sidebar({
    activeSection,
    onSectionChange,
}) {
    return (
        <aside className="sidebar">
            <nav
                className="sidebar__navigation"
                aria-label="Editor sections"
            >
                {sidebarItems.map((item) => {
                    const isActive =
                        activeSection === item.id;

                    return (
                        <button
                            className={`sidebar__item ${isActive
                                ? "sidebar__item--active"
                                : ""
                                }`}
                            type="button"
                            key={item.id}
                            onClick={() =>
                                onSectionChange(item.id)
                            }
                        >
                            <span className="sidebar__icon">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;