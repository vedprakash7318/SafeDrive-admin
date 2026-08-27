import React, { useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import SafeDriveQRCode from './SafeDriveQRCode';

export default function DigitalCardModal({ qr, onClose, PUBLIC_SCAN_BASE }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      // Temporarily scale up for high-res download if needed, or just let html2canvas handle it
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, // 4x scale for high resolution print quality
        useCORS: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `SafeDrive_DigitalCard_${qr.copyCode}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error generating card image:', error);
      alert('Failed to download the card image.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div>
            <h3 className="font-black text-xl text-slate-900 flex items-center space-x-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Download Digital Card</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Preview and download the digital sticker card for {qr.copyCode}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Preview Area */}
        <div className="p-6 md:p-10 flex-1 overflow-y-auto flex items-center justify-center bg-slate-50">
          
          {/* Card Container - using a fixed ratio mimicking the physical card proportions */}
          {/* We use a relatively large pixel size here so the preview is clear and download is high-res */}
          <div 
            ref={cardRef}
            className="relative overflow-hidden bg-white shadow-sm border border-slate-200 rounded-lg"
            style={{
              width: '600px',
              height: '358px', // approx 9.2:5.49 ratio
              backgroundImage: `url('/card_bg.png')`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* QR Code Container based on percentages */}
            <div 
              className="absolute flex items-center justify-center bg-transparent"
              style={{
                left: '55%',
                top: '10%',
                width: '38%',
                height: '63%',
              }}
            >
              <SafeDriveQRCode
                value={`${PUBLIC_SCAN_BASE}/${qr.publicToken}`}
                size={220} // large enough to be crisp
                className="w-full h-full object-contain"
                includeMargin={false}
              />
            </div>

            {/* Optional ID or PIN */}
            {qr.securityCode ? (
              <div className="absolute left-[4%] bottom-[4%] bg-amber-100 text-amber-950 font-mono font-black text-xs px-2 py-1 rounded shadow-xs border border-amber-300">
                PIN: {qr.securityCode}
              </div>
            ) : (
              <div className="absolute left-[4%] bottom-[4%] text-[9px] font-mono text-slate-800 font-bold bg-white/60 px-2 py-1 rounded backdrop-blur-sm">
                ID: {qr.copyCode}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-5 border-t border-slate-100 bg-white rounded-b-3xl">
          <div className="text-xs text-slate-500 font-medium">
            Format: High-Resolution PNG
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{downloading ? 'Generating Image...' : 'Download Card'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
