import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scannedRef.current) return;
          const key = extractAccessKey(decodedText);
          if (key) {
            scannedRef.current = true;
            scanner.stop().then(() => onScan(key)).catch(() => onScan(key));
          }
        },
        undefined,
      )
      .catch(() => {
        // camera permission denied or not available
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="qr-overlay">
      <div className="qr-modal">
        <div className="qr-header">
          <span>Point camera at NFC-e QR code</span>
          <button type="button" className="qr-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div id={containerId} className="qr-viewport" />
      </div>
    </div>
  );
}
