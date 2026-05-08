import { useState, useEffect, useCallback, useRef } from "react";
import { LayoutDashboard, Calendar, Users, Sparkles, Package, Archive, Truck, DollarSign, UserCheck, Plus, Edit2, Trash2, Check, X, Search, AlertTriangle, TrendingUp, Star, ChevronLeft, ChevronRight, CreditCard, Banknote, Smartphone, ArrowLeftRight, ShoppingBag, Minus, LogOut, Lock, FileText, BarChart2, Clock, Paperclip, Ban } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE — una sola clave, un solo objeto
// ═══════════════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xodotpzocxxuiapiujpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZG90cHpvY3h4dWlhcGl1anBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5Njc0NTksImV4cCI6MjA5MzU0MzQ1OX0.-7Vg6PRthrOdM9GFA5GJYPFgNfrKx1AQLxrO7RqTklM';
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);
const STORE_KEY    = 'sc:v6';

const dbRead = async () => {
  try {
    const { data, error } = await supabase
      .from('shinycandle_store')
      .select('data')
      .eq('key', STORE_KEY)
      .maybeSingle();
    if (error || !data) return null;
    return data.data;
  } catch (e) { return null; }
};

const dbWrite = async (d) => {
  try {
    await supabase
      .from('shinycandle_store')
      .upsert(
        { key: STORE_KEY, data: d },
        { onConflict: 'key' }
      );
  } catch (e) {}
};

const migrateFromLocalStorage = async () => {
  try {
    const local = localStorage.getItem('sc:v6');
    if (!local) return;
    const parsed = JSON.parse(local);
    const { data } = await supabase
      .from('shinycandle_store')
      .select('key')
      .eq('key', STORE_KEY)
      .maybeSingle();
    if (!data) {
      await dbWrite(parsed);
    }
    localStorage.removeItem('sc:v6');
  } catch (e) {}
};
// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const fmt  = n => `${(+n||0).toFixed(2)}€`;
const tod  = () => new Date().toISOString().split('T')[0];
const nid  = a => a?.length ? Math.max(...a.map(x=>+x.id||0))+1 : 1;
const ADMIN_PASS = '1234'; // cambiar a la contraseña deseada

// ═══════════════════════════════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════════════════════════════
const SEED = {
  services:[
    {id:1,name:'Hammam Tradicional',duration:60,price:65,category:'Hammam',description:'Ritual auténtico con kessa de seda y arcilla ghassoul. Purificación total del cuerpo.',active:true},
    {id:2,name:'Tratamiento Capilar Argán',duration:90,price:85,category:'Cabello',description:'Nutrición profunda con aceite de argán 100% puro. Cabello brillante desde la primera sesión.',active:true},
    {id:3,name:'Masaje Relajante',duration:60,price:70,category:'Masaje',description:'Con aceites esenciales de rosa y jazmín. Libera tensiones y nutre la piel.',active:true},
    {id:4,name:'Facial Aloe & Miel',duration:45,price:55,category:'Facial',description:'Hidratación profunda con ingredientes naturales. Piel suave y luminosa.',active:true},
    {id:5,name:'Keratina Marroquí',duration:120,price:120,category:'Cabello',description:'Alisado duradero con keratina y argán. Resultado profesional hasta 3 meses.',active:true},
    {id:6,name:'Ritual Novia',duration:180,price:200,category:'Especial',description:'Experiencia completa: hammam + tratamiento capilar + maquillaje.',active:true},
  ],
  products:[
    {id:1,name:'Aceite de Argán Puro',price:28,stock:45,category:'Cabello',description:'100% puro, prensado en frío. 100ml',active:true},
    {id:2,name:'Ghassoul Natural',price:15,stock:30,category:'Hammam',description:'Arcilla mineral volcánica. 200g',active:true},
    {id:3,name:'Kessa Exfoliante',price:8,stock:60,category:'Hammam',description:'Guante tradicional de kessa.',active:true},
    {id:4,name:'Mascarilla Miel & Argán',price:22,stock:20,category:'Cabello',description:'Nutrición intensa. 250ml',active:true},
    {id:5,name:'Jabón Beldi',price:12,stock:40,category:'Cuerpo',description:'Jabón negro tradicional marroquí. 250g',active:true},
  ],
  appointments:[
    {id:1,clientId:1,clientName:'Sofía Martínez',serviceId:2,serviceName:'Tratamiento Capilar Argán',staffId:1,staffName:'Amina Hassan',date:'2026-05-03',time:'10:00',duration:90,price:85,status:'confirmed',notes:'',source:'admin'},
    {id:2,clientId:2,clientName:'Laura Gómez',serviceId:1,serviceName:'Hammam Tradicional',staffId:2,staffName:'Fatima Benali',date:'2026-05-03',time:'12:00',duration:60,price:65,status:'confirmed',notes:'',source:'admin'},
    {id:3,clientId:3,clientName:'María Rodríguez',serviceId:3,serviceName:'Masaje Relajante',staffId:1,staffName:'Amina Hassan',date:'2026-05-03',time:'16:00',duration:60,price:70,status:'pending',notes:'Primera visita',source:'admin'},
    {id:4,clientId:4,clientName:'Carmen López',serviceId:6,serviceName:'Ritual Novia',staffId:1,staffName:'Amina Hassan',date:'2026-05-10',time:'09:00',duration:180,price:200,status:'confirmed',notes:'Boda el 11 mayo',source:'admin'},
  ],
  clients:[
    {id:1,name:'Sofía Martínez',email:'sofia@email.com',phone:'+34 612 345 678',visits:8,totalSpent:620,notes:'Alérgica al jazmín',lastVisit:'2026-04-10',createdAt:'2024-06-01',documents:[]},
    {id:2,name:'Laura Gómez',email:'laura@email.com',phone:'+34 623 456 789',visits:12,totalSpent:980,notes:'Prefiere capilares',lastVisit:'2026-04-18',createdAt:'2024-03-15',documents:[]},
    {id:3,name:'María Rodríguez',email:'maria@email.com',phone:'+34 634 567 890',visits:3,totalSpent:225,notes:'',lastVisit:'2026-04-05',createdAt:'2025-01-20',documents:[]},
    {id:4,name:'Carmen López',email:'carmen@email.com',phone:'+34 645 678 901',visits:5,totalSpent:375,notes:'VIP',lastVisit:'2026-04-15',createdAt:'2024-09-10',documents:[]},
  ],
  staff:[
    {id:1,name:'Amina Hassan',role:'Especialista Capilar',email:'amina@shinycandle.com',phone:'+34 645 123 456',schedule:'L-V 9-18h',active:true,commission:10},
    {id:2,name:'Fatima Benali',role:'Hammam Expert',email:'fatima@shinycandle.com',phone:'+34 656 234 567',schedule:'L-S 10-19h',active:true,commission:10},
    {id:3,name:'Yasmine Alaoui',role:'Masajista',email:'yasmine@shinycandle.com',phone:'+34 667 345 678',schedule:'M-D 11-20h',active:true,commission:10},
  ],
  suppliers:[
    {id:1,name:'Argán Maroc Import',contact:'Hassan Idrissi',email:'hassan@arganmaroc.com',phone:'+212 661 234 567',products:'Aceites, esencias',paymentTerms:'30 días',notes:'Principal proveedor'},
    {id:2,name:'Beldi Natural',contact:'Aicha Bennis',email:'aicha@beldi.ma',phone:'+212 672 345 678',products:'Ghassoul, jabones, kessa',paymentTerms:'15 días',notes:'Hammam naturales'},
  ],
  inventory:[
    {id:1,name:'Aceite de Argán 500ml',category:'Materia Prima',quantity:15,minQuantity:5,unit:'botellas',cost:18,supplierId:1},
    {id:2,name:'Ghassoul en polvo',category:'Materia Prima',quantity:8,minQuantity:3,unit:'kg',cost:8,supplierId:2},
    {id:3,name:'Kessa guantes',category:'Consumibles',quantity:12,minQuantity:20,unit:'uds',cost:2.5,supplierId:2},
    {id:4,name:'Toallas hammam',category:'Equipamiento',quantity:30,minQuantity:15,unit:'uds',cost:12,supplierId:null},
    {id:5,name:'Jabón Beldi 1kg',category:'Materia Prima',quantity:4,minQuantity:10,unit:'kg',cost:6,supplierId:2},
  ],
  transactions:[
    {id:1,date:'2026-04-30',type:'income',category:'Servicios',description:'Hammam - Laura Gómez',amount:65,method:'tarjeta'},
    {id:2,date:'2026-04-30',type:'income',category:'Servicios',description:'Tratamiento Capilar - Sofía',amount:85,method:'efectivo'},
    {id:3,date:'2026-04-29',type:'expense',category:'Proveedores',description:'Pedido Argán Maroc',amount:340,method:'transferencia'},
    {id:4,date:'2026-04-28',type:'expense',category:'Gastos fijos',description:'Suministros agua y luz',amount:180,method:'domiciliación'},
    {id:5,date:'2026-04-27',type:'income',category:'Servicios',description:'Keratina - Carmen López',amount:120,method:'tarjeta'},
    {id:6,date:'2026-04-26',type:'expense',category:'Personal',description:'Nóminas semana',amount:850,method:'transferencia'},
  ],
  orders:[],
  resources:[
    {id:1,name:'Cabina 1',type:'cabina',description:'Tratamientos capilares',active:true,color:'#2A7A6F'},
    {id:2,name:'Cabina 2',type:'cabina',description:'Hammam y masajes',active:true,color:'#C9A96E'},
    {id:3,name:'Zona Hammam',type:'zona',description:'Área de hammam colectivo',active:true,color:'#C4622D'},
    {id:4,name:'Silla 1',type:'silla',description:'Peinado y acabados',active:true,color:'#9B7FD4'},
    {id:5,name:'Silla 2',type:'silla',description:'Peinado y acabados',active:true,color:'#5B9BD4'},
  ],
  cierres:[],
  blocks:[],
  fichajes:[],
  documents:[],
  settings:{googlePlaceId:'',googleApiKey:''},
  reviews:[
    {id:1,name:'Sofía M.',rating:5,text:'Increíble experiencia. El hammam fue espectacular, nunca me había sentido tan relajada.',service:'Hammam Tradicional',date:'2026-04-20'},
    {id:2,name:'Laura G.',rating:5,text:'La keratina marroquí transformó mi cabello completamente. Muy profesionales.',service:'Keratina Marroquí',date:'2026-04-15'},
    {id:3,name:'María R.',rating:5,text:'El masaje fue exactamente lo que necesitaba. Los aceites huelen maravillosamente.',service:'Masaje Relajante',date:'2026-04-10'},
    {id:4,name:'Carmen L.',rating:5,text:'Me hice el ritual novia y quedé enamorada. Todo perfecto desde el trato hasta el resultado.',service:'Ritual Novia',date:'2026-04-05'},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMAS — web (crema) y admin (oscuro)
// ═══════════════════════════════════════════════════════════════════════════════
const WEB = {bg:'#0D0A08',sf:'#1A1210',sf2:'#231815',bd:'rgba(201,169,110,0.15)',gold:'#C9A96E',dark:'#F0E8DA',text:'#E8DDD0',muted:'#8A7A6A',light:'#1F1610',sand:'#2A1E15',teal:'#2A7A6F',terra:'#C4622D'};
const ADM = {bg:'#0B0B0B',sf:'#141414',sf2:'#1D1D1D',bd:'rgba(201,169,110,0.12)',gold:'#C9A96E',teal:'#2A7A6F',terra:'#C4622D',text:'#F0EBE0',muted:'#7A7570'};

const SL = {confirmed:'Confirmada',pending:'Pendiente',completed:'Completada',cancelled:'Cancelada'};
const SC = {confirmed:'#2A7A6F',pending:'#C9A96E',completed:'#555',cancelled:'#C4622D'};
const PMETS = [{id:'tarjeta',label:'Tarjeta',I:CreditCard},{id:'efectivo',label:'Efectivo',I:Banknote},{id:'bizum',label:'Bizum',I:Smartphone},{id:'transferencia',label:'Transf.',I:ArrowLeftRight}];
const EMOJIS = {'Cabello':'🧴','Hammam':'🫙','Cuerpo':'🧼','Facial':'✨','Masaje':'💆'};
const CAT_COLORS = {Hammam:'rgba(29,107,95,0.12)',Cabello:'rgba(184,146,74,0.12)',Masaje:'rgba(180,120,80,0.1)',Facial:'rgba(160,140,200,0.1)',Especial:'rgba(184,146,74,0.2)',Cuerpo:'rgba(100,150,120,0.1)'};

// ═══════════════════════════════════════════════════════════════════════════════
// DISPONIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
function freeSlots(date, staffId, duration, appointments, blocks) {
  if (!date) return ALL_SLOTS;
  const now = new Date();
  const busy = (appointments||[]).filter(a => a.date===date && (!staffId||a.staffId===+staffId) && a.status!=='cancelled');
  // Bloqueos del terapeuta en esa fecha
  const staffBlocks = staffId ? (blocks||[]).filter(b=>{
    const sid=+staffId;
    return b.staffId===sid && b.startDate<=date && b.endDate>=date;
  }) : [];
  // Si hay bloqueo de día completo, sin huecos
  if(staffBlocks.some(b=>b.allDay)) return [];
  return ALL_SLOTS.filter(slot => {
    const [h,m] = slot.split(':').map(Number), s=h*60+m, e=s+duration;
    if (date===tod() && s<=now.getHours()*60+now.getMinutes()+30) return false;
    // Bloqueos por hora
    if(staffBlocks.some(b=>{
      if(b.allDay)return true;
      const [bh,bm]=b.startTime.split(':').map(Number),[eh,em]=b.endTime.split(':').map(Number);
      const bs=bh*60+bm, be=eh*60+em;
      return s<be && e>bs;
    })) return false;
    return !busy.some(a => { const [ah,am]=(a.time||'00:00').split(':').map(Number),as=ah*60+am,ae=as+(a.duration||60); return s<ae&&e>as; });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES COMPARTIDOS
// ═══════════════════════════════════════════════════════════════════════════════
function MiniCal({value, onChange, minDate}) {
  const [view,setView] = useState(() => { const d=new Date(value||tod()); return new Date(d.getFullYear(),d.getMonth(),1); });
  const yr=view.getFullYear(), mo=view.getMonth();
  const label = new Date(yr,mo,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'});
  const first = (new Date(yr,mo,1).getDay()+6)%7;
  const dim = new Date(yr,mo+1,0).getDate();
  const min = minDate||tod();
  const cells = []; for(let i=0;i<first;i++) cells.push(null);
  for(let d=1;d<=dim;d++){const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;cells.push({d,ds,dis:ds<min});}
  const G=WEB.gold;
  return(
    <div style={{background:WEB.sf,border:`1px solid ${WEB.bd}`,borderRadius:14,padding:16,boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()-1,1))} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,padding:4}}><ChevronLeft size={16}/></button>
        <span style={{fontSize:14,fontWeight:600,color:WEB.text,textTransform:'capitalize'}}>{label}</span>
        <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()+1,1))} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,padding:4}}><ChevronRight size={16}/></button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d=><div key={d} style={{textAlign:'center',fontSize:10,color:WEB.muted,padding:'3px 0',fontWeight:600}}>{d}</div>)}
        {cells.map((cell,i)=>cell===null?<div key={`e${i}`}/>:(
          <button key={cell.ds} disabled={cell.dis} onClick={()=>onChange(cell.ds)} style={{padding:'6px 2px',border:'none',borderRadius:7,cursor:cell.dis?'not-allowed':'pointer',textAlign:'center',background:value===cell.ds?G:cell.ds===tod()?`${G}18`:'transparent',color:value===cell.ds?'#fff':cell.dis?'#ccc':WEB.text,fontSize:12,fontWeight:cell.ds===tod()?700:400,opacity:cell.dis?0.3:1}}>
            {cell.d}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ██████ VISTA WEB PÚBLICA ██████
// ═══════════════════════════════════════════════════════════════════════════════

// Modal de confirmación (reemplaza window.confirm que está bloqueado en sandboxes)
function ConfirmModal({msg, onOk, onCancel}){
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,backdropFilter:'blur(4px)'}}>
      <div style={{background:ADM.sf,border:`1px solid ${ADM.bd}`,borderRadius:16,padding:28,width:320,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
        <div style={{fontSize:32,marginBottom:12}}>🗑</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:ADM.text,marginBottom:8}}>¿Eliminar?</div>
        <div style={{fontSize:13,color:ADM.muted,marginBottom:22,lineHeight:1.6}}>{msg||'Esta acción no se puede deshacer.'}</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:'10px',border:`1px solid ${ADM.bd}`,borderRadius:10,background:'transparent',color:ADM.muted,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Cancelar</button>
          <button onClick={onOk} style={{flex:1,padding:'10px',border:'none',borderRadius:10,background:ADM.terra,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// Hook para usar el confirm modal fácilmente
function useConfirm(){
  const [state,setState]=useState(null); // {msg, resolve}
  const ask=(msg)=>new Promise(resolve=>setState({msg,resolve}));
  const modal=state?(
    <ConfirmModal msg={state.msg}
      onOk={()=>{state.resolve(true);setState(null);}}
      onCancel={()=>{state.resolve(false);setState(null);}}
    />
  ):null;
  return [ask, modal];
}

const ATABS = [{id:'dashboard',I:LayoutDashboard,label:'Dashboard'},{id:'agenda',I:Calendar,label:'Agenda'},{id:'clientes',I:Users,label:'Clientes'},{id:'servicios',I:Sparkles,label:'Servicios'},{id:'productos',I:Package,label:'Productos'},{id:'inventario',I:Archive,label:'Inventario'},{id:'proveedores',I:Truck,label:'Proveedores'},{id:'caja',I:DollarSign,label:'Caja'},{id:'personal',I:UserCheck,label:'Personal'},{id:'pedidos',I:Package,label:'Pedidos Web'},{id:'recursos',I:Archive,label:'Recursos'},{id:'config',I:UserCheck,label:'Configuración'},{id:'bloqueos',I:Ban,label:'Bloqueos'},{id:'informes',I:BarChart2,label:'Informes'},{id:'presencia',I:Clock,label:'Presencia'}];

function AdminApp({D, commit, onExit}) {
  const [tab,setTab] = useState('dashboard');
  const [modal,setModal] = useState(null);
  const [delState,setDelState] = useState(null); // {msg, fn}
  const ask = (fn, msg) => setDelState({fn, msg: msg||'Esta acción no se puede deshacer.'});
  const pendingOrders = (D.orders||[]).filter(o=>o.status==='pending');
  const low = (D.inventory||[]).filter(i=>i.quantity<=i.minQuantity);
  const p = {D, commit, setModal, ask};
  return(
    <div style={{display:'flex',minHeight:'100vh',background:ADM.bg,fontFamily:"'Nunito',sans-serif",color:ADM.text}}>
      <aside style={{width:204,background:ADM.sf,borderRight:`1px solid ${ADM.bd}`,display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',flexShrink:0,overflowY:'auto'}}>
        <div style={{padding:'20px 16px 14px',borderBottom:`1px solid ${ADM.bd}`}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:ADM.gold}}>ShinyCandle</div><div style={{fontSize:9,color:ADM.muted,marginTop:2,letterSpacing:1.5}}>PANEL DE GESTIÓN</div></div>
        <nav style={{flex:1,padding:'6px 0'}}>
          {ATABS.map(({id,I,label})=>{
            const badge=id==='pedidos'?pendingOrders.length:0;
            return(<button key={id} onClick={()=>setTab(id)} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 16px',width:'100%',border:'none',background:tab===id?`${ADM.gold}12`:'transparent',color:tab===id?ADM.gold:ADM.muted,borderLeft:tab===id?`2px solid ${ADM.gold}`:'2px solid transparent',fontSize:12,fontWeight:tab===id?600:400,cursor:'pointer',fontFamily:'inherit'}}>
              <I size={14}/>{label}
              {badge>0&&<span style={{marginLeft:'auto',background:ADM.terra,color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:700}}>{badge}</span>}
            </button>);
          })}
        </nav>
        <button onClick={onExit} style={{margin:'10px 12px 14px',display:'flex',alignItems:'center',gap:8,padding:'9px 14px',border:`1px solid ${ADM.bd}`,borderRadius:10,background:'transparent',color:ADM.muted,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}><LogOut size={13}/>Volver a la web</button>
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <header style={{padding:'13px 24px',borderBottom:`1px solid ${ADM.bd}`,background:ADM.sf,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600}}>{ATABS.find(t=>t.id===tab)?.label}</div><div style={{fontSize:11,color:ADM.muted,marginTop:1}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            {low.length>0&&<div style={{display:'flex',alignItems:'center',gap:6,background:`${ADM.terra}12`,color:ADM.terra,padding:'5px 11px',borderRadius:20,fontSize:11,border:`1px solid ${ADM.terra}30`}}><AlertTriangle size={12}/>{low.length} stock bajo</div>}
            {pendingOrders.length>0&&<div onClick={()=>setTab('pedidos')} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:6,background:'rgba(155,127,212,0.1)',color:'#9B7FD4',padding:'5px 11px',borderRadius:20,fontSize:11,border:'1px solid rgba(155,127,212,0.3)'}}>📦 {pendingOrders.length} pedido{pendingOrders.length>1?'s':''}</div>}
          </div>
        </header>
        <div style={{flex:1,overflowY:'auto',padding:'22px 24px'}}>
          {tab==='dashboard'&&<AdminDash {...p}/>}
          {tab==='agenda'&&<AdminAgenda {...p}/>}
          {tab==='clientes'&&<AdminClientes {...p}/>}
          {tab==='servicios'&&<AdminServicios {...p}/>}
          {tab==='productos'&&<AdminProductos {...p}/>}
          {tab==='inventario'&&<AdminInventario {...p}/>}
          {tab==='proveedores'&&<AdminProveedores {...p}/>}
          {tab==='caja'&&<AdminCaja {...p}/>}
          {tab==='personal'&&<AdminPersonal {...p}/>}
          {tab==='pedidos'&&<AdminPedidos {...p}/>}
          {tab==='recursos'&&<AdminRecursos {...p}/>}
          {tab==='config'&&<AdminConfig {...p}/>}
          {tab==='bloqueos'&&<AdminBloqueos {...p}/>}
          {tab==='informes'&&<AdminInformes {...p}/>}
          {tab==='presencia'&&<AdminPresencia {...p}/>}
        </div>
      </div>
      {modal&&<AdminModal modal={modal} setModal={setModal} D={D} commit={commit}/>}
      {delState&&<ConfirmModal msg={delState.msg}
        onOk={()=>{delState.fn();setDelState(null);}}
        onCancel={()=>setDelState(null)}
      />}
    </div>
  );
}

const A = ADM;
const inp = {background:A.sf2,color:A.text,border:`1px solid ${A.bd}`,borderRadius:8,padding:'8px 11px',fontFamily:"'Nunito',sans-serif",fontSize:13,outline:'none',width:'100%'};
function ABox({ch,sx={}}){return <div style={{background:A.sf,border:`1px solid ${A.bd}`,borderRadius:12,padding:20,...sx}}>{ch}</div>;}
function AKpi({label,value,icon:I,color=A.gold,sub}){return <ABox sx={{flex:1,minWidth:0}} ch={<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div style={{minWidth:0,flex:1}}><div style={{fontSize:10,color:A.muted,marginBottom:8,letterSpacing:1,textTransform:'uppercase'}}>{label}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color,fontWeight:700}}>{value}</div>{sub&&<div style={{fontSize:11,color:A.muted,marginTop:3}}>{sub}</div>}</div><div style={{background:`${color}18`,padding:9,borderRadius:9,color,flexShrink:0,marginLeft:8}}><I size={17}/></div></div>}/>;}
function ABtn({ch,onClick,v='primary',sz='md',sx={}}){const vs={primary:{background:A.gold,color:'#0A0A0A',border:'none'},secondary:{background:'transparent',color:A.gold,border:`1px solid ${A.gold}44`},danger:{background:`${A.terra}18`,color:A.terra,border:`1px solid ${A.terra}30`},ghost:{background:'transparent',color:A.muted,border:`1px solid ${A.bd}`},success:{background:`${A.teal}20`,color:A.teal,border:`1px solid ${A.teal}44`}};const ss={sm:{padding:'5px 10px',fontSize:11},md:{padding:'8px 16px',fontSize:13}};return <button onClick={onClick} style={{borderRadius:8,fontFamily:"'Nunito',sans-serif",fontWeight:600,display:'flex',alignItems:'center',gap:5,cursor:'pointer',whiteSpace:'nowrap',...vs[v],...ss[sz],...sx}} onMouseOver={e=>e.currentTarget.style.opacity='0.75'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>{ch}</button>;}
function ABadge({status}){const c=SC[status]||A.muted;return <span style={{background:`${c}20`,color:c,border:`1px solid ${c}40`,borderRadius:20,padding:'2px 9px',fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>{SL[status]||status}</span>;}
function AFld({label,ch}){return <div style={{marginBottom:12}}><label style={{fontSize:11,color:A.muted,display:'block',marginBottom:5,letterSpacing:.5,textTransform:'uppercase'}}>{label}</label>{ch}</div>;}
function AHead({title,action}){return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:A.text,fontWeight:600}}>{title}</h2>{action}</div>;}

function AdminCal({appts,sel,onSel}){
  const [view,setView]=useState(()=>{const d=new Date(sel||tod());return new Date(d.getFullYear(),d.getMonth(),1);});
  const yr=view.getFullYear(),mo=view.getMonth();
  const lbl=new Date(yr,mo,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'});
  const first=(new Date(yr,mo,1).getDay()+6)%7,dim=new Date(yr,mo+1,0).getDate(),t=tod();
  const cells=[];for(let i=0;i<first;i++)cells.push(null);
  for(let d=1;d<=dim;d++){const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;cells.push({d,ds,a:(appts||[]).filter(a=>a.date===ds&&a.status!=='cancelled')});}
  return(<ABox sx={{padding:14}} ch={<>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()-1,1))} style={{background:'none',border:'none',color:A.muted,cursor:'pointer',padding:4}}><ChevronLeft size={15}/></button>
      <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:A.text,textTransform:'capitalize'}}>{lbl}</span>
      <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()+1,1))} style={{background:'none',border:'none',color:A.muted,cursor:'pointer',padding:4}}><ChevronRight size={15}/></button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
      {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d=><div key={d} style={{textAlign:'center',fontSize:9,color:A.muted,padding:'3px 0',fontWeight:600}}>{d}</div>)}
      {cells.map((cell,i)=>cell===null?<div key={`e${i}`}/>:(
        <div key={cell.ds} onClick={()=>onSel(cell.ds)} style={{padding:'4px 2px',borderRadius:6,cursor:'pointer',textAlign:'center',background:sel===cell.ds?A.gold:cell.ds===t?`${A.gold}18`:'transparent',border:`1px solid ${sel===cell.ds?A.gold:cell.ds===t?`${A.gold}55`:'transparent'}`,minHeight:38}}>
          <div style={{fontSize:11,fontWeight:cell.ds===t?700:400,color:sel===cell.ds?'#0A0A0A':A.text}}>{cell.d}</div>
          {cell.a.length>0&&<div style={{display:'flex',justifyContent:'center',gap:1,marginTop:2}}>{cell.a.slice(0,3).map(a=><div key={a.id} style={{width:4,height:4,borderRadius:'50%',background:sel===cell.ds?'#0A0A0A66':SC[a.status]||A.muted}}/>)}</div>}
        </div>
      ))}
    </div>
  </>}/>);
}

