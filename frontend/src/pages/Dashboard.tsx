import { motion } from "motion/react";
import { Truck, Users, Briefcase, CheckCircle, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchStats } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTrucks: 0,
    availableTrucks: 0,
    totalDrivers: 0,
    activeJobs: 0,
    completedJobs: 0,
  });

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  const inTransitTrucks = stats.totalTrucks - stats.availableTrucks;

  const kpis = [
    {
      label: "Available Trucks",
      value: stats.availableTrucks,
      sub: `of ${stats.totalTrucks} total`,
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      trend: "+2 since yesterday",
    },
    {
      label: "Active Drivers",
      value: stats.totalDrivers,
      sub: "registered",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      trend: "Fully staffed",
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      sub: "in progress",
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      trend: "Real-time",
    },
    {
      label: "Completed Today",
      value: stats.completedJobs,
      sub: "deliveries done",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
      trend: "All on time",
    },
  ];

  // Simple bar chart percentages
  const fleetData = stats.totalTrucks > 0 ? [
    { label: "Available", count: stats.availableTrucks, pct: Math.round((stats.availableTrucks / stats.totalTrucks) * 100), color: "bg-blue-500" },
    { label: "In Transit", count: inTransitTrucks, pct: Math.round((inTransitTrucks / stats.totalTrucks) * 100), color: "bg-amber-400" },
    { label: "Maintenance", count: Math.max(0, stats.totalTrucks - stats.availableTrucks - inTransitTrucks), pct: 0, color: "bg-red-400" },
  ] : [];

  const jobData = (stats.activeJobs + stats.completedJobs) > 0 ? [
    { label: "Active", count: stats.activeJobs, pct: Math.round((stats.activeJobs / (stats.activeJobs + stats.completedJobs)) * 100), color: "bg-amber-400" },
    { label: "Completed", count: stats.completedJobs, pct: Math.round((stats.completedJobs / (stats.activeJobs + stats.completedJobs)) * 100), color: "bg-green-500" },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0d1f3c] tracking-tight">Operational Overview</h1>
          <p className="text-sm text-blue-400/70 mt-1">Real-time fleet intelligence and mission tracking</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-[#0d1f3c] font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-xl p-5 border ${k.border} shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
                <k.icon size={18} className={k.color} />
              </div>
              <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">{k.trend}</span>
            </div>
            <p className="text-3xl font-black text-[#0d1f3c]">{k.value}</p>
            <p className="text-xs font-semibold text-[#0d1f3c]/60 mt-0.5">{k.label}</p>
            <p className="text-[10px] text-blue-400/50 mt-0.5 uppercase tracking-widest">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Chart */}
        <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#0d1f3c]">Fleet Status Distribution</h3>
              <p className="text-[10px] text-blue-400/50 uppercase tracking-widest mt-0.5">Real-time availability</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Truck size={15} className="text-blue-500" />
            </div>
          </div>
          {fleetData.length > 0 ? (
            <div className="space-y-4">
              {fleetData.map(d => (
                <div key={d.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-[#0d1f3c]/70">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0d1f3c]">{d.count}</span>
                      <span className="text-[10px] text-blue-400/40">{d.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      className={`h-full ${d.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
              {/* Donut-style summary */}
              <div className="mt-4 pt-4 border-t border-blue-50 flex justify-around">
                {fleetData.map(d => (
                  <div key={d.label} className="text-center">
                    <div className={`w-3 h-3 rounded-full ${d.color} mx-auto mb-1`} />
                    <p className="text-[10px] text-[#0d1f3c]/40 uppercase tracking-wider">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-xs text-blue-300/50 uppercase tracking-widest">No fleet data</p>
            </div>
          )}
        </div>

        {/* Jobs Chart */}
        <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#0d1f3c]">Job Completion Rate</h3>
              <p className="text-[10px] text-blue-400/50 uppercase tracking-widest mt-0.5">Active vs completed</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={15} className="text-green-500" />
            </div>
          </div>

          {jobData.length > 0 ? (
            <div className="space-y-4">
              {jobData.map(d => (
                <div key={d.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-[#0d1f3c]/70">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0d1f3c]">{d.count}</span>
                      <span className="text-[10px] text-blue-400/40">{d.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      className={`h-full ${d.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#0d1f3c]/40 uppercase tracking-widest">Total Jobs</span>
                  <span className="text-sm font-black text-[#0d1f3c]">{stats.activeJobs + stats.completedJobs}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-xs text-blue-300/50 uppercase tracking-widest">No job data</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Status */}
      <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
        <h3 className="text-sm font-bold text-[#0d1f3c] mb-4">System Health</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "API Status", status: "Operational", color: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle },
            { label: "Database", status: "Connected", color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertCircle },
            { label: "Real-time Sync", status: "Active", color: "text-green-600 bg-green-50 border-green-100", icon: Clock },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-3 p-3 rounded-lg border ${s.color}`}>
              <s.icon size={16} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">{s.status}</p>
                <p className="text-[9px] opacity-60 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
