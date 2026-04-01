"use client";

import { B } from "./theme";

/** Opacity overlay for CSS variables + hex (Tag, Btn shadow, sidebar). */
export function mixAlpha(color, pct) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export const Icon = ({ d, size = 20, color, style: sx }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || "currentColor"}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={sx}
  >
    <path d={d} />
  </svg>
);

export const IC = {
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  chat:
    "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  plus: "M12 4v16m8-8H4",
  back: "M19 12H5m7-7l-7 7 7 7",
  chevL: "M15 19l-7-7 7-7",
  chevR: "M9 5l7 7-7 7",
  trash:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  clip:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  camera:
    "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  star:
    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  sparkle: "M12 3l1.5 4.5h4.5l-3.7 2.7 1.4 4.3-3.7-2.7-3.7 2.7 1.4-4.3L6 7.5h4.5z",
  money:
    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  chart:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  cake: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  bell:
    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  receipt:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  compare: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
  check: "M5 13l4 4L19 7",
  grid:
    "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM12 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM12 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  pencil:
    "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  costs:
    "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z",
  vacation:
    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
};

export const Btn = ({ children, onClick, variant = "primary", small, disabled, full, style: sx }) => {
  const base = {
    padding: small ? "10px 16px" : "12px 22px",
    minHeight: 44,
    minWidth: small ? 44 : undefined,
    borderRadius: 9,
    fontSize: small ? 13 : 14,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: "none",
    transition: "all 0.15s",
    width: full ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...sx,
  };
  const vs = {
    primary: {
      background: `linear-gradient(135deg, ${B.pink}, ${B.pinkDk})`,
      color: B.white,
      boxShadow: `0 2px 8px ${mixAlpha(B.pink, 27)}`,
    },
    teal: {
      background: `linear-gradient(135deg, ${B.teal}, ${B.tealDk})`,
      color: B.white,
      boxShadow: `0 2px 8px ${mixAlpha(B.teal, 27)}`,
    },
    secondary: { background: B.white, color: B.dark, border: `1.5px solid ${B.border}` },
    ghost: { background: "transparent", color: B.muted },
    danger: { background: B.red, color: B.white },
    green: { background: B.green, color: B.white },
  };
  return (
    <button style={{ ...base, ...vs[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export const Field = ({
  label,
  value,
  onChange,
  type = "text",
  opts,
  rows,
  placeholder,
  min,
  max,
  small,
  inputMode: im,
}) => {
  const phoneish = /telefone|whatsapp|celular|phone/i.test(String(label || ""));
  const moneyish = /valor|r\$|preço|price|amount|mensal/i.test(String(label || ""));
  const t =
    type === "text" && phoneish
      ? "tel"
      : type === "text" && /e-mail|email/i.test(String(label || ""))
        ? "email"
        : type;
  const inputMode = im || (t === "tel" ? "tel" : moneyish ? "decimal" : undefined);
  return (
    <div style={{ marginBottom: small ? 10 : 15 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: B.muted,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
          style={{
            width: "100%",
            padding: "12px 14px",
            minHeight: 44,
            border: `1.5px solid ${B.border}`,
            borderRadius: 8,
            background: B.white,
            fontSize: 14,
            color: B.dark,
            resize: "vertical",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
      ) : type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            minHeight: 44,
            border: `1.5px solid ${B.border}`,
            borderRadius: 8,
            background: B.white,
            fontSize: 14,
            color: B.dark,
            outline: "none",
          }}
        >
          {opts?.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {(o.label ?? o) || "-- selecionar --"}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={t}
          inputMode={inputMode}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          style={{
            width: "100%",
            padding: "12px 14px",
            minHeight: 44,
            border: `1.5px solid ${B.border}`,
            borderRadius: 8,
            background: B.white,
            fontSize: 14,
            color: B.dark,
            outline: "none",
          }}
        />
      )}
    </div>
  );
};

export const Avatar = ({ name, size = 44, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color || `linear-gradient(135deg,${B.pinkLt},${B.tealLt})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontWeight: 700,
      fontSize: size * 0.38,
      color: B.pinkDk,
    }}
  >
    {name?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

export const Tag = ({ color, bg, children }) => {
  const background =
    bg ||
    (typeof color === "string" && color.startsWith("var(")
      ? mixAlpha(color, 18)
      : `${color}22`);
  return (
    <span
      style={{
        background,
        color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

export const StatCard = ({ label, value, sub, color, icon }) => (
  <div
    style={{
      background: B.white,
      border: `1px solid ${B.border}`,
      borderRadius: 14,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: mixAlpha(color, 12),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon d={IC[icon]} size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: B.dark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: B.muted, marginTop: 3 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

export const SectionTitle = ({ children }) => (
  <div
    style={{
      background: `linear-gradient(90deg,${B.pinkFaint},${B.tealFaint})`,
      border: `1px solid ${B.pinkLt}`,
      borderRadius: 8,
      padding: "7px 14px",
      marginBottom: 16,
      marginTop: 8,
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: B.pinkDk,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      }}
    >
      {children}
    </span>
  </div>
);

export const RadioGroup = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: B.muted,
          marginBottom: 7,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
    )}
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <label
          key={opt}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, color: B.dark }}
        >
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            style={{ accentColor: B.pink, width: 16, height: 16 }}
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);
