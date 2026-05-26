/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Scissors,
  UserCheck,
  Wallet,
  Plus,
  Trash2,
  Settings,
  Check,
  X,
  Lock,
  Unlock,
  TrendingUp,
  Coins,
  Clock,
  Calendar,
  DollarSign,
  ShoppingBag,
  Sparkles,
  BookOpen,
  User,
  AlertCircle,
  Hash,
  ArrowRight,
  Calculator,
  BadgeAlert,
  ListOrdered,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSavedState, saveState } from './data';
import {
  User as UserType,
  Service,
  LoyaltyPlan,
  CustomerSubscription,
  Appointment,
  Comanda,
  ComandaItem,
  UserRole
} from './types';
import DBModelDocs from './components/DBModelDocs';
import HostingGuide from './components/HostingGuide';
import { Cloud } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<'simulation' | 'tech_docs' | 'hosting'>('simulation');

  // Simulation Role
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // State
  const [state, setState] = useState(() => getSavedState());

  // Active sub-roles/states within simulation
  const [selectedBarberId, setSelectedBarberId] = useState<string>('usr-barb1');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('usr-cli1');

  // Interactive Form States
  // 1. Admin config
  const [selectedBarberForCommission, setSelectedBarberForCommission] = useState<string>('usr-barb1');
  const [commissionRateStandard, setCommissionRateStandard] = useState<number>(50);
  const [commissionRateSubscription, setCommissionRateSubscription] = useState<number>(35);

  // 2. Barber custom comanda addition
  const [addServiceId, setAddServiceId] = useState<string>('');
  const [externalDescription, setExternalDescription] = useState<string>('');
  const [externalPrice, setExternalPrice] = useState<string>('');

  // 3. Customer new booking
  const [bookingServiceId, setBookingServiceId] = useState<string>('srv-1');
  const [bookingBarberId, setBookingBarberId] = useState<string>('usr-barb1');
  const [bookingDate, setBookingDate] = useState<string>('2026-05-27');
  const [bookingTime, setBookingTime] = useState<string>('11:00');

  // 4. Cashier checkout controls for selected comanda
  const [selectedComandaId, setSelectedComandaId] = useState<string>('');
  const [cashierDiscount, setCashierDiscount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'MONEY' | 'CARD' | 'PIX' | 'SUBSCRIPTION'>('PIX');

  // Persist state when mutated
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync admin states when selected barber changes
  useEffect(() => {
    const detail = state.barberDetails.find(b => b.userId === selectedBarberForCommission);
    if (detail) {
      setCommissionRateStandard(Math.round(detail.commissionRateStandard * 100));
      setCommissionRateSubscription(Math.round(detail.commissionRateSubscription * 100));
    }
  }, [selectedBarberForCommission, state.barberDetails]);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-yellow-500 text-black border-yellow-400';
      case 'BARBER': return 'bg-zinc-800 text-yellow-500 border-zinc-700';
      case 'CUSTOMER': return 'bg-zinc-900 text-zinc-300 border-zinc-800';
      case 'CASHIER': return 'bg-blue-950/40 text-blue-400 border-blue-900/50';
    }
  };

  // -----------------------------------------------------
  // ACTION HANDLERS
  // -----------------------------------------------------

  // Admin: update commission percentages of barber
  const handleUpdateCommission = () => {
    const updatedDetails = state.barberDetails.map(detail => {
      if (detail.userId === selectedBarberForCommission) {
        return {
          ...detail,
          commissionRateStandard: commissionRateStandard / 100,
          commissionRateSubscription: commissionRateSubscription / 100
        };
      }
      return detail;
    });

    setState(prev => ({
      ...prev,
      barberDetails: updatedDetails
    }));

    // Trigger notification
    alert('Comissões do barbeiro atualizadas com sucesso para novos atendimentos!');
  };

  // Admin: Lock / Unlock a user account
  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = state.users.map(u => {
      if (u.id === userId) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    setState(prev => ({ ...prev, users: updatedUsers }));
  };

  // Barber: Add product/service to an active comanda
  const handleAddItemToComanda = (comandaId: string) => {
    // 1. Add known service
    if (addServiceId) {
      const service = state.services.find(s => s.id === addServiceId);
      if (service) {
        const comanda = state.comandas.find(c => c.id === comandaId);
        if (comanda) {
          const newItem: ComandaItem = {
            id: `it-${Date.now()}`,
            description: `${service.name} (Serviço)`,
            quantity: 1,
            unitPrice: service.price,
            isExternal: false,
            addedBy: 'BARBER'
          };
          const updatedItems = [...comanda.items, newItem];
          const subtotal = updatedItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
          const total = subtotal - comanda.discount;

          // Update state
          const updatedComandas = state.comandas.map(c => {
            if (c.id === comandaId) {
              return { ...c, items: updatedItems, subtotal, total };
            }
            return c;
          });

          setState(prev => ({ ...prev, comandas: updatedComandas }));
          setAddServiceId('');
        }
      }
    }
  };

  // Barber: Add external item (from Tabacaria) manually
  const handleAddExternalItem = (comandaId: string) => {
    if (!externalDescription || !externalPrice) {
      alert('Por favor digite a descrição e o preço do item da Tabacaria.');
      return;
    }

    const priceNum = parseFloat(externalPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Digite um preço válido.');
      return;
    }

    const comanda = state.comandas.find(c => c.id === comandaId);
    if (comanda) {
      const newItem: ComandaItem = {
        id: `it-ext-${Date.now()}`,
        description: `${externalDescription} (Venda Externa - Tabacaria)`,
        quantity: 1,
        unitPrice: priceNum,
        isExternal: true,
        addedBy: 'BARBER'
      };
      const updatedItems = [...comanda.items, newItem];
      const subtotal = updatedItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
      const total = subtotal - comanda.discount;

      const updatedComandas = state.comandas.map(c => {
        if (c.id === comandaId) {
          return { ...c, items: updatedItems, subtotal, total };
        }
        return c;
      });

      setState(prev => ({ ...prev, comandas: updatedComandas }));
      setExternalDescription('');
      setExternalPrice('');
    }
  };

  // Barber: Change status of Comanda to WAITING_PAYMENT
  const handleSendToCashier = (comandaId: string, appointmentId?: string) => {
    const updatedComandas = state.comandas.map(c => {
      if (c.id === comandaId) {
        return { ...c, status: 'WAITING_PAYMENT' as const };
      }
      return c;
    });

    // Also update associated appointment if exists
    let updatedAppointments = state.appointments;
    if (appointmentId) {
      updatedAppointments = state.appointments.map(a => {
        if (a.id === appointmentId) {
          return { ...a, status: 'COMPLETED' as const };
        }
        return a;
      });
    }

    setState(prev => ({
      ...prev,
      comandas: updatedComandas,
      appointments: updatedAppointments
    }));

    alert('Atendimento concluído! A comanda foi enviada para recebimento no caixa da Tabacaria.');
  };

  // Customer: Book an appointment (and generate an Open Comanda)
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const service = state.services.find(s => s.id === bookingServiceId);
    const barber = state.users.find(u => u.id === bookingBarberId);
    const customer = state.users.find(u => u.id === selectedCustomerId);

    if (!service || !barber || !customer) return;

    const aptId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      id: aptId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      date: bookingDate,
      time: bookingTime,
      status: 'SCHEDULED'
    };

    // Auto-create an associated open comanda for when the client arrives
    const comandaId = `cmd-auto-${Date.now()}`;
    const newComanda: Comanda = {
      id: comandaId,
      appointmentId: aptId,
      customerId: customer.id,
      customerName: customer.name,
      barberId: barber.id,
      barberName: barber.name,
      status: 'OPEN',
      items: [
        {
          id: `item-${Date.now()}`,
          description: `${service.name} (Serviço)`,
          quantity: 1,
          unitPrice: service.price,
          isExternal: false,
          addedBy: 'BARBER'
        }
      ],
      subtotal: service.price,
      discount: 0,
      total: service.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
      comandas: [newComanda, ...prev.comandas]
    }));

    alert(`Agendamento realizado com sucesso para ${bookingDate} às ${bookingTime}! Uma comanda digital correspondente já está aberta.`);
  };

  // Customer: Buy a Loyalty Plan
  const handlePurchasePlan = (planId: string) => {
    const plan = state.plans.find(p => p.id === planId);
    if (!plan) return;

    // Remove any existing subscription for clean testing
    const remainingSubscriptions = state.subscriptions.filter(sub => sub.customerId !== selectedCustomerId);

    const todayStr = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endStr = nextMonth.toISOString().split('T')[0];

    const newSub: CustomerSubscription = {
      customerId: selectedCustomerId,
      planId: plan.id,
      startDate: todayStr,
      endDate: endStr,
      servicesRemaining: plan.servicesIncludedCount,
      isActive: true
    };

    setState(prev => ({
      ...prev,
      subscriptions: [...remainingSubscriptions, newSub]
    }));

    alert(`Plano "${plan.name}" assinado com sucesso! Seus benefícios estão ativos e descontos em serviços serão calculados no caixa.`);
  };

  // Cashier: Finalize Checkout and compute barber commission
  const handleCashierCheckout = (comandaId: string) => {
    const comanda = state.comandas.find(c => c.id === comandaId);
    if (!comanda) return;

    const discountValue = parseFloat(cashierDiscount) || 0;
    const finalTotal = Math.max(0, comanda.subtotal - discountValue);

    // Compute dynamic commission for the barber
    // Rules:
    // Barber gets commission only on SERVICES (not external items like cigars from the tabacaria).
    // Identify which rate applies:
    // - Check if customer has active SUBSCRIPTION.
    // - If SUBSCRIPTION applied (i.e. payment method is SUBSCRIPTION or customer is active subscriber): Standard subscription rate applies (config from barberDetails).
    // - Else: Standard commission rate applies.

    const customerSub = state.subscriptions.find(sub => sub.customerId === comanda.customerId && sub.isActive);
    const barberConfig = state.barberDetails.find(b => b.userId === comanda.barberId);
    const activeCommissionRate = (customerSub && (paymentMethod === 'SUBSCRIPTION'))
      ? (barberConfig?.commissionRateSubscription ?? 0.35)
      : (barberConfig?.commissionRateStandard ?? 0.50);

    // Filter services and calculate total services cost
    let totalServicesCost = 0;
    comanda.items.forEach(item => {
      if (!item.isExternal) {
        totalServicesCost += (item.unitPrice * item.quantity);
      }
    });

    // If customer pays using subscription, make sure we deduct 1 use (if available)
    let updatedSubscriptions = state.subscriptions;
    if (paymentMethod === 'SUBSCRIPTION' && customerSub) {
      updatedSubscriptions = state.subscriptions.map(sub => {
        if (sub.customerId === comanda.customerId) {
          return {
            ...sub,
            servicesRemaining: Math.max(0, sub.servicesRemaining - 1),
            isActive: sub.servicesRemaining - 1 > 0
          };
        }
        return sub;
      });
    }

    // Apply discount proportionally to service cost (or purely service cost minus discount)
    const commissionEarning = parseFloat((Math.max(0, totalServicesCost - discountValue) * activeCommissionRate).toFixed(2));

    const updatedComandas = state.comandas.map(c => {
      if (c.id === comandaId) {
        return {
          ...c,
          status: 'PAID' as const,
          discount: discountValue,
          total: finalTotal,
          commissionAmount: commissionEarning,
          paymentMethod: paymentMethod,
          completedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setState(prev => ({
      ...prev,
      comandas: updatedComandas,
      subscriptions: updatedSubscriptions
    }));

    alert(`Pagamento registrado com sucesso! R$ ${finalTotal.toFixed(2)} recebidos no Caixa. Comissão do barbeiro (${(activeCommissionRate * 100).toFixed(0)}% sobre R$ ${(Math.max(0, totalServicesCost - discountValue)).toFixed(2)} de serviços) calculada como R$ ${commissionEarning.toFixed(2)}.`);
    setSelectedComandaId('');
    setCashierDiscount('0');
  };

  // Remove individual item from open comanda
  const handleRemoveItem = (comandaId: string, itemId: string) => {
    const comanda = state.comandas.find(c => c.id === comandaId);
    if (comanda) {
      const updatedItems = comanda.items.filter(i => i.id !== itemId);
      const subtotal = updatedItems.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
      const total = subtotal - comanda.discount;

      const updatedComandas = state.comandas.map(c => {
        if (c.id === comandaId) {
          return { ...c, items: updatedItems, subtotal, total };
        }
        return c;
      });

      setState(prev => ({ ...prev, comandas: updatedComandas }));
    }
  };

  // Get active user data
  const currentBarberUser = state.users.find(u => u.id === selectedBarberId);
  const currentCustomerUser = state.users.find(u => u.id === selectedCustomerId);

  // Stats calculation for ADMIN
  const totalBilling = state.comandas
    .filter(c => c.status === 'PAID')
    .reduce((acc, c) => acc + c.total, 0);

  const totalCommissions = state.comandas
    .filter(c => c.status === 'PAID')
    .reduce((acc, c) => acc + (c.commissionAmount ?? 0), 0);

  const waitingPaymentCount = state.comandas.filter(c => c.status === 'WAITING_PAYMENT').length;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-zinc-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="border-b border-[#1C1C1F] bg-[#121214] sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-black p-2.5 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-yellow-500/10">
              LA
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Logo Ali Tabacaria & Barbearia
              </h1>
              <p className="text-xs text-zinc-400">
                Sistema de Gestão de Barbearia com Controle Operacional Anexo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap bg-[#1C1C1F] p-1 rounded-xl border border-[#27272A] gap-1">
            <button
              onClick={() => setActiveView('simulation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeView === 'simulation'
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Simulação de Perfis (Protótipo)
            </button>
            <button
              onClick={() => setActiveView('tech_docs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeView === 'tech_docs'
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              Arquitetura e DB (Modelagem)
            </button>
            <button
              onClick={() => setActiveView('hosting')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeView === 'hosting'
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Hospedagem Grátis ☁️
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'tech_docs' ? (
            <motion.div
              key="tech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DBModelDocs />
            </motion.div>
          ) : activeView === 'hosting' ? (
            <motion.div
              key="hosting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HostingGuide />
            </motion.div>
          ) : (
            <motion.div
              key="sim"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Simulator Header / Persona Bar */}
              <div className="bg-zinc-950/40 p-5 rounded-2xl border border-yellow-500/10 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-yellow-400/10 text-yellow-400 uppercase mb-2 border border-yellow-400/20">
                      Sandbox de Homologação
                    </span>
                    <h3 className="text-md font-bold text-white">Alternar Perfis Operacionais (RBAC)</h3>
                    <p className="text-xs text-zinc-400">
                      Escolha um dos 4 níveis de usuários abaixo para interagir e testar o fluxo de comandas, comissão e agendamento.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-[#0B0B0C] px-3.5 py-2 rounded-xl border border-zinc-900 leading-none shrink-0 self-start md:self-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      <span>SYS_STATE: <span className="text-yellow-400">PERSISTED</span></span>
                    </div>
                    <div className="hidden sm:block text-zinc-800">|</div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span>ENGINE_FLOW: <span className="text-zinc-300">INTEG_COMS</span></span>
                    </div>
                    <div className="hidden sm:block text-zinc-800">|</div>
                    <div className="flex items-center gap-1.5">
                      <span>VER: <span className="text-zinc-300">v1.2.0</span></span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => setCurrentRole('ADMIN')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition relative overflow-hidden ${
                      currentRole === 'ADMIN'
                        ? 'bg-yellow-500/10 border-yellow-500/70 text-white'
                        : 'bg-[#121214] border-[#27272A] hover:bg-[#18181B] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">👑</span>
                      <span className="text-xs font-bold font-mono">1. Administrador</span>
                    </div>
                    <span className="text-[10px] leading-tight text-zinc-400 block">
                      Acesso total, relatórios, configurações e comissões.
                    </span>
                    {currentRole === 'ADMIN' && (
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('BARBER');
                      // Auto select first barber if none active
                    }}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition relative overflow-hidden ${
                      currentRole === 'BARBER'
                        ? 'bg-yellow-500/10 border-yellow-500/70 text-white'
                        : 'bg-[#121214] border-[#27272A] hover:bg-[#18181B] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">💈</span>
                      <span className="text-xs font-bold font-mono">2. Barbeio Sênior</span>
                    </div>
                    <span className="text-[10px] leading-tight text-zinc-400 block">
                      Gestão de comandas, agendamento de hoje e vendas externas.
                    </span>
                    {currentRole === 'BARBER' && (
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setCurrentRole('CUSTOMER')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition relative overflow-hidden ${
                      currentRole === 'CUSTOMER'
                        ? 'bg-yellow-500/10 border-yellow-500/70 text-white'
                        : 'bg-[#121214] border-[#27272A] hover:bg-[#18181B] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">🧔</span>
                      <span className="text-xs font-bold font-mono">3. Cliente Final</span>
                    </div>
                    <span className="text-[10px] leading-tight text-zinc-400 block">
                      Agendar horários, visualizar planos e catálogo.
                    </span>
                    {currentRole === 'CUSTOMER' && (
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-yellow-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setCurrentRole('CASHIER')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition relative overflow-hidden ${
                      currentRole === 'CASHIER'
                        ? 'bg-yellow-500/10 border-yellow-500/70 text-white'
                        : 'bg-[#121214] border-[#27272A] hover:bg-[#18181B] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">💼</span>
                      <span className="text-xs font-bold font-mono">4. Caixa (Tabacaria)</span>
                    </div>
                    <span className="text-[10px] leading-tight text-zinc-400 block">
                      Checkouts, dar baixa nas comandas, aplicar descontos.
                    </span>
                    {currentRole === 'CASHIER' && (
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-yellow-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* DYNAMIC ROLE VIEWS */}
              <AnimatePresence mode="wait">
                {/* 1. ADMIN USER INTERFACE */}
                {currentRole === 'ADMIN' && (
                  <motion.div
                    key="admin-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left Column: Core Admin Stats & Commission Admin */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Metric Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 shadow-sm">
                          <span className="text-zinc-400 text-xs font-mono uppercase block mb-1">
                            Faturamento Total
                          </span>
                          <p className="text-2xl font-bold text-white font-mono tracking-tight">
                            {formatCurrency(totalBilling)}
                          </p>
                          <span className="text-[10px] text-green-500 mt-1 block flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12% do mês anterior
                          </span>
                        </div>
                        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 shadow-sm">
                          <span className="text-zinc-400 text-xs font-mono uppercase block mb-1">
                            Comissões Repassadas
                          </span>
                          <p className="text-2xl font-bold text-yellow-500 font-mono tracking-tight">
                            {formatCurrency(totalCommissions)}
                          </p>
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            Média de 42% por atendimento
                          </span>
                        </div>
                        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 shadow-sm">
                          <span className="text-zinc-400 text-xs font-mono uppercase block mb-1">
                            Aguardando Recebimento
                          </span>
                          <p className="text-2xl font-bold text-orange-400 font-mono tracking-tight">
                            {waitingPaymentCount} Comandas
                          </p>
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            Pendentes de pagamento no Caixa
                          </span>
                        </div>
                      </div>

                      {/* Loyalty Plan Manager & Rules */}
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4 border-b border-[#27272A] pb-3">
                          <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold">
                            Gestão de Planos de Assinatura (Fidelização)
                          </h4>
                          <span className="text-[10px] text-zinc-400">Taxas e Regras Ativas</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {state.plans.map(plan => (
                            <div key={plan.id} className="bg-[#18181B] border border-[#27272A] p-4 rounded-lg flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-white text-sm font-bold">{plan.name}</h5>
                                  <span className="bg-yellow-500/10 text-yellow-500 font-mono text-xs px-2 py-0.5 rounded border border-yellow-500/20">
                                    {formatCurrency(plan.priceMonthly)}/mês
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3">{plan.description}</p>
                                <div className="space-y-1 mb-4">
                                  {plan.rules.slice(0, 3).map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                      <span className="text-yellow-500 font-bold">•</span>
                                      <span>{rule}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="border-t border-[#27272A] pt-3 flex justify-between items-center bg-[#0B0B0C] px-3 py-2 rounded">
                                <span className="text-[10px] text-zinc-400">Comissão de Assinatura do Barbeiro:</span>
                                <span className="text-xs font-bold font-mono text-yellow-500">
                                  {(plan.currentCommissionRate * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Users accounts status dashboard */}
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold mb-3">
                          Controle de Contas e Usuários (RBAC)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[#27272A] text-zinc-400">
                                <th className="pb-2.5 font-medium">Nome do Usuário</th>
                                <th className="pb-2.5 font-medium">Perfil / Role</th>
                                <th className="pb-2.5 font-medium">Status da Conta</th>
                                <th className="pb-2.5 font-medium text-right">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/50">
                              {state.users.map(u => (
                                <tr key={u.id} className="hover:bg-zinc-900/40">
                                  <td className="py-2.5 flex items-center gap-2">
                                    <span className="text-sm bg-zinc-800 p-1 rounded">{u.avatar}</span>
                                    <div>
                                      <p className="font-semibold text-white">{u.name}</p>
                                      <p className="text-[10px] text-zinc-500">{u.email}</p>
                                    </div>
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getRoleBadgeColor(u.role)}`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`inline-flex items-center gap-1 text-[10px] ${u.isActive ? 'text-green-500' : 'text-rose-500'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-rose-500'}`} />
                                      {u.isActive ? 'Ativa' : 'Bloqueada'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <button
                                      onClick={() => handleToggleUserStatus(u.id)}
                                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition ${
                                        u.isActive
                                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                                      }`}
                                    >
                                      {u.isActive ? 'Bloquear' : 'Ativar'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Dynamic Barber Commission Settings */}
                    <div className="space-y-6">
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 sticky top-24">
                        <div className="border-b border-[#27272A] pb-3 mb-4">
                          <span className="text-[10px] tracking-wider font-mono text-yellow-500 uppercase block">Configurações Financeiras</span>
                          <h4 className="text-md font-bold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-zinc-400" />
                            Regra de Comissão Dinâmica
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Altere a comissão do barbeiro separadamente para atendimentos comuns versus clientes com planos de assinatura (fidelidade).
                          </p>
                        </div>

                        <div className="space-y-4">
                          {/* Barber Selection */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">Selecionar Barbeiro</label>
                            <select
                              value={selectedBarberForCommission}
                              onChange={(e) => setSelectedBarberForCommission(e.target.value)}
                              className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                            >
                              {state.users.filter(u => u.role === 'BARBER').map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Standard Commission Rate */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Comissão Padrão (Avulso)</label>
                              <span className="text-yellow-500 font-mono text-xs font-bold">{commissionRateStandard}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              step="5"
                              value={commissionRateStandard}
                              onChange={(e) => setCommissionRateStandard(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Taxa padrão sobre qualquer corte avulso.</p>
                          </div>

                          {/* Subscription Commission Rate */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Comissão para Clientes de Planos</label>
                              <span className="text-yellow-500 font-mono text-xs font-bold">{commissionRateSubscription}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="90"
                              step="5"
                              value={commissionRateSubscription}
                              onChange={(e) => setCommissionRateSubscription(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Taxa reduzida compensada pelo alto volume do clube.</p>
                          </div>

                          <button
                            onClick={handleUpdateCommission}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 font-semibold text-black transition text-xs py-2 rounded-lg"
                          >
                            Salvar Configuração de Repasse
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. BARBER INTERFACE */}
                {currentRole === 'BARBER' && (
                  <motion.div
                    key="barber-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Header card representing Barber selected */}
                    <div className="lg:col-span-3 bg-[#121214] border border-[#27272A] p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">💈</span>
                        <div>
                          <p className="text-xs font-mono text-yellow-500 uppercase tracking-widest leading-none mb-1">Painel do Barbeiro</p>
                          <select
                            value={selectedBarberId}
                            onChange={(e) => setSelectedBarberId(e.target.value)}
                            className="bg-[#1C1C1F] border border-[#27272A] rounded-lg text-sm text-white font-bold p-1.5 focus:outline-none"
                          >
                            {state.users.filter(u => u.role === 'BARBER').map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Display current rate live for the selected barber to showcase dynamic business logic */}
                      {(() => {
                        const detail = state.barberDetails.find(d => d.userId === selectedBarberId);
                        const comMargstandard = Math.round((detail?.commissionRateStandard ?? 0.5) * 100);
                        const comMargsub = Math.round((detail?.commissionRateSubscription ?? 0.35) * 100);
                        
                        // Math today closed comandas for this barber
                        const closedComs = state.comandas.filter(c => c.barberId === selectedBarberId && c.status === 'PAID');
                        const earningsToday = closedComs.reduce((acc, c) => acc + (c.commissionAmount ?? 0), 0);
                        
                        return (
                          <div className="flex flex-wrap gap-4">
                            <div className="bg-[#18181B] px-4 py-2 rounded border border-[#27272A]">
                              <span className="text-[10px] text-zinc-400 block font-mono">COMISSÃO AVULSO / PLANOS</span>
                              <span className="text-xs font-bold text-white font-mono">{comMargstandard}% / {comMargsub}%</span>
                            </div>
                            <div className="bg-[#18181B] px-4 py-2 rounded border border-[#27272A]">
                              <span className="text-[10px] text-zinc-400 block font-mono">COMISSÕES RECEBIDAS HOJE</span>
                              <span className="text-xs font-bold text-yellow-500 font-mono">{formatCurrency(earningsToday)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Column 1: Today Appointments List */}
                    <div className="space-y-6">
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold mb-3">
                          Minha Agenda de Hoje
                        </h4>

                        {state.appointments.filter(a => a.barberId === selectedBarberId).length === 0 ? (
                          <p className="text-xs text-zinc-500 text-center py-6">Nenhum agendamento para hoje.</p>
                        ) : (
                          <div className="space-y-3">
                            {state.appointments
                              .filter(a => a.barberId === selectedBarberId)
                              .map(apt => (
                                <div key={apt.id} className="bg-[#18181B] border border-[#27272A] p-3 rounded-lg flex flex-col justify-between gap-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-white">
                                      <Clock className="w-3.5 h-3.5 text-yellow-500" />
                                      <span className="font-bold">{apt.time}</span>
                                      <span className="text-zinc-500">• {apt.date}</span>
                                    </div>
                                    <span className={`px-2 py-0.2 rounded text-[9px] font-mono uppercase ${
                                      apt.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/15' :
                                      apt.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse' :
                                      'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                                    }`}>
                                      {apt.status === 'COMPLETED' ? 'Concluido' :
                                       apt.status === 'IN_PROGRESS' ? 'No Cadeira' : 'Agendado'}
                                    </span>
                                  </div>

                                  <div className="border-t border-[#27272A]/40 pt-2">
                                    <p className="text-xs font-medium text-white">{apt.customerName}</p>
                                    <p className="text-[10px] text-zinc-400">{apt.serviceName} ({formatCurrency(apt.servicePrice)})</p>
                                  </div>

                                  {apt.status === 'SCHEDULED' && (
                                    <button
                                      onClick={() => {
                                        // Change appointment status
                                        const updatedApts = state.appointments.map(a => {
                                          if (a.id === apt.id) return { ...a, status: 'IN_PROGRESS' as const };
                                          return a;
                                        });
                                        // Find corresponding comanda and make sure it has the appointmentId
                                        setState(prev => ({ ...prev, appointments: updatedApts }));
                                      }}
                                      className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-500/20 transition text-[10px] py-1.5 rounded"
                                    >
                                      Iniciar Atendimento (Cadeira)
                                    </button>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2 & 3: Active digital comanda controls */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <div className="border-b border-[#27272A] pb-3 mb-4 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] tracking-wider font-mono text-yellow-500 uppercase">Comanda Digital Ativa</span>
                            <h4 className="text-sm font-bold text-white">Adicionar Produtos e Finalizar Comandados</h4>
                          </div>
                          <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                            Ambiente Barbearia
                          </span>
                        </div>

                        {/* Comandas in OPEN stage owned by selected barber */}
                        {state.comandas.filter(c => c.barberId === selectedBarberId && c.status === 'OPEN').length === 0 ? (
                          <div className="text-center py-10 bg-[#18181B] border border-dashed border-[#27272A] rounded-lg">
                            <p className="text-xs text-zinc-400 mb-2">Não há clientes na sua cadeira com comandas em andamento.</p>
                            <button
                              onClick={() => {
                                // Simulate random walk-in client
                                const cmdId = `cmd-manual-${Date.now()}`;
                                const walkIn: Comanda = {
                                  id: cmdId,
                                  customerId: 'usr-cli2', // Rodrigo Mello
                                  customerName: 'Rodrigo Mello (Avulso)',
                                  barberId: selectedBarberId,
                                  barberName: currentBarberUser?.name || 'Barbeiro',
                                  status: 'OPEN',
                                  items: [],
                                  subtotal: 0,
                                  discount: 0,
                                  total: 0,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: new Date().toISOString()
                                };
                                setState(prev => ({ ...prev, comandas: [walkIn, ...prev.comandas] }));
                              }}
                              className="px-4 py-2 bg-yellow-400 text-black text-xs font-bold rounded-lg hover:bg-yellow-500 transition"
                            >
                              + Abrir Comanda Avulsa (Cliente Sem Agendamento)
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {state.comandas
                              .filter(c => c.barberId === selectedBarberId && c.status === 'OPEN')
                              .map(comanda => {
                                return (
                                  <div key={comanda.id} className="bg-[#18181B] border border-[#27272A] rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-start border-b border-[#27272A]/50 pb-3">
                                      <div>
                                        <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-widest font-mono">
                                          Comanda #{comanda.id.slice(-6).toUpperCase()}
                                        </h5>
                                        <p className="text-sm font-bold text-white mt-1">{comanda.customerName}</p>
                                        <p className="text-[10px] text-zinc-500">Iniciada em: {new Date(comanda.createdAt).toLocaleTimeString('pt-BR')}</p>
                                      </div>
                                      <span className="bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-mono px-2 py-0.5 border border-yellow-500/20">
                                        Atendimento Em Aberto
                                      </span>
                                    </div>

                                    {/* Items launched inside the ticket currently */}
                                    <div className="space-y-2">
                                      <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Itens da Comanda</p>
                                      {comanda.items.length === 0 ? (
                                        <p className="text-xs text-zinc-500 italic py-2">Sem itens adicionados ainda. Adicione corte ou produtos abaixo.</p>
                                      ) : (
                                        <div className="space-y-1">
                                          {comanda.items.map(it => (
                                            <div key={it.id} className="flex justify-between items-center text-xs py-1.5 px-2 bg-[#0B0B0C] rounded border border-zinc-900">
                                              <div className="flex items-center gap-2">
                                                {it.isExternal ? (
                                                  <span className="bg-orange-500/10 text-orange-400 text-[9px] px-1 rounded border border-orange-500/20 font-mono shrink-0">
                                                    Ext. Tabacaria
                                                  </span>
                                                ) : (
                                                  <span className="bg-yellow-500/10 text-yellow-500 text-[9px] px-1 rounded border border-yellow-500/20 font-mono shrink-0">
                                                    Barbearia
                                                  </span>
                                                )}
                                                <span className="text-zinc-200">{it.description}</span>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="font-mono text-yellow-500">{formatCurrency(it.unitPrice)}</span>
                                                <button
                                                  onClick={() => handleRemoveItem(comanda.id, it.id)}
                                                  className="text-zinc-500 hover:text-rose-500 p-0.5"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="flex justify-between text-xs font-bold pt-2 border-t border-[#27272A]/50 text-white">
                                            <span>Subtotal Parcial:</span>
                                            <span className="font-mono text-yellow-400">{formatCurrency(comanda.subtotal)}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Control Launchers Forms */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#27272A]/50 pt-4">
                                      {/* Add Standard Barber Service Option */}
                                      <div className="bg-[#0B0B0C] p-3 rounded-lg border border-[#27272A]">
                                        <h6 className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-2">Serviços Catálogo</h6>
                                        <div className="flex gap-2">
                                          <select
                                            value={addServiceId}
                                            onChange={(e) => setAddServiceId(e.target.value)}
                                            className="bg-[#1C1C1F] border border-[#27272A] rounded px-2 py-1 text-xs text-white flex-1 focus:outline-none"
                                          >
                                            <option value="">-- Selecione --</option>
                                            {state.services.map(s => (
                                              <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                                            ))}
                                          </select>
                                          <button
                                            onClick={() => handleAddItemToComanda(comanda.id)}
                                            className="bg-yellow-500 text-black px-3 py-1 text-xs font-bold rounded hover:bg-yellow-600 flex items-center gap-1 shrink-0"
                                          >
                                            <Plus className="w-3.5 h-3.5" /> Incluir
                                          </button>
                                        </div>
                                      </div>

                                      {/* Add Manual/External Item form (Requirement C) */}
                                      <div className="bg-[#0B0B0C] p-3 rounded-lg border border-orange-500/10">
                                        <div className="flex items-center justify-between mb-2">
                                          <h6 className="text-[10px] text-orange-400 font-mono tracking-wider uppercase">Lançar Item Externo (Tabacaria)</h6>
                                          <span className="text-[8px] uppercase bg-orange-500/10 text-orange-400 px-1 rounded">Sem Comissão</span>
                                        </div>
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            placeholder="Ex: Charuto Cohiba / Cerveja Colorado"
                                            value={externalDescription}
                                            onChange={(e) => setExternalDescription(e.target.value)}
                                            className="w-full bg-[#1C1C1F] border border-[#27272A]/70 rounded px-2 py-1 text-xs text-white focus:outline-none placeholder-zinc-600"
                                          />
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              placeholder="Preço R$"
                                              value={externalPrice}
                                              onChange={(e) => setExternalPrice(e.target.value)}
                                              className="bg-[#1C1C1F] border border-[#27272A]/70 rounded px-2 py-1 text-xs text-white w-24 focus:outline-none placeholder-zinc-600"
                                            />
                                            <button
                                              onClick={() => handleAddExternalItem(comanda.id)}
                                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs font-bold rounded flex-1 flex items-center justify-center gap-1 transition"
                                            >
                                              <Plus className="w-3.5 h-3.5" /> Lançar Outro
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Finalize Barber Action */}
                                    <div className="border-t border-[#27272A]/50 pt-3 flex justify-end">
                                      <button
                                        disabled={comanda.items.length === 0}
                                        onClick={() => handleSendToCashier(comanda.id, comanda.appointmentId)}
                                        className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                                          comanda.items.length === 0
                                            ? 'opacity-40 bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/10 border border-yellow-400/30'
                                        }`}
                                      >
                                        <Check className="w-4 h-4" /> Concluir Atendimento e Enviar ao Caixa
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. CUSTOMER INTERFACE */}
                {currentRole === 'CUSTOMER' && (
                  <motion.div
                    key="customer-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Header: Customer Select */}
                    <div className="lg:col-span-3 bg-[#121214] border border-[#27272A] p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🧔</span>
                        <div>
                          <p className="text-xs font-mono text-yellow-500 uppercase tracking-widest leading-none mb-1">Área do Cliente</p>
                          <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="bg-[#1C1C1F] border border-[#27272A] rounded-lg text-sm text-white font-bold p-1.5 focus:outline-none"
                          >
                            {state.users.filter(u => u.role === 'CUSTOMER').map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Loyalty Plan / Subscription Status Banner */}
                      {(() => {
                        const sub = state.subscriptions.find(s => s.customerId === selectedCustomerId && s.isActive);
                        const pName = sub ? state.plans.find(p => p.id === sub.planId)?.name : null;
                        
                        return (
                          <div className="flex items-center gap-2">
                            {sub ? (
                              <div className="bg-yellow-500/10 border border-yellow-500/30 p-2.5 rounded-lg flex items-center gap-2.5">
                                <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-mono leading-none mb-1">ASSINATURA FIDELIDADE ATIVA</p>
                                  <p className="text-xs font-bold text-white leading-none">
                                    {pName} ({sub.servicesRemaining} Cortes Restantes)
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-zinc-800/50 border border-zinc-700 p-2.5 rounded-lg flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-zinc-400 font-mono leading-none mb-1">PLANO DE FIDELIDADE</p>
                                  <p className="text-xs font-bold text-zinc-400 leading-none">Sem assinatura ativa</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Left Column: Register New Scheduler Appointment */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold mb-3">
                          Agendar Meu Horário
                        </h4>

                        <form onSubmit={handleBookAppointment} className="space-y-4">
                          <div>
                            <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Serviço Desejado</label>
                            <select
                              value={bookingServiceId}
                              onChange={(e) => setBookingServiceId(e.target.value)}
                              className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                            >
                              {state.services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Parceiro Barbeiro</label>
                            <select
                              value={bookingBarberId}
                              onChange={(e) => setBookingBarberId(e.target.value)}
                              className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                            >
                              {state.users.filter(u => u.role === 'BARBER').map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Data</label>
                              <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Horário</label>
                              <input
                                type="time"
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-600 font-semibold text-black transition text-xs py-2 rounded-lg"
                          >
                            Confirmar Agendamento Agora
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Plan Catalogs & Shopping Area */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Catalog of Services with descriptions */}
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold">
                            Catálogo de Cortes e Serviços
                          </h4>
                          <span className="text-[10px] text-zinc-400">Atendimento Premium Logo Ali</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {state.services.map(subService => (
                            <div key={subService.id} className="bg-[#18181B] p-3 rounded-lg border border-[#27272A] hover:border-[#3F3F46] transition flex justify-between gap-4">
                              <div>
                                <h5 className="text-xs font-bold text-white">{subService.name}</h5>
                                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{subService.description}</p>
                                <span className="text-[9px] font-mono text-zinc-500 block mt-2">Duração média: {subService.durationMinutes} minutos</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono text-xs font-bold text-yellow-500 block">{formatCurrency(subService.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Loyalty Plan purchasing section */}
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold mb-3">
                          Assinar Clube de Fidelidade ou Plano de Uso
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {state.plans.map(plan => {
                            const isMyPlan = state.subscriptions.some(s => s.customerId === selectedCustomerId && s.planId === plan.id && s.isActive);
                            return (
                              <div key={plan.id} className={`p-4 rounded-lg border transition ${
                                isMyPlan
                                  ? 'bg-yellow-500/5 border-yellow-500/40 shadow-sm shadow-yellow-500/5'
                                  : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                              }`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{plan.name}</h5>
                                    <span className="text-[10px] text-yellow-500 font-bold font-mono block mt-1">{formatCurrency(plan.priceMonthly)}/mês</span>
                                  </div>
                                  {isMyPlan && (
                                    <span className="bg-yellow-500 text-black text-[8px] uppercase tracking-widest font-black font-mono px-1.5 py-0.5 rounded">
                                      Ativo
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 mb-3">{plan.description}</p>
                                
                                <button
                                  disabled={isMyPlan}
                                  onClick={() => handlePurchasePlan(plan.id)}
                                  className={`w-full text-[10px] py-1.5 rounded font-bold transition ${
                                    isMyPlan
                                      ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700'
                                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                  }`}
                                >
                                  {isMyPlan ? 'Você já assina este plano' : 'Assinar Clube Agora'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. CASHIER (TABACARIA DESK) INTERFACE */}
                {currentRole === 'CASHIER' && (
                  <motion.div
                    key="cashier-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left Column: Comandas waiting for checkout */}
                    <div className="space-y-6">
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <div className="border-b border-[#27272A] pb-3 mb-4">
                          <span className="text-[10px] font-mono text-yellow-500 uppercase">Recebimento de Comandas</span>
                          <h4 className="text-sm font-bold text-white">Fila de Atendimentos Concluídos</h4>
                          <p className="text-[10px] text-zinc-400 mt-1">Selecione uma comanda abaixo para dar baixa no sistema.</p>
                        </div>

                        {state.comandas.filter(c => c.status === 'WAITING_PAYMENT').length === 0 ? (
                          <div className="text-center py-10 bg-[#18181B]/50 border border-[#27272A]/70 rounded-lg">
                            <BadgeAlert className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                            <p className="text-xs text-zinc-400">Nenhum cliente aguardando pagamento.</p>
                            <span className="text-[10px] text-zinc-500 block mt-1">Finalize atendimentos no painel do barbeiro primeiro!</span>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {state.comandas
                              .filter(c => c.status === 'WAITING_PAYMENT')
                              .map(c => {
                                const isSelected = selectedComandaId === c.id;
                                return (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      setSelectedComandaId(c.id);
                                      setCashierDiscount('0');
                                    }}
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition flex justify-between items-center ${
                                      isSelected
                                        ? 'bg-yellow-500/10 border-yellow-500/70'
                                        : 'bg-[#18181B] border-[#27272A] hover:bg-[#1C1C1F]'
                                    }`}
                                  >
                                    <div>
                                      <p className="text-xs font-bold text-white">{c.customerName}</p>
                                      <p className="text-[10px] text-zinc-400 mt-1">Barbeiro: {c.barberName}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-serif font-bold font-mono text-yellow-500 block">
                                        {formatCurrency(c.subtotal)}
                                      </span>
                                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded border border-amber-500/15">
                                        Pendente
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right column (colspan 2): Checkout billing splitter details */}
                    <div className="lg:col-span-2 space-y-6">
                      {selectedComandaId ? (
                        (() => {
                          const comanda = state.comandas.find(c => c.id === selectedComandaId);
                          if (!comanda) return null;

                          // Check sub
                          const sub = state.subscriptions.find(s => s.customerId === comanda.customerId && s.isActive);
                          const plan = sub ? state.plans.find(p => p.id === sub.planId) : null;

                          // Dynamic calculation of commission rate
                          const barberConfig = state.barberDetails.find(b => b.userId === comanda.barberId);
                          const currentCommissionStandard = barberConfig?.commissionRateStandard ?? 0.50;
                          const currentCommissionSubscription = barberConfig?.commissionRateSubscription ?? 0.35;

                          const discountNum = parseFloat(cashierDiscount) || 0;
                          const finalPrice = Math.max(0, comanda.subtotal - discountNum);

                          // Detailed calculations
                          let totalServices = 0;
                          let totalExternal = 0;
                          comanda.items.forEach(itm => {
                            if (itm.isExternal) totalExternal += itm.unitPrice * itm.quantity;
                            else totalServices += itm.unitPrice * itm.quantity;
                          });

                          // Determine active rate
                          const isPlanAppended = sub && (paymentMethod === 'SUBSCRIPTION');
                          const activeCommissionRate = isPlanAppended ? currentCommissionSubscription : currentCommissionStandard;
                          const activeServiceCost = Math.max(0, totalServices - discountNum);
                          const testCommission = activeServiceCost * activeCommissionRate;

                          return (
                            <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                              <div className="border-b border-[#27272A] pb-3 mb-4 flex justify-between items-center">
                                <div>
                                  <span className="text-[10px] font-mono text-yellow-500 uppercase">Espelho de Faturamento</span>
                                  <h4 className="text-sm font-bold text-white">Revisão do Caixa: {comanda.customerName}</h4>
                                </div>
                                <button
                                  onClick={() => setSelectedComandaId('')}
                                  className="text-zinc-500 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Customer subscription alert as checkout guide */}
                              {sub && (
                                <div className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-md flex items-start gap-2 mb-4">
                                  <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                  <div className="text-[11px] text-zinc-300">
                                    <strong className="text-white block">{comanda.customerName} possui assinatura ativa: {plan?.name}</strong>
                                    Você pode processar a comanda abatendo um crédito de atendimento. Selecione a forma de pagamento <strong className="text-yellow-500">Club Assinatura</strong> abaixo. Isso reduzirá a taxa de comissão do barbeiro para <strong className="text-yellow-500">{(currentCommissionSubscription * 100).toFixed(0)}%</strong>.
                                  </div>
                                </div>
                              )}

                              {/* Detailed items table */}
                              <div className="space-y-3 mb-5 bg-[#18181B] p-4 rounded-lg border border-[#27272A]">
                                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">Discriminação de Consumo</p>
                                <div className="space-y-2">
                                  {comanda.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-zinc-200 font-medium">{item.description}</span>
                                          {item.isExternal && (
                                            <span className="text-[8px] uppercase tracking-wider bg-orange-500/10 text-orange-400 px-1 rounded">Venda Ext (Sem Comiss.)</span>
                                          )}
                                        </div>
                                        <span className="text-[9px] text-zinc-500 font-mono">Quant: {item.quantity} x {formatCurrency(item.unitPrice)}</span>
                                      </div>
                                      <span className="font-mono text-zinc-200">{formatCurrency(item.unitPrice * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1">
                                  <div className="flex justify-between text-xs text-zinc-300">
                                    <span>Serviços Barbearia (Sujeito a Comissionamento):</span>
                                    <span className="font-mono">{formatCurrency(totalServices)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-zinc-300">
                                    <span>Venda Externa (Charutos/Bebidas Tabacaria):</span>
                                    <span className="font-mono">{formatCurrency(totalExternal)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold text-white pt-2 border-t border-dashed border-zinc-800">
                                    <span>Total Bruto:</span>
                                    <span className="font-mono text-yellow-500">{formatCurrency(comanda.subtotal)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Checkout adjustment Form */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#27272A]/50 pt-4">
                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Dar Desconto Especial (R$)</label>
                                  <input
                                    type="text"
                                    placeholder="0.00"
                                    value={cashierDiscount}
                                    onChange={(e) => setCashierDiscount(e.target.value)}
                                    className="w-full bg-[#1C1C1F] border border-[#27272A] rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Forma de Recebimento</label>
                                  <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full bg-[#1C1C1F] border border-[#27272A] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                                  >
                                    <option value="PIX">PIX</option>
                                    <option value="CARD">Cartão de Débito/Crédito</option>
                                    <option value="MONEY">Dinheiro em Espécie</option>
                                    {sub && <option value="SUBSCRIPTION">Club Assinatura / Plano</option>}
                                  </select>
                                </div>
                              </div>

                              {/* Commission Preview Split indicator */}
                              <div className="bg-[#0B0B0C] border border-[#27272A] rounded-lg p-3.5 mt-5 flex justify-between items-center text-xs">
                                <div>
                                  <p className="text-[9px] text-zinc-400 uppercase font-mono mb-1">CÁLCULO AUTOMÁTICO DE REPASSE</p>
                                  <p className="text-zinc-300 font-medium">Repasse para {comanda.barberName}:</p>
                                  <p className="text-[10px] text-zinc-500">
                                    Taxa aplicada de {Math.round(activeCommissionRate * 100)}% sobre R$ {activeServiceCost.toFixed(2)} de serviços
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold font-mono text-yellow-500">
                                    {formatCurrency(testCommission)}
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="mt-5 pt-3 border-t border-[#27272A]/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="text-zinc-400 text-[10px] leading-tight text-center sm:text-left">
                                  <p>⚠️ Fechamento operacional integrado com o caixa físico.</p>
                                  <p>Lance o total bruto recebido de <strong className="text-white">{formatCurrency(finalPrice)}</strong> no PDV geral da Tabacaria.</p>
                                </div>
                                <button
                                  onClick={() => handleCashierCheckout(comanda.id)}
                                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 px-4 py-2.5 rounded-lg text-xs text-black font-bold flex items-center justify-center gap-2"
                                >
                                  <Wallet className="w-4 h-4 lg:w-4 lg:h-4" /> Confirmar Recebimento e Baixar Comanda
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#121214] border border-[#27272A] rounded-xl">
                          <ListOrdered className="w-10 h-10 text-zinc-600 mb-2.5" />
                          <p className="text-xs text-zinc-400 font-medium h-4">Aguardando Seleção de Comanda</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Selecione uma comanda digital na lista à esquerda para detalhar faturamento, descontos e comissões.</p>
                        </div>
                      )}

                      {/* Display closed comanda history for cashier */}
                      <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
                        <h4 className="text-xs font-mono text-yellow-500 uppercase tracking-wider font-semibold mb-3">
                          Histórico Recente de Comandas Recebidas
                        </h4>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[#27272A] text-zinc-400">
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium">Comanda ID</th>
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium">Cliente</th>
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium">Barbeiro</th>
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium">Método</th>
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium">Valor Total</th>
                                <th className="pb-2 text-[10px] font-mono uppercase font-medium text-right">Comissão Barbeiro</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]/50 text-zinc-300">
                              {state.comandas
                                .filter(c => c.status === 'PAID')
                                .map(c => (
                                  <tr key={c.id}>
                                    <td className="py-2.5 font-mono text-[10px]">#{c.id.slice(-6).toUpperCase()}</td>
                                    <td className="py-2.5">{c.customerName}</td>
                                    <td className="py-2.5">{c.barberName}</td>
                                    <td className="py-2.5">
                                      <span className="bg-zinc-800 text-zinc-300 px-1 rounded text-[10px] font-mono">
                                        {c.paymentMethod}
                                      </span>
                                    </td>
                                    <td className="py-2.5 font-mono text-white font-semibold">{formatCurrency(c.total)}</td>
                                    <td className="py-2.5 font-mono text-yellow-500 text-right font-medium">{formatCurrency(c.commissionAmount ?? 0)}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Embedded footer disclaimer */}
      <footer className="border-t border-[#1C1C1F] bg-[#121214] py-5 px-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Logo Ali Barbearia & Tabacaria. Todos os direitos reservados.</p>
          <p className="text-[10px] font-mono text-zinc-500 bg-[#0B0B0C] px-2.5 py-1 rounded border border-[#1C1C1F]">
            Ambiente Demonstrativo do Fluxo de Caixa Integrado (Sem PDV local)
          </p>
        </div>
      </footer>
    </div>
  );
}
