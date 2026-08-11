const PROJECT_STORAGE_KEY = "lyric-lab:last-project";

const DATABASE_NAME = "lyric-lab-database";
const DATABASE_VERSION = 1;
const ASSET_STORE_NAME = "project-assets";

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DATABASE_NAME,
            DATABASE_VERSION
        );

        request.onerror = () => {
            reject(
                request.error ??
                new Error("Could not open Lyric Lab storage.")
            );
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = () => {
            const database = request.result;

            if (
                !database.objectStoreNames.contains(
                    ASSET_STORE_NAME
                )
            ) {
                database.createObjectStore(
                    ASSET_STORE_NAME
                );
            }
        };
    });
}

function getAudioStorageKey(projectId) {
    return `audio:${projectId}`;
}

function getBackgroundImageStorageKey(projectId) {
    return `background-image:${projectId}`;
}

function getBackgroundVideoStorageKey(projectId) {
    return `background-video:${projectId}`;
}


export async function saveProjectBackgroundVideo(
    projectId,
    backgroundVideo
) {
    if (!projectId) {
        return;
    }

    const database = await openDatabase();

    await new Promise((resolve, reject) => {
        const transaction = database.transaction(
            ASSET_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            ASSET_STORE_NAME
        );

        const storageKey =
            getBackgroundVideoStorageKey(projectId);

        if (backgroundVideo) {
            store.put(
                backgroundVideo,
                storageKey
            );
        } else {
            store.delete(storageKey);
        }

        transaction.oncomplete = resolve;

        transaction.onerror = () => {
            reject(
                transaction.error ??
                new Error(
                    "Could not save the background video."
                )
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ??
                new Error(
                    "Background video storage was interrupted."
                )
            );
        };
    });

    database.close();
}

export function hasSavedProject() {
    return Boolean(
        localStorage.getItem(PROJECT_STORAGE_KEY)
    );
}

export function saveProjectMetadata(project) {
    if (!project) {
        return;
    }

    const visuals = {
        backgroundType: "color",
        backgroundColor: "#000000",
        backgroundImage: null,
        backgroundVideo: null,
        fit: "cover",
        position: "center",
        ...project.visuals,
    };

    const projectToSave = {
        ...project,

        // Binary files are stored separately in IndexedDB.
        audioFile: null,

        audioMetadata: project.audioFile
            ? {
                name: project.audioFile.name,
                size: project.audioFile.size,
                type: project.audioFile.type,
                lastModified:
                    project.audioFile.lastModified,
            }
            : null,

        visuals: {
            ...visuals,

            // Do not put the actual image File/Blob
            // into localStorage.
            backgroundImage: null,

            backgroundImageMetadata:
                visuals.backgroundImage
                    ? {
                        name:
                            visuals.backgroundImage.name ??
                            "Background image",
                        size:
                            visuals.backgroundImage.size,
                        type:
                            visuals.backgroundImage.type,
                        lastModified:
                            visuals.backgroundImage
                                .lastModified ?? null,
                    }
                    : null,

            // Future video files should also live in
            // IndexedDB rather than localStorage.
            backgroundVideo: null,
        },

        updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
        PROJECT_STORAGE_KEY,
        JSON.stringify(projectToSave)
    );
}


async function loadProjectBackgroundVideo(
    projectId
) {
    if (!projectId) {
        return null;
    }

    const database = await openDatabase();

    const backgroundVideo =
        await new Promise((resolve, reject) => {
            const transaction =
                database.transaction(
                    ASSET_STORE_NAME,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    ASSET_STORE_NAME
                );

            const request = store.get(
                getBackgroundVideoStorageKey(
                    projectId
                )
            );

            request.onsuccess = () => {
                resolve(
                    request.result ?? null
                );
            };

            request.onerror = () => {
                reject(
                    request.error ??
                    new Error(
                        "Could not restore the background video."
                    )
                );
            };
        });

    database.close();

    return backgroundVideo;
}

export async function saveProjectAudio(
    projectId,
    audioFile
) {
    if (!projectId) {
        return;
    }

    const database = await openDatabase();

    await new Promise((resolve, reject) => {
        const transaction = database.transaction(
            ASSET_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            ASSET_STORE_NAME
        );

        const storageKey =
            getAudioStorageKey(projectId);

        if (audioFile) {
            store.put(audioFile, storageKey);
        } else {
            store.delete(storageKey);
        }

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(
                transaction.error ??
                new Error(
                    "Could not save the audio file."
                )
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ??
                new Error(
                    "Audio storage was interrupted."
                )
            );
        };
    });

    database.close();
}

