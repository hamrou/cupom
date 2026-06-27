import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { clientLog } from "../lib/clientLog";

interface Props {
  onScan: (accessKey: string) => void;
  onClose: () => void;
}

function extractAccessKey(text: string): string | null {
  // NFC-e QR code: URL with ?p=<chNFe>|... where chNFe is 44 digits
  try {
    const url = new URL(text);
    const p = url.searchParams.get("p");
    if (p) {
      const key = p.split("|")[0].replace(/\D/g, "");
      if (key.length === 44) return key;
    }
  } catch {
    // not a URL — try bare 44-digit key
  }
  const bare = text.replace(/\s+/g, "");
  if (/^\d{44}$/.test(bare)) return bare;
  return null;
}

export function QrScanner({ onScan, onClose }: Props) {
  const containerId = "qr-scanner-container";
  // Keep latest callbacks in refs so the effect never needs to re-run
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    let stopped = false;

    async function safeStop() {
      if (stopped || !scanner) return;
      stopped = true;
      try {
        await scanner.stop();
      } catch {}
    }

    async function start() {
      try {
        scanner = new Html5Qrcode(containerId);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            const key = extractAccessKey(decodedText);
            if (!key) {
              clientLog("warn", "QR scanned but no 44-digit key found", { decodedText });
              return;
            }
            clientLog("info", "QR key extracted", { key });
            await safeStop();
            onScanRef.current(key);
          },
          undefined,
        );
      } catch (err) {
        clientLog("error", "QrScanner start failed", { err: String(err) });
      }
    }

    start();
    return () => { safeStop(); };
  }, []); // empty deps — callbacks accessed via refs

  return (
    <div className="qr-overlay">
      <div className="qr-modal">
        <div className="qr-header">
          <span>Point camera at NFC-e QR code</span>
          <button type="button" className="qr-close" onClick={() => onCloseRef.current()}>
            ✕
          </button>
        </div>
        <div id={containerId} className="qr-viewport" />
      </div>
    </div>
  );
}
