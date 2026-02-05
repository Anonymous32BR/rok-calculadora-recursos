import React, { useState, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import ManualCorrection from './components/ManualCorrection';
import LevelSelector from './components/LevelSelector';
import ResultsCard from './components/ResultsCard';
import SnapshotGenerator from './components/SnapshotGenerator';
import { readQRCodeFromImage } from './core/ocr';
import { calculateTransferable, formatNumber, formatCompact } from './core/calculator';
import { RESOURCES } from './core/constants';
import { t, DEFAULT_LANGUAGE } from './i18n'; // Updated Import
import { UploadCloud, RefreshCw, AlertTriangle } from 'lucide-react';

import Header from './components/Header';

function App() {
  const [view, setView] = useState('HOME');
  // Use DEFAULT_LANGUAGE from i18n module
  const [lang, setLang] = useState(DEFAULT_LANGUAGE);

  // t is now a function, not an object. We don't need 'const t = TEXTS[lang];' anymore.

  const [resources, setResources] = useState({
    food: { total: 0, bag: 0 },
    wood: { total: 0, bag: 0 },
    stone: { total: 0, bag: 0 },
    gold: { total: 0, bag: 0 }
  });
  const [oldResources, setOldResources] = useState(null);
  const [warehouseLevel, setWarehouseLevel] = useState(25);
  const [tradingPostLevel, setTradingPostLevel] = useState(25);
  const [isLoadingOld, setIsLoadingOld] = useState(false);

  // Load settings & language
  useEffect(() => {
    const saved = localStorage.getItem('rok-calc-settings');
    if (saved) {
      const { w, t, l } = JSON.parse(saved);
      setWarehouseLevel(w || 25);
      setTradingPostLevel(t || 25);
      if (l) setLang(l);
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('rok-calc-settings', JSON.stringify({ w: warehouseLevel, t: tradingPostLevel, l: lang }));
  }, [warehouseLevel, tradingPostLevel, lang]);

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
      console.log("QR Data Loaded:", data);
      // Validate data structure and normalize
      const normalized = {};
      const keys = ['food', 'wood', 'stone', 'gold'];

      let isValid = false;

      keys.forEach(k => {
        if (typeof data[k] === 'number') {
          // Old format
          normalized[k] = { total: data[k], bag: 0 };
          isValid = true;
        } else if (data[k] && typeof data[k].total === 'number') {
          // New format
          normalized[k] = data[k];
          isValid = true;
        } else {
          normalized[k] = { total: 0, bag: 0 };
        }
      });

      if (isValid) {
        setOldResources(normalized);
        // alert removed: UI update is sufficient
      } else {
        throw new Error('Invalid format');
      }
    } catch (err) {
      alert('Erro/Error: ' + err.message);
      console.error(err);
    } finally {
      setIsLoadingOld(false);
    }
  };

  const calculateNetTotal = (resData) => {
    if (!resData) return 0;
    let total = 0;
    RESOURCES.forEach(r => {
      const val = resData[r.id]?.total !== undefined ? resData[r.id].total : (resData[r.id] || 0);
      total += calculateTransferable(val, r.id, warehouseLevel, tradingPostLevel).net;
    });
    return total;
  };

  return (
    <>
      <Header lang={lang} setLang={setLang} />

      <div className="app-container">

        {/* INSTRUCTION ALERTS - GLASS STYLE */}
        {view === 'HOME' && (
          <div className="requirements-card glass gold" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle className="text-gold" size={24} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t(lang, 'requirements.title')}</h3>
            </div>

            <div>
              <p style={{ margin: 0 }}>
                {t(lang, 'requirements.description')}
              </p>
            </div>
          </div>
        )}

        {view === 'HOME' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <UploadZone onComplete={handleOCRComplete} lang={lang} />

            {/* History / Previous Count - Discreet Section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
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
                  <span>{t(lang, 'comparison.button')}</span>
                </label>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 600 }}>{t(lang, 'upload.oldLoaded')}</span>
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
            lang={lang}
          />
        )}

        {view === 'RESULTS' && (
          <div className="animate-fade-in">
            <LevelSelector
              warehouseLevel={warehouseLevel}
              setWarehouseLevel={setWarehouseLevel}
              tradingPostLevel={tradingPostLevel}
              setTradingPostLevel={setTradingPostLevel}
              lang={lang}
            />

            <ResultsCard
              resourceData={resources}
              warehouseLevel={warehouseLevel}
              tradingPostLevel={tradingPostLevel}
              lang={lang}
            />

            {/* Comparison View */}
            {oldResources && (
              <div className="card glass-card" style={{ marginTop: '1rem' }}>
                <h3 className="text-center" style={{ marginBottom: '1rem' }}>{t(lang, 'comparison.title')}</h3>
                {RESOURCES.map(r => {
                  // FIX: Extract numeric TOTAL from the object structure
                  const currentTotal = resources[r.id]?.total || 0;
                  const oldTotal = oldResources[r.id]?.total || 0;

                  const currentNet = calculateTransferable(currentTotal, r.id, warehouseLevel, tradingPostLevel).net;
                  const oldNet = calculateTransferable(oldTotal, r.id, warehouseLevel, tradingPostLevel).net;

                  const diff = currentNet - oldNet;
                  const color = diff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
                  const symbol = diff > 0 ? '+' : ''; // Only show + if positive, negative numbers have - natively

                  return (
                    <div key={r.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      padding: '12px 8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={r.icon} alt="" style={{ width: '20px', height: '20px' }} />
                        <span style={{ color: r.color, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                          {t(lang, `resources.${r.id}`) || r.label}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                        <span style={{ color, fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                          {symbol}{formatNumber(diff)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                          (~{formatCompact(diff)})
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                  {t(lang, 'comparison.diffTotal')}:
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginLeft: '12px', verticalAlign: 'middle' }}>
                    <span style={{ color: (calculateNetTotal(resources) - calculateNetTotal(oldResources)) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '1.2rem', lineHeight: '1' }}>
                      {(calculateNetTotal(resources) - calculateNetTotal(oldResources)) >= 0 ? '+' : ''}
                      {formatNumber(calculateNetTotal(resources) - calculateNetTotal(oldResources))}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                      (~{formatCompact(calculateNetTotal(resources) - calculateNetTotal(oldResources))})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Report Data Object */}
            {(() => {
              const reportData = {
                resources: {},
                resumo: {
                  totalBrutoGeral: 0,
                  totalLiquidoGeral: 0
                },
                metadata: {
                  dataGeracao: new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US'),
                  horaGeracao: new Date().toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                  warehouseLevel,
                  tradingPostLevel,
                  lang: lang // Pass lang to report
                }
              };

              // Calculate per resource
              RESOURCES.forEach(r => {
                const resValue = resources[r.id];
                const total = typeof resValue === 'object' ? resValue.total : (resValue || 0);
                const bag = typeof resValue === 'object' ? resValue.bag : 0;
                const open = Math.max(0, total - bag);

                reportData.resources[r.id] = {
                  id: r.id, // ID for translation lookup
                  label: r.label, // Fallback
                  color: r.color,
                  icon: r.icon,
                  abertos: calculateTransferable(open, r.id, warehouseLevel, tradingPostLevel),
                  mochila: calculateTransferable(bag, r.id, warehouseLevel, tradingPostLevel),
                  total: calculateTransferable(total, r.id, warehouseLevel, tradingPostLevel)
                };

                // Accumulate Grand Totals (using the TOTAL scenario)
                reportData.resumo.totalBrutoGeral += reportData.resources[r.id].total.gross;
                reportData.resumo.totalLiquidoGeral += reportData.resources[r.id].total.net;
              });

              return <SnapshotGenerator reportData={reportData} />;
            })()}

            <button className="btn btn-secondary" onClick={() => {
              setOldResources(null); // Clear comparison data
              setResources({
                food: { total: 0, bag: 0 },
                wood: { total: 0, bag: 0 },
                stone: { total: 0, bag: 0 },
                gold: { total: 0, bag: 0 }
              }); // Reset current resources
              setView('HOME');
            }} style={{ marginTop: '2rem' }}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} />
              {t(lang, 'upload.newScan')}
            </button>
          </div>
        )}

        {/* FOOTER - CLEAN */}
        {view === 'HOME' && (
          <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px', opacity: 0.6 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t(lang, 'footer.title')}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary-gold-dim)', fontStyle: 'italic' }}>
              {t(lang, 'footer.copyright')}
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              v3.0
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
