import React, { useState } from 'react';
import { Upload, Trash2, Loader2, Play, AlertCircle, X, FileImage } from 'lucide-react';
import { processInput } from '../../flows/processInput';

// KvkKingdomReader Component
// Implements Strict Master UI:
// [Name] [READ BTN] [DELETE]
// [UPLOAD AREA]
// [RESULTS]

const KvkKingdomReader = ({ id, kingdomData, onUpdate, onRemove }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]); // Files staged but not read

    const handleFileStage = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            // Append new files to pending
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleReadPrint = async () => {
        if (pendingFiles.length === 0) return alert("Anexe um print primeiro!");

        setIsProcessing(true);
        try {
            const allBlocks = [];
            for (const file of pendingFiles) {
                const input = { type: 'image', file };
                const result = await processInput(input);
                if (result.ocr && Array.isArray(result.ocr)) {
                    allBlocks.push(...result.ocr);
                }
            }

            if (allBlocks.length === 0) {
                alert("Nenhum número foi detectado na imagem. Tente melhorar o contraste ou usar um print mais nítido.");
                // Do NOT clear pending files so user can try again or check the file.
                return;
            }

            // Append new blocks to existing ones (Strict 1-to-1 addition)
            const newBlocks = [...(kingdomData.blocks || []), ...allBlocks];

            onUpdate(id, { ...kingdomData, blocks: newBlocks });
            setPendingFiles([]); // Clear pending after successful read

            // Success Feedback
            alert(`Leitura concluída com sucesso! ${allBlocks.length} registros encontrados.`);
        } catch (error) {
            console.error(error);
            alert("Erro ao ler print: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNameChange = (val) => {
        onUpdate(id, { ...kingdomData, name: val });
    };

    const updateBlock = (idx, field, val) => {
        const newBlocks = [...kingdomData.blocks];
        newBlocks[idx][field] = val;
        onUpdate(id, { ...kingdomData, blocks: newBlocks });
    };

    const removeBlockItem = (idx) => {
        const newBlocks = kingdomData.blocks.filter((_, i) => i !== idx);
        onUpdate(id, { ...kingdomData, blocks: newBlocks });
    };

    const removePendingFile = (idx) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="card" style={{ marginBottom: '32px', border: '1px solid var(--border-gold)', position: 'relative' }}>

            {/* --- HEADER BLOCK: [NAME] [READ PRINT] [DELETE] --- */}
            <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Kingdom Name */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <input
                        type="text"
                        placeholder="Nome/Número do Reino..."
                        value={kingdomData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            padding: '12px',
                            color: 'var(--primary-gold)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}
                    />
                </div>

                {/* READ BUTTON - Only active if files pending */}
                <button
                    onClick={handleReadPrint}
                    disabled={isProcessing || pendingFiles.length === 0}
                    className="btn btn-primary"
                    style={{
                        whiteSpace: 'nowrap',
                        opacity: pendingFiles.length === 0 ? 0.5 : 1,
                        cursor: pendingFiles.length === 0 ? 'not-allowed' : 'pointer',
                        padding: '10px 24px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: isProcessing ? '#444' : 'var(--primary-gold)',
                        color: isProcessing ? '#ccc' : 'black',
                        fontWeight: 'bold'
                    }}
                >
                    {isProcessing ? <Loader2 className="spin" size={20} /> : <Play size={20} fill="currentColor" />}
                    {isProcessing ? "Lendo..." : "LER PRINT"}
                </button>

                {/* DELETE KINGDOM */}
                <button
                    onClick={() => onRemove(id)}
                    title="Remover Reino"
                    style={{
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid var(--accent-red)',
                        color: 'var(--accent-red)',
                        borderRadius: '4px',
                        padding: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <Trash2 size={20} />
                </button>
            </div>


            {/* --- UPLOAD AREA (ADD PRINT) --- */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px', border: '2px dashed var(--border-subtle)', borderRadius: '8px',
                    cursor: 'pointer', background: 'rgba(0,0,0,0.1)', color: 'var(--text-muted)',
                    transition: 'all 0.2s'
                }}>
                    <input type="file" multiple accept="image/*" onChange={handleFileStage} style={{ display: 'none' }} />
                    <Upload size={32} style={{ marginBottom: '12px', color: 'var(--text-gold)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>+ ADICIONAR PRINT (Upload)</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '4px' }}>Clique aqui para selecionar as imagens</span>
                </label>

                {/* Pending Files List */}
                {pendingFiles.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {pendingFiles.map((f, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '0.85rem'
                            }}>
                                <FileImage size={14} />
                                <span>{f.name}</span>
                                <button onClick={() => removePendingFile(idx)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RESULTS AREA (CARDS) --- */}
            <div>
                {kingdomData.blocks && kingdomData.blocks.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {kingdomData.blocks.map((block, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(30, 30, 30, 0.8)',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {/* Value Header */}
                                <div style={{
                                    padding: '12px', background: '#252525',
                                    borderBottom: '1px solid #333',
                                    fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace',
                                    textAlign: 'center', color: '#eee',
                                    borderTop: `4px solid ${getBorderColor(block.troop_type)}`
                                }}>
                                    {new Intl.NumberFormat().format(block.kills)}
                                </div>

                                {/* Controls */}
                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                    {/* Tier Selector */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', width: '40px', color: '#888' }}>Nível:</span>
                                        <select
                                            value={block.troop_tier}
                                            onChange={(e) => updateBlock(idx, 'troop_tier', e.target.value)}
                                            style={{
                                                flex: 1, padding: '4px',
                                                background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px'
                                            }}
                                        >
                                            <option value="unknown">?</option>
                                            {['t1', 't2', 't3', 't4', 't5'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                        </select>
                                    </div>

                                    {/* Type Selector */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.8rem', width: '40px', color: '#888' }}>Tipo:</span>
                                        <select
                                            value={block.troop_type}
                                            onChange={(e) => updateBlock(idx, 'troop_type', e.target.value)}
                                            style={{
                                                flex: 1, padding: '4px',
                                                background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px'
                                            }}
                                        >
                                            <option value="unknown">?</option>
                                            {['infantry', 'cavalry', 'archer', 'siege'].map(t => <option key={t} value={t}>{translateType(t)}</option>)}
                                        </select>
                                    </div>

                                    {/* Delete Card */}
                                    <button
                                        onClick={() => removeBlockItem(idx)}
                                        style={{
                                            marginTop: '8px', width: '100%', padding: '6px',
                                            background: 'rgba(255,0,0,0.1)', border: '1px solid darkred',
                                            color: '#ff6b6b', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                        }}
                                    >
                                        Remover Card
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                        Nenhum dado lido. Adicione um print acima e clique em LER PRINT.
                    </div>
                )}
            </div>
        </div>
    );
};

const getBorderColor = (type) => {
    switch (type) {
        case 'infantry': return '#4ade80';
        case 'cavalry': return '#f87171';
        case 'archer': return '#60a5fa';
        case 'siege': return '#facc15';
        default: return '#555';
    }
};

const translateType = (t) => {
    switch (t) {
        case 'infantry': return "Infantaria";
        case 'cavalry': return "Cavalaria";
        case 'archer': return "Arqueiros";
        case 'siege': return "Cerco";
        default: return "Desconhecido";
    }
}

export default KvkKingdomReader;
