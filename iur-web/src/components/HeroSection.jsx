import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2 } from 'lucide-react';

const HeroSection = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">

                {/* Animated Coin */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-64 h-64 md:w-96 md:h-96"
                >
                    <div className="absolute inset-0 bg-cyan-DEFAULT/20 rounded-full blur-xl animate-pulse" />
                    <img
                        src="/hero-coin.png"
                        alt="Infinite USDC Coin"
                        className="w-full h-full object-contain animate-float drop-shadow-[0_0_30px_rgba(0,234,255,0.3)]"
                    />
                </motion.div>

                {/* Text/Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4 flex flex-col items-center"
                >
                    <img
                        src="/pixel-banner.png"
                        alt="Infinite USDC Strategy"
                        className="w-full max-w-2xl object-contain drop-shadow-[0_0_15px_rgba(0,234,255,0.5)]"
                    />
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light">
                        The first token that automatically claims global fees and distributes USDC directly to your wallet.
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col md:flex-row gap-4 w-full md:w-auto"
                >
                    <button className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2">
                        Buy on Pump.fun
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="px-8 py-4 bg-transparent border border-gray-600 hover:border-gold-500 text-gray-300 hover:text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                        <BarChart2 className="w-5 h-5" />
                        View Chart
                    </button>
                </motion.div>

            </div>
        </div>
    );
};

export default HeroSection;
