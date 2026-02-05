import React, { useState } from 'react';
import { processImages } from '../core/ocr';
import { t } from '../i18n';
import { UploadCloud, X, FileImage, Loader2, Plus } from 'lucide-react';

const UploadZone = ({ onComplete, lang }) => {
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
        <div className="upload-card glass secondary" style={{ padding: '0' }}>

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
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-main)' }}>{t(lang, 'upload.title')}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t(lang, 'upload.subtitle')}</p>
                    </div>

                    {files.length > 0 && (
                        <div className="animate-fade-in" style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{files.length} {t(lang, 'upload.selected')}</span>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary-gold)', cursor: 'pointer' }}>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    <Plus size={16} /> {t(lang, 'upload.addMore')}
                                </label>
                            </div>

                            <div className="glass subtle" style={{ borderRadius: '12px', marginBottom: '24px', overflow: 'hidden' }}>
                                {files.map((f, i) => (
                                    <div key={i} className="flex-row" style={{
                                        padding: '12px 16px',
                                        borderBottom: i === files.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s'
                                    }}>
                                        <div className="flex-row" style={{ gap: '12px', justifyContent: 'flex-start', flex: 1 }}>
                                            <div style={{ opacity: 0.7 }}>
                                                <FileImage size={16} color="var(--text-main)" />
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>{f.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', opacity: 0.7, transition: '0.2s' }} onMouseEnter={(e) => { e.target.style.color = 'var(--accent-red)'; e.target.style.opacity = 1 }} onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.opacity = 0.7 }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleProcess}
                            >
                                {t(lang, 'upload.start')}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-panel)', borderRadius: '12px', border: 'var(--border-gold)' }}>
                    <Loader2 className="spin" size={48} color="var(--primary-gold)" style={{ margin: '0 auto' }} />
                    <h3 style={{ marginTop: '24px', fontSize: '1.1rem', color: 'var(--text-main)' }}>{t(lang, 'upload.processing')}</h3>
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
