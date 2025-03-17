
import { useEffect, useRef } from 'react';

const AudioWaveCanvas = () => {
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const waves = [];
    const waveCount = 30;
    const colors = ['#5e16ea', '#7c3aed', '#a78bfa', '#c4b5fd'];
    
    // Initialize waves
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        x: Math.random() * canvas.width,
        y: canvas.height / 2,
        length: Math.random() * 50 + 50,
        amplitude: Math.random() * 20 + 10,
        frequency: Math.random() * 0.01 + 0.01,
        speed: Math.random() * 0.1 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = Math.sin(x * wave.frequency + wave.x) * wave.amplitude + canvas.height / 2;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.opacity;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Move the wave
        wave.x += wave.speed;
        if (wave.x > 1000) wave.x = 0;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <canvas ref={audioCanvasRef} className="w-full h-full"></canvas>;
};

export default AudioWaveCanvas;
