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
  avatar?: string;
}

export interface BarberDetail {
  userId: string;
  commissionRateStandard: number; // e.g. 50%
  commissionRateSubscription: number; // e.g. 30% for loyalty plans
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'HAIR' | 'BEARD' | 'COMBO' | 'TREATMENT';
}

export interface LoyaltyPlan {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
  servicesIncludedCount: number; // e.g., 4 hair cuts per month
  currentCommissionRate: number; // Commission percentage for this subscription services (e.g., 30%)
  rules: string[];
}

export interface CustomerSubscription {
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

export type ComandaStatus = 'OPEN' | 'WAITING_PAYMENT' | 'PAID' | 'CANCELLED';

export interface ComandaItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isExternal: boolean; // Indicates if item was added manually (e.g. from tabacaria)
  addedBy: 'BARBER' | 'CASHIER';
}

export interface Comanda {
  id: string;
  appointmentId?: string; // Optional if tied to a pre-booked appointment
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
  commissionAmount?: number; // Calculated commission for the barber
  paymentMethod?: 'MONEY' | 'CARD' | 'PIX' | 'SUBSCRIPTION';
}
