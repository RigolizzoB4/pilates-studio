"use client";

import { useState } from "react";
import { B } from "./theme";
import { Btn, Field } from "./primitives";
import { openPatientFullExportHtml } from "@/lib/patient-export-html";

export default function InfoTab({ patient, updatePatient }) {
  const [f, setF] = useState({ ...patient });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div style={{ maxWidth: 560 }}>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: B.dark, marginBottom: 18 }}>Informações</h3>
      <Field label="Nome completo" value={f.name} onChange={(v) => set("name", v)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="E-mail" value={f.email} onChange={(v) => set("email", v)} type="email" />
        <Field label="Telefone / WhatsApp" value={f.phone} onChange={(v) => set("phone", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Data de Nascimento"
          value={f.anamnesis?.birthDate}
          onChange={(v) => set("anamnesis", { ...f.anamnesis, birthDate: v })}
          type="date"
        />
        <Field
          label="Status"
          value={f.status}
          onChange={(v) => set("status", v)}
          type="select"
          opts={[
            { value: "lead", label: "Lead" },
            { value: "active", label: "Ativo" },
            { value: "inactive", label: "Inativo" },
          ]}
        />
      </div>
      <Field label="Como nos conheceu" value={f.howFound} onChange={(v) => set("howFound", v)} />
      <Field label="Notas gerais" value={f.notes} onChange={(v) => set("notes", v)} type="textarea" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Btn onClick={() => updatePatient(f)}>Salvar</Btn>
        <Btn variant="secondary" onClick={() => openPatientFullExportHtml(f)}>
          Exportar ficha PDF
        </Btn>
      </div>
    </div>
  );
}
