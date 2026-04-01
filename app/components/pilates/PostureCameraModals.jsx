"use client";

import { useEffect, useRef, useState } from "react";
import { B } from "./theme";
import { Btn, Icon, IC, mixAlpha } from "./primitives";
import {
  stopMediaStream,
  getCameraStream,
  getFacingModeForDefault,
  pickRecorderMime,
} from "./posture-camera-utils";

/** Grade + prumo sobre o preview (aspect ratio do vídeo). */
function CameraOverlay({ width, height }) {
  if (!width || !height) return null;
  const cols = 9;
  const rows = 11;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={((i + 1) * width) / cols}
          y1={0}
          x2={((i + 1) * width) / cols}
          y2={height}
          stroke="rgba(0,160,168,0.35)"
          strokeWidth={Math.max(1, width * 0.003)}
        />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={((i + 1) * height) / rows}
          x2={width}
          y2={((i + 1) * height) / rows}
          stroke="rgba(0,160,168,0.35)"
          strokeWidth={Math.max(1, height * 0.003)}
        />
      ))}
      <line
        x1={width / 2}
        y1={0}
        x2={width / 2}
        y2={height}
        stroke="rgba(255,200,0,0.85)"
        strokeWidth={Math.max(2, width * 0.006)}
        strokeDasharray="8 6"
      />
      <line
        x1={0}
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="rgba(255,200,0,0.45)"
        strokeWidth={Math.max(1, height * 0.002)}
        strokeDasharray="5 5"
      />
    </svg>
  );
}

export function CameraPhotoModal({ open, onClose, onCapture, facingModeInitial }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState(() => facingModeInitial || getFacingModeForDefault());
  const [error, setError] = useState(null);
  const [dims, setDims] = useState({ w: 720, h: 1280 });

  useEffect(() => {
    if (!open) return;
    setFacingMode(facingModeInitial || getFacingModeForDefault());
    setError(null);
  }, [open, facingModeInitial]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    let currentStream = null;
    setError(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (alive) setError("Câmera não disponível neste navegador.");
          return;
        }
        const s = await getCameraStream(facingMode);
        if (!alive) {
          stopMediaStream(s);
          return;
        }
        currentStream = s;
        setStream(s);
        const t = s.getVideoTracks()[0];
        const settings = t?.getSettings?.() || {};
        const w = settings.width || 1280;
        const h = settings.height || 720;
        setDims({ w, h });
      } catch (e) {
        if (alive) setError(e?.message || "Não foi possível acessar a câmera.");
      }
    })();
    return () => {
      alive = false;
      stopMediaStream(currentStream);
      setStream(null);
    };
  }, [open, facingMode]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const v = videoRef.current;
    v.srcObject = stream;
    v.play().catch(() => {});
    return () => {
      v.srcObject = null;
    };
  }, [stream]);

  const handleClose = () => {
    stopMediaStream(stream);
    setStream(null);
    setError(null);
    onClose();
  };

  const flipCamera = () => {
    setFacingMode((f) => (f === "environment" ? "user" : "environment"));
  };

  const takePhoto = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopMediaStream(stream);
    setStream(null);
    onCapture(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        padding: "env(safe-area-inset-top, 12px) env(safe-area-inset-right, 12px) env(safe-area-inset-bottom, 12px) env(safe-area-inset-left, 12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 12px" }}>
        <button
          type="button"
          aria-label="Fechar"
          onClick={handleClose}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: mixAlpha(B.white, 18),
            color: B.white,
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
        <span style={{ color: B.mutedLt, fontSize: 13 }}>Alinhe a paciente na grade</span>
        <button
          type="button"
          aria-label="Trocar câmera"
          onClick={flipCamera}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: mixAlpha(B.teal, 35),
            color: B.white,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon d={IC.camera} size={22} color={B.white} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {error ? (
          <p style={{ color: B.red, padding: 24, textAlign: "center" }}>{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                maxHeight: "min(72vh, 100%)",
              }}
            />
            <CameraOverlay width={dims.w} height={dims.h} />
          </>
        )}
      </div>

      <div style={{ padding: "16px 8px 8px", display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={takePhoto}
          disabled={!!error || !stream}
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: `5px solid ${B.white}`,
            background: `linear-gradient(135deg, ${B.pink}, ${B.pinkDk})`,
            boxShadow: `0 4px 20px ${mixAlpha(B.pink, 40)}`,
            cursor: error || !stream ? "not-allowed" : "pointer",
            opacity: error || !stream ? 0.5 : 1,
          }}
          aria-label="Tirar foto"
        />
      </div>
      <p style={{ textAlign: "center", color: B.mutedLt, fontSize: 12, marginBottom: 8 }}>Tirar foto</p>
    </div>
  );
}