function CierreModal({appt,D,onClose,onDone}){
  const [method,setMethod]=useState('tarjeta');
  const [soldProds,setSoldProds]=useState([]);  // productos vendidos
  const [extraSvcs,setExtraSvcs]=useState([]);  // servicios adicionales
  const [tip,setTip]=useState('');
  const [notes,setNotes]=useState(appt.notes||'');

  // Productos
  const addP=p=>setSoldProds(s=>{const e=s.find(i=>i.id===p.id);return e?s.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...s,{...p,qty:1}];});
  const adjP=(id,d)=>setSoldProds(s=>s.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));

  // Servicios adicionales
  const addSvc=sv=>setExtraSvcs(s=>{const e=s.find(i=>i.id===sv.id);return e?s.map(i=>i.id===sv.id?{...i,qty:i.qty+1}:i):[...s,{...sv,qty:1}];});
  const adjSvc=(id,d)=>setExtraSvcs(s=>s.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));

  const tipAmt=parseFloat(tip)||0;
  const prodTotal=soldProds.reduce((s,i)=>s+i.price*i.qty,0);
  const svcTotal=extraSvcs.reduce((s,i)=>s+i.price*i.qty,0);
  const total=appt.price+prodTotal+svcTotal+tipAmt;

  // Al pasar a cobrar, sold = productos + servicios extra (para las transacciones)
  const submit=()=>onDone({method,sold:soldProds,extraSvcs,tip:tipAmt,notes,total});

  const rowStyle={display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:`1px solid ${A.bd}`};
  const qtyBtn=(onClick,label,gold)=>(<button onClick={onClick} style={{width:24,height:24,border:`1px solid ${gold?A.gold+'44':A.bd}`,background:gold?`${A.gold}10`:A.sf2,color:gold?A.gold:A.text,borderRadius:5,cursor:'pointer',fontSize:14,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>{label}</button>);

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,backdropFilter:'blur(4px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:A.sf,border:`1px solid ${A.bd}`,borderRadius:20,padding:26,width:520,maxHeight:'92vh',overflowY:'auto'}}>

        {/* Cabecera */}
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:19}}>Cerrar Cita</div>
            <div style={{fontSize:12,color:A.muted,marginTop:2}}>{appt.clientName} · {appt.time}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:A.muted,cursor:'pointer'}}><X size={18}/></button>
        </div>

        {/* Servicio original */}
        <div style={{background:A.sf2,borderRadius:10,padding:'10px 14px',marginBottom:16,borderLeft:`3px solid ${A.gold}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:A.text}}>{appt.serviceName}</div>
              <div style={{fontSize:11,color:A.muted,marginTop:2}}>Servicio original · {appt.staffName}</div>
            </div>
            <span style={{fontSize:15,fontWeight:700,color:A.gold}}>{fmt(appt.price)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <AFld label="Método de pago" ch={
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {PMETS.map(({id,label,I})=>(
              <button key={id} onClick={()=>setMethod(id)} style={{flex:1,minWidth:78,padding:'9px 6px',borderRadius:9,border:`1px solid ${method===id?A.gold:A.bd}`,background:method===id?`${A.gold}15`:'transparent',color:method===id?A.gold:A.muted,cursor:'pointer',fontSize:11,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:4,fontFamily:"'Nunito',sans-serif"}}>
                <I size={13}/>{label}
              </button>
            ))}
          </div>
        }/>

        {/* Servicios adicionales */}
        <AFld label="✨ Servicios adicionales (opcional)" ch={<>
          <select style={inp} onChange={e=>{const sv=(D.services||[]).find(s=>s.id===+e.target.value);if(sv)addSvc(sv);e.target.value='';}}>
            <option value="">Añadir servicio...</option>
            {(D.services||[]).filter(s=>s.active&&s.id!==appt.serviceId).map(s=>(
              <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)}</option>
            ))}
          </select>
          {extraSvcs.map(item=>(
            <div key={item.id} style={rowStyle}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:A.text}}>{item.name}</div>
                <div style={{fontSize:11,color:A.gold}}>{fmt(item.price)} / ud</div>
              </div>
              {qtyBtn(()=>adjSvc(item.id,-1),'−',false)}
              <span style={{fontSize:13,minWidth:20,textAlign:'center',fontWeight:700}}>{item.qty}</span>
              {qtyBtn(()=>adjSvc(item.id,+1),'+',true)}
              <span style={{color:A.gold,fontSize:13,fontWeight:700,minWidth:56,textAlign:'right'}}>{fmt(item.price*item.qty)}</span>
              <button onClick={()=>setExtraSvcs(s=>s.filter(i=>i.id!==item.id))} style={{background:'none',border:'none',color:A.muted,cursor:'pointer'}}><X size={12}/></button>
            </div>
          ))}
        </>}/>

        {/* Productos */}
        <AFld label="📦 Productos vendidos (opcional)" ch={<>
          <select style={inp} onChange={e=>{const p=(D.products||[]).find(p=>p.id===+e.target.value);if(p)addP(p);e.target.value='';}}>
            <option value="">Añadir producto...</option>
            {(D.products||[]).filter(p=>p.stock>0).map(p=>(
              <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)} (stock: {p.stock})</option>
            ))}
          </select>
          {soldProds.map(item=>(
            <div key={item.id} style={rowStyle}>
              <span style={{flex:1,fontSize:13}}>{item.name}</span>
              {qtyBtn(()=>adjP(item.id,-1),'−',false)}
              <span style={{fontSize:13,minWidth:20,textAlign:'center',fontWeight:700}}>{item.qty}</span>
              {qtyBtn(()=>adjP(item.id,+1),'+',true)}
              <span style={{color:A.gold,fontSize:13,fontWeight:700,minWidth:56,textAlign:'right'}}>{fmt(item.price*item.qty)}</span>
              <button onClick={()=>setSoldProds(s=>s.filter(i=>i.id!==item.id))} style={{background:'none',border:'none',color:A.muted,cursor:'pointer'}}><X size={12}/></button>
            </div>
          ))}
        </>}/>

        {/* Propina y notas */}
        <div style={{display:'flex',gap:10}}>
          <AFld label="Propina" ch={<input style={inp} type="number" value={tip} onChange={e=>setTip(e.target.value)} placeholder="0.00" min="0"/>}/>
        </div>
        <AFld label="Notas del servicio" ch={<textarea style={{...inp,resize:'none'}} value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Observaciones, tratamiento aplicado..."/>}/>

        {/* Desglose total */}
        <div style={{background:`${A.gold}10`,border:`1px solid ${A.gold}25`,borderRadius:10,padding:'12px 14px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:A.muted,marginBottom:3}}>
            <span>{appt.serviceName}</span><span>{fmt(appt.price)}</span>
          </div>
          {extraSvcs.map(i=>(
            <div key={i.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:A.muted,marginBottom:3}}>
              <span>✨ {i.name}{i.qty>1?` x${i.qty}`:''}</span><span>{fmt(i.price*i.qty)}</span>
            </div>
          ))}
          {soldProds.map(i=>(
            <div key={i.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:A.muted,marginBottom:3}}>
              <span>📦 {i.name} x{i.qty}</span><span>{fmt(i.price*i.qty)}</span>
            </div>
          ))}
          {tipAmt>0&&(
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:A.muted,marginBottom:3}}>
              <span>Propina</span><span>{fmt(tipAmt)}</span>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:700,color:A.gold,borderTop:`1px solid ${A.gold}30`,paddingTop:8,marginTop:6}}>
            <span>Total</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:22}}>{fmt(total)}</span>
          </div>
        </div>

        <ABtn ch={<><Check size={14}/>Cobrar {fmt(total)}</>} onClick={submit} sx={{width:'100%',justifyContent:'center',padding:'12px'}}/>
      </div>
    </div>
  );
}

function AdminDash({D}){
  const t=tod(),mo=t.slice(0,7);
  const todayA=(D.appointments||[]).filter(a=>a.date===t);
  const inc=(D.transactions||[]).filter(x=>x.type==='income'&&x.date.startsWith(mo)).reduce((s,x)=>s+x.amount,0);
  const exp=(D.transactions||[]).filter(x=>x.type==='expense'&&x.date.startsWith(mo)).reduce((s,x)=>s+x.amount,0);
  const todayInc=(D.transactions||[]).filter(x=>x.date===t&&x.type==='income').reduce((s,x)=>s+x.amount,0);
  const low=(D.inventory||[]).filter(i=>i.quantity<=i.minQuantity);
  const pending=(D.orders||[]).filter(o=>o.status==='pending');
  return(<div style={{display:'flex',flexDirection:'column',gap:18}}>
    {(()=>{
      const compMes=(D.appointments||[]).filter(a=>a.date.startsWith(mo)&&a.status==='completed');
      const ticketMedio=compMes.length>0?compMes.reduce((s,a)=>s+a.price,0)/compMes.length:0;
      const ticketHoy=todayA.filter(a=>a.status==='completed');
      const ticketHoyVal=ticketHoy.length>0?ticketHoy.reduce((s,a)=>s+a.price,0)/ticketHoy.length:0;
      return(
        <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
          <AKpi label="Ingresos hoy" value={fmt(todayInc)} icon={TrendingUp} color={A.gold} sub={`${todayA.length} citas`}/>
          <AKpi label="Citas hoy" value={todayA.length} icon={Calendar} color={A.teal} sub={`${todayA.filter(a=>a.status==='confirmed').length} confirmadas`}/>
          <AKpi label="Ticket medio mes" value={fmt(ticketMedio)} icon={Star} color={A.gold} sub={`${compMes.length} citas completadas`}/>
          <AKpi label="Pedidos web" value={pending.length} icon={Package} color="#9B7FD4" sub="pendientes"/>
          <AKpi label="Balance mes" value={fmt(inc-exp)} icon={DollarSign} color={inc>=exp?A.teal:A.terra} sub={`${fmt(inc)} ingresado`}/>
        </div>
      );
    })()}
    <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:14}}>
      <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:14}}>Agenda de Hoy</div>{todayA.length===0?<div style={{color:A.muted,fontSize:13,textAlign:'center',padding:'30px 0'}}>Sin citas para hoy</div>:todayA.sort((a,b)=>a.time.localeCompare(b.time)).map(a=><div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:10,background:A.sf2,borderRadius:9,marginBottom:8}}><div style={{background:`${A.gold}20`,color:A.gold,padding:'5px 9px',borderRadius:7,fontSize:12,fontWeight:700,flexShrink:0}}>{a.time}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.clientName}</div><div style={{fontSize:11,color:A.muted}}>{a.serviceName}{a.source==='web'&&<span style={{color:'#9B7FD4',marginLeft:5}}>🌐web</span>}</div></div><ABadge status={a.status}/><div style={{color:A.gold,fontSize:13,fontWeight:700,flexShrink:0}}>{fmt(a.price)}</div></div>)}</>}/>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {low.length>0&&<ABox sx={{border:`1px solid ${A.terra}33`}} ch={<><div style={{color:A.terra,fontSize:13,fontWeight:600,marginBottom:8,display:'flex',alignItems:'center',gap:6}}><AlertTriangle size={13}/>Stock bajo ({low.length})</div>{low.map(i=><div key={i.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0',borderBottom:`1px solid ${A.bd}`}}><span>{i.name}</span><span style={{color:A.terra,fontWeight:700}}>{i.quantity} {i.unit}</span></div>)}</>}/>}
        {pending.length>0&&<ABox sx={{border:'1px solid rgba(155,127,212,0.2)'}} ch={<><div style={{fontSize:13,fontWeight:600,color:'#9B7FD4',marginBottom:8}}>📦 Pedidos ({pending.length})</div>{pending.slice(0,3).map(o=><div key={o.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0',borderBottom:`1px solid ${A.bd}`}}><span>{o.clientName}</span><span style={{color:A.gold,fontWeight:700}}>{fmt(o.total)}</span></div>)}</>}/>}
        <ABox sx={{flex:1}} ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:14,marginBottom:10}}>Últimos movimientos</div>{(D.transactions||[]).slice(-5).reverse().map(tx=><div key={tx.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${A.bd}`}}><div style={{minWidth:0,flex:1}}><div style={{fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.description}</div><div style={{fontSize:10,color:A.muted}}>{tx.date}</div></div><span style={{fontSize:12,fontWeight:700,color:tx.type==='income'?A.teal:A.terra,flexShrink:0,marginLeft:8}}>{tx.type==='income'?'+':'-'}{fmt(tx.amount)}</span></div>)}</>}/>
      </div>
    </div>
  </div>);
}

function AdminAgenda({D,commit,setModal,ask}){
  const [date,setDate]=useState(tod());
  const [cierre,setCierre]=useState(null);
  const [lastCobro,setLastCobro]=useState(null);
  const appts=(D.appointments||[]).filter(a=>a.date===date).sort((a,b)=>a.time.localeCompare(b.time));
  const updSt=(id,status)=>commit({...D,appointments:(D.appointments||[]).map(a=>a.id===id?{...a,status}:a)});
  const del=id=>ask(()=>commit({...D,appointments:(D.appointments||[]).filter(a=>a.id!==id)}),'¿Eliminar esta cita?');
  const cobrar=({method,sold,extraSvcs,tip,notes,total})=>{
    const updA=(D.appointments||[]).map(a=>a.id===cierre.id?{...a,status:'completed',notes}:a);
    const id0=nid(D.transactions||[]);
    // Servicio principal (con propina si la hay)
    const txs=[{id:id0,date:tod(),type:'income',category:'Servicios',description:`${cierre.serviceName} — ${cierre.clientName}${tip>0?` (+propina ${fmt(tip)})`:''}`,amount:cierre.price+tip,method,staffId:cierre.staffId}];
    let offset=1;
    // Servicios adicionales
    (extraSvcs||[]).forEach((it,i)=>txs.push({id:id0+offset+i,date:tod(),type:'income',category:'Servicios',description:`${it.name}${it.qty>1?` x${it.qty}`:''} — ${cierre.clientName}`,amount:it.price*it.qty,method,staffId:cierre.staffId}));
    offset+=(extraSvcs||[]).length;
    // Productos
    sold.forEach((it,i)=>txs.push({id:id0+offset+i,date:tod(),type:'income',category:'Productos',description:`${it.name} x${it.qty} — ${cierre.clientName}`,amount:it.price*it.qty,method,staffId:cierre.staffId}));
    const updP=(D.products||[]).map(p=>{const s=sold.find(x=>x.id===p.id);return s?{...p,stock:Math.max(0,p.stock-s.qty)}:p;});
    const updC=(D.clients||[]).map(c=>c.id===cierre.clientId?{...c,visits:(c.visits||0)+1,totalSpent:(c.totalSpent||0)+total,lastVisit:tod()}:c);
    commit({...D,appointments:updA,transactions:[...(D.transactions||[]),...txs],products:updP,clients:updC});
    // Guardar datos para factura
    setLastCobro({
      items:[
        {desc:cierre.serviceName,qty:1,price:cierre.price},
        ...(extraSvcs||[]).map(s=>({desc:`✨ ${s.name}`,qty:s.qty,price:s.price})),
        ...sold.map(s=>({desc:`📦 ${s.name}`,qty:s.qty,price:s.price})),
      ],
      method,tip,total,clientName:cierre.clientName,date:tod(),staffName:cierre.staffName,appt:cierre
    });
    setCierre(null);
  };
  return(<div style={{display:'flex',gap:16}}>
    <div style={{width:218,flexShrink:0}}>
      <AdminCal appts={D.appointments} sel={date} onSel={setDate}/>
      <div style={{marginTop:10}}><ABtn ch={<><Plus size={12}/>Nueva Cita</>} onClick={()=>setModal({entity:'appointments',item:null})} sz="sm" sx={{width:'100%',justifyContent:'center'}}/></div>
      <ABox sx={{marginTop:10,padding:12}} ch={<><div style={{fontSize:10,color:A.muted,marginBottom:8,letterSpacing:1}}>LEYENDA</div>{Object.entries(SC).map(([k,color])=><div key={k} style={{display:'flex',alignItems:'center',gap:7,fontSize:11,color:A.muted,marginBottom:4}}><div style={{width:8,height:8,borderRadius:'50%',background:color}}/>{SL[k]}</div>)}</>}/>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{marginBottom:14}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:A.text}}>{new Date(date+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><div style={{fontSize:12,color:A.muted,marginTop:2}}>{appts.length} cita{appts.length!==1?'s':''}</div></div>
      {appts.length===0?<ABox ch={<div style={{textAlign:'center',padding:'50px 0',color:A.muted}}>No hay citas este día</div>}/>:
      appts.map(a=><ABox key={a.id} sx={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',borderLeft:`3px solid ${SC[a.status]||A.bd}`,paddingLeft:16,marginBottom:10}} ch={<>
        <div style={{textAlign:'center',minWidth:50}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:A.gold,fontWeight:700}}>{a.time}</div><div style={{fontSize:10,color:A.muted}}>{a.duration}min</div></div>
        <div style={{flex:1,minWidth:120}}><div style={{fontWeight:600,fontSize:14}}>{a.clientName}</div><div style={{fontSize:12,color:A.muted,marginTop:2}}>{a.serviceName}</div>{a.notes&&<div style={{fontSize:11,color:A.gold,marginTop:2,fontStyle:'italic'}}>📝 {a.notes}</div>}<div style={{fontSize:11,color:A.muted,marginTop:2}}>👤 {a.staffName}{a.source==='web'&&<span style={{color:'#9B7FD4',marginLeft:6}}>🌐 web · {a.email}</span>}</div></div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:A.gold}}>{fmt(a.price)}</div>
          <ABadge status={a.status}/>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {a.status==='pending'&&<ABtn sz="sm" ch={<><Check size={11}/>Confirmar</>} onClick={()=>updSt(a.id,'confirmed')}/>}
            {(a.status==='confirmed'||a.status==='pending')&&<ABtn sz="sm" v="success" ch="💳 Cobrar" onClick={()=>setCierre(a)}/>}
            {a.status==='completed'&&<ABtn sz="sm" v="ghost" ch={<><FileText size={11}/>Factura</>} onClick={()=>setLastCobro({items:[{desc:a.serviceName,qty:1,price:a.price}],method:'—',tip:0,total:a.price,clientName:a.clientName,date:a.date,staffName:a.staffName,appt:a})}/>}
            {a.status!=='cancelled'&&a.status!=='completed'&&<ABtn sz="sm" v="ghost" ch={<><X size={11}/>Cancelar</>} onClick={()=>updSt(a.id,'cancelled')}/>}
            <ABtn sz="sm" v="danger" ch={<Trash2 size={11}/>} onClick={()=>del(a.id)}/>
          </div>
        </div>
      </>}/>)}
    </div>
    {cierre&&<CierreModal appt={cierre} D={D} onClose={()=>setCierre(null)} onDone={cobrar}/>}
    {lastCobro&&<FacturaModal cierreData={lastCobro} D={D} onClose={()=>setLastCobro(null)}/>}
  </div>);
}

