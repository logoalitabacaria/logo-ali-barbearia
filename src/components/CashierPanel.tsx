/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Wallet, Check, AlertCircle, Trash2, Clock, Eye, Info, Percent } from 'lucide-react';
import { User, Comanda, BarberDetail, SystemParameters, CustomerSubscription } from '../types';

interface CashierPanelProps {
  comandas: Comanda[];
  users: User[];
  barberDetails: BarberDetail[];
  subscriptions: CustomerSubscription[];
  parameters: SystemParameters;
  onUpdateState: (key: string, val: any) => void;
}

export default function CashierPanel({
  comandas,
  users,
  barberDetails,
  subscriptions,
  parameters,
  onUpdateState
}: CashierPanelProps) {
  const [filterMode, setFilterMode] = useState<'PENDING' | 'PAID'>('PENDING');
  const [selectedCmdId, setSelectedCmdId] = useState<string | null>(null);

  // checkout form state
  const [discountVal, setDiscountVal] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'MONEY' | 'CARD' | 'PIX' | 'SUBSCRIPTION'>('PIX');

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // FILTER COMANDAS AT CAIXA DESK
  const displayedComandas = filterMode === 'PENDING'
    ? comandas.filter(c => c.status === 'OPEN')
    : comandas.filter(c => c.status === 'PAID');

  const selectedComanda = comandas.find(c => c.id === selectedCmdId);

  // CHECKOUT ACTION: MARKS COMANDA AS PAID AND RE-CALCULATES COMMISSIONS
  const handleCheckoutComanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComanda) return;

    const discount = parseFloat(discountVal) || 0;
    const finalTotal = Math.max(0, selectedComanda.subtotal - discount);

    // Dynamic and high-fidelity Barber Commission breakdown calculation:
    // 1. Find standard barber detail rates
    const bDetail = barberDetails.find(d => d.userId === selectedComanda.barberId);
    const standardSrvRate = bDetail?.commissionRateStandard ?? parameters.defaultCommissionService;
    const subscriptionSrvRate = bDetail?.commissionRateSubscription ?? 0.35;
    const productCommissionRate = bDetail?.commissionRateProduct ?? parameters.defaultCommissionProduct; // e.g. 15% custom or default 10%
    const tabacariaCommissionRate = bDetail?.commissionRateTabacaria ?? parameters.defaultCommissionTabacaria ?? 0;

    // 2. Compute dynamic item-by-item commission payout amounts
    let calculatedCommissionAmount = 0;

    selectedComanda.items.forEach(item => {
      const lineValue = item.quantity * item.unitPrice;
      if (item.isTabacaria) {
        // Tabacaria commission (standard or custom)
        calculatedCommissionAmount += lineValue * tabacariaCommissionRate;
      } else if (item.isProduct) {
        // Product commission (standard e.g. 10%)
        calculatedCommissionAmount += lineValue * productCommissionRate;
      } else {
        // Service commission
        if (paymentMethod === 'SUBSCRIPTION') {
          // If customer used subscription benefits, barber gets local recurring commission rate!
          calculatedCommissionAmount += lineValue * subscriptionSrvRate;
        } else {
          calculatedCommissionAmount += lineValue * standardSrvRate;
        }
      }
    });

    // Substract proportional discount from commission safely
    const ratio = selectedComanda.subtotal > 0 ? (finalTotal / selectedComanda.subtotal) : 1;
    calculatedCommissionAmount = calculatedCommissionAmount * ratio;

    // 3. Mark comanda as PAID
    const updatedComandas = comandas.map(c => {
      if (c.id === selectedComanda.id) {
        return {
          ...c,
          status: 'PAID' as const,
          discount: discount,
          total: finalTotal,
          paymentMethod: paymentMethod,
          completedAt: new Date().toISOString(),
          commissionAmount: parseFloat(calculatedCommissionAmount.toFixed(2))
        };
      }
      return c;
    });

    // 4. Update appointment status (if linked) to COMPLETED
    if (selectedComanda.appointmentId) {
      onUpdateState('appointments', onGetCompletedAppointments(selectedComanda.appointmentId));
    }

    // 5. If paid by SUBSCRIPTION, deduct remaining times from active membership!
    if (paymentMethod === 'SUBSCRIPTION') {
      const activeMember = subscriptions.find(s => s.customerId === selectedComanda.customerId && s.isActive);
      if (activeMember) {
        onUpdateState('subscriptions', subscriptions.map(s => {
          if (s.id === activeMember.id) {
            return {
              ...s,
              servicesRemaining: Math.max(0, s.servicesRemaining - 1),
              isActive: s.servicesRemaining - 1 > 0
            };
          }
          return s;
        }));
      }
    }

    onUpdateState('comandas', updatedComandas);
    setSelectedCmdId(null);
    setDiscountVal('0');
    setPaymentMethod('PIX');
    alert('Comanda registrada como PAGA com sucesso! Comissão provisionada na ficha do barbeiro.');
  };

  const onGetCompletedAppointments = (aptId: string) => {
    try {
      const stored = localStorage.getItem('logo_ali_b2_appointments');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((a: any) => a.id === aptId ? { ...a, status: 'COMPLETED' } : a);
      }
    } catch {}
    return [];
  };

  return (
    <div className="space-y-6 text-left">
      {/* EXTREMELY CRITICAL NOTIFICATION BANNER ENFORCING SCOPE boundaries */}
      <div className="bg-yellow-500/10 border-2 border-yellow-500/40 p-5 rounded-2xl flex items-start gap-3 text-yellow-500 text-xs leading-snug">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm tracking-wider uppercase font-mono mb-1">📢 IMPORTANTE: Espelho de Digitação Externa</h4>
          <p className="text-zinc-300">
            Este terminal **não substitui** o seu ERP ou PDV fiscal físico de balcão. Ele serve como um **espelho de consumo** intuitivo para o caixa ler o que foi consumido na cadeira, de onde poderá digitar as informações no software principal da loja de forma ágil.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest leading-none">
          Operador de Caixa: Balcão e Lançamentos
        </h3>
        {/* Toggle options */}
        <div className="flex gap-1.5 bg-[#121214] p-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
          <button
            onClick={() => {
              setFilterMode('PENDING');
              setSelectedCmdId(null);
            }}
            className={`px-3 py-1 rounded cursor-pointer ${filterMode === 'PENDING' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            Aguardando ({comandas.filter(c => c.status === 'OPEN').length})
          </button>
          <button
            onClick={() => {
              setFilterMode('PAID');
              setSelectedCmdId(null);
            }}
            className={`px-3 py-1 rounded cursor-pointer ${filterMode === 'PAID' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            Faturadas hoje ({comandas.filter(c => c.status === 'PAID').length})
          </button>
        </div>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column of list */}
        <div className="lg:col-span-1 space-y-2.5">
          {displayedComandas.length === 0 ? (
            <div className="bg-[#101012] border border-zinc-850 p-6 rounded-xl text-center text-zinc-500 text-xs">
              📂 Nenhuma comanda {filterMode === 'PENDING' ? 'aguardando pagamento' : 'paga'} neste momento.
            </div>
          ) : (
            <div className="space-y-2">
              {displayedComandas.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCmdId(c.id);
                  }}
                  className={`w-full p-4 rounded-xl text-left border text-xs transition ${
                    selectedCmdId === c.id
                      ? 'bg-[#18181D] border-yellow-500'
                      : 'bg-[#101012] border-zinc-850 hover:bg-[#131317]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate max-w-[130px]">
                      <span className="font-bold text-white block truncate">{c.customerName}</span>
                      <span className="text-[10px] font-medium text-zinc-400">Atendido por: {c.barberName}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 text-yellow-500 border border-zinc-850 px-2 py-0.5 rounded font-bold">
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-zinc-900 mt-2.5 flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{c.items.length} itens inclusos</span>
                    <span>Código {c.id.slice(-5)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column of details & checkout trigger */}
        <div className="lg:col-span-2">
          {!selectedComanda ? (
            <div className="bg-[#101012] border border-zinc-805 p-8 rounded-xl text-zinc-500 text-xs text-center flex flex-col items-center justify-center min-h-[250px] font-medium h-full">
              <Eye className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="font-semibold text-zinc-400">Nenhuma comanda aberta selecionada.</p>
              <p className="text-zinc-600 mt-0.5">Selecione ao lado para abrir o espelho de digitação e faturamento.</p>
            </div>
          ) : (
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-zinc-850 flex justify-between items-start">
                <div>
                  <span className="text-[9px] text-yellow-500 font-mono block uppercase font-bold text-zinc-400 mb-1 leading-none">Espelho de Consumo para Digitação Fiscal</span>
                  <h4 className="text-base text-white font-extrabold">{selectedComanda.customerName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Lançada por barbeiro: <strong>{selectedComanda.barberName}</strong> | Ref: {selectedComanda.id}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  selectedComanda.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500 animate-pulse'
                }`}>
                  {selectedComanda.status === 'PAID' ? 'Faturada/Paga' : 'Aguardando Checkout'}
                </span>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Resumo dos Consumos (Copiar p/ ERP):</span>
                <div className="bg-zinc-950 px-4 py-3 border border-zinc-850 rounded-xl space-y-2.5">
                  {selectedComanda.items.map(item => (
                    <div key={item.id} className="text-xs flex justify-between items-center text-zinc-300">
                      <div>
                        <p className="font-bold text-white max-w-[200px] truncate">{item.description}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">Qtd: {item.quantity} un x {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <span className="font-mono text-zinc-300">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                  <div className="text-xs flex justify-between items-center border-t border-zinc-900 pt-2 text-zinc-400 font-mono">
                    <span>Subtotal Líquido</span>
                    <span>{formatCurrency(selectedComanda.subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* Comission simulation warning inside Caixa for transparency */}
              {selectedComanda.status === 'PAID' && (
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl text-left space-y-1">
                  <span className="text-[9px] text-zinc-400 block uppercase font-bold font-mono">Cálculo de Repasse Associado:</span>
                  <p className="text-xs text-white">Comissão repassada para <strong>{selectedComanda.barberName}</strong>: <span className="font-mono text-yellow-500 font-bold">{formatCurrency(selectedComanda.commissionAmount || 0)}</span></p>
                  <p className="text-[10px] text-zinc-500">Forma utilizada: {selectedComanda.paymentMethod} (faturamento final de {formatCurrency(selectedComanda.total)})</p>
                </div>
              )}

              {/* Checkout inputs (only visible for pending) */}
              {selectedComanda.status === 'OPEN' && (
                <form onSubmit={handleCheckoutComanda} className="space-y-4 pt-2 border-t border-zinc-850">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add Discount */}
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest block mb-1">Desconto Aplicado (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-zinc-500 text-xs font-mono">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={discountVal}
                          onChange={(e) => setDiscountVal(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-9 py-1 px-3 text-xs font-mono text-white text-right"
                        />
                      </div>
                    </div>

                    {/* Method */}
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest block mb-1">Forma de Recebimento</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs text-white font-mono cursor-pointer"
                      >
                        <option value="PIX">⚡ PIX instantâneo</option>
                        <option value="CARD">💳 Cartão de Débito/Crédito</option>
                        <option value="MONEY">💵 Dinheiro Físico</option>
                        <option value="SUBSCRIPTION">🔄 Assinatura / Clube de Vantagem</option>
                      </select>
                    </div>
                  </div>

                  {/* Complete Action buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-3">
                    <div className="text-left">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono leading-none">VALOR COM DESCONTO</span>
                      <span className="text-xl font-bold font-mono text-yellow-500">
                        {formatCurrency(Math.max(0, selectedComanda.subtotal - (parseFloat(discountVal) || 0)))}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-6 py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow transition"
                    >
                      Confirmar Pagamento & Finalizar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
