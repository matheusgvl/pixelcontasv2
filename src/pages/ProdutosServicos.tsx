import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  PlusCircle, ShoppingBag, Briefcase, Search, Save, Archive
} from 'lucide-react';
import { realData, toProductPayload, toServicePayload } from '../services/realData';
import { PageHeader } from '../components/shared/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../context/ToastContext';
import type { Product, Service } from '../types';

export const ProdutosServicos: React.FC = () => {
  const location = useLocation();
  const toast = useToast();

  // Set active tab based on active route
  const defaultTab = location.pathname.includes('/servicos') ? 'servicos' : 'produtos';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Load catalogs state
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [nextProducts, nextServices] = await Promise.all([
          realData.products(),
          realData.services(),
        ]);
        if (!mounted) return;
        setProducts(nextProducts);
        setServices(nextServices);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao carregar catalogo.');
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Modal forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Form Fields
  const [productForm, setProductForm] = useState({
    name: '', code: '', sku: '', ncm: '', cfopDefault: '5.102', unit: 'UN', value: 0, stock: 1
  });
  const [serviceForm, setServiceForm] = useState({
    name: '', internalCode: '', municipalCode: '', cnae: '', issRate: 5, defaultValue: 0, city: 'Recife - PE'
  });

  // Filter Catalog Items
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cnae.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.code || !productForm.sku) {
      toast.error('Preencha os campos obrigatórios do produto.');
      return;
    }

    try {
      const newProd = await realData.createProduct({
        name: productForm.name,
        code: productForm.code,
        sku: productForm.sku,
        ncm: productForm.ncm,
        cfopDefault: productForm.cfopDefault,
        unit: productForm.unit,
        value: Number(productForm.value) || 0,
        stock: Number(productForm.stock) || 0,
        status: 'active'
      });

      setProducts(prev => [newProd, ...prev]);
      toast.success('Produto cadastrado com sucesso!');
      setShowProductModal(false);
      setProductForm({ name: '', code: '', sku: '', ncm: '', cfopDefault: '5.102', unit: 'UN', value: 0, stock: 1 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar produto.');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.internalCode || !serviceForm.cnae) {
      toast.error('Preencha os campos obrigatórios do serviço.');
      return;
    }

    try {
      const newServ = await realData.createService({
        name: serviceForm.name,
        internalCode: serviceForm.internalCode,
        municipalCode: serviceForm.municipalCode,
        cnae: serviceForm.cnae,
        issRate: Number(serviceForm.issRate) || 0,
        defaultValue: Number(serviceForm.defaultValue) || 0,
        city: serviceForm.city,
        status: 'active'
      });

      setServices(prev => [newServ, ...prev]);
      toast.success('Serviço cadastrado com sucesso!');
      setShowServiceModal(false);
      setServiceForm({ name: '', internalCode: '', municipalCode: '', cnae: '', issRate: 5, defaultValue: 0, city: 'Recife - PE' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar servico.');
    }
  };

  const handleArchiveProduct = async (id: string, name: string) => {
    try {
      await realData.update('products', id, toProductPayload({ status: 'inactive' }));
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'inactive' as const } : p));
      toast.success(`Produto "${name}" arquivado com sucesso.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao arquivar produto.');
    }
  };

  const handleArchiveService = async (id: string, name: string) => {
    try {
      await realData.update('services', id, toServicePayload({ status: 'inactive' }));
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'inactive' as const } : s));
      toast.success(`Serviço "${name}" arquivado com sucesso.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao arquivar servico.');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Catálogo de Produtos & Serviços"
        description="Gerencie as mercadorias e códigos de faturamento fiscal de serviços da sua empresa."
        action={
          activeTab === 'produtos' ? (
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setShowProductModal(true)}
            >
              Novo Produto
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setShowServiceModal(true)}
            >
              Novo Serviço
            </Button>
          )
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'produtos', label: 'Produtos Físicos', icon: <ShoppingBag className="h-4 w-4" /> },
          { id: 'servicos', label: 'Serviços Prestados', icon: <Briefcase className="h-4 w-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Search Filter input */}
      <div className="flex items-center w-full sm:max-w-sm mb-2">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={activeTab === 'produtos' ? 'Buscar produto por nome, SKU, código...' : 'Buscar serviço por nome, CNAE...'}
          icon={<Search className="h-4.5 w-4.5" />}
        />
      </div>

      {/* Catalog Render Grids */}
      {activeTab === 'produtos' ? (
        /* 1. PRODUCTS TABLE */
        <div className="w-full overflow-x-auto border border-border rounded-premium bg-white shadow-premium">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border text-text-primary font-bold">
                <th className="p-4">Código / SKU</th>
                <th className="p-4">Nome do Produto</th>
                <th className="p-4">NCM</th>
                <th className="p-4">CFOP Padrão</th>
                <th className="p-4 text-center">Unidade</th>
                <th className="p-4 text-right">Preço</th>
                <th className="p-4 text-center">Estoque</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pixel-neutral-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-text-secondary text-xs">
                    Nenhum produto cadastrado no catálogo.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-bgSecondary/20">
                    <td className="p-4 font-mono font-semibold text-text-primary">
                      <div className="flex flex-col gap-0.5">
                        <span>{prod.code}</span>
                        <span className="text-[9px] text-text-secondary">{prod.sku}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-text-primary">{prod.name}</td>
                    <td className="p-4 font-mono text-text-secondary">{prod.ncm}</td>
                    <td className="p-4 font-mono text-text-secondary">{prod.cfopDefault}</td>
                    <td className="p-4 text-center">{prod.unit}</td>
                    <td className="p-4 text-right font-bold text-text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.value)}
                    </td>
                    <td className="p-4 text-center font-semibold">{prod.stock}</td>
                    <td className="p-4">
                      <StatusBadge status={prod.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2.5 justify-end">
                        <button
                          onClick={() => handleArchiveProduct(prod.id, prod.name)}
                          className="text-text-secondary hover:text-red-600 hover:bg-red-600-bg/60 p-1.5 rounded transition-all"
                          title="Arquivar produto"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* 2. SERVICES TABLE */
        <div className="w-full overflow-x-auto border border-border rounded-premium bg-white shadow-premium">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border text-text-primary font-bold">
                <th className="p-4">Cód. Interno</th>
                <th className="p-4">Nome do Serviço</th>
                <th className="p-4">Cód. Municipal / CNAE</th>
                <th className="p-4 text-center">ISS (%)</th>
                <th className="p-4 text-right">Valor Padrão</th>
                <th className="p-4">Município de Incidência</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pixel-neutral-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-text-secondary text-xs">
                    Nenhum serviço cadastrado no catálogo.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-neutral-bgSecondary/20">
                    <td className="p-4 font-mono font-semibold text-text-primary">{srv.internalCode}</td>
                    <td className="p-4 font-medium text-text-primary">{srv.name}</td>
                    <td className="p-4 font-mono text-text-secondary">
                      <div className="flex flex-col gap-0.5">
                        <span>Mun: {srv.municipalCode || 'Isento'}</span>
                        <span className="text-[9px] text-text-secondary">CNAE: {srv.cnae}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-text-primary">{srv.issRate}%</td>
                    <td className="p-4 text-right font-bold text-text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(srv.defaultValue)}
                    </td>
                    <td className="p-4 text-text-secondary">{srv.city}</td>
                    <td className="p-4">
                      <StatusBadge status={srv.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2.5 justify-end">
                        <button
                          onClick={() => handleArchiveService(srv.id, srv.name)}
                          className="text-text-secondary hover:text-red-600 hover:bg-red-600-bg/60 p-1.5 rounded transition-all"
                          title="Arquivar serviço"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Product Form */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSaveProduct} className="relative w-full max-w-lg bg-white border border-border rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-5">
            <h3 className="text-base font-bold text-text-primary font-title">Cadastrar Novo Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Produto *"
                value={productForm.name}
                onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Camiseta Algodão Egípcio"
                className="md:col-span-2"
              />
              <Input
                label="Código Interno *"
                value={productForm.code}
                onChange={e => setProductForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: TS003"
              />
              <Input
                label="SKU / Cód. Barras *"
                value={productForm.sku}
                onChange={e => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Ex: PHY-TS-003-M"
              />
              <Input
                label="NCM do Produto (8 dígitos)"
                value={productForm.ncm}
                onChange={e => setProductForm(prev => ({ ...prev, ncm: e.target.value }))}
                placeholder="Ex: 6109.10.00"
              />
              <Input
                label="CFOP Padrão"
                value={productForm.cfopDefault}
                onChange={e => setProductForm(prev => ({ ...prev, cfopDefault: e.target.value }))}
                placeholder="Ex: 5.102"
              />
              <Input
                label="Preço de Venda (R$)"
                type="number"
                step="0.01"
                value={productForm.value}
                onChange={e => setProductForm(prev => ({ ...prev, value: Number(e.target.value) }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Unidade"
                  value={productForm.unit}
                  onChange={e => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="UN"
                />
                <Input
                  label="Estoque Inicial"
                  type="number"
                  value={productForm.stock}
                  onChange={e => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProductModal(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                icon={<Save className="h-4 w-4" />}
              >
                Salvar Produto
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Service Form */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSaveService} className="relative w-full max-w-lg bg-white border border-border rounded-premium shadow-premium p-6 md:p-8 flex flex-col gap-5">
            <h3 className="text-base font-bold text-text-primary font-title">Cadastrar Novo Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Serviço *"
                value={serviceForm.name}
                onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Consultoria em TI e SEO"
                className="md:col-span-2"
              />
              <Input
                label="CNAE Associado *"
                value={serviceForm.cnae}
                onChange={e => setServiceForm(prev => ({ ...prev, cnae: e.target.value }))}
                placeholder="Ex: 6201-5/01"
              />
              <Input
                label="Código Interno *"
                value={serviceForm.internalCode}
                onChange={e => setServiceForm(prev => ({ ...prev, internalCode: e.target.value }))}
                placeholder="Ex: DEV001"
              />
              <Input
                label="Cód. Serviço Municipal"
                value={serviceForm.municipalCode}
                onChange={e => setServiceForm(prev => ({ ...prev, municipalCode: e.target.value }))}
                placeholder="Ex: 1.01"
              />
              <Input
                label="Alíquota ISS (%) *"
                type="number"
                step="0.1"
                value={serviceForm.issRate}
                onChange={e => setServiceForm(prev => ({ ...prev, issRate: Number(e.target.value) }))}
              />
              <Input
                label="Valor Padrão Cobrado (R$)"
                type="number"
                step="0.01"
                value={serviceForm.defaultValue}
                onChange={e => setServiceForm(prev => ({ ...prev, defaultValue: Number(e.target.value) }))}
              />
              <Input
                label="Município de incidência"
                value={serviceForm.city}
                onChange={e => setServiceForm(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Recife - PE"
                className="md:col-span-2"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowServiceModal(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                icon={<Save className="h-4 w-4" />}
              >
                Salvar Serviço
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
export default ProdutosServicos;
