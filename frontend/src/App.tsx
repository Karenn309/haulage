import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Truck, Users, Briefcase, LayoutDashboard, Menu, Bell, LogOut, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Dashboard from "./pages/Dashboard";
import Trucks from "./pages/Trucks";
import Drivers from "./pages/Drivers";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f0f4ff]">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-blue-600 text-sm font-semibold tracking-wide">Initializing...</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f4ff] overflow-hidden font-['DM_Sans',sans-serif]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f0f4ff]">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/trucks" element={<ProtectedRoute><Trucks /></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const location = useLocation();
  const navItems = [
    { title: "Overview", path: "/", icon: LayoutDashboard },
    { title: "Trucks", path: "/trucks", icon: Truck },
    { title: "Drivers", path: "/drivers", icon: Users },
    { title: "Deliveries", path: "/jobs", icon: Briefcase },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 248 : 0, opacity: isOpen ? 1 : 0 }}
      className="bg-[#0d1f3c] flex flex-col h-full relative overflow-hidden shadow-xl shadow-blue-900/20 z-10"
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/40">
          <Truck size={17} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none tracking-tight">Haulage TMS</p>
          <p className="text-blue-400/50 text-[9px] uppercase tracking-widest mt-0.5">Fleet Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-blue-400/30 text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-2 mb-1">Navigation</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group",
                isActive
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : "text-blue-200/40 hover:text-blue-100 hover:bg-white/5"
              )}
            >
              <item.icon size={16} className={isActive ? "text-white" : "opacity-60 group-hover:opacity-100"} />
              <span className="whitespace-nowrap">{item.title}</span>
              {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 m-3 rounded-xl bg-green-500/5 border border-green-500/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">System Online</span>
        </div>
        <p className="text-white/20 text-[9px]">All services operational</p>
      </div>
    </motion.aside>
  );
}

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const titles: Record<string, string> = {
    "/": "Operational Overview",
    "/trucks": "Truck Management",
    "/drivers": "Driver Management",
    "/jobs": "Delivery Management",
  };

  return (
    <header className="h-15 border-b border-blue-100/60 flex items-center justify-between px-6 bg-white shadow-sm z-10" style={{minHeight: 60}}>
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-blue-50 transition-colors rounded-lg text-blue-400 hover:text-blue-600">
          <Menu size={18} />
        </button>
        <div className="h-5 w-px bg-blue-100" />
        <div>
          <h2 className="text-sm font-bold text-[#0d1f3c] tracking-tight">{titles[location.pathname] || "Dashboard"}</h2>
          <p className="text-[10px] text-blue-400/60 font-medium uppercase tracking-widest">Haulage TMS</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-blue-50 transition-colors rounded-lg text-blue-400">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>
        <div className="h-5 w-px bg-blue-100" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase">
            {user?.username?.[0] || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-[#0d1f3c] leading-none capitalize">{user?.username}</p>
            <p className="text-[10px] text-blue-400/60 uppercase tracking-widest mt-0.5">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 text-blue-300 hover:text-red-400 transition-colors rounded-lg"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
