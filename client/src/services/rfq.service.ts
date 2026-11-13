import api from './api';
import { ApiResponse, RFQ } from '../types';

export interface CreateRfqDto {
  productName: string;
  description: string;
  quantity: number;
  deliveryLocation: string;
  deadline: string;
}

export interface UpdateRfqDto {
  productName?: string;
  description?: string;
  quantity?: number;
  deliveryLocation?: string;
  deadline?: string;
  status?: 'OPEN' | 'CLOSED';
}

export interface RfqQueryParams {
  search?: string;
  location?: string;
  status?: 'OPEN' | 'CLOSED' | 'ALL';
  deadline?: 'active' | 'expired' | 'all';
}

export const rfqService = {
  async getAll(params?: RfqQueryParams) {
    const res = await api.get<ApiResponse<RFQ[]>>('/rfqs', { params });
    return res.data;
  },

  async getMy() {
    const res = await api.get<ApiResponse<RFQ[]>>('/rfqs/my');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<ApiResponse<RFQ>>(`/rfqs/${id}`);
    return res.data;
  },

  async create(data: CreateRfqDto) {
    const res = await api.post<ApiResponse<RFQ>>('/rfqs', data);
    return res.data;
  },

  async update(id: number, data: UpdateRfqDto) {
    const res = await api.put<ApiResponse<RFQ>>(`/rfqs/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete<ApiResponse<null>>(`/rfqs/${id}`);
    return res.data;
  },
};
