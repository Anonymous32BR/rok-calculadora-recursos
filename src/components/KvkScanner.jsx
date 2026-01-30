import React, { useState } from 'react';
import { AgentOCRRoK } from '../agents/AgentOCRRoK';
import { UploadCloud, Loader2, X, FileImage, Shield } from 'lucide-react';

const KvkScanner = ({ onBack }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [files, setFiles] = useState([]);
    const [logs, setLogs] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setResults(null);
        }
    };

    const runScan = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setLogs([]);
        setResults(null);

        const allResults = [];

        try {
            for (const file of files) {
                setLogs(prev => [...prev, `Processando: ${file.name}...`]);

                // Call the Local Agent
                const fileResults = await AgentOCRRoK.process(file);

                allResults.push({
                    file: file.name,
                    data: fileResults
                });
            }
            setResults(allResults);
            setLogs(prev => [...prev, "Concluído!"]);
        } catch (err) {
            console.error(err);
            setLogs(prev => [...prev, `ERRO: ${err.message}`]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                    &larr; Voltar
                </button>
                <h2 style={{ margin: 0 }}>Scanner KvK (Hall of Heroes)</h2>
            </div>

            {/* UPLOAD AREA */}
            <div className="card" style={{ textAlign: 'center', dashed: '2px solid var(--border-gold)', marginBottom: '24px' }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    id="kvk-upload"
                    style={{ display: 'none' }}
                />

                {files.length === 0 ? (
                    <label htmlFor="kvk-upload" style={{ cursor: 'pointer', display: 'block', padding: '40px' }}>
                        <UploadCloud size={48} color="var(--primary-gold)" style={{ marginBottom: '16px' }} />
                        <h3>Carregar Print de Mortes</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Clique para selecionar imagens</p>
                    </label>
                ) : (
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {files.map((f, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileImage size={14} />
                                    <span style={{ fontSize: '0.8rem' }}>{f.name}</span>
                                </div>
                            ))}
                        </div>

                        {!isProcessing && !results && (
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={() => setFiles([])}>Limpar</button>
                                <button className="btn btn-primary" onClick={runScan}>
                                    <Shield size={16} style={{ marginRight: '8px' }} />
                                    Iniciar Análise Local
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* LOGS / PROGRESS */}
                {isProcessing && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <Loader2 className="spin" size={24} color="var(--primary-gold)" />
                        <div style={{ marginTop: '12px', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RESULTS DISPLAY */}
            {results && results.length > 0 && (
                <div className="card animate-fade-in">
                    <h3>Resultados da Análise</h3>

                    {results.map((res, idx) => (
                        <div key={idx} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ color: 'var(--primary-gold)', marginBottom: '12px' }}>{res.file}</h4>

                            {res.data.length === 0 ? (
                                <p style={{ color: 'var(--danger)' }}>Nenhuma tropa identificada.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #555', textAlign: 'left' }}>
                                                <th style={{ padding: '8px' }}>Tipo</th>
                                                <th style={{ padding: '8px' }}>Nível</th>
                                                <th style={{ padding: '8px', textAlign: 'right' }}>Mortes</th>
                                                <th style={{ padding: '8px', textAlign: 'right' }}>Conf.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {res.data.map((troop, tIdx) => (
                                                <tr key={tIdx} style={{ borderBottom: '1px solid #333' }}>
                                                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: getTypeColor(troop.troop_type),
                                                            marginRight: '8px'
                                                        }}></span>
                                                        {troop.troop_type === 'unknown' ? 'Desconhecido' : translateType(troop.troop_type)}
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <span style={{
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: troop.troop_tier === 'T5' ? 'var(--primary-gold)' : '#444',
                                                            color: troop.troop_tier === 'T5' ? 'black' : 'white',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {troop.troop_tier}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                                        {new Intl.NumberFormat().format(troop.kills)}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', color: troop.confidence > 0.8 ? 'var(--success)' : 'var(--warning)' }}>
                                                        {Math.round(troop.confidence * 100)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ borderTop: '2px solid #555' }}>
                                                <td colSpan={2} style={{ padding: '12px 8px', fontWeight: 'bold' }}>Total de Mortes</td>
                                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-gold)' }}>
                                                    {new Intl.NumberFormat().format(res.data.reduce((acc, curr) => acc + curr.kills, 0))}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}

                    <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        * Conf. = Nível de Confiança da IA Local. Verifique se os números batem com o print.
                    </div>
                </div>
            )}
        </div>
    );
};

const getTypeColor = (type) => {
    switch (type) {
        case 'infantry': return '#4ade80'; // Green
        case 'cavalry': return '#f87171'; // Red
        case 'archer': return '#60a5fa'; // Blue
        case 'siege': return '#facc15'; // Yellow
        default: return '#9ca3af'; // Grey
    }
}

const translateType = (type) => {
    switch (type) {
        case 'infantry': return 'Infantaria';
        case 'cavalry': return 'Cavalaria';
        case 'archer': return 'Arqueiros';
        case 'siege': return 'Assédio';
        default: return type;
    }
}

export default KvkScanner;
