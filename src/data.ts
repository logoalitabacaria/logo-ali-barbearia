/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Service, LoyaltyPlan, BarberDetail, CustomerSubscription, Appointment, Comanda } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'usr-admin', name: 'Logo Ali Dono (Dono)', email: 'logoali@gmail.com', role: 'ADMIN', phone: '(11) 98888-7777', isActive: true, avatar: '👑' },
  { id: 'usr-barb1', name: 'Mateus Silva (Barbeiro Sênior)', email: 'mateus@logoali.com', role: 'BARBER', phone: '(11) 97777-6666', isActive: true, avatar: '💈' },
  { id: 'usr-barb2', name: 'Henrique Costa', email: 'henrique@logoali.com', role: 'BARBER', phone: '(11) 96666-5555', isActive: true, avatar: '✂️' },
  { id: 'usr-caixa', name: 'Carla Souza (Operador Caixa)', email: 'carla@logoali.com', role: 'CASHIER', phone: '(11) 95555-4444', isActive: true, avatar: '💼' },
  { id: 'usr-cli1', name: 'Felipe Andrade', email: 'felipe@cliente.com', role: 'CUSTOMER', phone: '(11) 94444-3333', isActive: true, avatar: '🧔' },
  { id: 'usr-cli2', name: 'Rodrigo Mello', email: 'rodrigo@cliente.com', role: 'CUSTOMER', phone: '(11) 93333-2222', isActive: true, avatar: '👨' },
  { id: 'usr-cli3', name: 'Gustavo Santos', email: 'gustavo@cliente.com', role: 'CUSTOMER', phone: '(11) 92222-1111', isActive: true, avatar: '👦' },
];

export const INITIAL_BARBER_DETAILS: BarberDetail[] = [
  { userId: 'usr-barb1', commissionRateStandard: 0.50, commissionRateSubscription: 0.35 },
  { userId: 'usr-barb2', commissionRateStandard: 0.45, commissionRateSubscription: 0.30 },
];

export const INITIAL_SERVICES: Service[] = [
  { id: 'srv-1', name: 'Corte Social', price: 40.00, durationMinutes: 30, description: 'Corte de cabelo tradicional com tesoura ou máquina.', category: 'HAIR' },
  { id: 'srv-2', name: 'Degradê Moderno', price: 50.00, durationMinutes: 40, description: 'Corte degradê (fade) navalhado com excelente acabamento.', category: 'HAIR' },
  { id: 'srv-3', name: 'Barba Desenhada', price: 35.00, durationMinutes: 25, description: 'Barba aparada e desenhada com navalha, toalha quente e pós-barba.', category: 'BEARD' },
  { id: 'srv-4', name: 'Combo Cabelo + Barba', price: 75.00, durationMinutes: 60, description: 'O clássico completo: Degradê Moderno + Barba Desenhada com toalha quente.', category: 'COMBO' },
  { id: 'srv-5', name: 'Selagem Térmica', price: 90.00, durationMinutes: 75, description: 'Alinhamento dos fios capilares e redução de volume.', category: 'TREATMENT' },
  { id: 'srv-6', name: 'Pigmentação Capilar/Barba', price: 30.00, durationMinutes: 20, description: 'Correção de falhas temporária com tinta de alta qualidade.', category: 'TREATMENT' },
];

