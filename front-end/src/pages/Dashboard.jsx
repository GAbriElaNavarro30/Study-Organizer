import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
    IoHappyOutline, IoSadOutline, IoWarningOutline,
    IoRemoveCircleOutline, IoAlertCircle, IoAlertCircleOutline,
    IoNotificationsOutline, IoCheckmarkCircle, IoAddCircleOutline,
    IoSchoolOutline, IoBookOutline, IoCallOutline, IoMedkitOutline,
    IoPersonOutline, IoLeafOutline, IoSparklesOutline, IoTrendingUpOutline,
    IoHeartOutline, IoCalendarOutline, IoFlashOutline, IoStatsChartOutline,
    IoChevronUpOutline, IoChevronDownOutline, IoRemoveOutline,
} from "react-icons/io5";

const API = "http://localhost:3000/dashboard";

/* ─── tiny sparkline/bar chart (pure SVG, no dep) ─── */
function MiniBarChart({ data = [], color = "#3b82f6", height = 36 }) {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const w = 6, gap = 4, total = data.length * (w + gap) - gap;
    return (
        <svg width={total} height={height} viewBox={`0 0 ${total} ${height}`} style={{ display: "block" }}>
            {data.map((v, i) => {
                const bh = Math.max(3, (v / max) * height);
                return (
                    <rect key={i} x={i * (w + gap)} y={height - bh}
                        width={w} height={bh} rx="3"
                        fill={color} opacity={v === 0 ? 0.25 : 0.85} />
                );
            })}
        </svg>
    );
}

function DonutChart({ value = 0, total = 100, color = "#3b82f6", size = 64 }) {
    const r = 24, cx = 32, cy = 32;
    const circ = 2 * Math.PI * r;
    const pct = total ? value / total : 0;
    const dash = pct * circ;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0eaff" strokeWidth="7" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.8s ease" }} />
            <text x="32" y="36" textAnchor="middle"
                fontSize="12" fontWeight="700" fill={color}
                fontFamily="'Plus Jakarta Sans', sans-serif">
                {Math.round(pct * 100)}%
            </text>
        </svg>
    );
}

