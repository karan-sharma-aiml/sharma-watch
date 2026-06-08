import React, { useState, useEffect } from 'react';
import { getWhatsAppGeneralLink, WHATSAPP_NUMBER } from '../utils/helpers';

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:     'fixed',
          bottom:       90,
          right:        20,
          background:   '#1a1a1a',
          border:       '1px solid #2a2a2a',
          borderRadius: 12,
          padding:      '10px 14px',
          maxWidth:     240,
          zIndex:       9998,
          boxShadow:    '0 8px 24px rgba(0,0,0,0.5)',
          animation:    'fadeInUp 0.2s ease-out',
        }}>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>
            💬 Chat with us
          </p>
          <p style={{ color: '#888', fontSize: 11, margin: '0 0 10px', lineHeight: 1.5 }}>
            Have questions about orders, delivery, warranty, or products?
          </p>
          <a
            href={getWhatsAppGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        'block',
              background:     '#25D366',
              color:          '#fff',
              textDecoration: 'none',
              padding:        '8px 12px',
              borderRadius:   8,
              fontSize:       12,
              fontWeight:     700,
              textAlign:      'center',
            }}
          >
            Open WhatsApp Chat
          </a>
          <p style={{ color: '#555', fontSize: 10, margin: '8px 0 0', textAlign: 'center' }}>
            +{WHATSAPP_NUMBER}
          </p>
          {/* Arrow — ✅ color fixed */}
          <div style={{
            position:    'absolute',
            bottom:      -8,
            right:       28,
            width:       0,
            height:      0,
            borderLeft:  '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop:   '8px solid #1a1a1a',
          }} />
        </div>
      )}

      {/* Floating Button — ✅ only onMouseEnter/Leave */}
      <a
        href={getWhatsAppGeneralLink()}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={(e) => {
          setTooltip(true);
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,211,102,0.6), 0 2px 8px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          setTooltip(false);
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.3)';
        }}
        style={{
          position:       'fixed',
          bottom:         24,
          right:          20,
          width:          56,
          height:         56,
          borderRadius:   '50%',
          background:     '#25D366',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          zIndex:         9999,
          boxShadow:      '0 4px 20px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.3)',
          textDecoration: 'none',
          transition:     'transform 0.2s, box-shadow 0.2s',
          animation:      'whatsappPulse 2s ease-in-out infinite',
        }}
        title="Chat on WhatsApp"
        aria-label="Chat with Sharma Watch Store on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <style>{`
        @keyframes whatsappPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.3); }
          50%       { box-shadow: 0 4px 30px rgba(37,211,102,0.7), 0 2px 8px rgba(0,0,0,0.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}