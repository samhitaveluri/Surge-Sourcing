import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, PlusCircle, FileText, LayoutDashboard, LogOut, Menu, X, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isBuyer = user.role === 'BUYER';

  const buyerLinks = [
    { name: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'Create RFQ', path: '/buyer/rfqs/new', icon: PlusCircle },
  ];

  const supplierLinks = [
    { name: 'Browse RFQs', path: '/supplier/dashboard', icon: ShoppingBag },
    { name: 'My Quotations', path: '/supplier/quotations', icon: FileText },
  ];

  const links = isBuyer ? buyerLinks : supplierLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to={isBuyer ? '/buyer/dashboard' : '/supplier/dashboard'}
              className="flex items-center space-x-2.5 font-bold text-slate-900 text-lg tracking-tight"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Building2 className="w-5 h-5" />
              </div>
              <span>RFQ Marketplace</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: User profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isBuyer
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {user.role}
              </span>
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <div className="py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                isBuyer ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {user.role}
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2.5" />
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};
