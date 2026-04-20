import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { register } from "../lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    try {
      await register({ username, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (e: any) { setError(e.message || "Registration failed"); }
  };

  return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center p-4 relative font-['DM_Sans',sans-serif]">
      {/* Blue panel */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0d1f3c] hidden lg:flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40">
          <Truck size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Join Our<br />Platform</h2>
        <p className="text-blue-200/40 text-sm leading-relaxed">Register to start managing your fleet with enterprise-grade tools.</p>
      </div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="relative z-10 w-full max-w-md lg:mr-[33%] lg:pr-16">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 p-8 border border-blue-100">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#0d1f3c] tracking-tight">Create Account</h1>
            <p className="text-sm text-blue-400/60 mt-1">Register as a dispatcher</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-5 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-xs mb-5 flex items-center gap-2">
              <CheckCircle size={14} /> Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Username", val: username, set: setUsername, type: "text", ph: "e.g. dispatcher_new" },
              { label: "Password", val: password, set: setPassword, type: "password", ph: "••••••••" },
              { label: "Confirm Password", val: confirm, set: setConfirm, type: "password", ph: "••••••••" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">{f.label}</label>
                <input required type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
            ))}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
              <UserPlus size={15} /> Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-blue-400/60">
            Already registered? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
