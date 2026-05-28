/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Scissors, Calendar, Settings, Coins, LogOut, Wallet, UserCheck, Shield, HelpCircle, ArrowRight
} from 'lucide-react';
import { getSavedState, saveState } from './data';
import { User, UserRole, Service, Product, LoyaltyPlan, CustomerSubscription, Appointment, Comanda, SystemParameters } from './types';
import { loadStateFromFirestore, saveDocumentToFirestore, deleteDocumentFromFirestore, clearDatabaseToProduction } from './firebase';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import BarberPanel from './components/BarberPanel';
import CustomerPanel from './components/CustomerPanel';
import CashierPanel from './components/CashierPanel';

export default function App() {
  // Global State (persisted inside localStorage)
  const [state, setState] = useState(() => getSavedState());

  // Firestore DB connection state
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Authenticated Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('logo_ali_b2_logged_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sync with freshest user record
        const freshState = getSavedState();
        const freshUser = freshState.users.find((u: any) => u.id === parsed.id);
        if (freshUser) {
          return freshUser;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  // Navigation tab route state
  const [activeTab, setActiveTab] = useState<string>('');

  // Load from Firestore on mount
  useEffect(() => {
    async function syncFromDb() {
      try {
        const dbState = await loadStateFromFirestore();
        if (dbState) {
          setState(dbState);
          // Sync current logged-in user profile, if any
          if (currentUser) {
            const freshUser = dbState.users.find((u: any) => u.id === currentUser.id);
            if (freshUser) {
              setCurrentUser(freshUser);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load state from Firestore:", err);
      } finally {
        setIsLoadingDb(false);
      }
    }
    syncFromDb();
  }, []);

  // Save changes automatically as a local backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync logged user profile details safely back to storage when edited
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('logo_ali_b2_logged_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('logo_ali_b2_logged_user');
    }
  }, [currentUser]);

  // Adjust routing tabs automatically according to logged permissions
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        setActiveTab('admin');
      } else if (currentUser.role === 'BARBER') {
        setActiveTab('barbeiro');
      } else if (currentUser.role === 'CASHIER') {
        setActiveTab('caixa');
      } else {
        setActiveTab('cliente');
      }
    } else {
      setActiveTab('');
    }
  }, [currentUser]);

  // Helper trigger to update state chunks easily
  const handleUpdateState = async (key: string, val: any) => {
    // 1. Update React state immediately (optimistic UI rendering)
    setState(prev => ({
      ...prev,
      [key]: val
    }));

    // 2. Perform background write to Cloud Firestore
    try {
      if (key === 'parameters') {
        await saveDocumentToFirestore('parameters', 'system', val);
      } else if (key === 'categories') {
        await saveDocumentToFirestore('categories', 'list', { values: val });
      } else {
        const existingList = state[key as keyof typeof state] as any[];
        const newList = val as any[];

        // Save new or updated items
        if (newList && Array.isArray(newList)) {
          for (const item of newList) {
            if (item) {
              const docId = item.id || (key === 'barberDetails' ? item.userId : '');
              if (docId) {
                await saveDocumentToFirestore(key, docId, item);
              }
            }
          }
        }

        // Delete removed items
        const newIds = new Set(newList.map(item => item.id || (key === 'barberDetails' ? item.userId : '')));
        if (existingList && Array.isArray(existingList)) {
          for (const oldItem of existingList) {
            const oldId = oldItem.id || (key === 'barberDetails' ? oldItem.userId : '');
            if (oldId && !newIds.has(oldId)) {
              await deleteDocumentFromFirestore(key, oldId);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error updating Firestore collection:", err, key);
    }
  };

  // HANDLERS
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // CLient Registration immediately logs them in!
  const handleRegisterClient = (name: string, phone: string, login_user: string, secret_pass: string) => {
    const newId = `cli-${Date.now()}`;
    const newCustomerUser: User = {
      id: newId,
      name: name,
      email: `${login_user}@logoalibarber.com`,
      role: 'CUSTOMER',
      phone: phone,
      isActive: true,
      avatar: '👨',
      login: login_user.toLowerCase().trim(),
      password: secret_pass,
      permissions: ['CUSTOMER_PORTAL']
    };

    // Update global user array
    const updatedUsersList = [...state.users, newCustomerUser];
    handleUpdateState('users', updatedUsersList);

    // Auto-login!
    setTimeout(() => {
      setCurrentUser(newCustomerUser);
    }, 450);
  };

  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center font-sans">
        <div className="text-center space-y-4">
          {state.parameters?.logoUrl ? (
            <img src={state.parameters.logoUrl} alt="Logo" className="h-16 w-16 mx-auto object-contain rounded-xl animate-pulse" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-3xl bg-yellow-500 text-black p-3.5 rounded-xl font-black font-mono inline-block animate-pulse">
              LA
            </div>
          )}
          <h2 className="text-lg font-extrabold uppercase tracking-widest text-yellow-500">
            {state.parameters?.shopName || 'Logo Ali Barbearia'}
          </h2>
          <p className="text-xs text-zinc-400 uppercase font-mono tracking-wider">
            Conectando ao Banco de Dados Firestore...
          </p>
          <div className="flex justify-center items-center pt-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-black">
      {/* Enforce custom administrator theme accent colors */}
      <style>{`
        :root {
          --primary-color: ${state.parameters?.primaryColor || '#eab308'};
        }
        .bg-yellow-500 {
          background-color: var(--primary-color) !important;
        }
        .hover\\:bg-yellow-600:hover {
          background-color: var(--primary-color) !important;
          filter: brightness(0.9);
        }
        .text-yellow-500 {
          color: var(--primary-color) !important;
        }
        .border-yellow-500 {
          border-color: var(--primary-color) !important;
        }
        .bg-yellow-500\\/10 {
          background-color: ${state.parameters?.primaryColor || '#eab308'}1a !important;
        }
        .bg-yellow-500\\/5 {
          background-color: ${state.parameters?.primaryColor || '#eab308'}0d !important;
        }
        .border-yellow-500\\/40 {
          border-color: ${state.parameters?.primaryColor || '#eab308'}66 !important;
        }
        .border-yellow-500\\/30 {
          border-color: ${state.parameters?.primaryColor || '#eab308'}4d !important;
        }
        .shadow-yellow-500\\/5 {
          --tw-shadow-color: ${state.parameters?.primaryColor || '#eab308'}0d !important;
        }
        .shadow-yellow-500\\/10 {
          --tw-shadow-color: ${state.parameters?.primaryColor || '#eab308'}1a !important;
        }
      `}</style>
      
      {/* 1. AUTH SWITCH */}
      {!currentUser ? (
        <LoginScreen
          users={state.users}
          parameters={state.parameters || undefined}
          onLogin={handleLogin}
          onRegisterClient={handleRegisterClient}
        />
      ) : (
        /* MAIN BODY WRAPPER */
        <div className="flex-1 flex flex-col">
          
          {/* HEADER MAIN BRANDING */}
          <header className="bg-black border-b border-zinc-850 px-4 py-3.5 sm:px-6 lg:px-8 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5 text-left">
              {state.parameters?.logoUrl ? (
                <img src={state.parameters.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg border border-zinc-805" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl bg-yellow-500 text-black p-1.5 rounded-lg font-black font-mono">LA</span>
              )}
              <div>
                <h1 className="text-sm font-extrabold tracking-tight uppercase text-yellow-500">
                  {state.parameters?.shopName ? (
                    <span>{state.parameters.shopName}</span>
                  ) : (
                    <>Logo Ali <span className="text-white">Barbearia</span></>
                  )}
                </h1>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">
                  Sempre em Boa Companhia
                </p>
              </div>
            </div>

            {/* Profile widget and Log out trigger */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{currentUser.name}</span>
                <span className="text-[10px] text-yellow-500 font-mono uppercase font-semibold">
                  Perfil: {currentUser.role}
                </span>
              </div>
              <span className="text-xl bg-zinc-900 border border-zinc-800 p-1 px-2 rounded-lg">
                {currentUser.avatar || '👤'}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                title="Sair do Sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* DYNAMIC PERMISSIONS TAB SELECTOR (TAB RAIL) */}
          <nav className="bg-[#0A0A0C] border-b border-zinc-850/80 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap gap-2 text-xs font-medium">
            
            {/* ADMIN INTERFACE TABS */}
            {currentUser.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition ${
                    activeTab === 'admin' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  👑 Configuração & Administração
                </button>
                <button
                  onClick={() => setActiveTab('barbeiro')}
                  className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition ${
                    activeTab === 'barbeiro' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  🧔 Cadeira Barbeiro
                </button>
                <button
                  onClick={() => setActiveTab('caixa')}
                  className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition ${
                    activeTab === 'caixa' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  💼 Balcão do Caixa
                </button>
                <button
                  onClick={() => setActiveTab('cliente')}
                  className={`px-4 py-2 rounded-lg font-semibold tracking-wider uppercase font-mono transition ${
                    activeTab === 'cliente' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  👤 Visão Cliente
                </button>
              </>
            )}

            {/* BARBER TABS */}
            {currentUser.role === 'BARBER' && (
              <button
                onClick={() => setActiveTab('barbeiro')}
                className="px-4 py-2 rounded-lg font-bold font-mono uppercase bg-yellow-500 text-black cursor-default"
              >
                🧔 Minha Agenda & Comandas
              </button>
            )}

            {/* CASHIER TABS */}
            {currentUser.role === 'CASHIER' && (
              <button
                onClick={() => setActiveTab('caixa')}
                className="px-4 py-2 rounded-lg font-bold font-mono uppercase bg-yellow-500 text-black cursor-default"
              >
                💼 Caixa & Faturamento
              </button>
            )}

            {/* CUSTOMER TABS */}
            {currentUser.role === 'CUSTOMER' && (
              <button
                onClick={() => setActiveTab('cliente')}
                className="px-4 py-2 rounded-lg font-bold font-mono uppercase bg-yellow-500 text-black cursor-default"
              >
                🧔 Meu Agendamento Online
              </button>
            )}
          </nav>

          {/* MAIN MODULE LOADER VIEWS */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full pb-20">
            
            {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
              <AdminPanel
                users={state.users}
                services={state.services}
                products={state.products}
                plans={state.plans}
                barberDetails={state.barberDetails}
                comandas={state.comandas}
                parameters={state.parameters}
                categories={state.categories || ['HAIR', 'BEARD', 'COMBO', 'TREATMENT']}
                onUpdateState={handleUpdateState}
                onResetDatabase={async () => {
                  setIsLoadingDb(true);
                  await clearDatabaseToProduction();
                  const dbState = await loadStateFromFirestore();
                  if (dbState) {
                    setState(dbState);
                  }
                  setCurrentUser(null);
                  localStorage.removeItem('logo_ali_b2_logged_user');
                  setIsLoadingDb(false);
                }}
              />
            )}

            {activeTab === 'barbeiro' && (currentUser.role === 'BARBER' || currentUser.role === 'ADMIN') && (
              <BarberPanel
                currentBarber={currentUser.role === 'ADMIN' ? state.users.find(u => u.role === 'BARBER') || currentUser : currentUser}
                users={state.users}
                services={state.services}
                products={state.products}
                appointments={state.appointments}
                comandas={state.comandas}
                onUpdateState={handleUpdateState}
              />
            )}

            {activeTab === 'caixa' && (currentUser.role === 'CASHIER' || currentUser.role === 'ADMIN') && (
              <CashierPanel
                comandas={state.comandas}
                users={state.users}
                barberDetails={state.barberDetails}
                subscriptions={state.subscriptions}
                parameters={state.parameters}
                onUpdateState={handleUpdateState}
              />
            )}

            {activeTab === 'cliente' && (currentUser.role === 'CUSTOMER' || currentUser.role === 'ADMIN') && (
              <CustomerPanel
                currentCustomer={currentUser.role === 'ADMIN' ? state.users.find(u => u.role === 'CUSTOMER') || currentUser : currentUser}
                users={state.users}
                services={state.services}
                plans={state.plans}
                appointments={state.appointments}
                subscriptions={state.subscriptions}
                parameters={state.parameters}
                onUpdateState={handleUpdateState}
              />
            )}

          </main>

        </div>
      )}

    </div>
  );
}
