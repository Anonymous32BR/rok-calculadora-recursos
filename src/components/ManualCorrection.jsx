import React, { useState } from 'react';
import { RESOURCES } from '../core/constants';
import { formatNumber, formatCompact } from '../core/calculator';
import { ArrowLeft, Check } from 'lucide-react';
import { t } from '../i18n';

const ManualCorrection = ({ initialData, onConfirm, onBack, lang }) => {
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
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{t(lang, 'reading.title')}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t(lang, 'reading.subtitle')}</p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {RESOURCES.map(res => {
                    const resourceData = data[res.id];
                    const isObject = typeof resourceData === 'object' && resourceData !== null;
                    const totalVal = isObject ? (resourceData.total || 0) : (Number(resourceData) || 0);
                    const bagVal = isObject ? (resourceData.bag || 0) : 0;
                    const openVal = Math.max(0, totalVal - bagVal);

                    return (
                        <div key={res.id} style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <img src={res.icon} alt={res.label} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                <label style={{ fontWeight: '600', color: res.color, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {t(lang, `resources.${res.id}`) || res.label}
                                </label>
                            </div>

                            {/* Total Block (UX Refactor: Exact Integer is King) */}
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t(lang, 'fields.total')}</span>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid transparent',
                                    color: '#e0e0e0',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span>{formatNumber(totalVal)}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                        (~{formatCompact(totalVal)})
                                    </span>
                                </div>
                            </div>

                            {/* Open / Bag Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>

                                {/* Open Block */}
                                <div>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{t(lang, 'fields.opened')}</span>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        padding: '4px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-main)',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        textAlign: 'center'
                                    }}>
                                        {formatCompact(openVal)}
                                    </div>
                                </div>

                                {/* Bag Block */}
                                <div>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>{t(lang, 'fields.backpack')}</span>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        padding: '4px',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'var(--text-muted)',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        textAlign: 'center'
                                    }}>
                                        {formatCompact(bagVal)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="btn btn-primary" onClick={() => onConfirm(data)}>
                <Check size={20} style={{ marginRight: '8px' }} />
                {t(lang, 'buttons.confirmAndCalculate')}
            </button>
        </div>
    );
};

export default ManualCorrection;
