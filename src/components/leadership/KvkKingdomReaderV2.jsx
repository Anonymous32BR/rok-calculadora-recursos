import React, { useState } from 'react';
import { Upload, Trash2, Loader2, Play } from 'lucide-react';
import { processInput } from '../../flows/processInput';

// KvkKingdomReaderV2 (STRICT MAPPING + POLISHED DEBUG UI)
const KvkKingdomReaderV2 = ({ id, kingdomData, onUpdate, onRemove }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [tempBlocks, setTempBlocks] = useState([]);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        setStagedFiles(prev => [...prev, ...newFiles]);
        setIsProcessing(true);

        try {
            const extracted = [];
            for (const file of newFiles) {
                const input = { type: 'image', file };
                const result = await processInput(input);
                if (result.ocr && Array.isArray(result.ocr)) {
                    extracted.push(...result.ocr);
                }
            }
            // extracted is now a list of objects mapped by AgentOCRRoK
            setTempBlocks(prev => [...prev, ...extracted]);
        } catch (error) {
            console.error(error);
            alert("Erro Upload: " + error.message);
        } finally {
            setIsProcessing(false);
            e.target.value = null;
        }
    };

    const handleReadClick = () => {
        if (tempBlocks.length === 0) {
            if (isProcessing) return alert("Processando... aguarde.");
            return alert("Nenhum dado extraído.");
        }

        const newBlocks = [...(kingdomData.blocks || []), ...tempBlocks];
        onUpdate(id, { ...kingdomData, blocks: newBlocks });

        setStagedFiles([]);
        setTempBlocks([]);
    };

    const removeBlock = (idx) => {
        const newBlocks = kingdomData.blocks.filter((_, i) => i !== idx);
        onUpdate(id, { ...kingdomData, blocks: newBlocks });
    };

    const getColor = (t) => {
        switch (t) {
            case 'infantry': return '#4ade80';
            case 'cavalry': return '#f87171';
            case 'archer': return '#60a5fa';
            case 'siege': return '#facc15';
            default: return '#777';
        }
    };

    const translate = (t) => {
        switch (t) {
            case 'infantry': return "Inf";
            case 'cavalry': return "Cav";
            case 'archer': return "Arq";
            case 'siege': return "Cerco";
            default: return "?";
        }
    }

    return (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--border-gold)' }}>

            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Nome do Reino"
                    value={kingdomData.name}
                    onChange={(e) => onUpdate(id, { ...kingdomData, name: e.target.value })}
                    style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                />

                <button
                    onClick={handleReadClick}
                    disabled={isProcessing || tempBlocks.length === 0}
                    className="btn btn-primary"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        opacity: (tempBlocks.length === 0 && !isProcessing) ? 0.5 : 1,
                        cursor: (tempBlocks.length === 0 && !isProcessing) ? 'not-allowed' : 'pointer',
                        background: isProcessing ? '#444' : 'var(--primary-gold)',
                        color: isProcessing ? '#ccc' : 'black'
                    }}
                >
                    {isProcessing ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
                    {isProcessing ? "Lendo..." : `ORGANIZAR (${tempBlocks.length})`}
                </button>

                <button onClick={() => onRemove(id)} style={{ color: 'var(--accent-red)', background: 'none', border: '1px solid var(--accent-red)', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                </button>
            </div>

            {/* UPLOAD AREA */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{
                    display: 'block', padding: '16px', border: '2px dashed #444',
                    borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                    background: stagedFiles.length > 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    borderColor: stagedFiles.length > 0 ? (isProcessing ? 'var(--primary-gold)' : 'var(--accent-green)') : '#444'
                }}>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <Upload size={24} style={{ marginBottom: '8px', opacity: 0.7 }} />

                    {stagedFiles.length === 0 && <div>Clique para anexar Print (Extração Automática)</div>}

                    {stagedFiles.length > 0 && (
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{stagedFiles.length} arquivo(s)</div>
                            {isProcessing ? (
                                <div style={{ color: 'var(--primary-gold)' }}>Extraindo números...</div>
                            ) : (
                                <div style={{ color: 'var(--accent-green)' }}>✅ {tempBlocks.length} registros prontos</div>
                            )}
                        </div>
                    )}
                </label>
            </div>

            {/* DEBUG AREA: MAPPED SEQUENCE VISUALIZATION */}
            {tempBlocks.length > 0 && (
                <div style={{
                    background: '#0a0a0a',
                    color: '#fff',
                    padding: '16px',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    marginBottom: '16px',
                    borderRadius: '8px',
                    border: tempBlocks.length === 8 ? '2px solid #4ade80' : '2px solid #facc15'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>[DEBUG OCR] LEITURA SEQUENCIAL</span>
                        <span style={{ color: tempBlocks.length === 8 ? '#4ade80' : '#facc15' }}>
                            {tempBlocks.length === 8 ? "✅ SUCESSO (8/8)" : `⚠️ PARCIAL (${tempBlocks.length}/8)`}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                        {tempBlocks.map((b, idx) => {
                            const fullNames = { infantry: 'Infantaria', cavalry: 'Cavalaria', archer: 'Arquearia', siege: 'Cerco' };
                            const name = fullNames[b.troop_type] || b.troop_type;
                            const tier = b.troop_tier ? b.troop_tier.toUpperCase() : '?';

                            // Icons/Numbers
                            const icons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
                            const icon = icons[idx] || `#${idx + 1}`;

                            // Color Coding
                            const isT5 = tier === 'T5';
                            const color = isT5 ? '#fbbf24' : '#c084fc'; // Gold vs Purple

                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #222', padding: '4px 0' }}>
                                    <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{icon}</span>
                                    <span style={{ color: color, fontWeight: 'bold', minWidth: '120px' }}>{name} {tier}:</span>
                                    <span style={{ color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>
                                        {new Intl.NumberFormat('pt-BR').format(b.kills)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {tempBlocks.length !== 8 && (
                        <div style={{ marginTop: '12px', background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            ℹ️ <strong>Leitura Parcial:</strong> Foram identificados {tempBlocks.length} registros válidos.
                            <br />- Você pode clicar em "ORGANIZAR" para aceitar esses dados.
                            <br />- Verifique se faltou alguma tropa importante.
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {kingdomData.blocks && kingdomData.blocks.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {kingdomData.blocks.map((block, idx) => (
                        <div key={idx} style={{
                            background: '#222', padding: '10px', borderRadius: '4px',
                            borderLeft: `3px solid ${getColor(block.troop_type)}`,
                            position: 'relative'
                        }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{new Intl.NumberFormat().format(block.kills)}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{translate(block.troop_type)} {block.troop_tier ? block.troop_tier.toUpperCase() : ''}</span>
                                <button onClick={() => removeBlock(idx)} style={{ color: '#f55', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KvkKingdomReaderV2;