function AdminClientes({D,commit,setModal,ask}){
  const [q,setQ]=useState('');const [sel,setSel]=useState(null);
  const list=(D.clients||[]).filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.email?.includes(q)||c.phone?.includes(q));
  const cl=sel?(D.clients||[]).find(c=>c.id===sel):null;
  const cAppts=cl?(D.appointments||[]).filter(a=>a.clientId===cl.id):[];
  return(<div style={{display:'flex',gap:16}}>
    <div style={{flex:1,minWidth:0}}>
      <AHead title="Clientes" action={<ABtn ch={<><Plus size={13}/>Nuevo</>} onClick={()=>setModal({entity:'clients',item:null})}/>}/>
      <div style={{position:'relative',marginBottom:14}}><Search size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:A.muted}}/><input style={{...inp,paddingLeft:32}} placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      {list.map(c=><ABox key={c.id} sx={{display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:8,border:sel===c.id?`1px solid ${A.gold}44`:`1px solid ${A.bd}`}} ch={<>
        <div style={{width:40,height:40,borderRadius:'50%',background:`${A.gold}20`,display:'flex',alignItems:'center',justifyContent:'center',color:A.gold,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,flexShrink:0}} onClick={()=>setSel(sel===c.id?null:c.id)}>{c.name[0]}</div>
        <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setSel(sel===c.id?null:c.id)}><div style={{fontWeight:600}}>{c.name}{c.notes?.includes('VIP')&&<Star size={11} style={{color:A.gold,marginLeft:5}}/>}</div><div style={{fontSize:12,color:A.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.email} · {c.phone}</div></div>
        <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:13,color:A.gold,fontWeight:700}}>{fmt(c.totalSpent)}</div><div style={{fontSize:11,color:A.muted}}>{c.visits} visitas</div></div>
        <div style={{display:'flex',gap:4}}><ABtn sz="sm" v="ghost" ch={<Edit2 size={11}/>} onClick={e=>{e.stopPropagation();setModal({entity:'clients',item:c});}}/><ABtn sz="sm" v="danger" ch={<Trash2 size={11}/>} onClick={e=>{e.stopPropagation();ask(()=>{commit({...D,clients:(D.clients||[]).filter(x=>x.id!==c.id)});if(sel===c.id)setSel(null);},'¿Eliminar esta clienta?');}}/></div>
      </>}/>)}
      {list.length===0&&<ABox ch={<div style={{textAlign:'center',padding:'30px 0',color:A.muted}}>Sin resultados</div>}/>}
    </div>
    {cl&&<ABox sx={{width:260,flexShrink:0,alignSelf:'flex-start'}} ch={<><div style={{textAlign:'center',marginBottom:14}}><div style={{width:52,height:52,borderRadius:'50%',background:`${A.gold}20`,display:'flex',alignItems:'center',justifyContent:'center',color:A.gold,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,margin:'0 auto 8px'}}>{cl.name[0]}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600}}>{cl.name}</div></div>{[['Email',cl.email],['Teléfono',cl.phone],['Visitas',cl.visits],['Total',fmt(cl.totalSpent)],['Última visita',cl.lastVisit||'—']].map(([k,v])=><div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'5px 0',borderBottom:`1px solid ${A.bd}`}}><span style={{color:A.muted}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>)}{cl.notes&&<div style={{background:A.sf2,borderRadius:8,padding:9,fontSize:12,color:A.muted,marginTop:10}}>📝 {cl.notes}</div>}{cAppts.length>0&&<><div style={{fontSize:11,color:A.muted,marginTop:12,marginBottom:6}}>Historial ({cAppts.length})</div>{cAppts.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(a=><div key={a.id} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:`1px solid ${A.bd}`}}><div><div style={{color:A.text}}>{a.serviceName}</div><div style={{color:A.muted}}>{a.date}</div></div><span style={{color:A.gold,fontWeight:700}}>{fmt(a.price)}</span></div>)}</>}<ClientDocs client={cl} D={D} commit={commit}/></>}/>}
  </div>);
}

function AdminServicios({D,commit,setModal,ask}){
  const cats=[...new Set((D.services||[]).map(s=>s.category))];
  return(<div><AHead title="Servicios" action={<ABtn ch={<><Plus size={13}/>Nuevo</>} onClick={()=>setModal({entity:'services',item:null})}/>}/>{cats.map(cat=><div key={cat} style={{marginBottom:22}}><div style={{fontSize:10,color:A.gold,letterSpacing:2,marginBottom:10,textTransform:'uppercase'}}>{cat}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>{(D.services||[]).filter(s=>s.category===cat).map(s=><ABox key={s.id} sx={{opacity:s.active?1:0.5}} ch={<><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><div style={{fontWeight:600,fontSize:13,flex:1}}>{s.name}</div><div style={{display:'flex',gap:4}}><ABtn sz="sm" v="ghost" ch={<Edit2 size={10}/>} onClick={()=>setModal({entity:'services',item:s})}/><ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>ask(()=>commit({...D,services:(D.services||[]).filter(x=>x.id!==s.id)}),'¿Eliminar este servicio?')}/></div></div><div style={{fontSize:11,color:A.muted,marginBottom:10,lineHeight:1.5}}>{s.description}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><span style={{color:A.gold,fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>{fmt(s.price)}</span><span style={{fontSize:11,color:A.muted,marginLeft:6}}>{s.duration}min</span></div><ABtn sz="sm" v={s.active?'secondary':'ghost'} ch={s.active?'Activo':'Inactivo'} onClick={()=>commit({...D,services:(D.services||[]).map(x=>x.id===s.id?{...x,active:!x.active}:x)})}/></div></>}/>)}</div></div>)}</div>);
}

function AdminProductos({D,commit,setModal,ask}){
  return(<div><AHead title="Productos" action={<ABtn ch={<><Plus size={13}/>Nuevo</>} onClick={()=>setModal({entity:'products',item:null})}/>}/><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:14}}>{(D.products||[]).map(p=><ABox key={p.id} ch={<><div style={{fontSize:28,textAlign:'center',marginBottom:10}}>{EMOJIS[p.category]||'📦'}</div><div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{p.name}</div><div style={{fontSize:11,color:A.muted,marginBottom:10}}>{p.description}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}><span style={{color:A.gold,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{fmt(p.price)}</span><span style={{fontSize:11,background:p.stock>5?`${A.teal}15`:`${A.terra}15`,color:p.stock>5?A.teal:A.terra,padding:'2px 8px',borderRadius:20}}>Stock: {p.stock}</span></div><div style={{display:'flex',gap:6}}><ABtn sz="sm" v="secondary" ch={<><Edit2 size={10}/>Editar</>} onClick={()=>setModal({entity:'products',item:p})} sx={{flex:1}}/><ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>ask(()=>commit({...D,products:(D.products||[]).filter(x=>x.id!==p.id)}),'¿Eliminar este producto?')}/></div></>}/>)}</div></div>);
}

function AdminInventario({D,commit,setModal,ask}){
  const adj=(id,d)=>commit({...D,inventory:(D.inventory||[]).map(i=>i.id===id?{...i,quantity:Math.max(0,i.quantity+d)}:i)});
  const low=(D.inventory||[]).filter(i=>i.quantity<=i.minQuantity);
  return(<div><AHead title="Inventario" action={<ABtn ch={<><Plus size={13}/>Añadir</>} onClick={()=>setModal({entity:'inventory',item:null})}/>}/>{low.length>0&&<ABox sx={{border:`1px solid ${A.terra}33`,marginBottom:16,background:`${A.terra}08`}} ch={<><div style={{color:A.terra,fontSize:13,fontWeight:600,marginBottom:6,display:'flex',alignItems:'center',gap:6}}><AlertTriangle size={13}/>Stock bajo — {low.length} ítem{low.length>1?'s':''}</div>{low.map(i=><div key={i.id} style={{fontSize:11,color:A.muted}}>· {i.name}: {i.quantity}/{i.minQuantity} {i.unit}</div>)}</>}/>}<div style={{display:'flex',flexDirection:'column',gap:8}}>{(D.inventory||[]).map(i=>{const isL=i.quantity<=i.minQuantity,pct=Math.min(100,(i.quantity/Math.max(i.minQuantity*2,1))*100);return(<ABox key={i.id} sx={{display:'flex',alignItems:'center',gap:14,border:isL?`1px solid ${A.terra}33`:`1px solid ${A.bd}`}} ch={<><div style={{flex:1,minWidth:0}}><div style={{display:'flex',gap:6,alignItems:'center'}}><span style={{fontWeight:600,fontSize:13}}>{i.name}</span>{isL&&<AlertTriangle size={12} style={{color:A.terra}}/>}</div><div style={{fontSize:11,color:A.muted,marginTop:2}}>{i.category}</div></div><div style={{textAlign:'center',minWidth:80}}><div style={{fontSize:10,color:A.muted,marginBottom:3}}>Mín {i.minQuantity}</div><div style={{fontSize:14,color:isL?A.terra:A.text,fontWeight:700}}>{i.quantity} {i.unit}</div></div><div style={{width:80}}><div style={{height:5,background:A.sf2,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:isL?A.terra:A.teal,borderRadius:3}}/></div></div><div style={{display:'flex',gap:4}}><button onClick={()=>adj(i.id,-1)} style={{width:26,height:26,border:`1px solid ${A.bd}`,background:A.sf2,color:A.text,borderRadius:6,cursor:'pointer',fontSize:14}}>−</button><button onClick={()=>adj(i.id,+1)} style={{width:26,height:26,border:`1px solid ${A.gold}44`,background:`${A.gold}10`,color:A.gold,borderRadius:6,cursor:'pointer',fontSize:14}}>+</button></div><ABtn sz="sm" v="ghost" ch={<Edit2 size={11}/>} onClick={()=>setModal({entity:'inventory',item:i})}/></>}/>);})}</div></div>);
}

function AdminProveedores({D,commit,setModal,ask}){
  return(<div><AHead title="Proveedores" action={<ABtn ch={<><Plus size={13}/>Nuevo</>} onClick={()=>setModal({entity:'suppliers',item:null})}/>}/><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>{(D.suppliers||[]).map(s=><ABox key={s.id} ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:3,fontWeight:600}}>{s.name}</div><div style={{fontSize:12,color:A.gold,marginBottom:10}}>{s.contact}</div>{[['Email',s.email],['Tel',s.phone],['Productos',s.products],['Pago',s.paymentTerms]].map(([k,v])=><div key={k} style={{display:'flex',gap:8,fontSize:12,marginBottom:5}}><span style={{color:A.muted,minWidth:55}}>{k}:</span><span>{v||'—'}</span></div>)}{s.notes&&<div style={{background:A.sf2,borderRadius:8,padding:8,fontSize:11,color:A.muted,marginTop:8,marginBottom:10}}>{s.notes}</div>}<div style={{display:'flex',gap:6,marginTop:10}}><ABtn sz="sm" v="secondary" ch={<><Edit2 size={10}/>Editar</>} onClick={()=>setModal({entity:'suppliers',item:s})} sx={{flex:1}}/><ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>ask(()=>commit({...D,suppliers:(D.suppliers||[]).filter(x=>x.id!==s.id)}),'¿Eliminar este proveedor?')}/></div></>}/>)}</div></div>);
}

function AdminCaja({D,commit,setModal}){
  const [filter,setFilter]=useState('all');const [dr,setDr]=useState('month');
  const [arqueo,setArqueo]=useState(false);
  const mo=tod().slice(0,7);
  const fl=(D.transactions||[]).filter(t=>{const tOk=filter==='all'||t.type===filter;let dOk=true;if(dr==='today')dOk=t.date===tod();else if(dr==='month')dOk=t.date.startsWith(mo);else if(dr==='week'){const d=new Date(t.date),w=new Date();w.setDate(w.getDate()-7);dOk=d>=w;}return tOk&&dOk;}).sort((a,b)=>b.date.localeCompare(a.date));
  const inc=fl.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const exp=fl.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  if(arqueo)return <ArqueoModal D={D} commit={commit} onClose={()=>setArqueo(false)}/>;
  return(<div><AHead title="Caja & Contabilidad" action={<div style={{display:'flex',gap:8}}><ABtn ch={<><Plus size={13}/>Movimiento</>} onClick={()=>setModal({entity:'transactions',item:null})}/><ABtn ch="💰 Cerrar caja" onClick={()=>setArqueo(true)} v="secondary"/></div>}/><div style={{display:'flex',gap:14,marginBottom:18,flexWrap:'wrap'}}><AKpi label="Ingresos" value={fmt(inc)} icon={TrendingUp} color={A.teal}/><AKpi label="Gastos" value={fmt(exp)} icon={DollarSign} color={A.terra}/><AKpi label="Balance" value={fmt(inc-exp)} icon={Star} color={inc>=exp?A.gold:A.terra}/></div><div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}><div style={{display:'flex',gap:6}}>{['all','income','expense'].map(f=><ABtn key={f} sz="sm" v={filter===f?'primary':'ghost'} ch={f==='all'?'Todo':f==='income'?'Ingresos':'Gastos'} onClick={()=>setFilter(f)}/>)}</div><div style={{display:'flex',gap:6}}>{[['today','Hoy'],['week','Semana'],['month','Mes'],['all','Todo']].map(([k,l])=><ABtn key={k} sz="sm" v={dr===k?'secondary':'ghost'} ch={l} onClick={()=>setDr(k)}/>)}</div></div><ABox ch={fl.length===0?<div style={{textAlign:'center',padding:'30px 0',color:A.muted}}>Sin movimientos</div>:fl.map((t,i)=><div key={t.id} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0',borderBottom:i<fl.length-1?`1px solid ${A.bd}`:'none'}}><div style={{width:34,height:34,borderRadius:9,background:t.type==='income'?`${A.teal}20`:`${A.terra}20`,display:'flex',alignItems:'center',justifyContent:'center',color:t.type==='income'?A.teal:A.terra,fontSize:16,flexShrink:0}}>{t.type==='income'?'↑':'↓'}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</div><div style={{fontSize:11,color:A.muted}}>{t.category} · {t.method} · {t.date}</div></div><div style={{fontSize:14,fontWeight:700,color:t.type==='income'?A.teal:A.terra,flexShrink:0}}>{t.type==='income'?'+':'-'}{fmt(t.amount)}</div></div>)}/></div>);
  if(arqueo)return <ArqueoModal D={D} commit={commit} onClose={()=>setArqueo(false)}/>;
}

function AdminPersonal({D,commit,setModal,ask}){
  const cols=[A.gold,A.teal,A.terra,'#9B7FD4'];
  return(<div><AHead title="Equipo" action={<ABtn ch={<><Plus size={13}/>Nuevo</>} onClick={()=>setModal({entity:'staff',item:null})}/>}/><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:14}}>{(D.staff||[]).map((s,i)=>{const col=cols[i%cols.length],comp=(D.appointments||[]).filter(a=>a.staffId===s.id&&a.status==='completed'),earned=comp.reduce((sum,a)=>sum+a.price,0);return(<ABox key={s.id} sx={{opacity:s.active?1:0.6}} ch={<><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><div style={{width:46,height:46,borderRadius:'50%',background:`${col}20`,border:`2px solid ${col}44`,display:'flex',alignItems:'center',justifyContent:'center',color:col,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,flexShrink:0}}>{s.name[0]}</div><div><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:12,color:col,marginTop:1}}>{s.role}</div></div></div><div style={{fontSize:12,color:A.muted,display:'flex',flexDirection:'column',gap:3,marginBottom:12}}><div>✉ {s.email}</div><div>📞 {s.phone}</div><div>🕐 {s.schedule}</div><div style={{color:A.text}}>📅 {comp.length} completadas · {fmt(earned)}</div><div style={{color:A.gold}}>💰 Comisión ({s.commission||10}%): {fmt(earned*(s.commission||10)/100)}</div></div><div style={{display:'flex',gap:5}}><ABtn sz="sm" v="ghost" ch={<><Edit2 size={10}/>Editar</>} onClick={()=>setModal({entity:'staff',item:s})} sx={{flex:1}}/><ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>ask(()=>commit({...D,staff:(D.staff||[]).filter(x=>x.id!==s.id)}),'¿Eliminar esta empleada?')}/></div></>}/>);})}</div></div>);
}

function AdminPedidos({D,commit}){
  const orders=D.orders||[];
  const mark=(id,st)=>commit({...D,orders:orders.map(o=>o.id===id?{...o,status:st}:o)});
  const STS={pending:{label:'Pendiente',color:A.gold},processing:{label:'En proceso',color:A.teal},completed:{label:'Completado',color:'#555'},cancelled:{label:'Cancelado',color:A.terra}};
  return(<div><AHead title="Pedidos de la Web"/>{orders.length===0?<ABox ch={<div style={{textAlign:'center',padding:'50px 0',color:A.muted}}>Sin pedidos todavía. Aparecerán aquí cuando las clientas compren en la web.</div>}/>:<div style={{display:'flex',flexDirection:'column',gap:10}}>{[...orders].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).map(o=>{const st=STS[o.status]||STS.pending;return(<ABox key={o.id} ch={<><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}><div><div style={{fontWeight:600,fontSize:14}}>{o.clientName}</div><div style={{fontSize:12,color:A.muted}}>{o.email} · {o.phone} · {o.createdAt}</div></div><div style={{textAlign:'right'}}><div style={{color:A.gold,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700}}>{fmt(o.total)}</div><span style={{background:`${st.color}20`,color:st.color,borderRadius:20,padding:'2px 9px',fontSize:11,fontWeight:600}}>{st.label}</span></div></div><div style={{marginBottom:10}}>{(o.items||[]).map((it,i)=><div key={i} style={{fontSize:12,color:A.muted,padding:'3px 0',borderBottom:`1px solid ${A.bd}`}}>{it.name} x{it.qty} — {fmt(it.price*it.qty)}</div>)}</div><div style={{display:'flex',gap:6}}>{o.status==='pending'&&<ABtn sz="sm" ch={<><Check size={11}/>Procesar</>} onClick={()=>mark(o.id,'processing')}/>}{o.status==='processing'&&<ABtn sz="sm" v="success" ch={<><Check size={11}/>Completado</>} onClick={()=>mark(o.id,'completed')}/>}{o.status!=='cancelled'&&o.status!=='completed'&&<ABtn sz="sm" v="danger" ch={<><X size={11}/>Cancelar</>} onClick={()=>mark(o.id,'cancelled')}/>}</div></>}/>);})} </div>}</div>);
}

