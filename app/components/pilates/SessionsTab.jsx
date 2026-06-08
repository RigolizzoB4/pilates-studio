"use client";

import { useState } from "react";
import { B, SESSION_PRICE, APT_STATUS, APT_TYPES } from "./theme";
import { Icon, IC, Btn, Field, Tag } from "./primitives";
import { uid, today, fmtDate } from "@/lib/pilates-utils";
import { generateReceipt } from "@/lib/pilates-receipt";

export default function SessionsTab({ patient, appointments, updatePatient }) {
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
}
