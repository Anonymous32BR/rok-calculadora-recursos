import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Settings, Calculator, Trophy } from 'lucide-react';
import KvkConfiguration from './KvkConfiguration';
import KvkCalculatorV2 from './KvkCalculatorV2';

const LeadershipDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('config'); // config, calculator, ranking

    return (
        <div className="animate-fade-in">
            {/* Header / Nav */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                borderBottom: '1px solid var(--border-gold)',
                paddingBottom: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-gold)' }}>Painel KVK</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ferramentas Oficiais #1032</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={logout} className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
                        <LogOut size={16} style={{ marginRight: '8px' }} /> Sair
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                <button
                    className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('config')}
                >
                    <Settings size={18} style={{ marginRight: '8px' }} /> Configuração
                </button>
                <button
                    className={`btn ${activeTab === 'calculator' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('calculator')}
                >
                    <Calculator size={18} style={{ marginRight: '8px' }} /> Calculadora
                </button>
                <button
                    className={`btn ${activeTab === 'ranking' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('ranking')}
                >
                    <Trophy size={18} style={{ marginRight: '8px' }} /> Ranking
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'config' && <KvkConfiguration />}

            {activeTab === 'calculator' && <KvkCalculatorV2 />}

            {activeTab === 'ranking' && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>🏆 Ranking em Breve 🏆</h3>
                    <p style={{ marginTop: '16px' }}>Tabela final de pontuação dos reinos</p>
                </div>
            )}
        </div>
    );
};

export default LeadershipDashboard;