function AdminModal({modal,setModal,D,commit}){
  const {entity,item}=modal;const close=()=>setModal(null);
  const save=(key,arr)=>{commit({...D,[key]:arr});close();};
  const NAMES={services:'Servicio',products:'Producto',appointments:'Cita',clients:'Cliente',inventory:'Ítem',suppliers:'Proveedor',staff:'Empleado',transactions:'Movimiento',resources:'Recurso'};
  const Forms={services:SvcF,products:ProdF,appointments:ApptF,clients:ClientF,inventory:InvF,suppliers:SuppF,staff:StaffF,transactions:TxF,resources:ResourceF};
  const Form=Forms[entity];if(!Form)return null;
  return(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(3px)'}} onClick={e=>e.target===e.currentTarget&&close()}><div style={{background:A.sf,border:`1px solid ${A.bd}`,borderRadius:16,padding:26,width:460,maxHeight:'88vh',overflowY:'auto',position:'relative'}}><button onClick={close} style={{position:'absolute',top:14,right:14,background:'transparent',border:'none',color:A.muted,cursor:'pointer'}}><X size={17}/></button><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,marginBottom:20}}>{item?'Editar':'Nuevo'} {NAMES[entity]}</div><Form item={item} D={D} save={save}/></div></div>);
}
function SvcF({item,D,save}){const[f,setF]=useState(item||{name:'',duration:60,price:0,category:'Hammam',description:'',active:true});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const arr=item?(D.services||[]).map(x=>x.id===item.id?{...f,id:item.id,price:+f.price,duration:+f.duration}:x):[...(D.services||[]),{...f,id:nid(D.services||[]),price:+f.price,duration:+f.duration}];save('services',arr);};return(<div><AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Precio €" ch={<input style={inp} type="number" value={f.price} onChange={F('price')}/>}/><AFld label="Duración min" ch={<input style={inp} type="number" value={f.duration} onChange={F('duration')}/>}/></div><AFld label="Categoría" ch={<select style={inp} value={f.category} onChange={F('category')}>{['Hammam','Cabello','Masaje','Facial','Especial'].map(c=><option key={c}>{c}</option>)}</select>}/><AFld label="Descripción" ch={<textarea style={{...inp,resize:'none'}} value={f.description} onChange={F('description')} rows={2}/>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function ProdF({item,D,save}){const[f,setF]=useState(item||{name:'',price:0,stock:0,category:'Cabello',sku:'',description:'',active:true});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const arr=item?(D.products||[]).map(x=>x.id===item.id?{...f,id:item.id,price:+f.price,stock:+f.stock}:x):[...(D.products||[]),{...f,id:nid(D.products||[]),price:+f.price,stock:+f.stock}];save('products',arr);};return(<div><AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Precio €" ch={<input style={inp} type="number" value={f.price} onChange={F('price')}/>}/><AFld label="Stock" ch={<input style={inp} type="number" value={f.stock} onChange={F('stock')}/>}/></div><div style={{display:'flex',gap:10}}><AFld label="Categoría" ch={<select style={inp} value={f.category} onChange={F('category')}>{['Cabello','Hammam','Cuerpo','Facial'].map(c=><option key={c}>{c}</option>)}</select>}/><AFld label="SKU" ch={<input style={inp} value={f.sku} onChange={F('sku')}/>}/></div><AFld label="Descripción" ch={<textarea style={{...inp,resize:'none'}} value={f.description} onChange={F('description')} rows={2}/>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function ApptF({item,D,save}){
  const empty=()=>({clientId:'',clientName:'',serviceId:'',serviceName:'',staffId:'',staffName:'',date:tod(),time:'10:00',duration:60,price:0,status:'pending',notes:'',source:'admin'});
  const [rows,setRows]=useState(item?[{...item}]:[empty()]);
  const [saved,setSaved]=useState(false);

  const upd=(i,k,v)=>setRows(r=>r.map((x,j)=>j===i?{...x,[k]:v}:x));
  const selC=(i,e)=>{const c=(D.clients||[]).find(c=>c.id===+e.target.value);if(c)setRows(r=>r.map((x,j)=>j===i?{...x,clientId:c.id,clientName:c.name}:x));};
  const selS=(i,e)=>{const s=(D.services||[]).find(s=>s.id===+e.target.value);if(s)setRows(r=>r.map((x,j)=>j===i?{...x,serviceId:s.id,serviceName:s.name,price:s.price,duration:s.duration}:x));};
  const selSt=(i,e)=>{const s=(D.staff||[]).find(s=>s.id===+e.target.value);if(s)setRows(r=>r.map((x,j)=>j===i?{...x,staffId:s.id,staffName:s.name}:x));};
  const addRow=()=>setRows(r=>[...r,{...empty(),date:r[r.length-1]?.date||tod()}]);
  const delRow=i=>setRows(r=>r.filter((_,j)=>j!==i));

  const guardar=()=>{
    for(const r of rows){if(!r.clientId||!r.serviceId||!r.staffId)return alert('Cada cita necesita cliente, servicio y terapeuta.');}
    let base=nid(D.appointments||[]);
    const nuevas=rows.map((r,i)=>({...r,id:base+i,price:+r.price,duration:+r.duration}));
    let arr;
    if(item){
      // Actualizar la cita editada con la primera fila
      const updated=(D.appointments||[]).map(a=>a.id===item.id?{...nuevas[0],id:item.id}:a);
      // Añadir filas extra como citas nuevas
      const extras=nuevas.slice(1).map((r,i)=>({...r,id:nid(updated)+i}));
      arr=[...updated,...extras];
    } else {
      arr=[...(D.appointments||[]),...nuevas];
    }
    save('appointments',arr);
    setSaved(true);
  };

  const copiarFecha=(i)=>{
    const fecha=rows[i]?.date;
    if(!fecha)return;
    setRows(r=>r.map((x,j)=>j!==i?{...x,date:fecha}:x));
  };

  return(
    <div>
      {rows.map((f,i)=>(
        <div key={i} style={{background:i%2===0?ADM.sf2:'transparent',borderRadius:10,padding:12,marginBottom:12,border:`1px solid ${ADM.bd}`,position:'relative'}}>
          {/* Header de la cita */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:ADM.gold,letterSpacing:.5}}>CITA {i+1}</div>
            <div style={{display:'flex',gap:6}}>
              {i>0&&rows[0].date&&<button onClick={()=>copiarFecha(0)} title="Copiar fecha de la cita 1" style={{background:'none',border:`1px solid ${ADM.bd}`,borderRadius:7,padding:'3px 8px',cursor:'pointer',color:ADM.muted,fontSize:10,fontFamily:'inherit'}}>Copiar fecha</button>}
              {rows.length>1&&<button onClick={()=>delRow(i)} style={{background:'none',border:`1px solid ${ADM.terra}44`,borderRadius:7,padding:'3px 8px',cursor:'pointer',color:ADM.terra,fontSize:11,fontFamily:'inherit'}}>✕ Eliminar</button>}
            </div>
          </div>

          <AFld label="Cliente" ch={<select style={inp} onChange={e=>selC(i,e)} value={f.clientId}><option value="">Seleccionar cliente...</option>{(D.clients||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>}/>

          <div style={{display:'flex',gap:10}}>
            <AFld label="Servicio" ch={<select style={inp} onChange={e=>selS(i,e)} value={f.serviceId}><option value="">Seleccionar servicio...</option>{(D.services||[]).filter(x=>x.active).map(x=><option key={x.id} value={x.id}>{x.name} — {fmt(x.price)}</option>)}</select>}/>
          </div>

          <AFld label="Terapeuta" ch={<select style={inp} onChange={e=>selSt(i,e)} value={f.staffId}><option value="">Seleccionar terapeuta...</option>{(D.staff||[]).filter(x=>x.active).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}/>

          <div style={{display:'flex',gap:10}}>
            <AFld label="Fecha" ch={<input style={inp} type="date" value={f.date} onChange={e=>upd(i,'date',e.target.value)}/>}/>
            <AFld label="Hora" ch={<input style={inp} type="time" value={f.time} onChange={e=>upd(i,'time',e.target.value)}/>}/>
          </div>

          <div style={{display:'flex',gap:10}}>
            <AFld label="Precio €" ch={<input style={inp} type="number" value={f.price} onChange={e=>upd(i,'price',e.target.value)}/>}/>
            <AFld label="Estado" ch={<select style={inp} value={f.status} onChange={e=>upd(i,'status',e.target.value)}>{Object.entries(SL).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>}/>
          </div>

          <AFld label="Notas" ch={<textarea style={{...inp,resize:'none'}} value={f.notes} onChange={e=>upd(i,'notes',e.target.value)} rows={2} placeholder="Observaciones, peticiones especiales..."/>}/>
        </div>
      ))}

        <button onClick={addRow} style={{width:'100%',padding:'10px',border:`2px dashed ${ADM.gold}55`,borderRadius:10,background:`${ADM.gold}08`,color:ADM.gold,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          <Plus size={14}/> Añadir otra cita
        </button>

      <div style={{background:`${ADM.gold}10`,border:`1px solid ${ADM.gold}25`,borderRadius:10,padding:'10px 14px',marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:ADM.muted,marginBottom:3}}>
          <span>{rows.length} cita{rows.length!==1?'s':''} a guardar</span>
          <span style={{color:ADM.gold,fontWeight:700}}>{fmt(rows.reduce((s,r)=>s+(+r.price||0),0))} total</span>
        </div>
      </div>

      <ABtn ch={saved?<><Check size={13}/>¡Guardado!</>:<><Check size={13}/>{rows.length>1?`Guardar ${rows.length} citas`:'Guardar Cita'}</>} onClick={guardar} v={saved?'success':'primary'} sx={{width:'100%',justifyContent:'center'}}/>
    </div>
  );
}
function ClientF({item,D,save}){const[f,setF]=useState(item||{name:'',email:'',phone:'',visits:0,totalSpent:0,notes:'',lastVisit:'',createdAt:tod()});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const arr=item?(D.clients||[]).map(c=>c.id===item.id?{...f,id:item.id}:c):[...(D.clients||[]),{...f,id:nid(D.clients||[])}];save('clients',arr);};return(<div><AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Email" ch={<input style={inp} type="email" value={f.email} onChange={F('email')}/>}/><AFld label="Teléfono" ch={<input style={inp} value={f.phone} onChange={F('phone')}/>}/></div><AFld label="Notas/Alergias" ch={<textarea style={{...inp,resize:'none'}} value={f.notes} onChange={F('notes')} rows={2}/>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function InvF({item,D,save}){const[f,setF]=useState(item||{name:'',category:'Materia Prima',quantity:0,minQuantity:5,unit:'uds',cost:0,supplierId:null});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const e={...f,quantity:+f.quantity,minQuantity:+f.minQuantity,cost:+f.cost};const arr=item?(D.inventory||[]).map(i=>i.id===item.id?{...e,id:item.id}:i):[...(D.inventory||[]),{...e,id:nid(D.inventory||[])}];save('inventory',arr);};return(<div><AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Categoría" ch={<select style={inp} value={f.category} onChange={F('category')}>{['Materia Prima','Consumibles','Equipamiento','Otros'].map(c=><option key={c}>{c}</option>)}</select>}/><AFld label="Unidad" ch={<input style={inp} value={f.unit} onChange={F('unit')}/>}/></div><div style={{display:'flex',gap:10}}><AFld label="Cantidad" ch={<input style={inp} type="number" value={f.quantity} onChange={F('quantity')}/>}/><AFld label="Mínimo" ch={<input style={inp} type="number" value={f.minQuantity} onChange={F('minQuantity')}/>}/><AFld label="Coste/ud" ch={<input style={inp} type="number" value={f.cost} onChange={F('cost')}/>}/></div><AFld label="Proveedor" ch={<select style={inp} value={f.supplierId||''} onChange={e=>setF(p=>({...p,supplierId:+e.target.value||null}))}><option value="">Sin proveedor</option>{(D.suppliers||[]).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function SuppF({item,D,save}){const[f,setF]=useState(item||{name:'',contact:'',email:'',phone:'',products:'',paymentTerms:'30 días',notes:''});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const arr=item?(D.suppliers||[]).map(x=>x.id===item.id?{...f,id:item.id}:x):[...(D.suppliers||[]),{...f,id:nid(D.suppliers||[])}];save('suppliers',arr);};return(<div><AFld label="Empresa" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Contacto" ch={<input style={inp} value={f.contact} onChange={F('contact')}/>}/><AFld label="Teléfono" ch={<input style={inp} value={f.phone} onChange={F('phone')}/>}/></div><AFld label="Email" ch={<input style={inp} type="email" value={f.email} onChange={F('email')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Productos" ch={<input style={inp} value={f.products} onChange={F('products')}/>}/><AFld label="Pago" ch={<input style={inp} value={f.paymentTerms} onChange={F('paymentTerms')}/>}/></div><AFld label="Notas" ch={<textarea style={{...inp,resize:'none'}} value={f.notes} onChange={F('notes')} rows={2}/>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function StaffF({item,D,save}){const[f,setF]=useState(item||{name:'',role:'',email:'',phone:'',schedule:'L-V 9-18h',active:true,commission:10});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const s=()=>{if(!f.name)return;const arr=item?(D.staff||[]).map(x=>x.id===item.id?{...f,id:item.id,commission:+f.commission}:x):[...(D.staff||[]),{...f,id:nid(D.staff||[]),commission:+f.commission}];save('staff',arr);};return(<div><AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')}/>}/><AFld label="Rol" ch={<input style={inp} value={f.role} onChange={F('role')}/>}/><div style={{display:'flex',gap:10}}><AFld label="Email" ch={<input style={inp} type="email" value={f.email} onChange={F('email')}/>}/><AFld label="Teléfono" ch={<input style={inp} value={f.phone} onChange={F('phone')}/>}/></div><div style={{display:'flex',gap:10}}><AFld label="Horario" ch={<input style={inp} value={f.schedule} onChange={F('schedule')}/>}/><AFld label="Comisión %" ch={<input style={inp} type="number" value={f.commission} onChange={F('commission')} min="0" max="50"/>}/></div><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}
function TxF({item,D,save}){const[f,setF]=useState(item||{date:tod(),type:'income',category:'Servicios',description:'',amount:0,method:'tarjeta'});const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));const CATS={income:['Servicios','Productos','Otros ingresos'],expense:['Proveedores','Personal','Gastos fijos','Marketing','Otros']};const s=()=>{if(!f.description||!f.amount)return;const arr=item?(D.transactions||[]).map(t=>t.id===item.id?{...f,id:item.id,amount:+f.amount}:t):[...(D.transactions||[]),{...f,id:nid(D.transactions||[]),amount:+f.amount}];save('transactions',arr);};return(<div><div style={{display:'flex',gap:10}}><AFld label="Tipo" ch={<select style={inp} value={f.type} onChange={F('type')}><option value="income">Ingreso</option><option value="expense">Gasto</option></select>}/><AFld label="Fecha" ch={<input style={inp} type="date" value={f.date} onChange={F('date')}/>}/></div><div style={{display:'flex',gap:10}}><AFld label="Categoría" ch={<select style={inp} value={f.category} onChange={F('category')}>{(CATS[f.type]||[]).map(c=><option key={c}>{c}</option>)}</select>}/><AFld label="Método" ch={<select style={inp} value={f.method} onChange={F('method')}>{['tarjeta','efectivo','bizum','transferencia','domiciliación'].map(m=><option key={m}>{m}</option>)}</select>}/></div><AFld label="Descripción" ch={<input style={inp} value={f.description} onChange={F('description')}/>}/><AFld label="Importe €" ch={<input style={inp} type="number" value={f.amount} onChange={F('amount')}/>}/><ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/></div>);}

// ═══════════════════════════════════════════════════════════════════════════════
// PANTALLA LOGIN ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({onLogin, onCancel}) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);
  const try_ = () => { if(pass===ADMIN_PASS){onLogin();}else{setErr(true);setTimeout(()=>setErr(false),1500);} };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,backdropFilter:'blur(8px)'}}>
      <div style={{background:ADM.sf,border:`1px solid ${ADM.bd}`,borderRadius:20,padding:36,width:340,textAlign:'center'}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:`${ADM.gold}18`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}><Lock size={24} style={{color:ADM.gold}}/></div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:ADM.text,marginBottom:6}}>Panel de Gestión</div>
        <div style={{fontSize:13,color:ADM.muted,marginBottom:24}}>Introduce la contraseña para acceder</div>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&try_()} placeholder="Contraseña" autoFocus style={{width:'100%',padding:'12px 14px',background:ADM.sf2,border:`2px solid ${err?ADM.terra:pass?ADM.gold:ADM.bd}`,borderRadius:12,color:ADM.text,fontSize:15,fontFamily:"'Nunito',sans-serif",outline:'none',textAlign:'center',letterSpacing:3,marginBottom:10,transition:'border-color .2s'}}/>
        {err&&<div style={{fontSize:12,color:ADM.terra,marginBottom:10}}>Contraseña incorrecta</div>}
        <button onClick={try_} style={{width:'100%',background:ADM.gold,color:'#0A0A0A',border:'none',borderRadius:12,padding:'12px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginBottom:10}}>Entrar</button>
        <button onClick={onCancel} style={{background:'none',border:'none',color:ADM.muted,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>Cancelar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// RECURSOS — cabinas, sillas, zonas
// ═══════════════════════════════════════════════════════════════════════════════
function AdminRecursos({D,commit,setModal,ask}){
  const types=['cabina','silla','zona','otro'];
  const typeLabel={cabina:'🛏 Cabina',silla:'💺 Silla',zona:'🌿 Zona',otro:'📦 Otro'};
  const del=id=>ask(()=>commit({...D,resources:(D.resources||[]).filter(r=>r.id!==id)}),'¿Eliminar este recurso?');
  const toggle=id=>commit({...D,resources:(D.resources||[]).map(r=>r.id===id?{...r,active:!r.active}:r)});
  const grouped=types.reduce((acc,t)=>{acc[t]=(D.resources||[]).filter(r=>r.type===t);return acc;},{});
  return(
    <div>
      <AHead title="Recursos & Espacios" action={<ABtn ch={<><Plus size={13}/>Nuevo recurso</>} onClick={()=>setModal({entity:'resources',item:null})}/>}/>
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        {types.map(t=>{const rs=grouped[t];if(!rs.length)return null;return(
          <div key={t} style={{fontSize:12,background:A.sf2,padding:'6px 12px',borderRadius:20,color:A.muted}}>{typeLabel[t]}: <strong style={{color:A.text}}>{rs.filter(r=>r.active).length}/{rs.length} activos</strong></div>
        );})}
      </div>
      {types.map(t=>{
        const rs=grouped[t];if(!rs.length)return null;
        return(
          <div key={t} style={{marginBottom:24}}>
            <div style={{fontSize:10,color:A.gold,letterSpacing:2,marginBottom:12,textTransform:'uppercase'}}>{typeLabel[t]}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
              {rs.map(r=>(
                <ABox key={r.id} sx={{opacity:r.active?1:0.5,borderTop:`3px solid ${r.color||A.gold}`}} ch={<>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14,color:A.text}}>{r.name}</div>
                      <div style={{fontSize:11,color:A.muted,marginTop:3}}>{r.description}</div>
                    </div>
                    <div style={{display:'flex',gap:4}}>
                      <ABtn sz="sm" v="ghost" ch={<Edit2 size={10}/>} onClick={()=>setModal({entity:'resources',item:r})}/>
                      <ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>del(r.id)}/>
                    </div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                    <span style={{fontSize:11,background:r.active?`${A.teal}15`:`${A.terra}15`,color:r.active?A.teal:A.terra,padding:'3px 10px',borderRadius:20,fontWeight:600}}>{r.active?'Disponible':'Inactivo'}</span>
                    <ABtn sz="sm" v={r.active?'secondary':'ghost'} ch={r.active?'Desactivar':'Activar'} onClick={()=>toggle(r.id)}/>
                  </div>
                </>}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function ResourceF({item,D,save}){
  const[f,setF]=useState(item||{name:'',type:'cabina',description:'',active:true,color:'#2A7A6F'});
  const F=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const s=()=>{if(!f.name)return;const arr=item?(D.resources||[]).map(x=>x.id===item.id?{...f,id:item.id}:x):[...(D.resources||[]),{...f,id:nid(D.resources||[])}];save('resources',arr);};
  const COLORS=['#2A7A6F','#C9A96E','#C4622D','#9B7FD4','#5B9BD4','#E07B54','#6BAA75'];
  return(<div>
    <AFld label="Nombre" ch={<input style={inp} value={f.name} onChange={F('name')} placeholder="Ej. Cabina VIP"/>}/>
    <AFld label="Tipo" ch={<select style={inp} value={f.type} onChange={F('type')}>{[['cabina','Cabina'],['silla','Silla'],['zona','Zona'],['otro','Otro']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>}/>
    <AFld label="Descripción" ch={<input style={inp} value={f.description} onChange={F('description')} placeholder="Uso o características"/>}/>
    <AFld label="Color identificador" ch={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{COLORS.map(c=><button key={c} onClick={()=>setF(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${f.color===c?A.text:'transparent'}`,cursor:'pointer'}}/> )}</div>}/>
    <ABtn ch={<><Check size={13}/>Guardar</>} onClick={s} sx={{width:'100%',justifyContent:'center'}}/>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARQUEO / CIERRE DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════
function ArqueoModal({D,commit,onClose}){
  const t=tod();
  const txsHoy=(D.transactions||[]).filter(x=>x.date===t&&x.type==='income');
  const byMethod={tarjeta:0,efectivo:0,bizum:0,transferencia:0,otro:0};
  txsHoy.forEach(tx=>{const k=byMethod.hasOwnProperty(tx.method)?tx.method:'otro';byMethod[k]+=tx.amount;});
  const totalSistema=Object.values(byMethod).reduce((a,b)=>a+b,0);
  const [conteo,setConteo]=useState({tarjeta:byMethod.tarjeta.toFixed(2),efectivo:byMethod.efectivo.toFixed(2),bizum:byMethod.bizum.toFixed(2),transferencia:byMethod.transferencia.toFixed(2)});
  const [notas,setNotas]=useState('');
  const totalContado=Object.values(conteo).reduce((s,v)=>s+(parseFloat(v)||0),0);
  const diferencia=totalContado-totalSistema;

  const cerrar=()=>{
    const cierre={
      id:nid(D.cierres||[]),fecha:t,hora:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
      sistema:byMethod,contado:{tarjeta:+conteo.tarjeta||0,efectivo:+conteo.efectivo||0,bizum:+conteo.bizum||0,transferencia:+conteo.transferencia||0},
      totalSistema,totalContado,diferencia,notas,transacciones:txsHoy.length
    };
    commit({...D,cierres:[...(D.cierres||[]),cierre]});
    onClose();
  };

  const MROW=(label,ico,method)=>(
    <div style={{display:'grid',gridTemplateColumns:'1fr 120px 120px',gap:12,alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${A.bd}`}}>
      <div style={{fontSize:13,color:A.text,display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:16}}>{ico}</span>{label}</div>
      <div style={{textAlign:'right',fontSize:13,color:A.gold,fontWeight:700}}>{fmt(byMethod[method]||0)}</div>
      <div><input type="number" value={conteo[method]} onChange={e=>setConteo(p=>({...p,[method]:e.target.value}))} style={{...inp,textAlign:'right',padding:'6px 8px'}}/></div>
    </div>
  );

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,backdropFilter:'blur(4px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:A.sf,border:`1px solid ${A.bd}`,borderRadius:20,padding:28,width:540,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:A.text}}>Arqueo de Caja</div>
            <div style={{fontSize:12,color:A.muted,marginTop:3}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:A.muted,cursor:'pointer'}}><X size={18}/></button>
        </div>

        <div style={{background:A.sf2,borderRadius:10,padding:'10px 14px',marginBottom:18,display:'flex',gap:20,flexWrap:'wrap'}}>
          <div style={{fontSize:12,color:A.muted}}>Transacciones hoy: <strong style={{color:A.text}}>{txsHoy.length}</strong></div>
          <div style={{fontSize:12,color:A.muted}}>Total sistema: <strong style={{color:A.gold}}>{fmt(totalSistema)}</strong></div>
        </div>

        <div style={{marginBottom:6}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 120px 120px',gap:12,padding:'6px 0',marginBottom:4}}>
            <div style={{fontSize:10,color:A.muted,letterSpacing:1,textTransform:'uppercase'}}>Método</div>
            <div style={{fontSize:10,color:A.muted,letterSpacing:1,textTransform:'uppercase',textAlign:'right'}}>Sistema</div>
            <div style={{fontSize:10,color:A.muted,letterSpacing:1,textTransform:'uppercase',textAlign:'center'}}>Contado</div>
          </div>
          {MROW('Tarjeta bancaria','💳','tarjeta')}
          {MROW('Efectivo','💵','efectivo')}
          {MROW('Bizum','📱','bizum')}
          {MROW('Transferencia','🏦','transferencia')}
        </div>

        <div style={{background:diferencia===0?`${A.teal}15`:diferencia>0?`${A.gold}15`:`${A.terra}15`,border:`1px solid ${diferencia===0?A.teal:diferencia>0?A.gold:A.terra}40`,borderRadius:10,padding:'12px 16px',margin:'16px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,color:A.muted}}>Total sistema</span>
            <span style={{fontSize:13,color:A.text,fontWeight:600}}>{fmt(totalSistema)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,color:A.muted}}>Total contado</span>
            <span style={{fontSize:13,color:A.text,fontWeight:600}}>{fmt(totalContado)}</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:`1px solid ${A.bd}`}}>
            <span style={{fontSize:14,fontWeight:700,color:A.text}}>Diferencia</span>
            <span style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif",color:diferencia===0?A.teal:diferencia>0?A.gold:A.terra}}>
              {diferencia>0?'+':''}{fmt(diferencia)}
              {diferencia===0?' ✓':diferencia>0?' (sobrante)':' (falta)'}
            </span>
          </div>
        </div>

        <AFld label="Notas del cierre" ch={<textarea style={{...inp,resize:'none'}} value={notas} onChange={e=>setNotas(e.target.value)} rows={2} placeholder="Observaciones, incidencias..."/>}/>

        <div style={{display:'flex',gap:10}}>
          <ABtn ch="Cancelar" onClick={onClose} v="ghost" sx={{flex:1,justifyContent:'center'}}/>
          <ABtn ch={<><Check size={14}/>Cerrar Caja</>} onClick={cerrar} sx={{flex:2,justifyContent:'center'}}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN — Google Business, ajustes generales
// ═══════════════════════════════════════════════════════════════════════════════
function AdminConfig({D,commit}){
  const [form,setForm]=useState({googlePlaceId:(D.settings?.googlePlaceId)||'',googleApiKey:(D.settings?.googleApiKey)||''});
  const [saved,setSaved]=useState(false);
  const save=()=>{commit({...D,settings:{...D.settings,...form}});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(
    <div style={{maxWidth:600}}>
      <AHead title="Configuración"/>
      <ABox sx={{marginBottom:16}} ch={<>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,marginBottom:4}}>🌟 Reseñas de Google Business</div>
        <div style={{fontSize:12,color:A.muted,marginBottom:16,lineHeight:1.7}}>
          Conecta tu perfil de Google Business para mostrar reseñas reales en la web.<br/>
          Necesitas un <strong style={{color:A.text}}>Place ID</strong> y una <strong style={{color:A.text}}>API Key de Google Places</strong>.<br/>
          <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key" target="_blank" style={{color:A.gold}}>→ Cómo obtener una API Key de Google</a>
        </div>
        <AFld label="Google Place ID" ch={<input style={inp} value={form.googlePlaceId} onChange={e=>setForm(p=>({...p,googlePlaceId:e.target.value}))} placeholder="ChIJ... (de Google Maps)"/>}/>
        <div style={{fontSize:11,color:A.muted,marginBottom:10,marginTop:-8}}>Encuéntralo en Google Maps → tu negocio → Compartir → ID de lugar</div>
        <AFld label="Google Maps API Key" ch={<input style={inp} value={form.googleApiKey} onChange={e=>setForm(p=>({...p,googleApiKey:e.target.value}))} placeholder="AIza..."/>}/>
        <div style={{fontSize:11,color:A.muted,marginBottom:14,marginTop:-8}}>Activa "Places API" en Google Cloud Console. La API Key debe permitir el dominio de tu app.</div>
        <ABtn ch={saved?<><Check size={13}/>Guardado</>:<><Check size={13}/>Guardar configuración</>} onClick={save} v={saved?'success':'primary'} sx={{width:'100%',justifyContent:'center'}}/>
      </>}/>
      <ABox ch={<>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,marginBottom:14}}>📋 Historial de Cierres de Caja</div>
        {(D.cierres||[]).length===0
          ?<div style={{color:A.muted,fontSize:13,textAlign:'center',padding:'20px 0'}}>Aún no hay cierres registrados.</div>
          :[...(D.cierres||[])].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(c=>(
            <div key={c.id} style={{padding:'12px 0',borderBottom:`1px solid ${A.bd}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <div><div style={{fontSize:13,fontWeight:600}}>{c.fecha} · {c.hora}</div><div style={{fontSize:11,color:A.muted}}>{c.transacciones} transacciones · {c.notas&&`"${c.notas}"`}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:A.gold}}>{fmt(c.totalSistema)}</div><div style={{fontSize:11,color:c.diferencia===0?A.teal:c.diferencia>0?A.gold:A.terra}}>{c.diferencia===0?'✓ Cuadra':c.diferencia>0?`+${fmt(c.diferencia)} sobrante`:`${fmt(c.diferencia)} falta`}</div></div>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {[['💳',c.contado?.tarjeta],['💵',c.contado?.efectivo],['📱',c.contado?.bizum],['🏦',c.contado?.transferencia]].filter(([,v])=>v>0).map(([ico,v])=>(
                  <span key={ico} style={{fontSize:11,background:A.sf2,padding:'3px 8px',borderRadius:12,color:A.muted}}>{ico} {fmt(v)}</span>
                ))}
              </div>
            </div>
          ))
        }
      </>}/>
    </div>
  );
}

// BLOQUEOS Y VACACIONES
function AdminBloqueos({D,commit,ask}){
  const [form,setForm]=useState({staffId:'',type:'bloqueo',startDate:tod(),endDate:tod(),startTime:'09:00',endTime:'18:00',allDay:true,reason:''});
  const [saved,setSaved]=useState(false);
  const F=k=>e=>setForm(p=>({...p,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const typeColor={bloqueo:ADM.terra,vacaciones:ADM.teal,formacion:'#9B7FD4',baja:ADM.gold};
  const typeLabel={bloqueo:'🚫 Bloqueo',vacaciones:'🏖 Vacaciones',formacion:'📚 Formación',baja:'🏥 Baja'};
  const save=()=>{
    if(!form.staffId||!form.reason.trim())return alert('Selecciona empleada y añade un motivo.');
    const st=(D.staff||[]).find(s=>s.id===+form.staffId);
    const block={id:nid(D.blocks||[]),staffId:+form.staffId,staffName:st?.name||'',type:form.type,startDate:form.startDate,endDate:form.endDate,startTime:form.allDay?'00:00':form.startTime,endTime:form.allDay?'23:59':form.endTime,allDay:form.allDay,reason:form.reason};
    commit({...D,blocks:[...(D.blocks||[]),block]});
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    setForm(p=>({...p,reason:''}));
  };
  const del=id=>ask(()=>commit({...D,blocks:(D.blocks||[]).filter(b=>b.id!==id)}),'¿Eliminar este bloqueo?');
  const today=tod();
  const active=(D.blocks||[]).filter(b=>b.endDate>=today).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  const past=(D.blocks||[]).filter(b=>b.endDate<today).sort((a,b)=>b.startDate.localeCompare(a.startDate)).slice(0,5);
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.3fr',gap:20}}>
      <div>
        <AHead title="Nuevo bloqueo"/>
        <ABox ch={<>
          <AFld label="Empleada" ch={<select style={inp} value={form.staffId} onChange={F('staffId')}><option value="">Seleccionar...</option>{(D.staff||[]).filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}/>
          <AFld label="Tipo" ch={<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{Object.entries(typeLabel).map(([k,l])=><button key={k} onClick={()=>setForm(p=>({...p,type:k}))} style={{padding:'6px 12px',border:`2px solid ${form.type===k?typeColor[k]:ADM.bd}`,borderRadius:20,background:form.type===k?`${typeColor[k]}15`:'transparent',color:form.type===k?typeColor[k]:ADM.muted,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>)}</div>}/>
          <div style={{display:'flex',gap:10}}>
            <AFld label="Fecha inicio" ch={<input style={inp} type="date" value={form.startDate} onChange={F('startDate')}/>}/>
            <AFld label="Fecha fin" ch={<input style={inp} type="date" value={form.endDate} onChange={F('endDate')}/>}/>
          </div>
          <AFld label="" ch={<label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:ADM.text}}><input type="checkbox" checked={form.allDay} onChange={F('allDay')} style={{width:16,height:16,accentColor:ADM.gold}}/>Día(s) completo(s)</label>}/>
          {!form.allDay&&<div style={{display:'flex',gap:10}}><AFld label="Hora inicio" ch={<input style={inp} type="time" value={form.startTime} onChange={F('startTime')}/>}/><AFld label="Hora fin" ch={<input style={inp} type="time" value={form.endTime} onChange={F('endTime')}/>}/></div>}
          <AFld label="Motivo / notas" ch={<textarea style={{...inp,resize:'none'}} value={form.reason} onChange={F('reason')} rows={2} placeholder="Ej. Vacaciones de verano, formación..."/>}/>
          <ABtn ch={saved?<><Check size={13}/>Guardado</>:<><Plus size={13}/>Crear bloqueo</>} onClick={save} v={saved?'success':'primary'} sx={{width:'100%',justifyContent:'center'}}/>
          <div style={{marginTop:10,padding:10,background:`${ADM.gold}10`,borderRadius:8,fontSize:11,color:ADM.muted,lineHeight:1.6}}>
            💡 Los huecos bloqueados desaparecen automáticamente en la agenda y en la reserva online.
          </div>
        </>}/>
      </div>
      <div>
        <AHead title={`Bloqueos activos (${active.length})`}/>
        {active.length===0&&<ABox ch={<div style={{textAlign:'center',padding:'30px 0',color:ADM.muted,fontSize:13}}>Sin bloqueos activos</div>}/>}
        {active.map(b=>(
          <ABox key={b.id} sx={{marginBottom:10,borderLeft:`3px solid ${typeColor[b.type]||ADM.gold}`}} ch={<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{b.staffName}</div>
                <div style={{fontSize:11,color:typeColor[b.type]||ADM.gold,marginTop:2,fontWeight:600}}>{typeLabel[b.type]}</div>
                <div style={{fontSize:12,color:ADM.muted,marginTop:4}}>
                  {b.startDate===b.endDate?b.startDate:`${b.startDate} → ${b.endDate}`}
                  {!b.allDay&&<span> · {b.startTime}–{b.endTime}</span>}
                  {b.allDay&&<span style={{color:ADM.terra,marginLeft:6}}>· Día completo</span>}
                </div>
                {b.reason&&<div style={{fontSize:12,color:ADM.text,marginTop:4,fontStyle:'italic'}}>"{b.reason}"</div>}
              </div>
              <ABtn sz="sm" v="danger" ch={<Trash2 size={11}/>} onClick={()=>del(b.id)}/>
            </div>
          </>}/>
        ))}
        {past.length>0&&<>
          <div style={{fontSize:10,color:ADM.muted,letterSpacing:2,textTransform:'uppercase',margin:'16px 0 8px'}}>Historial reciente</div>
          {past.map(b=>(
            <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${ADM.bd}`,opacity:.55}}>
              <div><span style={{fontSize:12,color:ADM.text}}>{b.staffName}</span><span style={{fontSize:11,color:ADM.muted,marginLeft:8}}>{typeLabel[b.type]} · {b.startDate===b.endDate?b.startDate:`${b.startDate}→${b.endDate}`}</span></div>
              <ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>del(b.id)}/>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}

// DOCUMENTOS EN FICHA DE CLIENTE
function ClientDocs({client,D,commit}){
  const [newDoc,setNewDoc]=useState({type:'diagnostico',title:'',content:''});
  const [adding,setAdding]=useState(false);
  const [preview,setPreview]=useState(null);
  const docs=client.documents||[];
  const TYPE={diagnostico:{label:'🩺 Diagnóstico',color:'#2A7A6F'},nota:{label:'📝 Nota',color:ADM.gold},consentimiento:{label:'📋 Consentimiento',color:'#9B7FD4'},foto:{label:'📸 Imagen',color:ADM.terra},otro:{label:'📎 Otro',color:ADM.muted}};
  const fileInput=()=>{
    const fi=document.createElement('input');fi.type='file';fi.accept='image/*,.pdf,.txt';
    fi.onchange=e=>{
      const f=e.target.files[0];if(!f)return;
      const reader=new FileReader();
      reader.onload=ev=>{setNewDoc(p=>({...p,title:f.name,content:ev.target.result,isFile:true,fileType:f.type}));setAdding(true);};
      reader.readAsDataURL(f);
    };
    fi.click();
  };
  const saveDoc=()=>{
    if(!newDoc.title.trim())return alert('Añade un título.');
    const doc={id:Date.now(),date:tod(),...newDoc};
    const updClients=(D.clients||[]).map(c=>c.id===client.id?{...c,documents:[...(c.documents||[]),doc]}:c);
    commit({...D,clients:updClients});
    setNewDoc({type:'diagnostico',title:'',content:''});setAdding(false);
  };
  const delDoc=docId=>{
    const updClients=(D.clients||[]).map(c=>c.id===client.id?{...c,documents:(c.documents||[]).filter(d=>d.id!==docId)}:c);
    commit({...D,clients:updClients});
  };
  return(
    <div style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontSize:11,color:ADM.muted,fontWeight:600,letterSpacing:.5,textTransform:'uppercase'}}>Documentos ({docs.length})</div>
        <div style={{display:'flex',gap:6}}>
          <ABtn sz="sm" v="ghost" ch={<><Paperclip size={11}/>Archivo</>} onClick={fileInput}/>
          <ABtn sz="sm" v="secondary" ch={<><Plus size={11}/>Nota</>} onClick={()=>setAdding(true)}/>
        </div>
      </div>
      {adding&&(
        <div style={{background:ADM.sf2,borderRadius:10,padding:14,marginBottom:10}}>
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {Object.entries(TYPE).map(([k,{label,color}])=><button key={k} onClick={()=>setNewDoc(p=>({...p,type:k}))} style={{padding:'4px 10px',border:`2px solid ${newDoc.type===k?color:ADM.bd}`,borderRadius:16,background:newDoc.type===k?`${color}15`:'transparent',color:newDoc.type===k?color:ADM.muted,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{label}</button>)}
          </div>
          <input style={{...inp,marginBottom:8}} value={newDoc.title} onChange={e=>setNewDoc(p=>({...p,title:e.target.value}))} placeholder="Título del documento..."/>
          {!newDoc.isFile&&<textarea style={{...inp,resize:'none',marginBottom:8}} value={newDoc.content} onChange={e=>setNewDoc(p=>({...p,content:e.target.value}))} rows={3} placeholder="Contenido, observaciones, diagnóstico..."/>}
          {newDoc.isFile&&<div style={{fontSize:12,color:ADM.gold,marginBottom:8}}>Archivo cargado: {newDoc.title}</div>}
          <div style={{display:'flex',gap:6}}>
            <ABtn sz="sm" v="ghost" ch="Cancelar" onClick={()=>{setAdding(false);setNewDoc({type:'diagnostico',title:'',content:''});}}/>
            <ABtn sz="sm" ch={<><Check size={11}/>Guardar</>} onClick={saveDoc}/>
          </div>
        </div>
      )}
      {docs.length===0&&!adding&&<div style={{fontSize:12,color:ADM.muted,textAlign:'center',padding:'10px 0'}}>Sin documentos adjuntos</div>}
      {docs.map(doc=>{
        const t=TYPE[doc.type]||TYPE.otro;
        const isImg=doc.isFile&&doc.fileType?.startsWith('image/');
        return(
          <div key={doc.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'8px 0',borderBottom:`1px solid ${ADM.bd}`}}>
            <div style={{width:32,height:32,borderRadius:8,background:`${t.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,cursor:isImg||!doc.isFile?'pointer':'default'}} onClick={()=>(isImg||!doc.isFile)&&setPreview(doc)}>{isImg?'🖼':t.label.split(' ')[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:ADM.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.title}</div>
              <div style={{fontSize:10,color:ADM.muted,marginTop:2}}>{t.label} · {doc.date}</div>
              {!doc.isFile&&doc.content&&<div style={{fontSize:11,color:ADM.muted,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.content}</div>}
            </div>
            <div style={{display:'flex',gap:4}}>
              {(isImg||(!doc.isFile&&doc.content))&&<ABtn sz="sm" v="ghost" ch="Ver" onClick={()=>setPreview(doc)}/>}
              <ABtn sz="sm" v="danger" ch={<Trash2 size={10}/>} onClick={()=>delDoc(doc.id)}/>
            </div>
          </div>
        );
      })}
      {preview&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,backdropFilter:'blur(4px)'}} onClick={()=>setPreview(null)}>
          <div style={{background:ADM.sf,borderRadius:16,padding:24,maxWidth:600,width:'90%',maxHeight:'80vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><div><div style={{fontWeight:600,fontSize:15}}>{preview.title}</div><div style={{fontSize:11,color:ADM.muted,marginTop:2}}>{(TYPE[preview.type]||TYPE.otro).label} · {preview.date}</div></div><button onClick={()=>setPreview(null)} style={{background:'none',border:'none',color:ADM.muted,cursor:'pointer'}}><X size={16}/></button></div>
            {preview.isFile&&preview.fileType?.startsWith('image/')
              ?<img src={preview.content} alt={preview.title} style={{width:'100%',borderRadius:10,maxHeight:400,objectFit:'contain'}}/>
              :<div style={{background:ADM.sf2,borderRadius:10,padding:14,fontSize:13,color:ADM.text,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{preview.content}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// INFORMES AUTOMATICOS
// Componentes auxiliares de informes
function StatGrid({items}){
  return(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:12,marginBottom:20}}>
    {items.map(({label,value,color=ADM.gold})=>(
      <div key={label} style={{background:ADM.sf2,borderRadius:10,padding:'13px 15px',borderTop:`2px solid ${color}`}}>
        <div style={{fontSize:10,color:ADM.muted,marginBottom:5,letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color}}>{value}</div>
      </div>
    ))}
  </div>);
}
function Bar({label,value,max,color,sub}){
  const pct=max>0?(value/max)*100:0;
  return(<div style={{marginBottom:13}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
      <span style={{fontSize:13,color:ADM.text}}>{label}</span>
      <div><span style={{fontSize:13,fontWeight:700,color}}>{typeof value==='number'&&value>99?fmt(value):value}</span>{sub&&<span style={{fontSize:11,color:ADM.muted,marginLeft:5}}>{sub}</span>}</div>
    </div>
    <div style={{height:6,background:ADM.sf2,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,pct)}%`,background:color,borderRadius:3}}/></div>
  </div>);
}

function AdminInformes({D}){
  const [type,setType]=useState('financiero');
  const [period,setPeriod]=useState('month');
  const now=new Date(),yr=now.getFullYear(),mo=String(now.getMonth()+1).padStart(2,'0');
  const filterDate=d=>{if(period==='today')return d===tod();if(period==='month')return d.startsWith(`${yr}-${mo}`);if(period==='year')return d.startsWith(`${yr}`);return true;};
  const txs=(D.transactions||[]).filter(t=>filterDate(t.date));
  const appts=(D.appointments||[]).filter(a=>filterDate(a.date));
  const inc=txs.filter(t=>t.type==='income');
  const exp=txs.filter(t=>t.type==='expense');
  const totalInc=inc.reduce((s,t)=>s+t.amount,0);
  const totalExp=exp.reduce((s,t)=>s+t.amount,0);
  const TYPES=[['financiero','💰 Financiero'],['servicios','✨ Servicios'],['empleadas','👤 Empleadas'],['clientes','👥 Clientes'],['stock','📦 Stock']];
  const PERIODS=[['today','Hoy'],['month','Este mes'],['year','Este año'],['all','Todo']];
  const periodLabel={today:'Hoy',month:`${new Date().toLocaleDateString('es-ES',{month:'long',year:'numeric'})}`,year:`Año ${new Date().getFullYear()}`,all:'Histórico completo'}[period]||period;
  const typeLabel={financiero:'Financiero',servicios:'Servicios',empleadas:'Empleadas',clientes:'Clientes',stock:'Stock e Inventario'}[type]||type;

  // ── Exportar CSV ─────────────────────────────────────────────────────────────
  const exportCSV=()=>{
    let rows=[];
    const biz='ShinyCandle';
    if(type==='financiero'){
      const compA=appts.filter(a=>a.status==='completed');
      const ticket=compA.length?compA.reduce((s,a)=>s+a.price,0)/compA.length:0;
      rows=[
        ['RESUMEN'],[`Período: ${periodLabel}`],[`Ingresos: ${fmt(totalInc)}`],[`Gastos: ${fmt(totalExp)}`],[`Beneficio neto: ${fmt(totalInc-totalExp)}`],[`Ticket medio: ${compA.length?fmt(ticket):'—'}`],[],
        ['Fecha','Tipo','Categoría','Descripción','Método','Importe (€)'],...txs.map(t=>[t.date,t.type==='income'?'Ingreso':'Gasto',t.category,t.description,t.method,(t.type==='income'?1:-1)*t.amount])
      ];
    } else if(type==='servicios'){
      const svcMap={};
      appts.filter(a=>a.status!=='cancelled').forEach(a=>{const k=a.serviceName||'Sin nombre';svcMap[k]=svcMap[k]||{count:0,revenue:0};svcMap[k].count++;svcMap[k].revenue+=a.price||0;});
      const compA=appts.filter(a=>a.status==='completed');
      const ticket=compA.length?compA.reduce((s,a)=>s+a.price,0)/compA.length:0;
      rows=[
        ['RESUMEN'],[`Período: ${periodLabel}`],[`Citas completadas: ${compA.length}`],[`Ticket medio: ${compA.length?fmt(ticket):'—'}`],[],
        ['Servicio','Nº Citas','Ingresos (€)','Ticket medio (€)'],...Object.entries(svcMap).sort((a,b)=>b[1].revenue-a[1].revenue).map(([n,{count,revenue}])=>[n,count,revenue.toFixed(2),(count>0?revenue/count:0).toFixed(2)])
      ];
    } else if(type==='empleadas'){
      rows=[['Empleada','Rol','Citas período','Completadas','Facturado (€)','Comisión (€)'],...(D.staff||[]).map(s=>{const sa=appts.filter(a=>a.staffId===s.id&&a.status!=='cancelled');const comp=sa.filter(a=>a.status==='completed');const rev=comp.reduce((sum,a)=>sum+a.price,0);return[s.name,s.role,sa.length,comp.length,rev.toFixed(2),(rev*(s.commission||10)/100).toFixed(2)];})];
    } else if(type==='clientes'){
      rows=[['Nombre','Email','Teléfono','Visitas totales','Total gastado (€)','Última visita','Notas'],...[...(D.clients||[])].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0)).map(c=>[c.name,c.email||'',c.phone||'',c.visits||0,(c.totalSpent||0).toFixed(2),c.lastVisit||'',c.notes||''])];
    } else if(type==='stock'){
      rows=[['Artículo','Categoría','Cantidad','Unidad','Mínimo','Coste/ud (€)','Valor total (€)','Estado'],...(D.inventory||[]).map(i=>[i.name,i.category,i.quantity,i.unit,i.minQuantity,i.cost.toFixed(2),(i.quantity*i.cost).toFixed(2),i.quantity<=i.minQuantity?'BAJO':'OK'])];
    }
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob=new Blob([''+csv],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=`ShinyCandle_${typeLabel}_${periodLabel}_${tod()}.csv`;
    a.click();URL.revokeObjectURL(a.href);
  };

  // ── Exportar PDF (ventana de impresión) ────────────────────────────────────
  const exportPDF=()=>{
    const rows=[];
    const header=`<style>body{font-family:Arial,sans-serif;padding:20px;color:#000}h1{color:#B8924A}h2{color:#555;font-size:14px}table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#B8924A;color:#fff;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #eee}.kpis{display:flex;gap:16px;flex-wrap:wrap;margin:14px 0}.kpi{background:#f9f5ef;border-radius:8px;padding:12px 16px;min-width:140px}.kpi-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px}.kpi-val{font-size:22px;font-weight:bold;color:#B8924A}</style>`;
    const biz='<h1>✦ ShinyCandle</h1><p style="color:#888;font-size:12px">Moroccan Hair Spa & Hammam · Barcelona</p>';
    const info=`<p style="font-size:12px;color:#888">Informe: <b>${typeLabel}</b> · Período: <b>${periodLabel}</b> · Generado: ${new Date().toLocaleDateString('es-ES')}</p><hr/>`;
    let body='';
    const compA=appts.filter(a=>a.status==='completed');
    const ticket=compA.length?compA.reduce((s,a)=>s+a.price,0)/compA.length:0;
    if(type==='financiero'){
      const byM={};inc.forEach(t=>{byM[t.method]=(byM[t.method]||0)+t.amount;});
      const byC={};exp.forEach(t=>{byC[t.category]=(byC[t.category]||0)+t.amount;});
      body=`<div class="kpis"><div class="kpi"><div class="kpi-label">Ingresos</div><div class="kpi-val">${fmt(totalInc)}</div></div><div class="kpi"><div class="kpi-label">Gastos</div><div class="kpi-val" style="color:#C4622D">${fmt(totalExp)}</div></div><div class="kpi"><div class="kpi-label">Beneficio neto</div><div class="kpi-val" style="color:${totalInc>=totalExp?'#2A7A6F':'#C4622D'}">${fmt(totalInc-totalExp)}</div></div><div class="kpi"><div class="kpi-label">Ticket medio</div><div class="kpi-val">${compA.length?fmt(ticket):'—'}</div></div></div>
      <h2>Ingresos por método</h2><table><tr><th>Método</th><th>Importe</th></tr>${Object.entries(byM).sort((a,b)=>b[1]-a[1]).map(([m,v])=>`<tr><td>${m}</td><td>${fmt(v)}</td></tr>`).join('')}</table>
      <h2>Gastos por categoría</h2><table><tr><th>Categoría</th><th>Importe</th></tr>${Object.entries(byC).sort((a,b)=>b[1]-a[1]).map(([cat,v])=>`<tr><td>${cat}</td><td>${fmt(v)}</td></tr>`).join('')}</table>
      <h2>Detalle de transacciones</h2><table><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Método</th><th>Importe</th></tr>${txs.slice(0,100).map(t=>`<tr><td>${t.date}</td><td>${t.type==='income'?'Ingreso':'Gasto'}</td><td>${t.category}</td><td>${t.description}</td><td>${t.method}</td><td style="color:${t.type==='income'?'#2A7A6F':'#C4622D'}">${t.type==='income'?'+':'-'}${fmt(t.amount)}</td></tr>`).join('')}</table>`;
    } else if(type==='servicios'){
      const sm={};appts.filter(a=>a.status!=='cancelled').forEach(a=>{const k=a.serviceName||'—';sm[k]=sm[k]||{count:0,rev:0};sm[k].count++;sm[k].rev+=a.price||0;});
      body=`<div class="kpis"><div class="kpi"><div class="kpi-label">Completadas</div><div class="kpi-val">${compA.length}</div></div><div class="kpi"><div class="kpi-label">Ticket medio</div><div class="kpi-val">${compA.length?fmt(ticket):'—'}</div></div><div class="kpi"><div class="kpi-label">Facturado</div><div class="kpi-val">${fmt(compA.reduce((s,a)=>s+a.price,0))}</div></div></div>
      <table><tr><th>Servicio</th><th>Citas</th><th>Ingresos</th><th>Ticket medio</th></tr>${Object.entries(sm).sort((a,b)=>b[1].rev-a[1].rev).map(([n,{count,rev}])=>`<tr><td>${n}</td><td>${count}</td><td>${fmt(rev)}</td><td>${fmt(rev/count)}</td></tr>`).join('')}</table>`;
    } else if(type==='empleadas'){
      body=`<table><tr><th>Empleada</th><th>Rol</th><th>Citas</th><th>Completadas</th><th>Facturado</th><th>Comisión</th></tr>${(D.staff||[]).map(s=>{const sa=appts.filter(a=>a.staffId===s.id&&a.status!=='cancelled');const comp=sa.filter(a=>a.status==='completed');const rev=comp.reduce((sum,a)=>sum+a.price,0);return`<tr><td>${s.name}</td><td>${s.role}</td><td>${sa.length}</td><td>${comp.length}</td><td>${fmt(rev)}</td><td>${fmt(rev*(s.commission||10)/100)}</td></tr>`;}).join('')}</table>`;
    } else if(type==='clientes'){
      body=`<div class="kpis"><div class="kpi"><div class="kpi-label">Total clientas</div><div class="kpi-val">${(D.clients||[]).length}</div></div><div class="kpi"><div class="kpi-label">Gasto medio</div><div class="kpi-val">${fmt((D.clients||[]).reduce((s,c)=>s+(c.totalSpent||0),0)/Math.max((D.clients||[]).length,1))}</div></div></div>
      <table><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Visitas</th><th>Total gastado</th><th>Última visita</th></tr>${[...(D.clients||[])].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0)).map(c=>`<tr><td>${c.name}</td><td>${c.email||''}</td><td>${c.phone||''}</td><td>${c.visits||0}</td><td>${fmt(c.totalSpent||0)}</td><td>${c.lastVisit||'—'}</td></tr>`).join('')}</table>`;
    } else if(type==='stock'){
      body=`<div class="kpis"><div class="kpi"><div class="kpi-label">Ítems</div><div class="kpi-val">${(D.inventory||[]).length}</div></div><div class="kpi"><div class="kpi-label">Stock bajo</div><div class="kpi-val" style="color:#C4622D">${(D.inventory||[]).filter(i=>i.quantity<=i.minQuantity).length}</div></div><div class="kpi"><div class="kpi-label">Valor total</div><div class="kpi-val">${fmt((D.inventory||[]).reduce((s,i)=>s+(i.quantity*i.cost),0))}</div></div></div>
      <table><tr><th>Artículo</th><th>Categoría</th><th>Cantidad</th><th>Mínimo</th><th>Valor</th><th>Estado</th></tr>${(D.inventory||[]).map(i=>`<tr><td>${i.name}</td><td>${i.category}</td><td>${i.quantity} ${i.unit}</td><td>${i.minQuantity}</td><td>${fmt(i.quantity*i.cost)}</td><td style="color:${i.quantity<=i.minQuantity?'#C4622D':'#2A7A6F'}">${i.quantity<=i.minQuantity?'⚠ BAJO':'✓ OK'}</td></tr>`).join('')}</table>`;
    }
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>ShinyCandle - ${typeLabel}</title>${header}</head><body>${biz}${info}${body}<p style="font-size:10px;color:#ccc;margin-top:30px;text-align:center">© ShinyCandle · Generado el ${new Date().toLocaleDateString('es-ES')}</p><script>window.onload=()=>window.print()</script></body></html>`;
    const w=window.open('','_blank','width=900,height=700');
    w.document.write(html);w.document.close();
  };

  return(
    <div>
      <AHead title="Informes Automáticos" action={
        <div style={{display:'flex',gap:8}}>
          <ABtn ch={<><FileText size={13}/>PDF / Imprimir</>} onClick={exportPDF} v="secondary"/>
          <ABtn ch={<><Archive size={13}/>Exportar CSV</>} onClick={exportCSV} v="ghost"/>
        </div>
      }/>
      <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:4,background:ADM.sf2,borderRadius:10,padding:4,flexWrap:'wrap'}}>
          {TYPES.map(([k,l])=><button key={k} onClick={()=>setType(k)} style={{padding:'7px 12px',border:'none',borderRadius:8,background:type===k?ADM.gold:'transparent',color:type===k?'#0A0A0A':ADM.muted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{l}</button>)}
        </div>
        <div style={{display:'flex',gap:4,background:ADM.sf2,borderRadius:10,padding:4}}>
          {PERIODS.map(([k,l])=><button key={k} onClick={()=>setPeriod(k)} style={{padding:'7px 12px',border:'none',borderRadius:8,background:period===k?ADM.sf:'transparent',color:period===k?ADM.text:ADM.muted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>)}
        </div>
      </div>

      {type==='financiero'&&(()=>{
        const byMethod={};inc.forEach(t=>{byMethod[t.method]=(byMethod[t.method]||0)+t.amount;});
        const byExpCat={};exp.forEach(t=>{byExpCat[t.category]=(byExpCat[t.category]||0)+t.amount;});
        return(<div>
          {(()=>{const compA=appts.filter(a=>a.status==='completed');const ticket=compA.length?compA.reduce((s,a)=>s+a.price,0)/compA.length:0;return(<StatGrid items={[{label:'Ingresos',value:fmt(totalInc),color:ADM.teal},{label:'Gastos',value:fmt(totalExp),color:ADM.terra},{label:'Beneficio neto',value:fmt(totalInc-totalExp),color:totalInc>=totalExp?ADM.gold:ADM.terra},{label:'Ticket medio',value:compA.length?fmt(ticket):'—',color:ADM.gold},{label:'Transacciones',value:inc.length+exp.length,color:ADM.muted}]}/>);})()}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:16}}>Ingresos por método</div>{Object.entries(byMethod).sort((a,b)=>b[1]-a[1]).map(([m,v])=><Bar key={m} label={m} value={v} max={totalInc} color={ADM.teal} sub={`${((v/totalInc)*100).toFixed(0)}%`}/>)}{Object.keys(byMethod).length===0&&<div style={{color:ADM.muted,fontSize:13}}>Sin ingresos en este período</div>}</>}/>
            <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:16}}>Gastos por categoría</div>{Object.entries(byExpCat).sort((a,b)=>b[1]-a[1]).map(([cat,v])=><Bar key={cat} label={cat} value={v} max={totalExp} color={ADM.terra} sub={`${((v/totalExp)*100).toFixed(0)}%`}/>)}{Object.keys(byExpCat).length===0&&<div style={{color:ADM.muted,fontSize:13}}>Sin gastos en este período</div>}</>}/>
          </div>
        </div>);
      })()}

      {type==='servicios'&&(()=>{
        const svcMap={};
        appts.filter(a=>a.status!=='cancelled').forEach(a=>{const k=a.serviceName||'Sin nombre';svcMap[k]=svcMap[k]||{count:0,revenue:0};svcMap[k].count++;svcMap[k].revenue+=a.price||0;});
        const sorted=Object.entries(svcMap).sort((a,b)=>b[1].revenue-a[1].revenue);
        const maxRev=sorted[0]?.[1]?.revenue||1;
        const totalA=appts.filter(a=>a.status!=='cancelled').length;
        const comp=appts.filter(a=>a.status==='completed').length;
        const canc=appts.filter(a=>a.status==='cancelled').length;
        return(<div>
          {(()=>{const compA=appts.filter(a=>a.status==='completed');const ticket=compA.length?compA.reduce((s,a)=>s+a.price,0)/compA.length:0;return(<StatGrid items={[{label:'Citas',value:totalA,color:ADM.teal},{label:'Completadas',value:comp,color:ADM.gold},{label:'Canceladas',value:canc,color:ADM.terra},{label:'Ticket medio',value:compA.length?fmt(ticket):'—',color:ADM.gold},{label:'Facturado',value:fmt(compA.reduce((s,a)=>s+a.price,0)),color:ADM.teal}]}/>);})()}
          <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:16}}>Servicios más solicitados</div>{sorted.length===0&&<div style={{color:ADM.muted,fontSize:13}}>Sin citas en este período</div>}{sorted.map(([name,{count,revenue}])=>(
            <div key={name} style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:13,color:ADM.text}}>{name}</span><div><span style={{fontSize:13,fontWeight:700,color:ADM.gold}}>{fmt(revenue)}</span><span style={{fontSize:11,color:ADM.muted,marginLeft:8}}>{count} cita{count!==1?'s':''}</span></div></div><div style={{height:7,background:ADM.sf2,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${(revenue/maxRev)*100}%`,background:ADM.gold,borderRadius:4}}/></div></div>
          ))}</>}/>
        </div>);
      })()}

      {type==='empleadas'&&(()=>(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {(D.staff||[]).map((s,i)=>{
            const col=[ADM.gold,ADM.teal,ADM.terra,'#9B7FD4','#5B9BD4'][i%5];
            const sAppts=appts.filter(a=>a.staffId===s.id&&a.status!=='cancelled');
            const comp=sAppts.filter(a=>a.status==='completed');
            const rev=comp.reduce((sum,a)=>sum+a.price,0);
            const comm=rev*(s.commission||10)/100;
            const allComp=(D.appointments||[]).filter(a=>a.staffId===s.id&&a.status==='completed');
            const allRev=allComp.reduce((sum,a)=>sum+a.price,0);
            return(<ABox key={s.id} sx={{borderLeft:`3px solid ${col}`}} ch={<>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:`${col}20`,display:'flex',alignItems:'center',justifyContent:'center',color:col,fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>{s.name[0]}</div>
                <div><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:11,color:col}}>{s.role}</div></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                {[['Citas',sAppts.length,ADM.teal],['Completadas',comp.length,ADM.gold],['Facturado',fmt(rev),col],['Comisión',fmt(comm),ADM.terra]].map(([l,v,c])=>(
                  <div key={l} style={{background:ADM.sf2,borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:9,color:ADM.muted,marginBottom:4,letterSpacing:1,textTransform:'uppercase'}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div></div>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:11,color:ADM.muted}}>Histórico: {allComp.length} citas completadas · {fmt(allRev)} generado en total</div>
            </>}/>);
          })}
        </div>
      ))()}

      {type==='clientes'&&(()=>{
        const clients=D.clients||[];
        const sorted=[...clients].sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0));
        const newM=clients.filter(c=>c.createdAt?.startsWith(`${yr}-${mo}`)).length;
        const avg=clients.length?clients.reduce((s,c)=>s+(c.totalSpent||0),0)/clients.length:0;
        const maxSpent=sorted[0]?.totalSpent||1;
        return(<div>
          <StatGrid items={[{label:'Total clientes',value:clients.length,color:ADM.teal},{label:'Nuevas este mes',value:newM,color:ADM.gold},{label:'Gasto medio',value:fmt(avg),color:ADM.terra},{label:'VIP',value:clients.filter(c=>c.notes?.includes('VIP')).length,color:'#9B7FD4'}]}/>
          <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:16}}>Top clientas por gasto total</div>{sorted.slice(0,10).map((c,i)=>(
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:`1px solid ${ADM.bd}`}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:`${ADM.gold}20`,display:'flex',alignItems:'center',justifyContent:'center',color:ADM.gold,fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
              <div style={{width:30,height:30,borderRadius:'50%',background:`${ADM.gold}15`,display:'flex',alignItems:'center',justifyContent:'center',color:ADM.gold,fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,flexShrink:0}}>{c.name[0]}</div>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:ADM.muted}}>{c.visits} visitas · última: {c.lastVisit||'—'}</div></div>
              <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:14,fontWeight:700,color:ADM.gold}}>{fmt(c.totalSpent||0)}</div>{c.notes?.includes('VIP')&&<span style={{fontSize:10,color:ADM.gold,background:`${ADM.gold}15`,padding:'1px 6px',borderRadius:10}}>VIP</span>}</div>
              <div style={{width:60}}><div style={{height:5,background:ADM.sf2,borderRadius:3}}><div style={{height:'100%',width:`${((c.totalSpent||0)/maxSpent)*100}%`,background:ADM.gold,borderRadius:3}}/></div></div>
            </div>
          ))}</>}/>
        </div>);
      })()}

      {type==='stock'&&(()=>{
        const inv=D.inventory||[];
        const low=inv.filter(i=>i.quantity<=i.minQuantity);
        const ok=inv.filter(i=>i.quantity>i.minQuantity);
        const valorTotal=inv.reduce((s,i)=>s+(i.quantity*i.cost),0);
        return(<div>
          <StatGrid items={[{label:'Ítems en stock',value:inv.length,color:ADM.teal},{label:'Stock bajo urgente',value:low.length,color:ADM.terra},{label:'Valor total stock',value:fmt(valorTotal),color:ADM.gold},{label:'Proveedores',value:(D.suppliers||[]).length,color:'#9B7FD4'}]}/>
          {low.length>0&&<ABox sx={{border:`1px solid ${ADM.terra}33`,marginBottom:16,background:`${ADM.terra}06`}} ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:14,color:ADM.terra}}>Ítems a reponer urgente</div>{low.map(i=>{const sup=(D.suppliers||[]).find(s=>s.id===i.supplierId);return(<div key={i.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${ADM.bd}`}}><div><div style={{fontSize:13,fontWeight:600}}>{i.name}</div><div style={{fontSize:11,color:ADM.muted}}>{i.category}{sup?` · ${sup.name}`:''}</div></div><div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:700,color:ADM.terra}}>{i.quantity}/{i.minQuantity} {i.unit}</div><div style={{fontSize:11,color:ADM.muted}}>Valor: {fmt(i.quantity*i.cost)}</div></div></div>);})}</>}/>}
          <ABox ch={<><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:14}}>Inventario completo</div>{ok.map(i=>(
            <div key={i.id} style={{display:'flex',alignItems:'center',gap:12,padding:'7px 0',borderBottom:`1px solid ${ADM.bd}`}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13}}>{i.name}</div><div style={{fontSize:11,color:ADM.muted}}>{i.category}</div></div>
              <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:13,fontWeight:600,color:ADM.text}}>{i.quantity} {i.unit}</div><div style={{fontSize:11,color:ADM.muted}}>{fmt(i.quantity*i.cost)}</div></div>
              <div style={{width:70}}><div style={{height:5,background:ADM.sf2,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,(i.quantity/Math.max(i.minQuantity*3,1))*100)}%`,background:ADM.teal,borderRadius:3}}/></div></div>
            </div>
          ))}</>}/>
        </div>);
      })()}
    </div>
  );
}

// ============================================================
// FACTURA / TICKET — generación e impresión en tiempo real
// ============================================================
function FacturaModal({appt,cierreData,D,onClose}){
  // appt = cita ya cobrada, o cierreData = { items, method, total, tip, clientName, date }
  const data = cierreData || {
    items:[{desc: appt.serviceName, qty:1, price: appt.price}],
    method: appt.lastMethod||'—', total: appt.price,
    tip:0, clientName: appt.clientName, date: appt.date,
    staffName: appt.staffName
  };
  const num = `SC-${Date.now().toString().slice(-6)}`;
  const biz = {
    name:'ShinyCandle', subtitle:'Moroccan Hair Spa & Hammam',
    address:'C/ Exemple 123, Barcelona', nif:'B-12345678',
    email:'info@shinycandle.es', tel:'+34 93 123 45 67',
  };
  const [type,setType]=useState('ticket'); // 'ticket' | 'factura'

  const print=()=>{
    const w=window.open('','_blank','width=420,height=700');
    const content=document.getElementById('sc-printable').innerHTML;
    w.document.write(`<html><head><title>ShinyCandle</title><style>
      *{box-sizing:border-box;margin:0;padding:0;font-family:'Courier New',monospace}
      body{background:#fff;color:#000;padding:20px;max-width:380px;margin:0 auto}
      .title{font-size:18px;font-weight:bold;text-align:center}
      .sub{font-size:11px;text-align:center;color:#555;margin-bottom:4px}
      .sep{border-top:1px dashed #000;margin:10px 0}
      .row{display:flex;justify-content:space-between;font-size:12px;margin:3px 0}
      .total-row{display:flex;justify-content:space-between;font-size:15px;font-weight:bold;margin-top:8px;border-top:1px solid #000;padding-top:6px}
      .footer{font-size:10px;text-align:center;color:#777;margin-top:14px}
      .label{font-size:10px;color:#777}
      h3{font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px}
    </style></head><body>${content}<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const G=ADM.gold;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,backdropFilter:'blur(4px)',padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:ADM.sf,border:`1px solid ${ADM.bd}`,borderRadius:20,padding:26,width:480,maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20}}>Generar documento</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:ADM.muted,cursor:'pointer'}}><X size={18}/></button>
        </div>

        {/* Selector tipo */}
        <div style={{display:'flex',gap:8,marginBottom:18}}>
          {[['ticket','🧾 Ticket'],['factura','📄 Factura']].map(([k,l])=>(
            <button key={k} onClick={()=>setType(k)} style={{flex:1,padding:'10px',border:`2px solid ${type===k?G:ADM.bd}`,borderRadius:12,background:type===k?`${G}15`:'transparent',color:type===k?G:ADM.muted,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>
          ))}
        </div>

        {/* Preview */}
        <div id="sc-printable" style={{background:'#fff',color:'#000',borderRadius:12,padding:'20px 18px',fontFamily:"'Courier New',monospace",fontSize:12,border:`2px solid ${ADM.bd}`}}>
          {/* Cabecera */}
          <div style={{textAlign:'center',marginBottom:10}}>
            <div style={{fontSize:18,fontWeight:'bold'}}>{biz.name}</div>
            <div style={{fontSize:10,color:'#555',marginBottom:2}}>{biz.subtitle}</div>
            <div style={{fontSize:10,color:'#555'}}>{biz.address}</div>
            {type==='factura'&&<div style={{fontSize:10,color:'#555'}}>NIF: {biz.nif}</div>}
            <div style={{fontSize:10,color:'#555'}}>{biz.tel} · {biz.email}</div>
          </div>
          <div style={{borderTop:'1px dashed #000',margin:'8px 0'}}/>

          {/* Datos doc */}
          <div style={{marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
              <span style={{color:'#777'}}>{type==='factura'?'Nº Factura':'Nº Ticket'}</span>
              <span style={{fontWeight:'bold'}}>{num}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
              <span style={{color:'#777'}}>Fecha</span>
              <span>{data.date||tod()}</span>
            </div>
            {type==='factura'&&<div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
              <span style={{color:'#777'}}>Cliente</span>
              <span>{data.clientName}</span>
            </div>}
            {data.staffName&&<div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
              <span style={{color:'#777'}}>Atendido por</span>
              <span>{data.staffName}</span>
            </div>}
          </div>
          <div style={{borderTop:'1px dashed #000',margin:'8px 0'}}/>

          {/* Líneas */}
          <div style={{marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#777',marginBottom:4}}>
              <span>Concepto</span><span>Importe</span>
            </div>
            {(data.items||[]).map((item,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,margin:'3px 0'}}>
                <span>{item.qty>1?`${item.desc} x${item.qty}`:item.desc}</span>
                <span>{fmt(item.price*(item.qty||1))}</span>
              </div>
            ))}
            {data.tip>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,margin:'3px 0'}}>
              <span>Propina</span><span>{fmt(data.tip)}</span>
            </div>}
          </div>
          <div style={{borderTop:'1px solid #000',paddingTop:6}}>
            {type==='factura'&&<>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#777',margin:'2px 0'}}>
                <span>Base imponible (21% IVA)</span>
                <span>{fmt((data.total||0)/1.21)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#777',margin:'2px 0'}}>
                <span>IVA (21%)</span>
                <span>{fmt((data.total||0)-(data.total||0)/1.21)}</span>
              </div>
            </>}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:'bold',marginTop:4}}>
              <span>TOTAL</span><span>{fmt(data.total||0)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#777',marginTop:3}}>
              <span>Método de pago</span><span style={{textTransform:'capitalize'}}>{data.method||'—'}</span>
            </div>
          </div>
          <div style={{borderTop:'1px dashed #000',margin:'10px 0'}}/>
          <div style={{textAlign:'center',fontSize:10,color:'#777',lineHeight:1.6}}>
            ¡Gracias por tu visita! ✦<br/>
            Presenta este {type} para cualquier consulta.<br/>
            {biz.email}
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:16}}>
          <ABtn ch="Cancelar" onClick={onClose} v="ghost" sx={{flex:1,justifyContent:'center'}}/>
          <ABtn ch={<><FileText size={14}/>Imprimir / Guardar PDF</>} onClick={print} sx={{flex:2,justifyContent:'center'}}/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONTROL DE PRESENCIA / FICHAJE
// ============================================================
function AdminPresencia({D,commit,ask}){
  const now=new Date(),t=tod();
  const [selStaff,setSelStaff]=useState('');
  const [view,setView]=useState('hoy');
  const TC={entrada:ADM.teal,salida:ADM.terra,pausa:ADM.gold,vuelta:'#9B7FD4'};
  const TL={entrada:'✅ Entrada',salida:'🚪 Salida',pausa:'⏸ Pausa',vuelta:'▶ Vuelta'};
  const fichar=type=>{
    if(!selStaff)return alert('Selecciona una empleada.');
    const st=(D.staff||[]).find(s=>s.id===+selStaff);
    const hora=now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
    commit({...D,fichajes:[...(D.fichajes||[]),{id:Date.now(),staffId:+selStaff,staffName:st?.name||'',date:t,hora,type,ts:now.getTime()}]});
  };
  const calcH=fs=>{
    const sorted=[...fs].sort((a,b)=>a.ts-b.ts);
    let total=0,last=null;
    sorted.forEach(f=>{if(f.type==='entrada'||f.type==='vuelta')last=f.ts;else if((f.type==='salida'||f.type==='pausa')&&last){total+=f.ts-last;last=null;}});
    if(last)total+=now.getTime()-last;
    const h=Math.floor(total/3600000),m=Math.floor((total%3600000)/60000);
    return total>0?`${h}h ${m}min`:'-';
  };
  const mo=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const fichajes=D.fichajes||[];
  const filtered=fichajes.filter(f=>view==='hoy'?f.date===t:view==='semana'?new Date(f.date)>=new Date(now-7*86400000):f.date.startsWith(mo));
  const grouped={};
  filtered.forEach(f=>{const k=`${f.staffId}_${f.date}`;if(!grouped[k])grouped[k]={staffId:f.staffId,staffName:f.staffName,date:f.date,fs:[]};grouped[k].fs.push(f);});
  const rows=Object.values(grouped).sort((a,b)=>b.date.localeCompare(a.date));
  const estadoHoy=sid=>{ const h=fichajes.filter(f=>f.date===t&&f.staffId===sid).sort((a,b)=>a.ts-b.ts);return h.length?h[h.length-1]:null;};
  const COLS=[ADM.gold,ADM.teal,ADM.terra,'#9B7FD4'];
  return(<div>
    <AHead title="Control de Presencia"/>
    <ABox sx={{marginBottom:18,background:`${ADM.gold}08`,border:`1px solid ${ADM.gold}25`}} ch={<>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,marginBottom:12}}>Fichar ahora · <span style={{fontSize:12,color:ADM.muted}}>{now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span></div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14}}>
        <select style={{...inp,flex:1,minWidth:180}} value={selStaff} onChange={e=>setSelStaff(e.target.value)}>
          <option value="">Seleccionar empleada...</option>
          {(D.staff||[]).filter(s=>s.active).map(s=>{const u=estadoHoy(s.id);return<option key={s.id} value={s.id}>{s.name}{u?` · ${TL[u.type]}`:'· Sin fichar'}</option>;})}
        </select>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {[['entrada','✅ Entrada','primary'],['pausa','⏸ Pausa','secondary'],['vuelta','▶ Vuelta','secondary'],['salida','🚪 Salida','danger']].map(([t,l,v])=><ABtn key={t} ch={l} v={v} sz="sm" onClick={()=>fichar(t)}/>)}
        </div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {(D.staff||[]).filter(s=>s.active).map(s=>{const u=estadoHoy(s.id);const col=u?TC[u.type]:ADM.muted;const activo=u&&(u.type==='entrada'||u.type==='vuelta');return(<div key={s.id} style={{display:'flex',alignItems:'center',gap:7,background:ADM.sf2,borderRadius:10,padding:'7px 12px',border:`1px solid ${col}33`}}><div style={{width:9,height:9,borderRadius:'50%',background:col,boxShadow:activo?`0 0 0 3px ${col}33`:undefined}}/><div><div style={{fontSize:12,fontWeight:600}}>{s.name}</div><div style={{fontSize:10,color:col}}>{u?`${TL[u.type]} · ${u.hora}`:'Sin fichar'}</div></div></div>);})}
      </div>
    </>}/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:15}}>Registros</div>
      <div style={{display:'flex',gap:5}}>{[['hoy','Hoy'],['semana','Semana'],['mes','Mes']].map(([k,l])=><ABtn key={k} ch={l} sz="sm" v={view===k?'primary':'ghost'} onClick={()=>setView(k)}/>)}</div>
    </div>
    {rows.length===0&&<ABox ch={<div style={{textAlign:'center',padding:'30px 0',color:ADM.muted}}>Sin registros en este período</div>}/>}
    {rows.map(row=><ABox key={`${row.staffId}_${row.date}`} sx={{marginBottom:10}} ch={<>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div><span style={{fontWeight:600,fontSize:14}}>{row.staffName}</span><span style={{fontSize:12,color:ADM.muted,marginLeft:10}}>{row.date}</span></div>
        <div style={{fontSize:13,fontWeight:700,color:ADM.teal}}>{calcH(row.fs.filter(f=>f.date===row.date&&f.staffId===row.staffId))}</div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {row.fs.sort((a,b)=>a.ts-b.ts).map(f=><div key={f.id} style={{display:'flex',alignItems:'center',gap:5,background:ADM.sf2,borderRadius:8,padding:'5px 10px',border:`1px solid ${TC[f.type]||ADM.bd}30`}}><div style={{width:7,height:7,borderRadius:'50%',background:TC[f.type]||ADM.muted}}/><span style={{fontSize:11,color:TC[f.type]||ADM.muted,fontWeight:600}}>{TL[f.type]}</span><span style={{fontSize:11,color:ADM.text}}>{f.hora}</span></div>)}
      </div>
    </>}/>)}
    {view!=='hoy'&&<ABox sx={{marginTop:14}} ch={<>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,marginBottom:12}}>Resumen de horas</div>
      {(D.staff||[]).filter(s=>s.active).map((s,i)=>{
        const sf=filtered.filter(f=>f.staffId===s.id);
        const dias=[...new Set(sf.map(f=>f.date))];
        const ms=dias.reduce((sum,d)=>{const df=sf.filter(f=>f.date===d).sort((a,b)=>a.ts-b.ts);let tt=0,last=null;df.forEach(f=>{if(f.type==='entrada'||f.type==='vuelta')last=f.ts;else if((f.type==='salida'||f.type==='pausa')&&last){tt+=f.ts-last;last=null;}});return sum+tt;},0);
        const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
        const col=COLS[i%4];
        return(<div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:`1px solid ${ADM.bd}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:`${col}20`,display:'flex',alignItems:'center',justifyContent:'center',color:col,fontWeight:700,fontSize:14}}>{s.name[0]}</div>
            <div><div style={{fontSize:13,fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:ADM.muted}}>{dias.length} día{dias.length!==1?'s':''}</div></div>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:col,fontFamily:"'Playfair Display',serif"}}>{ms>0?`${h}h ${m}min`:'-'}</div>
        </div>);
      })}
    </>}/>}
  </div>);
}


