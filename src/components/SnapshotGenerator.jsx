import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { formatNumber } from '../core/calculator';
import { RESOURCES } from '../core/constants';

const SnapshotGenerator = ({ data, netTotal }) => {
    const ref = useRef(null);
    const grossTotal = Object.values(data).reduce((acc, val) => acc + val, 0);

    const handleDownload = async () => {
        if (ref.current) {
            try {
                await new Promise(r => setTimeout(r, 200)); // Ensure fonts load

                const canvas = await html2canvas(ref.current, {
                    backgroundColor: '#0f172a',
                    useCORS: true,
                    scale: 2,
                    logging: false
                });

                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `rok-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error("Snapshot failed:", err);
                alert("Erro ao gerar imagem. Tente novamente.");
            }
        }
    };

    const today = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleDownload}>
                <Download size={20} style={{ marginRight: '12px' }} />
                SALVAR RELATÓRIO CALCUALDO
            </button>

            {/* HIDDEN PREVIEW (Rendered for Canvas) */}
            <div
                ref={ref}
                style={{
                    padding: '0',
                    background: '#0f172a', /* Dark Navy */
                    width: '100%',
                    maxWidth: '600px',
                    margin: '40px auto',
                    color: '#f1f5f9',
                    fontFamily: 'Inter, sans-serif',
                    position: 'relative',
                    border: '2px solid #c5a059', /* Gold */
                    boxShadow: '0 0 40px rgba(0,0,0,0.8)'
                }}
            >
                {/* GOLD ACCENTS */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: '4px solid #c5a059', borderLeft: '4px solid #c5a059' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: '4px solid #c5a059', borderRight: '4px solid #c5a059' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: '4px solid #c5a059', borderLeft: '4px solid #c5a059' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: '4px solid #c5a059', borderRight: '4px solid #c5a059' }}></div>

                {/* HEADER */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '32px 24px', textAlign: 'center', borderBottom: '1px solid rgba(197, 160, 89, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <img src="/assets/logo-k32.png" alt="K32" style={{ height: '80px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />

                        <div style={{ flex: 1, padding: '0 16px' }}>
                            <h2 style={{ margin: 0, color: '#eec168', fontSize: '1.4rem', fontFamily: 'Cinzel, serif', lineHeight: '1.2' }}>
                                RELATÓRIO DE TRANSFERÊNCIA
                            </h2>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '8px' }}>Gerado em {today} às {time}</div>
                        </div>

                        <img src="/assets/logo-anonymous.png" alt="Anon" style={{ height: '80px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
                    </div>
                </div>

                {/* CONTENT */}
                <div style={{ padding: '32px 32px 40px' }}>

                    {/* Resources List */}
                    <div style={{ marginBottom: '40px' }}>
                        {RESOURCES.map(res => (
                            <div key={res.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                paddingBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: res.color }}></div>
                                    <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#e2e8f0' }}>{res.label}</span>
                                </div>
                                <span style={{ fontWeight: '500', fontSize: '1.1rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                                    {formatNumber(data[res.id])}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* TOTALS */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>

                        {/* Gross */}
                        <div style={{ flex: 1, textAlign: 'right', paddingBottom: '8px' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>Total Bruto</div>
                            <div style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>{formatNumber(grossTotal)}</div>
                        </div>

                        {/* NET HIGHLIGHT */}
                        <div style={{
                            flex: 1.5,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)',
                            border: '1px solid #10b981',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
                        }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#10b981', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                Líquido Transferível
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: '#34d399',
                                fontFamily: 'Cinzel, serif',
                                lineHeight: 1
                            }}>
                                {formatNumber(netTotal)}
                            </div>
                        </div>

                    </div>

                    {/* QR CODE & FOOTER */}
                    <div style={{
                        marginTop: '40px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '20px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ background: 'white', padding: '6px', borderRadius: '4px', flexShrink: 0 }}>
                            <QRCodeSVG value={JSON.stringify(data)} size={70} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                            <strong>Auditoria & Evolução</strong><br />
                            Escaneie ou carregue esta imagem no sistema para fins de auditoria ou comparação de progresso futuro.
                        </div>
                    </div>

                </div>

                {/* BRAND FOOTER */}
                <div style={{ background: '#020617', padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Rise of Kingdoms Calculator • K32 Anonymous
                </div>

            </div>
        </div>
    );
};

export default SnapshotGenerator;
