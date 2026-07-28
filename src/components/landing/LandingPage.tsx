import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import {
  Zap,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  LogIn,
  Check,
  Share2,
  Clock,
  BarChart3,
  Smartphone,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { platformConfig } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const whatsappNumber = platformConfig.whatsappNumber || '882412117';
  
  const getWhatsappUrl = (planType?: string) => {
    const text = planType
      ? `Hello Admin, I want to buy the ${planType} Teacher Plan (₹${planType === 'Monthly' ? platformConfig.monthlyPrice : platformConfig.yearlyPrice}) for my coaching institute. Please grant me Teacher Panel access.`
      : `Hello Admin, I need information and access to the Teacher Mock Test Series Platform.`;
    return `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl border border-slate-800">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Teacher's #1 Online Mock Test Series Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {platformConfig.headlineText}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            {platformConfig.subtitleText}
          </p>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm font-bold text-slate-200">
              <Share2 className="w-4 h-4 text-blue-400" /> 1-Click WhatsApp Link Share
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm font-bold text-slate-200">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Instant Score & Leaderboard
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-amber-400" /> 100% Mobile Friendly
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
              <LogIn className="w-5 h-5" />
              Teacher Panel Login / Signup
            </button>

            <a
              href={getWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
              <MessageSquare className="w-5 h-5" />
              Connect on WhatsApp ({whatsappNumber})
            </a>
          </div>
        </div>
      </section>

      {/* Affordable Pricing Section */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Affordable Teacher Plans
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Teacher Affordable Daily Mock Test Series Plans
          </h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium">
            Select an affordable plan for your coaching institute or school to start creating & sharing online tests instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Monthly Plan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col justify-between hover:border-blue-300 transition duration-300 relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Monthly Plan
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">Monthly Teacher Access</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    ₹{platformConfig.monthlyPrice}
                  </div>
                  <span className="text-xs font-bold text-slate-500">per month</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Plan Features:</p>
                <ul className="space-y-2.5">
                  {platformConfig.monthlyPlanFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href={getWhatsappUrl('Monthly')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Get Monthly Plan on WhatsApp (₹{platformConfig.monthlyPrice})
              </a>
            </div>
          </div>

          {/* Yearly Plan (Popular) */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-500 shadow-2xl flex flex-col justify-between relative transform lg:-translate-y-2">
            <div className="absolute -top-4 right-8 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-lg border border-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> BEST VALUE & MOST POPULAR
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-black uppercase text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                    Yearly Savings Plan
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">1 Year Unlimited Access</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                    ₹{platformConfig.yearlyPrice}
                  </div>
                  <span className="text-xs font-bold text-slate-300">per year (Only ₹150/mo)</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-3">
                <p className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">All Premium Features:</p>
                <ul className="space-y-2.5">
                  {platformConfig.yearlyPlanFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href={getWhatsappUrl('Yearly')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30"
              >
                <MessageSquare className="w-4 h-4" />
                Get Yearly Plan on WhatsApp (₹{platformConfig.yearlyPrice})
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Testimonials Section */}
      <section className="space-y-8 pt-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Teacher Reviews & Testimonials
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Trusted by Top Coaching Institutes & Teachers
          </h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium">
            See what educators say about our affordable test series platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {platformConfig.testimonials.map((testim) => (
            <div
              key={testim.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(testim.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-medium">
                  "{testim.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  {testim.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{testim.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500">{testim.roleOrInstitute}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom WhatsApp Floating Access Bar */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-2xl font-black text-white">
            Ready to Start Your Online Test Series?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            Connect with Main Admin on WhatsApp to activate your teacher panel in 2 minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
          >
            <LogIn className="w-4 h-4 text-blue-600" />
            Teacher Login
          </button>

          <a
            href={getWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2 border border-emerald-400"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            WhatsApp ({whatsappNumber})
          </a>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};
