import { useState, useCallback, useRef, useEffect } from "react";
import { PenLine, Video, Square, Download, CheckCircle2, RefreshCw, Sun, Moon } from "lucide-react";
import FloatingInput from "../components/FloatingInput.jsx";
import SignatureCanvas from "../components/SignatureCanvas.jsx";
import { LoadingOverlay, ErrorBanner } from "../components/StatusOverlays.jsx";
import { useSignatureCanvas, recordCanvasAsVideo } from "../lib/useSignatureCanvas.js";
import { submitSignature } from "../lib/signatureApi.js";

const MAX_RECORD_MS = 8000;

export default function SignaturePage() {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [phase, setPhase] = useState("form");
  const [error, setError] = useState(null);
  const [recordProgress, setRecordProgress] = useState(0);
  const [localVideoUrl, setLocalVideoUrl] = useState(null);
  const [pageDarkMode, setPageDarkMode] = useState(false);

  // Inisialisasi engine canvas asli bawaan lu
  const sig = useSignatureCanvas();

  const recordTimerRef = useRef(null);
  const recordStartRef = useRef(0);

  // Validasi: Form wajib terisi DAN user harus coret TTD dulu baru tombol aktif
  const canSubmit = nama.trim().length > 0 && kelas.trim().length > 0 && sig.hasInk && phase === "form";

  // LOGIKA PAKEM AWAL: Hanya update state progress bar UI (Steril tanpa menyentuh canvas)
  const tickProgress = useCallback(() => {
    const elapsed = Date.now() - recordStartRef.current;
    setRecordProgress(Math.min(1, elapsed / MAX_RECORD_MS));
    if (elapsed < MAX_RECORD_MS) {
      recordTimerRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    };
  }, [localVideoUrl]);

  const handleThemeToggle = useCallback(() => {
    setPageDarkMode((prev) => !prev);
    if (sig && typeof sig.toggleBgMode === "function") {
      sig.toggleBgMode();
    }
  }, [sig]);

  // LOGIKA PAKEM ORIGINAL 100%: Menyerahkan proses playback & rekam sepenuhnya ke library asli lu
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setPhase("recording");
    recordStartRef.current = Date.now();
    recordTimerRef.current = requestAnimationFrame(tickProgress);

    try {
      const targetCanvas = sig.canvasRef?.current || sig.ref?.current;

      if (!targetCanvas) {
        throw new Error("Canvas utama tidak ditemukan.");
      }

      // Memanggil fungsi asli lu dengan objek konfigurasi default awal tanpa force warna
      const blob = await recordCanvasAsVideo(targetCanvas, {
        fps: 24,
        maxDurationMs: MAX_RECORD_MS,
        bitsPerSecond: 400000,
      });

      cancelAnimationFrame(recordTimerRef.current);
      setPhase("uploading");

      const objectUrl = URL.createObjectURL(blob);
      setLocalVideoUrl(objectUrl);

      await submitSignature({ nama: nama.trim(), kelas: kelas.trim(), blob });
      setPhase("success");
    } catch (err) {
      cancelAnimationFrame(recordTimerRef.current);
      setError(err.message || "Terjadi kesalahan saat memproses rekaman. Coba lagi.");
      setPhase("form");
    }
  }, [canSubmit, sig, tickProgress]);

  const handleReset = useCallback(() => {
    setNama("");
    setKelas("");
    sig.clear();
    setPhase("form");
    setRecordProgress(0);
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl);
      setLocalVideoUrl(null);
    }
  }, [sig, localVideoUrl]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 transition-colors duration-500 ease-in-out select-none
      ${pageDarkMode ? "bg-[#000000]" : "bg-[#F5F5F7]"}`}
    >
      <style>{`
        .izer-premium-card input {
          color: ${pageDarkMode ? "#FFFFFF" : "#1D1D1F"} !important;
        }
        .izer-premium-card label {
          color: ${pageDarkMode ? "#F5F5F7" : "#6E6E73"} !important;
        }
      `}</style>

      {/* Premium Theme Switcher Pill */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleThemeToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-mono tracking-widest font-bold transition-all duration-300 active:scale-95 shadow-sm backdrop-blur-md
            ${pageDarkMode ? "bg-[#161617]/95 border-zinc-800 text-white hover:bg-zinc-800" : "bg-white/90 border-gray-200 text-[#1D1D1F] hover:bg-gray-50"}`}
        >
          {pageDarkMode ? (
            <>
              <Sun size={12} className="text-amber-400 fill-amber-400" /> LIGHT
            </>
          ) : (
            <>
              <Moon size={12} className="text-indigo-400 fill-indigo-400" /> DARK
            </>
          )}
        </button>
      </div>

      {/* Premium Glassmorphism UI Card */}
      <div
        className={`izer-premium-card w-full max-w-[440px] border rounded-[32px] pt-10 px-6 sm:px-8 pb-12 backdrop-blur-3xl transition-all duration-500 ease-out
        ${pageDarkMode ? "bg-[#161617]/90 border-zinc-800/80 shadow-[0_24px_50px_rgba(0,0,0,0.95)] text-white" : "bg-white/80 border-white/60 text-[#1D1D1F] shadow-[0_24px_50px_rgba(0,0,0,0.02)]"}`}
      >
        {phase !== "success" ? (
          <div className="flex flex-col items-center w-full">
            <header className="w-full text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2.5">
                <PenLine size={13} className={pageDarkMode ? "text-white" : "text-[#1D1D1F]"} />
                <span className={`text-[9px] font-mono tracking-[0.3em] font-black uppercase ${pageDarkMode ? "text-white" : "text-[#1D1D1F]"}`}>IZER'S SIGNATURE ENGINE</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${pageDarkMode ? "text-white" : "text-[#1D1D1F]"}`}>
                Satu goresan, <span className={`font-display italic font-light ${pageDarkMode ? "text-white" : "text-gray-400"}`}>satu video.</span>
              </h1>
            </header>

            <main className="w-full flex flex-col gap-6 items-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                <FloatingInput label="Nama" name="nama" value={nama} onChange={setNama} dark={pageDarkMode} />
                <FloatingInput label="Kelas" name="kelas" value={kelas} onChange={setKelas} dark={pageDarkMode} />
              </div>

              {/* Canvas Area Utama */}
              <div
                className={`w-full transition-all duration-300 mb-4 pb-7
                ${pageDarkMode ? "[&_canvas]:border-zinc-800 [&_canvas]:bg-[#0A0A0C]" : ""}`}
              >
                <SignatureCanvas sig={sig} />
              </div>

              {/* Submit / Progress Perekaman Button */}
              <div className="w-full flex justify-center mt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`group relative w-full flex items-center justify-center gap-2.5 rounded-full py-4 text-[13px] font-bold
                    tracking-wide transition-all duration-300 overflow-hidden active:scale-[0.98] shadow-sm text-center mx-auto
                    ${
                      canSubmit
                        ? pageDarkMode
                          ? "bg-white text-[#1D1D1F] hover:bg-slate-100 border-none shadow-none"
                          : "bg-[#1D1D1F] text-white hover:bg-zinc-800"
                        : pageDarkMode
                          ? "bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {phase === "recording" && <span className="absolute inset-0 bg-emerald-500/20 origin-left transition-transform duration-100 ease-linear" style={{ transform: `scaleX(${recordProgress})` }} />}
                  <span className={`flex items-center justify-center gap-2.5 w-full text-center font-bold ${pageDarkMode ? "text-[#1D1D1F]" : "text-white"}`}>
                    {phase === "recording" ? (
                      <>
                        <Square size={12} fill="currentColor" className="animate-pulse shrink-0" />
                        <span>Merekam Playback Animasi ({Math.round(recordProgress * 100)}%)</span>
                      </>
                    ) : (
                      <>
                        <Video size={14} strokeWidth={2.5} className="shrink-0" />
                        <span>Kirim Tanda Tangan</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </main>
          </div>
        ) : (
          /* Success Screen State */
          <div className="flex flex-col items-center text-center py-4 animate-fadeIn w-full">
            <div className="text-emerald-500 mb-5 animate-scaleUp">
              <CheckCircle2 size={46} strokeWidth={2} />
            </div>

            <h2 className={`text-2xl font-black tracking-tight mb-2 ${pageDarkMode ? "text-white" : "text-[#1D1D1F]"}`}>Aset Berhasil Disimpan</h2>
            <p className={`text-[13px] max-w-[280px] leading-relaxed mb-8 ${pageDarkMode ? "text-white" : "text-[#6E6E73]"}`}>
              Terima kasih, <span className="font-bold text-inherit">{nama}</span>. File video asli playback tanda tangan kamu sudah ter-upload aman.
            </p>

            <div
              className={`w-full border rounded-[20px] p-4 mb-8 flex flex-col items-center gap-3 transition-colors
              ${pageDarkMode ? "bg-[#000000] border-zinc-800/90" : "bg-[#F5F5F7] border-gray-200"}`}
            >
              <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${pageDarkMode ? "text-white" : "text-gray-400"}`}>Salinan Video (RAM Sesi Lokal)</span>

              <a
                href={localVideoUrl}
                download={`${kelas.replace(/\s+/g, "_")}_${nama.replace(/\s+/g, "_")}_ttd.webm`}
                className={`w-full flex items-center justify-center gap-2 border rounded-xl py-3 text-[12px] font-bold shadow-sm transition-all active:scale-[0.97]
                  ${pageDarkMode ? "bg-[#161617] text-white border-zinc-700 hover:bg-zinc-800" : "bg-white text-[#1D1D1F] border-gray-300 hover:bg-gray-50"}`}
              >
                <Download size={13} strokeWidth={2.5} />
                Unduh Video Asli (.webm)
              </a>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center justify-center gap-2 text-[12px] font-bold transition-colors py-2 mx-auto ${pageDarkMode ? "text-white hover:text-zinc-300" : "text-gray-400 hover:text-[#1D1D1F]"}`}
            >
              <RefreshCw size={12} strokeWidth={2.5} />
              Isi Ulang Tanda Tangan
            </button>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center w-full flex justify-center">
        <p className="text-[9px] font-mono tracking-[0.3em] uppercase font-black transition-all duration-300" style={{ color: pageDarkMode ? "#FFFFFF" : "rgba(29, 29, 31, 0.4)" }}>
          Designed by Izer
        </p>
      </footer>

      {phase === "uploading" && <LoadingOverlay label="Mengkristalisasi video ke cloud…" />}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
    </div>
  );
}
