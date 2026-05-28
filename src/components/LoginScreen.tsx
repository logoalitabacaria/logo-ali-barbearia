/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, UserPlus, Shield, UserCheck, HelpCircle } from 'lucide-react';
import { User, UserRole, SystemParameters } from '../types';

interface LoginScreenProps {
  users: User[];
  parameters?: SystemParameters;
  onLogin: (user: User) => void;
  onRegisterClient: (name: string, phone: string, login: string, password: string) => void;
}

export default function LoginScreen({ users, parameters, onLogin, onRegisterClient }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!login || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const foundUser = users.find(
      u => u.login?.toLowerCase() === login.trim().toLowerCase() && u.password === password
    );

    if (!foundUser) {
      setError('Login ou senha incorretos.');
      return;
    }

    if (!foundUser.isActive) {
      setError('Esta conta está bloqueada pelo administrador.');
      return;
    }

    onLogin(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccess('');

    if (!regName || !regPhone || !regLogin || !regPassword) {
      setError('Preencha os campos obrigatórios para o cadastro.');
      return;
    }

    const collision = users.find(u => u.login?.toLowerCase() === regLogin.trim().toLowerCase());
    if (collision) {
      setError('Este nome de usuário de login já está em uso.');
      return;
    }

    onRegisterClient(regName, regPhone, regLogin, regPassword);
    setRegSuccess('Conta criada com sucesso! Redirecionando...');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Branded Title Section */}
      <div className="text-center mb-8 max-w-md flex flex-col items-center gap-3">
        {parameters?.logoUrl && (
          <img src={parameters.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded-2xl mb-2 border border-zinc-800" referrerPolicy="no-referrer" />
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-yellow-500 font-sans uppercase">
          {parameters?.shopName ? (
            <span>{parameters.shopName}</span>
          ) : (
            <>Logo Ali <span className="text-white">Barbearia</span></>
          )}
        </h1>
        <p className="mt-2 text-xs text-zinc-400 uppercase tracking-widest font-mono">
          Estilo, Cerveja Gelada & Tabacaria
        </p>
      </div>

      <div className="w-full max-w-md bg-[#0F0F11] border-2 border-yellow-500/35 rounded-2xl overflow-hidden shadow-2xl shadow-yellow-500/5">
        <div className="px-6 py-8">
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase font-mono ${
                !isRegisterMode ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase font-mono ${
                isRegisterMode ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-zinc-500'
              }`}
            >
              Agendar Online (Cadastrar)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {regSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <span className="text-sm">✓</span>
              <p>{regSuccess}</p>
            </div>
          )}

          {!isRegisterMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Usuário de Login
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Ex: admin / felipe"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Senha Secreta
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm tracking-wider uppercase py-3 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-yellow-500/10"
              >
                Acessar Barbearia
              </button>
            </form>
          ) : (
            /* SIMPLE SIGN-UP FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  WhatsApp / Celular com DDD *
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                    Crie um Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={regLogin}
                    onChange={(e) => setRegLogin(e.target.value)}
                    placeholder="Ex: joao"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                    Crie uma Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ex: 12345"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
                  />
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 italic text-center">
                * Cadastro super simplificado e imediato para começar a agendar.
              </p>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm tracking-wider uppercase py-3 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-yellow-500/10"
              >
                Cadastrar & Acessar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
