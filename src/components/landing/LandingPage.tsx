import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { FreeTrialModal } from '../admin/FreeTrialModal';
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
  Gift,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { platformConfig } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);

  const whatsappNumber = platformConfig.whatsappNumber && platformConfig.whatsappNumber.length >= 10 ? platformConfig.whatsappNumber : '8824125117';
  
  const getWhatsappUrl = (planType?: string) => {
    const text = planType
      ? `Hello Admin, I want to buy the ${planType} Teacher Plan (₹${planType === 'Monthly' ? platformConfig.monthlyPrice : platformConfig.yearlyPrice}) for my coaching institute. Please grant me Teacher Panel access.`
      : `Hello Admin, I need information and access to the Teacher Mock Test Series Platform.`;
    return `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 animate-in fade-in duration-300">
      {/* Hero Section - Open, Clean, Professional & High-Converting */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 text-slate-900">
        {/* Subtle background gradient glow elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/60 via-indigo-50/40 to-slate-50/20 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 px-4">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/90 text-blue-700 text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Teacher's #1 Online Mock Test Series Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Daily Mock Test <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Live Share</span> With Direct Link To Students
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-semibold">
            {platformConfig.subtitleText}
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs">
              <Share2 className="w-4 h-4 text-blue-600" /> 1-Click WhatsApp Link Share
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Instant Score & Leaderboard
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs">
              <Smartphone className="w-4 h-4 text-amber-500" /> 100% Mobile Friendly
            </span>
          </div>

          {/* Special 3-Day Free Trial Highlight Box */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300/80 p-4 sm:p-5 rounded-3xl shadow-lg max-w-2xl mx-auto text-center space-y-3 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs">
              <Gift className="w-4 h-4" /> 0 COST FREE TRIAL OFFER
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              🎁 3 Days Free Trial (10 Mock Tests Creation)
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
              शिक्षकों के लिए 3 दिन का मुफ़्त ट्रायल चालू करें। 10 ऑनलाइन मॉक टेस्ट बनाएं, व्हाट्सएप पर शेयर करें और तुरंत रिजल्ट देखें।
            </p>
            <button
              type="button"
              onClick={() => setShowFreeTrialModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-sm rounded-2xl shadow-md transition transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-slate-950" />
              Claim 3-Day Free Trial Now (3 दिन का फ्री ट्रायल पाएं)
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              Teacher Panel Login
            </button>

            <a
              href={getWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              Connect on WhatsApp ({whatsappNumber})
            </a>
          </div>

          {/* Professional Stats / Trust Strip */}
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono">500+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Institutes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">10 Lakh+</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tests Taken</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">100%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Instant Ranks</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono">24/7</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Live Links</div>
            </div>
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

      {/* Modals */}
      {showLoginModal && (
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onOpenFreeTrial={() => {
            setShowLoginModal(false);
            setShowFreeTrialModal(true);
          }}
        />
      )}

      {showFreeTrialModal && (
        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={() => setShowFreeTrialModal(false)}
        />
      )}
    </div>
  );
};
