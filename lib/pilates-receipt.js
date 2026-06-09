import { fmtDate } from "./pilates-utils";
import { SESSION_PRICE } from "@/app/components/pilates/theme";

export const generateReceipt = (patient, sessionDate, amount, sessionNum, studioName = "Studio Pilates") => {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Recibo — ${patient.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Inter,sans-serif;background:#fff;padding:40px;max-width:480px;margin:0 auto;color:#1A1A2E}
    .logo{width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#63783F,#7FA552);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;margin-bottom:16px}
    h1{font-size:22px;font-weight:600;color:#1A1A2E;margin-bottom:4px}
    .sub{font-size:13px;color:#6B7280;margin-bottom:32px}
    .divider{border:none;border-top:1.5px solid #E5E7EB;margin:20px 0}
    .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px}
    .row .lbl{color:#6B7280}
    .row .val{font-weight:500;color:#1A1A2E}
    .total{background:#EAF2E1;border:1.5px solid #C7D6B1;border-radius:12px;padding:16px 20px;margin-top:20px;display:flex;justify-content:space-between;align-items:center}
    .total .lbl{font-size:14px;color:#4E5E31;font-weight:500}
    .total .val{font-size:24px;font-weight:700;color:#63783F}
    .footer{margin-top:40px;text-align:center;font-size:12px;color:#9CA3AF;border-top:1px dashed #E5E7EB;padding-top:20px}
    @media print{body{padding:20px}.footer{position:fixed;bottom:20px;width:100%}}
  </style></head><body>
  <div class="logo">P</div>
  <h1>${studioName}</h1>
  <div class="sub">RECIBO DE SERVIÇO</div>
  <hr class="divider">
  <div class="row"><span class="lbl">Aluna</span><span class="val">${patient.name}</span></div>
  <div class="row"><span class="lbl">Serviço</span><span class="val">Sessão de Pilates</span></div>
  <div class="row"><span class="lbl">Data</span><span class="val">${fmtDate(sessionDate + "T12:00:00")}</span></div>
  ${sessionNum ? `<div class="row"><span class="lbl">Sessão nº</span><span class="val">${sessionNum}</span></div>` : ""}
  <div class="row"><span class="lbl">Forma de pagamento</span><span class="val">Pix / Transferência</span></div>
  <hr class="divider">
  <div class="total"><span class="lbl">Total</span><span class="val">R$ ${(amount || SESSION_PRICE).toFixed(2).replace(".", ",")}</span></div>
  <div class="footer">Obrigada pela confiança! ♥<br>${studioName} — ${new Date().getFullYear()}</div>
  <script>window.onload=()=>{window.print();}</script>
  </body></html>`;
  const w = window.open("", "_blank", "width=520,height=700");
  w.document.write(html);
  w.document.close();
};