export const INITIAL_PLANS: LoyaltyPlan[] = [
  {
    id: 'pln-navy',
    name: 'Assinatura Club Cavalheiro',
    priceMonthly: 120.00,
    description: 'Acesso garantido a até 3 cortes de cabelo por mês + 1 barba. Ideal para manter o visual sempre alinhado.',
    servicesIncludedCount: 4,
    currentCommissionRate: 0.35, // 35% comissão para o barbeiro ao atender assinante
    rules: [
      'Válido por 30 dias',
      'Até 4 atendimentos presenciais por mês (máximo 3 cortes)',
      'Uso individual e intransferível',
      'Agendamento prioritário via aplicativo'
    ]
  },
  {
    id: 'pln-vip',
    name: 'Plano Bro & Beer VIP',
    priceMonthly: 180.00,
    description: 'Cortes de cabelo e barbas ilimitados (limite operacional de 6 atendimentos por mês) + 1 cerveja artesanal inclusa por visita.',
    servicesIncludedCount: 6,
    currentCommissionRate: 0.30, // 30% comissão para o barbeiro ao atender assinante
    rules: [
      'Máximo 6 atendimentos por mês',
      'Cerveja nacional cortesia durante o atendimento',
      'Agendamentos flexíveis com tolerância ampliada',
      'Desconto de 10% em compras de produtos na tabacaria parceira'
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS: CustomerSubscription[] = [
  { customerId: 'usr-cli1', planId: 'pln-navy', startDate: '2026-05-01', endDate: '2026-06-01', servicesRemaining: 3, isActive: true },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    customerId: 'usr-cli2',
    customerName: 'Rodrigo Mello',
    customerPhone: '(11) 93333-2222',
    barberId: 'usr-barb1',
    barberName: 'Mateus Silva',
    serviceId: 'srv-2',
    serviceName: 'Degradê Moderno',
    servicePrice: 50.00,
    date: '2026-05-26',
    time: '14:30',
    status: 'COMPLETED'
  },
  {
    id: 'apt-2',
    customerId: 'usr-cli3',
    customerName: 'Gustavo Santos',
    customerPhone: '(11) 92222-1111',
    barberId: 'usr-barb1',
    barberName: 'Mateus Silva',
    serviceId: 'srv-4',
    serviceName: 'Combo Cabelo + Barba',
    servicePrice: 75.00,
    date: '2026-05-26',
    time: '18:15',
    status: 'IN_PROGRESS'
  },
  {
    id: 'apt-3',
    customerId: 'usr-cli1',
    customerName: 'Felipe Andrade',
    customerPhone: '(11) 94444-3333',
    barberId: 'usr-barb2',
    barberName: 'Henrique Costa',
    serviceId: 'srv-1',
    serviceName: 'Corte Social',
    servicePrice: 40.00,
    date: '2026-05-27',
    time: '09:00',
    status: 'SCHEDULED'
  },
  {
    id: 'apt-4',
    customerId: 'usr-cli2',
    customerName: 'Rodrigo Mello',
    customerPhone: '(11) 93333-2222',
    barberId: 'usr-barb2',
    barberName: 'Henrique Costa',
    serviceId: 'srv-3',
    serviceName: 'Barba Desenhada',
    servicePrice: 35.00,
    date: '2026-05-27',
    time: '10:30',
    status: 'SCHEDULED'
  }
];

export const INITIAL_COMANDAS: Comanda[] = [
  {
    id: 'cmd-completed-1',
    appointmentId: 'apt-1',
    customerId: 'usr-cli2',
    customerName: 'Rodrigo Mello',
    barberId: 'usr-barb1',
    barberName: 'Mateus Silva',
    status: 'PAID',
    items: [
      { id: 'it-1', description: 'Degradê Moderno (Corte)', quantity: 1, unitPrice: 50.00, isExternal: false, addedBy: 'BARBER' },
      { id: 'it-2', description: 'Pomada Efeito Matte 150g', quantity: 1, unitPrice: 45.00, isExternal: false, addedBy: 'BARBER' },
    ],
    subtotal: 95.00,
    discount: 0,
    total: 95.00,
    createdAt: '2026-05-26T14:30:00Z',
    updatedAt: '2026-05-26T15:15:00Z',
    completedAt: '2026-05-26T15:18:00Z',
    commissionAmount: 25.00, // 50% on srv (R$50.00) = R$25.00 (pomada standard comission is 0% unless customized, we charge commission purely on services)
    paymentMethod: 'PIX'
  },
  {
    id: 'cmd-waiting-2',
    customerId: 'usr-cli2',
    customerName: 'Rodrigo Mello',
    barberId: 'usr-barb2',
    barberName: 'Henrique Costa',
    status: 'WAITING_PAYMENT',
    items: [
      { id: 'it-3', description: 'Corte Social (Corte)', quantity: 1, unitPrice: 40.00, isExternal: false, addedBy: 'BARBER' },
      { id: 'it-4', description: 'Cigarro Cohiba Toro (Venda Externa - Tabacaria)', quantity: 1, unitPrice: 85.00, isExternal: true, addedBy: 'BARBER' },
    ],
    subtotal: 125.00,
    discount: 0,
    total: 125.00,
    createdAt: '2026-05-26T17:00:00Z',
    updatedAt: '2026-05-26T17:45:00Z',
    commissionAmount: 18.00 // Henrique gets 45% commission standard on R$40 hair cut = R$ 18.00 (External tabacaria items do not yield barbershop commission!)
  },
  {
    id: 'cmd-open-3',
    appointmentId: 'apt-2',
    customerId: 'usr-cli3',
    customerName: 'Gustavo Santos',
    barberId: 'usr-barb1',
    barberName: 'Mateus Silva',
    status: 'OPEN',
    items: [
      { id: 'it-5', description: 'Combo Cabelo + Barba (Combo)', quantity: 1, unitPrice: 75.00, isExternal: false, addedBy: 'BARBER' }
    ],
    subtotal: 75.00,
    discount: 0,
    total: 75.00,
    createdAt: '2026-05-26T18:15:00Z',
    updatedAt: '2026-05-26T18:15:00Z'
  }
];

// Helper functions for persistent mock state
export function getSavedState() {
  const getLocal = (key: string, defaultVal: any) => {
    try {
      const data = localStorage.getItem(`logo_ali_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  return {
    users: getLocal('users', INITIAL_USERS),
    barberDetails: getLocal('barberDetails', INITIAL_BARBER_DETAILS),
    services: getLocal('services', INITIAL_SERVICES),
    plans: getLocal('plans', INITIAL_PLANS),
    subscriptions: getLocal('subscriptions', INITIAL_SUBSCRIPTIONS),
    appointments: getLocal('appointments', INITIAL_APPOINTMENTS),
    comandas: getLocal('comandas', INITIAL_COMANDAS)
  };
}

export function saveState(state: any) {
  try {
    Object.keys(state).forEach(key => {
      localStorage.setItem(`logo_ali_${key}`, JSON.stringify(state[key]));
    });
  } catch (e) {
    console.error('Error saving state', e);
  }
}
