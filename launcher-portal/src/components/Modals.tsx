import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Base Modal Wrapper
export const ModalWrapper = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};



// --------------------
// CREATE APP MODAL
// --------------------
export const CreateAppModal = ({
  isOpen,
  onClose,
  onSubmit,
  appName,
  setAppName,
  appUrl,
  setAppUrl,
  appErrors,
  setAppErrors,
}: any) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Create New App</h2>
      
      <div className="mb-3">
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500"
          placeholder="App name"
          value={appName}
          onChange={(e) => {
            setAppName(e.target.value);
            if (appErrors.name) setAppErrors({ ...appErrors, name: undefined });
          }}
        />
        {appErrors.name && (
          <p className="text-red-500 text-xs mt-1">{appErrors.name}</p>
        )}
      </div>

      <div className="mb-6">
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-green-500"
          placeholder="www.example.com"
          value={appUrl}
          onChange={(e) => {
            setAppUrl(e.target.value);
            if (appErrors.url) setAppErrors({ ...appErrors, url: undefined });
          }}
        />
        {appErrors.url && (
          <p className="text-red-500 text-xs mt-1">{appErrors.url}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            onClose();
            setAppErrors({});
          }}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="bg-green-500 px-3 py-1 rounded"
        >
          Create
        </button>
      </div>
    </ModalWrapper>
  );
};

// --------------------
// ADD VERSION MODAL
// --------------------
export const AddVersionModal = ({
  isOpen,
  onClose,
  onSubmit,
  versionName,
  setVersionName,
  versionUrl,
  setVersionUrl,
  versionErrors,
  setVersionErrors,
}: any) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Add Version</h2>

      <div className="mb-3">
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          placeholder="1.0.1"
          value={versionName}
          onChange={(e) => {
            setVersionName(e.target.value);
            if (versionErrors.version) setVersionErrors({ ...versionErrors, version: undefined });
          }}
        />
        {versionErrors.version && (
          <p className="text-red-500 text-xs mt-1">{versionErrors.version}</p>
        )}
      </div>

      <div className="mb-6">
        <input
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          placeholder="www.download.com"
          value={versionUrl}
          onChange={(e) => {
            setVersionUrl(e.target.value);
            if (versionErrors.url) setVersionErrors({ ...versionErrors, url: undefined });
          }}
        />
        {versionErrors.url && (
          <p className="text-red-500 text-xs mt-1">{versionErrors.url}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            onClose();
            setVersionErrors({});
          }}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          Cancel
        </button>
        <button onClick={onSubmit} className="bg-blue-500 px-3 py-1 rounded">
          Add
        </button>
      </div>
    </ModalWrapper>
  );
};

// --------------------
// DELETE MODAL
// --------------------
export const DeleteAppModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-red-400 mb-4">Delete App</h2>
      <p className="text-sm text-gray-300 mb-6">
        Are you sure you want to delete this app?
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          Cancel
        </button>
        <button onClick={onDelete} className="bg-red-600 px-3 py-1 rounded">
          Delete
        </button>
      </div>
    </ModalWrapper>
  );
};