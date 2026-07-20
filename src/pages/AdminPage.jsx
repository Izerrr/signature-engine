import { useState, useEffect } from "react";
import { Download, ShieldCheck, LogOut, Sun, Moon, Database, RefreshCw, Trash2, Edit3, X, Check } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  // State untuk Fitur Edit & Delete
  const [editingItem, setEditingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    console.log("Cek Token Admin:", import.meta.env.VITE_ADMIN_TOKEN);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.from("signature_logs").select("*").order("created_at", { ascending: false });

      if (err) throw err;
      setLogs(data || []);
    } catch (e) {
      setError(e.message || "Gagal mengambil log tanda tangan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const secureToken = import.meta.env.VITE_ADMIN_TOKEN;

    if (password === secureToken) {
      setIsAuthenticated(true);
      fetchLogs();
    } else {
      alert("Token Akses Salah.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setLogs([]);
  };

  // --- LOGIKA HAPUS (STORAGE + DB) ---
  const handleDelete = async (log) => {
    if (!window.confirm(`Yakin ingin menghapus data & video milik "${log.nama}"?`)) return;

    try {
      // 1. Ekstrak path file di Storage
      let filePath = log.file_path;
      if (!filePath && log.video_url) {
        const parts = log.video_url.split("/signatures/");
        if (parts.length > 1) filePath = parts[1];
      }

      // 2. Hapus file di Storage jika path ketemu
      if (filePath) {
        const { error: storageErr } = await supabase.storage.from("signatures").remove([filePath]);
        if (storageErr) console.warn("Storage Delete Warning:", storageErr.message);
      }

      // 3. Hapus row di Database Table
      const { error: dbErr } = await supabase.from("signature_logs").delete().eq("id", log.id);
      if (dbErr) throw dbErr;

      // 4. Update State Lokal (UI langsung bersih tanpa reload)
      setLogs((prev) => prev.filter((item) => item.id !== log.id));
    } catch (e) {
      alert("Gagal menghapus: " + e.message);
    }
  };

  // --- LOGIKA SIMPAN EDIT (NAMA & KELAS) ---
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionLoading(true);

    try {
      const { error: err } = await supabase
        .from("signature_logs")
        .update({
          nama: editingItem.nama,
          kelas: editingItem.kelas,
        })
        .eq("id", editingItem.id);

      if (err) throw err;

      // Update State Lokal
      setLogs((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, nama: editingItem.nama, kelas: editingItem.kelas } : item)));

      setEditingItem(null);
    } catch (e) {
      alert("Gagal memperbarui data: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col items-center justify-center px-6 transition-colors duration-500 select-none
        ${darkMode ? "bg-[#000000]" : "bg-[#F5F5F7]"}`}
      >
        <form
          onSubmit={handleLogin}
          className={`w-full max-w-[360px] border rounded-[28px] p-6 backdrop-blur-2xl transition-all duration-500 shadow-sm
          ${darkMode ? "bg-[#161617]/75 border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)]" : "bg-white/75 border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"}`}
        >
          <header className="text-center mb-6">
            <span className={`text-[9px] font-mono font-bold tracking-[0.25em] uppercase ${darkMode ? "text-zinc-500" : "text-gray-400"}`}>IZER'S CONTROL CENTER</span>
            <h2 className={`text-xl font-black tracking-tight mt-1 ${darkMode ? "text-[#F5F5F7]" : "text-[#1D1D1F]"}`}>Admin Authentication</h2>
          </header>

          <input
            type="password"
            placeholder="ACCESS TOKEN"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full text-center text-[12px] font-mono tracking-widest rounded-xl py-3.5 border px-4 mb-4 focus:outline-none transition-all
              ${darkMode ? "bg-[#000000] border-zinc-800 text-white focus:border-zinc-600" : "bg-[#F5F5F7] border-gray-200 text-[#1D1D1F] focus:border-gray-400"}`}
          />

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold tracking-wide transition-all active:scale-[0.98] mx-auto text-center
              ${darkMode ? "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-white" : "bg-[#1D1D1F] text-white hover:bg-zinc-800"}`}
          >
            <ShieldCheck size={14} strokeWidth={2.5} /> Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pb-16 w-full
      ${darkMode ? "bg-[#000000] text-[#F5F5F7]" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}
    >
      {/* Dynamic Navbar */}
      <nav
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300
        ${darkMode ? "bg-[#000000]/75 border-zinc-800/80" : "bg-[#F5F5F7]/75 border-gray-200"}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={13} className={darkMode ? "text-zinc-500" : "text-gray-400"} />
            <h1 className="font-mono text-[10px] font-black tracking-[0.2em] uppercase">IZER'S DATABASE PANEL</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider font-bold transition-all active:scale-95 disabled:opacity-50
                ${darkMode ? "bg-[#161617] border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <RefreshCw size={11} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border transition-all active:scale-95
                ${darkMode ? "bg-[#161617] border-zinc-800 text-amber-400" : "bg-white border-gray-200 text-indigo-600"}`}
            >
              {darkMode ? <Sun size={13} fill="currentColor" /> : <Moon size={13} fill="currentColor" />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider font-bold transition-all active:scale-95
                ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"}`}
            >
              <LogOut size={11} strokeWidth={2.5} /> LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {/* Grid Dashboard */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        {loading && <p className="text-center font-mono text-[10px] text-gray-400 animate-pulse mb-6">Mengambil log data server…</p>}
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center max-w-md mx-auto text-red-400 text-sm mb-6">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-[24px] p-4 transition-all duration-300 backdrop-blur-2xl shadow-sm flex flex-col justify-between
                ${darkMode ? "bg-[#161617]/75 border-zinc-800/80 hover:border-zinc-700" : "bg-white/75 border-white/60 hover:border-gray-300"}`}
            >
              <div>
                {/* Media Holder */}
                <div
                  className={`overflow-hidden rounded-[14px] border aspect-[16/9] mb-4 bg-black relative
                  ${darkMode ? "border-zinc-800" : "border-gray-100"}`}
                >
                  {log.video_url ? (
                    <video src={log.video_url} controls preload="metadata" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-zinc-600">NO MEDIA</div>
                  )}
                </div>

                {/* Info & Action Row */}
                <div className="flex items-center justify-between px-1 w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[15px] font-black tracking-tight leading-tight truncate ${darkMode ? "text-white" : "text-[#1D1D1F]"}`}>{log.nama}</h3>
                    <p className={`text-[11px] font-bold font-mono mt-0.5 ${darkMode ? "text-[#86868B]" : "text-[#6E6E73]"}`}>{log.kelas}</p>
                  </div>

                  {/* ACTION BUTTON GROUP */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => setEditingItem({ id: log.id, nama: log.nama, kelas: log.kelas })}
                      title="Edit Nama/Kelas"
                      className={`p-2.5 rounded-xl border transition-all active:scale-95
                        ${darkMode ? "bg-[#000000] border-zinc-800 text-amber-400 hover:bg-zinc-800" : "bg-[#F5F5F7] border-gray-200 text-amber-600 hover:bg-white"}`}
                    >
                      <Edit3 size={13} strokeWidth={2.5} />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(log)}
                      title="Hapus Data & Video"
                      className={`p-2.5 rounded-xl border transition-all active:scale-95
                        ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"}`}
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>

                    {/* DOWNLOAD BUTTON */}
                    {log.video_url && (
                      <a
                        href={log.video_url}
                        download={`${log.kelas}_${log.nama}.webm`}
                        title="Download Video"
                        className={`p-2.5 rounded-xl border transition-all active:scale-95
                          ${darkMode ? "bg-[#000000] border-zinc-700 text-[#F5F5F7] hover:bg-zinc-800" : "bg-[#F5F5F7] border-gray-300 text-[#1D1D1F] hover:bg-white"}`}
                      >
                        <Download size={13} strokeWidth={2.5} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- POP-UP MODAL EDIT --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-[400px] border rounded-[28px] p-6 shadow-2xl transition-all
            ${darkMode ? "bg-[#161617] border-zinc-800 text-white" : "bg-white border-gray-200 text-[#1D1D1F]"}`}
          >
            <div className="flex items-center justify-between mb-5">
              <span className={`text-[9px] font-mono font-bold tracking-[0.2em] uppercase ${darkMode ? "text-zinc-500" : "text-gray-400"}`}>EDIT LOG DATA</span>
              <button onClick={() => setEditingItem(null)} className={`p-1.5 rounded-full border transition-all ${darkMode ? "border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-mono font-bold tracking-wider mb-1.5 uppercase ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>NAMA</label>
                <input
                  type="text"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({ ...editingItem, nama: e.target.value })}
                  className={`w-full text-[13px] font-bold rounded-xl py-3 border px-4 focus:outline-none transition-all
                    ${darkMode ? "bg-[#000000] border-zinc-800 text-white focus:border-zinc-600" : "bg-[#F5F5F7] border-gray-200 text-[#1D1D1F] focus:border-gray-400"}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[10px] font-mono font-bold tracking-wider mb-1.5 uppercase ${darkMode ? "text-zinc-400" : "text-gray-500"}`}>KELAS / UNIVERSITAS</label>
                <input
                  type="text"
                  value={editingItem.kelas}
                  onChange={(e) => setEditingItem({ ...editingItem, kelas: e.target.value })}
                  className={`w-full text-[13px] font-bold font-mono rounded-xl py-3 border px-4 focus:outline-none transition-all
                    ${darkMode ? "bg-[#000000] border-zinc-800 text-white focus:border-zinc-600" : "bg-[#F5F5F7] border-gray-200 text-[#1D1D1F] focus:border-gray-400"}`}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className={`flex-1 py-3 rounded-xl border text-[11px] font-mono font-bold tracking-wider transition-all
                    ${darkMode ? "border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[11px] font-mono font-bold tracking-wider transition-all active:scale-[0.98] disabled:opacity-50
                    ${darkMode ? "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-white" : "bg-[#1D1D1F] text-white hover:bg-zinc-800"}`}
                >
                  <Check size={13} strokeWidth={2.5} /> {actionLoading ? "SIMPAN..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
