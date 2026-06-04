"use client";

import { useState } from "react";
import { B } from "./theme";
import { Btn, Icon, IC, Tag } from "./primitives";
import { uid, fmtDate } from "@/lib/pilates-utils";
import { claudeAPI } from "@/lib/pilates-claude";

export default function EvaluationTab({ patient, updatePatient }) {
  const [evals, setEvals] = useState(patient.evaluations || []);
  const [note, setNote] = useState("");
  const [busyAI, setBusyAI] = useState(false);

  const addManual = async () => {
    if (!note.trim()) return;
    const e = { id: uid(), date: new Date().toISOString(), type: "manual", content: note };
    const updated = [e, ...evals];
    setEvals(updated);
    setNote("");
    await updatePatient({ ...patient, evaluations: updated });
  };

  const generateAI = async () => {
    setBusyAI(true);
    const an = patient.anamnesis || {};
    const prompt = `Gere uma avaliação clínica inicial completa para este paciente de Pilates:\n\nPaciente: ${patient.name}\nQueixa: ${an.mainComplaint || "não informada"}\nObjetivos: ${an.goal || "não informados"}\nHistórico médico: ${an.medicalHistory || an.chronicConditions || "não informado"}\nMedicamentos: ${an.medications || "nenhum"}\nCirurgias: ${an.surgeries || "nenhuma"}\nDor: ${an.painHistory || "não informado"}\nContraindicações: ${an.contraindications || an.chronicConditions || "verificar"}\n\nForneça:\n1. Avaliação clínica geral\n2. Pontos de atenção e riscos\n3. Objetivos terapêuticos prioritários\n4. Exercícios de Pilates recomendados para início\n5. Exercícios a EVITAR\n6. Progressão: curto, médio e longo prazo`;
    const content = await claudeAPI(
      [{ role: "user", content: prompt }],
      "Você é especialista em Pilates e fisioterapia, auxiliando uma professora de Pilates na avaliação de pacientes."
    );
    const e = { id: uid(), date: new Date().toISOString(), type: "ai", content };
    const updated = [e, ...evals];
    setEvals(updated);
    await updatePatient({ ...patient, evaluations: updated });
    setBusyAI(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: B.dark }}>Avaliações</h3>
        <Btn onClick={generateAI} disabled={busyAI}>
          <Icon d={IC.sparkle} size={15} color={B.white} />
          {busyAI ? "Gerando…" : "Avaliação IA"}
        </Btn>
      </div>
      <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          ✍️ Anotação Manual
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Descrição da sessão, evolução, observações clínicas…"
          rows={4}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1.5px solid ${B.border}`,
            borderRadius: 8,
            fontSize: 14,
            color: B.dark,
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <Btn small onClick={addManual}>
            Salvar
          </Btn>
        </div>
      </div>
      {evals.length === 0 ? (
        <p style={{ textAlign: "center", color: B.muted, padding: 40 }}>Nenhuma avaliação ainda. Gere com IA ou adicione manualmente.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {evals.map((ev) => (
            <div key={ev.id} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                <Tag color={ev.type === "ai" ? B.purple : B.teal}>{ev.type === "ai" ? "✨ IA" : "✍️ Manual"}</Tag>
                <span style={{ fontSize: 12, color: B.muted }}>{fmtDate(ev.date)}</span>
              </div>
              <div style={{ fontSize: 14, color: B.dark, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{ev.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
