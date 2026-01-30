import React, { useState } from 'react';
import { processImages } from '../core/ocr';
import { UploadCloud, X, FileImage, Loader2, Plus } from 'lucide-react';

const UploadZone = ({ onComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleProcess = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        try {
            const results = await processImages(files, (pct, text) => {
                setProgress(pct);
                setStatusText(text);
            });
            onComplete(results);
        } catch (err) {
            alert('Erro ao processar imagens. Tente novamente.');
            console.error(err);
            setIsProcessing(false);
        }
    };

    const removeFile = (idx) => {
        setFiles(files.filter((_, i) => i !== idx));
    };

    return (
        <div className="card" style={{ padding: '0', background: 'transparent', boxShadow: 'none', border: 'none' }}>

            {!isProcessing ? (
                <>
                    <div className="upload-box" style={{ padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <div style={{ background: 'rgba(197, 160, 89, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <UploadCloud size={32} color="var(--primary-gold)" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)' }}>Enviar Prints da Mochila</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toque ou arraste suas imagens aqui</p>
                    </div>

                    {files.length > 0 && (
                        <div className="animate-fade-in" style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{files.length} imagens selecionadas</span>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary-gold)', cursor: 'pointer' }}>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    <Plus size={16} /> Adicionar mais
                                </label>
                            </div>

                            <div style={{ background: 'var(--bg-panel-solid)', borderRadius: '8px', marginBottom: '24px', overflow: 'hidden' }}>
                                {files.map((f, i) => (
                                    <div key={i} className="flex-row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div className="flex-row" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                                            <FileImage size={18} color="var(--text-muted)" />
                                            <span style={{ fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '4px' }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleProcess}
                            >
                                Iniciar Leitura (OCR)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-panel)', borderRadius: '12px', border: 'var(--border-gold)' }}>
                    <Loader2 className="spin" size={48} color="var(--primary-gold)" style={{ margin: '0 auto' }} />
                    <h3 style={{ marginTop: '24px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Analisando Imagens...</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>{statusText}</p>

                    <div style={{ width: '100%', maxWidth: '300px', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', margin: '24px auto 0', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, background: 'var(--primary-gold)', height: '100%', borderRadius: '3px', transition: 'width 0.3s ease-out' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
