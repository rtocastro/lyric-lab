import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function EditorLayout({
  projectTitle,
  activeSection,
  onSectionChange,
  onReturnHome,
  children,
}) {
  return (
    <div className="editor">
      <Topbar
        projectTitle={projectTitle}
        onReturnHome={onReturnHome}
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