const colorCat = { positiva: "#22c55e", negativa: "#f59e0b", critica: "#ef4444", neutra: "#6366f1" };
const bgCat = { positiva: "#f0fdf4", negativa: "#fffbeb", critica: "#fef2f2", neutra: "#eef2ff" };
const labelCat = { positiva: "Positiva", negativa: "Negativa", critica: "Crítica", neutra: "Neutra" };
const iconoCat = {
    positiva: <IoHappyOutline />, negativa: <IoSadOutline />,
    critica: <IoWarningOutline />, neutra: <IoRemoveCircleOutline />,
};
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function Dashboard() {
    const { usuario, refrescarUsuario } = useContext(AuthContext);
    const [emociones, setEmociones] = useState([]);
    const [emocionSeleccionada, setEmocionSeleccionada] = useState(null);
    const [registroHoy, setRegistroHoy] = useState(null);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [emocionNueva, setEmocionNueva] = useState("");
    const [loadingRegistro, setLoadingRegistro] = useState(false);
    const [frase, setFrase] = useState("");
    const [fraseCategoria, setFraseCategoria] = useState("neutra");
    const [predominantes, setPredominantes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [alertaActiva, setAlertaActiva] = useState(null);

    useEffect(() => { refrescarUsuario(); cargarTodo(); }, []);

    async function cargarTodo() {
        await Promise.all([cargarEmociones(), cargarVerificarHoy(),
        cargarPredominantes(), cargarHistorial(), cargarAlertas(), cargarTipDiario()]);
    }
    async function cargarEmociones() {
        try { const r = await fetch(`${API}/emociones`, { credentials: "include" }); const d = await r.json(); setEmociones(d.emociones || []); } catch (e) { console.error(e); }
    }
    async function cargarVerificarHoy() {
        try { const r = await fetch(`${API}/emociones/verificar-hoy`, { credentials: "include" }); const d = await r.json(); setRegistroHoy(d); } catch (e) { console.error(e); }
    }
    async function cargarPredominantes() {
        try { const r = await fetch(`${API}/emociones/predominantes`, { credentials: "include" }); const d = await r.json(); setPredominantes(d.predominantes || []); } catch (e) { console.error(e); }
    }
    async function cargarHistorial() {
        try { const r = await fetch(`${API}/emociones/historial`, { credentials: "include" }); const d = await r.json(); setHistorial(d.historial || []); } catch (e) { console.error(e); }
    }
    async function cargarAlertas() {
        try { const r = await fetch(`${API}/alertas`, { credentials: "include" }); const d = await r.json(); const l = d.alertas || []; setAlertas(l); if (l.length > 0) setAlertaActiva(l[0]); } catch (e) { console.error(e); }
    }
    async function cargarTipDiario() {
        try { const r = await fetch(`${API}/tip-diario`, { credentials: "include" }); const d = await r.json(); setFrase(d.texto || ""); setFraseCategoria(d.categoria || "neutra"); } catch (e) { console.error(e); }
    }
    async function agregarEmocionPersonalizada() {
        if (!emocionNueva.trim()) return;
        try {
            const r = await fetch(`${API}/emociones/agregar`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre_emocion: emocionNueva.trim() }) });
            const d = await r.json();
            if (!r.ok) { alert(d.mensaje); return; }
            setEmociones(p => [...p, d.emocion]);
            setEmocionSeleccionada(d.emocion.id_emocion);
            setEmocionNueva(""); setMostrarInput(false);
        } catch (e) { console.error(e); }
    }
    async function registrarEmocionDelDia() {
        if (!emocionSeleccionada) return;
        setLoadingRegistro(true);
        try {
            const r = await fetch(`${API}/emociones/registrar`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_emocion: emocionSeleccionada }) });
            const d = await r.json();
            if (!r.ok) { alert(d.mensaje); return; }
            await cargarTodo();
        } catch (e) { console.error(e); } finally { setLoadingRegistro(false); }
    }
    async function cerrarAlerta(id) {
        try { await fetch(`${API}/alertas/${id}/vista`, { method: "PATCH", credentials: "include" }); setAlertaActiva(null); setAlertas(p => p.filter(a => a.id_alerta !== id)); } catch (e) { console.error(e); }
    }

    const ultimosDias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const iso = d.toISOString().split("T")[0];
        const registro = historial.find(h => { const hf = new Date(h.fecha_registro); hf.setDate(hf.getDate() + 1); return hf.toISOString().split("T")[0] === iso; });
        return { iso, dia: diasSemana[d.getDay()], num: d.getDate(), registro };
    });

    const diasConRegistro = ultimosDias.filter(d => d.registro).length;
    const rachaActual = (() => { let r = 0; for (let i = 6; i >= 0; i--) { if (ultimosDias[i].registro) r++; else break; } return r; })();
    const distribucion = { positiva: 0, negativa: 0, critica: 0, neutra: 0 };
    historial.forEach(h => { if (distribucion[h.categoria] !== undefined) distribucion[h.categoria]++; });
    const totalHist = historial.length || 1;

    const nombreUsuario = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario";
    const fotoUsuario = usuario?.foto_perfil || null;
    const rolUsuario = usuario?.rol_texto || "Estudiante";
    const horaActual = new Date().getHours();
    const saludo = horaActual < 12 ? "Buenos días" : horaActual < 19 ? "Buenas tardes" : "Buenas noches";

    const miniBarData = ultimosDias.map(d => d.registro ? 1 : 0);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        :root{
          --p:#3b82f6;--p2:#2563eb;--p-lt:#eff6ff;--p-mid:#bfdbfe;
          --sky:#0ea5e9;--cyan:#06b6d4;
          --bg:#f0f6ff;--surf:#ffffff;--surf2:#f7faff;
          --bdr:#dbeafe;--txt:#0c1a3b;--muted:#64748b;
          --green:#22c55e;--amber:#f59e0b;--red:#ef4444;--indigo:#6366f1;
          --r:14px;--r-sm:10px;
          --sh:0 1px 3px rgba(59,130,246,.08),0 4px 16px rgba(59,130,246,.08);
          --sh-lg:0 8px 32px rgba(59,130,246,.14);
          --font:'Plus Jakarta Sans',sans-serif;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        .db{font-family:var(--font);background:var(--bg);min-height:100vh;color:var(--txt);}
        svg{display:inline-block;vertical-align:middle;flex-shrink:0;}

        /* ── Sidebar ── */
        .db-layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh;}
        .db-sidebar{
          background:var(--surf);border-right:1px solid var(--bdr);
          padding:24px 16px;display:flex;flex-direction:column;gap:6px;
          position:sticky;top:0;height:100vh;overflow:hidden;
        }
        .db-brand{font-size:18px;font-weight:800;color:var(--txt);padding:0 8px 20px;
          letter-spacing:-.02em;}
        .db-brand em{font-style:normal;color:var(--p);}
        .db-nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;
          border-radius:var(--r-sm);font-size:13px;font-weight:600;color:var(--muted);
          cursor:pointer;transition:all .18s;border:none;background:none;width:100%;text-align:left;}
        .db-nav-item svg{font-size:17px;}
        .db-nav-item:hover{background:var(--p-lt);color:var(--p);}
        .db-nav-item.active{background:var(--p);color:#fff;}
        .db-nav-section{font-size:10px;font-weight:700;color:#94a3b8;
          text-transform:uppercase;letter-spacing:.1em;padding:12px 12px 4px;}
        .db-sidebar-bottom{margin-top:auto;padding-top:16px;border-top:1px solid var(--bdr);}
        .db-avatar-mini{display:flex;align-items:center;gap:10px;padding:8px 12px;
          border-radius:var(--r-sm);cursor:pointer;transition:background .18s;}
        .db-avatar-mini:hover{background:var(--p-lt);}
        .db-avatar-mini-pic{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--sky));
          color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .db-avatar-mini-pic img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
        .db-avatar-mini-info strong{font-size:12px;font-weight:700;display:block;color:var(--txt);}
        .db-avatar-mini-info span{font-size:11px;color:var(--muted);}

        /* ── Main ── */
        .db-main{display:flex;flex-direction:column;overflow:hidden;}
        .db-topbar{
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 28px;background:var(--surf);border-bottom:1px solid var(--bdr);
          position:sticky;top:0;z-index:50;
        }
        .db-topbar-title h1{font-size:22px;font-weight:800;letter-spacing:-.02em;}
        .db-topbar-title p{font-size:13px;color:var(--muted);margin-top:1px;}
        .db-topbar-right{display:flex;align-items:center;gap:12px;}
        .db-notif-btn{
          width:38px;height:38px;border-radius:50%;border:1px solid var(--bdr);
          background:var(--surf2);display:flex;align-items:center;justify-content:center;
          cursor:pointer;position:relative;color:var(--muted);font-size:18px;transition:all .18s;
        }
        .db-notif-btn:hover{border-color:var(--p);color:var(--p);}
        .db-notif-dot{position:absolute;top:7px;right:7px;width:8px;height:8px;
          border-radius:50%;background:var(--red);border:2px solid #fff;}
        .db-date-chip{
          padding:6px 14px;border-radius:999px;background:var(--p-lt);
          color:var(--p);font-size:12px;font-weight:700;border:1px solid var(--p-mid);
        }

        /* ── Content ── */
        .db-content{padding:24px 28px;display:flex;flex-direction:column;gap:20px;}

        /* ── KPI Row ── */
        .db-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .db-kpi{
          background:var(--surf);border-radius:var(--r);padding:20px;
          border:1px solid var(--bdr);box-shadow:var(--sh);
          display:flex;flex-direction:column;gap:12px;transition:box-shadow .2s,transform .2s;
          position:relative;overflow:hidden;
        }
        .db-kpi::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--kpi-c,var(--p)),var(--kpi-c2,var(--sky)));
        }
        .db-kpi:hover{box-shadow:var(--sh-lg);transform:translateY(-2px);}
        .db-kpi-top{display:flex;align-items:flex-start;justify-content:space-between;}
        .db-kpi-icon{
          width:40px;height:40px;border-radius:10px;
          background:var(--kpi-bg,var(--p-lt));color:var(--kpi-c,var(--p));
          display:flex;align-items:center;justify-content:center;font-size:20px;
        }
        .db-kpi-badge{
          font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;
          display:flex;align-items:center;gap:3px;
        }
        .db-kpi-badge.up{background:#dcfce7;color:#16a34a;}
        .db-kpi-badge.down{background:#fee2e2;color:#dc2626;}
        .db-kpi-badge.neutral{background:#f1f5f9;color:var(--muted);}
        .db-kpi-val{font-size:30px;font-weight:800;letter-spacing:-.03em;line-height:1;}
        .db-kpi-label{font-size:12px;color:var(--muted);font-weight:500;margin-top:2px;}
        .db-kpi-chart{margin-top:4px;}

        /* ── Grid 2 col ── */
        .db-row{display:grid;gap:16px;}
        .db-row-2{grid-template-columns:1fr 1fr;}
        .db-row-3{grid-template-columns:1.4fr 1fr 1fr;}
        .db-row-emo{grid-template-columns:1.6fr 1fr;}

        /* ── Card ── */
        .db-card{
          background:var(--surf);border-radius:var(--r);padding:22px;
          border:1px solid var(--bdr);box-shadow:var(--sh);
        }
        .db-card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .db-card-hd h2{font-size:14px;font-weight:800;letter-spacing:-.01em;}
        .db-card-hd p{font-size:12px;color:var(--muted);margin-top:2px;}
        .db-chip{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;}

        /* ── Distribución emocional ── */
        .db-dist-list{display:flex;flex-direction:column;gap:12px;}
        .db-dist-item{display:flex;flex-direction:column;gap:5px;}
        .db-dist-top{display:flex;align-items:center;justify-content:space-between;font-size:12px;}
        .db-dist-name{display:flex;align-items:center;gap:6px;font-weight:600;}
        .db-dist-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .db-dist-pct{font-weight:700;color:var(--muted);}
        .db-dist-track{height:7px;background:#eef2ff;border-radius:999px;overflow:hidden;}
        .db-dist-fill{height:100%;border-radius:999px;transition:width .8s ease;}

        /* ── Semana visual ── */
        .db-week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;}
        .db-wd{display:flex;flex-direction:column;align-items:center;gap:5px;}
        .db-wd-lbl{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;}
        .db-wd-circle{
          width:38px;height:38px;border-radius:50%;background:var(--surf2);
          border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;color:var(--muted);transition:all .2s;cursor:default;
        }
        .db-wd-circle.has{border-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.12);}
        .db-wd-circle.has svg{font-size:17px;color:#fff;}
        .db-wd-name{font-size:10px;color:var(--muted);max-width:44px;overflow:hidden;
          white-space:nowrap;text-overflow:ellipsis;}

        /* ── Registro Emocional ── */
        .db-emo-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
        .db-emo-btn{
          display:flex;align-items:center;gap:7px;padding:7px 14px;
          border-radius:999px;border:1.5px solid var(--bdr);background:var(--surf2);
          color:var(--txt);font-family:var(--font);font-size:13px;font-weight:600;
          cursor:pointer;transition:all .18s;
        }
        .db-emo-btn:hover{background:var(--p-lt);border-color:var(--p);color:var(--p);}
        .db-emo-btn.sel{color:#fff;border-color:transparent;box-shadow:0 3px 10px rgba(0,0,0,.15);}
        .db-emo-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
        .db-emo-btn.sel .db-emo-dot{background:rgba(255,255,255,.6)!important;}
        .db-emo-otro{border-style:dashed;color:var(--muted);background:transparent;}
        .db-emo-otro:hover{border-style:solid;background:var(--p-lt);border-color:var(--p);color:var(--p);}
        .db-inp-row{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
        .db-inp-row input{
          flex:1;min-width:180px;padding:9px 13px;border-radius:10px;
          border:1.5px solid var(--bdr);font-family:var(--font);font-size:13px;
          color:var(--txt);outline:none;background:var(--surf2);transition:border .2s;
        }
        .db-inp-row input:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(59,130,246,.1);background:#fff;}
        .db-btn{padding:9px 16px;border-radius:10px;border:none;font-family:var(--font);
          font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;}
        .db-btn-prim{background:var(--p);color:#fff;}
        .db-btn-prim:hover{background:var(--p2);}
        .db-btn-ghost{background:#f1f5f9;color:var(--muted);}
        .db-btn-ghost:hover{background:#e2e8f0;}
        .db-btn-reg{
          width:100%;padding:13px;background:linear-gradient(135deg,var(--p),var(--sky));
          color:#fff;border:none;border-radius:12px;font-family:var(--font);
          font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;
          letter-spacing:.01em;box-shadow:0 4px 14px rgba(59,130,246,.3);
        }
        .db-btn-reg:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,.4);}
        .db-btn-reg:disabled{background:#cbd5e1;cursor:not-allowed;box-shadow:none;}
        .db-reg-ok{display:flex;align-items:center;gap:14px;padding:16px;
          border-radius:12px;border:2px solid;background:var(--surf2);}
        .db-reg-ok-icon{font-size:32px;display:flex;align-items:center;}
        .db-reg-ok-icon svg{font-size:32px;}
        .db-reg-ok strong{font-size:16px;font-weight:800;}
        .db-reg-ok span{font-size:12px;font-weight:600;display:block;margin-top:2px;}
        .db-reg-ok-msg{margin-top:12px;font-size:12px;color:var(--muted);
          display:flex;align-items:center;gap:5px;justify-content:center;}
        .db-reg-ok-msg svg{font-size:13px;}
        .db-badge-ok{display:flex;align-items:center;gap:5px;background:#dcfce7;
          border:1px solid #86efac;color:#16a34a;font-size:11px;font-weight:700;
          padding:3px 10px;border-radius:999px;}
        .db-badge-ok svg{font-size:14px;}

        /* ── Frase ── */
        .db-frase-card{
          position:relative;overflow:hidden;
          background:linear-gradient(135deg,#eff6ff 0%,#e0f2fe 100%);
          border:1px solid #bae6fd;
        }
        .db-frase-card::before{
          content:'"';position:absolute;top:-20px;left:8px;
          font-family:'Instrument Serif',serif;font-size:140px;
          opacity:.07;color:var(--p);line-height:1;pointer-events:none;
        }
        .db-frase-tag{font-size:10px;font-weight:800;color:var(--sky);
          text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;
          display:flex;align-items:center;gap:5px;}
        .db-frase-tag svg{font-size:13px;}
        .db-frase-txt{
          font-family:'Instrument Serif',serif;font-size:18px;
          color:var(--txt);line-height:1.55;font-style:italic;
        }
        .db-frase-hint{margin-top:10px;font-size:12px;color:var(--muted);
          display:flex;align-items:center;gap:4px;}
        .db-frase-hint svg{font-size:13px;}

        /* ── Predominantes ── */
        .db-pred-list{display:flex;flex-direction:column;gap:12px;}
        .db-pred-item{display:flex;align-items:center;gap:12px;}
        .db-pred-rank{font-size:12px;font-weight:800;color:var(--muted);width:16px;text-align:center;}
        .db-pred-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;
          justify-content:center;font-size:18px;flex-shrink:0;}
        .db-pred-icon svg{font-size:18px;}
        .db-pred-body{flex:1;}
        .db-pred-name{font-size:13px;font-weight:700;}
        .db-pred-cat{font-size:11px;font-weight:600;}
        .db-pred-bar-wrap{display:flex;align-items:center;gap:8px;margin-top:4px;}
        .db-pred-track{flex:1;height:5px;background:#e0eaff;border-radius:999px;overflow:hidden;}
        .db-pred-fill{height:100%;border-radius:999px;}
        .db-pred-pct{font-size:11px;font-weight:800;color:var(--muted);white-space:nowrap;}

        /* ── Tests ── */
        .db-test-item{display:flex;align-items:center;gap:12px;padding:13px;
          border-radius:10px;background:var(--surf2);border:1px solid var(--bdr);margin-bottom:10px;}
        .db-test-item:last-child{margin-bottom:0;}
        .db-test-icon-wrap{width:38px;height:38px;border-radius:10px;background:var(--p-lt);
          color:var(--p);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .db-test-icon-wrap svg{font-size:20px;}
        .db-test-body{flex:1;}
        .db-test-body strong{font-size:13px;font-weight:700;display:block;}
        .db-test-body span{font-size:11px;color:var(--muted);font-weight:500;}
        .db-test-cta{padding:6px 13px;border-radius:8px;background:var(--p-lt);color:var(--p);
          border:1px solid var(--p-mid);font-family:var(--font);font-size:12px;font-weight:700;
          cursor:pointer;transition:all .18s;white-space:nowrap;}
        .db-test-cta:hover{background:var(--p);color:#fff;border-color:var(--p);}

        /* ── Perfil card ── */
        .db-perfil{display:flex;align-items:center;gap:14px;}
        .db-perfil-pic{width:50px;height:50px;border-radius:50%;
          background:linear-gradient(135deg,var(--p),var(--sky));
          color:#fff;font-size:18px;font-weight:800;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .db-perfil-pic img{width:100%;height:100%;border-radius:50%;object-fit:cover;}
        .db-perfil-info strong{font-size:14px;font-weight:800;display:block;}
        .db-perfil-info span{font-size:12px;color:var(--p);font-weight:600;}
        .db-perfil-info p{font-size:12px;color:var(--muted);margin-top:3px;}
        .db-perfil-badge{margin-left:auto;padding:5px 11px;border-radius:8px;
          background:var(--p-lt);color:var(--p);font-size:11px;font-weight:700;
          border:1px solid var(--p-mid);}

        /* ── Alerta Modal ── */
        .db-overlay{position:fixed;inset:0;background:rgba(12,26,59,.5);
          backdrop-filter:blur(5px);z-index:1000;display:flex;align-items:center;
          justify-content:center;padding:20px;animation:fadeIn .25s ease;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .db-modal{background:#fff;border-radius:20px;padding:36px 32px;max-width:440px;
          width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.22);
          animation:slideUp .3s ease;border-top:5px solid;}
        .db-modal.urgente{border-color:var(--red);}
        .db-modal.recomendada{border-color:var(--amber);}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .db-modal-icon{font-size:48px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;}
        .db-modal-icon svg{font-size:48px;}
        .db-modal h3{font-size:20px;font-weight:800;margin-bottom:10px;}
        .db-modal p{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:18px;}
        .db-modal-centros{background:#fef2f2;border:1px solid #fecaca;border-radius:12px;
          padding:13px 15px;display:flex;flex-direction:column;gap:8px;margin-bottom:18px;text-align:left;}
        .db-modal-centros span{font-size:13px;display:flex;align-items:center;gap:8px;}
        .db-modal-centros svg{font-size:16px;color:var(--red);flex-shrink:0;}
        .db-modal-centros strong{color:var(--red);}
        .db-modal-btn{background:linear-gradient(135deg,var(--p),var(--sky));color:#fff;
          border:none;border-radius:12px;padding:12px 28px;font-family:var(--font);
          font-size:14px;font-weight:800;cursor:pointer;transition:all .2s;}
        .db-modal-btn:hover{opacity:.9;transform:translateY(-1px);}

        /* ── Responsive ── */
        @media(max-width:1100px){
          .db-layout{grid-template-columns:1fr;}
          .db-sidebar{display:none;}
          .db-kpi-row{grid-template-columns:repeat(2,1fr);}
          .db-row-3{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:640px){
          .db-kpi-row{grid-template-columns:1fr 1fr;}
          .db-row-2,.db-row-3,.db-row-emo{grid-template-columns:1fr;}
          .db-content{padding:16px;}
          .db-topbar{padding:12px 16px;}
        }
      `}</style>

            <div className="db">
                <div className="db-layout">

                    {/* ── SIDEBAR ── */}
                    <aside className="db-sidebar">
                        <div className="db-brand">Study<em>Organizer</em></div>
                        <div className="db-nav-section">Principal</div>
                        <button className="db-nav-item active"><IoStatsChartOutline /> Dashboard</button>
                        <button className="db-nav-item"><IoHeartOutline /> Bienestar</button>
                        <button className="db-nav-item"><IoCalendarOutline /> Historial</button>
                        <div className="db-nav-section">Aprendizaje</div>
                        <button className="db-nav-item"><IoSchoolOutline /> Tests</button>
                        <button className="db-nav-item"><IoBookOutline /> Recursos</button>
                        <div className="db-nav-section">Cuenta</div>
                        <button className="db-nav-item"><IoPersonOutline /> Mi Perfil</button>
                        <div className="db-sidebar-bottom">
                            <div className="db-avatar-mini">
                                <div className="db-avatar-mini-pic">
                                    {fotoUsuario ? <img src={fotoUsuario} alt="p" /> : `${usuario?.nombre?.[0] || "U"}${usuario?.apellido?.[0] || ""}`}
                                </div>
                                <div className="db-avatar-mini-info">
                                    <strong>{nombreUsuario}</strong>
                                    <span>{rolUsuario}</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── MAIN ── */}
                    <div className="db-main">

                        {/* Topbar */}
                        <div className="db-topbar">
                            <div className="db-topbar-title">
                                <h1>{saludo}, {usuario?.nombre || "Usuario"} 👋</h1>
                                <p>Aquí está tu resumen emocional y académico de hoy</p>
                            </div>
                            <div className="db-topbar-right">
                                <span className="db-date-chip">
                                    {new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                                </span>
                                {alertas.length > 0 && (
                                    <button className="db-notif-btn" onClick={() => setAlertaActiva(alertas[0])}>
                                        <IoNotificationsOutline />
                                        <span className="db-notif-dot" />
                                    </button>
                                )}
                                <div className="db-avatar-mini" style={{ padding: "4px" }}>
                                    <div className="db-avatar-mini-pic" style={{ width: 36, height: 36, fontSize: 13 }}>
                                        {fotoUsuario ? <img src={fotoUsuario} alt="p" /> : `${usuario?.nombre?.[0] || "U"}${usuario?.apellido?.[0] || ""}`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="db-content">

                            {/* ── KPIs ── */}
                            <div className="db-kpi-row">
                                <div className="db-kpi" style={{ "--kpi-c": "#3b82f6", "--kpi-c2": "#0ea5e9", "--kpi-bg": "#eff6ff" }}>
                                    <div className="db-kpi-top">
                                        <div className="db-kpi-icon"><IoCalendarOutline /></div>
                                        <span className={`db-kpi-badge ${diasConRegistro >= 5 ? "up" : diasConRegistro >= 3 ? "neutral" : "down"}`}>
                                            {diasConRegistro >= 5 ? <IoChevronUpOutline /> : diasConRegistro >= 3 ? <IoRemoveOutline /> : <IoChevronDownOutline />}
                                            {diasConRegistro}/7
                                        </span>
                                    </div>
                                    <div><div className="db-kpi-val">{diasConRegistro}</div><div className="db-kpi-label">Días registrados esta semana</div></div>
                                    <div className="db-kpi-chart"><MiniBarChart data={miniBarData} color="#3b82f6" height={32} /></div>
                                </div>
                                <div className="db-kpi" style={{ "--kpi-c": "#22c55e", "--kpi-c2": "#86efac", "--kpi-bg": "#f0fdf4" }}>
                                    <div className="db-kpi-top">
                                        <div className="db-kpi-icon" style={{ background: "#f0fdf4", color: "#22c55e" }}><IoFlashOutline /></div>
                                        <span className={`db-kpi-badge ${rachaActual >= 3 ? "up" : "neutral"}`}>
                                            {rachaActual >= 3 ? <IoChevronUpOutline /> : <IoRemoveOutline />} racha
                                        </span>
                                    </div>
                                    <div><div className="db-kpi-val">{rachaActual}</div><div className="db-kpi-label">Días consecutivos activo</div></div>
                                    <div className="db-kpi-chart">
                                        <MiniBarChart data={ultimosDias.map(d => d.registro ? 1 : 0)} color="#22c55e" height={32} />
                                    </div>
                                </div>
                                <div className="db-kpi" style={{ "--kpi-c": "#6366f1", "--kpi-c2": "#a78bfa", "--kpi-bg": "#eef2ff" }}>
                                    <div className="db-kpi-top">
                                        <div className="db-kpi-icon" style={{ background: "#eef2ff", color: "#6366f1" }}><IoHeartOutline /></div>
                                        <span className="db-kpi-badge up"><IoChevronUpOutline />total</span>
                                    </div>
                                    <div><div className="db-kpi-val">{historial.length}</div><div className="db-kpi-label">Registros totales</div></div>
                                    <div className="db-kpi-chart">
                                        <DonutChart value={diasConRegistro} total={7} color="#6366f1" size={40} />
                                    </div>
                                </div>
                                <div className="db-kpi" style={{ "--kpi-c": "#f59e0b", "--kpi-c2": "#fbbf24", "--kpi-bg": "#fffbeb" }}>
                                    <div className="db-kpi-top">
                                        <div className="db-kpi-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}><IoStatsChartOutline /></div>
                                        <span className="db-kpi-badge neutral"><IoRemoveOutline />bienestar</span>
                                    </div>
                                    <div>
                                        <div className="db-kpi-val">
                                            {predominantes[0]
                                                ? <span style={{ fontSize: 16, fontWeight: 800 }}>{predominantes[0].nombre_emocion}</span>
                                                : "—"}
                                        </div>
                                        <div className="db-kpi-label">Emoción predominante</div>
                                    </div>
                                    <div className="db-kpi-chart">
                                        <MiniBarChart data={[distribucion.positiva, distribucion.neutra, distribucion.negativa, distribucion.critica].map(v => v)} color="#f59e0b" height={32} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Fila: Registro + Semana ── */}
                            <div className="db-row db-row-emo">
                                {/* Registro emocional */}
                                <div className="db-card">
                                    <div className="db-card-hd">
                                        <div><h2>¿Cómo te sientes hoy?</h2><p>Un registro por día</p></div>
                                        {registroHoy?.registrado && <span className="db-badge-ok"><IoCheckmarkCircle />Registrado</span>}
                                    </div>
                                    {registroHoy?.registrado ? (
                                        <>
                                            <div className="db-reg-ok" style={{ borderColor: colorCat[registroHoy.categoria] }}>
                                                <div className="db-reg-ok-icon" style={{ color: colorCat[registroHoy.categoria] }}>{iconoCat[registroHoy.categoria]}</div>
                                                <div>
                                                    <strong>{registroHoy.emocion}</strong>
                                                    <span style={{ color: colorCat[registroHoy.categoria] }}>{labelCat[registroHoy.categoria]}</span>
                                                </div>
                                            </div>
                                            <p className="db-reg-ok-msg"><IoLeafOutline />Vuelve mañana para el siguiente registro</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="db-emo-grid">
                                                {emociones.map(e => (
                                                    <button key={e.id_emocion} className={`db-emo-btn ${emocionSeleccionada === e.id_emocion ? "sel" : ""}`}
                                                        style={emocionSeleccionada === e.id_emocion ? { background: colorCat[e.categoria], borderColor: colorCat[e.categoria] } : {}}
                                                        onClick={() => { setEmocionSeleccionada(e.id_emocion); setMostrarInput(false); setEmocionNueva(""); }}>
                                                        {e.nombre_emocion}
                                                    </button>
                                                ))}
                                                <button className="db-emo-btn db-emo-otro" onClick={() => { setMostrarInput(true); setEmocionSeleccionada(null); }}>
                                                    <IoAddCircleOutline />Otra
                                                </button>
                                            </div>
                                            {mostrarInput && (
                                                <div className="db-inp-row">
                                                    <input type="text" placeholder="¿Cómo te sientes? (ej: optimista)" value={emocionNueva} maxLength={100}
                                                        onChange={e => setEmocionNueva(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && agregarEmocionPersonalizada()} autoFocus />
                                                    <button className="db-btn db-btn-prim" onClick={agregarEmocionPersonalizada}>Agregar</button>
                                                    <button className="db-btn db-btn-ghost" onClick={() => { setMostrarInput(false); setEmocionNueva(""); }}>Cancelar</button>
                                                </div>
                                            )}
                                            <button className="db-btn-reg" disabled={!emocionSeleccionada || loadingRegistro} onClick={registrarEmocionDelDia}>
                                                {loadingRegistro ? "Registrando..." : "Registrar emoción del día"}
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Semana */}
                                <div className="db-card">
                                    <div className="db-card-hd">
                                        <div><h2>Mi semana</h2><p>Últimos 7 días</p></div>
                                        <span className="db-chip" style={{ background: "#eff6ff", color: "#3b82f6" }}>{diasConRegistro} / 7</span>
                                    </div>
                                    <div className="db-week">
                                        {ultimosDias.map(({ iso, dia, num, registro }) => (
                                            <div key={iso} className="db-wd">
                                                <span className="db-wd-lbl">{dia}</span>
                                                <div className={`db-wd-circle ${registro ? "has" : ""}`}
                                                    style={registro ? { background: colorCat[registro.categoria] } : {}}
                                                    title={registro ? `${registro.nombre_emocion}` : "Sin registro"}>
                                                    {registro ? iconoCat[registro.categoria] : <span>{num}</span>}
                                                </div>
                                                {registro && <span className="db-wd-name">{registro.nombre_emocion}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* distribución mini */}
                                    <div style={{ marginTop: 20 }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Distribución histórica</p>
                                        <div className="db-dist-list">
                                            {[
                                                { key: "positiva", label: "Positiva" }, { key: "neutra", label: "Neutra" },
                                                { key: "negativa", label: "Negativa" }, { key: "critica", label: "Crítica" }
                                            ].map(({ key, label }) => (
                                                <div key={key} className="db-dist-item">
                                                    <div className="db-dist-top">
                                                        <span className="db-dist-name">
                                                            <span className="db-dist-dot" style={{ background: colorCat[key] }} />{label}
                                                        </span>
                                                        <span className="db-dist-pct">{Math.round((distribucion[key] / totalHist) * 100)}%</span>
                                                    </div>
                                                    <div className="db-dist-track">
                                                        <div className="db-dist-fill"
                                                            style={{ width: `${(distribucion[key] / totalHist) * 100}%`, background: colorCat[key] }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Fila: Frase + Predominantes + Tests ── */}
                            <div className="db-row db-row-3">
                                {/* Frase */}
                                <div className="db-card db-frase-card">
                                    <div className="db-frase-tag"><IoSparklesOutline />Frase del día</div>
                                    <div className="db-frase-txt">
                                        {frase ? `"${frase}"` : registroHoy?.registrado === false
                                            ? "Registra tu emoción del día para obtener tu frase personalizada"
                                            : "Cargando tu frase..."}
                                    </div>
                                    {!registroHoy?.registrado && (
                                        <p className="db-frase-hint"><IoSparklesOutline />Registra cómo te sientes para ver tu frase</p>
                                    )}
                                </div>

                                {/* Predominantes */}
                                <div className="db-card">
                                    <div className="db-card-hd">
                                        <div><h2>Top emociones</h2><p>Todo el historial</p></div>
                                    </div>
                                    {predominantes.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: 13 }}>
                                            <IoStatsChartOutline style={{ fontSize: 32, marginBottom: 6, display: "block", margin: "0 auto 6px" }} />
                                            Aún no hay registros suficientes
                                        </div>
                                    ) : (
                                        <div className="db-pred-list">
                                            {predominantes.map((p, i) => (
                                                <div key={i} className="db-pred-item">
                                                    <span className="db-pred-rank">#{i + 1}</span>
                                                    <div className="db-pred-icon" style={{ background: bgCat[p.categoria], color: colorCat[p.categoria] }}>
                                                        {iconoCat[p.categoria]}
                                                    </div>
                                                    <div className="db-pred-body">
                                                        <div className="db-pred-name">{p.nombre_emocion}</div>
                                                        <div className="db-pred-bar-wrap">
                                                            <div className="db-pred-track">
                                                                <div className="db-pred-fill" style={{ width: `${p.porcentaje}%`, background: colorCat[p.categoria] }} />
                                                            </div>
                                                            <span className="db-pred-pct">{p.porcentaje}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tests + Perfil */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <div className="db-card">
                                        <div className="db-card-hd">
                                            <div><h2>Mis Tests</h2><p>Estilos de aprendizaje</p></div>
                                        </div>
                                        <div className="db-test-item">
                                            <div className="db-test-icon-wrap"><IoSchoolOutline /></div>
                                            <div className="db-test-body"><strong>Estilo de aprendizaje</strong><span>Sin realizar</span></div>
                                            <button className="db-test-cta">Iniciar</button>
                                        </div>
                                        <div className="db-test-item">
                                            <div className="db-test-icon-wrap"><IoBookOutline /></div>
                                            <div className="db-test-body"><strong>Métodos de estudio</strong><span>Sin realizar</span></div>
                                            <button className="db-test-cta">Iniciar</button>
                                        </div>
                                    </div>
                                    <div className="db-card">
                                        <div className="db-perfil">
                                            <div className="db-perfil-pic">
                                                {fotoUsuario ? <img src={fotoUsuario} alt="p" /> : `${usuario?.nombre?.[0] || "U"}${usuario?.apellido?.[0] || ""}`}
                                            </div>
                                            <div className="db-perfil-info">
                                                <strong>{nombreUsuario}</strong>
                                                <span>{rolUsuario}</span>
                                                {usuario?.descripcion && <p>{usuario.descripcion}</p>}
                                            </div>
                                            <span className="db-perfil-badge">Ver perfil</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>{/* /content */}
                    </div>{/* /main */}
                </div>{/* /layout */}
            </div>

            {/* ── MODAL ALERTA ── */}
            {alertaActiva && (
                <div className="db-overlay">
                    <div className={`db-modal ${alertaActiva.tipo === "atencion_urgente" ? "urgente" : "recomendada"}`}>
                        <div className="db-modal-icon">
                            {alertaActiva.tipo === "atencion_urgente"
                                ? <IoAlertCircle style={{ color: "#ef4444" }} />
                                : <IoAlertCircleOutline style={{ color: "#f59e0b" }} />}
                        </div>
                        <h3>{alertaActiva.tipo === "atencion_urgente" ? "Atención Urgente" : "Atención Recomendada"}</h3>
                        <p>{alertaActiva.mensaje}</p>
                        {alertaActiva.tipo === "atencion_urgente" && (
                            <div className="db-modal-centros">
                                <span><IoCallOutline />Línea de Crisis: <strong>800 290 0024</strong></span>
                                <span><IoMedkitOutline />IMSS / ISSSTE / Centro de Salud más cercano</span>
                            </div>
                        )}
                        <button className="db-modal-btn" onClick={() => cerrarAlerta(alertaActiva.id_alerta)}>Entendido</button>
                    </div>
                </div>
            )}
        </>
    );
}