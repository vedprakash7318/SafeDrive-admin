import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function SafeDriveQRCode({
  value,
  size = 140,
  className = '',
  includeMargin = true
}) {
  const logoSize = Math.round(size * 0.20);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={includeMargin}
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