export function CameraVideoModal({ open, onClose, onRecorded, facingModeInitial }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState(() => facingModeInitial || getFacingModeForDefault());
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [dims, setDims] = useState({ w: 1280, h: 720 });

  useEffect(() => {
    if (!open) return;
    setFacingMode(facingModeInitial || getFacingModeForDefault());
    setError(null);
  }, [open, facingModeInitial]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    let currentStream = null;
    setError(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (alive) setError("Câmera não disponível.");
          return;
        }
        const s = await getCameraStream(facingMode);
        if (!alive) {
          stopMediaStream(s);
          return;
        }
        currentStream = s;
        setStream(s);
        const t = s.getVideoTracks()[0];
        const settings = t?.getSettings?.() || {};
        setDims({ w: settings.width || 1280, h: settings.height || 720 });
      } catch (e) {
        if (alive) setError(e?.message || "Não foi possível acessar a câmera.");
      }
    })();
    return () => {
      alive = false;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          /* noop */
        }
      }
      recorderRef.current = null;
      chunksRef.current = [];
      stopMediaStream(currentStream);
      setStream(null);
      setRecording(false);
    };
  }, [open, facingMode]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const v = videoRef.current;
    v.srcObject = stream;
    v.play().catch(() => {});
    return () => {
      v.srcObject = null;
    };
  }, [stream]);

  const handleClose = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    stopMediaStream(stream);
    setStream(null);
    setRecording(false);
    setError(null);
    onClose();
  };

  const flipCamera = () => {
    if (recording) return;
    setFacingMode((f) => (f === "environment" ? "user" : "environment"));
  };

  const startRecording = () => {
    if (!stream || typeof MediaRecorder === "undefined") {
      setError("Gravação não suportada neste dispositivo.");
      return;
    }
    chunksRef.current = [];
    const mime = pickRecorderMime();
    try {
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        onRecorded(url, blob.type);
        handleClose();
      };
      rec.start(200);
      setRecording(true);
    } catch (e) {
      setError(e?.message || "Erro ao gravar.");
    }
  };

  const stopRecording = () => {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      try {
        rec.requestData?.();
      } catch {
        /* noop */
      }
      rec.stop();
    }
    setRecording(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        padding: "env(safe-area-inset-top, 12px) env(safe-area-inset-right, 12px) env(safe-area-inset-bottom, 12px) env(safe-area-inset-left, 12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 12px" }}>
        <button
          type="button"
          onClick={handleClose}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: mixAlpha(B.white, 18),
            color: B.white,
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <span style={{ color: recording ? B.red : B.mutedLt, fontSize: 13, fontWeight: recording ? 700 : 400 }}>
          {recording ? "● Gravando…" : "Pré-visualização"}
        </span>
        <button
          type="button"
          onClick={flipCamera}
          disabled={recording}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: recording ? "transparent" : mixAlpha(B.teal, 35),
            color: B.white,
            cursor: recording ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon d={IC.camera} size={22} color={B.white} />
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {error ? (
          <p style={{ color: B.red, padding: 24 }}>{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: "min(65vh, 100%)" }}
            />
            <CameraOverlay width={dims.w} height={dims.h} />
          </>
        )}
      </div>

      <div style={{ padding: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {!recording ? (
          <Btn variant="primary" onClick={startRecording} disabled={!!error || !stream}>
            Iniciar gravação
          </Btn>
        ) : (
          <Btn variant="danger" onClick={stopRecording}>
            Parar
          </Btn>
        )}
      </div>
    </div>
  );
}
