interface VersionPanelProps {
  appId: string;
  versions: any[];
  isExpanded: boolean;
  editVersion: any;
  editVersionName: string;
  editVersionUrl: string;
  editVersionErrors: any;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChangeName: (val: string) => void;
  onEditChangeUrl: (val: string) => void;
  // FIX: Renamed from onClickDeleteVersion to onDeleteVersion
  onDeleteVersion: (appId: string, index: number) => void; 
  onClickSetEditVersion: (appId: string, index: number) => void;
  onClickAddVersion: (appId: string) => void;
}

export default function VersionPanel({
  appId,
  versions,
  isExpanded,
  editVersion,
  editVersionName,
  editVersionUrl,
  editVersionErrors,
  onSaveEdit,
  onCancelEdit,
  onEditChangeName,
  onEditChangeUrl,
  onDeleteVersion, // Updated prop name
  onClickSetEditVersion,
  onClickAddVersion,
}: VersionPanelProps) {
  if (!isExpanded) return null;

  return (
    <div className="version-panel absolute top-full left-0 right-0 mt-2 bg-gray-800 shadow-xl rounded-xl border border-gray-700 p-3 z-40 w-full">
      <p className="text-sm text-gray-300 mb-2 font-semibold">Versions</p>

      {(versions || []).map((v: any, index: number) => (
        <div
          key={`${appId}-${index}`}
          className="bg-gray-700 p-2 rounded mb-2 text-xs"
        >
          {editVersion?.appId === appId && editVersion?.index === index ? (
            <>
              {/* Edit Mode */}
              <div className="mb-1">
                <input
                  className="w-full p-1 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-green-500"
                  value={editVersionName}
                  onChange={(e) => {
                    onEditChangeName(e.target.value);
                    if (editVersionErrors.version) onEditChangeName(""); // Clear error helper
                  }}
                />
                {editVersionErrors.version && (
                  <p className="text-red-400 text-[10px] mt-1">{editVersionErrors.version}</p>
                )}
              </div>

              <div className="mb-1">
                <input
                  className="w-full p-1 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:border-green-500"
                  value={editVersionUrl}
                  onChange={(e) => {
                    onEditChangeUrl(e.target.value);
                    if (editVersionErrors.url) onEditChangeUrl(""); // Clear error helper
                  }}
                />
                {editVersionErrors.url && (
                  <p className="text-red-400 text-[10px] mt-1">{editVersionErrors.url}</p>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  className="text-green-400 font-bold hover:text-green-300"
                  onClick={onSaveEdit}
                >
                  Save
                </button>
                <button
                  className="text-gray-400 hover:text-gray-200"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* View Mode */}
              <div className="mb-1">Version: {v.version}</div>
              <div className="mb-1 break-words">URL: {v.url}</div>

              <div className="flex gap-3 mt-2">
                <button
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => onClickSetEditVersion(appId, index)}
                >
                  Edit
                </button>
                {/* FIX: Using the correctly named prop */}
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => onDeleteVersion(appId, index)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      <button
        onClick={() => onClickAddVersion(appId)}
        className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500 w-full"
      >
        + Add Version
      </button>
    </div>
  );
}