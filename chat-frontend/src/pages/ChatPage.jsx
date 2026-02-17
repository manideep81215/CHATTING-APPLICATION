import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { api } from "../lib/api";
import { getToken } from "../lib/auth";

export default function ChatPage() {
  const { friendUserId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [isFriendOnline, setIsFriendOnline] = useState(false);
  const [friendLastSeenAt, setFriendLastSeenAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [attachmentMap, setAttachmentMap] = useState({});
  const [previewModal, setPreviewModal] = useState(null);
  const stompRef = useRef(null);
  const endRef = useRef(null);
  const attachmentMapRef = useRef({});
  const typingHideRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingActiveRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const recordChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const recordStreamRef = useRef(null);
  const friendName = state?.friendName || friendUserId;
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const wsUrl = import.meta.env.VITE_WS_URL || (apiBaseUrl ? `${apiBaseUrl}/ws` : "/ws");

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)),
    [messages]
  );

  function mergeMessages(nextMessages) {
    setMessages((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      nextMessages.forEach((m) => map.set(m.id, m));
      return Array.from(map.values());
    });
  }

  async function fetchMessages() {
    try {
      const { data } = await api.get("/api/chat/messages", { params: { userId: friendUserId } });
      mergeMessages(data);
    } catch {
      toast.error("Could not load conversation");
    }
  }

  async function sendMessage(type = "TEXT", content = "", fileUrl = "") {
    if (!friendUserId) return;
    if (!content && !fileUrl) return;
    setLoading(true);
    try {
      const { data } = await api.get("/api/chat/send", {
        params: {
          receiverUserId: friendUserId,
          content,
          fileUrl,
          type,
        },
      });
      mergeMessages([data]);
      setText("");
      notifyTyping(false);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  async function notifyTyping(isTyping) {
    if (!friendUserId) return;
    if (isTyping === typingActiveRef.current) return;
    typingActiveRef.current = isTyping;
    try {
      await api.post("/api/chat/typing", {
        receiverUserId: friendUserId,
        typing: isTyping,
      });
    } catch {
      // best effort
    }
  }

  function handleTypingChange(nextValue) {
    setText(nextValue);
    if (!nextValue.trim()) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      notifyTyping(false);
      return;
    }

    notifyTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => notifyTyping(false), 1200);
  }

  async function uploadAndSend(file, type) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await sendMessage(type, file.name, data.fileUrl);
    } catch {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordChunksRef.current = [];
      setRecordSeconds(0);
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        setIsRecording(false);

        const chunks = recordChunksRef.current;
        if (chunks.length === 0) {
          toast.error("Voice recording is empty.");
          return;
        }

        const blobType = chunks[0].type || "audio/webm";
        const audioBlob = new Blob(chunks, { type: blobType });
        const voiceFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: blobType });
        await uploadAndSend(voiceFile, "VOICE");
      };

      recorder.start();
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.error("Microphone permission is required.");
      setIsRecording(false);
    }
  }

  function stopVoiceRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    if (recordStreamRef.current) {
      recordStreamRef.current.getTracks().forEach((track) => track.stop());
      recordStreamRef.current = null;
    }
  }

  function toggleVoiceRecording() {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
    startVoiceRecording();
  }

  function guessImageMime(fileName = "") {
    const n = fileName.toLowerCase();
    if (n.endsWith(".png")) return "image/png";
    if (n.endsWith(".gif")) return "image/gif";
    if (n.endsWith(".webp")) return "image/webp";
    if (n.endsWith(".bmp")) return "image/bmp";
    return "image/jpeg";
  }

  function guessVideoMime(fileName = "") {
    const n = fileName.toLowerCase();
    if (n.endsWith(".webm")) return "video/webm";
    if (n.endsWith(".mov")) return "video/quicktime";
    if (n.endsWith(".mkv")) return "video/x-matroska";
    if (n.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  }

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

  function guessAudioMime(fileName = "") {
    const n = fileName.toLowerCase();
    if (n.endsWith(".webm")) return "audio/webm";
    if (n.endsWith(".ogg")) return "audio/ogg";
    if (n.endsWith(".wav")) return "audio/wav";
    if (n.endsWith(".m4a")) return "audio/mp4";
    if (n.endsWith(".aac")) return "audio/aac";
    return "audio/webm";
  }

  async function fetchAttachmentBlob(fileUrl, messageType = "", fileName = "") {
    const { data, headers } = await api.get(fileUrl, { responseType: "blob" });
    const rawMime = headers["content-type"] || data.type || "application/octet-stream";

    let effectiveBlob = data;
    let mimeType = rawMime;

    if ((!rawMime || rawMime === "application/octet-stream") && messageType === "IMAGE") {
      mimeType = isLikelyVideoFile(fileName) ? guessVideoMime(fileName) : guessImageMime(fileName);
      effectiveBlob = new Blob([data], { type: mimeType });
    } else if ((!rawMime || rawMime === "application/octet-stream") && messageType === "VOICE") {
      mimeType = guessAudioMime(fileName);
      effectiveBlob = new Blob([data], { type: mimeType });
    }

    const blobUrl = URL.createObjectURL(effectiveBlob);
    setAttachmentMap((prev) => ({ ...prev, [fileUrl]: { url: blobUrl, mimeType } }));
    return { blobUrl, mimeType };
  }

  async function openAttachment(message) {
    try {
      const cached = attachmentMap[message.fileUrl];
      const blobUrl =
        cached?.url ||
        (await fetchAttachmentBlob(message.fileUrl, message.type, message.content || "")).blobUrl;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = message.content || "attachment";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Could not process attachment.");
    }
  }

  async function openAttachmentPreview(message) {
    try {
      const cached = attachmentMap[message.fileUrl];
      const fetched = cached
        ? null
        : await fetchAttachmentBlob(message.fileUrl, message.type, message.content || "");
      const blobUrl = cached?.url || fetched?.blobUrl;
      const mimeType = cached?.mimeType || fetched?.mimeType || "application/octet-stream";
      setPreviewModal({
        title: message.content || attachmentLabel(message),
        message,
        fileUrl: blobUrl,
        mimeType,
      });
    } catch {
      toast.error("Could not open attachment preview.");
    }
  }

  async function openImagePreview(message) {
    await openAttachmentPreview(message);
  }

  function attachmentLabel(message) {
    if (message.type === "IMAGE") {
      if (attachmentMap[message.fileUrl]?.mimeType?.startsWith("video/") || isLikelyVideoFile(message.content || "")) {
        return "Video";
      }
      return "Image";
    }
    if (message.type === "VOICE") return "Voice Note";
    return "File";
  }

  function isLikelyAudioFile(name = "") {
    const n = name.toLowerCase();
    return (
      n.endsWith(".webm") ||
      n.endsWith(".ogg") ||
      n.endsWith(".wav") ||
      n.endsWith(".m4a") ||
      n.endsWith(".aac") ||
      n.endsWith(".mp3")
    );
  }

  function getPresenceLabel() {
    if (isFriendOnline) return "Online";
    if (!friendLastSeenAt) return "last seen recently";
    const seenAtMs = new Date(friendLastSeenAt).getTime();
    if (Number.isNaN(seenAtMs)) return "last seen recently";

    const diffSeconds = Math.max(0, Math.floor((nowTick - seenAtMs) / 1000));
    if (diffSeconds < 60) return "last seen just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `last seen ${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      const sameDate = new Date(nowTick).toDateString() === new Date(seenAtMs).toDateString();
      if (sameDate) {
        return `last seen today at ${new Date(seenAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }
      return `last seen ${diffHours} hr ago`;
    }

    const yesterday = new Date(nowTick);
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = new Date(seenAtMs).toDateString() === yesterday.toDateString();
    if (wasYesterday) {
      return `last seen yesterday at ${new Date(seenAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return `last seen on ${new Date(seenAtMs).toLocaleDateString()} at ${new Date(seenAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function renderModalPreview() {
    if (!previewModal?.fileUrl) {
      return <div className="text-secondary small">Preview not available</div>;
    }
    if (previewModal.message?.type === "VOICE" || isLikelyAudioFile(previewModal.title)) {
      return <audio className="w-100" controls src={previewModal.fileUrl} />;
    }
    if (previewModal.mimeType?.startsWith("image/")) {
      return <img src={previewModal.fileUrl} alt={previewModal.title} className="image-preview-full" />;
    }
    if (previewModal.mimeType?.startsWith("audio/")) {
      return <audio className="w-100" controls src={previewModal.fileUrl} />;
    }
    if (previewModal.mimeType?.startsWith("video/")) {
      return <video className="w-100" controls src={previewModal.fileUrl} />;
    }
    if (previewModal.mimeType === "application/pdf") {
      return <iframe src={previewModal.fileUrl} title={previewModal.title} className="file-preview-frame" />;
    }
    return <div className="text-secondary small">Preview not supported for this file type.</div>;
  }

  function connectSocket() {
    const token = getToken();
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe("/user/queue/messages", (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            const involved =
              payload.senderUserId === friendUserId || payload.receiverUserId === friendUserId;
            if (involved) {
              mergeMessages([payload]);
            }
          } catch {
            // ignore malformed payload
          }
        });
        client.subscribe("/topic/typing", (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            if (payload.senderUserId === friendUserId) {
              setIsFriendTyping(Boolean(payload.typing));
              if (typingHideRef.current) clearTimeout(typingHideRef.current);
              if (payload.typing) {
                typingHideRef.current = setTimeout(() => setIsFriendTyping(false), 1800);
              }
            }
          } catch {
            // ignore malformed payload
          }
        });
      },
    });
    client.activate();
    stompRef.current = client;
  }

  useEffect(() => {
    attachmentMapRef.current = attachmentMap;
  }, [attachmentMap]);

  useEffect(() => {
    fetchMessages();
    connectSocket();
    const poll = setInterval(fetchMessages, 4000);
    return () => {
      clearInterval(poll);
      if (typingHideRef.current) clearTimeout(typingHideRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      notifyTyping(false);
      if (stompRef.current) {
        stompRef.current.deactivate();
      }
    };
  }, [friendUserId]);

  useEffect(() => {
    const previewableMessages = sortedMessages.filter(
      (msg) => (msg.type === "IMAGE" || msg.type === "VOICE") && msg.fileUrl
    );
    previewableMessages.forEach((msg) => {
      if (!attachmentMap[msg.fileUrl]) {
        fetchAttachmentBlob(msg.fileUrl, msg.type, msg.content || "").catch(() => {
          // ignore
        });
      }
    });
  }, [sortedMessages, attachmentMap]);

  useEffect(() => {
    let timer;
    async function tickPresence() {
      try {
        const { data } = await api.get("/api/users/status", { params: { userId: friendUserId } });
        setIsFriendOnline(Boolean(data.online));
        setFriendLastSeenAt(data.lastSeenAt || null);
      } catch {
        setIsFriendOnline(false);
        setFriendLastSeenAt(null);
      }
    }
    tickPresence();
    timer = setInterval(tickPresence, 8000);
    return () => clearInterval(timer);
  }, [friendUserId]);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(attachmentMapRef.current).forEach((file) => URL.revokeObjectURL(file.url));
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages.length, isFriendTyping]);

  return (
    <div className="chat-page d-flex flex-column">
      <header className="navbar bg-white border-bottom px-3 chat-top-nav">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dashboard")}>
          Back
        </button>
        <div className="d-flex flex-column align-items-center">
          <button
            type="button"
            className="fw-semibold text-decoration-none text-dark btn btn-link p-0 border-0"
            onClick={() => navigate(`/chat/${friendUserId}/contact`, { state: { friendName } })}
          >
            {friendName}
          </button>
          <div className={`small ${isFriendOnline ? "text-success" : "text-secondary"}`}>
            {getPresenceLabel()}
          </div>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary btn-sm">
          Friends
        </Link>
      </header>

      <main className="flex-grow-1 overflow-auto p-3 p-md-4 bg-slate-50 chat-main-scroll">
        <div className="mx-auto message-wrap">
          {sortedMessages.map((msg) => {
            const mine = msg.receiverUserId === friendUserId;
            return (
              <div key={msg.id} className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}>
                <div className={`message-bubble ${mine ? "mine" : "theirs"}`}>
                  {msg.fileUrl ? (
                    <div className="d-grid gap-2">
                      <div className="small fw-semibold">{attachmentLabel(msg)}</div>
                      {msg.type === "VOICE" ? (
                        <div className="voice-inline-wrap">
                          {attachmentMap[msg.fileUrl]?.url ? (
                            <audio
                              className="voice-inline-player"
                              controls
                              preload="metadata"
                              src={attachmentMap[msg.fileUrl].url}
                            />
                          ) : (
                            <button
                              type="button"
                              className="file-preview-btn"
                              onClick={() => openAttachmentPreview(msg)}
                            >
                              Tap to load voice note
                            </button>
                          )}
                        </div>
                      ) : msg.type === "IMAGE" ? (
                        <button type="button" className="image-thumb-btn" onClick={() => openImagePreview(msg)}>
                          {attachmentMap[msg.fileUrl]?.url ? (
                            attachmentMap[msg.fileUrl]?.mimeType?.startsWith("video/") || isLikelyVideoFile(msg.content || "") ? (
                              <video
                                src={attachmentMap[msg.fileUrl].url}
                                className="image-thumb-3x4"
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={attachmentMap[msg.fileUrl].url}
                                alt={msg.content || "Image"}
                                className="image-thumb-3x4"
                              />
                            )
                          ) : (
                            <span className="small">Loading preview...</span>
                          )}
                        </button>
                      ) : (
                        <button type="button" className="file-preview-btn" onClick={() => openAttachmentPreview(msg)}>
                          <div className="small fw-semibold">{msg.content || "Attachment"}</div>
                          <div className="small text-secondary">Tap to preview</div>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                  <div className="message-time">{new Date(msg.sentAt).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
          {isFriendTyping && <div className="small text-secondary fst-italic mb-2">{friendName} is typing...</div>}
          <div ref={endRef} />
        </div>
      </main>

      <footer className="bg-white border-top p-3 chat-bottom-nav">
        <div className="mx-auto message-wrap composer-box">
          <div className="composer-row">
            <label className="attach-chip" title="Image/Video">
              🖼
              <input
                hidden
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && uploadAndSend(e.target.files[0], "IMAGE")}
              />
            </label>
            <label className="attach-chip" title="File">
              📎
              <input hidden type="file" onChange={(e) => e.target.files?.[0] && uploadAndSend(e.target.files[0], "FILE")} />
            </label>
            <button
              type="button"
              className={`attach-chip record-chip ${isRecording ? "recording" : ""}`}
              title={isRecording ? "Stop recording" : "Record voice note"}
              onClick={toggleVoiceRecording}
            >
              {isRecording ? "■" : "🎤"}
            </button>
            <input
              className="form-control composer-input"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => handleTypingChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage("TEXT", text)}
            />
            <button className="btn btn-primary composer-send" disabled={loading} onClick={() => sendMessage("TEXT", text)}>
              ➤
            </button>
          </div>
          {(uploading || isRecording) && (
            <div className="small text-secondary mt-1">
              {uploading ? "Uploading..." : `Recording... ${recordSeconds}s`}
            </div>
          )}
        </div>
      </footer>

      {previewModal && (
        <div className="image-preview-overlay" onClick={() => setPreviewModal(null)}>
          <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-truncate pe-3">{previewModal.title}</strong>
              <div className="d-flex gap-2">
                {previewModal.message?.type !== "VOICE" && (
                  <button className="btn btn-sm btn-primary" onClick={() => openAttachment(previewModal.message)}>
                    Download
                  </button>
                )}
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setPreviewModal(null)}>
                  Close
                </button>
              </div>
            </div>
            {renderModalPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