export async function saveProjectBackgroundImage(
    projectId,
    backgroundImage
) {
    if (!projectId) {
        return;
    }

    const database = await openDatabase();

    await new Promise((resolve, reject) => {
        const transaction = database.transaction(
            ASSET_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            ASSET_STORE_NAME
        );

        const storageKey =
            getBackgroundImageStorageKey(projectId);

        if (backgroundImage) {
            store.put(
                backgroundImage,
                storageKey
            );
        } else {
            store.delete(storageKey);
        }

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(
                transaction.error ??
                new Error(
                    "Could not save the background image."
                )
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ??
                new Error(
                    "Background image storage was interrupted."
                )
            );
        };
    });

    database.close();
}

async function loadProjectAudio(projectId) {
    if (!projectId) {
        return null;
    }

    const database = await openDatabase();

    const audioFile = await new Promise(
        (resolve, reject) => {
            const transaction =
                database.transaction(
                    ASSET_STORE_NAME,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    ASSET_STORE_NAME
                );

            const request = store.get(
                getAudioStorageKey(projectId)
            );

            request.onsuccess = () => {
                resolve(
                    request.result ?? null
                );
            };

            request.onerror = () => {
                reject(
                    request.error ??
                    new Error(
                        "Could not restore the audio file."
                    )
                );
            };
        }
    );

    database.close();

    return audioFile;
}

async function loadProjectBackgroundImage(
    projectId
) {
    if (!projectId) {
        return null;
    }

    const database = await openDatabase();

    const backgroundImage =
        await new Promise((resolve, reject) => {
            const transaction =
                database.transaction(
                    ASSET_STORE_NAME,
                    "readonly"
                );

            const store =
                transaction.objectStore(
                    ASSET_STORE_NAME
                );

            const request = store.get(
                getBackgroundImageStorageKey(
                    projectId
                )
            );

            request.onsuccess = () => {
                resolve(
                    request.result ?? null
                );
            };

            request.onerror = () => {
                reject(
                    request.error ??
                    new Error(
                        "Could not restore the background image."
                    )
                );
            };
        });

    database.close();

    return backgroundImage;
}

export async function loadSavedProject() {
    const savedProjectJson =
        localStorage.getItem(
            PROJECT_STORAGE_KEY
        );

    if (!savedProjectJson) {
        return null;
    }

    try {
        const savedProject =
            JSON.parse(savedProjectJson);

        const [
            audioFile,
            backgroundImage,
            backgroundVideo,
        ] = await Promise.all([
            loadProjectAudio(savedProject.id),
            loadProjectBackgroundImage(
                savedProject.id
            ),
            loadProjectBackgroundVideo(
                savedProject.id
            ),
        ]);

        return {
            ...savedProject,

            audioFile,

            lyrics: Array.isArray(
                savedProject.lyrics
            )
                ? savedProject.lyrics
                : [],

            style: savedProject.style ?? {
                fontFamily: "Montserrat",
                fontSize: 72,
                color: "#FFFFFF",
                outlineColor: "#000000",
                outlineWidth: 2,
                shadow: true,
                glow: false,
                position: "bottom",
            },

            animation:
                savedProject.animation ?? {
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
                ...(savedProject.visuals ?? {}),

                // Replace the metadata placeholder
                // with the real Blob/File from IndexedDB.
                backgroundImage,
                backgroundVideo,
            },
        };
    } catch (error) {
        console.error(
            "Lyric Lab could not restore the saved project:",
            error
        );

        return null;
    }
}

export async function deleteSavedProject() {
    const savedProjectJson =
        localStorage.getItem(
            PROJECT_STORAGE_KEY
        );

    localStorage.removeItem(
        PROJECT_STORAGE_KEY
    );

    if (!savedProjectJson) {
        return;
    }

    try {
        const savedProject =
            JSON.parse(savedProjectJson);

        if (!savedProject.id) {
            return;
        }

        const database = await openDatabase();

        await new Promise(
            (resolve, reject) => {
                const transaction =
                    database.transaction(
                        ASSET_STORE_NAME,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        ASSET_STORE_NAME
                    );

                store.delete(
                    getAudioStorageKey(
                        savedProject.id
                    )
                );

                store.delete(
                    getBackgroundImageStorageKey(
                        savedProject.id
                    )
                );

                transaction.oncomplete = () => {
                    resolve();
                };

                transaction.onerror = () => {
                    reject(
                        transaction.error ??
                        new Error(
                            "Could not delete the saved project assets."
                        )
                    );
                };
            }
        );

        database.close();
    } catch (error) {
        console.error(
            "Lyric Lab could not completely delete the project:",
            error
        );
    }
}