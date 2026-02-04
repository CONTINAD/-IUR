import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Send, ExternalLink, Copy, Check, TrendingUp, Users, Zap, DollarSign } from 'lucide-react';
import { useState } from 'react';
import HeroSection from './components/HeroSection';

// Navbar Component
const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-premium border-0 border-b border-cyan-500/10">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="$IUR" className="w-10 h-10 glow-cyan" />
        <span className="pixel-font text-cyan-400 text-sm">$IUR</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#about" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
        <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition-colors">How It Works</a>
        <a href="#tokenomics" className="text-gray-300 hover:text-cyan-400 transition-colors">Tokenomics</a>
      </div>
      <div className="flex items-center gap-4">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
          <Twitter size={20} />
        </a>
        <button className="btn-primary text-sm py-2 px-4 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">Buy $IUR</button>
      </div>
    </div>
  </nav>
);

// Stats Section
const StatsSection = () => {
  const [statsData, setStatsData] = useState({
    totalDistributed: "0.00",
    holders: "0",
    distributions: "0"
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/stats');
        const data = await res.json();
        setStatsData({
          totalDistributed: parseFloat(data.totalDistributed).toLocaleString(),
          holders: data.holders.toLocaleString(),
          distributions: data.distributions.toLocaleString()
        });
      } catch (e) {
        console.error("Failed to fetch stats, using defaults");
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Distributed (USDC)", value: `$${statsData.totalDistributed}`, icon: DollarSign },
    { label: "Unique Holders", value: statsData.holders, icon: Users },
    { label: "Distributions", value: statsData.distributions, icon: Zap },
  ];

  return (
    <section className="py-16 border-t border-b border-cyan-500/10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 text-center"
            >
              <stat.icon className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-pulse-glow" />
              <div className="stat-value">{stat.value}</div>
              <div className="text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    { num: "01", title: "Buy $IUR", desc: "Purchase $IUR tokens on Pump.fun. You're now part of the infinite strategy." },
    { num: "02", title: "Hold & Earn", desc: "Our bot automatically claims global fees from Pump.fun every minute." },
    { num: "03", title: "Receive USDC", desc: "Fees are swapped to USDC and distributed proportionally to all holders." },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pixel-font text-2xl md:text-3xl text-center mb-16 text-glow-cyan text-cyan-400"
        >
          HOW IT WORKS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="glass-premium p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all"
            >
              <div className="absolute -top-6 -right-6 text-[120px] font-black text-cyan-500/5 group-hover:text-cyan-500/10 transition-colors">
                {step.num}
              </div>
              <div className="relative z-10">
                <div className="text-cyan-400 pixel-font text-sm mb-4">{step.num}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Tokenomics Section
const TokenomicsSection = () => (
  <section id="tokenomics" className="py-24 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent">
    <div className="container mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="pixel-font text-2xl md:text-3xl text-center mb-16 text-glow-gold text-yellow-400"
      >
        TOKENOMICS
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-premium p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-cyan-400">Supply</h3>
          <ul className="space-y-4">
            <li className="flex justify-between text-gray-300">
              <span>Total Supply</span>
              <span className="text-white font-semibold">1,000,000,000</span>
            </li>
            <li className="flex justify-between text-gray-300">
              <span>Tax</span>
              <span className="text-green-400 font-semibold">0%</span>
            </li>
            <li className="flex justify-between text-gray-300">
              <span>LP</span>
              <span className="text-yellow-400 font-semibold">Burned 🔥</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-premium p-8"
        >
          <h3 className="text-xl font-bold mb-6 text-yellow-400">Distribution</h3>
          <ul className="space-y-4">
            <li className="flex justify-between text-gray-300">
              <span>Fair Launch</span>
              <span className="text-white font-semibold">100%</span>
            </li>
            <li className="flex justify-between text-gray-300">
              <span>Team Tokens</span>
              <span className="text-green-400 font-semibold">0%</span>
            </li>
            <li className="flex justify-between text-gray-300">
              <span>Presale</span>
              <span className="text-green-400 font-semibold">None</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

// About Section
const AboutSection = () => (
  <section id="about" className="py-24">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="pixel-font text-2xl md:text-3xl mb-8 text-glow-cyan text-cyan-400">ABOUT $IUR</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            <span className="text-cyan-400 font-semibold">Infinite USDC Rewards</span> is a revolutionary token that turns you into a passive income earner from Pump.fun's global trading fees.
          </p>
          <p className="text-gray-400 leading-relaxed mb-6">
            Every minute, our automated system claims fees from the Pump.fun trading pool, swaps them to USDC, and airdrops them directly to all $IUR holders proportionally.
          </p>
          <p className="text-gray-400 leading-relaxed">
            No staking required. No complex DeFi. Just hold and earn real, stable USDC rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <img src="/logo.png" alt="$IUR Logo" className="w-64 h-64 animate-pulse-glow" />
        </motion.div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="py-12 border-t border-cyan-500/10">
    <div className="container mx-auto text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <img src="/logo.png" alt="$IUR" className="w-8 h-8" />
        <span className="pixel-font text-cyan-400 text-sm">$IUR</span>
      </div>
      <div className="flex justify-center gap-6 mb-8">
        <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><Twitter size={24} /></a>
        <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors"><Send size={24} /></a>
      </div>
      <p className="text-gray-600 text-sm">© 2026 Infinite USDC Rewards. All rights reserved.</p>
      <p className="text-gray-700 text-xs mt-2">Not financial advice. DYOR.</p>
    </div>
  </footer>
);

// Main App
function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <HowItWorksSection />
      <TokenomicsSection />
      <Footer />
    </div>
  );
}

export default App;
