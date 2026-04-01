"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import { claudeAPI } from "@/lib/pilates-claude";
import { uid } from "@/lib/pilates-utils";
import { B } from "./theme";
import { Btn, Icon, IC, mixAlpha } from "./primitives";
import { CameraPhotoModal, CameraVideoModal } from "./PostureCameraModals";
import { preferRearCamera, getFacingModeForDefault } from "./posture-camera-utils";

// ── Posture Tab — Advanced (angles, overlay, video, PDF report) ──
const ANATOMICAL_POINTS = [
  {id:'head',    label:'Cabeça',        color:'#EF4444'},
  {id:'shoulder',label:'Ombro',         color:'#F59E0B'},
  {id:'elbow',   label:'Cotovelo',      color:'#10B981'},
  {id:'hip',     label:'Quadril/Crista',color:'#3B82F6'},
  {id:'knee',    label:'Joelho',        color:'#8B5CF6'},
  {id:'ankle',   label:'Tornozelo',     color:'#EC4899'},
  {id:'custom',  label:'Personalizado', color:'#06B6D4'},
];

const calcAngle=(p1,p2,p3)=>{
  const a={x:p1.x-p2.x,y:p1.y-p2.y};
  const b={x:p3.x-p2.x,y:p3.y-p2.y};
  const dot=a.x*b.x+a.y*b.y;
  const ma=Math.sqrt(a.x**2+a.y**2), mb=Math.sqrt(b.x**2+b.y**2);
  if(!ma||!mb) return 0;
  return Math.round(Math.acos(Math.max(-1,Math.min(1,dot/(ma*mb))))*180/Math.PI);
};

