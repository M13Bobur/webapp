import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useOrderSocket = (onNewOrder) => {
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.emit('join:admin');

    const playSound = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
    };

    socket.on('order:new', (order) => {
      playSound();
      onNewOrder?.(order);
    });

    socket.on('order:updated', (order) => {
      onNewOrder?.(order, 'update');
    });

    return () => socket.disconnect();
  }, [onNewOrder]);
};
