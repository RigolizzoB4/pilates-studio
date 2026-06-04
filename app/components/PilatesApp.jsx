"use client";

import dynamic from "next/dynamic";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
  useMemo,
  memo,
} from "react";
import { saveDB, loadDB, subscribeDB } from "@/lib/supabase";
import { isOverdue30Days, getMonthlyRevenueLast6Months } from "@/lib/finance-helpers";
import { setPilatesTheme, setPilatesFontScale } from "@/app/components/PwaTheme";
import { uid, fmtCurrency, daysUntilBirthday, toISO, fmtDate, fmtMonth, today } from "@/lib/pilates-utils";
import { generateReceipt } from "@/lib/pilates-receipt";
import {
  B,
  HOURS,
  CELL_H,
  WEEK_DAYS,
  APT_TYPES,
  APT_STATUS,
  PAY_TYPES,
  PAY_METHODS,
  SESSION_PRICE,
  PATIENT_STATUS,
  DEFAULT_COSTS,
  DEFAULT_REMINDERS,
} from "@/app/components/pilates/theme";
import {
  Icon,
  IC,
  Btn,
  Field,
  Avatar,
  Tag,
  StatCard,
  RadioGroup,
  mixAlpha,
} from "@/app/components/pilates/primitives";

const AnamnesisTab = dynamic(() => import("@/app/components/pilates/AnamnesisTab"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});
const InfoTab = dynamic(() => import("@/app/components/pilates/InfoTab"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});
const EvaluationTab = dynamic(() => import("@/app/components/pilates/EvaluationTab"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});
const ChatTab = dynamic(() => import("@/app/components/pilates/ChatTab"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});
const PostureTab = dynamic(() => import("@/app/components/pilates/PostureTab"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});
const ReportsView = dynamic(() => import("@/app/components/pilates/ReportsView"), {
  ssr: false,
  loading: () => <div style={{ padding: 22, color: "var(--pilates-muted)" }}>Carregando…</div>,
});

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════
const LS_KEY = (k) => `pilates_studio_v1_${k}`;
const readCache = (key, def) => {
  if (typeof window === "undefined") return def;
  try {
    const raw = localStorage.getItem(LS_KEY(key));
    if (!raw) return def;
    return JSON.parse(raw);
  } catch {
    return def;
  }
};
const writeCache = (key, val) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY(key), JSON.stringify(val));
  } catch {}
};
const errMsg = (e) =>
  e && typeof e === "object" && "message" in e && e.message
    ? String(e.message)
    : "Algo deu errado. Tente novamente.";

const getWeekDates = (date) => {
  const d = new Date(date),
    day = d.getDay(),
    diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return Array.from({ length: 6 }, (_, i) => {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    return dd;
  });
};

