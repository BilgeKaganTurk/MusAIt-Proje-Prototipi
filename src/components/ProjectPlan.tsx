import React from 'react';
import ReactMarkdown from 'react-markdown';

const markdownContent = `
# Selam! MüsAIt'e Hoş Geldin 👋

Park yeri aramak artık eskisi gibi can sıkıcı değil. MüsAIt ile İstanbul sokaklarında boş park yeri bulmak çocuk oyuncağı. Peki uygulamayı nasıl kullanacaksın? Gel hemen anlatalım.

## 🗺️ Park Haritası Ne İşe Yarar?
Haritada gördüğün yeşil noktalar, "Hey, burada boş bir yer var!" demek. Bu yerler etrafta dolaşan kameralı araçlar (biz onlara Edge Node diyoruz) sayesinde tamamen otonom olarak tespit ediliyor. Sen hiçbir şey yapmıyorsun, sistem tıkır tıkır işliyor.

* **Yeşil Pinler:** Yepyeni, taptaze boş yerler. Buraya yönelmek harika bir fikir.
* **Sarı Pinler:** Üzerinden biraz zaman geçmiş yerler (3 dakikadan eski). Acil durumlarda denenebilir ama unutma, başkası senden önce kapmış olabilir.

## 🚗 Nasıl Rota Oluştururum?
Gözüne kestirdiğin bir yeşil pine tıkla, açılan kutucuktan **"ROTA KİLİTLE"** butonuna bas. İşte bu kadar! Seni oraya hemen yönlendireceğiz. Çizgiyi takip etmen yeterli.

## 💎 Premium Ayrıcalığı Nedir?
İlk ay bizden, tamamen ücretsiz! Sonraki aylar sadece birer kahve parasına (Aylık 50 TL) sınırsız özelliklere ulaşırsın. Premium olduğunda:
* Park bulmada öncelik kazanırsın.
* Reklamsız, tertemiz bir haritada dolaşırsın.
* En iyi özellik: Çevrendeki otonom ağdan özel olarak **Park Yeri Talebi** oluşturabilirsin!  

*İpucu: "Park Yeri Talebi Oluştur" butonuna bas, nereye gitmek istediğini söyle; biz senin için etrafı tarayıp sana en uygun yeri tam zamanında buluruz.*

## 🔒 Gizliliğin Bizim İçin Önemli
Kameralarımız insanları veya plakaları izlemek için değil, yalnızca asfaltı analiz etmek için eğitildi. Yüzler, plakalar veya hiçbir kişisel veri asla kaydedilmez ve buluta gönderilmez. Sadece "Şurada boşluk var" bilgisi gelir. Yani senin ve sokaktaki herkesin verisi %100 güvende!
`;

export function ProjectPlan() {
  return (
    <div className="h-full bg-transparent text-zinc-100 p-4 md:p-8 overflow-y-auto custom-scrollbar pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto markdown-body">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-4xl font-black tracking-tighter text-white mb-8 border-b border-zinc-800 pb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-emerald-500 mt-10 mb-4 tracking-tight" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-zinc-200 mt-6 mb-3 tracking-tight" {...props} />,
            p: ({node, ...props}) => <p className="text-zinc-400 leading-relaxed mb-4 text-sm font-medium" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-4 text-zinc-400 text-sm font-medium space-y-2 marker:text-zinc-700 font-bold" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            strong: ({node, ...props}) => <strong className="text-zinc-200 font-bold" {...props} />,
            em: ({node, ...props}) => <em className="text-zinc-300 italic" {...props} />,
            code: ({node, ...props}) => <code className="bg-zinc-900 border border-zinc-800 text-emerald-500 px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...props} />,
            hr: ({node, ...props}) => <hr className="border-t border-zinc-800 my-8" {...props} />
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
}
