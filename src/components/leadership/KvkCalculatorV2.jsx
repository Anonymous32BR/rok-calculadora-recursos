import React, { useState } from 'react';
import { Plus, Calculator, RotateCcw } from 'lucide-react';
import KvkKingdomReaderV2 from './KvkKingdomReaderV2';

// KvkCalculatorV2 (RESET VERSION)
// Container for strict linear flow: Config -> V2 Readers -> Global Calc
const KvkCalculatorV2 = () => {
    const [viewMode, setViewMode] = useState('input'); // input | report
    const [kingdoms, setKingdoms] = useState([{ id: Date.now(), name: '', blocks: [] }]);

    const addKingdom = () => setKingdoms(prev => [...prev, { id: Date.now(), name: '', blocks: [] }]);
    const removeKingdom = (id) => setKingdoms(prev => prev.filter(k => k.id !== id));
    const updateKingdom = (id, data) => setKingdoms(prev => prev.map(k => k.id === id ? data : k));

    const [finalReport, setFinalReport] = useState(null);

    const handleCalculate = () => {
        // Master Calc Logic
        const config = JSON.parse(localStorage.getItem('kvk-calc-config'));
        if (!config) return alert("Configure a pontuação primeiro (Aba Configuração).");

        const report = { total: 0, byType: {} };
        ['infantry', 'cavalry', 'archer', 'siege'].forEach(t => report.byType[t] = { total: 0 });

        kingdoms.forEach(k => {
            k.blocks.forEach(b => {
                const { troop_type, troop_tier, kills } = b;
                if (!troop_type || !troop_tier) return;

                const factor = config[troop_type]?.[troop_tier] || 0;
                const points = kills * factor;

                if (!report.byType[troop_type][troop_tier]) report.byType[troop_type][troop_tier] = 0;

                report.byType[troop_type][troop_tier] += points;
                report.byType[troop_type].total += points;
                report.total += points;
            });
        });

        setFinalReport(report);
        setViewMode('report');
    };

    return (
        <div className="animate-fade-in">
            {viewMode === 'input' && (
                <>
                    <h2 style={{ color: 'var(--primary-gold)', textAlign: 'center', marginBottom: '20px' }}>
                        Calculadora V2 (Leitura Sequencial)
                    </h2>

                    {kingdoms.map(k => (
                        <KvkKingdomReaderV2
                            key={k.id}
                            id={k.id}
                            kingdomData={k}
                            onUpdate={updateKingdom}
                            onRemove={removeKingdom}
                        />
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '80px' }}>
                        <button onClick={addKingdom} className="btn btn-secondary" style={{ borderStyle: 'dashed' }}>
                            <Plus size={18} style={{ marginRight: '8px' }} /> Novo Reino
                        </button>
                    </div>

                    <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '20px', background: 'var(--bg-panel)', borderTop: '1px solid #444', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleCalculate} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
                            <Calculator size={20} style={{ marginRight: '10px' }} /> CALCULAR GERAL
                        </button>
                    </div>
                </>
            )}

            {viewMode === 'report' && finalReport && (
                <div style={{ paddingBottom: '100px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '3rem', color: 'var(--primary-gold)' }}>
                            {new Intl.NumberFormat().format(finalReport.total)} pts
                        </h2>
                    </div>
                    {/* Simple Report Table */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {Object.entries(finalReport.byType).map(([type, data]) => (
                            <div key={type} className="card">
                                <h3 style={{ textTransform: 'capitalize', color: 'var(--text-gold)' }}>{type}</h3>
                                <div>Total: {new Intl.NumberFormat().format(data.total)}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button onClick={() => setViewMode('input')} className="btn btn-secondary"><RotateCcw size={16} /> Voltar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KvkCalculatorV2;
