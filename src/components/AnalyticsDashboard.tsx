import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, MapPin, Clock, Search } from 'lucide-react';

const timeData = [
  { time: '08:00', timeToFind: 18, capacity: 60 },
  { time: '10:00', timeToFind: 22, capacity: 45 },
  { time: '12:00', timeToFind: 25, capacity: 30 },
  { time: '14:00', timeToFind: 28, capacity: 35 },
  { time: '16:00', timeToFind: 32, capacity: 40 },
  { time: '18:00', timeToFind: 45, capacity: 10 },
  { time: '20:00', timeToFind: 35, capacity: 25 },
];

const districtData = [
  { location: 'Beşiktaş', fillRate: 96 },
  { location: 'Kadıköy', fillRate: 92 },
  { location: 'Şişli', fillRate: 85 },
  { location: 'Üsküdar', fillRate: 75 },
  { location: 'Fatih', fillRate: 88 },
];

const zoneStatusData = [
  { name: 'Kırmızı Alan (Çok Zor)', value: 45 },
  { name: 'Sarı Alan (Orta)', value: 35 },
  { name: 'Yeşil Alan (Rahat)', value: 20 },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export function AnalyticsDashboard() {
  return (
    <div className="h-full bg-transparent text-zinc-100 p-4 md:p-8 overflow-y-auto w-full pb-20 md:pb-8">
      <div className="mb-6 md:mb-8">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">İSTANBUL OTOPARK TRAFİĞİ</h3>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-2">Canlı Otopark Analizi</h2>
        <p className="text-zinc-400 text-sm font-medium">
          MüsAIt yapay zeka ağının İstanbul genelindeki anonim park verileri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Ağ Aktifliği</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">42,500+</div>
          <div className="text-xs text-emerald-500 font-bold">Aktif Edge Node</div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">En Zor Bölge</span>
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight pt-1">Beşiktaş, Çarşı</div>
          <div className="text-xs text-red-500 font-bold">%96 Doluluk</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Ort. Arama Süresi</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white">28 dk</div>
          <div className="text-xs text-zinc-500 font-bold">18:00'de pik yapıyor</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Tespit Edilen</span>
            <Search className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">8,430</div>
          <div className="text-xs text-emerald-500 font-bold">Son 1 saatteki boşluk</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Ortalama Park Yeri Arama Süresi Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorFindTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#f59e0b' }}
                  formatter={(value: number) => [`${value} dk`, "Süre"]}
                />
                <Area type="monotone" dataKey="timeToFind" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorFindTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">İlçelere Göre Otopark Doluluk Oranı (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="location" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontWeight: 'bold', fontSize: '12px' }}
                  cursor={{fill: '#27272a'}}
                  formatter={(value: number) => [`%${value}`, "Doluluk"]}
                />
                <Bar dataKey="fillRate" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}>
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillRate > 90 ? '#ef4444' : entry.fillRate > 80 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Sokakların Zorluk Dereceleri</h3>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {zoneStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontWeight: 'bold', fontSize: '12px' }}
                    formatter={(value: number) => [`%${value}`, "Oran"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">45%</span>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Kritik</span>
              </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {zoneStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-center flex-col">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">AĞ SAĞLIĞI & VERİ İŞLEME</h3>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed mb-6">
            Kadıköy, Beşiktaş ve Şişli gibi yüksek yoğunluklu lokasyonlarda otopark tahmini, saat bazlı analizlere göre günde binlerce aracı doğru noktalara yönlendirmektedir.
          </p>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col gap-3">
             <div className="flex justify-between items-center">
                 <span className="text-zinc-400 text-xs font-bold">Saatlik Veri İşleme Oranı</span>
                 <span className="text-emerald-500 font-bold text-sm">~1.2 Milyon Olay</span>
             </div>
             <div className="w-full bg-zinc-900 rounded-full h-2">
                 <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
             </div>
             <div className="flex justify-between items-center mt-2">
                 <span className="text-zinc-400 text-xs font-bold">Ortalama Tahmin Başarısı</span>
                 <span className="text-emerald-500 font-bold text-sm">%94.8</span>
             </div>
             <div className="w-full bg-zinc-900 rounded-full h-2">
                 <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.8%' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
