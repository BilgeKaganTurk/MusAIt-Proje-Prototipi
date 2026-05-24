import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Send, Car, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EdgeSimulatorProps {
  onSimulateDetection: (lat: number, lng: number) => Promise<void>;
}

export function EdgeSimulator({ onSimulateDetection }: EdgeSimulatorProps) {
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(async () => {
        // Simulate detection hit every few seconds natively without visuals
        if (Math.random() > 0.4) {
          setTimeout(async () => {
            const lat = 40.9800 + Math.random() * 0.0100;
            const lng = 29.0200 + Math.random() * 0.0150;
            await onSimulateDetection(lat, lng);
          }, 600);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isRunning, onSimulateDetection]);

  return null;
}
