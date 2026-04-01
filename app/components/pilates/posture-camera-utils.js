/** Preferir câmera traseira em touch / telas estreitas; webcam em desktop. */
export function preferRearCamera() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|Tablet|webOS/i.test(ua);
  return mobileUa || coarse || narrow;
}

export function getFacingModeForDefault() {
  return preferRearCamera() ? "environment" : "user";
}

export function stopMediaStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* noop */
    }
  });
}

export async function getCameraStream(facingMode) {
  const video =
    facingMode === "environment"
      ? { facingMode: { ideal: "environment" } }
      : { facingMode: { ideal: "user" } };
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio: false });
  } catch {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

export function pickRecorderMime() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}
