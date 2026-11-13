export type Role = 'BUYER' | 'SUPPLIER';
export type RfqStatus = 'OPEN' | 'CLOSED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface RFQ {
  id: number;
  buyerId: number;
  productName: string;
  description: string;
  quantity: number;
  deliveryLocation: string;
  deadline: string;
  status: RfqStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: number;
    name: string;
    email: string;
  };
  _count?: {
    quotations: number;
  };
  quotations?: Quotation[];
  hasQuoted?: boolean;
  myQuotation?: Quotation | null;
}

export interface Quotation {
  id: number;
  rfqId: number;
  supplierId: number;
  quotedPrice: number | string;
  estimatedDeliveryTime: string;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: number;
    name: string;
    email: string;
  };
  rfq?: {
    id: number;
    productName: string;
    quantity: number;
    deliveryLocation: string;
    deadline: string;
    status: RfqStatus;
    buyer?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}
