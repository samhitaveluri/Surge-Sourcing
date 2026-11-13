import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { rfqService } from '../../services/rfq.service';
import { ArrowLeft, PlusCircle, AlertCircle, Calendar, MapPin, Package, FileText, Hash } from 'lucide-react';

const createRfqSchema = z.object({
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
});

type CreateRfqFormValues = z.infer<typeof createRfqSchema>;

export const CreateRfqPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  // Default deadline to 14 days in future
  const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRfqFormValues>({
    resolver: zodResolver(createRfqSchema),
    defaultValues: {
      productName: '',
      description: '',
      quantity: 100,
      deliveryLocation: '',
      deadline: defaultDeadline,
    },
  });

  const onSubmit = async (data: CreateRfqFormValues) => {
    setServerError(null);
    try {
      // Ensure deadline is sent as an ISO string
      const isoDeadline = new Date(data.deadline).toISOString();
      const res = await rfqService.create({
        ...data,
        deadline: isoDeadline,
      });
      navigate(`/buyer/rfqs/${res.data.id}`);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to create RFQ. Please check the inputs.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/buyer/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create New Request for Quotation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify your requirements to receive competitive bids from qualified industrial suppliers.
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
          {/* Product / Service Name */}
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
                placeholder="e.g. Ergonomic Mesh Office Chairs"
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
            <div className="mt-1 relative rounded-md shadow-sm">
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                placeholder="Detail technical requirements, dimensions, warranty expectations, packaging, etc."
                className={`block w-full p-3 border rounded-xl sm:text-sm focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500 text-red-900'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
            </div>
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
                  placeholder="500"
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
                  placeholder="e.g. Hyderabad, Telangana"
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
            <p className="mt-1 text-xs text-slate-500">
              Suppliers will no longer be able to submit quotes after this date.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <Link
              to="/buyer/dashboard"
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
                <span>Publishing RFQ...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Publish RFQ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
