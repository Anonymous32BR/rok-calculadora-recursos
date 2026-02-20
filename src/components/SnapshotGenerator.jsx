import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatNumber, formatCompact } from '../core/calculator';
import { t } from '../i18n';

const SnapshotGenerator = ({ reportData }) => {
    const refMobile = useRef(null);
    const refDesktop = useRef(null);

    if (!reportData) return null;
    const { resources, resumo, metadata } = reportData;
    const lang = metadata.lang || 'pt-BR';

    // ─── IMAGE DOWNLOAD ─────────────────────────────────────────────────────────
    const handleDownload = async (type) => {
        const targetRef = type === 'mobile' ? refMobile : refDesktop;
        const filename = type === 'mobile' ? 'rok-relatorio-mobile' : 'rok-relatorio-desktop';
        const width = type === 'mobile' ? 540 : 1920;
        const height = type === 'mobile' ? null : 1080;

        if (targetRef.current) {
            try {
                await new Promise(r => setTimeout(r, 200));
                const canvas = await html2canvas(targetRef.current, {
                    backgroundColor: '#0f172a',
                    useCORS: true,
                    scale: 2,
                    logging: false,
                    width,
                    windowWidth: width,
                    height,
                    windowHeight: height
                });
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `${filename}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Snapshot failed:', err);
                alert('Error generating image.');
            }
        }
    };

    // ─── BUILD SPREADSHEET DATA ──────────────────────────────────────────────────
    const buildSheetData = () => {
        const labelType = t(lang, 'labels.type');
        const labelGross = t(lang, 'fields.gross');
        const labelTax = t(lang, 'fields.tax');
        const labelNet = t(lang, 'fields.net');
        const labelOpen = t(lang, 'fields.opened');
        const labelBag = t(lang, 'fields.bag');
        const labelTotal = t(lang, 'fields.total');

        const rows = [];

        // Header row
        rows.push([labelType, '', labelGross, labelTax, labelNet]);

        Object.keys(resources).forEach(key => {
            const res = resources[key];
            const resName = t(lang, `resources.${res.id}`) || res.label;

            rows.push([]); // spacer
            rows.push([resName.toUpperCase()]);
            rows.push([labelOpen, '', res.abertos.gross, -(res.abertos.protected + res.abertos.tax), res.abertos.net]);
            rows.push([labelBag, '', res.mochila.gross, -(res.mochila.protected + res.mochila.tax), res.mochila.net]);
            rows.push([labelTotal, '', res.total.gross, -(res.total.protected + res.total.tax), res.total.net]);
        });

        rows.push([]);
        rows.push([t(lang, 'reports.reportTotalGross'), '', resumo.totalBrutoGeral]);
        rows.push([t(lang, 'reports.reportTotalNet'), '', resumo.totalLiquidoGeral]);
        rows.push(['Data', '', `${metadata.dataGeracao} ${metadata.horaGeracao}`]);

        return rows;
    };

    // ─── CSV DOWNLOAD ────────────────────────────────────────────────────────────
    const handleDownloadCSV = () => {
        const data = buildSheetData();
        const csvContent = data
            .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rok-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ─── XLSX DOWNLOAD ───────────────────────────────────────────────────────────
    const handleDownloadXLSX = () => {
        const data = buildSheetData();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Column widths
        ws['!cols'] = [{ wch: 20 }, { wch: 5 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório ROK');
        XLSX.writeFile(wb, `rok-relatorio-${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // ─── RENDER HELPERS ──────────────────────────────────────────────────────────
    const ResourceRow = ({ label, data, isTotal, isDesktop }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1fr' : '1.2fr 1fr 1fr 1.2fr',
            padding: isDesktop ? '12px 16px' : '10px 16px',
            alignItems: 'center',
            background: isTotal ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
            borderTop: isTotal ? '1px solid rgba(16, 185, 129, 0.1)' : 'none'
        }}>
            <div style={{
                fontWeight: isTotal ? 800 : 500,
                color: isTotal ? '#10b981' : '#e2e8f0',
                fontSize: isTotal ? (isDesktop ? '1.4rem' : '1.1rem') : (isDesktop ? '1rem' : '0.8rem')
            }}>{label}</div>

            <div style={{
                textAlign: 'right',
                fontSize: isTotal ? (isDesktop ? '1.4rem' : '1.1rem') : (isDesktop ? '1rem' : '0.8rem'),
                color: '#cbd5e1'
            }}>
                {isDesktop ? formatNumber(data.gross) : formatCompact(data.gross)}
            </div>

            <div style={{
                textAlign: 'right',
                fontSize: isTotal ? (isDesktop ? '1.2rem' : '1rem') : (isDesktop ? '0.9rem' : '0.75rem'),
                color: '#ef4444'
            }}>
                -{isDesktop ? formatNumber(data.protected + data.tax) : formatCompact(data.protected + data.tax)}
            </div>

            {/* NET — the main number to enlarge for total rows */}
            <div style={{
                textAlign: 'right',
                fontSize: isTotal ? (isDesktop ? '2.2rem' : '1.7rem') : (isDesktop ? '1.1rem' : '0.9rem'),
                fontWeight: 700,
                color: isTotal ? '#34d399' : '#f8fafc',
                fontFamily: 'monospace'
            }}>
                {isDesktop ? formatNumber(data.net) : formatCompact(data.net)}
            </div>
        </div>
    );

    const ResourceHeader = ({ isDesktop }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1fr' : '1.2fr 1fr 1fr 1.2fr',
            padding: '8px 16px',
            fontSize: isDesktop ? '0.8rem' : '0.65rem',
            color: '#64748b',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div>{t(lang, 'labels.type')}</div>
            <div style={{ textAlign: 'right' }}>{t(lang, 'fields.gross')}</div>
            <div style={{ textAlign: 'right' }}>{t(lang, 'fields.tax')}</div>
            <div style={{ textAlign: 'right' }}>{t(lang, 'fields.net')}</div>
        </div>
    );

    const glassStyle = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderRadius: '16px'
    };

    // ─── RENDER ──────────────────────────────────────────────────────────────────
    return (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

            {/* ── IMAGE BUTTONS ── */}
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px', textTransform: 'uppercase' }}>
                {t(lang, 'reports.downloadTitle')}
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn btn-secondary" onClick={() => handleDownload('mobile')} style={{ padding: '12px 24px' }}>
                    <Download size={20} style={{ marginRight: '8px' }} />
                    {t(lang, 'reports.downloadMobile')} <span style={{ opacity: 0.5, marginLeft: '4px', fontSize: '0.8em' }}>(9:16)</span>
                </button>
                <button className="btn btn-primary" onClick={() => handleDownload('desktop')} style={{ padding: '12px 24px' }}>
                    <Download size={20} style={{ marginRight: '8px' }} />
                    {t(lang, 'reports.downloadDesktop')} <span style={{ opacity: 0.5, marginLeft: '4px', fontSize: '0.8em' }}>(16:9)</span>
                </button>
            </div>

            {/* ── SPREADSHEET BUTTONS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📊 Exportar Planilha
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleDownloadCSV}
                        style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FileText size={16} />
                        Download CSV
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleDownloadXLSX}
                        style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}
                    >
                        <FileSpreadsheet size={16} />
                        Download XLSX (Excel)
                    </button>
                </div>
            </div>

            {/* ── HIDDEN SNAPSHOT PREVIEWS ── */}
            <div style={{ height: 0, overflow: 'hidden' }}>

                {/* MOBILE (9:16) */}
                <div ref={refMobile} style={{ width: '540px', background: '#070b14', backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', border: 'none', paddingBottom: '40px', position: 'relative' }}>
                    <div style={{ height: '8px', background: 'linear-gradient(90deg, #8a703d 0%, #eec168 50%, #8a703d 100%)' }}></div>

                    <div style={{ padding: '32px 32px 24px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(197,160,89,0.15) 0%, rgba(0,0,0,0) 100%)', borderBottom: '1px solid rgba(197,160,89,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
                            <img src="/assets/logos/Anonymous32BR.png" alt="Anonymous" style={{ height: '50px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)' }}></div>
                            <img src="/assets/logos/K32-ROK.png" alt="K32" style={{ height: '50px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                        </div>
                        <div>
                            <h1 style={{ margin: '0 0 8px', color: '#eec168', fontSize: '2rem', fontFamily: 'Cinzel, serif', lineHeight: '1.2', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 2px 10px rgba(197,160,89,0.3)' }}>{t(lang, 'reports.reportTitle')}</h1>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>{metadata.dataGeracao} • {metadata.horaGeracao}</div>
                        </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                        {Object.keys(resources).map(key => {
                            const res = resources[key];
                            return (
                                <div key={key} style={{ marginBottom: '24px', ...glassStyle, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={res.icon} alt="" style={{ width: '28px', height: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {t(lang, `resources.${res.id}`) || res.label}
                                        </span>
                                    </div>
                                    <div style={{ padding: '12px 0' }}>
                                        <ResourceHeader isDesktop={false} />
                                        <ResourceRow label={t(lang, 'fields.opened')} data={res.abertos} isTotal={false} isDesktop={false} />
                                        <ResourceRow label={t(lang, 'fields.bag')} data={res.mochila} isTotal={false} isDesktop={false} />
                                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <ResourceRow label={t(lang, 'fields.total')} data={res.total} isTotal={true} isDesktop={false} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Grand Total */}
                        <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,78,59,0.2) 100%)', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', padding: '32px 24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6ee7b7', letterSpacing: '3px', marginBottom: '8px' }}>{t(lang, 'reports.reportTotalNet')}</div>
                            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Cinzel, serif', lineHeight: 1, textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>{formatNumber(resumo.totalLiquidoGeral)}</div>
                            <div style={{ marginTop: '12px', fontSize: '1rem', color: '#6ee7b7', fontWeight: 'bold' }}>(~{formatCompact(resumo.totalLiquidoGeral)})</div>
                            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#94a3b8' }}>{t(lang, 'reports.reportTotalGross')}: <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{formatCompact(resumo.totalBrutoGeral)}</span></div>
                        </div>
                    </div>

                    <div style={{ padding: '0 32px 40px', marginTop: 'auto' }}>
                        <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <QRCodeSVG value={JSON.stringify({ date: metadata.dataGeracao, total: resumo.totalLiquidoGeral, food: { total: resources.food.total.gross, bag: resources.food.mochila.gross }, wood: { total: resources.wood.total.gross, bag: resources.wood.mochila.gross }, stone: { total: resources.stone.total.gross, bag: resources.stone.mochila.gross }, gold: { total: resources.gold.total.gross, bag: resources.gold.mochila.gross } })} size={70} />
                            <div>
                                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{t(lang, 'reports.reportOfficial')}</div>
                                <div style={{ color: '#475569', fontSize: '0.8rem', lineHeight: '1.3' }}>{t(lang, 'reports.reportAudit')}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#475569', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '24px', opacity: 0.6 }}>Rise of Kingdoms Calculator • K32 Anonymous</div>
                    </div>
                </div>

                {/* DESKTOP (16:9) */}
                <div ref={refDesktop} style={{ width: '1920px', height: '1080px', background: '#070b14', backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', border: 'none', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '6px', background: 'linear-gradient(90deg, #8a703d 0%, #eec168 50%, #8a703d 100%)', flexShrink: 0 }}></div>

                    <div style={{ height: '120px', background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.4) 100%)', borderBottom: '1px solid rgba(197,160,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px' }}>
                                <img src="/assets/logos/Anonymous32BR.png" alt="Anonymous" style={{ height: '60px', objectFit: 'contain' }} />
                                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
                                <img src="/assets/logos/K32-ROK.png" alt="K32" style={{ height: '60px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <h1 style={{ margin: 0, color: '#eec168', fontSize: '2.2rem', fontFamily: 'Cinzel, serif', letterSpacing: '1px', textShadow: '0 2px 10px rgba(197,160,89,0.4)' }}>{t(lang, 'reports.reportTitle')}</h1>
                        </div>
                        <div style={{ display: 'flex', gap: '48px', color: '#cbd5e1', fontSize: '1.1rem', fontWeight: 500 }}>
                            <div>{t(lang, 'reports.reportDate').toUpperCase()}: <span style={{ color: '#fff', fontWeight: 600 }}>{metadata.dataGeracao}</span> <span style={{ color: '#64748b' }}>{metadata.horaGeracao}</span></div>
                            <div style={{ display: 'flex', gap: '32px' }}>
                                <div>{t(lang, 'labels.warehouse').toUpperCase()}: <span style={{ color: '#eec168' }}>Lv {metadata.warehouseLevel}</span></div>
                                <div>{t(lang, 'labels.tradingPost').toUpperCase()}: <span style={{ color: '#eec168' }}>Lv {metadata.tradingPostLevel}</span></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: '40px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '32px' }}>
                        {Object.keys(resources).map(key => {
                            const res = resources[key];
                            return (
                                <div key={key} style={{ ...glassStyle, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '20px 32px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <img src={res.icon} alt="" style={{ width: '36px', height: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {t(lang, `resources.${res.id}`) || res.label}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <ResourceHeader isDesktop={true} />
                                        <ResourceRow label={t(lang, 'fields.opened')} data={res.abertos} isTotal={false} isDesktop={false} />
                                        <ResourceRow label={t(lang, 'fields.bag')} data={res.mochila} isTotal={false} isDesktop={false} />
                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <ResourceRow label={t(lang, 'fields.total')} data={res.total} isTotal={true} isDesktop={false} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ height: '160px', background: '#020617', borderTop: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 50%)', pointerEvents: 'none' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', zIndex: 1 }}>
                            <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
                                <QRCodeSVG value={JSON.stringify({ date: metadata.dataGeracao, total: resumo.totalLiquidoGeral, food: { total: resources.food.total.gross, bag: resources.food.mochila.gross }, wood: { total: resources.wood.total.gross, bag: resources.wood.mochila.gross }, stone: { total: resources.stone.total.gross, bag: resources.stone.mochila.gross }, gold: { total: resources.gold.total.gross, bag: resources.gold.mochila.gross } })} size={90} />
                            </div>
                            <div style={{ fontSize: '1rem', color: '#64748b' }}>
                                <strong style={{ color: '#cbd5e1' }}>{t(lang, 'reports.reportOfficial')}</strong><br />
                                {t(lang, 'reports.reportAudit')}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '80px', zIndex: 1 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.1rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>{t(lang, 'reports.reportTotalGross')}</div>
                                <div style={{ fontSize: '2rem', color: '#94a3b8', fontFamily: 'monospace' }}>{formatCompact(resumo.totalBrutoGeral)}</div>
                            </div>
                            <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '3px' }}>{t(lang, 'reports.reportTotalNet')}</div>
                                <div style={{ fontSize: '4rem', color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 900, lineHeight: 1, textShadow: '0 0 40px rgba(16,185,129,0.6)' }}>
                                    {formatNumber(resumo.totalLiquidoGeral)}
                                </div>
                                <div style={{ fontSize: '1.2rem', color: '#10b981', fontWeight: 'bold' }}>(~{formatCompact(resumo.totalLiquidoGeral)})</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SnapshotGenerator;
