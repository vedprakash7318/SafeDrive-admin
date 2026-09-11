import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function SafeDriveQRCode({
  value,
  size = 140,
  className = '',
  includeMargin = true
}) {
  // Use a high-resolution multiplier for the canvas internal size to ensure print quality
  const scale = 4;
  const internalSize = size * scale;
  const logoSize = Math.round(internalSize * 0.20);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <QRCodeCanvas
        value={value}
        size={internalSize}
        level="H"
        includeMargin={includeMargin}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        imageSettings={{
          src: '/logo.png',
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
