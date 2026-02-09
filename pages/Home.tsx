
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { SiteSettings, Product } from '../types';
import { useLanguage } from '../LanguageContext';

const Home: React.FC<{ settings: SiteSettings; products: Product[] }> = ({ settings, products }) => {
  const { t, dir } = useLanguage();
  // Filter accounts and take top 3
  const accounts = products.filter(p => p.type === 'ACCOUNT').slice(0, 3);

  return (
    <div className="flex flex-col bg-[#020202]">
      {/* Live Status Bar */}
      <div className="bg-[#0a0a0a] text-white py-3 px-4 border-b border-gray-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${settings.serverStatus === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('store_status')}: <span className={settings.serverStatus === 'ONLINE' ? 'text-green-500' : 'text-red-500'}>{settings.serverStatus}</span></span>
          </div>
        </div>
      </div>

      <section className={`relative overflow-hidden bg-[#020202] py-20 lg:py-32 text-${dir === 'rtl' ? 'right' : 'left'}`}>
        {/* Abstract Glow */}
        <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-0`}></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-400 px-5 py-2 rounded-full mb-8 border border-blue-900/30">
                <Award size={18} />
                <span className="text-sm font-black uppercase tracking-wider">{t('hero_badge')}</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.1] text-white tracking-tighter">
                {t('hero_title')} <br />
                <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">{t('hero_subtitle')}</span>
              </h1>
              <p className="text-xl text-gray-400 mb-12 font-medium">{t('hero_desc')}</p>
              <div className={`flex gap-4 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                <Link to="/shop" className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] inline-block">{t('hero_cta')}</Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-[4rem] transform scale-95"></div>
              <img src="https://api.a0.dev/assets/image?text=epic%20blox%20fruits%20warrior%20dark%20theme%20neon%20blue%20accents%20high%20resolution" alt="Hero" className="w-full aspect-square rounded-[4rem] object-cover shadow-2xl border-4 border-[#1a1a1a] relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Blox Fruits Accounts */}
      <section className="py-20 bg-[#050505] border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-${dir === 'rtl' ? 'right' : 'left'}`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-900/20 text-orange-500 px-4 py-1.5 rounded-full mb-4 border border-orange-900/30">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('sect_guaranteed')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                 <span className="text-orange-500">{t('sect_accounts')}</span>
              </h2>
            </div>
            <Link to="/shop" state={{ filter: 'ACCOUNT' }} className="hidden md:flex items-center gap-2 text-gray-500 font-bold hover:text-blue-500 transition-colors">
              {t('view_all')} <ArrowRight size={20} className={dir === 'rtl' ? '' : 'rotate-180'} />
            </Link>
          </div>

          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {accounts.map(account => (
                <div key={account.id} className="bg-[#0a0a0a] rounded-[2.5rem] p-4 shadow-lg border border-gray-800 hover:border-blue-900/50 hover:shadow-blue-900/10 transition-all duration-300 group">
                  <div className="relative h-64 rounded-[2rem] overflow-hidden mb-6 bg-[#111]">
                    <img src={account.image} alt={account.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-black text-orange-500 shadow-sm flex items-center gap-1 border border-orange-900/30`}>
                      <Zap size={12} fill="currentColor" />
                      {t('level')} {account.level}
                    </div>
                  </div>
                  <div className={`px-4 pb-4 text-${dir === 'rtl' ? 'right' : 'left'}`}>
                    <h3 className="text-xl font-black text-white mb-2">{account.name}</h3>
                    <div className={`flex flex-wrap gap-2 mb-6 ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                      {account.fruits?.slice(0, 2).map((fruit, idx) => (
                        <span key={idx} className="bg-[#151515] text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-gray-800">
                          {fruit}
                        </span>
                      ))}
                      {account.rareItems?.slice(0, 1).map((item, idx) => (
                        <span key={idx} className="bg-blue-900/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-blue-900/30">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <Link to="/shop" className="bg-[#151515] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-600 transition-colors border border-gray-800">
                        {t('buy_now')}
                      </Link>
                      <span className="text-2xl font-black text-green-500">{account.price} R</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-[#0a0a0a] rounded-[2rem] border border-gray-800">
                <p className="text-gray-500 font-bold">{t('no_products')}</p>
             </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/shop" state={{ filter: 'ACCOUNT' }} className="inline-block bg-[#111] border border-gray-800 text-gray-300 px-8 py-4 rounded-2xl font-black shadow-sm">
              {t('view_all')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
