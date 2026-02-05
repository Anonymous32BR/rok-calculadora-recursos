import React from 'react';
import { calculateTransferable, formatNumber, formatCompact } from '../core/calculator';
import { RESOURCES } from '../core/constants';
import { t } from '../i18n';

const ResultsCard = ({ resourceData, warehouseLevel, tradingPostLevel, lang }) => {

    // Calculate totals for summary
    const totalGross = RESOURCES.reduce((acc, curr) => {
        const val = resourceData[curr.id];
        const amount = typeof val === 'object' ? val.total : val;
        return acc + amount;
    }, 0);
    const totalNet = RESOURCES.reduce((acc, curr) => {
        const val = resourceData[curr.id];
        const amount = typeof val === 'object' ? val.total : val;
        const { net } = calculateTransferable(amount, curr.id, warehouseLevel, tradingPostLevel);
        return acc + net;
    }, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {RESOURCES.map(res => {
                const resValue = resourceData[res.id];
                const total = typeof resValue === 'object' ? resValue.total : resValue;
                const bag = typeof resValue === 'object' ? resValue.bag : 0;
                const open = Math.max(0, total - bag);

                // Calculate calculations for EACH scenario independently
                const calcTotal = calculateTransferable(total, res.id, warehouseLevel, tradingPostLevel);
                const calcOpen = calculateTransferable(open, res.id, warehouseLevel, tradingPostLevel);
                const calcBag = calculateTransferable(bag, res.id, warehouseLevel, tradingPostLevel);

                // Helper to render a scenario block
                const renderScenario = (label, calcData, isTotal = false) => (
                    <div style={{
                        background: isTotal ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                        padding: '12px',
                        borderRadius: '6px',
                        border: isTotal ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)',
                        marginTop: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isTotal ? 'var(--accent-green)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{label} ({t(lang, 'fields.gross')})</span>
                            <span style={{ fontSize: '0.9rem', color: isTotal ? 'var(--accent-green)' : 'var(--text-main)' }}>{formatCompact(calcData.gross)}</span>
                        </div>

                        {/* Deductions (Small/Red) */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t(lang, 'labels.warehouse')}</span>
                                <span style={{ color: 'var(--accent-red)', fontFamily: 'JetBrains Mono, monospace' }}>-{formatNumber(calcData.protected)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t(lang, 'labels.postTax')}</span>
                                <span style={{ color: 'var(--accent-red)', fontFamily: 'JetBrains Mono, monospace' }}>-{formatNumber(calcData.tax)}</span>
                            </div>
                        </div>

                        {/* Net Result */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: isTotal ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isTotal ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                {isTotal ? t(lang, 'labels.discountedTotal') : `${label} ${t(lang, 'labels.discounted')}`}
                            </span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isTotal ? 'var(--accent-green)' : 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
                                {formatNumber(calcData.net)}
                            </span>
                        </div>
                    </div>
                );

                return (
                    <div key={res.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                <img src={res.icon} alt={res.label} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: res.color, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    {t(lang, `resources.${res.id}`) || res.label}
                                </span>
                            </div>
                        </div>

                        {/* Body Scenarios */}
                        <div style={{ padding: '16px' }}>
                            {/* 1. Open Scenario */}
                            {renderScenario(t(lang, 'fields.opened'), calcOpen)}

                            {/* 2. Bag Scenario */}
                            {renderScenario(t(lang, 'fields.backpack'), calcBag)}

                            {/* 3. Total Scenario (Highlighted) */}
                            {renderScenario(t(lang, 'fields.total'), calcTotal, true)}
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
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t(lang, 'labels.netTotalGeneral')}</h3>
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
                    {t(lang, 'labels.grossTotal')}: {formatCompact(totalGross)}
                </div>
            </div>
        </div >
    );
};

export default ResultsCard;
