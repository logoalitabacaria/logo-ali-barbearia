/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, BarberDetail, Service, Product, LoyaltyPlan, CustomerSubscription, Appointment, Comanda, SystemParameters } from './types';

export const INITIAL_SYSTEM_PARAMETERS: SystemParameters = {
  shopName: "Logo Ali Barbearia",
  openTime: "09:00",
  closeTime: "20:00",
  defaultCommissionService: 0.50, // 50%
  defaultCommissionProduct: 0.10, // 10%
  address: "Rua Logo Ali, 777 - Anexo à Tabacaria",
  phone: "(11) 98765-4321"
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Logo Ali Barbearia (Administrador)',
    email: 'logoalitabacaria@gmail.com',
    role: 'ADMIN',
    phone: '(11) 99999-9999',
    isActive: true,
    avatar: '👑',
    login: 'admin',
    password: 'Logoali123!',
    permissions: ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL']
  }
];

export const INITIAL_BARBER_DETAILS: BarberDetail[] = [];

export const INITIAL_SERVICES: Service[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_PLANS: LoyaltyPlan[] = [];

export const INITIAL_SUBSCRIPTIONS: CustomerSubscription[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_COMANDAS: Comanda[] = [];

export function getSavedState() {
  const getLocal = (key: string, defaultVal: any) => {
    try {
      const data = localStorage.getItem(`logo_ali_b2_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  return {
    users: getLocal('users', INITIAL_USERS),
    barberDetails: getLocal('barberDetails', INITIAL_BARBER_DETAILS),
    services: getLocal('services', INITIAL_SERVICES),
    products: getLocal('products', INITIAL_PRODUCTS),
    plans: getLocal('plans', INITIAL_PLANS),
    subscriptions: getLocal('subscriptions', INITIAL_SUBSCRIPTIONS),
    appointments: getLocal('appointments', INITIAL_APPOINTMENTS),
    comandas: getLocal('comandas', INITIAL_COMANDAS),
    parameters: getLocal('parameters', INITIAL_SYSTEM_PARAMETERS),
    categories: getLocal('categories', ['HAIR', 'BEARD', 'COMBO', 'TREATMENT'])
  };
}

export function saveState(state: any) {
  try {
    Object.keys(state).forEach(key => {
      localStorage.setItem(`logo_ali_b2_${key}`, JSON.stringify(state[key]));
    });
  } catch (e) {
    console.error('Error saving state', e);
  }
}
