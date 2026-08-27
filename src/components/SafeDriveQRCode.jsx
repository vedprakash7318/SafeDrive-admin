import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function SafeDriveQRCode({
  value,
  size = 140,
  className = '',
  includeMargin = true
}) {
  const logoSize = Math.round(size * 0.28);

  return (
    <div className={`relative inline-flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={includeMargin}
        imageSettings={{
          src: '/logo.jpeg',
          x: undefined,
          y: undefined,
          height: logoSize,
          width: logoSize,
          excavate: true
        }}
      />
    </div>
  );
}
