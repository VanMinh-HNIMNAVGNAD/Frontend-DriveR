import { useEffect, useRef, useState } from 'react';
import { Sparkles, Flower2 } from 'lucide-react';

export default function AnimatedBackground({ mode = 'tech' }) {
    const canvasRef = useRef(null);
    const [themeMode, setThemeMode] = useState(mode); // 'tech' | 'petals'

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Tech particles initialization
        const particlesCount = themeMode === 'tech' ? 55 : 40;
        const items = [];

        if (themeMode === 'tech') {
            for (let i = 0; i < particlesCount; i++) {
                items.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    radius: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.4 + 0.2,
                });
            }
        } else {
            // Petals initialization (cánh hoa rơi)
            for (let i = 0; i < particlesCount; i++) {
                items.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 7 + 5,
                    speedY: Math.random() * 1.0 + 0.4,
                    speedX: Math.random() * 0.5 - 0.25,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 1.8,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            if (themeMode === 'tech') {
                // Render floating tech network nodes & connecting lines
                for (let i = 0; i < items.length; i++) {
                    const p = items[i];
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
                    ctx.fill();

                    // Connect nearby particles
                    for (let j = i + 1; j < items.length; j++) {
                        const p2 = items[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist / 120)})`;
                            ctx.lineWidth = 0.7;
                            ctx.stroke();
                        }
                    }
                }
            } else {
                // Render Sakura Petals falling (cánh hoa rơi)
                for (let i = 0; i < items.length; i++) {
                    const p = items[i];
                    p.y += p.speedY;
                    p.x += Math.sin(p.y * 0.01) + p.speedX;
                    p.rotation += p.rotationSpeed;

                    if (p.y > height + 20) {
                        p.y = -20;
                        p.x = Math.random() * width;
                    }

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);

                    // Draw soft petal shape
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
                    ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
                    ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
                    ctx.fill();

                    ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [themeMode]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dark Base Atmosphere */}
            <div className="absolute inset-0 bg-slate-950" />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40" />

            {/* Section-Aware Radial Glowing Lights */}
            {/* Hero Ambient Blue Glow */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

            {/* Features Purple Accent Ambient Light */}
            <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

            {/* About Indigo Ambient Light */}
            <div className="absolute top-[65%] left-[-10%] w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

            {/* Footer Bottom Sky Glow */}
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Interactive Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

            {/* Floating theme toggle button (Bottom left pointer interactive) */}
            <div className="pointer-events-auto fixed bottom-6 left-6 z-50">
                <button
                    onClick={() => setThemeMode(prev => prev === 'tech' ? 'petals' : 'tech')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-xl text-white text-xs font-medium border border-white/10 shadow-xl hover:border-blue-500/30 transition-all cursor-pointer group"
                    title="Đổi hiệu ứng nền (Công nghệ / Cánh hoa rơi)"
                >
                    {themeMode === 'tech' ? (
                        <>
                            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                            <span className="text-slate-300 group-hover:text-white">Mạng công nghệ</span>
                        </>
                    ) : (
                        <>
                            <Flower2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                            <span className="text-slate-300 group-hover:text-white">Cánh hoa rơi</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
