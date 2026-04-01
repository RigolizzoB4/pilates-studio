"use client";

import { useState } from "react";
import { B } from "./theme";
import { Btn, Field, SectionTitle, RadioGroup } from "./primitives";

export default function AnamnesisTab({ patient, updatePatient }) {
  const [f, setF] = useState({ ...(patient.anamnesis || {}) });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => updatePatient({ ...patient, anamnesis: { ...patient.anamnesis, ...f } });

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: B.dark }}>Anamnese Individual</h3>
          <p style={{ fontSize: 12, color: B.muted, marginTop: 3 }}>Informações tratadas confidencialmente</p>
        </div>
        <Btn small onClick={save}>
          Salvar
        </Btn>
      </div>

      <SectionTitle>Informações Pessoais</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Idade" value={f.age} onChange={(v) => set("age", v)} type="number" />
        <Field label="Data de Nascimento" value={f.birthDate} onChange={(v) => set("birthDate", v)} type="date" />
        <Field label="Sexo" value={f.sex} onChange={(v) => set("sex", v)} type="select" opts={["", "F", "M"]} />
      </div>
      <Field label="Endereço" value={f.address} onChange={(v) => set("address", v)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 130px", gap: 12 }}>
        <Field label="Bairro" value={f.neighborhood} onChange={(v) => set("neighborhood", v)} />
        <Field label="Cidade" value={f.city} onChange={(v) => set("city", v)} />
        <Field label="CEP" value={f.cep} onChange={(v) => set("cep", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Telefone Residencial" value={f.phoneHome} onChange={(v) => set("phoneHome", v)} />
        <Field label="Telefone Celular" value={f.phoneMobile} onChange={(v) => set("phoneMobile", v)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field
          label="Estado Civil"
          value={f.maritalStatus}
          onChange={(v) => set("maritalStatus", v)}
          type="select"
          opts={["", "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"]}
        />
        <Field label="Profissão" value={f.profession} onChange={(v) => set("profession", v)} />
      </div>
      <Field label="Queixa Principal" value={f.mainComplaint} onChange={(v) => set("mainComplaint", v)} type="textarea" rows={3} />
      <Field label="Objetivo" value={f.goal} onChange={(v) => set("goal", v)} type="textarea" rows={2} />
      <Field label="Indicação" value={f.referral} onChange={(v) => set("referral", v)} />

      <SectionTitle>Hábitos Pessoais</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RadioGroup label="1. Fumo" value={f.smoking} onChange={(v) => set("smoking", v)} options={["Não", "Sim"]} />
        <RadioGroup label="2. Álcool" value={f.alcohol} onChange={(v) => set("alcohol", v)} options={["Não", "Sim"]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="3. Horas de sono/dia" value={f.sleepHours} onChange={(v) => set("sleepHours", v)} type="number" />
        <Field label="4. Horas trabalho/semana" value={f.workHours} onChange={(v) => set("workHours", v)} />
      </div>
      <Field label="5. Histórico de Atividades Físicas" value={f.physicalHistory} onChange={(v) => set("physicalHistory", v)} type="textarea" rows={3} />

      <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          7. Prática de Atividade Física (últimos 12 meses)?
        </p>
        <RadioGroup value={f.currentActivity} onChange={(v) => set("currentActivity", v)} options={["Não", "Sim"]} />
        {f.currentActivity === "Sim" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <Field label="Qual atividade" value={f.activityType} onChange={(v) => set("activityType", v)} />
            <Field label="Frequência (vezes/semana)" value={f.activityFreq} onChange={(v) => set("activityFreq", v)} />
            <Field label="Duração" value={f.activityDuration} onChange={(v) => set("activityDuration", v)} />
            <Field label="Por quê parou?" value={f.activityStop} onChange={(v) => set("activityStop", v)} />
          </div>
        )}
      </div>

      <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          8. Dieta alimentar?
        </p>
        <RadioGroup value={f.diet} onChange={(v) => set("diet", v)} options={["Não", "Sim"]} />
        {f.diet === "Sim" && (
          <div style={{ marginTop: 8 }}>
            <Field label="Qual tipo?" value={f.dietType} onChange={(v) => set("dietType", v)} />
            <Field label="Por quê?" value={f.dietReason} onChange={(v) => set("dietReason", v)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <RadioGroup label="Orientada?" value={f.dietOriented} onChange={(v) => set("dietOriented", v)} options={["Não", "Sim"]} />
              {f.dietOriented === "Sim" && <Field label="Por quem?" value={f.dietBy} onChange={(v) => set("dietBy", v)} />}
            </div>
          </div>
        )}
      </div>

      <SectionTitle>História Clínica</SectionTitle>
      <Field
        label="1. Patologias crônicas (diabetes, hipertensão, glaucoma, cardiopatias, artrite…)"
        value={f.chronicConditions}
        onChange={(v) => set("chronicConditions", v)}
        type="textarea"
        rows={3}
      />
      <Field label="2. Histórico de dor (aguda ou crônica)" value={f.painHistory} onChange={(v) => set("painHistory", v)} type="textarea" rows={3} />
      <Field label="3. Intervenções cirúrgicas" value={f.surgeries} onChange={(v) => set("surgeries", v)} type="textarea" rows={3} />

      <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          4. Tratamento médico, fisioterápico, psicológico?
        </p>
        <RadioGroup value={f.treatment} onChange={(v) => set("treatment", v)} options={["Não", "Sim"]} />
        {f.treatment === "Sim" && (
          <div style={{ marginTop: 10 }}>
            <Field label="Qual tratamento" value={f.treatmentType} onChange={(v) => set("treatmentType", v)} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: B.creamMd, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: B.muted, marginBottom: 8, fontWeight: 600 }}>Profissional {i}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Field label="Tipo" value={f[`prof${i}type`]} onChange={(v) => set(`prof${i}type`, v)} small />
                  <Field label="Nome" value={f[`prof${i}name`]} onChange={(v) => set(`prof${i}name`, v)} small />
                  <Field label="Telefone" value={f[`prof${i}phone`]} onChange={(v) => set(`prof${i}phone`, v)} small />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Field label="5. Medicamentos em uso" value={f.medications} onChange={(v) => set("medications", v)} type="textarea" rows={3} />

      <SectionTitle>Contatos de Emergência</SectionTitle>
      {[1, 2].map((i) => (
        <div key={i} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: B.muted, marginBottom: 8, fontWeight: 600 }}>Contato {i}</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
            <Field label="Nome" value={f[`emergency${i}name`]} onChange={(v) => set(`emergency${i}name`, v)} small />
            <Field label="Parentesco" value={f[`emergency${i}rel`]} onChange={(v) => set(`emergency${i}rel`, v)} small />
            <Field label="Telefone 1" value={f[`emergency${i}tel1`]} onChange={(v) => set(`emergency${i}tel1`, v)} small />
            <Field label="Telefone 2" value={f[`emergency${i}tel2`]} onChange={(v) => set(`emergency${i}tel2`, v)} small />
          </div>
        </div>
      ))}

      <SectionTitle>Exame Físico — Dados Antropométricos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Altura (m)" value={f.height} onChange={(v) => set("height", v)} placeholder="Ex: 1.68" />
        <Field label="Peso (kg)" value={f.weight} onChange={(v) => set("weight", v)} placeholder="Ex: 62" />
      </div>

      <SectionTitle>Análise Postural</SectionTitle>
      <Field label="Tipo Postural" value={f.posturalType} onChange={(v) => set("posturalType", v)} />
      {[
        {
          label: "Vista Lateral Direita",
          prefix: "vld",
          fields: ["cabeça", "coluna cervical", "coluna torácica", "coluna lombar", "pelve", "abdome", "articulação joelho", "articulação tornozelo"],
        },
        {
          label: "Vista Lateral Esquerda",
          prefix: "vle",
          fields: ["cabeça", "coluna cervical", "coluna torácica", "coluna lombar", "pelve", "abdome", "articulação joelho", "articulação tornozelo"],
        },
      ].map((vista) => (
        <div key={vista.prefix} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: B.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{vista.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {vista.fields.map((fd) => (
              <Field
                key={fd}
                label={fd.charAt(0).toUpperCase() + fd.slice(1)}
                value={f[`${vista.prefix}_${fd.replace(/\s/g, "_")}`]}
                onChange={(v) => set(`${vista.prefix}_${fd.replace(/\s/g, "_")}`, v)}
                placeholder="—"
                small
              />
            ))}
          </div>
        </div>
      ))}

      {[
        {
          label: "Vista Posterior",
          prefix: "vp",
          fields: [
            "coluna cervical",
            "ombros",
            "escápulas",
            "colunas torácica/lombar",
            "ângulo tronco-braços",
            "shifts laterais",
            "pelve",
            "pregas glúteas",
            "joelhos",
            "pés",
          ],
        },
        {
          label: "Vista Anterior",
          prefix: "va",
          fields: ["coluna cervical", "ombros", "ângulo tronco-braços", "shifts laterais", "pelve", "joelhos", "pés"],
        },
      ].map((vista) => (
        <div key={vista.prefix} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: B.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{vista.label}</p>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: B.muted, marginBottom: 6 }}>Cabeça</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <RadioGroup label="Inclinada" value={f[`${vista.prefix}_cabeca_inclinada`]} onChange={(v) => set(`${vista.prefix}_cabeca_inclinada`, v)} options={["D", "E"]} />
              <RadioGroup label="Rodada" value={f[`${vista.prefix}_cabeca_rodada`]} onChange={(v) => set(`${vista.prefix}_cabeca_rodada`, v)} options={["D", "E"]} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {vista.fields.map((fd) => (
              <Field
                key={fd}
                label={fd.charAt(0).toUpperCase() + fd.slice(1)}
                value={f[`${vista.prefix}_${fd.replace(/[/\s]/g, "_")}`]}
                onChange={(v) => set(`${vista.prefix}_${fd.replace(/[/\s]/g, "_")}`, v)}
                placeholder="—"
                small
              />
            ))}
          </div>
        </div>
      ))}

      <SectionTitle>Flexibilidade</SectionTitle>
      {[
        { title: "Membros Inferiores", muscles: ["Íliopsoas", "Quadríceps", "TFL", "Isquiotibiais", "Rotador lateral", "Rotador medial"] },
        { title: "Membros Superiores", muscles: ["Grande Dorsal", "Peitoral Maior", "Peitoral Menor"] },
      ].map(({ title, muscles }) => (
        <div key={title} style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: B.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
          {muscles.map((m) => (
            <div key={m} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              <Field label={`${m} D`} value={f[`flex_${m.replace(/\s/g, "_")}_D`]} onChange={(v) => set(`flex_${m.replace(/\s/g, "_")}_D`, v)} small />
              <Field label={`${m} E`} value={f[`flex_${m.replace(/\s/g, "_")}_E`]} onChange={(v) => set(`flex_${m.replace(/\s/g, "_")}_E`, v)} small />
            </div>
          ))}
        </div>
      ))}
      <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: B.tealDk, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Coluna Vertebral</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Sentar e Alcançar (cm)" value={f.flex_sentar} onChange={(v) => set("flex_sentar", v)} />
          <Field label="Fletir e Alcançar (cm)" value={f.flex_fletir} onChange={(v) => set("flex_fletir", v)} />
        </div>
      </div>

      <SectionTitle>Diretrizes para o Trabalho</SectionTitle>
      <Field label="Orientações e diretrizes para as sessões" value={f.guidelines} onChange={(v) => set("guidelines", v)} type="textarea" rows={5} />

      <div style={{ marginTop: 8 }}>
        <Btn full onClick={save}>
          💾 Salvar Anamnese Completa
        </Btn>
      </div>
    </div>
  );
}
