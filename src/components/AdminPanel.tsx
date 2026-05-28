/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Coins, Database, Plus, Trash2, Settings, ToggleLeft, ToggleRight, ShieldAlert,
  UserCheck, Dumbbell, Sparkles, TrendingUp, DollarSign, Coffee, Edit3, Save, Tag
} from 'lucide-react';
import { User, Service, Product, LoyaltyPlan, SystemParameters, BarberDetail, Comanda } from '../types';

interface AdminPanelProps {
  users: User[];
  services: Service[];
  products: Product[];
  plans: LoyaltyPlan[];
  barberDetails: BarberDetail[];
  comandas: Comanda[];
  parameters: SystemParameters;
  categories: string[];
  onUpdateState: (key: string, val: any) => void;
  onResetDatabase?: () => Promise<void>;
}

export default function AdminPanel({
  users,
  services,
  products,
  plans,
  barberDetails,
  comandas,
  parameters,
  categories,
  onUpdateState,
  onResetDatabase
}: AdminPanelProps) {
  // Toggle sections inside Admin
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'comissoes' | 'cadastros' | 'acessos' | 'parametros' | 'relatorios'>('comissoes');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Form states
  // 1. Service Form
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDuration, setSrvDuration] = useState('30');
  const [srvCategory, setSrvCategory] = useState<string>('HAIR');
  const [srvDescription, setSrvDescription] = useState('');

  // 2. Product Form
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prdName, setPrdName] = useState('');
  const [prdPrice, setPrdPrice] = useState('');
  const [prdStock, setPrdStock] = useState('10');
  const [prdDescription, setPrdDescription] = useState('');

  // 3. Plan Form
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [plnName, setPlnName] = useState('');
  const [plnPrice, setPlnPrice] = useState('');
  const [plnServices, setPlnServices] = useState('4');
  const [plnCommission, setPlnCommission] = useState('30');
  const [plnDescription, setPlnDescription] = useState('');
  const [plnRulesText, setPlnRulesText] = useState('');

  // 4. User Form (Acessos)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [usrName, setUsrName] = useState('');
  const [usrEmail, setUsrEmail] = useState('');
  const [usrPhone, setUsrPhone] = useState('');
  const [usrRole, setUsrRole] = useState<User['role']>('BARBER');
  const [usrLogin, setUsrLogin] = useState('');
  const [usrPassword, setUsrPassword] = useState('');
  const [usrBio, setUsrBio] = useState('');
  const [usrPhotoUrl, setUsrPhotoUrl] = useState('');
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // 5. Barber Commission Settings State
  const [barberToEditComm, setBarberToEditComm] = useState<string>(
    users.find(u => u.role === 'BARBER')?.id || ''
  );
  const [commStandard, setCommStandard] = useState('50');
  const [commSubscription, setCommSubscription] = useState('35');
  const [commProduct, setCommProduct] = useState('10');
  const [commTabacaria, setCommTabacaria] = useState('0');

  // Report filtration states
  const [reportPeriod, setReportPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('mensal');
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Category CRUD states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryNewValue, setEditingCategoryNewValue] = useState('');

  // Database wiping states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'resetting' | 'done'>('idle');

  // Auto pre-select category
  React.useEffect(() => {
    if (categories && categories.length > 0 && !categories.includes(srvCategory)) {
      setSrvCategory(categories[0]);
    }
  }, [categories, srvCategory]);

  // Load barber dynamic rates including product and tabacaria
  React.useEffect(() => {
    if (barberToEditComm) {
      const detail = barberDetails.find(d => d.userId === barberToEditComm);
      if (detail) {
        setCommStandard(Math.round(detail.commissionRateStandard * 100).toString());
        setCommSubscription(Math.round(detail.commissionRateSubscription * 100).toString());
        setCommProduct(Math.round((detail.commissionRateProduct ?? parameters.defaultCommissionProduct) * 100).toString());
        setCommTabacaria(Math.round((detail.commissionRateTabacaria ?? parameters.defaultCommissionTabacaria ?? 0) * 100).toString());
      }
    }
  }, [barberToEditComm, barberDetails, parameters.defaultCommissionProduct, parameters.defaultCommissionTabacaria]);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // SERVICE ACTIONS
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvPrice) return;

    const newService: Service = {
      id: editingServiceId || `srv-${Date.now()}`,
      name: srvName,
      price: parseFloat(srvPrice),
      durationMinutes: parseInt(srvDuration) || 30,
      category: srvCategory,
      description: srvDescription
    };

    let updatedList;
    if (editingServiceId) {
      updatedList = services.map(s => s.id === editingServiceId ? newService : s);
    } else {
      updatedList = [...services, newService];
    }

    onUpdateState('services', updatedList);
    // Reset
    setEditingServiceId(null);
    setSrvName('');
    setSrvPrice('');
    setSrvDuration('30');
    setSrvCategory('HAIR');
    setSrvDescription('');
  };

  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este serviço?')) {
      onUpdateState('services', services.filter(s => s.id !== id));
    }
  };

  const handleEditServiceSelect = (s: Service) => {
    setEditingServiceId(s.id);
    setSrvName(s.name);
    setSrvPrice(s.price.toString());
    setSrvDuration(s.durationMinutes.toString());
    setSrvCategory(s.category);
    setSrvDescription(s.description || '');
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prdName || !prdPrice) return;

    const newProduct: Product = {
      id: editingProductId || `prd-${Date.now()}`,
      name: prdName,
      price: parseFloat(prdPrice),
      stock: parseInt(prdStock) || 10,
      description: prdDescription
    };

    let updatedList;
    if (editingProductId) {
      updatedList = products.map(p => p.id === editingProductId ? newProduct : p);
    } else {
      updatedList = [...products, newProduct];
    }

    onUpdateState('products', updatedList);
    // Reset
    setEditingProductId(null);
    setPrdName('');
    setPrdPrice('');
    setPrdStock('10');
    setPrdDescription('');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este produto?')) {
      onUpdateState('products', products.filter(p => p.id !== id));
    }
  };

  const handleEditProductSelect = (p: Product) => {
    setEditingProductId(p.id);
    setPrdName(p.name);
    setPrdPrice(p.price.toString());
    setPrdStock(p.stock.toString());
    setPrdDescription(p.description || '');
  };

  // RECURRING PLANS ACTIONS
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plnName || !plnPrice) return;

    const rulesArray = plnRulesText
      ? plnRulesText.split('\n').filter(r => r.trim().length > 0)
      : ['Uso individual', 'Válido por 30 dias'];

    const newPlan: LoyaltyPlan = {
      id: editingPlanId || `pln-${Date.now()}`,
      name: plnName,
      priceMonthly: parseFloat(plnPrice),
      servicesIncludedCount: parseInt(plnServices) || 4,
      currentCommissionRate: parseFloat(plnCommission) / 100 || 0.30,
      description: plnDescription,
      rules: rulesArray
    };

    let updatedList;
    if (editingPlanId) {
      updatedList = plans.map(p => p.id === editingPlanId ? newPlan : p);
    } else {
      updatedList = [...plans, newPlan];
    }

    onUpdateState('plans', updatedList);
    // Reset
    setEditingPlanId(null);
    setPlnName('');
    setPlnPrice('');
    setPlnServices('4');
    setPlnCommission('30');
    setPlnDescription('');
    setPlnRulesText('');
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Excluir este plano definitivamente?')) {
      onUpdateState('plans', plans.filter(p => p.id !== id));
    }
  };

  const handleEditPlanSelect = (p: LoyaltyPlan) => {
    setEditingPlanId(p.id);
    setPlnName(p.name);
    setPlnPrice(p.priceMonthly.toString());
    setPlnServices(p.servicesIncludedCount.toString());
    setPlnCommission(Math.round(p.currentCommissionRate * 100).toString());
    setPlnDescription(p.description || '');
    setPlnRulesText(p.rules.join('\n'));
  };

  // USER MANAGEMENT & CREDENTIALS
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usrName || !usrLogin || !usrPassword) return;

    // Build standard permissions based on role
    let customPerms: string[] = [];
    if (usrRole === 'ADMIN') {
      customPerms = ['VIEW_BILLING', 'EDIT_COMMISSIONS', 'MANAGE_USERS', 'MANAGE_APPOINTMENTS', 'EDIT_COMANDAS', 'CHECKOUT_COMANDAS', 'CUSTOMER_PORTAL'];
    } else if (usrRole === 'BARBER') {
      customPerms = ['MANAGE_APPOINTMENTS', 'EDIT_COMANDAS'];
    } else if (usrRole === 'CASHIER') {
      customPerms = ['CHECKOUT_COMANDAS', 'EDIT_COMANDAS'];
    } else {
      customPerms = ['CUSTOMER_PORTAL'];
    }

    const newUser: User = {
      id: editingUserId || `usr-${Date.now()}`,
      name: usrName,
      email: usrEmail || `${usrLogin}@logoali.com`,
      role: usrRole,
      phone: usrPhone,
      isActive: true,
      avatar: usrRole === 'ADMIN' ? '👑' : usrRole === 'BARBER' ? '🧔' : usrRole === 'CASHIER' ? '💼' : '👨',
      bio: usrRole === 'BARBER' ? usrBio : undefined,
      photoUrl: usrRole === 'BARBER' ? (usrPhotoUrl || undefined) : undefined,
      login: usrLogin.trim().toLowerCase(),
      password: usrPassword,
      permissions: customPerms
    };

    let updatedList;
    if (editingUserId) {
      updatedList = users.map(u => u.id === editingUserId ? newUser : u);
    } else {
      updatedList = [...users, newUser];
    }

    onUpdateState('users', updatedList);

    // If new user is a barber, make sure we create a commission details profile
    if (usrRole === 'BARBER' && !editingUserId) {
      const newDetail: BarberDetail = {
        userId: newUser.id,
        commissionRateStandard: 0.50,
        commissionRateSubscription: 0.35,
        commissionRateProduct: parameters.defaultCommissionProduct,
        commissionRateTabacaria: parameters.defaultCommissionTabacaria || 0
      };
      onUpdateState('barberDetails', [...barberDetails, newDetail]);
    }

    // Reset
    setEditingUserId(null);
    setUsrName('');
    setUsrEmail('');
    setUsrPhone('');
    setUsrRole('BARBER');
    setUsrLogin('');
    setUsrPassword('');
    setUsrBio('');
    setUsrPhotoUrl('');
  };

  // Toggle toggle Status (Block/Unblock)
  const handleToggleUserStatus = (id: string) => {
    if (id === 'usr-admin') {
      alert('Impossível bloquear o Administrador principal!');
      return;
    }
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    onUpdateState('users', updated);
  };

  // Granular Access controls adjustments
  const handleToggleTabPermission = (userId: string, permission: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const currentPerms = u.permissions || [];
        const hasIt = currentPerms.includes(permission);
        const newPerms = hasIt
          ? currentPerms.filter(p => p !== permission)
          : [...currentPerms, permission];
        return { ...u, permissions: newPerms };
      }
      return u;
    });
    onUpdateState('users', updated);
  };

  // CATEGORY OPERATIONS
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim().toUpperCase();
    if (!cleanName) return;
    if (categories.includes(cleanName)) {
      alert('Esta categoria já existe!');
      return;
    }
    onUpdateState('categories', [...categories, cleanName]);
    setNewCategoryName('');
    alert(`Categoria "${cleanName}" adicionada com sucesso!`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      alert('Deve haver pelo menos uma categoria no sistema!');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir a categoria "${catToDelete}"? Todos os serviços vinculados a ela serão movidos para a primeira categoria restante.`)) {
      const remainingCats = categories.filter(c => c !== catToDelete);
      const fallbackCat = remainingCats[0];
      
      const updatedServices = services.map(s => {
        if (s.category === catToDelete) {
          return { ...s, category: fallbackCat };
        }
        return s;
      });

      onUpdateState('categories', remainingCats);
      onUpdateState('services', updatedServices);
      alert(`Categoria deletada. Serviços associados migrados para "${fallbackCat}".`);
    }
  };

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditingCategoryNewValue(cat);
  };

  const handleSaveCategoryRename = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNewVal = editingCategoryNewValue.trim().toUpperCase();
    if (!cleanNewVal || !editingCategory) return;
    if (cleanNewVal === editingCategory) {
      setEditingCategory(null);
      return;
    }
    if (categories.includes(cleanNewVal)) {
      alert('Já existe outra categoria com este nome!');
      return;
    }

    const updatedCats = categories.map(c => c === editingCategory ? cleanNewVal : c);
    const updatedServices = services.map(s => {
      if (s.category === editingCategory) {
        return { ...s, category: cleanNewVal };
      }
      return s;
    });

    onUpdateState('categories', updatedCats);
    onUpdateState('services', updatedServices);
    setEditingCategory(null);
    alert('Categoria e serviços vinculados foram renomeados com sucesso!');
  };

  // SYSTEM SETTINGS EDIT
  const handleUpdateParameter = (field: keyof SystemParameters, value: any) => {
    onUpdateState('parameters', {
      ...parameters,
      [field]: value
    });
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem de logotipo válida (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/png');
            handleUpdateParameter('logoUrl', dataUrl);
          } catch (e) {
            console.error('Error generating Base64 image:', e);
            alert('Falha ao processar imagem.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleLogoDragLeave = () => {
    setIsDraggingLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleBackupExport = () => {
    try {
      const backupData = {
        users,
        services,
        products,
        plans,
        barberDetails,
        comandas,
        parameters,
        categories
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `logo_ali_barbearia_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Erro ao gerar arquivo de backup: ' + (err.message || err));
    }
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('O arquivo de backup é inválido ou está corrompido.');
        }

        const keysToRestore = ['users', 'services', 'products', 'plans', 'barberDetails', 'comandas', 'parameters', 'categories'];
        const missingKeys = keysToRestore.filter(k => parsed[k] === undefined);
        
        if (missingKeys.length > 3) {
          throw new Error('Conteúdo do arquivo não corresponde a um backup estruturado da Barbearia Logo Ali.');
        }

        const confirmRestore = window.confirm(
          '⚠ ATENÇÃO! Você tem certeza que deseja restaurar as tabelas? Isso substituirá todo o conteúdo online atual do Firestore pelos dados deste arquivo de backup.'
        );
        if (!confirmRestore) return;

        setIsRestoringBackup(true);

        // Upload everything to firestore collection-by-collection call sequentially
        for (const key of keysToRestore) {
          if (parsed[key] !== undefined) {
            await onUpdateState(key, parsed[key]);
          }
        }

        alert('Backup restaurado e sincronizado com o Firebase com sucesso! A página recarregará para refletir as novas alterações.');
        window.location.reload();
      } catch (err: any) {
        console.error('Migration backup error: ', err);
        alert('Falha ao restaurar dados: ' + (err.message || 'Verifique o arquivo selecionado.'));
      } finally {
        setIsRestoringBackup(false);
      }
    };
    reader.readAsText(file);
  };

  // BARBER REPASSE COMMISSIONS CUSTOM SAVES
  const handleSaveBarberCommissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberToEditComm) return;

    const stdVal = parseFloat(commStandard) / 100;
    const subVal = parseFloat(commSubscription) / 100;
    const prdVal = parseFloat(commProduct) / 100;
    const tabacariaVal = parseFloat(commTabacaria) / 100;

    const updatedDetails = barberDetails.map(d => {
      if (d.userId === barberToEditComm) {
        return {
          ...d,
          commissionRateStandard: isNaN(stdVal) ? 0.50 : stdVal,
          commissionRateSubscription: isNaN(subVal) ? 0.35 : subVal,
          commissionRateProduct: isNaN(prdVal) ? 0.10 : prdVal,
          commissionRateTabacaria: isNaN(tabacariaVal) ? 0.00 : tabacariaVal
        };
      }
      return d;
    });

    onUpdateState('barberDetails', updatedDetails);
    alert('Repasses e comissões dos profissionais salvos com sucesso!');
  };

  // Compute daily totals
  const closedComandas = comandas.filter(c => c.status === 'PAID');
  const totalSalesToday = closedComandas.reduce((sum, c) => sum + c.total, 0);
  const totalCommissionToday = closedComandas.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalNetShopKeep = totalSalesToday - totalCommissionToday;

  return (
    <div className="space-y-6">
      {/* Mini KPIs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Arrecadação Bruta (Comandas Pagas)</span>
            <span className="text-xl font-bold font-mono text-yellow-500">{formatCurrency(totalSalesToday)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Total de Comissões de Barbeiros</span>
            <span className="text-xl font-bold font-mono text-white">{formatCurrency(totalCommissionToday)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500 animate-pulse">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block uppercase">Líquido Caixa Barbearia</span>
            <span className="text-xl font-bold font-mono text-emerald-500">{formatCurrency(totalNetShopKeep)}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub menu inside admin */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-850 pb-3">
        <button
          onClick={() => setActiveAdminSubTab('comissoes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
            activeAdminSubTab === 'comissoes' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          💰 Repasse & Comissões
        </button>
        <button
          onClick={() => setActiveAdminSubTab('cadastros')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
            activeAdminSubTab === 'cadastros' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          💈 Serviços, Produtos & Planos
        </button>
        <button
          onClick={() => setActiveAdminSubTab('acessos')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
            activeAdminSubTab === 'acessos' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          🔑 Controle de Acessos (RBAC)
        </button>
        <button
          onClick={() => setActiveAdminSubTab('parametros')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
            activeAdminSubTab === 'parametros' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          ⚙️ Parâmetros do Negócio
        </button>
        <button
          onClick={() => setActiveAdminSubTab('relatorios')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase font-mono transition duration-150 cursor-pointer ${
            activeAdminSubTab === 'relatorios' ? 'bg-yellow-500 text-black font-bold' : 'bg-[#151518] hover:bg-zinc-850 text-zinc-400'
          }`}
        >
          📊 Relatórios & Faturamento
        </button>
      </div>

      {/* TAB 1: COMISSÕES E REPASSES */}
      {activeAdminSubTab === 'comissoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Comissão Acumulada por Profissional (Hoje)
            </h3>
            <p className="text-xs text-zinc-400">
              Cálculo em tempo real de comissões baseado nos serviços concluídos e produtos faturados.
            </p>

            <div className="divide-y divide-zinc-850">
              {users.filter(u => u.role === 'BARBER').map(b => {
                const bDetails = barberDetails.find(d => d.userId === b.id);
                // closed comandas today for this barber
                const bComandas = closedComandas.filter(c => c.barberId === b.id);
                const bEarnings = bComandas.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
                const bVolume = bComandas.reduce((sum, c) => sum + c.total, 0);

                return (
                  <div key={b.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-zinc-900 border border-zinc-800 p-2 rounded-xl block">
                        {b.avatar || '🧔'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{b.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Avulso: <strong className="text-yellow-500">{Math.round((bDetails?.commissionRateStandard ?? 0.5) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Recorrente: <strong className="text-purple-400">{Math.round((bDetails?.commissionRateSubscription ?? 0.35) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Produtos: <strong className="text-teal-400">{Math.round((bDetails?.commissionRateProduct ?? parameters.defaultCommissionProduct) * 100)}%</strong>
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                            Tabacaria: <strong className="text-orange-400">{Math.round((bDetails?.commissionRateTabacaria ?? parameters.defaultCommissionTabacaria ?? 0) * 100)}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono bg-[#070708] border border-zinc-850 px-4 py-2 rounded-xl">
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">REPASSE HOJE</span>
                      <span className="text-sm font-bold text-yellow-500">{formatCurrency(bEarnings)}</span>
                      <span className="text-[10px] text-zinc-400 block">De {formatCurrency(bVolume)} faturado</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl text-left h-fit space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Editar Taxa de Repasse
            </h3>
            <p className="text-xs text-zinc-400">
              Ajuste as porcentagens exclusivas deste barbeiro. Salve para aplicar imediatamente sobre novas comandas.
            </p>

            <form onSubmit={handleSaveBarberCommissions} className="space-y-4">
              <div>
                <label className="text-[10px] tracking-wider font-mono text-zinc-400 block uppercase mb-1">
                  Profissional Titular
                </label>
                <select
                  value={barberToEditComm}
                  onChange={(e) => setBarberToEditComm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono cursor-pointer"
                >
                  {users.filter(u => u.role === 'BARBER').map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Avulso (%)
                  </label>
                  <input
                    type="number"
                    value={commStandard}
                    onChange={(e) => setCommStandard(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Recorrente (%)
                  </label>
                  <input
                    type="number"
                    value={commSubscription}
                    onChange={(e) => setCommSubscription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Produtos (%)
                  </label>
                  <input
                    type="number"
                    value={commProduct}
                    onChange={(e) => setCommProduct(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] tracking-tight font-mono text-zinc-400 block uppercase mb-1">
                    Tabacaria (%)
                  </label>
                  <input
                    type="number"
                    value={commTabacaria}
                    onChange={(e) => setCommTabacaria(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs py-2 rounded-lg cursor-pointer transition uppercase tracking-wider"
              >
                Salvar Configurações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SERVIÇOS, PRODUTOS & PLANOS CRUDS */}
      {activeAdminSubTab === 'cadastros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Left Lists Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* SERVICES IN CATALOGU/S */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850 mb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-yellow-500">Gestão de Serviços do Catálogo</h4>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {services.length} Serviços
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="pb-2 font-medium">Nome</th>
                      <th className="pb-2 font-medium">Preço Base</th>
                      <th className="pb-2 font-medium">Duração</th>
                      <th className="pb-2 font-medium">Categoria</th>
                      <th className="pb-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-900/10">
                        <td className="py-2.5 font-bold text-white">{s.name}</td>
                        <td className="py-2.5 text-yellow-500 font-mono font-semibold">{formatCurrency(s.price)}</td>
                        <td className="py-2.5 text-zinc-400 font-mono">{s.durationMinutes} min</td>
                        <td className="py-2.5">
                          <span className="text-[9px] uppercase bg-zinc-900/85 px-2 py-0.5 border border-zinc-800 font-mono rounded">
                            {s.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditServiceSelect(s)}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(s.id)}
                              className="p-1 text-zinc-500 hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PRODUCTS STOCK */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850 mb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-yellow-500">Produtos (Clube de Vendas & Tabacaria)</h4>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {products.length} Produtos
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="pb-2 font-medium">Produto</th>
                      <th className="pb-2 font-medium">Preço Venda</th>
                      <th className="pb-2 font-medium">Estoque</th>
                      <th className="pb-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-900/10">
                        <td className="py-2.5">
                          <p className="font-bold text-white leading-none">{p.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{p.description}</p>
                        </td>
                        <td className="py-2.5 text-yellow-500 font-mono font-semibold">{formatCurrency(p.price)}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 font-mono text-[10px] rounded ${
                            p.stock <= 5 ? 'bg-red-950/40 text-red-400 border border-red-500/10' : 'bg-zinc-900 text-zinc-300'
                          }`}>
                            {p.stock} un
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditProductSelect(p)}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1 text-zinc-500 hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RECURRING PLANS LIST */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-850 mb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-yellow-500">Planos de Assinatura Recorrente</h4>
                <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {plans.length} Planos Ativos
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(p => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-sm">{p.name}</h5>
                        <span className="bg-yellow-500/10 text-yellow-500 font-mono px-2 py-0.5 rounded text-xs font-semibold">
                          {formatCurrency(p.priceMonthly)}/mês
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">{p.description}</p>
                      <div className="mt-2.5 space-y-1">
                        {p.rules.map((rule, idx) => (
                          <div key={idx} className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <span className="text-yellow-500">•</span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-900">
                      <span className="text-[9px] text-zinc-400 uppercase font-mono">
                        Atendimentos: {p.servicesIncludedCount}/mês
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditPlanSelect(p)}
                          className="p-1 px-2 text-[10px] tracking-wider uppercase font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="p-1 text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Forms Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* SERVICE CATEGORIES CRUD */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3 flex items-center justify-between">
                <span>🏷️ Categorias de Serviço</span>
                <span className="text-[10px] text-zinc-500 lowercase font-normal italic">renomeia serviços vinculados</span>
              </h4>
              
              {/* Form to add category */}
              <form onSubmit={handleAddNewCategory} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  required
                  placeholder="NOVA CATEGORIA"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono placeholder:text-zinc-650"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer"
                  title="Cadastrar Categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Scrollable list of categories with inline edit form */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-zinc-950 px-2.5 py-2 border border-zinc-900 rounded-lg text-xs font-mono">
                    {editingCategory === cat ? (
                      <form onSubmit={handleSaveCategoryRename} className="flex-1 flex gap-1.5 items-center">
                        <input
                          type="text"
                          required
                          value={editingCategoryNewValue}
                          onChange={(e) => setEditingCategoryNewValue(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-850 rounded px-2 py-0.5 text-xs text-white uppercase font-mono"
                        />
                        <button type="submit" className="text-emerald-400 p-0.5 hover:text-emerald-300 font-bold" title="Salvar">✓</button>
                        <button type="button" onClick={() => setEditingCategory(null)} className="text-red-400 p-0.5 hover:text-red-300 font-bold" title="Cancelar">✗</button>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-zinc-300 uppercase">{cat}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEditCategory(cat)}
                            className="text-zinc-500 hover:text-white p-0.5 transition cursor-pointer"
                            title="Editar Categoria"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-zinc-500 hover:text-red-400 p-0.5 transition cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ADD/EDIT SERVICE FORM */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
                {editingServiceId ? '⚙️ Editar Serviço' : '＋ Cadastrar Serviço'}
              </h4>
              <form onSubmit={handleSaveService} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome Comercial</label>
                  <input
                    type="text"
                    required
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    placeholder="Social, Navalhado, etc."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={srvPrice}
                      onChange={(e) => setSrvPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Duração (min)</label>
                    <input
                      type="number"
                      required
                      value={srvDuration}
                      onChange={(e) => setSrvDuration(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Categoria</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={srvDescription}
                    onChange={(e) => setSrvDescription(e.target.value)}
                    placeholder="Descrição para o cliente..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setSrvName('');
                        setSrvPrice('');
                        setSrvDescription('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                  >
                    {editingServiceId ? 'Salvar Alterações' : 'Adicionar Serviço'}
                  </button>
                </div>
              </form>
            </div>

            {/* ADD/EDIT PRODUCT FORM */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
                {editingProductId ? '📦 Editar Produto' : '＋ Cadastrar Produto'}
              </h4>
              <form onSubmit={handleSaveProduct} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={prdName}
                    onChange={(e) => setPrdName(e.target.value)}
                    placeholder="Ex: Óleo Hidratante, Cerveja"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prdPrice}
                      onChange={(e) => setPrdPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Estoque Inicial</label>
                    <input
                      type="number"
                      required
                      value={prdStock}
                      onChange={(e) => setPrdStock(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={prdDescription}
                    onChange={(e) => setPrdDescription(e.target.value)}
                    placeholder="Breve descrição comercial..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setPrdName('');
                        setPrdPrice('');
                        setPrdDescription('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                  >
                    {editingProductId ? 'Salvar Produto' : 'Cadastrar Produto'}
                  </button>
                </div>
              </form>
            </div>

            {/* ADD/EDIT LOYALTY SUBSCRIPTION PLAN */}
            <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
              <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
                {editingPlanId ? '🔄 Editar Plano' : '＋ Cadastrar Plano'}
              </h4>
              <form onSubmit={handleSavePlan} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome do Plano</label>
                  <input
                    type="text"
                    required
                    value={plnName}
                    onChange={(e) => setPlnName(e.target.value)}
                    placeholder="Clube Master, VIP etc"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Mensalidade (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={plnPrice}
                      onChange={(e) => setPlnPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Visitas/Mês</label>
                    <input
                      type="number"
                      required
                      value={plnServices}
                      onChange={(e) => setPlnServices(e.target.value)}
                      className="w-full bg-[#1C1C1F] border border-[#27272A] rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Taxa de Repasse Barbeiro (%)</label>
                  <input
                    type="number"
                    required
                    value={plnCommission}
                    onChange={(e) => setPlnCommission(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                  <p className="text-[9px] text-zinc-500 italic mt-0.5">Quanto o barbeiro ganha ao fazer cortes deste plano.</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Descrição rápida</label>
                  <input
                    type="text"
                    value={plnDescription}
                    onChange={(e) => setPlnDescription(e.target.value)}
                    placeholder="Breve descrição do produto..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Regras de negócio (Uma por linha)</label>
                  <textarea
                    rows={3}
                    value={plnRulesText}
                    onChange={(e) => setPlnRulesText(e.target.value)}
                    placeholder="Uso Individual&#10;Válido por 30 dias&#10;Incluso gel cortesia"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  {editingPlanId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlanId(null);
                        setPlnName('');
                        setPlnPrice('');
                        setPlnDescription('');
                        setPlnRulesText('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                  >
                    {editingPlanId ? 'Modificar Plano' : 'Ativar Novo Plano'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACESSOS E RBAC DE USUARIOS */}
      {activeAdminSubTab === 'acessos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* List col */}
          <div className="lg:col-span-2 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Usuários e Configurações de Acesso (RBAC)
            </h3>
            <p className="text-xs text-zinc-400">
              O administrador do sistema pode alterar o acesso de todos os usuários, adicionando ou retirando permissões com granularidade.
            </p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-400">
                    <th className="pb-2 text-left font-semibold">Nome / Username</th>
                    <th className="pb-2 text-left font-semibold">Perfil</th>
                    <th className="pb-2 text-left font-semibold">Habilitado</th>
                    <th className="pb-2 text-left font-semibold">Faturamento/Dashboard</th>
                    <th className="pb-2 text-left font-semibold">Agenda</th>
                    <th className="pb-2 text-left font-semibold">Comandas</th>
                    <th className="pb-2 text-left font-semibold">Caixa</th>
                    <th className="pb-2 text-right font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-900/10">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {u.photoUrl ? (
                            <img src={u.photoUrl} alt="Foto" className="h-8 w-8 object-cover rounded border border-zinc-800" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-sm bg-zinc-900 border border-zinc-800 p-1 rounded">
                              {u.avatar || '👤'}
                            </span>
                          )}
                          <div>
                            <p className="font-bold text-white leading-none">{u.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              Login: <strong className="text-yellow-500 font-mono">{u.login}</strong> | Senha: <span className="font-mono text-zinc-500">{u.password}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border-zinc-800 ${
                          u.role === 'ADMIN' ? 'bg-yellow-500 text-black font-semibold' : 'bg-zinc-900 text-zinc-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="focus:outline-none cursor-pointer"
                        >
                          {u.isActive ? (
                            <span className="text-emerald-500 flex items-center font-bold">✓ Ativo</span>
                          ) : (
                            <span className="text-red-500 flex items-center font-bold">🔒 Bloqueado</span>
                          )}
                        </button>
                      </td>
                      {/* Checkboxes for permissions */}
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={u.permissions?.includes('VIEW_BILLING') || u.role === 'ADMIN'}
                          disabled={u.role === 'ADMIN'}
                          onChange={() => handleToggleTabPermission(u.id, 'VIEW_BILLING')}
                          className="rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={u.permissions?.includes('MANAGE_APPOINTMENTS') || u.role === 'ADMIN'}
                          disabled={u.role === 'ADMIN'}
                          onChange={() => handleToggleTabPermission(u.id, 'MANAGE_APPOINTMENTS')}
                          className="rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={u.permissions?.includes('EDIT_COMANDAS') || u.role === 'ADMIN'}
                          disabled={u.role === 'ADMIN'}
                          onChange={() => handleToggleTabPermission(u.id, 'EDIT_COMANDAS')}
                          className="rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={u.permissions?.includes('CHECKOUT_COMANDAS') || u.role === 'ADMIN'}
                          disabled={u.role === 'ADMIN'}
                          onChange={() => handleToggleTabPermission(u.id, 'CHECKOUT_COMANDAS')}
                          className="rounded border-zinc-800 bg-[#121214] text-yellow-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setUsrName(u.name);
                              setUsrEmail(u.email);
                              setUsrPhone(u.phone || '');
                              setUsrRole(u.role);
                              setUsrLogin(u.login || '');
                              setUsrPassword(u.password || '');
                              setUsrBio(u.bio || '');
                              setUsrPhotoUrl(u.photoUrl || '');
                            }}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-805 hover:text-yellow-500 text-[10px] uppercase font-mono rounded inline-block cursor-pointer transition"
                          >
                            Alterar
                          </button>
                          <button
                            onClick={() => {
                              if (u.id === 'usr-admin') {
                                alert('Impossível excluir o administrador principal (Dono)!');
                                return;
                              }
                              if (confirm(`Tem certeza que deseja excluir permanentemente o usuário "${u.name}" (${u.role})?`)) {
                                onUpdateState('users', users.filter(x => x.id !== u.id));
                              }
                            }}
                            className="p-1 text-zinc-500 hover:text-red-500 transition cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Col */}
          <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl text-left h-fit max-w">
            <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 mb-3">
              {editingUserId ? '⚙️ Alterar Usuário/Profissional' : '＋ Cadastrar Novo Login'}
            </h4>
            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  placeholder="Ex: Carlos Barbeiro, Roberta"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Login / User</label>
                  <input
                    type="text"
                    required
                    value={usrLogin}
                    onChange={(e) => setUsrLogin(e.target.value)}
                    placeholder="Ex: carlos"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Senha Secreta</label>
                  <input
                    type="text"
                    required
                    value={usrPassword}
                    onChange={(e) => setUsrPassword(e.target.value)}
                    placeholder="Ex: 50503"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Perfil / Role</label>
                  <select
                    value={usrRole}
                    onChange={(e) => setUsrRole(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="ADMIN">ADMINISTATOR</option>
                    <option value="BARBER">BARBER (Barbeiro)</option>
                    <option value="CASHIER">CASHIER (Caixa)</option>
                    <option value="CUSTOMER">CUSTOMER (Cliente)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    value={usrPhone}
                    onChange={(e) => setUsrPhone(e.target.value)}
                    placeholder="(11) 9000-0000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

               {usrRole === 'BARBER' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">Biografia / Sobre o Barbeiro</label>
                    <textarea
                      rows={2}
                      value={usrBio}
                      onChange={(e) => setUsrBio(e.target.value)}
                      placeholder="Mande um pequeno texto com as especialidades do profissional."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wide block">URL da Foto do Barbeiro</label>
                    <input
                      type="url"
                      value={usrPhotoUrl}
                      onChange={(e) => setUsrPhotoUrl(e.target.value)}
                      placeholder="Ex: https://meuhost.com/barbeiro-perfil.jpg"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <p className="text-[9px] text-zinc-500 italic mt-0.5">Link direto de imagem para as fotos dos barbeiros (será visível para o cliente).</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setUsrName('');
                      setUsrLogin('');
                      setUsrPassword('');
                      setUsrPhone('');
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs py-2 rounded-lg cursor-pointer transition uppercase"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Salvar Novo Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL BUSINESS SYSTEM PARAMETERS */}
      {activeAdminSubTab === 'parametros' && (
        <div className="bg-[#101012] border border-zinc-800 p-6 rounded-xl text-left space-y-6">
          <div className="border-b border-zinc-850 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
              Parâmetros Básicos do Negócio (Logo Ali)
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Ajuste regras operacionais que comandam as configurações automáticas das comissões, horários de reserva e detalhes da loja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Nome Comercial da Barbearia</label>
                <input
                  type="text"
                  value={parameters.shopName}
                  onChange={(e) => handleUpdateParameter('shopName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Endereço Físico Completo</label>
                <input
                  type="text"
                  value={parameters.address}
                  onChange={(e) => handleUpdateParameter('address', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Telefone Fixo / WhatsApp Suporte</label>
                <input
                  type="text"
                  value={parameters.phone}
                  onChange={(e) => handleUpdateParameter('phone', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Abertura Loja (Hora)</label>
                  <input
                    type="time"
                    value={parameters.openTime}
                    onChange={(e) => handleUpdateParameter('openTime', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Fechamento Loja (Hora)</label>
                  <input
                    type="time"
                    value={parameters.closeTime}
                    onChange={(e) => handleUpdateParameter('closeTime', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Taxa Máxima de Repasse (%)</label>
                  <input
                    type="number"
                    value={Math.round(parameters.defaultCommissionService * 100)}
                    onChange={(e) => handleUpdateParameter('defaultCommissionService', parseFloat(e.target.value) / 100)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                  />
                  <p className="text-[9px] text-zinc-500 italic mt-0.5">Taxa padrão de repasse para prestação de serviços.</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Repasse Vendas Produtos (%)</label>
                  <input
                    type="number"
                    value={Math.round(parameters.defaultCommissionProduct * 100)}
                    onChange={(e) => handleUpdateParameter('defaultCommissionProduct', parseFloat(e.target.value) / 100)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                  />
                  <p className="text-[9px] text-zinc-500 italic mt-0.5">Porcentagem padrão paga ao vender pomadas ou acessórios.</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Repasse Vendas Tabacaria (%)</label>
                <input
                  type="number"
                  value={Math.round((parameters.defaultCommissionTabacaria ?? 0) * 100)}
                  onChange={(e) => handleUpdateParameter('defaultCommissionTabacaria', parseFloat(e.target.value) / 100)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
                <p className="text-[9px] text-zinc-500 italic mt-0.5">Porcentagem padrão de comissão para a categoria de Tabacaria do barbeiro.</p>
              </div>
            </div>
          </div>

          {/* Visual branding adjustments */}
          <div className="border-t border-zinc-850 pt-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-yellow-500">
              Personalização Visual, Cores & Logomarca
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Cor de Destaque / Tema (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={parameters.primaryColor || '#eab308'}
                    onChange={(e) => handleUpdateParameter('primaryColor', e.target.value)}
                    className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={parameters.primaryColor || '#eab308'}
                    onChange={(e) => handleUpdateParameter('primaryColor', e.target.value)}
                    placeholder="#eab308"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <p className="text-[9px] text-zinc-500 italic mt-1">Defina a cor principal do sistema (padrão é o amarelo #eab308).</p>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">Logotipo da Barbearia (Upload de Imagem)</label>
                <div
                  onDragOver={handleLogoDragOver}
                  onDragLeave={handleLogoDragLeave}
                  onDrop={handleLogoDrop}
                  className={`border-2 border-dashed rounded-xl p-4 transition text-center flex flex-col items-center justify-center cursor-pointer min-h-[120px] ${
                    isDraggingLogo 
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                  onClick={() => document.getElementById('logo-file-picker')?.click()}
                >
                  <input
                    id="logo-file-picker"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  {parameters.logoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={parameters.logoUrl}
                        alt="Logotipo atual"
                        className="h-14 w-14 object-contain rounded-lg border border-zinc-800 p-1 bg-black"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-300 font-bold">Logotipo Carregado</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateParameter('logoUrl', '');
                          }}
                          className="mt-1 text-[9px] text-red-500 uppercase font-mono tracking-wider hover:underline"
                        >
                          Remover logotipo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-lg">📁</span>
                      <p className="text-xs text-zinc-300">Arrastar & Soltar a Imagem aqui</p>
                      <p className="text-[9px] text-zinc-500 font-mono">ou clique para selecionar do dispositivo</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-zinc-500 italic mt-1">Carregue uma imagem quadrada da sua barbearia para o carregamento e topo dos painéis.</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-2 text-xs text-yellow-500 leading-snug">
            <span>💡</span>
            <div>
              <strong>Dica de Operação:</strong> Todos os campos acima salvam de formato contínuo e persistente em seu navegador. Ao alterar aqui, os clientes passarão a ver os novos horários e o novo nome comercial em seus respectivos painéis de agendamento online.
            </div>
          </div>

          {/* BACKUP & RESTORE SECTION */}
          <div className="border-t border-zinc-850 pt-6 mt-4 space-y-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <Database className="w-5 h-5 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                Backup & Restauração do Sistema
              </h4>
            </div>
            
            <p className="text-xs text-zinc-400">
              Gerencie cópias de segurança do seu sistema. Você pode exportar todos os dados atuais (Comandas, Serviços, Clientes, Agendamentos, Parâmetros e Comissões) para um arquivo JSON seguro e restaurá-lo a qualquer momento para reverter alterações ou migrar de dispositivo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Card */}
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase font-mono mb-1">Backup Completo (Exportar)</h5>
                  <p className="text-[11px] text-zinc-500">Salva e baixa uma cópia completa instantânea de todas as tabelas em formato JSON seguro.</p>
                </div>
                <button
                  type="button"
                  onClick={handleBackupExport}
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase font-mono text-[11px] tracking-wider rounded-lg transition cursor-pointer"
                >
                  📥 Baixar Backup (.json)
                </button>
              </div>

              {/* Import Card */}
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase font-mono mb-1">Restaurar do Arquivo (Importar)</h5>
                  <p className="text-[11px] text-zinc-500">Substitui integralmente o banco online com os dados contidos em seu arquivo de backup local.</p>
                </div>
                
                {isRestoringBackup ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 text-yellow-500 font-mono text-xs animate-pulse">
                    <span className="animate-spin">⏳</span> Carregando e Sincronizando dados com o Firebase...
                  </div>
                ) : (
                  <div>
                    <input
                      id="backup-file-importer"
                      type="file"
                      accept=".json"
                      onChange={handleBackupImport}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('backup-file-importer')?.click()}
                      className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 text-yellow-500 font-bold uppercase font-mono text-[11px] tracking-wider rounded-lg transition cursor-pointer"
                    >
                      📤 Carregar & Restaurar Banco (.json)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RESET DATABASE SECTION */}
          {onResetDatabase && (
            <div className="border-t border-zinc-850 pt-6 mt-4 space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                  Limpeza de Dados (Modo Produção)
                </h4>
              </div>
              
              <p className="text-xs text-zinc-400">
                Esta ação apagará <strong>todos os registros cadastrados</strong> no Firestore (usuários, serviços, comandas, estoques e agendamentos) para que você possa iniciar os cadastros de sua loja sem nenhum dado demo ou simulações. O usuário principal com login: <strong className="text-yellow-500 font-mono">admin</strong> e senha: <strong className="text-yellow-500 font-mono">Logoali123!</strong> será preservado.
              </p>

              {resetStatus === 'idle' && !showResetConfirm && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2.5 bg-rose-600/10 hover:bg-[#ff4d4d] border border-rose-500/30 hover:border-rose-500 text-rose-500 hover:text-black rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition cursor-pointer"
                >
                  🧹 Apagar todos os dados e resetar banco
                </button>
              )}

              {showResetConfirm && resetStatus === 'idle' && (
                <div className="p-4 bg-rose-600/10 border border-rose-500/40 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-rose-500">
                    ⚠ ATENÇÃO: Tem certeza absoluta? Essa ação limpará as tabelas do seu Firebase online e reiniciará a aplicação deslogando você.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setResetStatus('resetting');
                          if (onResetDatabase) {
                            await onResetDatabase();
                          }
                          setResetStatus('done');
                        } catch (err) {
                          console.error(err);
                          setResetStatus('idle');
                          setShowResetConfirm(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-[11px] font-bold uppercase font-mono tracking-wider transition cursor-pointer"
                    >
                      Sim, Apagar e Resetar Agora
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-zinc-850 text-zinc-300 rounded-lg text-[11px] font-semibold uppercase font-mono hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {resetStatus === 'resetting' && (
                <div className="flex items-center gap-2.5 text-yellow-500 font-mono text-xs">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                  <span>Limpando coleções no Firestore... Por favor, aguarde.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REPORTS & BILLING ANALYTICS */}
      {activeAdminSubTab === 'relatorios' && (() => {
        const getFilteredComandasForReports = () => {
          let start: Date;
          let end: Date = new Date();
          end.setHours(23, 59, 59, 999);

          if (reportPeriod === 'diario') {
            start = new Date();
            start.setHours(0, 0, 0, 0);
          } else if (reportPeriod === 'semanal') {
            start = new Date();
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
          } else if (reportPeriod === 'mensal') {
            start = new Date();
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
          } else {
            // personalizado
            start = reportStartDate ? new Date(reportStartDate + 'T00:00:00') : new Date(0);
            const parsedEnd = reportEndDate ? new Date(reportEndDate + 'T23:59:59') : new Date();
            end = parsedEnd;
          }

          return closedComandas.filter(c => {
            if (!c.completedAt) return false;
            const compDate = new Date(c.completedAt);
            return compDate >= start && compDate <= end;
          });
        };

        const filteredCmds = getFilteredComandasForReports();

        // Core business analytics calculations
        const totalRevenueVal = filteredCmds.reduce((sum, c) => sum + c.total, 0);
        const totalCommissionsVal = filteredCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const netProfitVal = totalRevenueVal - totalCommissionsVal;
        const totalTicketsVal = filteredCmds.length;
        const averageTicketVal = totalTicketsVal > 0 ? totalRevenueVal / totalTicketsVal : 0;

        // Breakdown services vs products vs tabacaria
        let servicesSalesVolume = 0;
        let productsSalesVolume = 0;
        let tabacariaSalesVolume = 0;
        let productsQuantity = 0;
        let tabacariaQuantity = 0;

        // Payments breakdown
        const paymentsBreakdown: Record<string, { count: number; value: number }> = {
          MONEY: { count: 0, value: 0 },
          CARD: { count: 0, value: 0 },
          PIX: { count: 0, value: 0 },
          SUBSCRIPTION: { count: 0, value: 0 },
        };

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};

        filteredCmds.forEach(c => {
          // payment method
          const pm = c.paymentMethod || 'PIX';
          if (!paymentsBreakdown[pm]) {
            paymentsBreakdown[pm] = { count: 0, value: 0 };
          }
          paymentsBreakdown[ pm ].count += 1;
          paymentsBreakdown[ pm ].value += c.total;

          // items
          c.items.forEach(it => {
            const lineCost = it.quantity * it.unitPrice;
            if (it.isTabacaria) {
              tabacariaSalesVolume += lineCost;
              tabacariaQuantity += it.quantity;
            } else if (it.isProduct) {
              productsSalesVolume += lineCost;
              productsQuantity += it.quantity;
            } else {
              servicesSalesVolume += lineCost;
              // Find category of service
              const matchedSrv = services.find(s => s.name === it.description || it.description.startsWith(s.name));
              const catName = matchedSrv?.category || 'HAIR';
              categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + lineCost;
            }
          });
        });

        // Barber Performance list
        const barberPerformance = users.filter(u => u.role === 'BARBER').map(b => {
          const bCmds = filteredCmds.filter(c => c.barberId === b.id);
          const billing = bCmds.reduce((sum, c) => sum + c.total, 0);
          const comm = bCmds.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
          const net = billing - comm;
          const count = bCmds.length;

          return {
            barber: b,
            billing,
            commission: comm,
            net,
            count
          };
        });

        return (
          <div className="space-y-6 text-left">
            {/* Filter controls panel */}
            <div className="bg-[#101012] border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 font-mono">
                  Filtrar Período de Análise
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione um range de datas para recarregar todos os métricas de caixa, faturamento líquido e repasses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-zinc-950 border border-zinc-850 p-1 rounded-lg flex gap-1">
                  {(['diario', 'semanal', 'mensal', 'personalizado'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setReportPeriod(p)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider font-mono uppercase cursor-pointer transition ${
                        reportPeriod === p ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-405 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      {p === 'diario' ? 'Hoje' : p === 'semanal' ? '7 dias' : p === 'mensal' ? '30 dias' : 'Personalizar'}
                    </button>
                  ))}
                </div>

                {reportPeriod === 'personalizado' && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-zinc-500 font-mono text-xs">até</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* KPI overview row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Faturamento Bruto</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{formatCurrency(totalRevenueVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Total faturado no caixa</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Comissões Devidas</span>
                <span className="text-2xl font-bold font-mono text-amber-500 block mt-1">{formatCurrency(totalCommissionsVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Repasse aos profissionais</span>
              </div>
              <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Lucro Líquido Real</span>
                <span className="text-2xl font-bold font-mono text-emerald-500 block mt-1">{formatCurrency(netProfitVal)}</span>
                <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Retenção líquida da barbearia</span>
              </div>
              <div className="bg-[#101012] border border-zinc-805 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Atendimentos</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">{totalTicketsVal}</span>
                </div>
                <div className="border-l border-zinc-850 pl-3">
                  <span className="text-[10px] text-zinc-450 font-mono uppercase block">Ticket Médio</span>
                  <span className="text-sm font-semibold font-mono text-yellow-500 mt-1 block">{formatCurrency(averageTicketVal)}</span>
                </div>
              </div>
            </div>

            {/* Detailed performance tables and divisions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left detail: Barbers row */}
              <div className="lg:col-span-8 bg-[#101012] border border-zinc-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                  Performance Financeira por Barbeiro
                </h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-zinc-400 font-mono text-[10px]">
                        <th className="pb-2 text-left font-semibold">Profissional</th>
                        <th className="pb-2 text-center font-semibold">Serviços Atendidos</th>
                        <th className="pb-2 text-right font-semibold">Faturado Bruto</th>
                        <th className="pb-2 text-right font-semibold">Comissão Devida</th>
                        <th className="pb-2 text-right font-semibold">Net Barbearia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {barberPerformance.map(bp => (
                        <tr key={bp.barber.id} className="hover:bg-zinc-900/10">
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <span className="text-xl bg-zinc-950 border border-zinc-850 p-1 rounded-md">{bp.barber.avatar || '🧔'}</span>
                            <span>{bp.barber.name}</span>
                          </td>
                          <td className="py-3 text-center font-mono">{bp.count} comanda(s)</td>
                          <td className="py-3 text-right font-mono text-white">{formatCurrency(bp.billing)}</td>
                          <td className="py-3 text-right font-mono text-amber-500">{formatCurrency(bp.commission)}</td>
                          <td className="py-3 text-right font-mono text-emerald-500">{formatCurrency(bp.net)}</td>
                        </tr>
                      ))}
                      {barberPerformance.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500">Nenhum barbeiro ativo cadastrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right side: Categories & payment methods */}
              <div className="lg:col-span-4 space-y-6">
                {/* Services vs product faturamento */}
                <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                    Divisão de Vendas
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-zinc-300">💈 Serviços Prestados</span>
                        <span className="font-mono font-bold text-white">{formatCurrency(servicesSalesVolume)}</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (servicesSalesVolume / totalRevenueVal) * 100 : 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-teal-400">🧴 Venda de Produtos</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(productsSalesVolume)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (productsSalesVolume / totalRevenueVal) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Unidades faturadas: {productsQuantity}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-352 mb-1.5">
                        <span className="flex items-center gap-1.5 text-orange-400">🍂 Produtos Tabacaria</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(tabacariaSalesVolume)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${totalRevenueVal > 0 ? (tabacariaSalesVolume / totalRevenueVal) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-zinc-500 font-mono">Unidades faturadas: {tabacariaQuantity}</span>
                        <span className="text-[9px] text-orange-450 uppercase font-mono tracking-wider font-bold">Comissão separada</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories & payment lists */}
                <div className="bg-[#101012] border border-zinc-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2">
                    Faturamento por Categoria
                  </h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {categories.map(cat => {
                      const cost = categoryBreakdown[cat] || 0;
                      return (
                        <div key={cat} className="flex justify-between items-center text-xs font-mono py-1 border-b border-zinc-900 last:border-0">
                          <span className="text-zinc-400 uppercase">{cat}</span>
                          <span className="font-bold text-white">{formatCurrency(cost)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase border-b border-zinc-850 pb-2 pt-2">
                    Meios de Pagamento
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(paymentsBreakdown).map(method => {
                      const data = paymentsBreakdown[method];
                      const label = method === 'MONEY' ? 'Dinheiro' : method === 'CARD' ? 'Cartão' : method === 'PIX' ? 'Pix' : 'Assinatura Club';
                      return (
                        <div key={method} className="flex justify-between items-center text-xs font-mono py-1 border-b border-zinc-900 last:border-0">
                          <span className="text-zinc-400">{label} ({data.count})</span>
                          <span className="font-bold text-white">{formatCurrency(data.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
