import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';

const UNIT_TYPES = [
    { id: 'infantry', label: 'Infantaria', icon: '/assets/icon-infantry.png', color: '#ef4444' },
    { id: 'cavalry', label: 'Cavalaria', icon: '/assets/icon-cavalry.png', color: '#3b82f6' },
    { id: 'archer', label: 'Arqueiros', icon: '/assets/icon-archer.png', color: '#10b981' },
    { id: 'siege', label: 'Cerco', icon: '/assets/icon-siege.png', color: '#f59e0b' }
];

const TIERS = [
    { id: 't1', label: 'T1' },
    { id: 't2', label: 'T2' },
    { id: 't3', label: 'T3' },
    { id: 't4', label: 'T4' },
    { id: 't5', label: 'T5' }
];

const DEFAULT_CONFIG = {
    infantry: { t1: 1, t2: 5, t3: 10, t4: 20, t5: 50 },
    cavalry: { t1: 1, t2: 5, t3: 10, t4: 20, t5: 50 },
    archer: { t1: 1, t2: 5, t3: 10, t4: 20, t5: 50 },
    siege: { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 } // Often 0 in KVK, but editable
};

const KvkConfiguration = () => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('kvk-calc-config');
        if (saved) {
            setConfig(JSON.parse(saved));
        }
    }, []);

    const handleChange = (unitId, tierId, value) => {
        setConfig(prev => ({
            ...prev,
            [unitId]: {
                ...prev[unitId],
                [tierId]: Number(value)
            }
        }));
        setIsSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('kvk-calc-config', JSON.stringify(config));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Restaurar valores padrão?')) {
            setConfig(DEFAULT_CONFIG);
            setIsSaved(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚙️</span> Configuração de Pontos
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        <RotateCcw size={14} style={{ marginRight: '6px' }} /> Padrão
                    </button>
                    <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 24px' }}>
                        <Save size={16} style={{ marginRight: '8px' }} />
                        {isSaved ? 'Salvo!' : 'Salvar'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Tipo de Tropa</th>
                            {TIERS.map(tier => (
                                <th key={tier.id} style={{ padding: '16px', color: 'var(--primary-gold)', textAlign: 'center' }}>
                                    {tier.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {UNIT_TYPES.map(unit => (
                            <tr key={unit.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <img src={unit.icon} alt={unit.label} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{unit.label}</span>
                                </td>
                                {TIERS.map(tier => (
                                    <td key={tier.id} style={{ padding: '12px', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            value={config[unit.id][tier.id]}
                                            onChange={(e) => handleChange(unit.id, tier.id, e.target.value)}
                                            style={{
                                                width: '80px',
                                                padding: '8px',
                                                fontSize: '1rem',
                                                textAlign: 'center',
                                                background: config[unit.id][tier.id] > 0 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)',
                                                color: config[unit.id][tier.id] > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                                                borderColor: config[unit.id][tier.id] > 0 ? 'var(--primary-gold)' : 'var(--border-subtle)',
                                                borderRadius: '4px',
                                                borderStyle: 'solid',
                                                borderWidth: '1px'
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                * Unidades com valor 0 não serão contabilizadas nos relatórios.
            </p>
        </div>
    );
};

export default KvkConfiguration;
