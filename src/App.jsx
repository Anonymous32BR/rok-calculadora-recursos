import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import ManualCorrection from './components/ManualCorrection';
import LevelSelector from './components/LevelSelector';
import ResultsCard from './components/ResultsCard';
import SnapshotGenerator from './components/SnapshotGenerator';
import { readQRCodeFromImage } from './core/ocr';
import { calculateTransferable, formatNumber } from './core/calculator';
import { RESOURCES } from './core/constants';
import { UploadCloud, RefreshCw } from 'lucide-react';

import Header from './components/Header';

function App() {
  const [view, setView] = useState('HOME');
  const [resources, setResources] = useState({ food: 0, wood: 0, stone: 0, gold: 0 });
  const [oldResources, setOldResources] = useState(null);
  const [warehouseLevel, setWarehouseLevel] = useState(25);
  const [tradingPostLevel, setTradingPostLevel] = useState(25);
  const [isLoadingOld, setIsLoadingOld] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rok-calc-settings');
    if (saved) {
      const { w, t } = JSON.parse(saved);
      setWarehouseLevel(w || 25);
      setTradingPostLevel(t || 25);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('rok-calc-settings', JSON.stringify({ w: warehouseLevel, t: tradingPostLevel }));
  }, [warehouseLevel, tradingPostLevel]);

  const handleOCRComplete = (data) => {
    setResources(data);
    setView('VERIFY');
  };

  const handleVerifyConfirm = (confirmedData) => {
    setResources(confirmedData);
    setView('RESULTS');
  };

  const handleLoadOld = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoadingOld(true);
    try {
      const data = await readQRCodeFromImage(file);
      // Validate data structure
      if (typeof data.food === 'number') {
        setOldResources(data);
        alert('Contagem anterior carregada com sucesso!');
      } else {
        throw new Error('Formato inválido');
      }
    } catch (err) {
      alert('Erro ao ler QR Code da imagem antiga. Certifique-se que é uma imagem gerada por este sistema.');
      console.error(err);
    } finally {
      setIsLoadingOld(false);
    }
  };

  const calculateNetTotal = (resData) => {
    let total = 0;
    RESOURCES.forEach(r => {
      total += calculateTransferable(resData[r.id], r.id, warehouseLevel, tradingPostLevel).net;
    });
    return total;
  };

  return (
    <div className="app-container">
      <Header />

      {/* INSTRUCTION ALERTS */}
      {/* STRATEGIC NOTICE */}
      {view === 'HOME' && (
        <div className="card" style={{
          borderLeft: '4px solid var(--primary-gold)',
          background: 'linear-gradient(90deg, rgba(197, 160, 89, 0.05) 0%, transparent 100%)'
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-gold)', color: 'black', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Requisitos de Cálculo</h3>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '8px' }}>
              Para garantir a precisão, certifique-se que todas as contas enviadas possuem o <strong>mesmo nível de Armazém e Posto Comercial</strong>.
            </p>
            <p style={{ margin: 0 }}>
              Níveis diferentes aplicam taxas diferentes, o que pode comprometer o resultado final. O sistema aplicará um único nível para todo o lote.
            </p>
          </div>
        </div>
      )}

      {view === 'HOME' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <UploadZone onComplete={handleOCRComplete} />

          {/* History / Previous Count - Discreet Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
            {!oldResources ? (
              <label className="btn btn-secondary" style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: 0.8,
                margin: '0 auto',
                textAlign: 'center'
              }}>
                <input type="file" accept="image/*" onChange={handleLoadOld} style={{ display: 'none' }} />
                <UploadCloud size={18} style={{ marginRight: '8px' }} />
                <span>Carregar Comparativo (Opcional)</span>
              </label>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 600 }}>Dados Anteriores Carregados</span>
                </div>
                <button onClick={() => setOldResources(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                  <span style={{ fontSize: '1.2rem' }}>&times;</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {view === 'VERIFY' && (
        <ManualCorrection
          initialData={resources}
          onConfirm={handleVerifyConfirm}
          onBack={() => setView('HOME')}
        />
      )}

      {view === 'RESULTS' && (
        <div className="animate-fade-in">
          <LevelSelector
            warehouseLevel={warehouseLevel}
            setWarehouseLevel={setWarehouseLevel}
            tradingPostLevel={tradingPostLevel}
            setTradingPostLevel={setTradingPostLevel}
          />

          <ResultsCard
            resourceData={resources}
            warehouseLevel={warehouseLevel}
            tradingPostLevel={tradingPostLevel}
          />

          {/* Comparison View */}
          {oldResources && (
            <div className="card" style={{ marginTop: '1rem', border: '1px solid #555' }}>
              <h3 className="text-center" style={{ marginBottom: '1rem' }}>Comparação com Anterior</h3>
              {RESOURCES.map(r => {
                const currentNet = calculateTransferable(resources[r.id], r.id, warehouseLevel, tradingPostLevel).net;
                const oldNet = calculateTransferable(oldResources[r.id], r.id, warehouseLevel, tradingPostLevel).net;
                const diff = currentNet - oldNet;
                const color = diff >= 0 ? 'var(--success)' : 'var(--danger)';
                const symbol = diff >= 0 ? '+' : '';

                return (
                  <div key={r.id} className="flex-row" style={{ borderBottom: '1px solid #444', padding: '8px 0' }}>
                    <span style={{ color: r.color }}>{r.label}</span>
                    <span style={{ color, fontWeight: 'bold' }}>
                      {symbol}{formatNumber(diff)}
                    </span>
                  </div>
                );
              })}
              <div className="text-center" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Total Diferença:
                <span style={{ color: (calculateNetTotal(resources) - calculateNetTotal(oldResources)) >= 0 ? 'var(--success)' : 'var(--danger)', marginLeft: '8px' }}>
                  {calculateNetTotal(resources) - calculateNetTotal(oldResources) >= 0 ? '+' : ''}
                  {formatNumber(calculateNetTotal(resources) - calculateNetTotal(oldResources))}
                </span>
              </div>
            </div>
          )}

          <SnapshotGenerator data={resources} netTotal={calculateNetTotal(resources)} />

          <button className="btn btn-secondary" onClick={() => {
            setOldResources(null); // Clear comparison data
            setResources({ food: 0, wood: 0, stone: 0, gold: 0 }); // Optional: reset current resources too
            setView('HOME');
          }} style={{ marginTop: '2rem' }}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Nova Contagem
          </button>
        </div>
      )}

      {/* FOOTER - CLEAN */}
      {view === 'HOME' && (
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px', opacity: 0.6 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Todos os direitos reservados a Anonymous do Reino Granada #1032
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary-gold-dim)', fontStyle: 'italic' }}>
            Maior e mais vencedor reino Brasileiro de Rise Of Kingdoms • Mais de 6 anos de lutas e conquistas
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
