import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { rfqService } from '../../services/rfq.service';
import { quotationService } from '../../services/quotation.service';
import { RFQ, Quotation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatCurrency, formatDate, formatDateTime, isExpired } from '../../utils/formatters';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  Send,
  Clock,
  IndianRupee,
  FileText,
} from 'lucide-react';

const quotationSchema = z.object({
  quotedPrice: z
    .number({ invalid_type_error: 'Quoted price must be a valid number' })
    .positive('Quoted price must be greater than ₹0'),
  estimatedDeliveryTime: z
    .string()
    .trim()
    .min(1, 'Estimated delivery time is required')
    .max(100),
  message: z.string().trim().max(2000, 'Message cannot exceed 2000 characters').optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

export const RfqDetailsSupplierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
  });

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

  const onSubmitQuotation = async (data: QuotationFormValues) => {
    if (!rfq) return;
    setSubmitError(null);
    try {
      const res = await quotationService.submit({
        rfqId: rfq.id,
        quotedPrice: data.quotedPrice,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        message: data.message,
      });

      setSubmitSuccess(true);
      setRfq({
        ...rfq,
        hasQuoted: true,
        myQuotation: res.data,
      });
      reset();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit quotation. Please check your inputs.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading RFQ specifications..." size="lg" />;
  }

  if (error || !rfq) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorMessage message={error || 'RFQ not found.'} onRetry={fetchRfqDetails} />
        <Link
          to="/supplier/dashboard"
          className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Browse RFQs
        </Link>
      </div>
    );
  }

  const isRfqClosed = rfq.status === 'CLOSED';
  const isRfqExpired = isExpired(rfq.deadline);
  const canSubmit = !isRfqClosed && !isRfqExpired && !rfq.hasQuoted;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button & Title */}
      <div>
        <Link
          to="/supplier/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Browse RFQs
        </Link>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{rfq.productName}</h1>
          <StatusBadge status={rfq.status} deadline={rfq.deadline} />
        </div>
      </div>

      {/* RFQ Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Procurement Specifications
          </h2>
          <p className="mt-2 text-slate-700 text-base leading-relaxed whitespace-pre-line">
            {rfq.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Quantity</span>
            </div>
            <div className="text-base font-bold text-slate-900">{rfq.quantity.toLocaleString()} units</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Location</span>
            </div>
            <div className="text-base font-bold text-slate-900 truncate">{rfq.deliveryLocation}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Deadline</span>
            </div>
            <div className="text-base font-bold text-slate-900">{formatDate(rfq.deadline)}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-1">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Buyer</span>
            </div>
            <div className="text-base font-bold text-slate-900 truncate">
              {rfq.buyer?.name || 'Verified Buyer'}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Submission or Status Section */}
      {rfq.hasQuoted && rfq.myQuotation ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2.5 text-emerald-800 font-bold text-lg">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span>You have submitted a quotation for this RFQ</span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-400">Your Quoted Price</span>
                <div className="text-2xl font-black text-emerald-600">
                  {formatCurrency(rfq.myQuotation.quotedPrice)}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-medium text-slate-400">Estimated Delivery</span>
                <div className="text-sm font-bold text-slate-800">
                  {rfq.myQuotation.estimatedDeliveryTime}
                </div>
              </div>
            </div>

            {rfq.myQuotation.message && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400">Your Proposal Message:</span>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                  {rfq.myQuotation.message}
                </p>
              </div>
            )}

            <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Submitted on {formatDateTime(rfq.myQuotation.createdAt)}
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/supplier/quotations"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all your submitted quotations &rarr;
            </Link>
          </div>
        </div>
      ) : isRfqClosed ? (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-slate-200 text-slate-600 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">This RFQ is Closed</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            The buyer has closed this procurement request. New quotations are no longer accepted.
          </p>
        </div>
      ) : isRfqExpired ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-600 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-900">RFQ Deadline Has Passed</h3>
          <p className="mt-1 text-sm text-amber-700 max-w-md mx-auto">
            The deadline of {formatDate(rfq.deadline)} has expired. Suppliers cannot submit new bids.
          </p>
        </div>
      ) : (
        /* Quotation Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Submit Your Quotation</h2>
              <p className="text-xs text-slate-500">
                Provide competitive commercial terms and delivery estimation.
              </p>
            </div>
          </div>

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 text-emerald-600" />
              <span>Your quotation has been submitted successfully to the buyer!</span>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitQuotation)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Quoted Price */}
              <div>
                <label htmlFor="quotedPrice" className="block text-sm font-medium text-slate-700">
                  Total Quoted Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    id="quotedPrice"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 450000"
                    {...register('quotedPrice', { valueAsNumber: true })}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                      errors.quotedPrice
                        ? 'border-red-300 focus:ring-red-500 text-red-900'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.quotedPrice && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.quotedPrice.message}</p>
                )}
              </div>

              {/* Estimated Delivery Time */}
              <div>
                <label htmlFor="estimatedDeliveryTime" className="block text-sm font-medium text-slate-700">
                  Estimated Delivery Time <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    id="estimatedDeliveryTime"
                    type="text"
                    placeholder="e.g. 10 business days"
                    {...register('estimatedDeliveryTime')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                      errors.estimatedDeliveryTime
                        ? 'border-red-300 focus:ring-red-500 text-red-900'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.estimatedDeliveryTime && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.estimatedDeliveryTime.message}</p>
                )}
              </div>
            </div>

            {/* Message / Notes */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                Message & Quotation Details (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Mention warranty details, logistics terms, inclusions, discounts, etc."
                  {...register('message')}
                  className="block w-full p-3 border border-slate-300 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.message && (
                <p className="mt-1.5 text-xs text-red-600">{errors.message.message}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span>Submitting Quotation...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Quotation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