const generatePosturePDF=(patient,analysis,angles,imgData,date)=>{
  const angleRows=angles.map(a=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;color:#555">${a.label}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;font-weight:700;color:#C8175B;text-align:right">${a.value}°</td></tr>`).join('');
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Avaliação Postural — ${patient.name}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;color:#1A1A2E;padding:32px;max-width:700px;margin:0 auto}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #C8175B}
  .logo{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#C8175B,#00A0A8);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;flex-shrink:0}
  h1{font-size:20px;font-weight:700;color:#1A1A2E}h2{font-size:14px;color:#6B7280;margin-top:3px}
  .section{margin-bottom:22px}.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#00A0A8;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #E5E7EB}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .info-item{background:#F9FAFB;border-radius:8px;padding:10px 14px}.info-label{font-size:11px;color:#9CA3AF;margin-bottom:3px}.info-val{font-size:14px;font-weight:600;color:#1A1A2E}
  .photo-section{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
  .photo-wrap{position:relative;flex-shrink:0}.photo-wrap img{width:200px;border-radius:10px;border:1px solid #E5E7EB;display:block}
  table{width:100%;border-collapse:collapse;background:#F9FAFB;border-radius:10px;overflow:hidden}
  .analysis-box{background:#F0FDF4;border:1px solid #A7F3D0;border-radius:10px;padding:16px;font-size:13px;line-height:1.7;color:#1A1A2E;white-space:pre-wrap}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#9CA3AF;border-top:1px dashed #E5E7EB;padding-top:16px}
  @media print{body{padding:16px}}</style></head><body>
  <div class="header"><div class="logo">P</div><div><h1>Avaliação Postural</h1><h2>Studio Pilates Lívia</h2></div></div>
  <div class="section"><div class="section-title">Dados da Paciente</div>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Nome</div><div class="info-val">${patient.name}</div></div>
    <div class="info-item"><div class="info-label">Data da Avaliação</div><div class="info-val">${new Date(date).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div></div>
    ${patient.anamnesis?.age?`<div class="info-item"><div class="info-label">Idade</div><div class="info-val">${patient.anamnesis.age} anos</div></div>`:''}
    ${patient.anamnesis?.mainComplaint?`<div class="info-item"><div class="info-label">Queixa Principal</div><div class="info-val">${patient.anamnesis.mainComplaint}</div></div>`:''}
  </div></div>
  ${imgData?`<div class="section"><div class="section-title">Foto Postural (grade)</div><div class="photo-section"><div class="photo-wrap" style="position:relative;width:220px;min-height:200px;background-image:url(${imgData});background-size:contain;background-repeat:no-repeat;border-radius:10px;border:1px solid #E5E7EB"><div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px);background-size:24px 24px;border-radius:10px;pointer-events:none"></div></div>${angles.length>0?`<div style="flex:1"><table>${angleRows}</table></div>`:''}</div></div>`:''}
  ${angles.length>0&&!imgData?`<div class="section"><div class="section-title">Medições de Ângulo</div><table>${angleRows}</table></div>`:''}
  <div class="section"><div class="section-title">Análise Clínica (IA)</div><div class="analysis-box" style="font-family:Georgia,serif;line-height:1.8">${analysis.replace(/\n/g,'<br/>')}</div></div>
  <div class="footer">Studio Pilates Lívia · Documento gerado em ${new Date().toLocaleDateString('pt-BR')} · Uso exclusivo clínico</div>
  <script>window.onload=()=>window.print();</script></body></html>`;
  const w=window.open('','_blank','width=750,height=900');
  w.document.write(html); w.document.close();
};

export default function PostureTab({ patient, updatePatient }) {
  const [tab,setTab]=useState('photo'); // 'photo' | 'video' | 'overlay'
  const [analyses,setAnalyses]=useState(patient.postureAnalyses||[]);
  const [busy,setBusy]=useState(false);
  const [busyVideo,setBusyVideo]=useState(false);
  const [activeId,setActiveId]=useState(null);

  // Drawing
  const [showGrid,setShowGrid]=useState(true);
  const [showAnnotations,setShowAnnotations]=useState(true);
  const [drawMode,setDrawMode]=useState(false);
  const [drawColor,setDrawColor]=useState('#DC2626');
  const [isDrawing,setIsDrawing]=useState(false);
  const drawStart=useRef(null);
  const canvasRef=useRef();

  // Angle tool
  const [angleMode,setAngleMode]=useState(false);
  const [anglePoints,setAnglePoints]=useState([]); // up to 3 points per measurement
  const [savedAngles,setSavedAngles]=useState({});
  const [selectedPoint,setSelectedPoint]=useState('custom');

  // Overlay
  const [overlayA,setOverlayA]=useState(null);
  const [overlayB,setOverlayB]=useState(null);
  const [overlayOpacity,setOverlayOpacity]=useState(50);

  // Video
  const [videoData,setVideoData]=useState(null);
  const [videoAnalysis,setVideoAnalysis]=useState('');
  const videoRef=useRef();
  /** Desktop / sem capture — seletor de arquivo */
  const filePhotoDesktopRef=useRef();
  /** Mobile — abre câmera traseira (fallback se getUserMedia falhar) */
  const filePhotoCaptureRef=useRef();
  const videoFileDesktopRef=useRef();
  const videoFileCaptureRef=useRef();

  const [photoModalOpen,setPhotoModalOpen]=useState(false);
  const [videoModalOpen,setVideoModalOpen]=useState(false);
  const videoBlobUrlRef=useRef(null);

  const COLORS=['#DC2626','#16A34A','#FBBF24','#2563EB','#9333EA','#FFFFFF'];
  const TIPS=[
    '📸 Paciente a 2-3m da câmera',
    '🧍 Vista justa — shorts/top justo',
    '🟫 Fundo neutro e liso',
    '📐 Câmera na altura da cintura',
    '🔅 Boa iluminação, sem sombras',
    '4️⃣ Tire 4 vistas: frontal, post., lat. D e E',
  ];

  const analyzePhotoDataUrl=useCallback(async(dataUrl,mimeType='image/jpeg')=>{
    const base64=dataUrl.split(',')[1];
    const analysis=await claudeAPI([{role:'user',content:[
      {type:'image',source:{type:'base64',media_type:mimeType,data:base64}},
      {type:'text',text:`Você é especialista em Pilates e avaliação postural clínica. Analise detalhadamente esta imagem postural:\n\n1. **COLUNA VERTEBRAL** — cervical, torácica, lombar (cifose, lordose, retificação, escoliose)\n2. **OMBROS E ESCÁPULAS** — altura, protração, retração, abdução, elevação\n3. **CABEÇA E PESCOÇO** — anteriorização, inclinação, rotação\n4. **PELVE** — anteversão, retroversão, inclinação lateral, rotação\n5. **MEMBROS INFERIORES** — joelhos (valgo/varo/hiperextensão), pés (pronação/supinação)\n6. **CENTRO DE GRAVIDADE** — deslocamento anterior/posterior/lateral\n7. **PRINCIPAIS DESVIOS** — lista dos achados mais relevantes com grau de severidade\n8. **EXERCÍCIOS DE PILATES INDICADOS** — pelo menos 5 exercícios específicos para os achados\n9. **EXERCÍCIOS A EVITAR** — contraindicações baseadas nos achados\n10. **PONTOS DE ATENÇÃO** — o que monitorar nas próximas sessões\n\nSeja técnica, precisa e prática para uso clínico.`}
    ]}],'Você é especialista em Pilates, fisioterapia e avaliação postural.');
    const item={id:uid(),date:new Date().toISOString(),imageData:dataUrl,analysis,type:'photo'};
    setAnalyses((prev)=>{
      const updated=[item,...prev];
      void updatePatient({...patient,postureAnalyses:updated});
      return updated;
    });
    setActiveId(item.id);
  },[patient,updatePatient]);

  const handleFile=async(e)=>{
    const file=e.target.files[0]; if(!file) return;
    setBusy(true);
    try{
      const dataUrl=await new Promise((res,rej)=>{
        const reader=new FileReader();
        reader.onload=()=>res(reader.result);
        reader.onerror=rej;
        reader.readAsDataURL(file);
      });
      await analyzePhotoDataUrl(dataUrl,file.type||'image/jpeg');
    }finally{
      setBusy(false);
    }
    e.target.value='';
  };

  const openPhotoCamera=()=>{
    if(typeof navigator!=='undefined'&&navigator.mediaDevices?.getUserMedia){
      setPhotoModalOpen(true);
      return;
    }
    if(preferRearCamera()) filePhotoCaptureRef.current?.click();
    else filePhotoDesktopRef.current?.click();
  };

  const onPhotoModalCapture=async(dataUrl)=>{
    setBusy(true);
    try{
      await analyzePhotoDataUrl(dataUrl,'image/jpeg');
    }finally{
      setBusy(false);
    }
  };

  const handleVideo=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    if(videoBlobUrlRef.current){
      try{URL.revokeObjectURL(videoBlobUrlRef.current);}catch{/* noop */}
    }
    const url=URL.createObjectURL(file);
    videoBlobUrlRef.current=url;
    setVideoData(url); setVideoAnalysis('');
    e.target.value='';
  };

  const openVideoCamera=()=>{
    if(typeof navigator!=='undefined'&&navigator.mediaDevices?.getUserMedia){
      setVideoModalOpen(true);
      return;
    }
    if(preferRearCamera()) videoFileCaptureRef.current?.click();
    else videoFileDesktopRef.current?.click();
  };

  const onVideoRecorded=(url)=>{
    if(videoBlobUrlRef.current){
      try{URL.revokeObjectURL(videoBlobUrlRef.current);}catch{/* noop */}
    }
    videoBlobUrlRef.current=url;
    setVideoData(url);
    setVideoAnalysis('');
  };

  useEffect(()=>()=>{
    if(videoBlobUrlRef.current){
      try{URL.revokeObjectURL(videoBlobUrlRef.current);}catch{/* noop */}
    }
  },[]);

  const analyzeVideoFrame=async()=>{
    if(!videoRef.current) return;
    setBusyVideo(true);
    const video=videoRef.current;
    const canvas=document.createElement('canvas');
    canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||480;
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    const base64=canvas.toDataURL('image/jpeg',0.8).split(',')[1];
    const result=await claudeAPI([{role:'user',content:[
      {type:'image',source:{type:'base64',media_type:'image/jpeg',data:base64}},
      {type:'text',text:`Analise este frame de vídeo de movimento/exercício de Pilates:\n\n1. **POSTURA NO MOVIMENTO** — alinhamento durante a execução\n2. **COMPENSAÇÕES** — o que o corpo está compensando e onde\n3. **PONTOS DE RISCO** — o que pode causar lesão neste padrão de movimento\n4. **QUALIDADE DO MOVIMENTO** — fluidez, controle, ativação muscular aparente\n5. **CORREÇÕES PRIORITÁRIAS** — 3 ajustes imediatos a fazer\n6. **PROGRESSÃO** — quando avançar e como\n\nSeja específica e prática para a professora de Pilates.`}
    ]}],'Especialista em análise de movimento, Pilates e biomecânica.');
    setVideoAnalysis(result);
    const item={id:uid(),date:new Date().toISOString(),imageData:canvas.toDataURL('image/jpeg',0.8),analysis:result,type:'video_frame'};
    const updated=[item,...analyses];
    setAnalyses(updated); setActiveId(item.id);
    await updatePatient({...patient,postureAnalyses:updated});
    setBusyVideo(false);
  };

  const deleteAnalysis=async(id)=>{
    const updated=analyses.filter(a=>a.id!==id);
    setAnalyses(updated);
    if(activeId===id) setActiveId(updated[0]?.id||null);
    const newAngles={...savedAngles}; delete newAngles[id];
    setSavedAngles(newAngles);
    await updatePatient({...patient,postureAnalyses:updated});
  };

  // Drawing handlers
  const startDraw=useCallback((e)=>{
    if(angleMode){
      const canvas=canvasRef.current; if(!canvas) return;
      const rect=canvas.getBoundingClientRect();
      const x=(e.clientX-rect.left)*(canvas.width/rect.width);
      const y=(e.clientY-rect.top)*(canvas.height/rect.height);
      const pt=ANATOMICAL_POINTS.find(p=>p.id===selectedPoint)||ANATOMICAL_POINTS[6];
      const newPts=[...anglePoints,{x,y,label:pt.label,color:pt.color}];
      if(newPts.length<=3){
        setAnglePoints(newPts);
        // Draw point
        const ctx=canvas.getContext('2d');
        ctx.fillStyle=pt.color; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=B.white; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(newPts.length,x,y);
        if(newPts.length>=2){
          ctx.strokeStyle=pt.color; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
          ctx.beginPath(); ctx.moveTo(newPts[newPts.length-2].x,newPts[newPts.length-2].y);
          ctx.lineTo(x,y); ctx.stroke(); ctx.setLineDash([]);
        }
        if(newPts.length===3){
          const angle=calcAngle(newPts[0],newPts[1],newPts[2]);
          const mid=newPts[1];
          ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(mid.x+8,mid.y-14,52,20);
          ctx.fillStyle=B.white; ctx.font='bold 13px Arial'; ctx.textAlign='left'; ctx.textBaseline='middle';
          ctx.fillText(`${angle}°`,mid.x+12,mid.y-4);
          const label=`${pt.label}: ${angle}°`;
          const arr=savedAngles[activeId]||[];
          setSavedAngles(prev=>({...prev,[activeId]:[...arr,{label,value:angle}]}));
          setAnglePoints([]);
        }
      }
      return;
    }
    if(!drawMode) return;
    const canvas=canvasRef.current; if(!canvas) return;
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(canvas.width/rect.width);
    const y=(e.clientY-rect.top)*(canvas.height/rect.height);
    drawStart.current={x,y};
    setIsDrawing(true);
  },[drawMode,angleMode,anglePoints,selectedPoint,savedAngles,activeId]);

  const draw=useCallback((e)=>{
    if(!isDrawing||!drawMode||angleMode) return;
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)*(canvas.width/rect.width);
    const y=(e.clientY-rect.top)*(canvas.height/rect.height);
    ctx.strokeStyle=drawColor; ctx.lineWidth=3; ctx.lineCap='round'; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(drawStart.current.x,drawStart.current.y);
    ctx.lineTo(x,y); ctx.stroke();
    drawStart.current={x,y};
  },[isDrawing,drawMode,angleMode,drawColor]);

  const endDraw=useCallback(()=>{ setIsDrawing(false); },[]);

  const clearCanvas=()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
    setSavedAngles(prev=>({...prev,[activeId]:[]}));
    setAnglePoints([]);
  };

  const activeAnalysis=analyses.find(a=>a.id===activeId)||analyses[0];
  const currentAngles=savedAngles[activeAnalysis?.id]||[];

  const subTabs=[
    {id:'photo', label:'📸 Foto'},
    {id:'video', label:'🎬 Vídeo'},
    {id:'overlay',label:'🔄 Sobreposição'},
  ];

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
        <div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:B.dark}}>Análise Postural com IA</h3>
          <p style={{fontSize:12,color:B.muted,marginTop:2}}>{analyses.length} análise(s) registrada(s)</p>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
          <Btn onClick={openPhotoCamera} disabled={busy} variant="primary" small>
            <Icon d={IC.camera} size={14} color={B.white}/>{busy?'Analisando…':'Nova Foto'}
          </Btn>
          <Btn variant="secondary" small onClick={()=>filePhotoDesktopRef.current?.click()} disabled={busy}>
            Enviar arquivo…
          </Btn>
        </div>
        <input type="file" accept="image/*" ref={filePhotoDesktopRef} onChange={handleFile} style={{display:'none'}}/>
        <input type="file" accept="image/*" capture="environment" ref={filePhotoCaptureRef} onChange={handleFile} style={{display:'none'}}/>
        <input type="file" accept="video/*" ref={videoFileDesktopRef} onChange={handleVideo} style={{display:'none'}}/>
        <input type="file" accept="video/*" capture="environment" ref={videoFileCaptureRef} onChange={handleVideo} style={{display:'none'}}/>
      </div>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:4,marginBottom:16,background:B.creamDk,borderRadius:10,padding:4}}>
        {subTabs.map(st=>(
          <button key={st.id} onClick={()=>setTab(st.id)}
            style={{flex:1,padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:tab===st.id?700:400,background:tab===st.id?B.white:'transparent',color:tab===st.id?B.pink:B.muted,transition:'all 0.15s'}}>
            {st.label}
          </button>
        ))}
      </div>

      {/* ── PHOTO TAB ── */}
      {tab==='photo'&&(
        <>
          {/* Tips */}
          <div style={{background:`linear-gradient(90deg,${B.tealFaint},${B.pinkFaint})`,border:`1px solid ${B.tealLt}`,borderRadius:10,padding:'10px 14px',marginBottom:14}}>
            <p style={{fontSize:11,fontWeight:700,color:B.tealDk,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>Melhores práticas</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
              {TIPS.map((t,i)=><div key={i} style={{fontSize:12,color:B.dark}}>{t}</div>)}
            </div>
          </div>

          {analyses.filter(a=>a.type!=='video_frame').length===0?(
            <div style={{textAlign:'center',padding:'50px 20px',background:B.white,borderRadius:14,border:`2px dashed ${B.border}`}}>
              <Icon d={IC.camera} size={48} color={B.border}/>
              <p style={{fontSize:15,color:B.muted,marginTop:14}}>Nenhuma análise postural ainda</p>
              <p style={{fontSize:13,color:B.mutedLt,marginTop:6}}>Clique em Nova Foto para começar</p>
            </div>
          ):(
            <>
              {/* Thumbnails */}
              <div style={{display:'flex',gap:8,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
                {analyses.map(a=>(
                  <div key={a.id} onClick={()=>setActiveId(a.id)}
                    style={{flexShrink:0,cursor:'pointer',borderRadius:8,overflow:'hidden',border:`2.5px solid ${(activeAnalysis?.id===a.id)?B.pink:B.border}`,position:'relative',width:58}}>
                    <Image src={a.imageData} alt="" width={58} height={78} unoptimized style={{width:58,height:78,objectFit:'cover',display:'block'}}/>
                    {a.type==='video_frame'&&<div style={{position:'absolute',top:2,left:2,background:'rgba(0,0,0,0.6)',borderRadius:4,padding:'1px 5px',fontSize:9,color:B.white}}>🎬</div>}
                    <button onClick={e=>{e.stopPropagation();deleteAnalysis(a.id);}}
                      style={{position:'absolute',top:2,right:2,background:'rgba(0,0,0,0.55)',border:'none',borderRadius:'50%',width:16,height:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                      <Icon d={IC.trash} size={9} color={B.white}/>
                    </button>
                    <div style={{background:'rgba(0,0,0,0.5)',padding:'2px 4px',fontSize:9,color:B.white,textAlign:'center'}}>
                      {new Date(a.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                    </div>
                  </div>
                ))}
              </div>

              {activeAnalysis&&(
                <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,overflow:'hidden'}}>
                  {/* Toolbar */}
                  <div style={{padding:'9px 14px',background:B.creamMd,borderBottom:`1px solid ${B.border}`,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',fontSize:12,color:B.dark}}>
                      <input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} style={{accentColor:B.teal}}/> Grade
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',fontSize:12,color:B.dark}}>
                      <input type="checkbox" checked={showAnnotations} onChange={e=>setShowAnnotations(e.target.checked)} style={{accentColor:B.pink}}/> Traços
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',fontSize:12,color:B.dark}}>
                      <input type="checkbox" checked={drawMode&&!angleMode} onChange={e=>{setDrawMode(e.target.checked);setAngleMode(false);}} style={{accentColor:B.pink}}/> Desenhar
                    </label>
                    <label style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer',fontSize:12,color:B.amber}}>
                      <input type="checkbox" checked={angleMode} onChange={e=>{setAngleMode(e.target.checked);setDrawMode(false);setAnglePoints([]);}} style={{accentColor:B.amber}}/> Medir ângulo
                    </label>

                    {drawMode&&!angleMode&&(
                      <div style={{display:'flex',gap:5,alignItems:'center'}}>
                        {COLORS.map(c=><div key={c} onClick={()=>setDrawColor(c)}
                          style={{width:18,height:18,borderRadius:'50%',background:c,border:`2px solid ${drawColor===c?B.dark:B.border}`,cursor:'pointer'}}/>)}
                      </div>
                    )}

                    {angleMode&&(
                      <select value={selectedPoint} onChange={e=>setSelectedPoint(e.target.value)}
                        style={{padding:'3px 8px',borderRadius:6,border:`1px solid ${B.border}`,fontSize:12,background:B.white,color:B.dark,outline:'none'}}>
                        {ANATOMICAL_POINTS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    )}

                    {angleMode&&<span style={{fontSize:11,color:B.amber}}>Clique 3 pontos para medir</span>}

                    <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                      <Btn variant="ghost" small onClick={clearCanvas} style={{fontSize:11,padding:'4px 8px'}}>Limpar</Btn>
                      <Btn variant="secondary" small onClick={()=>generatePosturePDF(patient,activeAnalysis.analysis,currentAngles,activeAnalysis.imageData,activeAnalysis.date)}>
                        <Icon d={IC.receipt} size={13}/>PDF
                      </Btn>
                    </div>
                  </div>

                  {/* Angles display */}
                  {currentAngles.length>0&&(
                    <div style={{padding:'8px 14px',background:`${B.amberLt}`,borderBottom:`1px solid ${mixAlpha(B.amber, 45)}`,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
                      <span style={{fontSize:11,fontWeight:700,color:B.amber}}>📐 Ângulos:</span>
                      {currentAngles.map((a,i)=>(
                        <span key={i} style={{background:B.white,border:`1px solid ${mixAlpha(B.amber, 50)}`,borderRadius:20,padding:'2px 10px',fontSize:12,fontWeight:700,color:B.amber}}>{a.label}</span>
                      ))}
                    </div>
                  )}

                  <div style={{display:'flex',flexWrap:'wrap'}}>
                    {/* Image + overlays */}
                    <div style={{position:'relative',flexShrink:0,width:220,alignSelf:'flex-start'}}>
                      <Image src={activeAnalysis.imageData} alt="postura" width={220} height={300} unoptimized style={{width:220,height:300,display:'block',objectFit:'contain'}}/>

                      {showGrid&&(
                        <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none'}}
                          viewBox="0 0 220 300" preserveAspectRatio="none">
                          {Array.from({length:9},(_,i)=><line key={`v${i}`} x1={(i+1)*22} y1="0" x2={(i+1)*22} y2="300" stroke="rgba(0,160,168,0.35)" strokeWidth="0.7"/>)}
                          {Array.from({length:11},(_,i)=><line key={`h${i}`} x1="0" y1={(i+1)*25} x2="220" y2={(i+1)*25} stroke="rgba(0,160,168,0.35)" strokeWidth="0.7"/>)}
                          <line x1="110" y1="0" x2="110" y2="300" stroke="rgba(255,200,0,0.75)" strokeWidth="1.5" strokeDasharray="6 4"/>
                          <line x1="0" y1="150" x2="220" y2="150" stroke="rgba(255,200,0,0.5)" strokeWidth="1" strokeDasharray="4 4"/>
                        </svg>
                      )}

                      {showAnnotations&&(
                        <canvas ref={canvasRef} width={440} height={600}
                          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',cursor:drawMode||angleMode?'crosshair':'default'}}
                          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}/>
                      )}
                    </div>

                    {/* Analysis */}
                    <div style={{flex:1,padding:16,minWidth:220,maxHeight:500,overflowY:'auto'}}>
                      <div style={{fontSize:12,color:B.muted,marginBottom:10,fontWeight:600}}>
                        {activeAnalysis.type==='video_frame'?'🎬 Frame de vídeo':'📸 Foto'} · {new Date(activeAnalysis.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}
                      </div>
                      <div style={{fontSize:13,color:B.dark,lineHeight:1.75,whiteSpace:'pre-wrap'}}>{activeAnalysis.analysis}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── VIDEO TAB ── */}
      {tab==='video'&&(
        <div>
          <div style={{background:`${B.tealFaint}`,border:`1px solid ${B.tealLt}`,borderRadius:10,padding:'10px 14px',marginBottom:16}}>
            <p style={{fontSize:13,color:B.tealDk,fontWeight:600}}>🎬 Análise de Movimento</p>
            <p style={{fontSize:12,color:B.muted,marginTop:4}}>Grave ou selecione um vídeo da paciente fazendo um exercício. Pause no momento certo e o Claude analisa a postura naquele frame.</p>
          </div>

          {!videoData?(
            <div style={{textAlign:'center',padding:'50px 20px',background:B.white,borderRadius:14,border:`2px dashed ${B.border}`}}>
              <div style={{fontSize:48}}>🎬</div>
              <p style={{fontSize:15,color:B.muted,marginTop:14}}>Nenhum vídeo carregado</p>
              <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
                <Btn onClick={openVideoCamera} variant="teal">
                  <Icon d={IC.camera} size={15} color={B.white}/>Gravar vídeo
                </Btn>
                <Btn variant="secondary" onClick={()=>videoFileDesktopRef.current?.click()}>
                  <Icon d={IC.upload} size={15}/>Selecionar arquivo…
                </Btn>
              </div>
            </div>
          ):(
            <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,overflow:'hidden'}}>
              <video ref={videoRef} src={videoData} controls
                style={{width:'100%',maxHeight:360,background:'#000',display:'block'}}/>
              <div style={{padding:16,borderTop:`1px solid ${B.border}`}}>
                <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
                  <Btn onClick={analyzeVideoFrame} disabled={busyVideo} variant="primary">
                    <Icon d={IC.sparkle} size={15} color={B.white}/>{busyVideo?'Analisando frame…':'Analisar Este Momento'}
                  </Btn>
                  <Btn variant="secondary" onClick={()=>{
                    if(videoBlobUrlRef.current){try{URL.revokeObjectURL(videoBlobUrlRef.current);}catch{/* noop */}}
                    videoBlobUrlRef.current=null;
                    setVideoData(null);setVideoAnalysis('');
                  }}>
                    Trocar vídeo
                  </Btn>
                </div>
                <p style={{fontSize:12,color:B.muted}}>💡 Pause o vídeo no momento que quer analisar e use o botão Analisar Este Momento</p>
                {videoAnalysis&&(
                  <div style={{background:B.creamMd,borderRadius:10,padding:14,marginTop:14,fontSize:13,color:B.dark,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
                    {videoAnalysis}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OVERLAY TAB ── */}
      {tab==='overlay'&&(
        <div>
          <div style={{background:`${B.pinkFaint}`,border:`1px solid ${B.pinkLt}`,borderRadius:10,padding:'10px 14px',marginBottom:16}}>
            <p style={{fontSize:13,color:B.pinkDk,fontWeight:600}}>🔄 Sobreposição de Fotos — Antes e Depois</p>
            <p style={{fontSize:12,color:B.muted,marginTop:4}}>Selecione duas fotos e ajuste a transparência para ver a evolução postural da paciente.</p>
          </div>

          {analyses.length<2?(
            <div style={{textAlign:'center',padding:'40px 20px',background:B.white,borderRadius:14,border:`2px dashed ${B.border}`,color:B.muted}}>
              <p style={{fontSize:15}}>Precisa de pelo menos 2 fotos para comparar</p>
              <p style={{fontSize:13,marginTop:6}}>Tire mais fotos na aba 📸 Foto</p>
            </div>
          ):(
            <>
              {/* Select photos */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
                {['A','B'].map((ltr,idx)=>{
                  const sel=idx===0?overlayA:overlayB;
                  const setFn=idx===0?setOverlayA:setOverlayB;
                  const color=idx===0?B.pink:B.teal;
                  const label=idx===0?'ANTES':'DEPOIS';
                  return (
                    <div key={ltr} style={{background:B.white,border:`2px solid ${sel?color:B.border}`,borderRadius:12,padding:14}}>
                      <div style={{fontSize:12,fontWeight:700,color,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>{label}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {analyses.map(a=>(
                          <div key={a.id} onClick={()=>setFn(a.id)}
                            style={{cursor:'pointer',borderRadius:6,overflow:'hidden',border:`2.5px solid ${sel===a.id?color:B.border}`,flexShrink:0}}>
                            <Image src={a.imageData} alt="" width={54} height={72} unoptimized style={{width:54,height:72,objectFit:'cover',display:'block'}}/>
                            <div style={{background:'rgba(0,0,0,0.45)',padding:'2px 4px',fontSize:9,color:B.white,textAlign:'center'}}>
                              {new Date(a.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {overlayA&&overlayB&&(()=>{
                const a1=analyses.find(a=>a.id===overlayA);
                const a2=analyses.find(a=>a.id===overlayB);
                if(!a1||!a2) return null;
                return (
                  <div style={{background:B.white,border:`1px solid ${B.border}`,borderRadius:14,overflow:'hidden'}}>
                    <div style={{padding:'10px 16px',background:B.creamMd,borderBottom:`1px solid ${B.border}`,display:'flex',alignItems:'center',gap:14}}>
                      <span style={{fontSize:13,color:B.dark,fontWeight:500}}>Transparência da foto DEPOIS</span>
                      <input type="range" min={0} max={100} value={overlayOpacity} onChange={e=>setOverlayOpacity(parseInt(e.target.value))}
                        style={{flex:1,accentColor:B.pink}}/>
                      <span style={{fontSize:13,fontWeight:700,color:B.pink,minWidth:36}}>{overlayOpacity}%</span>
                    </div>
                    {/* Overlay */}
                    <div style={{position:'relative',margin:'0 auto',display:'inline-block',maxWidth:340,width:'100%'}}>
                      <Image src={a1.imageData} alt="antes" width={340} height={420} unoptimized style={{width:'100%',height:'auto',display:'block'}}/>
                      <Image src={a2.imageData} alt="depois" width={340} height={420} unoptimized
                        style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',opacity:overlayOpacity/100,mixBlendMode:'normal'}}/>
                      {/* Labels */}
                      <div style={{position:'absolute',top:8,left:8,background:mixAlpha(B.pink, 87),borderRadius:6,padding:'3px 10px',fontSize:12,fontWeight:700,color:B.white}}>ANTES</div>
                      <div style={{position:'absolute',top:8,right:8,background:mixAlpha(B.teal, 87),borderRadius:6,padding:'3px 10px',fontSize:12,fontWeight:700,color:B.white,opacity:overlayOpacity/100}}>DEPOIS</div>
                    </div>
                    <div style={{padding:14,borderTop:`1px solid ${B.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                      <div style={{fontSize:12,color:B.muted}}>
                        📅 {new Date(a1.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})} → {new Date(a2.date).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}
                      </div>
                      <Btn small variant="secondary" onClick={()=>generatePosturePDF(patient,`Comparação: ${new Date(a1.date).toLocaleDateString('pt-BR')} → ${new Date(a2.date).toLocaleDateString('pt-BR')}\n\nANÁLISE ANTES:\n${a1.analysis}\n\nANÁLISE DEPOIS:\n${a2.analysis}`,[],a1.imageData,a2.date)}>
                        <Icon d={IC.receipt} size={13}/>PDF Comparativo
                      </Btn>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      <CameraPhotoModal
        open={photoModalOpen}
        onClose={()=>setPhotoModalOpen(false)}
        onCapture={onPhotoModalCapture}
        facingModeInitial={getFacingModeForDefault()}
      />
      <CameraVideoModal
        open={videoModalOpen}
        onClose={()=>setVideoModalOpen(false)}
        onRecorded={(url)=>onVideoRecorded(url)}
        facingModeInitial={getFacingModeForDefault()}
      />
    </div>
  );
};