// ROOT — Panel de gestión ShinyCandle
function WebApp({D, commit, onAdminClick}) {
  const [nav,setNav] = useState('inicio');
  const [booking,setBooking] = useState(null); 
  const [cart,setCart] = useState([]);
  const [showCart,setShowCart] = useState(false);
  const [checkout,setCheckout] = useState(false);
  const [added,setAdded] = useState(null);
  const [catFilter,setCatFilter] = useState('Todos');

  const svcActive = (D.services||[]).filter(s=>s.active!==false);
  const prodActive = (D.products||[]).filter(p=>p.active!==false);
  const cats = ['Todos',...new Set(prodActive.map(p=>p.category))];
  const visProd = prodActive.filter(p=>catFilter==='Todos'||p.category===catFilter);
  const [googleReviews,setGoogleReviews]=useState([]);
  const reviews = [...(D.reviews||[]),...googleReviews];

  // Cargar reseñas de Google Business si están configuradas
  useEffect(()=>{
    const {googlePlaceId,googleApiKey}=D.settings||{};
    if(!googlePlaceId||!googleApiKey)return;
    const url=`https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=reviews&language=es&key=${googleApiKey}`;
    fetch(url).then(r=>r.json()).then(data=>{
      if(data.result?.reviews){
        const mapped=data.result.reviews.map((r,i)=>({
          id:`g${i}`,name:r.author_name,rating:r.rating,
          text:r.text,service:'',date:new Date(r.time*1000).toISOString().split('T')[0],
          avatar:r.profile_photo_url,source:'google'
        }));
        setGoogleReviews(mapped);
      }
    }).catch(()=>{});
  },[D.settings?.googlePlaceId,D.settings?.googleApiKey]);

  const addCart = p => { setCart(c=>{const e=c.find(i=>i.id===p.id);return e?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}];}); setAdded(p.id); setTimeout(()=>setAdded(null),1400); };
  const updCart = (id,d) => setCart(c=>c.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cartN = cart.reduce((s,i)=>s+i.qty,0);

  return (
    <div style={{minHeight:'100vh',background:WEB.bg,fontFamily:"'Nunito',sans-serif",color:WEB.text}}>
      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(253,250,246,0.96)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${WEB.bd}`,padding:'0 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:62}}>
          <div onClick={()=>setNav('inicio')} style={{cursor:'pointer',letterSpacing:'0.25em',fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontSize:20,background:'linear-gradient(90deg,#C9A96E,#F0D9A0,#C9A96E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>SHINY<span style={{fontWeight:600}}>C</span>ANDLE</div>
          <div style={{display:'flex',gap:4}}>
            {[['inicio','Inicio'],['servicios','Servicios'],['productos','Tienda'],['resenas','Reseñas']].map(([k,l])=>(
              <button key={k} onClick={()=>setNav(k)} style={{padding:'8px 14px',border:'none',background:nav===k?WEB.light:'transparent',color:nav===k?WEB.gold:WEB.muted,borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:500,fontFamily:'inherit',transition:'all .2s'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button onClick={()=>setShowCart(true)} style={{position:'relative',background:cartN>0?`${WEB.gold}15`:WEB.light,border:`1px solid ${cartN>0?WEB.gold:WEB.bd}`,borderRadius:12,padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:cartN>0?WEB.gold:WEB.muted,fontWeight:600,fontSize:13,fontFamily:'inherit'}}>
              <ShoppingBag size={15}/>{cartN>0?`${cartN} · ${fmt(cartTotal)}`:'Carrito'}
              {cartN>0&&<span style={{position:'absolute',top:-6,right:-6,background:WEB.gold,color:'#fff',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{cartN}</span>}
            </button>
            <button onClick={onAdminClick} title="Panel de gestión" style={{background:WEB.light,border:`1px solid ${WEB.bd}`,borderRadius:10,padding:'9px 10px',cursor:'pointer',color:WEB.muted,display:'flex',alignItems:'center'}}><Lock size={14}/></button>
          </div>
        </div>
      </nav>

      {/* INICIO */}
      {nav==='inicio'&&<div>
        <div style={{background:'linear-gradient(135deg,#1A0E08,#2C1A10 50%,#1A1410)',minHeight:'82vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 24px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 30% 50%,rgba(184,146,74,0.09),transparent 60%)',pointerEvents:'none'}}/>
          <div style={{textAlign:'center',maxWidth:680,position:'relative'}}>
            <div style={{fontSize:11,letterSpacing:4,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:20}}>Moroccan Hair Spa & Hammam · Barcelona</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:54,fontWeight:700,color:'#FDF6EC',lineHeight:1.12,marginBottom:24}}>El arte del<br/><em style={{color:WEB.gold}}>bienestar marroquí</em></h1>
            <p style={{fontSize:17,color:'rgba(253,246,236,0.68)',lineHeight:1.8,marginBottom:38,fontWeight:300}}>Rituales auténticos con ingredientes de Marruecos.<br/>Hammam, tratamientos capilares y masajes en Barcelona.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>setNav('servicios')} style={{background:WEB.gold,color:'#fff',border:'none',borderRadius:14,padding:'14px 34px',fontSize:16,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Reservar ahora</button>
              <button onClick={()=>setNav('productos')} style={{background:'transparent',color:'rgba(253,246,236,0.8)',border:'2px solid rgba(253,246,236,0.28)',borderRadius:14,padding:'13px 28px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Tienda online</button>
            </div>
          </div>
        </div>
        <div style={{background:WEB.gold,padding:'16px 24px'}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'center',gap:48,flexWrap:'wrap'}}>
            {[['📍','C/ Sant Antoni Maria Claret 79, Barcelona'],['📞','+34 605 010 487'],['🕐','Lun–Sáb · 10:00–21:00'],['🌿','Ingredientes Naturales de origen Marroqui']].map(([ic,t])=><div key={t} style={{display:'flex',alignItems:'center',gap:8,color:'#fff',fontSize:13,fontWeight:500}}><span>{ic}</span><span>{t}</span></div>)}
          </div>
        </div>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'64px 24px'}}>
          <div style={{textAlign:'center',marginBottom:44}}><div style={{fontSize:11,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Nuestros rituales</div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:WEB.dark}}>Tratamientos exclusivos</h2></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:22}}>
            {svcActive.slice(0,3).map(s=><ServiceCard key={s.id} s={s} onBook={()=>setBooking(true)}/>)}
          </div>
          <div style={{textAlign:'center',marginTop:32}}><button onClick={()=>setNav('servicios')} style={{background:'transparent',color:WEB.gold,border:`2px solid ${WEB.gold}`,borderRadius:12,padding:'11px 26px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Ver todos los servicios →</button></div>
        </div>
        <div style={{background:WEB.sand,padding:'60px 24px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:36}}><div style={{fontSize:11,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Opiniones</div><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:WEB.dark}}>Clientas satisfechas ✦</h2></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
              {reviews.slice(0,4).map(r=><ReviewCard key={r.id} r={r}/>)}
            </div>
          </div>
        </div>
      </div>}

      {/* SERVICIOS */}
      {nav==='servicios'&&<div style={{maxWidth:1100,margin:'0 auto',padding:'52px 24px'}}>
        <div style={{textAlign:'center',marginBottom:44}}><div style={{fontSize:11,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Tratamientos</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:700,color:WEB.dark}}>Rituales de bienestar</h1></div>
        {[...new Set(svcActive.map(s=>s.category))].map(cat=>(
          <div key={cat} style={{marginBottom:44}}>
            <div style={{fontSize:10,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:18,display:'flex',alignItems:'center',gap:10}}><div style={{height:1,width:28,background:WEB.gold}}/>{cat}<div style={{height:1,flex:1,background:`${WEB.gold}30`}}/></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
              {svcActive.filter(s=>s.category===cat).map(s=><ServiceCard key={s.id} s={s} onBook={()=>setBooking(true)}/>)}
            </div>
          </div>
        ))}
      </div>}

      {/* TIENDA */}
      {nav==='productos'&&<div style={{maxWidth:1100,margin:'0 auto',padding:'52px 24px'}}>
        <div style={{textAlign:'center',marginBottom:40}}><div style={{fontSize:11,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Tienda online</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:700,color:WEB.dark}}>Productos marroquíes</h1><p style={{fontSize:15,color:WEB.muted,marginTop:10}}>Los mismos ingredientes de nuestros tratamientos, para casa.</p></div>
        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:34}}>
          {cats.map(c=><button key={c} onClick={()=>setCatFilter(c)} style={{padding:'8px 20px',border:`2px solid ${catFilter===c?WEB.gold:WEB.bd}`,borderRadius:20,background:catFilter===c?`${WEB.gold}12`:WEB.sf,color:catFilter===c?WEB.gold:WEB.muted,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{c}</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:20}}>
          {visProd.map(p=>(
            <div key={p.id} style={{background:WEB.sf,border:`2px solid ${added===p.id?WEB.gold:WEB.bd}`,borderRadius:18,padding:22,transition:'all .25s'}}>
              <div style={{fontSize:36,textAlign:'center',marginBottom:14,background:WEB.light,borderRadius:12,padding:'14px 0'}}>{EMOJIS[p.category]||'🌿'}</div>
              <div style={{fontSize:10,letterSpacing:2,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:5}}>{p.category}</div>
              <h3 style={{fontSize:15,fontWeight:700,color:WEB.dark,marginBottom:5}}>{p.name}</h3>
              <p style={{fontSize:12,color:WEB.muted,lineHeight:1.6,marginBottom:16}}>{p.description}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:WEB.gold}}>{fmt(p.price)}</span>
                <button onClick={()=>addCart(p)} style={{background:added===p.id?WEB.teal:WEB.gold,color:'#fff',border:'none',borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5,transition:'background .3s'}}>{added===p.id?<><Check size={12}/>Añadido</>:<><Plus size={12}/>Añadir</>}</button>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {/* RESEÑAS */}
      {nav==='resenas'&&<div style={{maxWidth:900,margin:'0 auto',padding:'52px 24px'}}>
        <div style={{textAlign:'center',marginBottom:44}}><div style={{fontSize:11,letterSpacing:3,color:WEB.gold,textTransform:'uppercase',fontWeight:600,marginBottom:10}}>Opiniones</div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:700,color:WEB.dark}}>Lo que dicen nuestras clientas</h1><div style={{display:'flex',justifyContent:'center',gap:3,marginTop:14}}>{[1,2,3,4,5].map(n=><Star key={n} size={22} fill={WEB.gold} style={{color:WEB.gold}}/>)}</div><p style={{fontSize:14,color:WEB.muted,marginTop:8}}>5.0 · {reviews.length} reseñas</p></div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {reviews.map(r=><ReviewCard key={r.id} r={r} full/>)}
        </div>
      </div>}

      {/* CARRITO */}
      {showCart&&<CartDrawer cart={cart} cartTotal={cartTotal} updCart={updCart} onClose={()=>setShowCart(false)} onCheckout={()=>{setShowCart(false);setCheckout(true);}} onNav={()=>{setShowCart(false);setNav('productos');}}/>}

      {/* MODALES */}
      {booking&&<BookingModal D={D} commit={commit} onClose={()=>setBooking(null)}/>}
      {checkout&&<CheckoutModal cart={cart} D={D} commit={commit} onClose={()=>setCheckout(false)} onDone={()=>setCart([])}/>}

      <footer style={{background:WEB.dark,color:'#0D0A08',padding:'44px 24px 28px',marginTop:60}}>
        <div style={{maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
         <div onClick={()=>setNav('inicio')} style={{cursor:'pointer',letterSpacing:'0.25em',fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontSize:20,background:'linear-gradient(90deg,#C9A96E,#F0D9A0,#C9A96E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>SHINY<span style={{fontWeight:600}}>C</span>ANDLE</div>
          <div style={{fontSize:13,marginBottom:16}}>Moroccan Hair Spa & Hammam · Barcelona</div>
          <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap',fontSize:12,marginBottom:20}}>
            {[['📍','C/ Sant Antoni Maria Claret 79, Barcelona'],['📞','+34 605 010 487'],['🕐','Lun–Sáb 10:00–21:00'],['✉','shinycandle.clients@gmail.com']].map(([i,t])=><span key={t}>{i} {t}</span>)}
          </div>
          <div style={{fontSize:11,color:'rgba(253,246,236,0.25)'}}>© 2026 ShinyCandle ✦ Barcelona</div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES WEB
// ═══════════════════════════════════════════════════════════════════════════════
function ServiceCard({s,onBook}){
  return(
    <div style={{background:WEB.sf,border:`1px solid ${WEB.bd}`,borderRadius:18,padding:24,transition:'transform .2s,box-shadow .2s'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(0,0,0,0.07)';}} onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
      <div style={{height:4,background:CAT_COLORS[s.category]||WEB.light,borderRadius:2,marginBottom:16}}/>
      <div style={{fontSize:10,color:WEB.gold,letterSpacing:2,textTransform:'uppercase',fontWeight:600,marginBottom:7}}>{s.category}</div>
      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,marginBottom:8,color:WEB.dark}}>{s.name}</h3>
      <p style={{fontSize:13,color:WEB.muted,lineHeight:1.7,marginBottom:18}}>{s.description}</p>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
        <div><span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:WEB.gold}}>{fmt(s.price)}</span><span style={{fontSize:12,color:WEB.muted,marginLeft:6}}>{s.duration}min</span></div>
        <button onClick={onBook} style={{background:WEB.gold,color:'#fff',border:'none',borderRadius:11,padding:'10px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Reservar</button>
      </div>
    </div>
  );
}
function ReviewCard({r,full}){
  return(
    <div style={{background:WEB.sf,borderRadius:16,padding:20,boxShadow:'0 2px 12px rgba(0,0,0,0.04)',border:`1px solid ${WEB.bd}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div style={{display:'flex',gap:9,alignItems:'center'}}>
          {r.avatar?<img src={r.avatar} alt={r.name} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>:<div style={{width:36,height:36,borderRadius:'50%',background:WEB.light,display:'flex',alignItems:'center',justifyContent:'center',color:WEB.gold,fontWeight:700,fontSize:15,flexShrink:0}}>{r.name[0]}</div>}
          <div>
            <div style={{fontWeight:700,color:WEB.dark,display:'flex',alignItems:'center',gap:6}}>{r.name}{r.source==='google'&&<span style={{fontSize:9,background:'#4285F415',color:'#4285F4',padding:'2px 6px',borderRadius:10,fontWeight:600,border:'1px solid #4285F430'}}>Google</span>}</div>
            {r.service&&<div style={{fontSize:11,color:WEB.gold,marginTop:1}}>{r.service}</div>}
          </div>
        </div>
        <div style={{textAlign:'right'}}><div style={{display:'flex',gap:2,justifyContent:'flex-end'}}>{[1,2,3,4,5].map(n=><Star key={n} size={12} fill={n<=r.rating?WEB.gold:'none'} style={{color:WEB.gold}}/>)}</div>{full&&<div style={{fontSize:11,color:WEB.muted,marginTop:3}}>{r.date}</div>}</div>
      </div>
      {r.text&&<p style={{fontSize:13,color:WEB.muted,lineHeight:1.7,fontStyle:'italic'}}>"{r.text}"</p>}
    </div>
  );
}
function CartDrawer({cart,cartTotal,updCart,onClose,onCheckout,onNav}){
  return(
    <div style={{position:'fixed',inset:0,zIndex:80}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{position:'absolute',inset:0,background:'rgba(26,20,16,0.5)'}} onClick={onClose}/>
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:360,background:WEB.sf,boxShadow:'-20px 0 60px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 22px',borderBottom:`1px solid ${WEB.bd}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:WEB.dark}}>Tu carrito</div>
          <button onClick={onClose} style={{background:WEB.light,border:'none',borderRadius:9,padding:7,cursor:'pointer',color:WEB.muted}}><X size={15}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 22px'}}>
          {cart.length===0?(
            <div style={{textAlign:'center',padding:'60px 0',color:WEB.muted}}>
              <ShoppingBag size={40} style={{opacity:.3,marginBottom:12}}/>
              <div style={{fontSize:14}}>Tu carrito está vacío</div>
              <button onClick={onNav} style={{marginTop:14,background:'none',border:`1px solid ${WEB.gold}`,borderRadius:10,padding:'9px 18px',color:WEB.gold,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Ver productos</button>
            </div>
          ):cart.map(item=>(
            <div key={item.id} style={{display:'flex',gap:12,alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${WEB.bd}`}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:600,color:WEB.dark}}>{item.name}</div><div style={{fontSize:12,color:WEB.muted}}>{fmt(item.price)}/ud</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button onClick={()=>updCart(item.id,-1)} style={{width:26,height:26,border:`1px solid ${WEB.bd}`,borderRadius:7,background:WEB.sf,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Minus size={11}/></button>
                <span style={{fontSize:14,fontWeight:700,minWidth:20,textAlign:'center'}}>{item.qty}</span>
                <button onClick={()=>updCart(item.id,+1)} style={{width:26,height:26,border:`1px solid ${WEB.gold}44`,borderRadius:7,background:`${WEB.gold}10`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:WEB.gold}}><Plus size={11}/></button>
              </div>
              <span style={{fontSize:14,fontWeight:700,color:WEB.gold,minWidth:52,textAlign:'right'}}>{fmt(item.price*item.qty)}</span>
            </div>
          ))}
        </div>
        {cart.length>0&&<div style={{padding:'16px 22px',borderTop:`1px solid ${WEB.bd}`}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><span style={{fontSize:14,color:WEB.muted}}>Total</span><span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:WEB.gold}}>{fmt(cartTotal)}</span></div>
          <button onClick={onCheckout} style={{width:'100%',background:WEB.gold,color:'#fff',border:'none',borderRadius:12,padding:14,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Finalizar compra ✦</button>
        </div>}
      </div>
    </div>
  );
}

