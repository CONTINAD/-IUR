import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const HeroSection = () => {
    const [copied, setCopied] = useState(false);
    const CA = "COMING SOON";

    const copyCA = () => {
        navigator.clipboard.writeText(CA);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* ... (background code remains check context) ... */}

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto w-full">

                {/* Massive Dynamic Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="relative w-full flex justify-center group"
                >
                    {/* Glowing Backlight */}
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-700 mx-auto w-3/4" />

                    {/* The Banner */}
                    <img
                        src="/pixel-banner.png"
                        alt="Infinite USDC Strategy"
                        className="relative w-full max-w-4xl object-contain drop-shadow-[0_0_30px_rgba(0,234,255,0.3)] group-hover:drop-shadow-[0_0_50px_rgba(0,234,255,0.6)] transition-all duration-500 animate-float"
                    />
                </motion.div>

                {/* Glitch Text & Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-6 max-w-3xl"
                >
                    <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 animate-pulse-slow font-[Outift]">
                        SYSTEM ONLINE <span className="text-cyan-500 px-2 animate-pulse">●</span> FEE EXTRACTION ACTIVE
                    </h2>

                    <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
                        The first autonomous protocol that <span className="text-gold-400 font-bold animate-glitch cursor-default">claims global fees</span> from Pump.fun and airdrops USDC directly to your wallet.
                    </p>
                </motion.div>

                {/* Cyber Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6 w-full md:w-auto items-center justify-center"
                >
                    {/* Primary Neon Button */}
                    <button className="neon-border group relative px-10 py-5 bg-dark-800 text-white rounded-none font-bold text-xl tracking-wider overflow-hidden">
                        <span className="relative z-10 flex items-center gap-3 group-hover:text-cyan-300 transition-colors">
                            INITIATE BUY <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                        {/* Inner Gradient */}
                        <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-cyan-800/40 transition-colors duration-300" />
                    </button>

                    {/* Secondary Glass Button */}
                    <button
                        onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-10 py-5 glass-premium text-gray-300 hover:text-white rounded-none font-bold text-lg tracking-wider transition-all hover:bg-white/5 flex items-center gap-3"
                    >
                        <BarChart2 className="w-5 h-5 text-gold-400" />
                        VIEW METRICS
                    </button>
                </motion.div>

                {/* Contract Address - Restored & Polished */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    onClick={copyCA}
                    className="glass-premium px-6 py-3 rounded-full flex items-center gap-3 cursor-pointer hover:border-cyan-400/50 transition-all group"
                >
                    <span className="text-gray-500 text-xs tracking-widest uppercase">Contract:</span>
                    <span className="text-cyan-400 font-mono text-sm tracking-wider group-hover:text-cyan-300 transition-colors">{CA}</span>
                    <div className="w-px h-4 bg-gray-700 mx-1" />
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-500 group-hover:text-white transition-colors" />}
                </motion.div>

            </div>
        </div>
    );
};


export default HeroSection;
