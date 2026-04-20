import { motion } from "motion/react";
import { Plus, Search, Truck as TruckIcon, Edit3, Trash2, Download, Upload, Filter } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { fetchTrucks, createTruck, deleteTruck, updateTruck } from "../lib/api";
import ConfirmationModal from "../components/ConfirmationModal";

interface Truck {
  id: string;
  registrationNumber: string;
  capacity: number;
  status: "Available" | "In Transit" | "Maintenance";
  createdAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Available: "text-green-700 bg-green-50 border-green-200",
  "In Transit": "text-blue-700 bg-blue-50 border-blue-200",
  Maintenance: "text-red-700 bg-red-50 border-red-200",
};

export default function Trucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTruck, setEditTruck] = useState<Truck | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortCol, setSortCol] = useState<keyof Truck>("registrationNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadTrucks = async (p = page) => {
    try {
      const data = await fetchTrucks(p, pageSize);
      setTrucks(data.items);
      setTotal(data.total);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadTrucks(page); }, [page, pageSize]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTruck(id);
      loadTrucks();
    } catch (e) { console.error(e); }
  };

  const handleSort = (col: keyof Truck) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const filtered = trucks
    .filter(t =>
      t.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "All" || t.status === statusFilter)
    )
    .sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const exportCSV = () => {
    const rows = [["ID","Registration","Capacity (MT)","Status"], ...filtered.map(t => [t.id, t.registrationNumber, t.capacity, t.status])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "trucks.csv"; a.click();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0d1f3c] tracking-tight">Truck Fleet</h1>
          <p className="text-sm text-blue-400/70 mt-0.5">Register and manage your entire vehicle fleet</p>
        </div>
        <button onClick={() => { setEditTruck(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/20">
          <Plus size={15} /> Register Truck
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
            <input
              type="text" placeholder="Search registration..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-blue-50/50 border border-blue-100 rounded-lg text-[#0d1f3c] placeholder:text-blue-300 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-blue-300" />
            {["All", "Available", "In Transit", "Maintenance"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-400 border-blue-100 hover:border-blue-300"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all font-medium">
              <Download size={13} /> Export CSV
            </button>
            <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}
              className="text-xs border border-blue-100 rounded-lg px-2 py-2 text-blue-600 bg-white focus:outline-none focus:border-blue-400">
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
                  { label: "Truck ID", col: "id" as keyof Truck },
                  { label: "Registration", col: "registrationNumber" as keyof Truck },
                  { label: "Capacity", col: "capacity" as keyof Truck },
                  { label: "Status", col: "status" as keyof Truck },
                ].map(h => (
                  <th key={h.col} onClick={() => handleSort(h.col)}
                    className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-blue-400/70 cursor-pointer hover:text-blue-600 select-none">
                    <span className="flex items-center gap-1">
                      {h.label}
                      {sortCol === h.col && <span className="text-blue-500">{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                ))}
                <th className="text-right px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-blue-400/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {filtered.map((truck, i) => (
                <motion.tr key={truck.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-mono text-[10px] text-blue-300 bg-blue-50 px-2 py-0.5 rounded">#{truck.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <TruckIcon size={13} className="text-blue-500" />
                      </div>
                      <span className="text-sm font-bold text-[#0d1f3c]">{truck.registrationNumber}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-[#0d1f3c]/70 font-medium">{truck.capacity} <span className="text-[10px] text-blue-300 uppercase">MT</span></span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_COLORS[truck.status]}`}>
                      {truck.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditTruck(truck); setIsModalOpen(true); }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-300 hover:text-blue-600 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(truck.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-blue-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <TruckIcon size={32} className="text-blue-100 mx-auto mb-3" />
            <p className="text-sm text-blue-300 font-medium">No trucks found</p>
            <p className="text-[11px] text-blue-200 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-blue-50 bg-[#f0f4ff]/50">
          <p className="text-xs text-blue-400/60">
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of <span className="font-bold text-[#0d1f3c]">{total}</span> trucks
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

      {isModalOpen && <TruckModal editData={editTruck} onClose={() => setIsModalOpen(false)} onAdd={loadTrucks} />}
      <ConfirmationModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Truck" message="Are you sure you want to permanently delete this truck?" confirmText="Delete" />
    </motion.div>
  );
}

function TruckModal({ onClose, onAdd, editData }: { onClose: () => void; onAdd: () => void; editData?: Truck | null }) {
  const [form, setForm] = useState({
    registrationNumber: editData?.registrationNumber || "",
    capacity: editData?.capacity || 20,
    status: editData?.status || "Available",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (editData) await updateTruck(editData.id, form);
      else await createTruck(form);
      onAdd(); onClose();
    } catch (e: any) {
      setError(e.message || "Operation failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1f3c]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-blue-300 hover:text-blue-600 transition-colors">
          <Plus className="rotate-45" size={22} />
        </button>
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <TruckIcon size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0d1f3c]">{editData ? "Edit Truck" : "Register Truck"}</h2>
            <p className="text-[10px] text-blue-400/50 uppercase tracking-widest">Fleet Management</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Registration Number</label>
            <input required value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})}
              className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              placeholder="e.g. TX-9922-A" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Capacity (Metric Tonnes)</label>
            <input required type="number" value={form.capacity} onChange={e => setForm({...form, capacity: +e.target.value})}
              className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-400/70 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}
              className="w-full bg-blue-50/30 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none">
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <button disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md shadow-blue-600/20">
            {loading ? "Saving..." : (editData ? "Update Truck" : "Register Truck")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
