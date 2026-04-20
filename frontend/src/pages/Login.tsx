import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, LogIn, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { login as apiLogin } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let af: number;
    const pts: Array<{x:number;y:number;vx:number;vy:number;r:number;a:number}> = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 80; i++) pts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, r:Math.random()*2+.5, a:Math.random()*.4+.1 });
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1;
        if(p.y<0||p.y>canvas.height) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(59,130,246,${p.a})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(59,130,246,${.08*(1-d/120)})`;ctx.lineWidth=.7;ctx.stroke();}
      }
      af=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(af); window.removeEventListener("resize",resize); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiLogin({ username, password });
      login(data.token, data.user);
      navigate("/");
    } catch (e: any) { setError(e.message || "Authentication failed"); }
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center p-4 relative overflow-hidden font-['DM_Sans',sans-serif]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Blue accent shape */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-[#0d1f3c] hidden lg:block z-0">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40">
            <Truck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-4">Haulage<br />TMS</h2>
          <p className="text-blue-200/40 text-sm leading-relaxed">Enterprise Fleet & Logistics Management Platform</p>
          <div className="mt-12 space-y-3 w-full">
            {["Fleet Tracking", "Driver Management", "Live Dispatch"].map(f => (
              <div key={f} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-blue-100/60 text-xs font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 w-full max-w-md lg:ml-[33%] lg:pl-16"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-8 border border-blue-100">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#0d1f3c] tracking-tight">Welcome back</h1>
            <p className="text-sm text-blue-400/60 mt-1">Sign in to your dispatcher account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-6 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Username</label>
              <input required value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                placeholder="dispatcher_01" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
              <LogIn size={15} /> Sign In
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-blue-400/60">
            No account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
