import React from 'react';

const Header = () => {
    return (
        <div style={{ marginBottom: '16px', position: 'relative' }}>
            {/* Container for alignment */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
            }}>

                {/* Left: Kingdom Logo */}
                <div style={{ flex: '0 0 100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/logo-k32.png" alt="K32 Kingdom" style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
                </div>

                {/* Center: Title */}
                <div style={{ flex: 1, textAlign: 'center', padding: '0 12px' }}>
                    <h1 style={{
                        margin: '0',
                        lineHeight: '1.2',
                        color: 'var(--primary-gold)',
                        fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                        textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        CALCULADORA DE RECURSOS
                    </h1>
                    <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '2px',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                    }}>
                        Rise of Kingdoms
                    </div>
                </div>

                {/* Right: System Logo */}
                <div style={{ flex: '0 0 100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/assets/logo-anonymous.png" alt="Anonymous 32BR" style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
                </div>

            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)', marginTop: '8px' }}></div>
        </div>
    );
};

export default Header;
