import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rfqService } from '../../services/rfq.service';
import { RFQ } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatDate } from '../../utils/formatters';
import { Plus, Eye, Edit3, Trash2, FileText, CheckCircle2, Clock, MessageSquare, MapPin } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRfqs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await rfqService.getMy();
      setRfqs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load your RFQs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await rfqService.delete(deletingId);
      setRfqs(rfqs.filter((r) => r.id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete RFQ.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalRfqs = rfqs.length;
  const openRfqs = rfqs.filter((r) => r.status === 'OPEN').length;
  const closedRfqs = rfqs.filter((r) => r.status === 'CLOSED').length;
  const totalQuotations = rfqs.reduce((acc, curr) => acc + (curr._count?.quotations || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your procurement requests, track quotation bids, and review supplier proposals.
          </p>
        </div>
        <div>
          <Link
            to="/buyer/rfqs/new"
            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create RFQ
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalRfqs}</div>
            <div className="text-xs font-medium text-slate-500">Total RFQs</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{openRfqs}</div>
            <div className="text-xs font-medium text-slate-500">Open RFQs</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{closedRfqs}</div>
            <div className="text-xs font-medium text-slate-500">Closed RFQs</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalQuotations}</div>
            <div className="text-xs font-medium text-slate-500">Quotations Received</div>
          </div>
        </div>
      </div>

      {/* RFQ Section Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My Requests for Quotation (RFQs)</h2>
          <span className="text-xs font-medium text-slate-500">
            {rfqs.length} {rfqs.length === 1 ? 'request' : 'requests'}
          </span>
        </div>

        {/* Content States */}
        {isLoading ? (
          <LoadingSpinner label="Loading your RFQs..." />
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchRfqs} />
          </div>
        ) : rfqs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No RFQs created yet"
              description="You haven't published any requests for quotation. Create your first RFQ to start receiving bids from industrial suppliers."
              actionText="Create First RFQ"
              onAction={() => (window.location.href = '/buyer/rfqs/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="px-6 py-3.5">Product / Service</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Deadline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Quotations</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{rfq.productName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{rfq.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {rfq.quantity.toLocaleString()} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>{rfq.deliveryLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(rfq.deadline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={rfq.status} deadline={rfq.deadline} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {rfq._count?.quotations || 0} quotes
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        to={`/buyer/rfqs/${rfq.id}`}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View RFQ & Quotations"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/buyer/rfqs/${rfq.id}/edit`}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit RFQ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingId(rfq.id)}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete RFQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        title="Delete Request for Quotation"
        message="Are you sure you want to delete this RFQ? This action cannot be undone and will delete all associated quotation proposals."
        confirmText="Delete RFQ"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