function BookingModal({D,commit,onClose}){
  const svcActive=(D.services||[]).filter(s=>s.active!==false);
  // Step 1=servicios, 2=fecha, 3=hora+staff, 4=datos, 5=confirmado
  const [step,setStep]=useState(1);
  const [selSvcs,setSelSvcs]=useState([]);
  const [date,setDate]=useState('');
  const [staffId,setStaffId]=useState('');
  const [time,setTime]=useState('');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [notes,setNotes]=useState('');
  const [saving,setSaving]=useState(false);

  const totalDur=selSvcs.reduce((s,sv)=>s+sv.duration,0);
  const totalPrice=selSvcs.reduce((s,sv)=>s+sv.price,0);
  const staff=(D.staff||[]).filter(s=>s.active);
  const slots=freeSlots(date,staffId,totalDur,D.appointments||[],D.blocks||[]);
  const chosenStaff=staff.find(s=>s.id===+staffId);

  const toggleSvc=sv=>{
    setSelSvcs(prev=>{
      const has=prev.find(x=>x.id===sv.id);
      const next=has?prev.filter(x=>x.id!==sv.id):[...prev,sv];
      return next;
    });
    setTime(''); // reset hora al cambiar servicios
  };

  const confirm=()=>{
    if(!name.trim()||!email.trim()||!phone.trim()){alert('Completa nombre, email y teléfono.');return;}
    setSaving(true);
    const servicesArr=selSvcs.map(sv=>({id:sv.id,name:sv.name,duration:sv.duration,price:sv.price}));
    const newAppt={
      id:nid(D.appointments||[]),
      clientId:null,clientName:name.trim(),
      serviceId:selSvcs[0]?.id||null,
      serviceName:selSvcs.map(sv=>sv.name).join(' + '),
      services:servicesArr,
      staffId:staffId?+staffId:(staff[0]?.id||1),
      staffName:chosenStaff?.name||(staff[0]?.name||''),
      date,time,duration:totalDur,price:totalPrice,
      status:'pending',notes:notes.trim(),
      email:email.trim(),phone:phone.trim(),
      createdAt:new Date().toISOString(),source:'web',
    };
    commit({...D,appointments:[...(D.appointments||[]),newAppt]});
    setSaving(false);
    setStep(5);
  };

  const G=WEB.gold;
  const STEPS=['Servicios','Fecha','Hora','Datos'];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(26,20,16,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(4px)',padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:WEB.sf,borderRadius:24,width:'100%',maxWidth:560,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        {/* Header */}
        <div style={{padding:'22px 24px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11,color:G,letterSpacing:2,textTransform:'uppercase',fontWeight:600}}>Reservar</div>
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700,color:WEB.dark,marginTop:3}}>
              {selSvcs.length===0?'Elige tus tratamientos':selSvcs.length===1?selSvcs[0].name:`${selSvcs.length} tratamientos`}
            </div>
            {selSvcs.length>0&&<div style={{fontSize:13,color:WEB.muted,marginTop:2}}>{totalDur}min · {fmt(totalPrice)}</div>}
          </div>
          <button onClick={onClose} style={{background:WEB.light,border:'none',borderRadius:10,padding:8,cursor:'pointer',color:WEB.muted}}><X size={16}/></button>
        </div>

        {/* Progress */}
        {step<5&&<div style={{padding:'14px 24px 0'}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {STEPS.map((lbl,i)=>{const n=i+1;return(<div key={n} style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:step>=n?G:`${G}20`,color:step>=n?'#fff':G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,border:`2px solid ${step>=n?G:`${G}40`}`}}>{step>n?<Check size={12}/>:n}</div>
              {n<4&&<div style={{height:2,width:24,background:step>n?G:`${G}20`,borderRadius:1}}/>}
            </div>);})}
            <span style={{fontSize:11,color:WEB.muted,marginLeft:6}}>{STEPS[step-1]}</span>
          </div>
        </div>}

        <div style={{padding:'16px 24px 28px'}}>

          {/* STEP 1 — Selección de servicios */}
          {step===1&&<div>
            <div style={{fontSize:14,fontWeight:600,color:WEB.text,marginBottom:4}}>¿Qué tratamientos deseas?</div>
            <div style={{fontSize:12,color:WEB.muted,marginBottom:14}}>Puedes combinar varios servicios en una misma cita.</div>
            {[...new Set(svcActive.map(s=>s.category))].map(cat=>(
              <div key={cat} style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:2,color:G,textTransform:'uppercase',fontWeight:600,marginBottom:8}}>{cat}</div>
                {svcActive.filter(s=>s.category===cat).map(sv=>{
                  const sel=!!selSvcs.find(x=>x.id===sv.id);
                  return(
                    <button key={sv.id} onClick={()=>toggleSvc(sv)} style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:'11px 14px',border:`2px solid ${sel?G:WEB.bd}`,borderRadius:12,background:sel?`${G}10`:WEB.sf,cursor:'pointer',fontFamily:'inherit',marginBottom:7,textAlign:'left',transition:'all .15s'}}>
                      <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${sel?G:WEB.bd}`,background:sel?G:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
                        {sel&&<Check size={12} style={{color:'#fff'}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:sel?G:WEB.text}}>{sv.name}</div>
                        <div style={{fontSize:11,color:WEB.muted,marginTop:2}}>{sv.duration}min</div>
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:sel?G:WEB.muted,flexShrink:0}}>{fmt(sv.price)}</div>
                    </button>
                  );
                })}
              </div>
            ))}
            {selSvcs.length>0&&(
              <div style={{background:`${G}10`,border:`1px solid ${G}25`,borderRadius:12,padding:'12px 14px',marginBottom:14}}>
                {selSvcs.map(sv=><div key={sv.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:WEB.muted,marginBottom:3}}><span>{sv.name}</span><span>{fmt(sv.price)}</span></div>)}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:700,color:G,borderTop:`1px solid ${G}25`,paddingTop:8,marginTop:6}}>
                  <span>{totalDur}min en total</span><span>{fmt(totalPrice)}</span>
                </div>
              </div>
            )}
            <button disabled={selSvcs.length===0} onClick={()=>setStep(2)} style={{width:'100%',padding:'13px',border:'none',borderRadius:12,background:selSvcs.length>0?G:'#ccc',color:'#fff',fontSize:14,fontWeight:600,cursor:selSvcs.length>0?'pointer':'not-allowed',fontFamily:'inherit'}}>
              {selSvcs.length===0?'Selecciona al menos un tratamiento':'Continuar →'}
            </button>
          </div>}

          {/* STEP 2 — Fecha */}
          {step===2&&<div>
            <button onClick={()=>setStep(1)} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,fontSize:13,display:'flex',alignItems:'center',gap:4,marginBottom:14,padding:0}}><ChevronLeft size={14}/>Cambiar servicios</button>
            <div style={{fontSize:14,fontWeight:600,color:WEB.text,marginBottom:12}}>¿Qué día te viene bien?</div>
            <MiniCal value={date} onChange={d=>{setDate(d);setTime('');}} minDate={tod()}/>
            <div style={{marginTop:10,padding:12,background:WEB.light,borderRadius:10,fontSize:12,color:WEB.muted}}>🌙 Lunes a sábado · 9:00 – 19:00h</div>
            <button disabled={!date} onClick={()=>setStep(3)} style={{marginTop:14,width:'100%',padding:'13px',border:'none',borderRadius:12,background:date?G:'#ccc',color:'#fff',fontSize:14,fontWeight:600,cursor:date?'pointer':'not-allowed',fontFamily:'inherit'}}>Continuar →</button>
          </div>}

          {/* STEP 3 — Hora + Terapeuta */}
          {step===3&&<div>
            <button onClick={()=>setStep(2)} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,fontSize:13,display:'flex',alignItems:'center',gap:4,marginBottom:14,padding:0}}><ChevronLeft size={14}/>{new Date(date+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</button>
            <div style={{fontSize:13,fontWeight:600,color:WEB.text,marginBottom:8}}>Terapeuta (opcional)</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
              <button onClick={()=>{setStaffId('');setTime('');}} style={{padding:'7px 13px',border:`2px solid ${!staffId?G:WEB.bd}`,borderRadius:20,background:!staffId?`${G}15`:WEB.sf,color:!staffId?G:WEB.muted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Sin preferencia</button>
              {staff.map(s=><button key={s.id} onClick={()=>{setStaffId(String(s.id));setTime('');}} style={{padding:'7px 13px',border:`2px solid ${staffId==s.id?G:WEB.bd}`,borderRadius:20,background:staffId==s.id?`${G}15`:WEB.sf,color:staffId==s.id?G:WEB.muted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{s.name}</button>)}
            </div>
            <div style={{fontSize:13,fontWeight:600,color:WEB.text,marginBottom:10}}>Horas disponibles · {totalDur}min</div>
            {slots.length===0
              ?<div style={{padding:20,background:WEB.light,borderRadius:12,textAlign:'center',color:WEB.muted,fontSize:13}}>😔 Sin horas disponibles este día.<br/>Prueba otra fecha o terapeuta.</div>
              :<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:16}}>{slots.map(s=><button key={s} onClick={()=>setTime(s)} style={{padding:'10px 4px',border:`2px solid ${time===s?G:WEB.bd}`,borderRadius:10,background:time===s?G:WEB.sf,color:time===s?'#fff':WEB.text,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>)}</div>}
            <button disabled={!time} onClick={()=>setStep(4)} style={{width:'100%',padding:'13px',border:'none',borderRadius:12,background:time?G:'#ccc',color:'#fff',fontSize:14,fontWeight:600,cursor:time?'pointer':'not-allowed',fontFamily:'inherit'}}>Continuar →</button>
          </div>}

          {/* STEP 4 — Datos personales */}
          {step===4&&<div>
            <button onClick={()=>setStep(3)} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,fontSize:13,display:'flex',alignItems:'center',gap:4,marginBottom:14,padding:0}}><ChevronLeft size={14}/>{new Date(date+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})} · {time}</button>
            <div style={{background:WEB.light,borderRadius:12,padding:'12px 16px',marginBottom:18}}>
              {selSvcs.map(sv=><div key={sv.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:WEB.muted,marginBottom:3}}><span>{sv.name}</span><span>{fmt(sv.price)}</span></div>)}
              <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:700,color:G,borderTop:`1px solid ${G}25`,paddingTop:7,marginTop:6}}>
                <span>{date} · {time}{chosenStaff?` · ${chosenStaff.name}`:''}</span>
                <span>{fmt(totalPrice)}</span>
              </div>
            </div>
            {[['NOMBRE *',name,setName,'Tu nombre y apellidos','text'],['EMAIL *',email,setEmail,'tu@email.com','email'],['TELÉFONO *',phone,setPhone,'+34 6XX XXX XXX','tel']].map(([lbl,val,fn,ph,type])=>(
              <div key={lbl} style={{marginBottom:11}}>
                <label style={{fontSize:11,color:WEB.muted,display:'block',marginBottom:4,fontWeight:600}}>{lbl}</label>
                <input type={type} value={val} onChange={e=>fn(e.target.value)} placeholder={ph} style={{width:'100%',padding:'11px 13px',border:`1px solid ${WEB.bd}`,borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}/>
              </div>
            ))}
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,color:WEB.muted,display:'block',marginBottom:4,fontWeight:600}}>NOTAS / ALERGIAS</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{width:'100%',padding:'11px 13px',border:`1px solid ${WEB.bd}`,borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none',resize:'none'}}/>
            </div>
            <button disabled={saving} onClick={confirm} style={{width:'100%',padding:'14px',border:'none',borderRadius:12,background:saving?'#aaa':G,color:'#fff',fontSize:15,fontWeight:700,cursor:saving?'wait':'pointer',fontFamily:'inherit'}}>
              {saving?'Guardando...':'✦ Confirmar Reserva'}
            </button>
            <p style={{fontSize:11,color:WEB.muted,textAlign:'center',marginTop:10}}>Te confirmaremos la cita. ¡Gracias! ✦</p>
          </div>}

          {/* STEP 5 — Confirmado */}
          {step===5&&<div style={{textAlign:'center',padding:'10px 0'}}>
            <div style={{width:64,height:64,borderRadius:'50%',background:`${G}20`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Check size={28} style={{color:G}}/></div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:WEB.dark,marginBottom:10}}>¡Reserva confirmada!</div>
            <div style={{background:WEB.light,borderRadius:12,padding:'12px 16px',marginBottom:16,textAlign:'left'}}>
              {selSvcs.map(sv=><div key={sv.id} style={{fontSize:13,color:WEB.muted,marginBottom:3}}>· {sv.name}</div>)}
              <div style={{fontSize:13,fontWeight:600,color:WEB.text,marginTop:6}}>{new Date(date+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})} a las {time}</div>
            </div>
            <div style={{fontSize:13,color:WEB.muted,marginBottom:20}}>Nos pondremos en contacto contigo para confirmar. ✦</div>
            <button onClick={onClose} style={{padding:'12px 32px',border:'none',borderRadius:12,background:G,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Cerrar</button>
          </div>}

        </div>
      </div>
    </div>
  );
}

function CheckoutModal({cart,D,commit,onClose,onDone}){
  const [step,setStep]=useState(1);
  const [name,setName]=useState('');const [email,setEmail]=useState('');const [phone,setPhone]=useState('');
  const [address,setAddress]=useState('');const [method,setMethod]=useState('transferencia');
  const [notes,setNotes]=useState('');const [saving,setSaving]=useState(false);
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const confirm=async()=>{
    if(!name.trim()||!email.trim()||!phone.trim()){alert('Completa nombre, email y teléfono.');return;}
    setSaving(true);
    const order={id:nid(D.orders||[]),clientName:name.trim(),email:email.trim(),phone:phone.trim(),address:address.trim(),method,notes:notes.trim(),items:cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty})),total,status:'pending',createdAt:tod()};
    commit({...D,orders:[...(D.orders||[]),order]});
    setSaving(false);setStep(3);onDone&&onDone();
  };
  const G=WEB.gold;
  const METS=[{id:'transferencia',label:'Transferencia bancaria',ico:'🏦'},{id:'efectivo',label:'Pago en tienda',ico:'💵'},{id:'bizum',label:'Bizum',ico:'📱'}];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(26,20,16,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(4px)',padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:WEB.sf,borderRadius:24,width:'100%',maxWidth:480,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{padding:'22px 24px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:WEB.dark}}>{step===3?'¡Pedido confirmado!':'Finalizar compra'}</div><button onClick={onClose} style={{background:WEB.light,border:'none',borderRadius:10,padding:8,cursor:'pointer',color:WEB.muted}}><X size={16}/></button></div>
        <div style={{padding:'16px 24px 28px'}}>
          {step===1&&<div>{cart.map(item=><div key={item.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${WEB.bd}`}}><div><div style={{fontSize:14,fontWeight:600}}>{item.name}</div><div style={{fontSize:12,color:WEB.muted}}>x{item.qty} · {fmt(item.price)}/ud</div></div><span style={{fontSize:14,fontWeight:700,color:G}}>{fmt(item.price*item.qty)}</span></div>)}<div style={{display:'flex',justifyContent:'space-between',padding:'14px 0 0',fontSize:18,fontWeight:700}}><span>Total</span><span style={{color:G,fontFamily:"'Playfair Display',serif",fontSize:22}}>{fmt(total)}</span></div><div style={{background:WEB.light,borderRadius:12,padding:14,fontSize:12,color:WEB.muted,margin:'14px 0 16px'}}>📦 Recogida en tienda o envío en Barcelona (24-48h).</div><button onClick={()=>setStep(2)} style={{width:'100%',padding:'13px',border:'none',borderRadius:12,background:G,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Continuar →</button></div>}
          {step===2&&<div>
            <button onClick={()=>setStep(1)} style={{background:'none',border:'none',cursor:'pointer',color:WEB.muted,fontSize:13,display:'flex',alignItems:'center',gap:4,marginBottom:16,padding:0}}><ChevronLeft size={14}/>Volver</button>
            {[['NOMBRE *',name,setName,'Tu nombre','text'],['EMAIL *',email,setEmail,'tu@email.com','email'],['TELÉFONO *',phone,setPhone,'+34 6XX XXX XXX','tel'],['DIRECCIÓN',address,setAddress,'Calle, número... Barcelona','text']].map(([lbl,val,fn,ph,type])=><div key={lbl} style={{marginBottom:11}}><label style={{fontSize:11,color:WEB.muted,display:'block',marginBottom:4,fontWeight:600}}>{lbl}</label><input type={type} value={val} onChange={e=>fn(e.target.value)} placeholder={ph} style={{width:'100%',padding:'11px 13px',border:`1px solid ${WEB.bd}`,borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}/></div>)}
            <div style={{marginBottom:16}}><label style={{fontSize:11,color:WEB.muted,display:'block',marginBottom:8,fontWeight:600}}>MÉTODO DE PAGO</label>{METS.map(m=><button key={m.id} onClick={()=>setMethod(m.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',border:`2px solid ${method===m.id?G:WEB.bd}`,borderRadius:12,background:method===m.id?`${G}10`:WEB.sf,cursor:'pointer',fontFamily:'inherit',textAlign:'left',width:'100%',marginBottom:7}}><span style={{fontSize:18}}>{m.ico}</span><span style={{fontSize:13,fontWeight:600,color:method===m.id?G:WEB.text}}>{m.label}</span>{method===m.id&&<Check size={13} style={{color:G,marginLeft:'auto'}}/>}</button>)}</div>
            <div style={{background:WEB.light,borderRadius:10,padding:'10px 14px',display:'flex',justifyContent:'space-between',marginBottom:16}}><span style={{fontSize:14,color:WEB.muted}}>Total</span><span style={{fontSize:16,fontWeight:700,color:G,fontFamily:"'Playfair Display',serif"}}>{fmt(total)}</span></div>
            <button disabled={saving} onClick={confirm} style={{width:'100%',padding:'14px',border:'none',borderRadius:12,background:saving?'#aaa':G,color:'#fff',fontSize:15,fontWeight:700,cursor:saving?'wait':'pointer',fontFamily:'inherit'}}>{saving?'Confirmando...':'✦ Confirmar Pedido'}</button>
          </div>}
          {step===3&&<div style={{textAlign:'center',padding:'10px 0'}}><div style={{width:64,height:64,borderRadius:'50%',background:`${G}20`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Check size={28} style={{color:G}}/></div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:WEB.dark,marginBottom:10}}>¡Pedido confirmado!</div><div style={{fontSize:13,color:WEB.muted,lineHeight:1.8,marginBottom:20}}>Te contactaremos en 24h para coordinar la entrega.</div><button onClick={onClose} style={{padding:'12px 32px',border:'none',borderRadius:12,background:G,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Cerrar</button></div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ██████ VISTA ADMIN ██████
// ═══════════════════════════════════════════════════════════════════════════════


// ─── Acceso rápido al panel ───────────────────────────────────────────────────
export default function App(){
  const[D,setD]=useState(null);
  const[view,setView]=useState('web');
  const lastSave=useRef(0);
  const load=useCallback(async()=>{
    if(Date.now()-lastSave.current<4000)return;
    const saved=await dbRead();
    if(saved)setD(saved);
    else{await dbWrite(SEED);setD(SEED);}
  },[]);
  const commit=useCallback(async(newD)=>{
    lastSave.current=Date.now();
    setD(newD);
    dbWrite(newD);
  },[]);
  useEffect(()=>{load();},[]);
  useEffect(()=>{const id=setInterval(load,6000);return()=>clearInterval(id);},[load]);
  if(!D)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0B0B0B',fontFamily:"'Playfair Display',serif",color:'#C9A96E',fontSize:22}}>
      Cargando ShinyCandle...
    </div>
  );
  return(
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}select option{background:#1D1D1D}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.3);border-radius:2px}`}</style>
      {view==='web'&&<WebApp D={D} commit={commit} onAdminClick={()=>setView('login')}/>}
      {view==='login'&&<><WebApp D={D} commit={commit} onAdminClick={()=>{}}/><LoginScreen onLogin={()=>setView('admin')} onCancel={()=>setView('web')}/></>}
      {view==='admin'&&<AdminApp D={D} commit={commit} onExit={()=>setView('web')}/>}
    </>
  );
}
