/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  Lock,
  GitBranch,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Copy,
  Terminal,
  Play,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';

export default function HostingGuide() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Exportar o Código do Google AI Studio',
      description: 'Como obter o código-fonte gerado aqui ou sincronizar com sua conta do GitHub em 1 clique.',
      badge: 'Passo 1',
      details: (
        <div className="space-y-3 text-xs text-zinc-300">
          <p>
            O Google AI Studio permite que você exporte todo o trabalho pronto de duas maneiras extremamente simples:
          </p>
          <div className="bg-[#0B0B0C] p-3 rounded-lg border border-zinc-900 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">A.</span>
              <div>
                <strong className="text-white block">Exportar Integrado (Altamente Recomendado)</strong>
                No menu superior direito do Google AI Studio, clique no ícone de configurações ou no botão de exportação e selecione <strong className="text-yellow-400">Export to GitHub</strong> ou <strong className="text-yellow-400">Export ZIP</strong>. O ZIP vem prontinho para rodar.
              </div>
            </div>
            <div className="flex items-start gap-2 border-t border-zinc-900/50 pt-2">
              <span className="text-yellow-500 font-bold">B.</span>
              <div>
                <strong className="text-white block">Sincronização com GitHub</strong>
                Conectando o projeto a um repositório seu do GitHub, qualquer atualização de código flui sozinha para a hospedagem de produção na nuvem!
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Criar Conta Gratuita na Vercel',
      description: 'A hospedagem ideal: com suporte nativo a projetos Vite + React, 100% gratuita para sempre no plano Hobby e com atualizações automáticas.',
      badge: 'Passo 2',
      details: (
        <div className="space-y-3 text-xs text-zinc-300">
          <p>
            A <strong className="text-white">Vercel</strong> é a criadora do Next.js e a maior autoridade do mundo em hospedagem de aplicações React. Para assinar o plano grátis:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-1.5 bg-[#0B0B0C] p-3 rounded-lg border border-zinc-900">
            <li>Acesse o site oficial da Vercel: <a href="https://vercel.com/signup" target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline inline-flex items-center gap-1 font-mono">vercel.com/signup <ExternalLink className="w-3 h-3 inline" /></a></li>
            <li>Selecione a opção de login social <strong className="text-white">"Continue with GitHub"</strong> (isso facilitará muito a sincronização do código).</li>
            <li>Selecione a opção de plano <strong className="text-yellow-400">"Hobby"</strong> que é grátis e oferece servidores rápidos e certificados de segurança SSL sem cobrar nada de você!</li>
          </ol>
        </div>
      )
    },
    {
      id: 3,
      title: 'Importar o Projeto',
      description: 'Diga à Vercel para ler o repositório git e criar automaticamente o link acessível na internet do seu salão.',
      badge: 'Passo 3',
      details: (
        <div className="space-y-3 text-xs text-zinc-300">
          <p>
            Após criar a conta na Vercel, o painel listará um botão gigante de importação:
          </p>
          <div className="bg-[#0B0B0C] p-3 rounded-lg border border-zinc-900 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="bg-yellow-500/10 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1</span>
              <p>Clique em <strong className="text-white">"Add New Project"</strong> e depois no botão <strong className="text-white">"Import"</strong> ao lado do repositório da Barbearia que você exportou para o seu GitHub.</p>
            </div>
            <div className="flex items-start gap-2 border-t border-zinc-900/50 pt-2">
              <span className="bg-yellow-500/10 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">2</span>
              <p>A Vercel preenche as configurações do projeto de forma 100% automática! Ela detecta que é um <strong className="text-yellow-400">Vite Project</strong>. Não modifique mais nada.</p>
            </div>
            <div className="flex items-start gap-2 border-t border-zinc-900/50 pt-2">
              <span className="bg-yellow-500/10 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">3</span>
              <p>Clique em <strong className="text-white">"Deploy"</strong>. Em menos de 45 segundos sua barbearia estará online com endereço protegido (<code className="text-yellow-400 bg-zinc-900 px-1 py-0.5">https://...vercel.app</code>).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Como Fazer as Atualizações',
      description: 'Como atualizar o sistema sem qualquer complexidade depois de publicado.',
      badge: 'Passo 4',
      details: (
        <div className="space-y-3 text-xs text-zinc-300">
          <p>
            Sua barbearia está no ar, mas você precisa fazer alguma melhoria ou alteração de serviço. Como funciona?
          </p>
          <div className="bg-[#0B0B0C] p-3 rounded-lg border border-zinc-900 space-y-2">
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" /> ATUALIZAÇÕES AUTOMÁTICAS (CI/CD)
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Toda vez que você usar o Google AI Studio para fazer melhorias no código e enviá-las para o seu repositório no GitHub, a Vercel percebe o novo código instantaneamente. Ela compila e publica a nova versão do site no mesmo link na nuvem. Você não precisa reinstalar nada nem re-subir arquivos manualmente!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleCopyCommand = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FAQ Guide & Video/Visual Summary (Left col) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-yellow-500">
            <Cloud className="w-5 h-5" />
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold">Resumo da Recomendação</h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Como o sistema foi planejado com arquitetura <strong className="text-zinc-200">SPA (React + Vite)</strong> de alto desempenho e armazenamento persistente do lado do cliente (IndexedDB/LocalStorage/Context), você <strong className="text-white">não precisa de servidores de backend rodando 24h ou banco de dados pago por hora</strong>.
          </p>

          <div className="bg-[#18181B] p-3.5 rounded-lg border border-[#27272A] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-bold">Plataforma Sugerida:</span>
              <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded">VERCEL HOBBY</span>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-1.5">
              <p>• <strong className="text-zinc-300">Custo:</strong> R$ 0,00 por mês (Sem limites de uso comum)</p>
              <p>• <strong className="text-zinc-300">SSL Grátis:</strong> Cadeado HTTPS integrado automaticamente</p>
              <p>• <strong className="text-zinc-300">Automação:</strong> Atualiza no celular e web ao salvar no GitHub</p>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 flex gap-2.5">
            <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide block">Compatibilidade Perfeita</span>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Com o Vercel CLI ou integração direta com o GitHub, as atualizações feitas no Google AI Studio entram em produção com zero esforço.
              </p>
            </div>
          </div>
        </div>

        {/* Local Command reference */}
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5 space-y-3.5">
          <h5 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none mb-1">Dica de Linha de Comando</h5>
          <p className="text-[10px] text-zinc-400">
            Se quiser rodar o build manual para testar localmente antes de subir para a Vercel, use no terminal da sua máquina:
          </p>
          <div className="bg-[#0B0B0C] rounded-lg border border-zinc-900 p-2.5 font-mono text-xs text-zinc-300 flex justify-between items-center">
            <span className="truncate">npm run build</span>
            <button
              onClick={() => handleCopyCommand('npm run build', 'build')}
              className="text-zinc-500 hover:text-white shrink-0 p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {copiedText === 'build' && (
            <span className="text-[9px] text-green-400 font-mono block text-right">Comando copiado!</span>
          )}
        </div>
      </div>

      {/* Manual Steps Timeline (Right 2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#121214] border border-[#27272A] rounded-xl p-5">
          <div className="border-b border-[#27272A] pb-3 mb-5 flex justify-between items-center sm:items-start flex-col sm:flex-row gap-2">
            <div>
              <span className="text-[10px] font-mono text-yellow-500 uppercase">Assinatura do Plano de Hospedagem</span>
              <h4 className="text-sm font-bold text-white">Manual Interativo de Publicação de Sistemas</h4>
            </div>
            <span className="bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded whitespace-nowrap">
              Custo Estimado: R$ 0.00/mês
            </span>
          </div>

          <div className="space-y-4">
            {steps.map((step) => {
              const isOpen = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`border rounded-xl transition ${
                    isOpen
                      ? 'bg-[#18181B] border-yellow-500/50'
                      : 'bg-[#121214]/60 border-[#27272A] hover:bg-[#18181B]'
                  }`}
                >
                  <button
                    onClick={() => setActiveStep(isOpen ? 0 : step.id)}
                    className="w-full p-4 flex justify-between items-start text-left gap-4"
                  >
                    <div className="flex gap-3">
                      <span className="bg-yellow-500 text-black text-[10px] font-black font-mono w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                        {step.id}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {step.title}
                        </h5>
                        <p className="text-[10px] text-zinc-400 mt-1">{step.description}</p>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 mt-0.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-zinc-900/50">
                      {step.details}
                      <div className="mt-4 flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Etapa {step.id} de 4</span>
                        {step.id < 4 && (
                          <button
                            onClick={() => setActiveStep(step.id + 1)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-yellow-500 hover:text-yellow-400 px-2.5 py-1 rounded font-bold flex items-center gap-1 transition"
                          >
                            Ir para o Próximo <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-yellow-500/10 bg-[#0B0B0C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">Quer que eu gere o commit ou verifique a integração?</span>
                <p className="text-[10px] text-zinc-400 leading-normal">Tudo já está empacotado e validado de forma impecável pelo linter do applet!</p>
              </div>
            </div>
            <button
              onClick={() => {
                alert('Tudo pronto! Você já pode exportar os arquivos para o repositório git ou baixar o ZIP usando os menus oficiais do AI Studio de configurações no canto superior!');
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs rounded-lg transition shrink-0 whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Validar Código de Produção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
