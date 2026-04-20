import { motion } from "motion/react";
import { Plus, Search, Briefcase, Edit3, Trash2, Download, MapPin, Package, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchJobs, fetchTrucks, fetchDrivers, createJob, updateJobStatus, deleteJob, updateJob } from "../lib/api";
import ConfirmationModal from "../components/ConfirmationModal";

interface Job {
  id: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoDescription: string;
  status: "Pending" | "In Transit" | "Completed";
  assignedTruckId: string | null;
  assignedDriverId: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string; next?: string; nextLabel?: string; nextStyle?: string }> = {
  Pending: {
    label: "Pending",
    style: "text-amber-700 bg-amber-50 border-amber-200",
    next: "In Transit",
    nextLabel: "Dispatch",
    nextStyle: "text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200",
  },
  "In Transit": {
    label: "In Transit",
    style: "text-blue-700 bg-blue-50 border-blue-200",
    next: "Completed",
    nextLabel: "Mark Done",
    nextStyle: "text-green-600 bg-green-50 hover:bg-green-100 border border-green-200",
  },
  Completed: { label: "Completed", style: "text-green-700 bg-green-50 border-green-200" },
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortCol, setSortCol] = useState<keyof Job>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async (p = page, search = searchTerm) => {
    setIsLoading(true);
    try {
      const [jData, t, d] = await Promise.all([fetchJobs(p, pageSize, search), fetchTrucks(1, 100), fetchDrivers(1, 100)]);
      setJobs(jData.items);
      setTotal(jData.total);
      setTrucks(t.items);
      setDrivers(d.items);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(page, searchTerm); }, [page, pageSize]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try { await updateJobStatus(id, newStatus); await loadData(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteJob(id); loadData(); } catch (e) { console.error(e); }
  };

  const handleSort = (col: keyof Job) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const filtered = jobs
    .filter(j =>
      (j.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
       j.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
       j.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" || j.status === statusFilter)
    );

  const exportCSV = () => {
    const rows = [["ID","Cargo","Pickup","Delivery","Status","Truck","Driver","Created"],
      ...filtered.map(j => {
        const truck = trucks.find(t => t.id === j.assignedTruckId);
        const driver = drivers.find(d => d.id === j.assignedDriverId);
        return [j.id, j.cargoDescription, j.pickupLocation, j.deliveryLocation, j.status, truck?.registrationNumber || "", driver?.name || "", j.createdAt];
      })
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "jobs.csv"; a.click();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0d1f3c] tracking-tight">Delivery Management</h1>
          <p className="text-sm text-blue-400/70 mt-0.5">Create, assign and track all delivery jobs</p>
        </div>
        <button onClick={() => { setEditJob(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/20">
          <Plus size={15} /> New Delivery Job
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {["All", "Pending", "In Transit", "Completed"].map(s => {
          const count = s === "All" ? total : jobs.filter(j => j.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === s ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-blue-400 border-blue-100 hover:border-blue-300"
              }`}>
              {s} <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === s ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
            <input type="text" placeholder="Search cargo, locations..."
              value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); loadData(1, e.target.value); }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-blue-50/50 border border-blue-100 rounded-lg text-[#0d1f3c] placeholder:text-blue-300 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium">
              <Download size={13} /> Export CSV
            </button>
            <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}
              className="text-xs border border-blue-100 rounded-lg px-2 py-2 text-blue-600 bg-white focus:outline-none">
              {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f0f4ff] border-b border-blue-100">
                {[
                  { label: "Job ID", col: "id" as keyof Job },
                  { label: "Cargo", col: "cargoDescription" as keyof Job },
                  { label: "Route", col: "pickupLocation" as keyof Job },
                  { label: "Truck", col: "assignedTruckId" as keyof Job },
                  { label: "Driver", col: "assignedDriverId" as keyof Job },
                  { label: "Status", col: "status" as keyof Job },
                ].map(h => (
                  <th key={h.col} onClick={() => handleSort(h.col)}
                    className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-blue-400/70 cursor-pointer hover:text-blue-600 select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      {h.label}
                      {sortCol === h.col && <span className="text-blue-500">{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                ))}
                <th className="text-right px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-blue-400/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map((job, i) => {
                const truck = trucks.find(t => t.id === job.assignedTruckId);
                const driver = drivers.find(d => d.id === job.assignedDriverId);
                const statusCfg = STATUS_CONFIG[job.status];
                return (
                  <motion.tr key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-4 py-4">
                      <span className="font-mono text-[10px] text-blue-300 bg-blue-50 px-2 py-0.5 rounded">#{job.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-4 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Package size={12} className="text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold text-[#0d1f3c] truncate">{job.cargoDescription}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-[#0d1f3c]/60">
                          <MapPin size={9} className="text-green-400 shrink-0" />
                          <span className="truncate max-w-[100px]">{job.pickupLocation}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#0d1f3c]/60">
                          <MapPin size={9} className="text-red-400 shrink-0" />
                          <span className="truncate max-w-[100px]">{job.deliveryLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{truck?.registrationNumber || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                          {driver?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-[#0d1f3c]/70 truncate max-w-[90px]">{driver?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex ${statusCfg.style}`}>
                          {statusCfg.label}
                        </span>
                        {statusCfg.next && (
                          <button onClick={() => handleStatusUpdate(job.id, statusCfg.next!)}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg transition-all ${statusCfg.nextStyle}`}>
                            {statusCfg.nextLabel}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditJob(job); setIsModalOpen(true); }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-300 hover:text-blue-600 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(job.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-blue-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="py-16 text-center">
            <Briefcase size={32} className="text-blue-100 mx-auto mb-3" />
            <p className="text-sm text-blue-300 font-medium">No jobs found</p>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-blue-50 bg-[#f0f4ff]/50">
          <p className="text-xs text-blue-400/60">
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of <span className="font-bold text-[#0d1f3c]">{total}</span> jobs
          </p>
          <div className="flex gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-blue-100 rounded-lg text-blue-500 disabled:opacity-30 hover:bg-blue-50 transition-all">
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === p ? "bg-blue-600 text-white shadow-sm" : "border border-blue-100 text-blue-400 hover:bg-blue-50"}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-blue-100 rounded-lg text-blue-500 disabled:opacity-30 hover:bg-blue-50 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && <JobModal editData={editJob} onClose={() => setIsModalOpen(false)} onAdd={loadData} trucks={trucks} drivers={drivers} jobs={jobs} />}
      <ConfirmationModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Job" message="Permanently delete this delivery job?" confirmText="Delete" />
    </motion.div>
  );
}

function JobModal({ onClose, onAdd, trucks, drivers, jobs, editData }: { onClose: () => void; onAdd: () => void; trucks: any[]; drivers: any[]; jobs: any[]; editData?: Job | null }) {
  const [form, setForm] = useState({
    pickupLocation: editData?.pickupLocation || "",
    deliveryLocation: editData?.deliveryLocation || "",
    cargoDescription: editData?.cargoDescription || "",
    truckId: editData?.assignedTruckId || "",
    driverId: editData?.assignedDriverId || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trucksWithActiveJobs = new Set(jobs.filter(j => j.status !== "Completed" && (!editData || j.id !== editData.id)).map(j => j.assignedTruckId));
  const availableTrucks = trucks.filter(t => (t.status === "Available" && !trucksWithActiveJobs.has(t.id)) || (editData && t.id === editData.assignedTruckId));
  const driversWithActiveJobs = new Set(jobs.filter(j => j.status !== "Completed" && (!editData || j.id !== editData.id)).map(j => j.assignedDriverId));
  const availableDrivers = drivers.filter(d => !driversWithActiveJobs.has(d.id) || (editData && d.id === editData.assignedDriverId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.truckId || !form.driverId) { setError("Please select a truck and driver."); return; }
    setError(null); setLoading(true);
    try {
      if (editData) await updateJob(editData.id, form);
      else await createJob(form);
      onAdd(); onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save job.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1f3c]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-blue-300 hover:text-blue-600 transition-colors z-10">
          <Plus className="rotate-45" size={22} />
        </button>
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0d1f3c]">{editData ? "Edit Job" : "Create Delivery Job"}</h2>
            <p className="text-[10px] text-blue-400/50 uppercase tracking-widest">Delivery Management</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-5 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Cargo Description</label>
            <textarea required value={form.cargoDescription} onChange={e => setForm({...form, cargoDescription: e.target.value})}
              className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none h-20"
              placeholder="Describe the cargo..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">
                <MapPin size={10} className="inline mr-1 text-green-400" />Pickup Location
              </label>
              <input required value={form.pickupLocation} onChange={e => setForm({...form, pickupLocation: e.target.value})}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                placeholder="Terminal A" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">
                <MapPin size={10} className="inline mr-1 text-red-400" />Delivery Location
              </label>
              <input required value={form.deliveryLocation} onChange={e => setForm({...form, deliveryLocation: e.target.value})}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                placeholder="Warehouse B" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Assigned Truck</label>
              <select value={form.truckId} onChange={e => setForm({...form, truckId: e.target.value})}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none">
                <option value="">Select truck...</option>
                {availableTrucks.map(t => <option key={t.id} value={t.id}>{t.registrationNumber} ({t.capacity} MT)</option>)}
              </select>
              {availableTrucks.length === 0 && <p className="text-[10px] text-amber-500 mt-1">No trucks available</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Assigned Driver</label>
              <select value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})}
                className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none">
                <option value="">Select driver...</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {availableDrivers.length === 0 && <p className="text-[10px] text-amber-500 mt-1">No drivers available</p>}
            </div>
          </div>
          <button disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md shadow-blue-600/20 mt-2">
            {loading ? "Saving..." : (editData ? "Update Job" : "Create Job")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
