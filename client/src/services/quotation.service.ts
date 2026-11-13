import api from './api';
import { ApiResponse, Quotation } from '../types';

export interface CreateQuotationDto {
  rfqId: number;
  quotedPrice: number;
  estimatedDeliveryTime: string;
  message?: string;
}

export const quotationService = {
  async submit(data: CreateQuotationDto) {
    const res = await api.post<ApiResponse<Quotation>>('/quotations', data);
    return res.data;
  },

  async getMy() {
    const res = await api.get<ApiResponse<Quotation[]>>('/quotations/my');
    return res.data;
  },

  async getRfqQuotations(rfqId: number) {
    const res = await api.get<ApiResponse<Quotation[]>>(`/rfqs/${rfqId}/quotations`);
    return res.data;
  },
};
