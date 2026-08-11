import { useEffect, useRef, useState } from "react";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import {
  hasSavedProject,
  loadSavedProject,
  saveProjectAudio,
  saveProjectBackgroundImage,
  saveProjectMetadata,
  saveProjectBackgroundVideo,
} from "./utils/projectStorage";
import "./App.css";

function createNewProject() {
  return {
    id: crypto.randomUUID(),
    title: "Untitled Project",
    artist: "",
    audioFile: null,
    lyrics: [],

    style: {
      fontFamily: "Montserrat",
      fontSize: 72,
      color: "#FFFFFF",
      outlineColor: "#000000",
      outlineWidth: 2,
      shadow: true,
      glow: false,
      position: "bottom",
    },
    animation: {
      intro: "fade",
      introDuration: 0.3,
      outro: "fade",
      outroDuration: 0.3,
    },
    visuals: {
      backgroundType: "color",
      backgroundColor: "#000000",
      backgroundImage: null,
      backgroundVideo: null,
      fit: "cover",
      position: "center",
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function App() {
  const [currentProject, setCurrentProject] =
    useState(null);

  const [isRestoringProject, setIsRestoringProject] =
    useState(true);

  const [savedProjectAvailable, setSavedProjectAvailable] =
    useState(() => hasSavedProject());

  const previousAudioFileRef = useRef(null);
  const previousProjectIdRef = useRef(null);


  useEffect(() => {
    if (!currentProject || isRestoringProject) {
      return;
    }

    saveProjectBackgroundImage(
      currentProject.id,
      currentProject.visuals?.backgroundImage ?? null
    ).catch((error) => {
      console.error(
        "Lyric Lab could not autosave the background image:",
        error
      );
    });
  }, [
    currentProject?.id,
    currentProject?.visuals?.backgroundImage,
    isRestoringProject,
  ]);

  useEffect(() => {
    if (!currentProject || isRestoringProject) {
        return;
    }

    saveProjectBackgroundVideo(
        currentProject.id,
        currentProject.visuals?.backgroundVideo ?? null
    ).catch((error) => {
        console.error(
            "Lyric Lab could not autosave the background video:",
            error
        );
    });
}, [
    currentProject?.id,
    currentProject?.visuals?.backgroundVideo,
    isRestoringProject,
]);


  useEffect(() => {
    let isCancelled = false;

    const restoreProject = async () => {
      const savedProject = await loadSavedProject();

      if (!isCancelled && savedProject) {
        setCurrentProject(savedProject);

        previousAudioFileRef.current =
          savedProject.audioFile;

        previousProjectIdRef.current =
          savedProject.id;
      }

      if (!isCancelled) {
        setIsRestoringProject(false);
      }
    };

    restoreProject();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentProject || isRestoringProject) {
      return;
    }

    saveProjectMetadata(currentProject);
    setSavedProjectAvailable(true);
  }, [currentProject, isRestoringProject]);

  useEffect(() => {
    if (!currentProject || isRestoringProject) {
      return;
    }

    const audioFileChanged =
      previousAudioFileRef.current !==
      currentProject.audioFile;

    const projectChanged =
      previousProjectIdRef.current !==
      currentProject.id;

    if (!audioFileChanged && !projectChanged) {
      return;
    }

    previousAudioFileRef.current =
      currentProject.audioFile;

    previousProjectIdRef.current =
      currentProject.id;

    saveProjectAudio(
      currentProject.id,
      currentProject.audioFile
    ).catch((error) => {
      console.error(
        "Lyric Lab could not autosave the audio file:",
        error
      );
    });
  }, [
    currentProject?.audioFile,
    currentProject?.id,
    isRestoringProject,
  ]);

  const handleCreateProject = () => {
    const newProject = createNewProject();

    previousAudioFileRef.current = null;
    previousProjectIdRef.current = newProject.id;

    setCurrentProject(newProject);
  };

  const handleResumeProject = async () => {
    setIsRestoringProject(true);

    const savedProject = await loadSavedProject();

    if (savedProject) {
      previousAudioFileRef.current =
        savedProject.audioFile;

      previousProjectIdRef.current =
        savedProject.id;

      setCurrentProject(savedProject);
    }

    setIsRestoringProject(false);
  };

  const handleReturnHome = () => {
    setCurrentProject(null);
    setSavedProjectAvailable(hasSavedProject());
  };

  if (isRestoringProject) {
    return (
      <div className="app">
        <main className="home-page">
          <div className="home-page__glow" />

          <section className="home-card">
            <div className="home-card__badge">
              Project Storage
            </div>

            <h1 className="home-card__title">
              Lyric Lab
            </h1>

            <p className="home-card__description">
              Restoring your latest project…
            </p>

            <p className="home-card__status">
              Loading lyrics, timestamps, and audio
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {currentProject ? (
        <EditorPage
          project={currentProject}
          onProjectChange={setCurrentProject}
          onReturnHome={handleReturnHome}
        />
      ) : (
        <HomePage
          hasSavedProject={savedProjectAvailable}
          onCreateProject={handleCreateProject}
          onResumeProject={handleResumeProject}
        />
      )}
    </div>
  );
}

export default App;