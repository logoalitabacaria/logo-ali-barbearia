/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Server, Compass, FileCode, CheckCircle2, Copy } from 'lucide-react';

export default function DBModelDocs() {
  const [activeTab, setActiveTab] = useState<'sql' | 'firestore' | 'architecture'>('sql');
  const [copied, setCopied] = useState(false);

  const postgresDDL = `
-- ==========================================
-- SCRIPT DDL - LOGO ALI BARBEARIA & TABACARIA
-- Banco de Dados: PostgreSQL 15+ ou Supabase
-- ==========================================

-- 1. Tabela de Usuários (RBAC / Controle de Acesso)
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY, -- UID do Firebase Auth ou UUID v4
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'BARBER', 'CUSTOMER', 'CASHIER')),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    avatar VARCHAR(10)
);

-- 2. Tabela de Detalhes de Comissionamento dos Barbeiros
CREATE TABLE barber_details (
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    commission_rate_standard DECIMAL(5,2) NOT NULL DEFAULT 50.00, -- ex: 50.00 (% Padrão)
    commission_rate_subscription DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- ex: 30.00 (% para Assinantes)
    PRIMARY KEY (user_id)
);

-- 3. Tabela de Serviços (Catálogo)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('HAIR', 'BEARD', 'COMBO', 'TREATMENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Tabela de Planos de Assinatura (Fidelização)
CREATE TABLE loyalty_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    description TEXT,
    services_included_count INT NOT NULL DEFAULT 4,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- Comissão dinâmica específica do plano
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Vincular Planos com Clientes (Assinaturas Ativas)
CREATE TABLE customer_subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES loyalty_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    services_remaining INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

-- 6. Tabela de Agendamentos
CREATE TABLE appointments (
    id VARCHAR(100) PRIMARY KEY, -- UUID v4
    customer_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL, -- Caso o cliente mude de nome ou seja agendado manualmente
    customer_phone VARCHAR(20),
    barber_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Comandas de Consumo (Status em Tempo Real)
CREATE TABLE comandas (
    id VARCHAR(100) PRIMARY KEY, -- Código ou comanda física / UUID
    appointment_id VARCHAR(100) REFERENCES appointments(id) ON DELETE SET NULL,
    customer_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    barber_id VARCHAR(100) REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'WAITING_PAYMENT', 'PAID', 'CANCELLED')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Calculado e congelado no fechamento
    payment_method VARCHAR(50) CHECK (payment_method IN ('MONEY', 'CARD', 'PIX', 'SUBSCRIPTION')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Tabela de Itens Selecionados na Comanda (Suporta Vendas Externas)
CREATE TABLE comanda_items (
    id SERIAL PRIMARY KEY,
    comanda_id VARCHAR(100) REFERENCES comandas(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    is_external BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE para lanches/charutos trazidos da Tabacaria
    added_by VARCHAR(50) NOT NULL CHECK (added_by IN ('BARBER', 'CASHIER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar Índices essenciais para consultas de alta performance
CREATE INDEX idx_comandas_status ON comandas(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_comanda_items_comanda ON comanda_items(comanda_id);
`;

  const firestoreSchema = `
// ==========================================================
// ESTRUTURA RECOMENDADA FIRESTORE (NOSQL)
// Ideal para desenvolvimento rápido e integração em tempo real
// ==========================================================

1. Coleção "users" {
  _id: "userId",
  name: "Felipe Andrade",
  email: "felipe@cliente.com",
  role: "CUSTOMER", // "ADMIN" | "BARBER" | "CUSTOMER" | "CASHIER"
  phone: "(11) 94444-3333",
  isActive: true,
  avatar: "🧔"
}

2. Coleção "barbers" {
  _id: "userId",                     // Referência direta ao id do usuário
  commissionRateStandard: 0.50,      // 50%
  commissionRateSubscription: 0.30,  // 30% em atendimento de assinantes
}

3. Coleção "services" {
  _id: "serviceId",
  name: "Degradê Moderno",
  price: 50.00,
  durationMinutes: 40,
  description: "Corte de cabelo degradê suave.",
  category: "HAIR",
  isActive: true
}

4. Coleção "comandas" {
  _id: "comandaId",
  appointmentId: "apt-1",
  customerId: "customer_id",
  customerName: "Felipe Andrade",
  barberId: "barber_id",
  barberName: "Mateus Silva",
  status: "WAITING_PAYMENT", // "OPEN" | "WAITING_PAYMENT" | "PAID" | "CANCELLED"
  items: [
    {
      id: "item-1",
      description: "Degradê Moderno (Corte)",
      quantity: 1,
      unitPrice: 50.00,
      isExternal: false,
      addedBy: "BARBER"
    },
    {
      id: "item-external-1",
      description: "Cigarro Cohiba Toro (Tabacaria)",
      quantity: 1,
      unitPrice: 85.00,
      isExternal: true, // Venda temporária digitada na hora
      addedBy: "BARBER"
    }
  ],
  subtotal: 135.00,
  discount: 0.00,
  total: 135.00,
  commissionAmount: 25.00, // Barbeiro ganha comissão somente sobre o serviço (50% de R$50) = R$25
  createdAt: Timestamp,
  updatedAt: Timestamp,
  paymentMethod: "CARD"
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postgresDDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#121214] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl">
      {/* Header do Módulo */}
      <div className="bg-[#18181B] px-6 py-5 border-b border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-yellow-500 text-xs font-mono tracking-wider uppercase block mb-1">
            Arquitetura & Engenharia de Dados
          </span>
          <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow-500" />
            Modelagem & Estrutura de Integração
          </h2>
        </div>
        
        {/* Tabs de Seleção */}
        <div className="flex bg-[#0B0B0C] p-1 rounded-lg border border-[#27272A] self-start md:self-center">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
              activeTab === 'sql'
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              SQL (Postgres)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('firestore')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
              activeTab === 'firestore'
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Firestore (NoSQL)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
              activeTab === 'architecture'
                ? 'bg-yellow-500 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              Arquitetura SaaS
            </span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-zinc-400 text-xs mb-2">
              <p>Script SQL completo estruturado para integridade referencial com chaves estrangeiras e índices.</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C1F] hover:bg-[#27272A] border border-[#3F3F46] text-white transition font-mono"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-yellow-500" />}
                {copied ? 'Copiado!' : 'Copiar DDL SQL'}
              </button>
            </div>
            <div className="relative">
              <pre className="overflow-x-auto p-4 bg-[#0B0B0C] text-[#FAC315]/90 font-mono text-xs rounded-lg border border-[#27272A] max-h-[480px]">
                <code>{postgresDDL}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'firestore' && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-xs">
              Estrutura de coleções otimizada para o Firebase Firestore, ideal se o foco for velocidade de leitura do caixa operacional da tabacaria sem a necessidade de joins complexos.
            </p>
            <pre className="overflow-x-auto p-4 bg-[#0B0B0C] text-[#FAC315]/90 font-mono text-xs rounded-lg border border-[#27272A] max-h-[480px]">
              <code>{firestoreSchema}</code>
            </pre>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stack Tecnológica */}
              <div className="bg-[#18181B] p-5 rounded-lg border border-[#27272A]">
                <h3 className="text-sm font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Stack de Hospedagem Indicada
                </h3>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">•</span>
                    <div>
                      <strong className="text-white block">Frontend Web: React (Typescript) + Vite + Tailwind CSS</strong>
                      Garante carregamento instantâneo no celular dos barbeiros e no computador do caixa. Interface 100% responsiva (Mobile First).
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">•</span>
                    <div>
                      <strong className="text-white block">Banco de Dados: PostgreSQL (Supabase / Neon DB)</strong>
                      Oferece persistência transacional ACiD para garantir que os valores das comandas finalizadas cheguem corretos ao operador e os cálculos de comissões estejam perfeitos.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">•</span>
                    <div>
                      <strong className="text-white block">Backend: Node.js (Express / Fastify) em Serverless</strong>
                      Hospedado no Google Cloud Run, AWS App Runner ou Vercel Serverless. Custo quase zero quando não há movimentação e escala automaticamente em horários de pico.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Fluxo de Checkout Real-Time */}
              <div className="bg-[#18181B] p-5 rounded-lg border border-[#27272A]">
                <h3 className="text-sm font-semibold text-yellow-500 mb-3 flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Fluxo Operacional de Checkout Integrado
                </h3>
                
                <div className="space-y-3 text-xs text-zinc-300">
                  <p className="text-zinc-400">
                    Por estar fisicamente anexa à <strong className="text-white">Logo Ali Tabacaria</strong>, a Barbearia opera de forma enxuta sem necessidade de hardware de caixa próprio:
                  </p>
                  
                  <div className="relative pl-4 border-l-2 border-yellow-500/50 space-y-3.5 mt-2">
                    <div>
                      <span className="text-yellow-400 font-bold block">1. Atendimento e Lançamento</span>
                      O barbeiro abre a comanda digital do cliente no celular, realiza o serviço e se o cliente pegar um charuto ou item trazido da tabacaria, o barbeiro lança como "Venda Externa" manual na comanda.
                    </div>
                    <div>
                      <span className="text-yellow-400 font-bold block">2. Finalização Básica</span>
                      Ao fim do corte, o barbeiro finaliza o atendimento. O status da comanda muda para <span className="bg-[#FED7AA]/15 text-orange-400 px-1 py-0.5 rounded text-[10px] font-mono">Aguardando Pagamento</span>.
                    </div>
                    <div>
                      <span className="text-yellow-400 font-bold block">3. Checkout na Tabacaria</span>
                      O cliente vai até o caixa geral da Tabacaria. O operador digita o nome do cliente no painel, visualiza o espelho exato com o valor dos serviços, recebe a quantia e dá baixa de forma instantânea.
                    </div>
                    <div>
                      <span className="text-yellow-400 font-bold block">4. Lançamento no PDV Principal</span>
                      O caixa registra o montante final manualmente na maquina de PDV tradicional da Tabacaria. O sistema da barbearia registra do lado dele para fins de comissão do barbeiro e histórico de fidelidade!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vantagens do Modelo Sem PDV Dedicado */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">Vantagem de Integração Operacional</h4>
                <p className="text-xs text-zinc-300">
                  Ao evitar a emissão de cupons fiscais em dois sistemas diferentes, removemos custos com impressoras térmicas adicionais, SAT ou certificados digitais exclusivos para a barbearia. A barbearia funciona como um centro de custos anexo, enviando as cobranças centralizadas para o balcão da tabacaria. Os barbeiros mantêm foco exclusivo no atendimento, sabendo que suas comissões por cortes comuns (ex: 50%) ou por clientes de planos (ex: 30%) são processadas automaticamente sem erros humanos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
