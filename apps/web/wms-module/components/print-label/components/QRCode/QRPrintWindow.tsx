'use client';

import i18n from '@/locales/i18n';
import { TPrintLabel } from '@/types/print-label';
import { getWasteSourceLabel } from '@/utils/getWasteSourceLabel';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

export default function QRPrintWindow({
  data,
}: Readonly<{ data: TPrintLabel[] }>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {data?.map((item, idx) => (
        <QRLabelItem key={idx} item={item} />
      ))}
    </>
  );
}

function QRLabelItem({ item }: { item: TPrintLabel }) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isTwoLine, setIsTwoLine] = useState(false);
  // detection of text lines
  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(
        window.getComputedStyle(titleRef.current).lineHeight
      );
      const height = titleRef.current.scrollHeight;
      setIsTwoLine(height > lineHeight * 1.5); // more than 1 line = true
    }
  }, [item]);

  return (
    <div
      id="print"
      className="print hide-from-screen"
      style={{
        width: '100mm',
        height: '50mm',
        padding: isTwoLine ? '1.5mm 3mm 3mm 3mm' : '0 3mm 3mm 3mm',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '14mm',
        }}
      >
        <span
          ref={titleRef}
          style={{
            fontSize: '0.9rem',
            fontWeight: 900,
            display: 'block',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          {i18n.language === 'id'
            ? item.wasteClassification?.wasteType?.name
            : item.wasteClassification?.wasteType?.nameEn}{' '}
          -{' '}
          {i18n.language === 'id'
            ? item.wasteClassification?.wasteGroup?.name
            : item.wasteClassification?.wasteGroup?.nameEn}{' '}
          -{' '}
          {i18n.language === 'id'
            ? item.wasteClassification?.wasteCharacteristics?.name
            : item.wasteClassification?.wasteCharacteristics?.nameEn}
        </span>
        <hr style={{ borderColor: '#000', margin: '2mm 0' }} />
      </div>

      {/* QR + teks */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4mm',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            flex: 1,
            fontSize: '1rem',
            fontWeight: 900,
          }}
        >
          <div>{item.qrCode}</div>
          <div>{getWasteSourceLabel(item.wasteSource)}</div>
        </div>

        <div
          style={{
            width: isTwoLine ? '110px' : '120px',
            height: isTwoLine ? '110px' : '120px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <QRCodeCanvas
            value={`${item.qrCode}`}
            size={300}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
