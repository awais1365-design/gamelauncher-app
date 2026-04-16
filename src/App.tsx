import { useEffect, useState } from "react";

// Fix typing for Electron
declare global {
  interface Window {
    require: any;
  }
}

const { ipcRenderer } = window.require("electron");

type AppData = {
  id: string;
  name: string;
  path: string;
  version: string;
};

const App = () => {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("Waiting...");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [installedApp, setInstalledApp] = useState<AppData | null>(null);
  const [latestVersion, setLatestVersion] = useState<string>("3.0.0"); // Mock latest version
  const [installedAppsList, setInstalledAppsList] = useState<AppData[]>([]);

  /* =========================
     DOWNLOAD
  ========================= */
  const handleDownload = () => {
    setProgress(0);
    setStatus("Starting download...");
    ipcRenderer.send("download-file");
  };

  /* =========================
     INSTALL
  ========================= */
  const handleInstall = async () => {
    if (!filePath) return;

    setStatus("Installing...");
    try {
      const installDir = await ipcRenderer.invoke("install-app", filePath);
      setInstalledApp({
        id: "",
        name: filePath.split("/").pop() || "App",
        path: installDir,
        version: "1.0.0",
      });
      setStatus("Installed successfully!");
      fetchInstalledApps(); // Refresh list
    } catch (err) {
      console.error(err);
      setStatus("Install failed");
    }
  };

  /* =========================
     UPDATE
  ========================= */
  const handleUpdate = async () => {
    if (!installedApp) return;

    setStatus("Updating...");
    try {
      // Re-download file
      setProgress(0);
      ipcRenderer.send("download-file");

      ipcRenderer.once("download-complete", async (_: any, data: any) => {
        if (!data.success) {
          setStatus("Update failed");
          return;
        }
        // Install new version
        const installDir = await ipcRenderer.invoke("install-app", data.path);

        // Update backend
        await fetch(`http://localhost:3000/apps/${installedApp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: latestVersion }),
        });

        setInstalledApp({ ...installedApp, version: latestVersion, path: installDir });
        setStatus("Update completed!");
        fetchInstalledApps();
      });
    } catch (err) {
      console.error(err);
      setStatus("Update failed");
    }
  };

  /* =========================
     PLAY
  ========================= */
  const handlePlay = () => {
    if (!installedApp) return;
    ipcRenderer.invoke("run-app", installedApp.path);
  };

  /* =========================
     EVENTS
  ========================= */
  useEffect(() => {
    const progressHandler = (_: any, percent: number) => {
      setProgress(percent);
      setStatus(`Downloading: ${percent}%`);
    };

    const completeHandler = (_: any, data: any) => {
      if (data.success) {
        setProgress(100);
        setStatus("Download completed!");
        setFilePath(data.path);
      } else {
        setStatus("Download failed or cancelled");
      }
    };

    ipcRenderer.on("download-progress", progressHandler);
    ipcRenderer.on("download-complete", completeHandler);

    return () => {
      ipcRenderer.removeListener("download-progress", progressHandler);
      ipcRenderer.removeListener("download-complete", completeHandler);
    };
  }, []);

  /* =========================
     FETCH INSTALLED APPS
  ========================= */
  const fetchInstalledApps = () => {
    fetch("http://localhost:3000/apps")
      .then((res) => res.json())
      .then((data: AppData[]) => {
        setInstalledAppsList(data);
        if (data.length > 0) setInstalledApp(data[0]); // Simplified: take first app
      })
      .catch((err) => console.error("Failed to fetch apps:", err));
  };

  useEffect(() => {
    fetchInstalledApps();
  }, []);

  const showUpdate = installedApp && installedApp.version !== latestVersion;

  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <h1>Game Launcher</h1>

      {!installedApp && !filePath && <button onClick={handleDownload}>Download</button>}

      {filePath && !installedApp && <button onClick={handleInstall}>Install</button>}

      {installedApp && !showUpdate && <button onClick={handlePlay}>Play</button>}

      {showUpdate && <button onClick={handleUpdate}>Update to {latestVersion}</button>}

      <div
        style={{
          width: 300,
          height: 20,
          background: "#ccc",
          margin: "20px auto",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "green",
          }}
        />
      </div>

      <p>{status}</p>

      {installedApp && (
        <p>
          Installed Version: {installedApp.version} | Latest Version: {latestVersion}
        </p>
      )}
    </div>
  );
};

export default App;
