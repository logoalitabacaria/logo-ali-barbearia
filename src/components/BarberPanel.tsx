/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Plus, Scissors, Trash2, UserPlus, ShoppingBag, CreditCard, Clock, Check, Send, AlertCircle } from 'lucide-react';
import { User, Service, Product, Appointment, Comanda, ComandaItem, ComandaStatus } from '../types';

interface BarberPanelProps {
  users: User[];
  services: Service[];
  products: Product[];
  appointments: Appointment[];
  comandas: Comanda[];
  currentBarber: User;
  onUpdateState: (key: string, val: any) => void;
}

export default function BarberPanel({
  users,
  services,
  products,
  appointments,
  comandas,
  currentBarber,
  onUpdateState
}: BarberPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'comandas' | 'agenda' | 'comissoes'>('comandas');

  // Barber commission period filtering states
  const [bPeriod, setBPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('mensal');
  const [bStartDate, setBStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [bEndDate, setBEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Client Quick Creation Form
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Schedulings Quick Creation Form
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCliId, setSelectedCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [bookingDate, setBookingDate] = useState('2026-05-27');
  const [bookingTime, setBookingTime] = useState('14:00');

  // Comanda Edition / Detail View Active State
  const [selectedComandaId, setSelectedComandaId] = useState<string | null>(null);

  // Addition of items form inside Comanda
  const [comandaItemType, setComandaItemType] = useState<'service' | 'product' | 'tabacaria'>('service');
  const [addSelectedSrvId, setAddSelectedSrvId] = useState(services[0]?.id || '');
  const [addSelectedPrdId, setAddSelectedPrdId] = useState(products[0]?.id || '');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [addQuantity, setAddQuantity] = useState('1');

  // Manual Comanda Opening states
  const [showManualComandaForm, setShowManualComandaForm] = useState(false);
  const [manualComandaCliId, setManualComandaCliId] = useState(users.find(u => u.role === 'CUSTOMER')?.id || '');

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // REGISTER CLIENTS DIRECTLY BY THE BARBER
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const shortId = `cli-${Date.now()}`;
    const newClient: User = {
      id: shortId,
      name: clientName,
      email: `${shortId}@logoalibarber.com`,
      role: 'CUSTOMER',
      phone: clientPhone,
      isActive: true,
      avatar: '🧔',
      login: clientPhone.replace(/\D/g, '').slice(-6) || 'cliente', // quick auto login using last phone digits
      password: '123',
      permissions: ['CUSTOMER_PORTAL']
    };

    onUpdateState('users', [...users, newClient]);
    setSelectedCliId(shortId); // preselect in scheduling form
    setManualComandaCliId(shortId); // preselect in comanda form

    setClientName('');
    setClientPhone('');
    setShowClientModal(false);
    alert('Cliente cadastrado com sucesso! Perfil já disponível no sistema.');
  };

  // SCHEDULE NEW SERVICES DIRECTLY BY THE BARBER
  const handleCreateAppointmentSymbolic = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = users.find(u => u.id === selectedCliId);
    const srv = services.find(u => u.id === selectedServiceId);

    if (!cli || !srv) {
      alert('Selecione um cliente e um serviço válidos.');
      return;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      customerId: cli.id,
      customerName: cli.name,
      customerPhone: cli.phone,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePrice: srv.price,
      date: bookingDate,
      time: bookingTime,
      status: 'SCHEDULED'
    };

    onUpdateState('appointments', [...appointments, newAppointment]);
    setShowBookingForm(false);
    alert(`Agendamento realizado com sucesso para ${cli.name}!`);
  };

  // OPEN NEW COMANDA IN CO-RELATION WITH COMPLETED / STARTING VISITS
  const handleStartComandaForAppointment = (apt: Appointment) => {
    // Check if comanda already exists for this appointment
    const collision = comandas.find(c => c.appointmentId === apt.id);
    if (collision) {
      setSelectedComandaId(collision.id);
      setActiveSubTab('comandas');
      return;
    }

    // Open first-time comanda
    const newComandaId = `cmd-${Date.now()}`;
    const initialItem: ComandaItem = {
      id: `it-${Date.now()}`,
      description: `${apt.serviceName} (Serviço)`,
      quantity: 1,
      unitPrice: apt.servicePrice,
      isProduct: false
    };

    const newComanda: Comanda = {
      id: newComandaId,
      appointmentId: apt.id,
      customerId: apt.customerId,
      customerName: apt.customerName,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      status: 'OPEN',
      items: [initialItem],
      subtotal: apt.servicePrice,
      discount: 0,
      total: apt.servicePrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update appointment status to IN_PROGRESS
    const updatedAppointments = appointments.map(a => {
      if (a.id === apt.id) return { ...a, status: 'IN_PROGRESS' as const };
      return a;
    });

    onUpdateState('appointments', updatedAppointments);
    onUpdateState('comandas', [...comandas, newComanda]);
    setSelectedComandaId(newComandaId);
    setActiveSubTab('comandas');
  };

  // MANUALLY OPEN AN EMPTY / DOCKLESS COMANDA (WALK-IN CLIENT)
  const handleOpenManualComanda = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = users.find(u => u.id === manualComandaCliId);
    if (!cli) return;

    const newComandaId = `cmd-${Date.now()}`;
    const newComanda: Comanda = {
      id: newComandaId,
      customerId: cli.id,
      customerName: cli.name,
      barberId: currentBarber.id,
      barberName: currentBarber.name,
      status: 'OPEN',
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateState('comandas', [...comandas, newComanda]);
    setSelectedComandaId(newComandaId);
    setShowManualComandaForm(false);
  };

  // EDIT ITEMS INSIDE ACTIVE COMANDA
  const handleAddItemToSelectedComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComandaId) return;

    const comanda = comandas.find(c => c.id === selectedComandaId);
    if (!comanda) return;

    let newItem: ComandaItem;
    const qty = parseInt(addQuantity) || 1;

    if (comandaItemType === 'service') {
      const srv = services.find(s => s.id === addSelectedSrvId);
      if (!srv) return;
      newItem = {
        id: `it-${Date.now()}`,
        description: `${srv.name} (Serviço)`,
        quantity: qty,
        unitPrice: srv.price,
        isProduct: false
      };
    } else if (comandaItemType === 'product') {
      const prd = products.find(p => p.id === addSelectedPrdId);
      if (!prd) return;

      newItem = {
        id: `it-${Date.now()}`,
        description: `${prd.name} (Produto)`,
        quantity: qty,
        unitPrice: prd.price,
        isProduct: true
      };
    } else {
      // tabacaria (unregistered tabacaria product)
      const desc = customDescription.trim() || 'Produto Tabacaria';
      const priceVal = parseFloat(customPrice) || 0;
      newItem = {
        id: `it-${Date.now()}`,
        description: `${desc} (Tabacaria)`,
        quantity: qty,
        unitPrice: priceVal,
        isProduct: true,
        isTabacaria: true
      };
    }

    const updatedItems = [...comanda.items, newItem];
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const newTotal = Math.max(0, newSubtotal - comanda.discount);

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        return {
          ...c,
          items: updatedItems,
          subtotal: newSubtotal,
          total: newTotal,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
    
    // Clear custom fields
    setCustomDescription('');
    setCustomPrice('');
  };

  const handleRemoveItemFromSelectedComanda = (itemId: string) => {
    if (!selectedComandaId) return;

    const comanda = comandas.find(c => c.id === selectedComandaId);
    if (!comanda) return;

    // No stock restoration needed

    const updatedItems = comanda.items.filter(item => item.id !== itemId);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const newTotal = Math.max(0, newSubtotal - comanda.discount);

    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComandaId) {
        return {
          ...c,
          items: updatedItems,
          subtotal: newSubtotal,
          total: newTotal,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    onUpdateState('comandas', updatedComandas);
  };

  // CANCEL COMANDA (CLEAR VISUAL)
  const handleCancelComanda = (cmdId: string) => {
    if (!confirm('Deseja cancelar esta comanda de consumo?')) return;
    const matched = comandas.find(c => c.id === cmdId);
    if (matched && matched.appointmentId) {
      // Revert appointment back to Scheduled
      onUpdateState('appointments', appointments.map(a => {
        if (a.id === matched.appointmentId) {
          return { ...a, status: 'SCHEDULED' as const };
        }
        return a;
      }));
    }

    onUpdateState('comandas', comandas.filter(c => c.id !== cmdId));
    setSelectedComandaId(null);
  };

  // FILTERED RECORDS FOR THIS BARBER
  const activeComandasForBarber = comandas.filter(
    c => c.barberId === currentBarber.id && c.status === 'OPEN'
  );

  const appointmentsForBarber = appointments.filter(
    a => a.barberId === currentBarber.id && a.status === 'SCHEDULED'
  );

  const activeComandaObj = comandas.find(c => c.id === selectedComandaId);

  return (
    <div className="space-y-6 text-left">
      {/* Top action buttons bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#101012] border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-zinc-900 p-2 rounded-xl border border-zinc-850">💈</span>
          <div>
            <h2 className="text-base font-bold text-white">Espaço do Barbeiro: <strong className="text-yellow-500">{currentBarber.name}</strong></h2>
            <p className="text-xs text-zinc-400">Lance comandas, gerencie sua agenda e cadastre clientes em atendimento.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:text-yellow-500 text-xs font-semibold uppercase font-mono rounded-lg transition duration-150 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Cadastrar Cliente</span>
          </button>

          <button
            onClick={() => setShowManualComandaForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:text-yellow-500 text-xs font-semibold uppercase font-mono rounded-lg transition duration-150 cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Lançar Comanda Avulsa</span>
          </button>

          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold uppercase font-mono rounded-lg transition duration-150 cursor-pointer shadow"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar Serviço</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs buttons */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-850 pb-2">
        <button
          onClick={() => setActiveSubTab('comandas')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'comandas' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          📝 Comandas Abertas da Minha Cadeira ({activeComandasForBarber.length})
        </button>
        <button
          onClick={() => setActiveSubTab('agenda')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'agenda' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          📅 Minha Agenda Hoje ({appointmentsForBarber.length} Pendentes)
        </button>
        <button
          onClick={() => setActiveSubTab('comissoes')}
          className={`px-4 py-2 rounded-lg text-xs font-mono uppercase transition duration-150 cursor-pointer ${
            activeSubTab === 'comissoes' ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-[#121215] text-zinc-400'
          }`}
        >
          💰 Minhas Comissões & Relatório
        </button>
      </div>

      {/* MODAL 1: REGISTER CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-left">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 mb-3 block">Novo Cadastro de Cliente</h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo ex: Roberto Santos"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">WhatsApp / Celular com DDD *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ex: (11) 94444-2222"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW APPOINTMENT FORM BY BARBER */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-left">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 mb-3 block">Novo Agendamento</h3>
            <form onSubmit={handleCreateAppointmentSymbolic} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Selecione o Cliente</label>
                <select
                  value={selectedCliId}
                  onChange={(e) => setSelectedCliId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                >
                  {users.filter(u => u.role === 'CUSTOMER').map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
                <p className="text-[9px] text-zinc-500 mt-0.5">Não encontrou o cliente no banco? Cadastre-o primeiro no botão de Cadastro.</p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Escolha o Serviço</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {formatCurrency(s.price)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Mudar ideia
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Reservar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL COMANDA (WALK IN) FORM */}
      {showManualComandaForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121215] border-2 border-yellow-500 rounded-2xl p-6 w-full max-w-sm text-left">
            <h3 className="text-sm font-mono font-bold uppercase text-yellow-500 mb-2 block">Lançar Comanda Avulsa</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Caso o cliente tenha entrado na loja sem agendar previamente (Cliente de balcão).</p>
            <form onSubmit={handleOpenManualComanda} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono block uppercase mb-1">Vincular Cliente</label>
                <select
                  value={manualComandaCliId}
                  onChange={(e) => setManualComandaCliId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                >
                  {users.filter(u => u.role === 'CUSTOMER').map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualComandaForm(false)}
                  className="px-3 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                >
                  Encerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase"
                >
                  Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: COMANDAS EM ABERTO */}
      {activeSubTab === 'comandas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active list column */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Fila de Comandas Atualmente em Aberto
            </h3>
            {activeComandasForBarber.length === 0 ? (
              <div className="bg-[#101012] border border-zinc-850 p-6 rounded-xl text-center text-zinc-500 text-xs">
                ☕ Nenhuma comanda aberta na sua cadeira agora. Use "Lançar Comanda Avulsa" ou inicie um atendimento agendado na aba ao lado!
              </div>
            ) : (
              <div className="space-y-2">
                {activeComandasForBarber.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedComandaId(c.id);
                    }}
                    className={`w-full p-4 rounded-xl text-left border transition ${
                      selectedComandaId === c.id
                        ? 'bg-[#18181C] border-yellow-500'
                        : 'bg-[#101012] border-zinc-850 hover:bg-[#131317]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs block truncate max-w-[140px]">{c.customerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-yellow-500 font-mono font-bold">
                        {formatCurrency(c.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-zinc-900 text-[10px] text-zinc-400">
                      <span>Carga: {c.items.length} itens</span>
                      <span className="font-mono text-zinc-500 uppercase">{c.id.slice(-5)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comanda details panel */}
          <div className="lg:col-span-2">
            {!activeComandaObj ? (
              <div className="bg-[#101012] border border-zinc-800 p-8 rounded-xl text-center text-zinc-500 text-xs flex flex-col items-center justify-center h-full min-h-[300px]">
                <Plus className="w-8 h-8 text-zinc-700 mb-2.5" />
                <p className="font-semibold text-zinc-400">Selecione uma comanda na lista para visualizar, editar ou acrescentar itens.</p>
                <p className="text-zinc-600 mt-1 max-w-sm">Você pode alterar livremente os serviços prestados e incluir compras de produtos da tabacaria anexa na cadeira do cliente.</p>
              </div>
            ) : (
              <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-start pb-4 border-b border-zinc-850">
                  <div>
                    <span className="text-[9px] font-mono text-yellow-500 block uppercase font-bold leading-none mb-1">Mesa do Profissional / Comanda</span>
                    <h3 className="text-sm font-bold text-white uppercase leading-tight">{activeComandaObj.customerName}</h3>
                    <p className="text-[10px] text-zinc-400 mt-1">Barbeiro: <strong>{activeComandaObj.barberName}</strong> | Código: {activeComandaObj.id}</p>
                  </div>
                  <button
                    onClick={() => handleCancelComanda(activeComandaObj.id)}
                    className="p-1 px-2 text-[10px] font-bold text-red-500 border border-red-900/30 bg-red-950/20 hover:bg-red-950/50 rounded uppercase tracking-wider"
                  >
                    Excluir Comanda
                  </button>
                </div>

                {/* Items contained list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest block">Itens Lançados</h4>
                  {activeComandaObj.items.length === 0 ? (
                    <p className="bg-zinc-950/40 p-4 border border-zinc-850 text-zinc-500 text-[11px] rounded-lg">
                      Nenhum item adicionado a esta comanda ainda. Selecione abaixo os produtos ou serviços consumidos!
                    </p>
                  ) : (
                    <div className="divide-y divide-zinc-850 bg-zinc-950 px-4 rounded-xl border border-zinc-850">
                      {activeComandaObj.items.map(item => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white">{item.description}</p>
                            <p className="text-[10px] text-zinc-400">
                              {item.quantity} un x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-zinc-300 font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                            <button
                              onClick={() => handleRemoveItemFromSelectedComanda(item.id)}
                              className="text-red-500 hover:text-red-400 p-1"
                              title="Remover Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Insertion panel inside this comanda */}
                <div className="bg-zinc-950/90 border border-zinc-850 p-4 rounded-xl text-left space-y-3">
                  <h4 className="text-[10px] font-bold font-mono text-yellow-500 uppercase tracking-widest block">
                    Inserir Novo Consumo do Cliente
                  </h4>

                  <form onSubmit={handleAddItemToSelectedComanda} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                    {/* Select type */}
                    <div className="md:col-span-3">
                      <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Tipo</label>
                      <select
                        value={comandaItemType}
                        onChange={(e) => setComandaItemType(e.target.value as any)}
                        className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono cursor-pointer"
                      >
                        <option value="service">💇 Serviço</option>
                        <option value="product">🧴 Produto</option>
                        <option value="tabacaria">🍂 Produtos Tabacaria</option>
                      </select>
                    </div>

                    {/* Choose or Input fields depending on type */}
                    {comandaItemType === 'service' || comandaItemType === 'product' ? (
                      <div className="md:col-span-5">
                        <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Item do Catálogo</label>
                        {comandaItemType === 'service' ? (
                          <select
                            value={addSelectedSrvId}
                            onChange={(e) => setAddSelectedSrvId(e.target.value)}
                            className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                          >
                            {services.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={addSelectedPrdId}
                            onChange={(e) => setAddSelectedPrdId(e.target.value)}
                            className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="md:col-span-3">
                          <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Descrição</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Isqueiro Clipper, Palheiro"
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Valor (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0,00"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </>
                    )}

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="text-[9px] text-zinc-500 font-mono block uppercase mb-1">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={addQuantity}
                        onChange={(e) => setAddQuantity(e.target.value)}
                        className="w-full bg-[#121214] border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono text-center"
                      />
                    </div>

                    {/* Button */}
                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-1 rounded cursor-pointer transition uppercase"
                      >
                        Inserir
                      </button>
                    </div>
                  </form>
                </div>

                {/* Subtotal Display / Caixa reminder */}
                <div className="pt-4 border-t border-zinc-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="font-mono bg-[#09090b] px-4 py-2 border border-zinc-850 rounded-xl">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase leading-none mb-1">Total Consumido</span>
                    <span className="text-lg font-bold text-yellow-500">{formatCurrency(activeComandaObj.total)}</span>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setSelectedComandaId(null)}
                      className="px-4 py-2 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-xs font-bold"
                    >
                      Recolher Detalhes
                    </button>
                    <button
                      onClick={() => {
                        alert('Dados da comanda sincronizados para o caixa da loja com sucesso! O operador do caixa poderá finalizá-la usando seu espelho de comanda.');
                        setSelectedComandaId(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-black hover:bg-yellow-600 rounded-lg text-xs font-bold uppercase cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Despachar p/ Caixa</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MINHA AGENDA HOJE */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider block">
            Seus Atendimentos Agendados Ativos
          </h3>

          {appointmentsForBarber.length === 0 ? (
            <div className="bg-[#101012] border border-zinc-800 p-8 rounded-xl text-center text-zinc-500 text-xs text-zinc-400">
              ☕ Nenhuma reserva de corte pendente para você na fila de agendamento hoje.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointmentsForBarber.map(apt => (
                <div key={apt.id} className="bg-[#101012] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                        ID: {apt.id.slice(-5)}
                      </span>
                      <span className="font-mono text-yellow-500 font-bold text-xs bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 rounded flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </span>
                    </div>

                    <div className="mt-3 text-left">
                      <span className="text-2xl block mb-1">👤</span>
                      <h4 className="font-bold text-white text-sm">{apt.customerName}</h4>
                      <p className="text-xs text-yellow-500 font-semibold mt-1">Serviço: {apt.serviceName}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{apt.customerPhone ? `WhatsApp: ${apt.customerPhone}` : 'Sem telefone informado.'}</p>
                      <p className="text-[11px] font-mono text-zinc-500">Data agendada: {apt.date}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartComandaForAppointment(apt)}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2.5 rounded-lg transition duration-150 uppercase"
                  >
                    Iniciar Atendimento (Lançar Comanda)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: RELATÓRIO DE COMISSÕES DO BARBEIRO */}
      {activeSubTab === 'comissoes' && (() => {
        const getFilteredComandasForBarber = () => {
          let start: Date;
          let end: Date = new Date();
          end.setHours(23, 59, 59, 999);

          if (bPeriod === 'diario') {
            start = new Date();
            start.setHours(0, 0, 0, 0);
          } else if (bPeriod === 'semanal') {
            start = new Date();
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
          } else if (bPeriod === 'mensal') {
            start = new Date();
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
          } else {
            // personalizado
            start = bStartDate ? new Date(bStartDate + 'T00:00:00') : new Date(0);
            const parsedEnd = bEndDate ? new Date(bEndDate + 'T23:59:59') : new Date();
            end = parsedEnd;
          }

          return comandas.filter(c => {
            if (c.barberId !== currentBarber.id || c.status !== 'PAID') return false;
            if (!c.completedAt) return false;
            const compDate = new Date(c.completedAt);
            return compDate >= start && compDate <= end;
          });
        };

        const bFilteredCmds = getFilteredComandasForBarber();

        // Calculate core stats
        const bRevenue = bFilteredCmds.reduce((sum, c) => sum + c.total, 0);
        const bCommissionsTotal = bFilteredCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const bCount = bFilteredCmds.length;
        const bAvgTicket = bCount > 0 ? bRevenue / bCount : 0;

        return (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Filter card */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
                  Filtrar Período das Minhas Comissões
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione o período desejado para conferir seus atendimentos concluídos e valores de comissão devida.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-zinc-950 border border-zinc-850 p-1 rounded-lg flex gap-1">
                  {(['diario', 'semanal', 'mensal', 'personalizado'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setBPeriod(p)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider font-mono uppercase cursor-pointer transition ${
                        bPeriod === p ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      {p === 'diario' ? 'Hoje' : p === 'semanal' ? '7 dias' : p === 'mensal' ? '30 dias' : 'Personalizar'}
                    </button>
                  ))}
                </div>

                {bPeriod === 'personalizado' && (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="date"
                      value={bStartDate}
                      onChange={(e) => setBStartDate(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <span className="text-zinc-500">até</span>
                    <input
                      type="date"
                      value={bEndDate}
                      onChange={(e) => setBEndDate(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Barber KPI stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total Faturado por Você</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{formatCurrency(bRevenue)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Soma bruta dos atendimentos</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Suas Comissões Totais</span>
                <span className="text-2xl font-bold font-mono text-yellow-500 block mt-1">{formatCurrency(bCommissionsTotal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Valor total líquido a receber</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Clientes Atendidos</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{bCount} cortados</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Comandas fechadas e pagas</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Seu Ticket Médio</span>
                <span className="text-2xl font-bold font-mono text-teal-400 block mt-1">{formatCurrency(bAvgTicket)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Gasto médio do seu cliente</span>
              </div>
            </div>

            {/* List of completed comandas for barber */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 flex justify-between items-center">
                <span>Histórico Detalhado de Comandas e Ganhos no Período</span>
                <span className="text-[10px] text-zinc-500 lowercase font-normal italic">apenas comandas pagas</span>
              </h4>

              <div className="overflow-x-auto text-xs">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-zinc-400 font-mono text-[10px]">
                      <th className="pb-2 text-left font-semibold">Cliente / Código</th>
                      <th className="pb-2 text-left font-semibold">Data Conclusão</th>
                      <th className="pb-2 text-left font-semibold">Destaque de Itens Consumidos</th>
                      <th className="pb-2 text-right font-semibold">Total Faturado</th>
                      <th className="pb-2 text-right font-semibold">Sua Comissão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {bFilteredCmds.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-900/10">
                        <td className="py-3.5 text-left">
                          <span className="font-semibold text-white block">{c.customerName}</span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mt-0.5">{c.id.slice(-6)} • {c.paymentMethod || 'PIX'}</span>
                        </td>
                        <td className="py-3.5 text-left font-mono text-zinc-300">
                          {c.completedAt ? new Date(c.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-3.5 text-left text-zinc-400 max-w-xs truncate">
                          {c.items.map(it => `${it.quantity}x ${it.description.replace(' (Serviço)', '').replace(' (Produto)', '')}`).join(', ')}
                        </td>
                        <td className="py-3.5 text-right font-mono text-white">
                          {formatCurrency(c.total)}
                        </td>
                        <td className="py-3.5 text-right font-mono text-yellow-500 font-bold">
                          {formatCurrency(c.commissionAmount || 0)}
                        </td>
                      </tr>
                    ))}
                    {bFilteredCmds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          Nenhum atendimento faturado no período escolhido.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
