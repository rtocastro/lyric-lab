import { useState } from "react";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import "./App.css";

function App() {
  const [currentProject, setCurrentProject] = useState(null);

  const handleCreateProject = () => {
    const newProject = {
      id: crypto.randomUUID(),
      title: "Untitled Project",
      artist: "",
      audioFile: null,
      lyrics: [],
      createdAt: new Date().toISOString(),
    };

    setCurrentProject(newProject);
  };

  const handleReturnHome = () => {
    setCurrentProject(null);
  };

  return (
    <div className="app">
      {currentProject ? (
        <EditorPage
          project={currentProject}
          onProjectChange={setCurrentProject}
          onReturnHome={handleReturnHome}
        />
      ) : (
        <HomePage onCreateProject={handleCreateProject} />
      )}
    </div>
  );
}

export default App;