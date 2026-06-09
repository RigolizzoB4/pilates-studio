"use client";

import { memo } from "react";
import { B, WEEK_DAYS } from "./theme";
import { Avatar, StatCard, Tag } from "./primitives";
import { fmtCurrency, daysUntilBirthday } from "@/lib/pilates-utils";

const ReportsView = memo(({ patients, appointments, costs }) => {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const activePatients = patients.filter((p) => p.status === "active").length;
  const leadPatients = patients.filter((p) => p.status === "lead").length;
  const sessionsMonth = appointments.filter(
    (a) => a.date?.startsWith(thisMonth) && ["session", "evaluation", "trial"].includes(a.type),
  ).length;
  const revenueMonth = patients.reduce((t, p) => {
    return (
      t +
      (p.financial?.payments || [])
        .filter((pay) => pay.date?.startsWith(thisMonth))
        .reduce((s, pay) => s + pay.amount, 0)
    );
  }, 0);
  const totalCosts =
    (costs.aluguel || 0) +
    (costs.condominio || 0) +
    (costs.iptu || 0) +
    (costs.luz || 0) +
    (costs.agua || 0) +
    (costs.faxineira || 0) +
    (costs.papel || 0) +
    (costs.limpeza || 0) +
    (costs.outros || 0);
  const profit = revenueMonth - totalCosts - (revenueMonth * (costs.reserva_pct || 10)) / 100;

  const byDay = Array(6).fill(0);
  appointments
    .filter((a) => a.date?.startsWith(thisMonth) && a.type === "session")
    .forEach((a) => {
      const d = new Date(a.date + "T12:00:00").getDay();
      const idx = d === 0 ? 5 : d - 1;
      if (idx >= 0 && idx < 6) byDay[idx]++;
    });
  const maxDay = Math.max(...byDay, 1);

  const upcoming = patients
    .filter((p) => p.anamnesis?.birthDate)
    .map((p) => ({ ...p, daysLeft: daysUntilBirthday(p.anamnesis.birthDate) }))
    .filter((p) => p.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const cancelledNoNotice = appointments.filter(
    (a) => a.date?.startsWith(thisMonth) && a.status === "cancelled_no_notice",
  ).length;
  const cancelledNotice = appointments.filter(
    (a) => a.date?.startsWith(thisMonth) && a.status === "cancelled_notice",
  ).length;
  const missed = appointments.filter((a) => a.date?.startsWith(thisMonth) && a.status === "missed").length;

  return (
    <div style={{ padding: 22, maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: B.dark, marginBottom: 20 }}>
        Relatório — {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 22 }}>
        <StatCard label="Alunos Ativos" value={activePatients} color={B.teal} icon="users" sub={`${leadPatients} leads`} />
        <StatCard label="Sessões no Mês" value={sessionsMonth} color={B.pink} icon="calendar" />
        <StatCard label="Receita" value={fmtCurrency(revenueMonth)} color={B.green} icon="money" />
        <StatCard label="Lucro Líquido" value={fmtCurrency(profit)} color={profit >= 0 ? B.green : B.red} icon="chart" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: B.dark, marginBottom: 14 }}>Frequência do Mês</h3>
          {[
            { label: "Realizadas", v: sessionsMonth, c: "#3d9e72" },
            { label: "Canceladas c/ aviso", v: cancelledNotice, c: "#c47c22" },
            { label: "Canceladas sem aviso", v: cancelledNoNotice, c: "#8a7a94" },
            { label: "Faltas sem avisar", v: missed, c: "#7a8898" },
          ].map(({ label, v, c }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: B.dark }}>{label}</span>
              <span style={{ fontWeight: 700, color: c, fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: B.dark, marginBottom: 14 }}>Sessões por Dia da Semana</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {WEEK_DAYS.map((d, i) => (
              <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: "100%",
                    background: B.borderLt,
                    borderRadius: 4,
                    position: "relative",
                    height: 80,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background: byDay[i] > 0 ? `linear-gradient(to top,${B.pink},${B.teal})` : B.border,
                      borderRadius: 4,
                      height: `${Math.max(6, (byDay[i] / maxDay) * 80)}px`,
                      transition: "height 0.4s",
                    }}
                  />
                  {byDay[i] > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: B.pink,
                      }}
                    >
                      {byDay[i]}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: B.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: B.dark, marginBottom: 14 }}>🎂 Aniversários Próximos</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: B.muted, fontSize: 14 }}>Nenhum nos próximos 30 dias</p>
          ) : (
            upcoming.slice(0, 6).map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${B.borderLt}` }}>
                <Avatar name={p.name} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: B.dark }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: B.muted }}>{new Date(p.anamnesis.birthDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</div>
                </div>
                <Tag color={p.daysLeft === 0 ? B.pink : B.amber}>{p.daysLeft === 0 ? "🎉 Hoje!" : p.daysLeft === 1 ? "amanhã" : `em ${p.daysLeft}d`}</Tag>
              </div>
            ))
          )}
        </div>

        <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: B.dark, marginBottom: 14 }}>Alunos por Status</h3>
          {[
            { l: "Ativos", c: B.green, n: activePatients },
            { l: "Leads", c: B.amber, n: leadPatients },
            { l: "Inativos", c: B.muted, n: patients.filter((p) => p.status === "inactive").length },
          ].map(({ l, c, n }) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: B.dark }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{n}</span>
              </div>
              <div style={{ height: 8, background: B.creamDk, borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: patients.length ? `${(n / patients.length) * 100}%` : "0%",
                    background: c,
                    borderRadius: 4,
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ReportsView.displayName = "ReportsView";

export default ReportsView;
