import React, { useState } from 'react';
import { Plus, Calculator, FileOutput } from 'lucide-react';
import KvkKingdomReader from './KvkKingdomReader';

const PROMPT_MESTRE_REPORT = `
    Este sistema segue o Protocolo Mestre:
    1. Configuração (Salva previamente)
    2. Leitura (Raw Data por Reino)
    3. Agregação (Múltiplos Reinos)
    4. Cálculo (Botão Final)
`;

const KvkCalculator = () => {
    // Stage: 'input' or 'report'
    const [viewMode, setViewMode] = useState('input');

    // List of Kingdoms [{ id: 1, name: '', blocks: [] }]
    const [kingdoms, setKingdoms] = useState([
        { id: Date.now(), name: '', blocks: [] }
    ]);

    const addKingdom = () => {
        setKingdoms(prev => [...prev, { id: Date.now(), name: '', blocks: [] }]);
    };

    const removeKingdom = (id) => {
        setKingdoms(prev => prev.filter(k => k.id !== id));
    };

    const updateKingdom = (id, data) => {
        setKingdoms(prev => prev.map(k => k.id === id ? data : k));
    };

    const [finalReport, setFinalReport] = useState(null);

    const performMasterCalculation = () => {
        // 1. Load Config
        const config = JSON.parse(localStorage.getItem('kvk-calc-config'));
        if (!config) return alert("Erro crítico: Configuração não encontrada. Salve a configuração primeiro.");

        // 2. Aggregate Data
        let totalPoints = 0;
        const report = {
            byType: {},
            total: 0
        };

        // Initialize report structure
        ['infantry', 'cavalry', 'archer', 'siege'].forEach(type => {
            report.byType[type] = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, total: 0 };
        });

        // 3. Iterate ALL Kingdoms -> ALL Blocks
        kingdoms.forEach(kingdom => {
            kingdom.blocks.forEach(block => {
                const type = block.troop_type;
                const tier = block.troop_tier;
                if (!type || !tier || type === 'unknown' || tier === 'unknown') return;

                const kills = block.kills;
                const pointValue = config[type]?.[tier] || 0;

                // Calc
                const points = kills * pointValue;

                // Add to Report
                report.byType[type][tier] += points;
                report.byType[type].total += points;
                totalPoints += points;
            });
        });

        report.total = totalPoints;
        setFinalReport(report);
        setViewMode('report');
    };

    return (
        <div className="animate-fade-in">
            {viewMode === 'input' && (
                <>
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--primary-gold)' }}>Leitura & Organização</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Adicione os reinos, leia os prints e só depois calcule.</p>
                    </div>

                    {/* KINGDOM BLOCKS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {kingdoms.map(k => (
                            <KvkKingdomReader
                                key={k.id}
                                id={k.id}
                                kingdomData={k}
                                onUpdate={updateKingdom}
                                onRemove={removeKingdom}
                            />
                        ))}
                    </div>

                    {/* ADD BUTTON */}
                    <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '60px' }}>
                        <button onClick={addKingdom} className="btn btn-secondary" style={{ borderStyle: 'dashed' }}>
                            <Plus size={20} style={{ marginRight: '8px' }} /> Adicionar Reino
                        </button>
                    </div>

                    {/* MASTER CALC BUTTON */}
                    <div style={{
                        position: 'fixed', bottom: 0, left: 0, width: '100%',
                        background: 'var(--bg-panel)', padding: '20px',
                        borderTop: '2px solid var(--primary-gold)',
                        display: 'flex', justifyContent: 'center', zIndex: 100
                    }}>
                        <button
                            onClick={performMasterCalculation}
                            className="btn btn-primary"
                            style={{ padding: '16px 40px', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(197, 160, 89, 0.3)' }}
                        >
                            <Calculator size={24} style={{ marginRight: '12px' }} />
                            CALCULAR GERAL DE MORTES / PONTOS
                        </button>
                    </div>
                </>
            )}

            {viewMode === 'report' && finalReport && (
                <div style={{ paddingBottom: '100px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary-gold)', marginBottom: '8px' }}>Relatório Final</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                            {new Intl.NumberFormat().format(finalReport.total)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>PONTOS</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {['infantry', 'cavalry', 'archer', 'siege'].map(type => (
                            <div key={type} className="card">
                                <h3 style={{ textTransform: 'uppercase', color: getBorderColor(type), borderBottom: '1px solid #444', paddingBottom: '8px' }}>
                                    {translateType(type)}
                                </h3>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {['t5', 't4', 't3'].map(tier => (
                                        <div key={tier} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{tier.toUpperCase()}</span>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {new Intl.NumberFormat().format(finalReport.byType[type][tier])} pts
                                            </span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'white' }}>
                                        <span>TOTAL</span>
                                        <span>{new Intl.NumberFormat().format(finalReport.byType[type].total)} pts</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button onClick={() => setViewMode('input')} className="btn btn-secondary">
                            <RotateCcw size={16} /> Voltar / Corrigir
                        </button>
                    </div>
                </div>
            )}
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

export default KvkCalculator;
