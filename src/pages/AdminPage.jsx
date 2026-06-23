import { useState, useEffect } from "react";
import { Download, ShieldCheck, LogOut, Sun, Moon, Database, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

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
            {/* BUTTON REFRESH DATABASE: Premium pill button dengan feedback putaran loading */}
            <button
              onClick={fetchLogs}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider font-bold transition-all active:scale-95 disabled:opacity-50
                ${darkMode ? "bg-[#161617] border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <RefreshCw size={11} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border transition-all active:scale-95
                ${darkMode ? "bg-[#161617] border-zinc-800 text-amber-400" : "bg-white border-gray-200 text-indigo-600"}`}
            >
              {darkMode ? <Sun size={13} fill="currentColor" /> : <Moon size={13} fill="currentColor" />}
            </button>

            {/* Logout Button */}
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
              className={`border rounded-[24px] p-4 transition-all duration-300 backdrop-blur-2xl shadow-sm
                ${darkMode ? "bg-[#161617]/75 border-zinc-800/80 hover:border-zinc-700" : "bg-white/75 border-white/60 hover:border-gray-300"}`}
            >
              {/* Aspect Ratio Balanced Media Holder */}
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

              {/* Information Row */}
              <div className="flex items-end justify-between px-1 w-full">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className={`text-[15px] font-black tracking-tight leading-tight truncate ${darkMode ? "text-white" : "text-[#1D1D1F]"}`}>{log.nama}</h3>
                  <p className={`text-[11px] font-bold font-mono mt-1 ${darkMode ? "text-[#86868B]" : "text-[#6E6E73]"}`}>{log.kelas}</p>
                </div>

                {log.video_url && (
                  <a
                    href={log.video_url}
                    download={`${log.kelas}_${log.nama}.webm`}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0
                      ${darkMode ? "bg-[#000000] border-zinc-700 text-[#F5F5F7] hover:bg-zinc-800" : "bg-[#F5F5F7] border-gray-300 text-[#1D1D1F] hover:bg-white"}`}
                  >
                    <Download size={13} strokeWidth={2.5} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
