import { useState, useEffect } from "react";
import {
  getApps,
  createAppApi,
  addVersionApi,
  deleteAppApi,
  updateVersionApi,
  deleteVersionApi,
} from "./api/apps.api";
import { appSchema, versionSchema, getErrorMessage } from "./utils/validation";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import {
  CreateAppModal,
  AddVersionModal,
  DeleteAppModal,
} from "./components/Modals";

export default function App() {
  const [apps, setApps] = useState<any[]>([]);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // MODALS
  const [showAppModal, setShowAppModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // APP FIELDS
  const [appName, setAppName] = useState("");
  const [appUrl, setAppUrl] = useState("");

  // ERROR STATES
  const [appErrors, setAppErrors] = useState<{ name?: string; url?: string }>({});
  const [versionErrors, setVersionErrors] = useState<{ version?: string; url?: string }>({});
  const [editVersionErrors, setEditVersionErrors] = useState<{ version?: string; url?: string }>({});

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  // VERSION FIELDS
  const [versionName, setVersionName] = useState("");
  const [versionUrl, setVersionUrl] = useState("");

  // EDIT VERSION
  const [editVersion, setEditVersion] = useState<{
    appId: string;
    index: number;
  } | null>(null);

  const [editVersionName, setEditVersionName] = useState("");
  const [editVersionUrl, setEditVersionUrl] = useState("");

  // --------------------
  // FETCH APPS
  // --------------------
  const fetchApps = async () => {
    const data = await getApps();
    setApps(data);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // --------------------
  // CLICK OUTSIDE HANDLER
  // --------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".app-card") ||
        target.closest(".version-panel") ||
        target.closest(".modal")
      ) {
        return;
      }
      setExpandedAppId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --------------------
  // HANDLERS
  // --------------------
  const handleToggleApp = (id: string) => {
    setExpandedAppId((prev) => (prev === id ? null : id));
  };

  const handleCreateApp = async () => {
    const result = appSchema.safeParse({ name: appName, url: appUrl, version: "" });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setAppErrors({ name: fieldErrors.name?.[0], url: fieldErrors.url?.[0] });
      return;
    }
    setAppErrors({});
    try {
      await createAppApi({ name: appName, url: appUrl, version: "1.0.0" });
      await fetchApps();
      setShowAppModal(false);
      setAppName("");
      setAppUrl("");
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to create app");
      setAppErrors({ name: msg, url: "" });
    }
  };

  const handleAddVersion = async () => {
    const result = versionSchema.safeParse({ version: versionName, url: versionUrl });
    if (!result.success || !selectedAppId) {
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setVersionErrors({ version: fieldErrors.version?.[0], url: fieldErrors.url?.[0] });
      }
      return;
    }
    setVersionErrors({});
    try {
      await addVersionApi(selectedAppId, { version: versionName, url: versionUrl, size: 100 });
      await fetchApps();
      setShowVersionModal(false);
      setVersionName("");
      setVersionUrl("");
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to add version");
      setVersionErrors({ version: msg });
    }
  };

  const handleDeleteVersion = async (appId: string, index: number) => {
    const confirmDelete = window.confirm("Delete this version?");
    if (!confirmDelete) return;
    try {
      await deleteVersionApi(appId, index);
      await fetchApps();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete version.");
    }
  };

  const handleDeleteApp = async () => {
    if (!deleteAppId) return;
    try {
      await deleteAppApi(deleteAppId);
      setApps((prev) => prev.filter((app) => app._id !== deleteAppId));
      setShowDeleteModal(false);
      setDeleteAppId(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete app.");
    }
  };

  const handleSaveEditVersion = async () => {
    if (!editVersion) return;
    const result = versionSchema.safeParse({ version: editVersionName, url: editVersionUrl });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setEditVersionErrors({ version: fieldErrors.version?.[0], url: fieldErrors.url?.[0] });
      return;
    }
    setEditVersionErrors({});
    try {
      await updateVersionApi(editVersion.appId, editVersion.index, {
        version: editVersionName,
        url: editVersionUrl,
        size: 100,
      });
      await fetchApps();
      setEditVersion(null);
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to update version");
      setEditVersionErrors({ version: msg });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />

      <Dashboard
        apps={apps}
        expandedAppId={expandedAppId}
        onToggleApp={handleToggleApp}
        onNewApp={() => {
          setAppErrors({});
          setShowAppModal(true);
        }}
        onDeleteApp={(id) => {
          setDeleteAppId(id);
          setShowDeleteModal(true);
        }}
        editVersion={editVersion}
        editVersionName={editVersionName}
        editVersionUrl={editVersionUrl}
        editVersionErrors={editVersionErrors}
        onSaveEdit={handleSaveEditVersion}
        onCancelEdit={() => {
          setEditVersion(null);
          setEditVersionErrors({});
        }}
        onEditChangeName={(val) => {
          setEditVersionName(val);
          if (editVersionErrors.version) setEditVersionErrors({ ...editVersionErrors, version: undefined });
        }}
        onEditChangeUrl={(val) => {
          setEditVersionUrl(val);
          if (editVersionErrors.url) setEditVersionErrors({ ...editVersionErrors, url: undefined });
        }}
        onDeleteVersion={handleDeleteVersion}
        onClickSetEditVersion={(appId, index) => {
          setEditVersion({ appId, index });
          setEditVersionErrors({});
          // Find the version to pre-fill
          const app = apps.find(a => a._id === appId);
          if(app && app.versions[index]) {
             setEditVersionName(app.versions[index].version);
             setEditVersionUrl(app.versions[index].url);
          }
        }}
        onAddVersion={(appId) => {
          setSelectedAppId(appId);
          setVersionErrors({});
          setShowVersionModal(true);
        }}
      />

      {/* MODALS */}
      <CreateAppModal
        isOpen={showAppModal}
        onClose={() => setShowAppModal(false)}
        onSubmit={handleCreateApp}
        appName={appName}
        setAppName={setAppName}
        appUrl={appUrl}
        setAppUrl={setAppUrl}
        appErrors={appErrors}
        setAppErrors={setAppErrors}
      />

      <AddVersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        onSubmit={handleAddVersion}
        versionName={versionName}
        setVersionName={setVersionName}
        versionUrl={versionUrl}
        setVersionUrl={setVersionUrl}
        versionErrors={versionErrors}
        setVersionErrors={setVersionErrors}
      />

      <DeleteAppModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteApp}
      />
    </div>
  );
}