import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Truck, Shield, BarChart3, Users, Package, ChevronRight, MapPin, Clock, CheckCircle } from "lucide-react";

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number; r: number; alpha: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const features = [
    { icon: Truck, title: "Fleet Management", desc: "Register, track and manage your entire truck fleet with real-time status updates and capacity monitoring." },
    { icon: Users, title: "Driver Operations", desc: "Maintain driver profiles, license tracking, and prevent scheduling conflicts with active job detection." },
    { icon: Package, title: "Job Dispatch", desc: "Create and assign delivery jobs with intelligent truck and driver availability filtering." },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time KPI cards and charts giving you complete operational visibility at a glance." },
    { icon: Shield, title: "Secure Access", desc: "JWT-based authentication with role management keeps your operations data protected." },
    { icon: MapPin, title: "Location Tracking", desc: "Monitor pickup and delivery locations, cargo descriptions, and full job lifecycle management." },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<100ms", label: "API Response" },
    { value: "∞", label: "Scalable Jobs" },
    { value: "24/7", label: "Operations" },
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] font-['DM_Sans',sans-serif] overflow-x-hidden">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Truck size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">Haulage TMS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-blue-200/60 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Performance</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-blue-200/70 hover:text-white transition-colors font-medium px-4 py-2">
            Sign In
          </Link>
          <Link to="/register" className="text-sm bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-28 pb-24 px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Enterprise Logistics Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
          Fleet Operations
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Reimagined
          </span>
        </h1>

        <p className="text-lg text-blue-100/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          A professional haulage management system for real-time truck dispatch, driver assignment, and delivery lifecycle management — built for serious logistics operations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-blue-500/30 text-sm tracking-wide">
            Launch Dashboard <ChevronRight size={16} />
          </Link>
          <Link to="/login" className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm">
            Sign In to Account
          </Link>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-gradient-to-b from-blue-900/20 to-blue-950/40 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-sm">
            <div className="bg-[#0d1f3c] rounded-xl p-6 text-left">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 size={14} className="text-blue-400" />
                  </div>
                  <span className="text-white/80 text-sm font-semibold">Operational Overview</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-mono">LIVE</span>
                </div>
              </div>
              {/* Mock stat cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Available Trucks", val: "12", color: "text-green-400", bg: "bg-green-500/10" },
                  { label: "Active Jobs", val: "7", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Completed Today", val: "24", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-white/5`}>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Mock table rows */}
              <div className="space-y-2">
                {[
                  { id: "JB-001", cargo: "Industrial Equipment", status: "In Transit", color: "text-blue-400 bg-blue-500/10" },
                  { id: "JB-002", cargo: "Perishable Goods", status: "Pending", color: "text-yellow-400 bg-yellow-500/10" },
                  { id: "JB-003", cargo: "Construction Materials", status: "Completed", color: "text-green-400 bg-green-500/10" },
                ].map(row => (
                  <div key={row.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-4 py-2.5">
                    <span className="font-mono text-[11px] text-white/30">{row.id}</span>
                    <span className="text-xs text-white/60">{row.cargo}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${row.color}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-blue-300/50 text-xs uppercase tracking-widest font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need</h2>
          <p className="text-blue-200/40 max-w-xl mx-auto text-sm leading-relaxed">A complete logistics management suite designed for enterprise haulage operations.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-blue-500/20 rounded-xl p-6 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center mb-5 group-hover:bg-blue-500/25 transition-colors">
                <f.icon size={20} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2 tracking-tight">{f.title}</h3>
              <p className="text-blue-200/40 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="relative z-10 py-24 px-8 text-center">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-blue-900/30 to-blue-950/20 border border-blue-500/10 rounded-2xl p-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[CheckCircle, Clock, MapPin].map((Icon, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Icon size={16} className="text-blue-400" />
              </div>
            ))}
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Ready to Optimize Your Fleet?</h2>
          <p className="text-blue-200/40 text-sm mb-8 leading-relaxed">Join logistics companies that trust Haulage TMS for mission-critical delivery operations.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/20 text-sm">
            Create Free Account <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
              <Truck size={12} className="text-white" />
            </div>
            <span className="text-white/40 text-xs font-semibold">Haulage TMS</span>
          </div>
          <p className="text-white/20 text-xs">Enterprise Logistics Management System © 2026</p>
        </div>
      </footer>
    </div>
  );
}
