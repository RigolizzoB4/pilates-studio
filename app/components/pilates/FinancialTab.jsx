"use client";

import { useState } from "react";
import { B, SESSION_PRICE, PAY_TYPES, PAY_METHODS } from "./theme";
import { Icon, IC, Btn, Field, Tag } from "./primitives";
import { uid, fmtCurrency, today, fmtDate } from "@/lib/pilates-utils";
import { generateReceipt } from "@/lib/pilates-receipt";

export default function FinancialTab({ patient, updatePatient }) {
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

  const METHODCOLOR={'Pix':B.green,'Dinheiro':B.amber,'Transferência':B.teal};

  return (
    <div style={{maxWidth:580}}>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:B.dark,marginBottom:18}}>Financeiro</h3>

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
}
