Izer's Signature Engine
A web app to draw digital signatures and instantly export them as a write-on animation video with a chroma key green background. Built specifically to generate quick overlay assets for video editing.

Features
Zero-Lag Drawing: Powered by HTML5 Canvas and requestAnimationFrame. Pointer coordinates are tracked in refs to prevent React re-renders, ensuring smooth lines even on mobile devices.

Chroma Key Export: Automatically bakes the signature into a pure green (#00FF00) background. Editors can just drop the .webm file into Premiere, CapCut, or DaVinci and key it out instantly.

Optimized File Size: Internal canvas runs at 800×450 resolution and scales via CSS. Keeps the lines crisp while maintaining tiny video file sizes (usually < 1MB for an 8-second clip).

Isolated UI Themes: Includes a clean light/dark mode toggle that only changes the page visual without affecting the internal canvas recording state.

Admin Dashboard: A secured logs page to review and download submitted signatures.

Tech Stack
Frontend: React + Vite + Tailwind CSS + Lucide Icons

Video Generation: canvas.captureStream() + MediaRecorder API (24fps, 400kbps)

Backend/Database: Supabase (Storage Buckets + PostgreSQL)

Hosting: GitHub Pages (Free Tier)
