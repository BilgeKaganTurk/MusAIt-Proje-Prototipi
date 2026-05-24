/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Map, Camera, FileText, BarChart2 } from 'lucide-react';
import { MapSimulator } from './components/MapSimulator';
import { EdgeSimulator } from './components/EdgeSimulator';
import { ProjectPlan } from './components/ProjectPlan';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ParkingSpot } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'plan' | 'dashboard'>('map');
  const [activeSpots, setActiveSpots] = useState<ParkingSpot[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubBanner, setShowSubBanner] = useState(true);

  // Fetch spots from backend
  const fetchSpots = async () => {
    try {
      const res = await fetch('/api/v1/consumer/spots');
      if (res.ok) {
        const data = await res.json();
        setActiveSpots(data.spots || []);
      }
    } catch (e) {
      console.error("Veri çekme hatası:", e);
    }
  };

  useEffect(() => {
    fetchSpots();
    const interval = setInterval(fetchSpots, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateDetection = async (lat: number, lng: number) => {
    try {
      await fetch('/api/v1/edge/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          timestamp: Date.now(),
          confidence: 0.95,
          source: 'mobile-app'
          // notice: NO image field here. KVKK!
        })
      });
      // Fetch immediately to show on map quickly
      fetchSpots();
    } catch (e) {
      console.error("Bulut iletişimi başarısız:", e);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 font-sans text-zinc-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="h-[60px] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 shrink-0 bg-zinc-950">
        <div className="font-extrabold tracking-tighter text-xl md:text-2xl text-emerald-500">
          MüsAIt
        </div>
        <div className="flex gap-2 md:gap-5 items-center">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest hidden md:inline">LOCATION: MODA, ISTANBUL</span>
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-2 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-[11px] font-bold flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> <span className="hidden sm:inline">PRIVACY SHIELD ACTIVE</span><span className="sm:hidden">GİZLİLİK AKTİF</span>
          </div>
          {!isSubscribed && (
            <button 
              onClick={() => setShowSubBanner(true)}
              className="bg-amber-500/10 border border-amber-500/50 text-amber-500 px-2 py-1.5 md:px-3 rounded-lg text-[10px] md:text-[11px] font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
            >
              PREMIUM
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar Navigation (Desktop/Tablet) */}
        <div className="hidden md:flex w-[280px] border-r border-zinc-800 bg-zinc-900 flex-col p-5 gap-6 shrink-0 z-20 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">SİSTEM MENÜSÜ</h3>
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold tracking-tight ${
                    activeTab === 'map' ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'text-zinc-400 hover:bg-zinc-950/50 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Map className="w-4 h-4" />
                    Tüketici Haritası
                  </div>
                  {activeSpots.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-black border border-emerald-500/20">
                      {activeSpots.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold tracking-tight ${
                    activeTab === 'dashboard' ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'text-zinc-400 hover:bg-zinc-950/50 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart2 className="w-4 h-4" />
                    Analiz
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('plan')}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-bold tracking-tight ${
                    activeTab === 'plan' ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'text-zinc-400 hover:bg-zinc-950/50 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    İnfo
                  </div>
                </button>
              </nav>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">SİSTEM BİLGİSİ</h3>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg mb-3">
                <div className="text-xs text-zinc-400 mb-1">Abonelik Durumu</div>
                <div className={`text-lg font-bold tracking-tight ${isSubscribed ? 'text-emerald-500' : 'text-zinc-500'}`}>
                  {isSubscribed ? 'PREMIUM (Aktif)' : 'ÜCRETSİZ PLAN'}
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                <div className="text-xs text-zinc-400 mb-1">Gizlilik & Güvenlik</div>
                <div className="text-lg font-bold tracking-tight text-emerald-500">%100 Anonim</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#111113] overflow-hidden relative border-r border-zinc-800 pb-[64px] md:pb-0">
          <EdgeSimulator onSimulateDetection={handleSimulateDetection} />
          {activeTab === 'map' && <MapSimulator activeSpots={activeSpots} />}
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'plan' && <ProjectPlan />}
          
          {/* Subscription Overlay */}
          {!isSubscribed && showSubBanner && (
            <div className="absolute inset-0 z-[1000] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
                <button 
                  onClick={() => setShowSubBanner(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  Kapat
                </button>
                <h2 className="text-xl md:text-2xl font-black text-white mb-2">MüsAIt Premium'a Geç</h2>
                <p className="text-zinc-400 text-xs md:text-sm mb-6">
                  İlk ay tamamen ücretsiz, sonraki aylar sadece <strong className="text-emerald-500">50 TL</strong>. Sınırsız rota kitleme ve otonom konum önceliği kazanın.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Sınırsız Park Bulma
                  </li>
                  <li className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    İlk Ay Ücretsiz Deneme
                  </li>
                  <li className="flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Reklamsız Harita
                  </li>
                </ul>
                <button 
                  onClick={() => {
                    setIsSubscribed(true);
                    setShowSubBanner(false);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3 md:py-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  ÜCRETSİZ BAŞLA
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-zinc-950 border-t border-zinc-800 flex items-center justify-around z-40 px-2 pb-safe">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'map' ? 'text-white' : 'text-zinc-500'}`}
          >
            <div className="relative">
              <Map className="w-5 h-5" />
              {activeSpots.length > 0 && activeTab !== 'map' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] font-bold">Harita</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'dashboard' ? 'text-white' : 'text-zinc-500'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Analiz</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'plan' ? 'text-white' : 'text-zinc-500'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold">İnfo</span>
          </button>
        </div>
        
        {/* Right Panel for data freshness, if map tab is active */}
        {activeTab === 'map' && (
          <div className="w-[300px] border-l border-zinc-800 bg-zinc-900 flex flex-col p-5 gap-6 shrink-0 z-10 hidden lg:flex">
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">VERİ TAZELİĞİ (FRESHNESS)</h3>
              <div className="flex flex-col gap-3">
                <div className="bg-zinc-950 border border-zinc-800 border-l-4 border-l-emerald-500 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Doğrulanmış Boş (0-3dk)</div>
                  <div className="text-xl font-bold tracking-tight text-emerald-500">
                    {activeSpots.filter(s => (Date.now() - s.timestamp) < 180000).length} Lokasyon
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 border-l-4 border-l-yellow-500 p-4 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">Riskli / Çürüyen (3-10dk)</div>
                  <div className="text-xl font-bold tracking-tight text-yellow-500">
                    {activeSpots.filter(s => (Date.now() - s.timestamp) >= 180000).length} Lokasyon
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
