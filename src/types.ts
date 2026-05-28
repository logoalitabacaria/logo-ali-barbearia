/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'BARBER' | 'CUSTOMER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatar?: string; // Can be an emoji or url
  bio?: string;    // Brief description about the barber
  login?: string;
  password?: string;
  permissions?: string[];
  photoUrl?: string; // Barber's actual photo URL
}

export interface BarberDetail {
  userId: string;
  commissionRateStandard: number; // e.g. 0.50 (50%)
  commissionRateSubscription: number; // e.g. 0.35 (35%)
  commissionRateProduct?: number;    // e.g. 0.15 (15%) for product sales
  commissionRateTabacaria?: number;  // e.g 0.05 for tabacaria sales
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  servicesIncludedCount: number; // number of uses allowed per month
  currentCommissionRate: number; // barber payout for these customer visits (in %)
  rules: string[];
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  startDate: string;
  endDate: string;
  servicesRemaining: number;
  isActive: boolean;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
}

export type ComandaStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface ComandaItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isProduct: boolean; // distinguish service from product
  isTabacaria?: boolean; // tabacaria products
}

export interface Comanda {
  id: string;
  appointmentId?: string; // optional association
  customerId: string;
  customerName: string;
  barberId: string;
  barberName: string;
  status: ComandaStatus;
  items: ComandaItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  commissionAmount?: number; // total payout to barber
  paymentMethod?: 'MONEY' | 'CARD' | 'PIX' | 'SUBSCRIPTION';
}

export interface SystemParameters {
  shopName: string;
  openTime: string; // "09:00"
  closeTime: string; // "19:00"
  defaultCommissionService: number; // e.g. 50%
  defaultCommissionProduct: number; // e.g. 10%
  defaultCommissionTabacaria?: number; // e.g. 0%
  address: string;
  phone: string;
  primaryColor?: string; // e.g. "#eab308" (yellow)
  logoUrl?: string; // customizable image URL
}
