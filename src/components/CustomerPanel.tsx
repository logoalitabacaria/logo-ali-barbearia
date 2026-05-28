/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, Scissors, Star, Check, Award, AlertCircle } from 'lucide-react';
import { User, Service, LoyaltyPlan, Appointment, CustomerSubscription, SystemParameters } from '../types';

interface CustomerPanelProps {
  users: User[];
  services: Service[];
  plans: LoyaltyPlan[];
  appointments: Appointment[];
  subscriptions: CustomerSubscription[];
  currentCustomer: User;
  parameters: SystemParameters;
  onUpdateState: (key: string, val: any) => void;
}

export default function CustomerPanel({
  users,
  services,
  plans,
  appointments,
  subscriptions,
  currentCustomer,
  parameters,
  onUpdateState
}: CustomerPanelProps) {
  const [activeTab, setActiveTab] = useState<'agendar' | 'assinatura' | 'historico'>('agendar');

  // New Booking State
  const barbers = users.filter(u => u.role === 'BARBER' && u.isActive);
  const [bookingServiceId, setBookingServiceId] = useState(services[0]?.id || '');
  const [bookingBarberId, setBookingBarberId] = useState(barbers[0]?.id || '');
  const [bookingDate, setBookingDate] = useState('2026-05-27');
  const [bookingTime, setBookingTime] = useState('14:30');

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // CHECK ACTIVE CLIENT SUBSCRIPTION
  const activeSubscription = subscriptions.find(
    s => s.customerId === currentCustomer.id && s.isActive
  );
  const activeSubscribedPlan = activeSubscription
    ? plans.find(p => p.id === activeSubscription.planId)
    : null;

  // REGISTER APPOINTMENT FOR THE LOGGED-IN CUSTOMER
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedService = services.find(s => s.id === bookingServiceId);
    const selectedBarber = barbers.find(b => b.id === bookingBarberId);

    if (!selectedService || !selectedBarber) {
      alert('Por favor, selecione um profissional e serviço válidos.');
      return;
    }

    // Verify shop bounds
    const timeVal = parseInt(bookingTime.replace(':', ''));
    const startVal = parseInt(parameters.openTime.replace(':', ''));
    const closeVal = parseInt(parameters.closeTime.replace(':', ''));

    if (timeVal < startVal || timeVal > closeVal) {
      alert(`Erro: A barbearia funciona de ${parameters.openTime} até ${parameters.closeTime}. Escolha outro horário!`);
      return;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: bookingDate,
      time: bookingTime,
      status: 'SCHEDULED'
    };

    onUpdateState('appointments', [...appointments, newAppointment]);
    alert(`Seu agendamento foi efetuado com sucesso na cadeira de ${selectedBarber.name}!`);
    setActiveTab('historico');
  };

  // ENROLL ONLINE SUBSCRIPTION ON DEMAND (Client control)
  const handleSubscribeToPlan = (planId: string) => {
    if (activeSubscription) {
      alert('Você já possui um plano ativo! Cancele o anterior ou aguarde a expiração para alterar.');
      return;
    }

    const matchedPlan = plans.find(p => p.id === planId);
    if (!matchedPlan) return;

    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 30);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const newSubscription: CustomerSubscription = {
      id: `sub-${Date.now()}`,
      customerId: currentCustomer.id,
      planId: planId,
      startDate: formatDate(today),
      endDate: formatDate(end),
      servicesRemaining: matchedPlan.servicesIncludedCount,
      isActive: true
    };

    onUpdateState('subscriptions', [...subscriptions, newSubscription]);
    alert(`Parabéns! Você se associou com sucesso ao plano "${matchedPlan.name}"!`);
  };

  const handleCancelMySubscription = () => {
    if (!confirm('Deseja realmente cancelar sua assinatura? Você perderá os serviços acumulados.')) return;
    onUpdateState(
      'subscriptions',
      subscriptions.map(s => s.customerId === currentCustomer.id ? { ...s, isActive: false } : s)
    );
    alert('Sua assinatura foi desativada.');
  };

  // Filter client's bookings
  const myAppointments = appointments.filter(a => a.customerId === currentCustomer.id);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Greeting */}
      <div className="bg-[#101012] border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-zinc-900 border border-zinc-800 p-2 rounded-xl block">🙋</span>
          <div>
            <h2 className="text-base font-bold text-white">Seja bem-vindo, <span className="text-yellow-500">{currentCustomer.name}</span></h2>
            <p className="text-xs text-zinc-400">Escolha o seu profissional favorito e agende o seu serviço com enorme simplicidade.</p>
          </div>
        </div>

        {activeSubscription && activeSubscribedPlan ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-2.5 px-4 rounded-xl font-mono text-xs text-yellow-500">
            <span className="block text-[9px] uppercase font-bold text-zinc-400">Plano Ativo</span>
            <span className="font-bold">{activeSubscribedPlan.name}</span>
            <span className="block text-[10px] mt-0.5 text-zinc-300">Cortes Restantes: {activeSubscription.servicesRemaining}</span>
          </div>
        ) : (
          <div className="bg-zinc-900 p-3 rounded-xl text-zinc-500 text-[11px]">
            Nenhum plano de assinatura ativo. Veja opções e economize no mês!
          </div>
        )}
      </div>

      {/* Selector button group */}
      <div className="flex gap-2 border-b border-zinc-850 pb-2">
        <button
          onClick={() => setActiveTab('agendar')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeTab === 'agendar' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          📅 Novo Agendamento Online
        </button>
        <button
          onClick={() => setActiveTab('assinatura')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeTab === 'assinatura' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          🔄 Clube & Planos de Assinatura
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeTab === 'historico' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          🗓️ Minhas Reservas ({myAppointments.length})
        </button>
      </div>

      {/* TAB 1: NEW BOOKING FLOW */}
      {activeTab === 'agendar' && (
        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STEP 1: Select Service & Date */}
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-yellow-500 border-b border-zinc-850 pb-2 mb-3">
              1. Selecione o Serviço
            </h3>
            
            <div className="space-y-2">
              {services.map(s => (
                <label
                  key={s.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    bookingServiceId === s.id
                      ? 'bg-yellow-500/5 border-yellow-500 text-white'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceRadio"
                    checked={bookingServiceId === s.id}
                    onChange={() => setBookingServiceId(s.id)}
                    className="mt-1 text-yellow-500 focus:ring-0 cursor-pointer"
                  />
                  <div className="text-left select-none">
                    <p className="font-bold text-xs text-white leading-tight">{s.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{s.description}</p>
                    <div className="flex gap-2 items-center mt-2">
                      <span className="text-[10px] text-yellow-500 font-mono font-bold">
                        {formatCurrency(s.price)}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono text-zinc-500">• {s.durationMinutes} minutos</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* STEP 2: Choose Barber (Showing dynamic biography and avatar/photo) */}
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-yellow-500 border-b border-zinc-850 pb-2 mb-3">
              2. Escolha o Profissional
            </h3>
            <p className="text-[11px] text-zinc-400">Clique sobre o barbeiro para ver quem cuidará do seu visual.</p>

            <div className="space-y-2">
              {barbers.map(b => (
                <label
                  key={b.id}
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer transition ${
                    bookingBarberId === b.id
                      ? 'bg-[#151518] border-yellow-500 text-white'
                      : 'bg-[#0A0A0C] border-zinc-900 hover:bg-zinc-900/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="barberRadio"
                    checked={bookingBarberId === b.id}
                    onChange={() => setBookingBarberId(b.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    {b.photoUrl ? (
                      <img src={b.photoUrl} alt={b.name} className="h-14 w-14 object-cover rounded-xl border border-zinc-850" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl bg-zinc-900 border border-zinc-850 p-2 rounded-xl block">
                        {b.avatar || '🧔'}
                      </span>
                    )}
                    <div className="text-left select-none">
                      <h4 className="font-bold text-xs text-white">{b.name}</h4>
                      <p className="text-[9px] uppercase tracking-wider font-mono text-yellow-500">Barbeiro Oficial</p>
                    </div>
                  </div>
                  {/* Biography display */}
                  <p className="text-[10px] text-zinc-400 mt-3 border-t border-zinc-900 pt-2 leading-relaxed text-left">
                    {b.bio || 'Profissional gabaritado, pronto para dar o melhor acabamento ao seu corte de cabelo ou barba.'}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* STEP 3: Confirm date & time */}
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase text-yellow-500 border-b border-zinc-850 pb-2 mb-4">
              3. Data & Horário
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Escolha o Dia</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Escolha o Horário</label>
                <input
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
                <p className="text-[9px] text-zinc-500 italic mt-1 text-left">Horário de funcionamento: de {parameters.openTime} até {parameters.closeTime}.</p>
              </div>

              <div className="pt-4 border-t border-zinc-850 text-left">
                <span className="text-[9px] text-zinc-500 uppercase font-mono block mb-1">Local do serviço</span>
                <p className="text-xs font-bold text-white leading-tight">{parameters.shopName}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{parameters.address}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm py-3 rounded-lg cursor-pointer transition duration-150 uppercase tracking-wider mt-4 shadow"
              >
                Confirmar Agendamento Online
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SUBSCRIPTIONS & BENEFITS */}
      {activeTab === 'assinatura' && (
        <div className="space-y-6">
          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl text-left space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Nosso Clube de Assinatura Recorrente
            </h3>
            <p className="text-xs text-zinc-400">
              Tenha direito a múltiplos atendimentos na barbearia no mês, e pague por uma mensalidade única extremamente vantajosa.
            </p>
          </div>

          {activeSubscription && activeSubscribedPlan ? (
            <div className="bg-[#101012] border-2 border-yellow-500 p-6 rounded-2xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5 col-span-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-yellow-500 text-black text-[11px] uppercase font-bold font-mono rounded">
                    Assinante VIP Club
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-semibold">Ativo desde {activeSubscription.startDate}</span>
                </div>
                <h4 className="text-lg font-extrabold text-white">{activeSubscribedPlan.name}</h4>
                <p className="text-xs text-zinc-400 max-w-lg">{activeSubscribedPlan.description}</p>
                <p className="text-xs font-mono text-yellow-500 font-bold">Reserva de cortes restantes para o ciclo atual: {activeSubscription.servicesRemaining} cortes</p>
              </div>

              <button
                onClick={handleCancelMySubscription}
                className="p-2.5 px-4 text-xs font-mono uppercase bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-950/50 rounded-xl"
              >
                Cancelar Assinatura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {plans.map(p => (
                <div key={p.id} className="bg-[#101012] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-base leading-tight uppercase">{p.name}</h4>
                      <div className="text-right font-mono">
                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">MENSALIDADE</span>
                        <span className="text-lg font-bold text-yellow-500">{formatCurrency(p.priceMonthly)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{p.description}</p>

                    <div className="mt-4 space-y-2 border-t border-zinc-900 pt-3">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider font-mono">Termos inclusos:</span>
                      {p.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubscribeToPlan(p.id)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs py-3 rounded-lg cursor-pointer transition uppercase"
                  >
                    Filiar-se com 1-Clique
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS HISTORY */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block text-left">
            Histórico das Suas Marcações de Horários
          </h3>

          {myAppointments.length === 0 ? (
            <div className="bg-[#101012] border border-zinc-800 p-8 rounded-xl text-center text-zinc-500 text-xs">
              Você ainda não efetuou nenhuma reserva online. Comece agora escolhendo serviços da aba "Novo Agendamento Online"!
            </div>
          ) : (
            <div className="bg-[#101012] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#141416] text-zinc-400 border-b border-zinc-800 font-mono">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Serviço Agendado</th>
                      <th className="p-3">Barbeiro Selecionado</th>
                      <th className="p-3">Data Prevista</th>
                      <th className="p-3">Hora agendada</th>
                      <th className="p-3 text-right">Status do Atendimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 font-mono">
                    {myAppointments.slice().reverse().map(apt => (
                      <tr key={apt.id} className="hover:bg-zinc-900/10 text-zinc-300">
                        <td className="p-3 text-[10px] text-zinc-500">{apt.id.slice(-5)}</td>
                        <td className="p-3 font-bold text-white">{apt.serviceName}</td>
                        <td className="p-3">{apt.barberName}</td>
                        <td className="p-3">{apt.date}</td>
                        <td className="p-3 text-yellow-500 font-bold">{apt.time}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded ${
                            apt.status === 'SCHEDULED' ? 'bg-yellow-500/10 text-yellow-500' :
                            apt.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                            apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-zinc-800 text-zinc-500'
                          }`}>
                            {apt.status === 'SCHEDULED' ? 'Marcado/Espera' :
                             apt.status === 'IN_PROGRESS' ? 'Na Cadeira' :
                             apt.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
