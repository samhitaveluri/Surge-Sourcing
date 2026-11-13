import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Zap, BarChart3, Users, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // If already logged in, redirect to their role dashboard
  if (user) {
    return <Navigate to={user.role === 'BUYER' ? '/buyer/dashboard' : '/supplier/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">RFQ Marketplace</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            Next-Generation B2B Procurement
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Seamless Requests for Quotation Between{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-400">
              Buyers & Suppliers
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate email back-and-forths and fragmented spreadsheets. Publish enterprise RFQs, receive competitive quotes from verified suppliers, and close deals faster.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-xl border border-slate-700 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Role-Based Access</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated dashboards tailored specifically for enterprise Buyers and industrial Suppliers with strict RBAC security.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Transparent Quotations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Prevent bid tampering and duplicate submissions. Compare delivery timelines and pricing side-by-side in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Management</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track active deadlines, open/closed procurement statuses, and supplier proposals with clean status indicators.
              </p>
            </div>
          </div>

          {/* Demo Credentials Helper Card */}
          <div className="mt-16 max-w-2xl mx-auto p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-3">
              <CheckCircle className="w-5 h-5" />
              <span>Quick Test Credentials (Pre-seeded)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-bold text-white mb-1">Buyer Account</div>
                <div>Email: <code className="text-indigo-300">buyer@example.com</code></div>
                <div>Password: <code className="text-indigo-300">Password123!</code></div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-bold text-white mb-1">Supplier Account</div>
                <div>Email: <code className="text-indigo-300">supplier@example.com</code></div>
                <div>Password: <code className="text-indigo-300">Password123!</code></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} B2B RFQ Marketplace. Built with React, TypeScript, Tailwind, Express & MySQL.
      </footer>
    </div>
  );
};
