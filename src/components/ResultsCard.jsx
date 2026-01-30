import React from 'react';
import { calculateTransferable, formatNumber, formatCompact } from '../core/calculator';
import { RESOURCES } from '../core/constants';

const ResultsCard = ({ resourceData, warehouseLevel, tradingPostLevel }) => {

    // Calculate totals for summary
    const totalGross = RESOURCES.reduce((acc, curr) => acc + resourceData[curr.id], 0);
    const totalNet = RESOURCES.reduce((acc, curr) => {
        const { net } = calculateTransferable(resourceData[curr.id], curr.id, warehouseLevel, tradingPostLevel);
        return acc + net;
    }, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Resource List Items */}
            {RESOURCES.map(res => {
                const { gross, protected: prot, tax, net } = calculateTransferable(resourceData[res.id], res.id, warehouseLevel, tradingPostLevel);

                return (
                    <div key={res.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        {/* Header */}
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: res.color }}></div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: res.color }}>{res.label}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Bruto: {formatCompact(gross)}
                            </div>
                        </div>

                        {/* Body logic */}
                        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Travado</div>
                                <div style={{ fontSize: '0.95rem' }}>{formatCompact(prot)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Imposto</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--accent-red)' }}>-{formatCompact(tax)}</div>
                            </div>
                        </div>

                        {/* Net Footer */}
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.05)',
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600, textTransform: 'uppercase' }}>Transferível</span>
                            <span style={{ fontSize: '1.2rem', color: 'var(--accent-green)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                                {formatNumber(net)}
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* GRAND TOTAL SUMMARY */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(11, 19, 43, 0.9) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid var(--accent-green)',
                textAlign: 'center',
                padding: '32px 16px'
            }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>TOTAL LÍQUIDO GERAL</h3>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: 'var(--accent-green)',
                    textShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                    fontFamily: 'Cinzel, serif',
                    lineHeight: 1
                }}>
                    {formatNumber(totalNet)}
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    De um total bruto de {formatCompact(totalGross)}
                </div>
            </div>
        </div>
    );
};

export default ResultsCard;
