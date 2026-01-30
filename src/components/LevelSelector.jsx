import React from 'react';

const LevelSelector = ({ warehouseLevel, setWarehouseLevel, tradingPostLevel, setTradingPostLevel }) => {
    const levels = Array.from({ length: 25 }, (_, i) => 25 - i); // [25, 24, ..., 1]

    return (
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <h3 className="text-center" style={{ fontSize: '1.1rem', color: 'var(--primary-gold)' }}>Configuração dos Níveis</h3>

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Armazém
                    </label>
                    <select
                        value={warehouseLevel}
                        onChange={e => setWarehouseLevel(Number(e.target.value))}
                        style={{ height: '48px', cursor: 'pointer' }}
                    >
                        {levels.map(l => (
                            <option key={l} value={l}>Nível {l}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Posto Comercial
                    </label>
                    <select
                        value={tradingPostLevel}
                        onChange={e => setTradingPostLevel(Number(e.target.value))}
                        style={{ height: '48px', cursor: 'pointer' }}
                    >
                        {levels.map(l => (
                            <option key={l} value={l}>Nível {l}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LevelSelector;
