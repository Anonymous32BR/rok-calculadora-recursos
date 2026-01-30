import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

const LeadershipLogin = ({ onBack }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (login(username, password)) {
            // Login successful - state updates automatically via context
        } else {
            setError('Credenciais inválidas. Acesso negado.');
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '40px auto' }}>

            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <ArrowLeft size={18} /> Voltar ao Início
            </button>

            <div className="card" style={{ border: '1px solid var(--primary-gold)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dim) 100%)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)'
                    }}>
                        <Lock size={32} color="#1a0f00" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Área da Liderança</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acesso Restrito ao Conselho #1032</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--primary-gold)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Login</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Identificação"
                            style={{ background: 'rgba(0,0,0,0.3)', borderColor: error ? 'var(--accent-red)' : 'var(--border-subtle)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--primary-gold)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Senha de Segurança</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ background: 'rgba(0,0,0,0.3)', borderColor: error ? 'var(--accent-red)' : 'var(--border-subtle)' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--accent-red)',
                            color: '#fca5a5',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <ShieldCheck size={16} /> {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Acessar Painel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeadershipLogin;
