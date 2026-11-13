import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quotationService } from '../../services/quotation.service';
import { Quotation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { FileCheck, ArrowRight, Clock, MessageSquare, Building } from 'lucide-react';

export const MyQuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyQuotations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await quotationService.getMy();
      setQuotations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your submitted quotations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuotations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Submitted Quotations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track all quotation bids you have submitted across buyer requests.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Quotation History</h2>
          <span className="text-xs font-medium text-slate-500">
            {quotations.length} {quotations.length === 1 ? 'quotation' : 'quotations'}
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading your quotation submissions..." />
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} onRetry={fetchMyQuotations} />
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No quotations submitted yet"
              description="You haven't submitted any quotations. Browse active RFQs in the marketplace and submit your competitive proposals."
              actionText="Browse Available RFQs"
              onAction={() => (window.location.href = '/supplier/dashboard')}
              icon={<FileCheck className="w-8 h-8 text-indigo-400" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {quotations.map((quote) => (
              <div key={quote.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/supplier/rfqs/${quote.rfq?.id}`}
                        className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {quote.rfq?.productName}
                      </Link>
                      {quote.rfq && (
                        <StatusBadge
                          status={quote.rfq.status}
                          deadline={quote.rfq.deadline}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {quote.rfq?.buyer && (
                        <div className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>Buyer: {quote.rfq.buyer.name}</span>
                        </div>
                      )}
                      <div>Qty: {quote.rfq?.quantity?.toLocaleString()} units</div>
                      <div>Location: {quote.rfq?.deliveryLocation}</div>
                      <div>Submitted: {formatDateTime(quote.createdAt)}</div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-2xl font-black text-emerald-600">
                      {formatCurrency(quote.quotedPrice)}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center sm:justify-end">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>Est. Delivery: {quote.estimatedDeliveryTime}</span>
                    </div>
                  </div>
                </div>

                {quote.message && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 flex items-start space-x-2.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Your Submitted Proposal Notes:
                      </div>
                      <div className="whitespace-pre-line">{quote.message}</div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    to={`/supplier/rfqs/${quote.rfq?.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View RFQ Details</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
