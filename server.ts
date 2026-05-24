import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ParkingSpot, SpotIngestionPayload } from './src/types.js'; // js extension for ESM if needed, though tsx handles it

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for the PoC (Proof of Concept)
let activeSpots: ParkingSpot[] = [];

// Cleanup interval (mock TTL: 10 minutes = 600,000ms)
setInterval(() => {
  const now = Date.now();
  activeSpots = activeSpots.filter(spot => (now - spot.timestamp) < 600000);
}, 30000); // Check every 30s

// --- REST API ENDPOINTS ---

/**
 * 1. Faz Veri Toplama Ucu (Ingestion)
 * KVKK (Privacy by Design) İlkesi: Asla görüntü verisi kabul edilmez.
 */
app.post('/api/v1/edge/detect', (req, res) => {
  const payload: SpotIngestionPayload = req.body;

  // KVKK Strict Check
  if ('image' in payload || 'frame' in payload || 'video' in payload) {
    console.warn("KVKK UYARISI: Görüntü verisi tespit edildi. Veri droplanıyor.");
    return res.status(403).json({ 
      error: "KVKK ihlali. Görüntü verisi sunucuya gönderilemez. Edge cihazında işlenip silinmelidir." 
    });
  }

  if (!payload.lat || !payload.lng || !payload.timestamp) {
    return res.status(400).json({ error: "Eksik parametreler (lat, lng, timestamp zorunludur)." });
  }

  const newSpot: ParkingSpot = {
    id: `spot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    lat: payload.lat,
    lng: payload.lng,
    timestamp: payload.timestamp || Date.now(),
    confidence: payload.confidence || 0.9,
    source: payload.source || 'mobile-app'
  };

  activeSpots.push(newSpot);
  
  res.status(201).json({ 
    message: "Veri anonim olarak başarıyla kaydedildi.", 
    spotId: newSpot.id 
  });
});

/**
 * 2. Faz Tüketici Ucu (Consumer / B2C)
 * Decay (Zaman Damgası Çürüme) mantığı front-end veya backend'de işlenebilir.
 * Bütün mevcut veriyi döner.
 */
app.get('/api/v1/consumer/spots', (req, res) => {
  // optionally calculate status here or on the frontend. We will let the frontend do the dynamic decay UI.
  res.json({ spots: activeSpots });
});


app.get('/api/v1/consumer/pricing', (req, res) => {
  const supply = activeSpots.length;
  let price = 5;
  let demandLevel = 'NORMAL';
  
  if (supply === 0) {
    price = 15;
    demandLevel = 'CRITICAL';
  } else if (supply <= 3) {
    price = 12;
    demandLevel = 'HIGH';
  } else if (supply <= 7) {
    price = 8;
    demandLevel = 'MEDIUM';
  } else {
    price = 5;
    demandLevel = 'NORMAL';
  }

  res.json({
    price,
    currency: 'TL',
    demandLevel,
    supply
  });
});

// Vite middleware for development (must be AFTER API routes)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ParkEdge Edge AI Server running on port ${PORT}`);
  });
}

startServer();