const isBirthdayToday = (bd) => {
  if (!bd) return false;
  const t = new Date(),
    b = new Date(bd);
  return b.getMonth() === t.getMonth() && b.getDate() === t.getDate();
};
const isBirthdayWeek = (bd) => daysUntilBirthday(bd) <= 7;

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ view, setView, onAdd, onSearch, onSettings }) => {
  const nav = [
    { id:'calendar',  icon:'calendar', title:'Agenda'     },
    { id:'patients',  icon:'users',    title:'Pacientes'  },
    { id:'financial', icon:'money',    title:'Financeiro' },
    { id:'costs',     icon:'costs',    title:'Custos'     },
    { id:'reports',   icon:'chart',    title:'Relatórios' },
    { id:'reminders', icon:'bell',     title:'Lembretes'  },
  ];
  return (
    <aside style={{width:70,background:B.sidebar,display:'flex',flexDirection:'column',alignItems:'center',padding:'16px 0 20px',gap:4,flexShrink:0}}>
      <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${B.pink},${B.teal})`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18,boxShadow:`0 4px 12px ${mixAlpha(B.pink, 33)}`}}>
        <span style={{color:B.white,fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:700}}>P</span>
      </div>
      {nav.map(n=>(
        <button key={n.id} title={n.title} onClick={()=>setView(n.id)}
          style={{width:48,height:48,borderRadius:12,border:'none',cursor:'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'center',background:view===n.id?B.pink:'transparent',color:view===n.id?B.white:B.mutedLt}}>
          <Icon d={IC[n.icon]} size={22}/>
        </button>
      ))}
      <div style={{flex:1}}/>
      <button type="button" title="Busca global" onClick={onSearch}
        style={{width:48,height:48,borderRadius:12,border:'none',cursor:'pointer',background:'transparent',color:B.mutedLt,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon d={IC.search} size={22}/>
      </button>
      <button type="button" title="Aparência e acessibilidade" onClick={onSettings}
        style={{width:48,height:48,borderRadius:12,border:'none',cursor:'pointer',background:'transparent',color:B.mutedLt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
        ⚙
      </button>
      <button type="button" title="Novo Paciente" onClick={onAdd}
        style={{width:48,height:48,borderRadius:12,border:'none',cursor:'pointer',background:mixAlpha(B.teal, 20),color:B.teal,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Icon d={IC.plus} size={22}/>
      </button>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
// CALENDAR VIEW (semana / mês, drag-and-drop)
// ═══════════════════════════════════════════════════════
const CalendarView = memo(({ appointments, patients, currentDate, setCurrentDate, onSlotClick, onAptClick, calendarMode, setCalendarMode, onMoveAppointment, overdueNames }) => {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const todayStr = toISO(new Date());
  const getPatient = useCallback((id) => patients.find((p) => p.id === id), [patients]);
  const aptsByDay = useCallback((dateStr) => appointments.filter((a) => a.date === dateStr), [appointments]);
  const birthdays = useMemo(
    () =>
      patients
        .filter((p) => p.anamnesis?.birthDate && isBirthdayWeek(p.anamnesis.birthDate))
        .sort((a, b) => daysUntilBirthday(a.anamnesis.birthDate) - daysUntilBirthday(b.anamnesis.birthDate)),
    [patients]
  );

  const getAptColor = (apt) => {
    if (apt.status) return APT_STATUS[apt.status]?.color || APT_TYPES[apt.type]?.color || B.teal;
    return APT_TYPES[apt.type]?.color || B.teal;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthCells = useMemo(() => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const dim = new Date(year, month + 1, 0).getDate();
    const cells = [...Array(firstDow).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const monthNav = (delta) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };
  const weekNav = (delta) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta * 7);
    setCurrentDate(d);
  };

  if (calendarMode === "month") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {overdueNames?.length > 0 && (
          <div
            style={{
              background: B.redLt,
              borderBottom: `1px solid ${B.red}`,
              padding: "8px 22px",
              fontSize: 13,
              fontWeight: 600,
              color: B.red,
              flexShrink: 0,
            }}
          >
            ⚠️ Inadimplência (+30d ou sem pagamento no mês): {overdueNames.join(" · ")}
          </div>
        )}
        {birthdays.length > 0 && (
          <div
            style={{
              background: `linear-gradient(90deg,${B.amberLt},#FFFBEB)`,
              borderBottom: `1px solid #FCD34D`,
              padding: "7px 22px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span>🎂</span>
            <div style={{ fontSize: 13, color: B.dark }}>
              {birthdays.map((p, i) => {
                const isToday = isBirthdayToday(p.anamnesis.birthDate),
                  days = daysUntilBirthday(p.anamnesis.birthDate);
                return (
                  <span key={p.id}>
                    {i > 0 && " · "}
                    <strong>{p.name}</strong>
                    {isToday ? (
                      <span style={{ color: B.pink, fontWeight: 700 }}> 🎉 Hoje!</span>
                    ) : (
                      <span style={{ color: B.muted }}> em {days}d</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <div
          style={{
            padding: "14px 22px",
            background: B.white,
            borderBottom: `1px solid ${B.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 21,
              fontWeight: 600,
              color: B.dark,
              flex: 1,
              textTransform: "capitalize",
            }}
          >
            {fmtMonth(currentDate)}
          </h1>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setCalendarMode("week")}
              style={{
                padding: "8px 14px",
                minHeight: 44,
                borderRadius: 8,
                border: `1.5px solid ${B.border}`,
                background: B.white,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode("month")}
              style={{
                padding: "8px 14px",
                minHeight: 44,
                borderRadius: 8,
                border: `2px solid ${B.pink}`,
                background: B.pinkFaint,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Mês
            </button>
          </div>
          <button
            type="button"
            onClick={() => monthNav(-1)}
            style={{
              background: "none",
              border: `1.5px solid ${B.border}`,
              borderRadius: 8,
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: B.dark,
            }}
          >
            <Icon d={IC.chevL} size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            style={{
              background: B.creamDk,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              minHeight: 44,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: B.dark,
            }}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => monthNav(1)}
            style={{
              background: "none",
              border: `1.5px solid ${B.border}`,
              borderRadius: 8,
              width: 44,
              height: 44,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: B.dark,
            }}
          >
            <Icon d={IC.chevR} size={16} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: B.creamMd, borderBottom: `1px solid ${B.border}` }}>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <div key={d} style={{ padding: "10px", fontSize: 11, fontWeight: 700, color: B.muted, textAlign: "center" }}>
              {d}
            </div>
          ))}
        </div>
        <div className="pilates-scroll" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", minHeight: 400 }}>
            {monthCells.map((day, idx) => {
              if (day == null)
                return <div key={`e-${idx}`} style={{ border: `1px solid ${B.borderLt}`, minHeight: 96, background: B.cream }} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayApts = aptsByDay(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  onClick={() => onSlotClick(dateStr, 9)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("application/x-apt-id");
                    if (id && onMoveAppointment) onMoveAppointment(id, dateStr, 9);
                  }}
                  style={{
                    border: `1px solid ${B.borderLt}`,
                    minHeight: 110,
                    padding: 6,
                    background: isToday ? B.pinkFaint : B.white,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: isToday ? B.pinkDk : B.dark, marginBottom: 4 }}>{day}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {dayApts.slice(0, 4).map((apt) => {
                      const color = getAptColor(apt);
                      const pt = apt.patientId ? getPatient(apt.patientId) : null;
                      return (
                        <div
                          key={apt.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/x-apt-id", apt.id);
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAptClick(apt);
                          }}
                          style={{
                            background: color,
                            color: B.white,
                            borderRadius: 6,
                            padding: "4px 6px",
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: "grab",
                          }}
                        >
                          {apt.startHour}h {pt ? pt.name.slice(0, 12) : apt.title || "—"}
                        </div>
                      );
                    })}
                    {dayApts.length > 4 && (
                      <span style={{ fontSize: 10, color: B.muted }}>+{dayApts.length - 4}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {overdueNames?.length > 0 && (
        <div
          style={{
            background: B.redLt,
            borderBottom: `1px solid ${B.red}`,
            padding: "8px 22px",
            fontSize: 13,
            fontWeight: 600,
            color: B.red,
            flexShrink: 0,
          }}
        >
          ⚠️ Atenção financeira: {overdueNames.join(" · ")}
        </div>
      )}
      {birthdays.length > 0 && (
        <div style={{ background: `linear-gradient(90deg,${B.amberLt},#FFFBEB)`, borderBottom: `1px solid #FCD34D`, padding: "7px 22px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span>🎂</span>
          <div style={{ fontSize: 13, color: B.dark }}>
            {birthdays.map((p, i) => {
              const isToday = isBirthdayToday(p.anamnesis.birthDate),
                days = daysUntilBirthday(p.anamnesis.birthDate);
              return (
                <span key={p.id}>
                  {i > 0 && " · "}
                  <strong>{p.name}</strong>
                  {isToday ? <span style={{ color: B.pink, fontWeight: 700 }}> 🎉 Hoje!</span> : <span style={{ color: B.muted }}> em {days}d</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: "16px 22px", background: B.white, borderBottom: `1px solid ${B.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600, color: B.dark, flex: 1, textTransform: "capitalize" }}>{fmtMonth(currentDate)}</h1>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => setCalendarMode("week")} style={{ padding: "8px 14px", minHeight: 44, borderRadius: 8, border: `2px solid ${B.pink}`, background: B.pinkFaint, fontWeight: 600, cursor: "pointer" }}>
            Semana
          </button>
          <button type="button" onClick={() => setCalendarMode("month")} style={{ padding: "8px 14px", minHeight: 44, borderRadius: 8, border: `1.5px solid ${B.border}`, background: B.white, fontWeight: 600, cursor: "pointer" }}>
            Mês
          </button>
        </div>
        <button type="button" onClick={() => weekNav(-1)} style={{ background: "none", border: `1.5px solid ${B.border}`, borderRadius: 8, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: B.dark }}>
          <Icon d={IC.chevL} size={16} />
        </button>
        <button type="button" onClick={() => setCurrentDate(new Date())} style={{ background: B.creamDk, border: "none", borderRadius: 8, padding: "8px 14px", minHeight: 44, cursor: "pointer", fontSize: 13, fontWeight: 500, color: B.dark }}>
          Hoje
        </button>
        <button type="button" onClick={() => weekNav(1)} style={{ background: "none", border: `1.5px solid ${B.border}`, borderRadius: 8, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: B.dark }}>
          <Icon d={IC.chevR} size={16} />
        </button>
      </div>

      <div style={{ padding: "8px 22px", background: B.creamMd, borderBottom: `1px solid ${B.borderLt}`, display: "flex", gap: 14, flexWrap: "wrap", flexShrink: 0 }}>
        {Object.entries(APT_STATUS).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
            <span style={{ fontSize: 11, color: B.muted }}>{v.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "56px repeat(6,1fr)", borderBottom: `1px solid ${B.border}`, background: B.creamMd, flexShrink: 0 }}>
        <div style={{ height: 50 }} />
        {weekDates.map((d, i) => {
          const isToday = toISO(d) === todayStr;
          return (
            <div key={i} style={{ height: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${B.borderLt}` }}>
              <span style={{ fontSize: 10, color: B.mutedLt, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{WEEK_DAYS[i].slice(0, 3)}</span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  marginTop: 2,
                  color: isToday ? B.white : B.dark,
                  background: isToday ? `linear-gradient(135deg,${B.pink},${B.pinkDk})` : "transparent",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pilates-scroll" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px repeat(6,1fr)", minWidth: 640 }}>
          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div style={{ height: CELL_H, borderBottom: `1px solid ${B.borderLt}`, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 6, background: B.creamMd }}>
                <span style={{ fontSize: 11, color: B.mutedLt, fontWeight: 500 }}>{hour}:00</span>
              </div>
              {weekDates.map((d, di) => {
                const dateStr = toISO(d);
                const apts = aptsByDay(dateStr).filter((a) => parseInt(a.startHour) === hour);
                return (
                  <div
                    key={`${hour}-${di}`}
                    onClick={() => onSlotClick(dateStr, hour)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("application/x-apt-id");
                      if (id && onMoveAppointment) onMoveAppointment(id, dateStr, hour);
                    }}
                    style={{ height: CELL_H, borderBottom: `1px solid ${B.borderLt}`, borderLeft: `1px solid ${B.borderLt}`, position: "relative", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = B.pinkFaint)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {apts.map((apt) => {
                      const span = Math.max(1, parseInt(apt.endHour || apt.startHour + 1) - parseInt(apt.startHour));
                      const color = getAptColor(apt);
                      const pt = apt.patientId ? getPatient(apt.patientId) : null;
                      return (
                        <div
                          key={apt.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/x-apt-id", apt.id);
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAptClick(apt);
                          }}
                          style={{
                            position: "absolute",
                            top: 3,
                            left: 3,
                            right: 3,
                            height: span * CELL_H - 6,
                            background: color,
                            borderRadius: 7,
                            padding: "5px 8px",
                            color: B.white,
                            fontSize: 12,
                            fontWeight: 500,
                            overflow: "hidden",
                            zIndex: 2,
                            cursor: "grab",
                            boxShadow: `0 2px 6px ${color}55`,
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pt ? pt.name : apt.title || APT_TYPES[apt.type]?.label || "Sessão"}</div>
                          <div style={{ opacity: 0.85, fontSize: 11 }}>
                            {APT_TYPES[apt.type]?.label} · {apt.startHour}h
                          </div>
                          {apt.status && apt.status !== "confirmed" && <div style={{ fontSize: 10, opacity: 0.9, marginTop: 1 }}>{APT_STATUS[apt.status]?.label}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});
CalendarView.displayName = "CalendarView";

// ═══════════════════════════════════════════════════════
// PATIENTS VIEW
// ═══════════════════════════════════════════════════════
const PatientsView = ({ patients, onSelect, onAdd }) => {
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const filtered=patients.filter(p=>{
    const matchSearch=p.name?.toLowerCase().includes(search.toLowerCase())||p.phone?.includes(search)||p.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter=filter==='all'||p.status===filter;
    return matchSearch&&matchFilter;
  });
  const counts={all:patients.length,...Object.fromEntries(Object.keys(PATIENT_STATUS).map(k=>[k,patients.filter(p=>p.status===k).length]))};

  return (
    <div style={{padding:'22px',maxWidth:860,margin:'0 auto',width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:20,gap:14}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:25,fontWeight:600,color:B.dark,flex:1}}>Pacientes</h1>
        <Btn onClick={onAdd}><Icon d={IC.plus} size={15} color={B.white}/>Novo</Btn>
      </div>

      {/* Filter pills */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[{k:'all',l:'Todos'},{k:'active',l:'Ativos'},{k:'lead',l:'Leads'},{k:'inactive',l:'Inativos'}].map(({k,l})=>(
          <button key={k} onClick={()=>setFilter(k)}
            style={{padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filter===k?B.pink:B.border}`,background:filter===k?B.pinkFaint:B.white,color:filter===k?B.pinkDk:B.muted,fontSize:13,fontWeight:filter===k?600:400,cursor:'pointer'}}>
            {l} <span style={{fontSize:12,color:filter===k?B.pink:B.mutedLt}}>({counts[k]||0})</span>
          </button>
        ))}
      </div>

      <div style={{position:'relative',marginBottom:16}}>
        <div style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:B.muted}}>
          <Icon d={IC.search} size={16}/>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou e-mail…"
          style={{width:'100%',padding:'10px 14px 10px 40px',border:`1.5px solid ${B.border}`,borderRadius:10,background:B.white,fontSize:14,color:B.dark,outline:'none'}}/>
      </div>

      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'60px 20px',color:B.muted,background:B.white,borderRadius:14,border:`2px dashed ${B.border}`}}>
          <Icon d={IC.users} size={48} color={B.border}/>
          <p style={{fontSize:15,marginTop:14}}>Nenhum paciente encontrado</p>
          <div style={{marginTop:16}}><Btn onClick={onAdd}><Icon d={IC.plus} size={15} color={B.white}/>Adicionar</Btn></div>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(p=>{
            const st=PATIENT_STATUS[p.status||'lead'];
            const hasBday=p.anamnesis?.birthDate&&isBirthdayToday(p.anamnesis.birthDate);
            const overdue = isOverdue30Days(p);
            return (
              <div key={p.id} onClick={()=>onSelect(p)}
                style={{background:B.white,border:`1px solid ${overdue?B.red:B.border}`,borderRadius:12,padding:'13px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.08)';e.currentTarget.style.borderColor=B.pink;}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor=overdue?B.red:B.border;}}>
                <Avatar name={p.name} size={44}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:B.dark,fontSize:14}}>{p.name} {hasBday&&'🎂'}</div>
                  <div style={{fontSize:12,color:B.muted,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.email||''}{p.phone?` · ${p.phone}`:''}</div>
                </div>
                {overdue && <span style={{background:B.redLt,color:B.red,fontSize:11,fontWeight:700,padding:'4px 8px',borderRadius:20}}>Inadimplente</span>}
                <Tag color={st.color}>{st.label}</Tag>
                <Icon d={IC.chevR} size={16} color={B.mutedLt}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PATIENT TABS
// ═══════════════════════════════════════════════════════

// Sessions Tab
const SessionsTab = ({ patient, appointments, updatePatient }) => {
  const [note,setNote]=useState(''), [date,setDate]=useState(today()), [type,setType]=useState('Sessão');
  const [charged,setCharged]=useState(true);
  const [sessions,setSessions]=useState(patient.sessionLogs||[]);
  const thisMonth=new Date().toISOString().slice(0,7);
  const monthSessions=[...sessions,...appointments.filter(a=>a.patientId===patient.id)].filter(s=>((s.date||'').startsWith(thisMonth))).length;

  const addLog=async()=>{
    if(!note.trim()) return;
    const s={id:uid(),date,type,notes:note,charged,ts:Date.now()};
    const updated=[s,...sessions].sort((a,b)=>b.date.localeCompare(a.date));
    setSessions(updated);
    setNote('');
    await updatePatient({...patient,sessionLogs:updated});
  };

  const calApts=appointments.filter(a=>a.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date));

  const getStatusColor=apt=>{
    if(!apt.status||apt.status==='confirmed') return B.green;
    return APT_STATUS[apt.status]?.color||B.green;
  };

  return (
    <div style={{maxWidth:680}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:B.dark}}>Histórico de Sessões</h3>
          <p style={{fontSize:13,color:B.muted,marginTop:2}}>
            <strong style={{color:B.pink}}>{monthSessions}</strong> sessão(ões) este mês
          </p>
        </div>
        <div style={{background:B.pinkFaint,border:`1.5px solid ${B.pinkLt}`,borderRadius:10,padding:'8px 16px',textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:700,color:B.pink}}>{monthSessions}</div>
          <div style={{fontSize:10,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px'}}>Sessões/mês</div>
        </div>
      </div>

      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:12,padding:18,marginBottom:20}}>
        <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12}}>✍️ Registrar Sessão Manual</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8}}>
          <Field label="Data" value={date} onChange={setDate} type="date" small/>
          <Field label="Tipo" value={type} onChange={setType} type="select" opts={['Sessão','Avaliação','Reforço','Experimental']} small/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:10}}>
          <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:14,color:B.dark}}>
            <input type="checkbox" checked={charged} onChange={e=>setCharged(e.target.checked)} style={{accentColor:B.pink,width:16,height:16}}/>
            Cobrar sessão (R$ {SESSION_PRICE})
          </label>
        </div>
        <Field label="Observações da sessão" value={note} onChange={setNote} type="textarea" rows={3}
          placeholder="Exercícios realizados, evolução, dificuldades, observações clínicas…"/>
        <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
          <Btn small variant="teal" onClick={addLog} disabled={!note.trim()}>Salvar Sessão</Btn>
          {sessions.length>0&&<Btn small variant="secondary" onClick={()=>generateReceipt(patient,date,charged?SESSION_PRICE:0,sessions.length)}>
            <Icon d={IC.receipt} size={14}/>PDF Recibo
          </Btn>}
        </div>
      </div>

      {calApts.length>0&&(
        <div style={{marginBottom:18}}>
          <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>📅 Agendamentos na Agenda</p>
          {calApts.slice(0,8).map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',background:B.white,border:`1px solid ${B.border}`,borderRadius:8,marginBottom:5}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:getStatusColor(a),flexShrink:0}}/>
              <span style={{fontSize:13,color:B.dark,flex:1}}>{fmtDate(a.date+'T00:00:00')}</span>
              <Tag color={APT_TYPES[a.type]?.color||B.teal}>{APT_TYPES[a.type]?.label||'Sessão'}</Tag>
              {a.status&&<Tag color={APT_STATUS[a.status]?.color||B.green}>{APT_STATUS[a.status]?.label}</Tag>}
              {a.cancelledWithNotice!==undefined&&(
                <Tag color={a.cancelledWithNotice?B.amber:B.red}>{a.cancelledWithNotice?'c/ aviso':'sem aviso'}</Tag>
              )}
              <span style={{fontSize:11,color:B.muted}}>{a.startHour}h</span>
            </div>
          ))}
        </div>
      )}

      {sessions.length>0&&(
        <div>
          <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>📋 Registros Manuais</p>
          {sessions.map((s,i)=>(
            <div key={s.id} style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:10,padding:14,marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <Tag color={B.teal}>{s.type}</Tag>
                <span style={{fontSize:12,color:B.muted}}>{fmtDate(s.date+'T00:00:00')}</span>
                {!s.charged&&<Tag color={B.muted}>Não cobrada</Tag>}
                <div style={{flex:1}}/>
                <Btn small variant="ghost" onClick={()=>generateReceipt(patient,s.date,SESSION_PRICE,sessions.length-i)}>
                  <Icon d={IC.receipt} size={13}/>
                </Btn>
              </div>
              <p style={{fontSize:14,color:B.dark,lineHeight:1.6}}>{s.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



// Financial Tab (per patient)
const FinancialTab = ({ patient, updatePatient }) => {
  const [fin,setFin]=useState(patient.financial||{payType:'per_session',monthlyValue:0,payments:[]});
  const [payDate,setPayDate]=useState(today());
  const [payAmount,setPayAmount]=useState(String(SESSION_PRICE));
  const [payMethod,setPayMethod]=useState('Pix');
  const [payNote,setPayNote]=useState('');
  const thisMonth=new Date().toISOString().slice(0,7);

  const saveFin=async(updated)=>{setFin(updated);await updatePatient({...patient,financial:updated});};

  const addPayment=async()=>{
    if(!payAmount) return;
    const p={id:uid(),date:payDate,amount:parseFloat(payAmount),method:payMethod,note:payNote};
    await saveFin({...fin,payments:[p,...(fin.payments||[])]});
    setPayAmount(String(SESSION_PRICE)); setPayNote('');
  };

  const removePayment=async(id)=>saveFin({...fin,payments:fin.payments.filter(p=>p.id!==id)});

  const monthPays=(fin.payments||[]).filter(p=>p.date?.startsWith(thisMonth));
  const totalMonth=monthPays.reduce((s,p)=>s+p.amount,0);
  const totalAll=(fin.payments||[]).reduce((s,p)=>s+p.amount,0);

  // Session count this month from calendar
  const METHODCOLOR={'Pix':B.green,'Dinheiro':B.amber,'Transferência':B.teal};

  return (
    <div style={{maxWidth:580}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:B.dark,marginBottom:18}}>Financeiro</h3>

      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
        <div style={{background:B.greenLt,border:`1px solid #A7F3D0`,borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:700,color:B.green}}>{fmtCurrency(totalMonth)}</div>
          <div style={{fontSize:11,color:B.muted,marginTop:3}}>Recebido este mês</div>
        </div>
        <div style={{background:B.pinkFaint,border:`1px solid ${B.pinkLt}`,borderRadius:12,padding:'14px 16px',textAlign:'center'}}>
          <div style={{fontSize:22,fontWeight:700,color:B.pink}}>{fmtCurrency(totalAll)}</div>
          <div style={{fontSize:11,color:B.muted,marginTop:3}}>Total histórico</div>
        </div>
      </div>

      {/* Payment type */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12}}>Modalidade de Pagamento</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {Object.entries(PAY_TYPES).map(([k,v])=>(
            <div key={k} onClick={()=>saveFin({...fin,payType:k})}
              style={{padding:'10px 14px',borderRadius:10,border:`2px solid ${fin.payType===k?B.pink:B.border}`,background:fin.payType===k?B.pinkFaint:B.white,cursor:'pointer',textAlign:'center'}}>
              <div style={{fontSize:13,fontWeight:600,color:fin.payType===k?B.pinkDk:B.dark}}>{v.label}</div>
              {k==='per_session'&&<div style={{fontSize:12,color:B.muted,marginTop:2}}>R$ {SESSION_PRICE}/sessão</div>}
            </div>
          ))}
        </div>
        {fin.payType!=='per_session'&&(
          <div style={{marginTop:12}}>
            <Field label="Valor mensal (R$)" value={fin.monthlyValue} onChange={v=>saveFin({...fin,monthlyValue:parseFloat(v)||0})} type="number"/>
          </div>
        )}
      </div>

      {/* Register payment */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:12,padding:16,marginBottom:16}}>
        <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:12}}>💰 Registrar Pagamento</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:8}}>
          <Field label="Data" value={payDate} onChange={setPayDate} type="date" small/>
          <Field label="Valor (R$)" value={payAmount} onChange={setPayAmount} type="number" small/>
          <Field label="Forma" value={payMethod} onChange={setPayMethod} type="select" opts={PAY_METHODS} small/>
        </div>
        <Field label="Referência (opcional)" value={payNote} onChange={setPayNote} placeholder="Ex: Março/2026" small/>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <Btn small variant="secondary" onClick={()=>generateReceipt(patient,payDate,parseFloat(payAmount)||SESSION_PRICE)}>
            <Icon d={IC.receipt} size={13}/>Recibo PDF
          </Btn>
          <Btn small onClick={addPayment} disabled={!payAmount}>Registrar</Btn>
        </div>
      </div>

      {/* History */}
      {(fin.payments||[]).length>0&&(
        <div>
          <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Histórico</p>
          {(fin.payments||[]).map(p=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:B.white,border:`1px solid ${B.border}`,borderRadius:8,marginBottom:6}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:B.dark}}>{fmtCurrency(p.amount)}</div>
                {p.note&&<div style={{fontSize:12,color:B.muted}}>{p.note}</div>}
              </div>
              <div style={{fontSize:12,color:B.muted}}>{fmtDate(p.date+'T00:00:00')}</div>
              <Tag color={METHODCOLOR[p.method]||B.muted}>{p.method}</Tag>
              <button onClick={()=>removePayment(p.id)} style={{background:'none',border:'none',cursor:'pointer',color:B.mutedLt,padding:4}}>
                <Icon d={IC.trash} size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PATIENT DETAIL WRAPPER
// ═══════════════════════════════════════════════════════
const PatientDetailView = ({ patient, appointments, updatePatient, onBack }) => {
  const [tab,setTab]=useState('info');
  const tabs=[
    {id:'info',     icon:'user',    label:'Dados'      },
    {id:'anamnesis',icon:'clip',    label:'Anamnese'   },
    {id:'sessions', icon:'history', label:'Sessões'    },
    {id:'posture',  icon:'camera',  label:'Postura'    },
    {id:'eval',     icon:'star',    label:'Avaliação'  },
    {id:'financial',icon:'money',   label:'Financeiro' },
    {id:'chat',     icon:'chat',    label:'Consultar IA'},
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:B.white,borderBottom:`1px solid ${B.border}`,padding:'14px 22px 0',flexShrink:0}}>
        <button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:B.muted,display:'flex',alignItems:'center',gap:6,fontSize:13,marginBottom:12}}>
          <Icon d={IC.back} size={16}/> Voltar
        </button>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
          <Avatar name={patient.name} size={50}/>
          <div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600,color:B.dark}}>{patient.name}</h2>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:3,flexWrap:'wrap'}}>
              {patient.email&&<span style={{fontSize:13,color:B.muted}}>{patient.email}</span>}
              {patient.phone&&<span style={{fontSize:13,color:B.muted}}>· {patient.phone}</span>}
              <Tag color={PATIENT_STATUS[patient.status||'lead']?.color||B.amber}>{PATIENT_STATUS[patient.status||'lead']?.label}</Tag>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:2,overflowX:'auto',marginBottom:-1}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:'none',border:'none',cursor:'pointer',padding:'8px 14px',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5,borderBottom:tab===t.id?`2.5px solid ${B.pink}`:'2.5px solid transparent',color:tab===t.id?B.pink:B.muted,marginBottom:-1,transition:'color 0.15s',whiteSpace:'nowrap'}}>
              <Icon d={IC[t.icon]} size={13}/>{t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:22}}>
        {tab==='info'      &&<InfoTab       patient={patient} updatePatient={updatePatient}/>}
        {tab==='anamnesis' &&<AnamnesisTab  patient={patient} updatePatient={updatePatient}/>}
        {tab==='sessions'  &&<SessionsTab   patient={patient} appointments={appointments} updatePatient={updatePatient}/>}
        {tab==='posture'   &&<PostureTab    patient={patient} updatePatient={updatePatient}/>}
        {tab==='eval'      &&<EvaluationTab patient={patient} updatePatient={updatePatient}/>}
        {tab==='financial' &&<FinancialTab  patient={patient} updatePatient={updatePatient}/>}
        {tab==='chat'      &&<ChatTab       patient={patient} updatePatient={updatePatient}/>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// FINANCIAL VIEW (Global)
// ═══════════════════════════════════════════════════════
const FinancialView = memo(({ patients, appointments }) => {
  const series = useMemo(() => getMonthlyRevenueLast6Months(patients), [patients]);
  const maxR = useMemo(() => Math.max(...series.map((s) => s.revenue), 1), [series]);
  const thisMonth=new Date().toISOString().slice(0,7);
  const allPayments=patients.flatMap(p=>(p.financial?.payments||[]).map(pay=>({...pay,patientName:p.name,patientId:p.id})));
  const monthPayments=allPayments.filter(p=>p.date?.startsWith(thisMonth));
  const totalMonth=monthPayments.reduce((s,p)=>s+p.amount,0);
  const totalSessions=appointments.filter(a=>a.date?.startsWith(thisMonth)&&(a.type==='session'||a.type==='evaluation'||a.type==='trial')).length;
  const pending=patients.filter(p=>{
    if(p.status!=='active'||!p.financial) return false;
    const paid=(p.financial.payments||[]).filter(pay=>pay.date?.startsWith(thisMonth)).reduce((s,pay)=>s+pay.amount,0);
    const due=p.financial.payType==='per_session'?totalSessions*SESSION_PRICE:(p.financial.monthlyValue||0);
    return paid<due;
  });
  const METHODCOLOR={'Pix':B.green,'Dinheiro':B.amber,'Transferência':B.teal};

  return (
    <div style={{padding:22,maxWidth:860,margin:'0 auto',width:'100%'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:600,color:B.dark,marginBottom:20}}>
        Financeiro — {new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}
      </h1>
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18,marginBottom:20}}>
        <h3 style={{fontSize:15,fontWeight:600,color:B.dark,marginBottom:12}}>Receita — últimos 6 meses</h3>
        <div style={{display:'flex',alignItems:'flex-end',gap:8,height:140,paddingTop:8}}>
          {series.map((s) => (
            <div key={s.ym} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <div style={{width:'100%',background:B.borderLt,borderRadius:6,height:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                <div style={{width:'72%',background:`linear-gradient(to top,${B.pink},${B.teal})`,borderRadius:6,height:`${Math.max(8,(s.revenue/maxR)*100)}px`,transition:'height 0.35s'}}/>
              </div>
              <span style={{fontSize:10,color:B.muted,textAlign:'center'}}>{s.label}</span>
              <span style={{fontSize:11,fontWeight:700,color:B.green}}>{fmtCurrency(s.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
      {patients.filter((p) => isOverdue30Days(p)).length > 0 && (
        <div
          style={{
            background: B.redLt,
            border: `1.5px solid ${B.red}`,
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 18,
            fontSize: 14,
            fontWeight: 600,
            color: B.red,
          }}
        >
          ⚠️ {patients.filter((p) => isOverdue30Days(p)).length} paciente(s) com último pagamento há mais de 30 dias — verifique o financeiro.
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:24}}>
        <StatCard label="Receita do Mês"    value={fmtCurrency(totalMonth)}  color={B.green}  icon="money"/>
        <StatCard label="Sessões Realizadas" value={totalSessions}             color={B.teal}   icon="calendar"/>
        <StatCard label="Pendentes"         value={pending.length}            color={pending.length>0?B.red:B.green} icon="bell" sub={pending.length>0?pending.map(p=>p.name.split(' ')[0]).join(', '):'Todos em dia ✓'}/>
        <StatCard label="Ticket Médio"      value={totalSessions?fmtCurrency(totalMonth/totalSessions):'-'} color={B.pink} icon="chart"/>
      </div>

      {/* Who paid / who didn't */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20}}>
        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18}}>
          <h3 style={{fontSize:15,fontWeight:600,color:B.dark,marginBottom:14}}>✅ Pagaram este mês</h3>
          {patients.filter(p=>p.status==='active'&&(p.financial?.payments||[]).some(pay=>pay.date?.startsWith(thisMonth))).length===0?(
            <p style={{color:B.muted,fontSize:14}}>Nenhum ainda</p>
          ):(
            patients.filter(p=>p.status==='active'&&(p.financial?.payments||[]).some(pay=>pay.date?.startsWith(thisMonth))).map(p=>{
              const paid=(p.financial?.payments||[]).filter(pay=>pay.date?.startsWith(thisMonth)).reduce((s,pay)=>s+pay.amount,0);
              return(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${B.borderLt}`}}>
                  <Avatar name={p.name} size={32}/>
                  <span style={{flex:1,fontSize:13,color:B.dark}}>{p.name}</span>
                  <Tag color={B.green}>{fmtCurrency(paid)}</Tag>
                </div>
              );
            })
          )}
        </div>
        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18}}>
          <h3 style={{fontSize:15,fontWeight:600,color:B.dark,marginBottom:14}}>⏳ Pendentes</h3>
          {pending.length===0?(
            <div style={{textAlign:'center',padding:'20px 0'}}><div style={{fontSize:28}}>✅</div><p style={{color:B.green,fontWeight:600,marginTop:8}}>Todos em dia!</p></div>
          ):(
            pending.map(p=>{
              const paid=(p.financial?.payments||[]).filter(pay=>pay.date?.startsWith(thisMonth)).reduce((s,pay)=>s+pay.amount,0);
              const due=p.financial.payType==='per_session'?totalSessions*SESSION_PRICE:(p.financial.monthlyValue||0);
              return(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${B.borderLt}`}}>
                  <Avatar name={p.name} size={32}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:B.dark}}>{p.name}</div>
                    <div style={{fontSize:11,color:B.muted}}>Pago: {fmtCurrency(paid)}</div>
                  </div>
                  <Tag color={B.red}>{fmtCurrency(due-paid)}</Tag>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* All payments this month */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18}}>
        <h3 style={{fontSize:15,fontWeight:600,color:B.dark,marginBottom:14}}>Pagamentos Recebidos — {new Date().toLocaleDateString('pt-BR',{month:'long'})}</h3>
        {monthPayments.length===0?<p style={{color:B.muted,fontSize:14}}>Nenhum pagamento registrado este mês</p>:(
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {monthPayments.sort((a,b)=>b.date.localeCompare(a.date)).map(p=>(
              <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',background:B.creamMd,borderRadius:8}}>
                <Avatar name={p.patientName} size={32}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:B.dark}}>{p.patientName}</div>
                  {p.note&&<div style={{fontSize:11,color:B.muted}}>{p.note}</div>}
                </div>
                <span style={{fontSize:12,color:B.muted}}>{fmtDate(p.date+'T00:00:00')}</span>
                <Tag color={METHODCOLOR[p.method]||B.muted}>{p.method}</Tag>
                <span style={{fontWeight:700,color:B.green,fontSize:14}}>{fmtCurrency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
FinancialView.displayName = "FinancialView";

// ═══════════════════════════════════════════════════════
// COSTS VIEW
// ═══════════════════════════════════════════════════════
const CostsView = ({ costs, setCosts, patients }) => {
  const thisMonth=new Date().toISOString().slice(0,7);
  const allPayments=patients.flatMap(p=>(p.financial?.payments||[]).filter(pay=>pay.date?.startsWith(thisMonth)));
  const totalRevenue=allPayments.reduce((s,p)=>s+p.amount,0);

  const totalFixed=(costs.aluguel||0)+(costs.condominio||0)+(costs.iptu||0)+(costs.luz||0)+(costs.agua||0);
  const totalVar=(costs.faxineira||0)+(costs.papel||0)+(costs.limpeza||0)+(costs.outros||0);
  const totalCosts=totalFixed+totalVar;
  const reserveAmt=(totalRevenue*(costs.reserva_pct||10))/100;
  const profit=totalRevenue-totalCosts-reserveAmt;

  const set=(k,v)=>setCosts(prev=>({...prev,[k]:parseFloat(v)||0}));

  const CostField=({label,k})=>(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${B.borderLt}`}}>
      <span style={{flex:1,fontSize:14,color:B.dark}}>{label}</span>
      <div style={{position:'relative',width:140}}>
        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:13,color:B.muted}}>R$</span>
        <input type="number" value={costs[k]||''} onChange={e=>set(k,e.target.value)} placeholder="0"
          style={{width:'100%',padding:'7px 10px 7px 30px',border:`1.5px solid ${B.border}`,borderRadius:8,fontSize:14,color:B.dark,outline:'none',textAlign:'right'}}/>
      </div>
    </div>
  );

  return (
    <div style={{padding:22,maxWidth:760,margin:'0 auto',width:'100%'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:600,color:B.dark,marginBottom:6}}>Planilha de Custos</h1>
      <p style={{fontSize:13,color:B.muted,marginBottom:22}}>{new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:22}}>
        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18}}>
          <h3 style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px',display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:B.pink}}/>Custos Fixos Mensais
          </h3>
          <CostField label="Aluguel" k="aluguel"/>
          <CostField label="Condomínio" k="condominio"/>
          <CostField label="IPTU" k="iptu"/>
          <CostField label="Energia Elétrica" k="luz"/>
          <CostField label="Água" k="agua"/>
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontWeight:700,color:B.dark,borderTop:`2px solid ${B.border}`,marginTop:4}}>
            <span>Total Fixo</span><span style={{color:B.pink}}>{fmtCurrency(totalFixed)}</span>
          </div>
        </div>

        <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18}}>
          <h3 style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px',display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:B.amber}}/>Custos Variáveis
          </h3>
          <CostField label="Faxineira" k="faxineira"/>
          <CostField label="Papel / Material" k="papel"/>
          <CostField label="Produtos de Limpeza" k="limpeza"/>
          <CostField label="Outros" k="outros"/>
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontWeight:700,color:B.dark,borderTop:`2px solid ${B.border}`,marginTop:4}}>
            <span>Total Variável</span><span style={{color:B.amber}}>{fmtCurrency(totalVar)}</span>
          </div>
        </div>
      </div>

      {/* Vacation reserve */}
      <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,padding:18,marginBottom:20}}>
        <h3 style={{fontSize:14,fontWeight:700,color:B.tealDk,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px',display:'flex',alignItems:'center',gap:8}}>
          <Icon d={IC.vacation} size={18} color={B.teal}/>Reserva — Férias e Necessidades
        </h3>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:B.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>Percentual da receita (%)</label>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="range" min={0} max={30} value={costs.reserva_pct||10} onChange={e=>setCosts(p=>({...p,reserva_pct:parseInt(e.target.value)}))}
                style={{flex:1,accentColor:B.teal}}/>
              <span style={{fontSize:18,fontWeight:700,color:B.teal,minWidth:40}}>{costs.reserva_pct||10}%</span>
            </div>
          </div>
          <div style={{background:B.tealFaint,border:`1px solid ${B.tealLt}`,borderRadius:10,padding:'12px 18px',textAlign:'center',minWidth:140}}>
            <div style={{fontSize:22,fontWeight:700,color:B.teal}}>{fmtCurrency(reserveAmt)}</div>
            <div style={{fontSize:11,color:B.muted,marginTop:2}}>Reservar este mês</div>
          </div>
        </div>
      </div>

      {/* Profit summary */}
      <div style={{background:`linear-gradient(135deg,${B.pinkFaint},${B.tealFaint})`,border:`2px solid ${profit>=0?B.tealLt:B.pinkLt}`,borderRadius:14,padding:20}}>
        <h3 style={{fontSize:15,fontWeight:700,color:B.dark,marginBottom:14}}>Resumo Financeiro do Mês</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[
            {l:'Receita Total',v:totalRevenue,c:B.green},
            {l:'Custos Totais',v:totalCosts,c:B.red},
            {l:'Reserva',v:reserveAmt,c:B.teal},
            {l:'Lucro Líquido',v:profit,c:profit>=0?B.green:B.red,big:true},
          ].map(({l,v,c,big})=>(
            <div key={l} style={{background:B.white,borderRadius:10,padding:'12px 14px',border:`1px solid ${B.border}`}}>
              <div style={{fontSize:11,color:B.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>{l}</div>
              <div style={{fontSize:big?22:18,fontWeight:700,color:c}}>{fmtCurrency(v)}</div>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div style={{display:'flex',gap:4,height:12,borderRadius:6,overflow:'hidden',background:B.border}}>
          {totalRevenue>0&&<div style={{width:`${Math.min(100,profit>=0?(profit/totalRevenue*100):0)}%`,background:B.green,transition:'width 0.4s'}}/>}
          {totalRevenue>0&&<div style={{width:`${Math.min(100,(totalCosts/totalRevenue*100))}%`,background:B.red,transition:'width 0.4s'}}/>}
          {totalRevenue>0&&<div style={{width:`${Math.min(100,(reserveAmt/totalRevenue*100))}%`,background:B.teal,transition:'width 0.4s'}}/>}
        </div>
        <div style={{display:'flex',gap:14,marginTop:8}}>
          {[{c:B.green,l:'Lucro'},{c:B.red,l:'Custos'},{c:B.teal,l:'Reserva'}].map(({c,l})=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>
              <span style={{fontSize:11,color:B.muted}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// REMINDERS VIEW
// ═══════════════════════════════════════════════════════
const RemindersView = ({ reminders, setReminders }) => {
  const [newTitle,setNewTitle]=useState('');
  const [newType,setNewType]=useState('weekly');
  const [newWeekday,setNewWeekday]=useState(1);
  const [newHour,setNewHour]=useState(8);
  const [newInterval,setNewInterval]=useState(15);
  const [newEmoji,setNewEmoji]=useState('🔔');

  const WEEKDAY_NAMES=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const EMOJIS=['🔔','🌸','🧘','💊','🏋️','📋','🌺','⚡','💡','🎯'];

  const getScheduleText=r=>{
    if(r.type==='weekly') return `Toda ${WEEKDAY_NAMES[r.weekday]} às ${r.hour}h`;
    if(r.type==='interval') return `A cada ${r.intervalDays} dias`;
    return 'Personalizado';
  };

  const addReminder=async()=>{
    if(!newTitle.trim()) return;
    const r={id:uid(),title:newTitle,type:newType,weekday:newWeekday,hour:newHour,intervalDays:newInterval,emoji:newEmoji,active:true,lastSent:null};
    const updated=[...reminders,r];
    await setReminders(updated);
    setNewTitle(''); setNewEmoji('🔔');
  };

  const toggleReminder=async(id)=>{
    const updated=reminders.map(r=>r.id===id?{...r,active:!r.active}:r);
    await setReminders(updated);
  };

  const deleteReminder=async(id)=>{
    if (typeof window !== "undefined" && !window.confirm("Excluir este lembrete?")) return;
    const updated=reminders.filter(r=>r.id!==id);
    await setReminders(updated);
  };

  return (
    <div style={{padding:22,maxWidth:720,margin:'0 auto',width:'100%'}}>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:600,color:B.dark,marginBottom:6}}>Lembretes</h1>
      <p style={{fontSize:13,color:B.muted,marginBottom:22}}>Lembretes automáticos enviados pelo Telegram</p>

      {/* Active reminders */}
      <div style={{marginBottom:22}}>
        {reminders.map(r=>(
          <div key={r.id} style={{background:B.white,border:`1px solid ${r.active?B.tealLt:B.border}`,borderRadius:12,padding:'14px 18px',marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontSize:26}}>{r.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,color:B.dark,fontSize:14}}>{r.title}</div>
              <div style={{fontSize:12,color:B.muted,marginTop:2}}>{getScheduleText(r)}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <label style={{position:'relative',display:'inline-block',width:40,height:22,cursor:'pointer'}}>
                <input type="checkbox" checked={r.active} onChange={()=>toggleReminder(r.id)} style={{opacity:0,width:0,height:0}}/>
                <span style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:r.active?B.teal:B.border,borderRadius:11,transition:'0.2s'}}/>
                <span style={{position:'absolute',top:2,left:r.active?20:2,width:18,height:18,background:B.white,borderRadius:'50%',transition:'0.2s'}}/>
              </label>
              <button onClick={()=>deleteReminder(r.id)} style={{background:'none',border:'none',cursor:'pointer',color:B.mutedLt,padding:4}}>
                <Icon d={IC.trash} size={15}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{background:B.white,border:`2px dashed ${B.border}`,borderRadius:14,padding:20}}>
        <h3 style={{fontSize:15,fontWeight:600,color:B.dark,marginBottom:16}}>+ Novo Lembrete</h3>
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          {EMOJIS.map(e=>(
            <div key={e} onClick={()=>setNewEmoji(e)}
              style={{width:36,height:36,borderRadius:8,border:`2px solid ${newEmoji===e?B.pink:B.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,cursor:'pointer',background:newEmoji===e?B.pinkFaint:B.white}}>
              {e}
            </div>
          ))}
        </div>
        <Field label="Título do lembrete" value={newTitle} onChange={setNewTitle} placeholder="Ex: Comprar orquídea"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <Field label="Tipo" value={newType} onChange={setNewType} type="select"
            opts={[{value:'weekly',label:'Semanal'},{value:'interval',label:'A cada X dias'}]}/>
          {newType==='weekly'?(
            <Field label="Dia da semana" value={String(newWeekday)} onChange={v=>setNewWeekday(parseInt(v))} type="select"
              opts={WEEKDAY_NAMES.map((d,i)=>({value:String(i),label:d}))}/>
          ):(
            <Field label="Intervalo (dias)" value={newInterval} onChange={v=>setNewInterval(parseInt(v)||15)} type="number" min={1}/>
          )}
          {newType==='weekly'&&<Field label="Horário" value={newHour} onChange={v=>setNewHour(parseInt(v)||8)} type="number" min={0} max={23}/>}
        </div>
        <Btn onClick={addReminder} disabled={!newTitle.trim()}><Icon d={IC.plus} size={15} color={B.white}/>Adicionar Lembrete</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════
const emailOk = (s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

const Modal = ({ modal, patients, appointments, onClose, savePatients, saveAppointments, setSelectedPatient, setView }) => {
  const [f,setF]=useState(()=>{
    if(modal.type==='add-appointment') return {date:modal.date||'',startHour:modal.hour||8,endHour:(modal.hour||8)+1,type:'session',patientId:'',title:'',status:'confirmed',cancelledWithNotice:null,repeatCount:1,repeatGapWeeks:1};
    return {name:'',email:'',phone:'',status:'lead'};
  });
  const [busy,setBusy]=useState(false);
  const [formErr,setFormErr]=useState('');
  const set=(k,v)=>{ setFormErr(''); setF(p=>({...p,[k]:v})); };

  const submitPatient=async()=>{
    setFormErr('');
    if(!f.name?.trim()){ setFormErr('Informe o nome completo.'); return; }
    if(!emailOk(f.email)){ setFormErr('E-mail inválido.'); return; }
    const newP={...f,id:uid(),anamnesis:{},evaluations:[],postureAnalyses:[],chatHistory:[],sessionLogs:[]};
    setBusy(true);
    try {
      await savePatients([...patients,newP]);
      onClose();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const submitAppointment=async()=>{
    setFormErr('');
    if(!f.date){ setFormErr('Escolha a data.'); return; }
    const sh=parseInt(f.startHour,10), eh=parseInt(f.endHour,10);
    if(Number.isNaN(sh)||Number.isNaN(eh)){ setFormErr('Horários inválidos.'); return; }
    if(sh>=eh){ setFormErr('O horário de fim deve ser depois do início.'); return; }
    if(['session','evaluation','trial'].includes(f.type)&&!f.patientId){ setFormErr('Selecione a paciente.'); return; }
    if(['task','block','lunch'].includes(f.type)&&!String(f.title||'').trim()){ setFormErr('Informe um título.'); return; }
    setBusy(true);
    try {
      const count = Math.min(52, Math.max(1, parseInt(f.repeatCount, 10) || 1));
      const gap = Math.min(12, Math.max(1, parseInt(f.repeatGapWeeks, 10) || 1));
      const additions = [];
      for (let i = 0; i < count; i++) {
        const d = new Date(f.date + "T12:00:00");
        d.setDate(d.getDate() + i * 7 * gap);
        additions.push({
          ...f,
          id: uid(),
          date: toISO(d),
          startHour: sh,
          endHour: eh,
        });
      }
      await saveAppointments([...appointments, ...additions]);
      onClose();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const updateAppointmentStatus=async(status,extra={})=>{
    setBusy(true);
    try {
      const updated=appointments.map(a=>a.id===modal.apt?.id?{...a,status,...extra}:a);
      await saveAppointments(updated);
      onClose();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteApt=async()=>{
    if (typeof window !== "undefined" && !window.confirm('Excluir este agendamento? Esta ação não pode ser desfeita.')) return;
    setBusy(true);
    try {
      await saveAppointments(appointments.filter(a=>a.id!==modal.apt?.id));
      onClose();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const overlay={position:'fixed',inset:0,background:'rgba(26,26,46,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(3px)'};
  const box={background:B.white,borderRadius:18,padding:'26px 28px',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.22)'};

  return (
    <div style={overlay} onClick={busy ? undefined : onClose}>
      <div style={box} onClick={e=>e.stopPropagation()}>
        {formErr && (
          <p style={{ color: B.red, fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{formErr}</p>
        )}

        {modal.type==='add-patient'&&(
          <>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:B.dark,marginBottom:22}}>Nova Paciente</h2>
            <Field label="Nome completo *" value={f.name} onChange={v=>set('name',v)}/>
            <Field label="E-mail" value={f.email} onChange={v=>set('email',v)} type="email"/>
            <Field label="Telefone / WhatsApp" value={f.phone} onChange={v=>set('phone',v)}/>
            <Field label="Status inicial" value={f.status} onChange={v=>set('status',v)} type="select"
              opts={[{value:'lead',label:'Lead'},{value:'active',label:'Ativo'},{value:'inactive',label:'Inativo'}]}/>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
              <Btn variant="secondary" onClick={onClose} disabled={busy}>Cancelar</Btn>
              <Btn onClick={submitPatient} disabled={!f.name?.trim()||busy}>{busy?'Salvando…':'Criar Paciente'}</Btn>
            </div>
          </>
        )}

        {modal.type==='add-appointment'&&(
          <>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:B.dark,marginBottom:22}}>Novo Agendamento</h2>
            <Field label="Data" value={f.date} onChange={v=>set('date',v)} type="date"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Início (hora)" value={f.startHour} onChange={v=>set('startHour',v)} type="number" min={6} max={22}/>
              <Field label="Fim (hora)" value={f.endHour} onChange={v=>set('endHour',v)} type="number" min={6} max={22}/>
            </div>
            <Field label="Tipo" value={f.type} onChange={v=>set('type',v)} type="select"
              opts={Object.entries(APT_TYPES).map(([k,v])=>({value:k,label:v.label}))}/>
            <Field label="Status" value={f.status} onChange={v=>set('status',v)} type="select"
              opts={Object.entries(APT_STATUS).map(([k,v])=>({value:k,label:v.label}))}/>
            {(f.status==='cancelled_notice'||f.status==='cancelled_no_notice')&&(
              <RadioGroup label="Cancelou com antecedência?" value={f.cancelledWithNotice===true?'Sim':f.cancelledWithNotice===false?'Não':''} onChange={v=>set('cancelledWithNotice',v==='Sim')} options={['Sim','Não']}/>
            )}
            {['session','evaluation','trial'].includes(f.type)&&(
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:B.muted,marginBottom:5,textTransform:'uppercase',letterSpacing:'0.5px'}}>Paciente</label>
                <select value={f.patientId} onChange={e=>set('patientId',e.target.value)}
                  style={{width:'100%',padding:'9px 12px',border:`1.5px solid ${B.border}`,borderRadius:8,background:B.white,fontSize:14,color:B.dark,outline:'none'}}>
                  <option value="">-- sem paciente --</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            {['task','block','lunch'].includes(f.type)&&(
              <Field label="Título / Descrição" value={f.title} onChange={v=>set('title',v)}/>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Repetir (quantas vezes)" value={f.repeatCount} onChange={v=>set('repeatCount',parseInt(v,10)||1)} type="number" min={1} max={52}/>
              <Field label="Intervalo (semanas entre cada)" value={f.repeatGapWeeks} onChange={v=>set('repeatGapWeeks',parseInt(v,10)||1)} type="number" min={1} max={12}/>
            </div>
            <p style={{fontSize:12,color:B.muted,marginBottom:10}}>Use 1× para um único horário. Ex.: 4× com intervalo 1 semana = 4 semanas seguidas.</p>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
              <Btn variant="secondary" onClick={onClose} disabled={busy}>Cancelar</Btn>
              <Btn onClick={submitAppointment} disabled={busy}>{busy?'Salvando…':'Agendar'}</Btn>
            </div>
          </>
        )}

        {modal.type==='view-appointment'&&modal.apt&&(()=>{
          const apt=modal.apt;
          const pt=patients.find(p=>p.id===apt.patientId);
          const typeInfo=APT_TYPES[apt.type]||APT_TYPES.session;
          const statusInfo=APT_STATUS[apt.status||'confirmed'];
          return (
            <>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:statusInfo?.color||typeInfo.color,flexShrink:0}}/>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:B.dark}}>{pt?pt.name:apt.title||typeInfo.label}</h2>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                  {statusInfo&&<Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
                </div>
                <p style={{fontSize:14,color:B.muted}}>📅 {apt.date?fmtDate(apt.date+'T00:00:00'):'-'} · ⏰ {apt.startHour}h–{apt.endHour}h</p>
                {pt&&<p style={{fontSize:14,color:B.muted}}>👤 {pt.name} · {pt.phone||pt.email||''}</p>}
              </div>

              {/* Status quick-change */}
              <div style={{background:B.creamMd,borderRadius:10,padding:12,marginBottom:18}}>
                <p style={{fontSize:11,fontWeight:700,color:B.muted,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:10}}>Atualizar status</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {Object.entries(APT_STATUS).map(([k,v])=>(
                    <button key={k} disabled={busy} onClick={()=>{
                      const extra=k.includes('cancelled')?{cancelledWithNotice:k==='cancelled_notice'}:{};
                      updateAppointmentStatus(k,extra);
                    }}
                      style={{padding:'5px 12px',borderRadius:20,border:`2px solid ${apt.status===k?v.color:B.border}`,background:apt.status===k?`${v.color}22`:B.white,color:v.color,fontSize:12,fontWeight:600,cursor:busy?'not-allowed':'pointer',opacity:busy?0.5:1}}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{display:'flex',gap:8,justifyContent:'space-between'}}>
                <Btn variant="danger" small onClick={deleteApt} disabled={busy}><Icon d={IC.trash} size={14} color={B.white}/>{busy?'…':'Excluir'}</Btn>
                <div style={{display:'flex',gap:8}}>
                  {pt&&<Btn small variant="teal" onClick={()=>{setSelectedPatient(pt);setView('patient');onClose();}} disabled={busy}>Ver Paciente</Btn>}
                  <Btn variant="secondary" small onClick={onClose} disabled={busy}>Fechar</Btn>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════
export default function PilatesApp() {
  const [view, setView] = useState("calendar");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [costs, setCostsState] = useState(DEFAULT_COSTS);
  const [reminders, setRemindersState] = useState(DEFAULT_REMINDERS);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [calendarMode, setCalendarMode] = useState("week");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeChoice, setThemeChoice] = useState("system");
  const [fontScale, setFontScale] = useState(1);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((kind, text, ms = 3400) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ kind, text });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThemeChoice(localStorage.getItem("pilates_theme") || "system");
    setFontScale(parseFloat(localStorage.getItem("pilates_font_scale") || "1") || 1);
  }, []);

  const overdueNames = useMemo(
    () => patients.filter((p) => isOverdue30Days(p)).map((p) => p.name),
    [patients]
  );

  const searchResults = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return { patients: [], appointments: [] };
    const pMatch = patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.email?.toLowerCase().includes(q)
    );
    const aMatch = appointments.filter((a) => {
      const ds = (a.date || "").toLowerCase();
      const pt = patients.find((x) => x.id === a.patientId);
      const pn = pt?.name?.toLowerCase() || "";
      return ds.includes(q) || pn.includes(q) || String(a.startHour).includes(q);
    });
    return { patients: pMatch.slice(0, 12), appointments: aMatch.slice(0, 12) };
  }, [searchQ, patients, appointments]);

  const pushToCloud = useCallback(
    async (key, val, okMsg) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        showToast("info", "Salvo neste aparelho. Sincronizamos ao voltar a internet.");
        return;
      }
      setSavingKey(key);
      try {
        await saveDB(key, val);
        showToast("success", okMsg);
      } catch (e) {
        showToast("error", errMsg(e));
        throw e;
      } finally {
        setSavingKey(null);
      }
    },
    [showToast]
  );

  useEffect(() => {
    let cancelled = false;
    const cachedPts = readCache("pilates_patients", null);
    const cachedApts = readCache("pilates_appointments", null);
    const cachedCosts = readCache("pilates_costs", null);
    const cachedRem = readCache("pilates_reminders", null);
    if (cachedPts) setPatients(cachedPts);
    if (cachedApts) setAppointments(cachedApts);
    if (cachedCosts) setCostsState(cachedCosts);
    if (cachedRem) setRemindersState(cachedRem);
    if (cachedPts || cachedApts || cachedCosts || cachedRem) setLoading(false);

    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 15000);

    (async () => {
      try {
        const [pts, apts, c, r] = await Promise.all([
          loadDB("pilates_patients", cachedPts || []),
          loadDB("pilates_appointments", cachedApts || []),
          loadDB("pilates_costs", cachedCosts || DEFAULT_COSTS),
          loadDB("pilates_reminders", cachedRem || DEFAULT_REMINDERS),
        ]);
        if (cancelled) return;
        setPatients(pts);
        setAppointments(apts);
        setCostsState(c);
        setRemindersState(r);
        writeCache("pilates_patients", pts);
        writeCache("pilates_appointments", apts);
        writeCache("pilates_costs", c);
        writeCache("pilates_reminders", r);
      } catch {
        showToast("error", "Não foi possível sincronizar com o servidor. Usando dados locais.");
      } finally {
        clearTimeout(safety);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [showToast]);

  useEffect(() => {
    const unsubP = subscribeDB("pilates_patients", (val) => {
      if (Array.isArray(val)) {
        setPatients(val);
        writeCache("pilates_patients", val);
      }
    });
    const unsubA = subscribeDB("pilates_appointments", (val) => {
      if (Array.isArray(val)) {
        setAppointments(val);
        writeCache("pilates_appointments", val);
      }
    });
    return () => {
      unsubP();
      unsubA();
    };
  }, []);

  useEffect(() => {
    const syncFlag = () => {
      if (typeof navigator === "undefined") return;
      setOnline(navigator.onLine);
    };
    syncFlag();

    const handleOnline = async () => {
      setOnline(true);
      showToast("info", "Conectado. Sincronizando…", 2200);
      try {
        const pts = readCache("pilates_patients", []);
        const apts = readCache("pilates_appointments", []);
        const c = readCache("pilates_costs", DEFAULT_COSTS);
        const r = readCache("pilates_reminders", DEFAULT_REMINDERS);
        await Promise.all([
          saveDB("pilates_patients", pts),
          saveDB("pilates_appointments", apts),
          saveDB("pilates_costs", c),
          saveDB("pilates_reminders", r),
        ]);
        showToast("success", "Dados enviados para a nuvem.");
      } catch (e) {
        showToast("error", errMsg(e));
      }
    };
    const handleOffline = () => {
      setOnline(false);
      showToast("info", "Sem internet. As alterações ficam salvas neste aparelho.");
    };
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [showToast]);

  const savePatients = async (pts) => {
    setPatients(pts);
    writeCache("pilates_patients", pts);
    await pushToCloud("pilates_patients", pts, "Pacientes atualizados.");
  };
  const saveAppointments = async (apts) => {
    setAppointments(apts);
    writeCache("pilates_appointments", apts);
    await pushToCloud("pilates_appointments", apts, "Agenda atualizada.");
  };

  const onMoveAppointment = async (aptId, newDate, newHour) => {
    const sh = parseInt(newHour, 10);
    const next = appointments.map((a) =>
      a.id === aptId ? { ...a, date: newDate, startHour: sh, endHour: sh + 1 } : a
    );
    await saveAppointments(next);
  };
  const setCosts = async (fn) => {
    const updated = typeof fn === "function" ? fn(costs) : fn;
    setCostsState(updated);
    writeCache("pilates_costs", updated);
    await pushToCloud("pilates_costs", updated, "Custos salvos.");
  };
  const setReminders = async (updated) => {
    setRemindersState(updated);
    writeCache("pilates_reminders", updated);
    await pushToCloud("pilates_reminders", updated, "Lembretes salvos.");
  };

  const updatePatient = async (updated) => {
    const pts = patients.map((p) => (p.id === updated.id ? updated : p));
    await savePatients(pts);
    setSelectedPatient(updated);
  };

  const navTo = (v) => {
    setView(v);
    if (v !== "patient") setSelectedPatient(null);
  };

  const toastBg =
    toast?.kind === "success"
      ? B.greenLt
      : toast?.kind === "error"
        ? B.redLt
        : B.tealLt;
  const toastBorder =
    toast?.kind === "success"
      ? B.green
      : toast?.kind === "error"
        ? B.red
        : B.teal;

  if (loading && patients.length === 0 && appointments.length === 0)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: B.cream,
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: B.muted }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${B.pink},${B.teal})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: `0 6px 20px ${mixAlpha(B.pink, 33)}`,
            }}
          >
            <span style={{ color: B.white, fontSize: 26, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>P</span>
          </div>
          <p style={{ fontSize: 14 }}>Carregando Studio…</p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'DM Sans',sans-serif",
        background: B.cream,
        color: B.dark,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${B.creamDk};}
        ::-webkit-scrollbar-thumb{background:${B.pinkLt};border-radius:4px;}
        input:focus,textarea:focus,select:focus{border-color:${B.pink}!important;box-shadow:0 0 0 3px ${B.pinkLt}55!important;}
        button:active{transform:scale(0.97);}
      `}</style>

      {!online && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 70,
            right: 0,
            zIndex: 150,
            background: B.amberLt,
            borderBottom: `1px solid ${B.amber}`,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: B.dark,
            textAlign: "center",
          }}
        >
          Modo offline — alterações sincronizam ao reconectar
        </div>
      )}

      {savingKey && (
        <div
          style={{
            position: "fixed",
            bottom: 72,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 160,
            background: B.white,
            border: `1px solid ${B.border}`,
            borderRadius: 20,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: B.pinkDk,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          Salvando na nuvem…
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            right: 20,
            maxWidth: 420,
            margin: "0 auto",
            zIndex: 300,
            background: toastBg,
            border: `1.5px solid ${toastBorder}`,
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 14,
            color: B.dark,
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
          role="status"
        >
          {toast.text}
        </div>
      )}

      <Sidebar
        view={view}
        setView={navTo}
        onAdd={() => setModal({ type: "add-patient" })}
        onSearch={() => setSearchOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <div
        className="pilates-view-swap"
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingTop: !online ? 36 : 0,
        }}
      >
        {view === "calendar" && (
          <CalendarView
            appointments={appointments}
            patients={patients}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            onSlotClick={(date, hour) => setModal({ type: "add-appointment", date, hour })}
            onAptClick={(apt) => setModal({ type: "view-appointment", apt })}
            calendarMode={calendarMode}
            setCalendarMode={setCalendarMode}
            onMoveAppointment={onMoveAppointment}
            overdueNames={overdueNames}
          />
        )}
        {view === "patients" && (
          <PatientsView
            patients={patients}
            onSelect={(p) => {
              setSelectedPatient(p);
              setView("patient");
            }}
            onAdd={() => setModal({ type: "add-patient" })}
          />
        )}
        {view === "patient" && selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            appointments={appointments}
            updatePatient={updatePatient}
            onBack={() => navTo("patients")}
          />
        )}
        {view === "financial" && <FinancialView patients={patients} appointments={appointments} />}
        {view === "costs" && <CostsView costs={costs} setCosts={setCosts} patients={patients} />}
        {view === "reports" && <ReportsView patients={patients} appointments={appointments} costs={costs} />}
        {view === "reminders" && <RemindersView reminders={reminders} setReminders={setReminders} />}
      </div>

      {modal && (
        <Modal
          modal={modal}
          patients={patients}
          appointments={appointments}
          onClose={() => setModal(null)}
          savePatients={savePatients}
          saveAppointments={saveAppointments}
          setSelectedPatient={setSelectedPatient}
          setView={setView}
        />
      )}

      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,46,0.45)",
            zIndex: 400,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "12vh 16px 16px",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              background: B.white,
              borderRadius: 16,
              padding: 18,
              width: "100%",
              maxWidth: 480,
              maxHeight: "70vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon d={IC.search} size={18} color={B.muted} />
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Paciente, data (AAAA-MM-DD), hora…"
                style={{
                  flex: 1,
                  border: `1.5px solid ${B.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  minHeight: 44,
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>
            <div className="pilates-scroll" style={{ overflowY: "auto", flex: 1 }}>
              {searchResults.patients.length > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, marginBottom: 8 }}>PACIENTES</p>
              )}
              {searchResults.patients.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(p);
                    navTo("patient");
                    setSearchOpen(false);
                    setSearchQ("");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    background: B.creamMd,
                    borderRadius: 8,
                    marginBottom: 6,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {p.name}
                </button>
              ))}
              {searchResults.appointments.length > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: B.muted, margin: "12px 0 8px" }}>AGENDA</p>
              )}
              {searchResults.appointments.map((a) => {
                const pt = patients.find((x) => x.id === a.patientId);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setModal({ type: "view-appointment", apt: a });
                      setSearchOpen(false);
                      setSearchQ("");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      background: B.tealFaint,
                      borderRadius: 8,
                      marginBottom: 6,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {a.date} {a.startHour}h — {pt?.name || a.title || "Sessão"}
                  </button>
                );
              })}
              {searchQ && !searchResults.patients.length && !searchResults.appointments.length && (
                <p style={{ color: B.muted, fontSize: 14 }}>Nenhum resultado.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,26,46,0.45)",
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            style={{
              background: B.white,
              borderRadius: 16,
              padding: 22,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 16 }}>Aparência</h2>
            <p style={{ fontSize: 12, color: B.muted, marginBottom: 8 }}>Tema</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {["system", "light", "dark"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setThemeChoice(t);
                    setPilatesTheme(t);
                  }}
                  style={{
                    padding: "10px 16px",
                    minHeight: 44,
                    borderRadius: 8,
                    border: themeChoice === t ? `2px solid ${B.pink}` : `1.5px solid ${B.border}`,
                    background: themeChoice === t ? B.pinkFaint : B.white,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t === "system" ? "Sistema" : t === "light" ? "Claro" : "Escuro"}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: B.muted, marginBottom: 8 }}>Tamanho da fonte</p>
            <input
              type="range"
              min={90}
              max={135}
              value={Math.round(fontScale * 100)}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10) / 100;
                setFontScale(v);
                setPilatesFontScale(v);
              }}
              style={{ width: "100%", accentColor: B.pink, marginBottom: 8 }}
            />
            <Btn full onClick={() => setSettingsOpen(false)}>
              Fechar
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
