import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

export default function ChatContactPage() {
  const { friendUserId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const friendName = state?.friendName || friendUserId;
  const [messages, setMessages] = useState([]);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [previewMediaItem, setPreviewMediaItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mediaPreviewMap, setMediaPreviewMap] = useState({});
  const mediaPreviewRef = useRef({});

  function isLikelyVideoFile(name = "") {
    const n = name.toLowerCase();
    return (
      n.endsWith(".mp4") ||
      n.endsWith(".webm") ||
      n.endsWith(".mov") ||
      n.endsWith(".mkv") ||
      n.endsWith(".avi")
    );
  }

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/chat/messages", { params: { userId: friendUserId } });
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Could not load contact media");
      }
    }
    load();
  }, [friendUserId]);

  const mediaItems = useMemo(
    () => messages.filter((m) => m.fileUrl && m.type === "IMAGE"),
    [messages]
  );
  const fileItems = useMemo(
    () => messages.filter((m) => m.fileUrl && m.type !== "IMAGE"),
    [messages]
  );

  useEffect(() => {
    mediaPreviewRef.current = mediaPreviewMap;
  }, [mediaPreviewMap]);

  useEffect(() => {
    async function preload() {
      const newEntries = {};
      for (const item of mediaItems) {
        if (mediaPreviewMap[item.fileUrl]) continue;
        try {
          const { data, headers } = await api.get(item.fileUrl, { responseType: "blob" });
          const mimeType = headers["content-type"] || data.type || "application/octet-stream";
          newEntries[item.fileUrl] = {
            url: URL.createObjectURL(data),
            mimeType,
          };
        } catch {
          // ignore one-off image failures
        }
      }
      if (Object.keys(newEntries).length > 0) {
        setMediaPreviewMap((prev) => ({ ...prev, ...newEntries }));
      }
    }
    preload();
  }, [mediaItems, mediaPreviewMap]);

  useEffect(() => {
    return () => {
      Object.values(mediaPreviewRef.current).forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, []);

  async function confirmDeleteChat() {
    try {
      await api.get("/api/chat/delete", { params: { userId: friendUserId } });
      setMessages([]);
      setShowDeleteConfirm(false);
      toast.success("Chat deleted");
    } catch (error) {
      if (error?.response?.status === 403) {
        toast.error("Delete blocked. Please re-login once and try again.");
        return;
      }
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Could not delete chat (${error?.response?.status || "network"})`;
      toast.error(message);
    }
  }

  async function openAttachment(item, mode = "open") {
    try {
      const { data } = await api.get(item.fileUrl, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(data);
      if (mode === "preview-media") {
        setPreviewMedia({
          url: blobUrl,
          mimeType: data.type || "application/octet-stream",
        });
        setPreviewMediaItem(item);
        return;
      }
      if (mode === "download") {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.content || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      toast.error("Could not open file");
    }
  }

  return (
    <div className="min-vh-100 bg-slate-100 p-3 p-md-4">
      <div className="mx-auto message-wrap">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete Chat
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="profile-avatar-light mx-auto mb-2">{friendName.slice(0, 1).toUpperCase()}</div>
          <h2 className="h3 fw-bold mb-0">{friendName}</h2>
          <div className="text-secondary">@{friendUserId.toLowerCase()}</div>
        </div>

        <section className="panel-card mb-3">
          <h3 className="h4 mb-3">Media</h3>
          {mediaItems.length === 0 && <p className="text-secondary mb-0">No uploaded media yet.</p>}
          <div className="media-grid-3">
            {mediaItems.map((item) => (
              <button
                key={item.id}
                className="image-thumb-btn"
                type="button"
                onClick={() => openAttachment(item, "preview-media")}
              >
                {mediaPreviewMap[item.fileUrl]?.url ? (
                  mediaPreviewMap[item.fileUrl]?.mimeType?.startsWith("video/") || isLikelyVideoFile(item.content || "") ? (
                    <video
                      src={mediaPreviewMap[item.fileUrl].url}
                      className="image-thumb-square"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={mediaPreviewMap[item.fileUrl].url}
                      alt={item.content || "image"}
                      className="image-thumb-square"
                    />
                  )
                ) : (
                  <div className="image-thumb-square d-flex align-items-center justify-content-center text-secondary small">
                    Loading...
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card">
          <h3 className="h4 mb-3">Files</h3>
          {fileItems.length === 0 && <p className="text-secondary mb-0">No uploaded files yet.</p>}
          <div className="stack-list-light">
            {fileItems.map((item) => (
              <div key={item.id} className="list-item-light">
                <div>
                  <div className="strong-light">{item.content || item.type}</div>
                  <div className="muted-light">{item.type}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => openAttachment(item, "download")}>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {previewMedia?.url && (
        <div
          className="image-preview-overlay"
          onClick={() => {
            setPreviewMedia(null);
            setPreviewMediaItem(null);
          }}
        >
          <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-end gap-2 mb-2">
              {previewMediaItem && (
                <button className="btn btn-sm btn-primary" onClick={() => openAttachment(previewMediaItem, "download")}>
                  Download
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setPreviewMedia(null);
                  setPreviewMediaItem(null);
                }}
              >
                Close
              </button>
            </div>
            {previewMedia.mimeType?.startsWith("video/") || isLikelyVideoFile(previewMediaItem?.content || "") ? (
              <video className="w-100" controls src={previewMedia.url} />
            ) : (
              <img src={previewMedia.url} alt="media preview" className="image-preview-full" />
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="image-preview-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
            <h5 className="mb-2">Delete chat</h5>
            <p className="mb-3 text-secondary">Delete all chat messages with {friendName}?</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-sm btn-danger" onClick={confirmDeleteChat}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
