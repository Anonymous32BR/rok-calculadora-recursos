import React, { useState, useEffect } from 'react';

const BANNER_KEY = 'rok-banner-dismissed-v3.1';

const items_pt = [
    '🚀 Novidade v3.1',
    '📊 Exportar relatório em Excel (.xlsx)',
    '📄 Exportar relatório em CSV',
    '🔡 Fontes dos Totais maiores nos relatórios Mobile e Desktop',
    '⚡ Disponível agora — aproveite!',
];

const items_en = [
    '🚀 What\'s new in v3.1',
    '📊 Export report as Excel (.xlsx)',
    '📄 Export report as CSV',
    '🔡 Larger Total fonts in Mobile & Desktop snapshots',
    '⚡ Available now — enjoy!',
];

export default function AnnouncementBanner({ lang = 'pt-BR' }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(BANNER_KEY)) {
            setVisible(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(BANNER_KEY, '1');
        setVisible(false);
    };

    if (!visible) return null;

    const items = lang.startsWith('en') ? items_en : items_pt;
    // Duplicate for seamless loop
    const ticker = [...items, ...items];

    return (
        <div style={{
            width: '100%',
            background: 'linear-gradient(90deg, #0f2027, #1a3a1a, #0f2027)',
            borderTop: '1px solid rgba(16,185,129,0.4)',
            borderBottom: '1px solid rgba(16,185,129,0.4)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            height: '40px',
        }}>
            {/* Badge fixo à esquerda */}
            <div style={{
                flexShrink: 0,
                background: '#10b981',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '0 14px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                zIndex: 2,
                whiteSpace: 'nowrap',
            }}>
                v3.1
            </div>

            {/* Fade esquerda */}
            <div style={{
                position: 'absolute',
                left: 55,
                top: 0,
                width: 40,
                height: '100%',
                background: 'linear-gradient(to right, #0f2027, transparent)',
                zIndex: 1,
                pointerEvents: 'none',
            }} />

            {/* Ticker animado */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                animation: 'rok-ticker 28s linear infinite',
                gap: '0',
                flex: 1,
                overflow: 'hidden',
            }}>
                {ticker.map((item, i) => (
                    <span key={i} style={{
                        fontSize: '0.8rem',
                        color: '#a7f3d0',
                        padding: '0 40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        {item}
                        <span style={{ color: 'rgba(167,243,208,0.25)', fontWeight: 300 }}>◆</span>
                    </span>
                ))}
            </div>

            {/* Fade direita */}
            <div style={{
                position: 'absolute',
                right: 44,
                top: 0,
                width: 40,
                height: '100%',
                background: 'linear-gradient(to left, #0f2027, transparent)',
                zIndex: 1,
                pointerEvents: 'none',
            }} />

            {/* Botão fechar */}
            <button
                onClick={dismiss}
                title="Fechar"
                style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    color: 'rgba(167,243,208,0.5)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0 12px',
                    height: '100%',
                    zIndex: 2,
                    transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,243,208,0.5)'}
            >
                ✕
            </button>

            {/* Keyframes via <style> */}
            <style>{`
        @keyframes rok-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}
