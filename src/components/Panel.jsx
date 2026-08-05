function Panel({
  title,
  children,
  className = "",
  actions = null,
}) {
  const panelClasses = ["panel", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={panelClasses}>
      {(title || actions) && (
        <header className="panel__header">
          <h2 className="panel__title">{title}</h2>

          {actions && (
            <div className="panel__actions">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className="panel__content">
        {children}
      </div>
    </section>
  );
}

export default Panel;