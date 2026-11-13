import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { rfqService } from '../../services/rfq.service';
import { RFQ, Quotation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  Package,
  Clock,
  Building,
  CheckCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react';

export const RfqDetailsBuyerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status toggle & delete state
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRfqDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await rfqService.getById(parseInt(id, 10));
      setRfq(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load RFQ details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!rfq) return;
    const newStatus = rfq.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    setIsTogglingStatus(true);
    try {
      const res = await rfqService.update(rfq.id, { status: newStatus });
      setRfq({ ...rfq, status: res.data.status });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update RFQ status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!rfq) return;
    setIsDeleting(true);
    try {
      await rfqService.delete(rfq.id);
      navigate('/buyer/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete RFQ.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading RFQ details and quotations..." size="lg" />;
  }

  if (error || !rfq) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorMessage message={error || 'RFQ not found.'} onRetry={fetchRfqDetails} />
        <Link
          to="/buyer/dashboard"
          className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const quotations: Quotation[] = rfq.quotations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/buyer/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{rfq.productName}</h1>
            <StatusBadge status={rfq.status} deadline={rfq.deadline} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              rfq.status === 'OPEN'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {rfq.status === 'OPEN' ? (
              <>
                <XCircle className="w-4 h-4 mr-1.5" />
                Close RFQ
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Reopen RFQ
              </>
            )}
          </button>
          <Link
            to={`/buyer/rfqs/${rfq.id}/edit`}
            className="inline-flex items-center px-3.5 py-2 bg-white border border-slate-300 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-3.5 py-2 bg-red-50 border border-red-200 text-sm font-medium rounded-xl text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      {/* RFQ Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Specifications</h2>
          <p className="mt-2 text-slate-700 text-base leading-relaxed whitespace-pre-line">
            {rfq.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
            <Package className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Quantity</div>
              <div className="text-base font-bold text-slate-900">{rfq.quantity.toLocaleString()} units</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Delivery Location</div>
              <div className="text-base font-bold text-slate-900">{rfq.deliveryLocation}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Quotation Deadline</div>
              <div className="text-base font-bold text-slate-900">{formatDate(rfq.deadline)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Received Quotations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Received Quotations</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {quotations.length}
            </span>
          </div>
          <span className="text-xs text-slate-500">Only visible to you (RFQ owner)</span>
        </div>

        {quotations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No quotations received yet"
              description="Suppliers have not submitted quotes for this RFQ yet. As suppliers discover and bid on this request, their quotations will appear here."
              icon={<Clock className="w-8 h-8 text-indigo-400" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {quotations.map((quote) => (
              <div key={quote.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-base text-slate-900">
                        {quote.supplier?.name || 'Verified Supplier'}
                      </span>
                      <span className="text-xs text-slate-400">({quote.supplier?.email})</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Submitted on {formatDateTime(quote.createdAt)}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-black text-emerald-600">
                      {formatCurrency(quote.quotedPrice)}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      Est. Delivery: {quote.estimatedDeliveryTime}
                    </div>
                  </div>
                </div>

                {quote.message && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 flex items-start space-x-2.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Supplier Notes:
                      </div>
                      <div className="whitespace-pre-line">{quote.message}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Request for Quotation"
        message="Are you sure you want to permanently delete this RFQ? All received quotations will also be deleted."
        confirmText="Delete RFQ"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
