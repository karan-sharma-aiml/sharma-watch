import React from 'react';
import { getWhatsAppOrderLink, getWhatsAppGeneralLink, WHATSAPP_NUMBER } from '../utils/helpers';

export default function SupportCard({ orderId = null, compact = false }) {
  const waLink = orderId
    ? getWhatsAppOrderLink(orderId)
    : getWhatsAppGeneralLink();

  const G      = '#d4af37';
  const bg     = '#0d0d0d';
  const border = '#2a2a2a';

  if (compact) {
    return (
      <div style={{
        background:   'rgba(37,211,102,0.06)',
        border:       '1px solid rgba(37,211,102,0.2)',
        borderRadius: 12,
        padding:      '12px 16px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        gap:          12,
        flexWrap:     'wrap',
      }}>
        <div>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>
            {orderId ? 'Need help with this order?' : 'Need assistance?'}
          </p>
          <p style={{ color: '#888', fontSize: 11, margin: '2px 0 0' }}>
            Contact Sharma Watch Store on WhatsApp
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            background:     '#25D366',
            color:          '#fff',
            textDecoration: 'none',
            padding:        '8px 16px',
            borderRadius:   8,
            fontSize:       12,
            fontWeight:     700,
            flexShrink:     0,
          }}
        >
          <WhatsAppIcon size={14} />
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background:   bg,
      border:       `1px solid ${border}`,
      borderRadius: 16,
      overflow:     'hidden',
    }}>
      {/* Header */}
      <div style={{
        background:   'rgba(37,211,102,0.06)',
        borderBottom: '1px solid rgba(37,211,102,0.15)',
        padding:      '16px 20px',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <WhatsAppIcon size={18} color="#fff" />
        </div>
        <div>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>
            Customer Support
          </p>
          <p style={{ color: '#888', fontSize: 11, margin: 0 }}>
            Sharma Watch Store · Birgunj, Nepal
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
          Have questions about your order, delivery, warranty, or any product?
          Contact us on WhatsApp — we typically reply within minutes.
        </p>

        {orderId && (
          <div style={{
            background:   'rgba(212,175,55,0.06)',
            border:       '1px solid rgba(212,175,55,0.15)',
            borderRadius: 8,
            padding:      '8px 12px',
            marginBottom: 12,
          }}>
            <p style={{ color: '#888', fontSize: 11, margin: '0 0 2px' }}>Your Order</p>
            <p style={{ color: G, fontSize: 13, fontWeight: 700, margin: 0 }}>{orderId}</p>
          </div>
        )}

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            background:     '#25D366',
            color:          '#fff',
            textDecoration: 'none',
            padding:        '12px',
            borderRadius:   10,
            fontSize:       13,
            fontWeight:     700,
            width:          '100%',
            boxSizing:      'border-box',
            marginBottom:   10,
          }}
        >
          <WhatsAppIcon size={16} />
          {orderId ? 'Get Help with This Order' : 'Start WhatsApp Chat'}
        </a>

        <p style={{ color: '#555', fontSize: 11, textAlign: 'center', margin: 0 }}>
          +{WHATSAPP_NUMBER} · Available Mon–Sat, 10am–7pm NPT
        </p>
      </div>
    </div>
  );
}

function WhatsAppIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}