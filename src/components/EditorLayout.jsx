import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function EditorLayout({
  projectTitle,
  activeSection,
  onSectionChange,
  onReturnHome,
  onExport,
  children,
}) {
  return (
    <div className="editor">
      <Topbar
        projectTitle={projectTitle}
        onReturnHome={onReturnHome}
        onExport={onExport}
      />

      <div className="editor__body">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        <main className="editor__workspace">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EditorLayout;