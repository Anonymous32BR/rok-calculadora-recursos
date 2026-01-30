import React, { useState } from 'react';
import { RESOURCES } from '../core/constants';
import { formatNumber, formatCompact } from '../core/calculator';
import { ArrowLeft, Check } from 'lucide-react';

const ManualCorrection = ({ initialData, onConfirm, onBack }) => {
    const [data, setData] = useState(initialData);

    const handleChange = (id, value) => {
        setData(prev => ({ ...prev, [id]: Number(value) }));
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ flex: 1, textAlign: 'center', paddingRight: '40px' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Conferência de Leitura</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verifique se os valores batem com os prints.</p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {RESOURCES.map(res => (
                    <div key={res.id} style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '16px'
                    }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: res.color, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {res.label}
                        </label>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            padding: '8px',
                            marginBottom: '8px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid transparent',
                            color: '#e0e0e0',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            {formatCompact(data[res.id])}
                        </div>
                        <div className="text-sm text-muted" style={{ textAlign: 'right' }}>
                            {formatNumber(data[res.id])}
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary" onClick={() => onConfirm(data)}>
                <Check size={20} style={{ marginRight: '8px' }} />
                Confirmar e Calcular
            </button>
        </div>
    );
};

export default ManualCorrection;
