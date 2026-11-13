import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rfqService } from '../../services/rfq.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ArrowLeft, Save, AlertCircle, Calendar, MapPin, Package, Hash } from 'lucide-react';

const editRfqSchema = z.object({
  productName: z.string().trim().min(2, 'Product/service name must be at least 2 characters').max(255),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a valid number' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),
  deliveryLocation: z.string().trim().min(2, 'Delivery location is required').max(255),
  deadline: z.string().min(1, 'Deadline is required').refine(
    (val) => new Date(val).getTime() > Date.now(),
    { message: 'Deadline must be a future date' }
  ),
  status: z.enum(['OPEN', 'CLOSED']),
});

type EditRfqFormValues = z.infer<typeof editRfqSchema>;

export const EditRfqPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoadingRfq, setIsLoadingRfq] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditRfqFormValues>({
    resolver: zodResolver(editRfqSchema),
  });

  useEffect(() => {
    const fetchRfq = async () => {
      if (!id) return;
      setIsLoadingRfq(true);
      setLoadError(null);
      try {
        const res = await rfqService.getById(parseInt(id, 10));
        const rfq = res.data;
        const formattedDate = new Date(rfq.deadline).toISOString().split('T')[0];

        reset({
          productName: rfq.productName,
          description: rfq.description,
          quantity: rfq.quantity,
          deliveryLocation: rfq.deliveryLocation,
          deadline: formattedDate,
          status: rfq.status,
        });
      } catch (err: any) {
        setLoadError(err.response?.data?.message || 'Failed to load RFQ details.');
      } finally {
        setIsLoadingRfq(false);
      }
    };

    fetchRfq();
  }, [id, reset]);

  const onSubmit = async (data: EditRfqFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      const isoDeadline = new Date(data.deadline).toISOString();
      await rfqService.update(parseInt(id, 10), {
        ...data,
        deadline: isoDeadline,
      });
      navigate(`/buyer/rfqs/${id}`);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to update RFQ.');
    }
  };

  if (isLoadingRfq) {
    return <LoadingSpinner label="Loading RFQ for editing..." size="lg" />;
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorMessage message={loadError} onRetry={() => window.location.reload()} />
        <Link to="/buyer/dashboard" className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to={`/buyer/rfqs/${id}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to RFQ Details
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Request for Quotation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify your RFQ specifications or change the procurement status.
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status Selection */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-800">Procurement Status</div>
              <div className="text-xs text-slate-500">
                Set to CLOSED to stop accepting quotations from suppliers.
              </div>
            </div>
            <select
              {...register('status')}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="OPEN">OPEN (Accepting Quotes)</option>
              <option value="CLOSED">CLOSED (Archived)</option>
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-700">
              Product or Service Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Package className="w-4 h-4" />
              </div>
              <input
                id="productName"
                type="text"
                {...register('productName')}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                  errors.productName
                    ? 'border-red-300 focus:ring-red-500 text-red-900'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.productName && (
              <p className="mt-1.5 text-xs text-red-600">{errors.productName.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Detailed Description & Specifications <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className={`block w-full p-3 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-300 focus:ring-red-500 text-red-900'
                  : 'border-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Quantity & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">
                Quantity Required <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="quantity"
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  min="1"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.quantity
                      ? 'border-red-300 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.quantity && (
                <p className="mt-1.5 text-xs text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="deliveryLocation" className="block text-sm font-medium text-slate-700">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="deliveryLocation"
                  type="text"
                  {...register('deliveryLocation')}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.deliveryLocation
                      ? 'border-red-300 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {errors.deliveryLocation && (
                <p className="mt-1.5 text-xs text-red-600">{errors.deliveryLocation.message}</p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">
              Quotation Deadline <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="deadline"
                type="date"
                {...register('deadline')}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                  errors.deadline
                    ? 'border-red-300 focus:ring-red-500 text-red-900'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.deadline && (
              <p className="mt-1.5 text-xs text-red-600">{errors.deadline.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <Link
              to={`/buyer/rfqs/${id}`}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
