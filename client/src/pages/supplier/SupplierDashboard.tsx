import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqService, RfqQueryParams } from '../../services/rfq.service';
import { quotationService } from '../../services/quotation.service';
import { RFQ } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatters';
import {
  Search,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Filter,
  CheckCircle,
  Package,
  ShoppingBag,
  FileCheck,
} from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [myQuotesCount, setMyQuotesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'ALL'>('OPEN');
  const [deadline, setDeadline] = useState<'active' | 'expired' | 'all'>('active');

  const fetchRfqs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: RfqQueryParams = {
        search: search.trim() || undefined,
        location: location.trim() || undefined,
        status,
        deadline,
      };
      const res = await rfqService.getAll(params);
      setRfqs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load RFQs.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyQuotesCount = async () => {
    try {
      const res = await quotationService.getMy();
      setMyQuotesCount(res.data.length);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchRfqs();
    fetchMyQuotesCount();
  }, [status, deadline]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRfqs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setStatus('OPEN');
    setDeadline('active');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse active buyer RFQs, search by product or location, and submit competitive bids.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{rfqs.length}</div>
            <div className="text-xs font-medium text-slate-500">Available RFQs</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{myQuotesCount}</div>
            <div className="text-xs font-medium text-slate-500">My Submitted Quotations</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or description..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full md:w-56 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by city/location"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-indigo-500"
              >
                <option value="OPEN">Open Only</option>
                <option value="CLOSED">Closed Only</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>

            {/* Deadline Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Deadline:</span>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value as any)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-indigo-500"
              >
                <option value="active">Active (Future)</option>
                <option value="expired">Expired</option>
                <option value="all">All Dates</option>
              </select>
            </div>
          </div>

          {(search || location || status !== 'OPEN' || deadline !== 'active') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* RFQ List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Available RFQs ({rfqs.length})
          </h2>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading commercial RFQs..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchRfqs} />
        ) : rfqs.length === 0 ? (
          <EmptyState
            title="No RFQs found"
            description="No requests match your current search criteria. Try modifying your search keywords or resetting filters."
            actionText="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                      {rfq.productName}
                    </h3>
                    <StatusBadge status={rfq.status} deadline={rfq.deadline} />
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {rfq.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-semibold">{rfq.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{rfq.deliveryLocation}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>{formatDate(rfq.deadline)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">{rfq.buyer?.name || 'Verified Buyer'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {rfq._count?.quotations || 0} quotes received
                  </div>
                  <Link
                    to={`/supplier/rfqs/${rfq.id}`}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View & Quote</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
