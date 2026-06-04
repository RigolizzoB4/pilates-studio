"use client";

import { useState, useEffect, useRef } from "react";
import { B } from "./theme";
import { Icon, IC } from "./primitives";
import { claudeAPI } from "@/lib/pilates-claude";

export default function ChatTab({ patient, updatePatient }) {
  const [messages, setMessages] = useState(patient.chatHistory || []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input, ts: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setBusy(true);
    const an = patient.anamnesis || {};
    const system = `Você é especialista em Pilates e fisioterapia, auxiliando a professora Lívia.\n\nPaciente atual: ${patient.name}\nQueixa: ${an.mainComplaint || "não informada"}\nHistórico: ${an.chronicConditions || "não informado"}\nMedicamentos: ${an.medications || "nenhum"}\nCirurgias: ${an.surgeries || "nenhuma"}\nDor: ${an.painHistory || "não informado"}\n\nResponda de forma técnica, prática e direta.`;
    const reply = await claudeAPI(
      newMsgs.map((m) => ({ role: m.role, content: m.content })),
      system
    );
    const assistantMsg = { role: "assistant", content: reply, ts: Date.now() };
    const final = [...newMsgs, assistantMsg];
    setMessages(final);
    setBusy(false);
    await updatePatient({ ...patient, chatHistory: final });
  };

  const suggestions = [
    "Quais exercícios para essa queixa?",
    "O que devo evitar?",
    "Como montar a progressão?",
    "Exercícios para fortalecer o core com essa limitação?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 280px)", maxWidth: 680 }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: B.dark }}>Consultar Claude sobre {patient.name}</h3>
        <p style={{ fontSize: 12, color: B.muted, marginTop: 3 }}>Pergunte sobre o caso, técnicas, contraindicações, progressão…</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        {messages.length === 0 && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ textAlign: "center", color: B.muted, marginBottom: 16 }}>
              <Icon d={IC.chat} size={36} color={B.border} />
              <p style={{ fontSize: 14, marginTop: 10 }}>Comece uma consulta sobre este caso</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    background: B.white,
                    border: `1.5px solid ${B.border}`,
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    color: B.dark,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "86%",
                padding: "10px 14px",
                borderRadius: 14,
                background: m.role === "user" ? `linear-gradient(135deg,${B.pink},${B.pinkDk})` : B.white,
                color: m.role === "user" ? B.white : B.dark,
                border: m.role === "assistant" ? `1px solid ${B.border}` : "none",
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                borderBottomRightRadius: m.role === "user" ? 4 : 14,
                borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                background: B.white,
                border: `1px solid ${B.border}`,
                borderRadius: 14,
                padding: "10px 14px",
                color: B.muted,
                fontSize: 14,
                borderBottomLeftRadius: 4,
              }}
            >
              ✦ Pensando…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${B.border}` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Ex: A tíbia inferior está machucada, o que devo evitar?"
          style={{
            flex: 1,
            padding: "11px 14px",
            border: `1.5px solid ${B.border}`,
            borderRadius: 10,
            fontSize: 14,
            color: B.dark,
            outline: "none",
            background: B.white,
          }}
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          style={{
            background: `linear-gradient(135deg,${B.pink},${B.pinkDk})`,
            border: "none",
            borderRadius: 10,
            padding: "11px 16px",
            cursor: "pointer",
            opacity: busy || !input.trim() ? 0.5 : 1,
          }}
        >
          <Icon d={IC.send} size={17} color={B.white} />
        </button>
      </div>
    </div>
  );
}
