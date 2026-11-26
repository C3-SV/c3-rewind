"use client";

import { useEffect, useState } from "react";
import { Icon } from "../primitives.tsx";

export function ShareArt({ src = "/rewind-2026.png" }: { src?: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(src, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el arte");
      return response.blob();
    }).then((blob) => setFile(new File([blob], "c3-rewind-2026.png", { type: "image/png" })))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [open, src]);

  return <div className="share-art">
    <button type="button" className="cl-sec" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="download" />Arte para compartir</button>
    {open && <div className="share-art__panel">
      <img src={src} alt="C3 Rewind 2026: gracias por construir este año juntos" />
      <div className="share-art__actions">
        <a className="cl-sec" href={src} download="c3-rewind-2026.png"><Icon name="download" />Descargar arte</a>
        {file && typeof navigator.share === "function" && navigator.canShare?.({ files: [file] }) && <button type="button" className="cl-sec" onClick={() => { void navigator.share({ files: [file] }).catch(() => {}); }}>Compartir</button>}
      </div>
      {error && <p className="share-art__error" role="status">No se pudo cargar el arte. Inténtalo de nuevo.</p>}
    </div>}
  </div>;
}
