// Brand colors via CSS variables — respond to html[data-theme="dark"] in globals.css
export const B = {
  pink: "var(--pilates-pink)",
  pinkDk: "var(--pilates-pink-dk)",
  pinkLt: "var(--pilates-pink-lt)",
  pinkFaint: "var(--pilates-pink-faint)",
  teal: "var(--pilates-teal)",
  tealDk: "var(--pilates-teal-dk)",
  tealLt: "var(--pilates-teal-lt)",
  tealFaint: "var(--pilates-teal-faint)",
  cream: "var(--pilates-cream)",
  creamDk: "var(--pilates-cream-dk)",
  creamMd: "var(--pilates-cream-md)",
  dark: "var(--pilates-fg)",
  muted: "var(--pilates-muted)",
  mutedLt: "var(--pilates-muted-lt)",
  border: "var(--pilates-border)",
  borderLt: "var(--pilates-border-lt)",
  white: "var(--pilates-surface)",
  green: "var(--pilates-green)",
  greenLt: "var(--pilates-green-lt)",
  amber: "var(--pilates-amber)",
  amberLt: "var(--pilates-amber-lt)",
  red: "var(--pilates-red)",
  redLt: "var(--pilates-red-lt)",
  purple: "var(--pilates-purple)",
  purpleLt: "var(--pilates-purple-lt)",
  gray: "var(--pilates-gray)",
  grayLt: "var(--pilates-gray-lt)",
  gold: "var(--pilates-gold)",
  /** Rail de navegação (independente do texto --pilates-fg). */
  sidebar: "var(--pilates-sidebar)",
};

export const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
export const CELL_H = 60;
export const WEEK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const APT_TYPES = {
  session: { label: "Sessão", color: B.teal },
  evaluation: { label: "Avaliação", color: B.purple },
  trial: { label: "Experimental", color: B.pink },
  task: { label: "Tarefa", color: B.amber },
  lunch: { label: "Almoço", color: B.gold },
  block: { label: "Bloqueio", color: B.gray },
};

export const APT_STATUS = {
  confirmed: { label: "Confirmada", color: "#3d9e72" },
  cancelled_notice: { label: "Cancelou c/ aviso", color: "#c47c22" },
  cancelled_no_notice: { label: "Cancelou sem aviso", color: "#8a7a94" },
  missed: { label: "Faltou", color: "#7a8898" },
  needs_scheduling: { label: "Precisa agendar", color: "#3a9ea6" },
  pending_payment: { label: "Pagamento pendente", color: "#8c62d4" },
};

export const PAY_TYPES = {
  per_session: { label: "Por Sessão", value: 140 },
  monthly: { label: "Mensal", value: 0 },
  prepaid: { label: "Antecipado", value: 0 },
  postpaid: { label: "Pós-pago", value: 0 },
};

export const PAY_METHODS = ["Pix", "Dinheiro", "Transferência"];
export const SESSION_PRICE = 140;

export const PATIENT_STATUS = {
  lead: { label: "Lead", color: B.amber },
  active: { label: "Ativo", color: B.green },
  inactive: { label: "Inativo", color: B.muted },
};

export const DEFAULT_COSTS = {
  aluguel: 0,
  condominio: 0,
  iptu: 0,
  luz: 0,
  agua: 0,
  faxineira: 0,
  papel: 0,
  limpeza: 0,
  outros: 0,
  reserva_pct: 10,
};

export const DEFAULT_REMINDERS = [
  { id: "r1", title: "Comprar Orquídea", type: "interval", intervalDays: 15, active: true, emoji: "🌸", lastSent: null },
  { id: "r2", title: "Aula da Elaine", type: "weekly", weekday: 3, hour: 13, active: true, emoji: "🧘", lastSent: null },
  { id: "r3", title: "Aula da Vera", type: "weekly", weekday: 1, hour: 13, active: true, emoji: "🧘", lastSent: null },
];
