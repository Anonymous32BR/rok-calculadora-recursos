import React from 'react';
import { t } from '../i18n';

const Header = ({ lang, setLang }) => {
    return (
        <header className="top-header">
            {/* Main Content Container */}
            <div className="header-container">
                <div className="logo left">
                    <img src="/assets/logos/K32-ROK.png" alt="K32 Rise of Kingdoms" />
                </div>

                <div className="center-stack">
                    <div className="lang-switch">
                        <img
                            src="/assets/flags/br.png"
                            alt="Português"
                            className={`flag ${(lang === 'pt' || lang === 'pt-BR') ? 'active' : ''}`}
                            onClick={() => setLang('pt-BR')}
                        />
                        <img
                            src="/assets/flags/us.png"
                            alt="English"
                            className={`flag ${(lang === 'en' || lang === 'en-US') ? 'active' : ''}`}
                            onClick={() => setLang('en-US')}
                        />
                    </div>

                    <div className="title-area">
                        <h1 className="rok-font">{t(lang, 'app.main')}</h1>
                        <p>{t(lang, 'app.subtitle')}</p>
                    </div>
                </div>

                <div className="logo right">
                    <img src="/assets/logos/Anonymous32BR.png" alt="Anonymous 32BR" />
                </div>
            </div>
        </header>
    );
};

export default Header;
