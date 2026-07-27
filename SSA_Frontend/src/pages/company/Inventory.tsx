import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  initialAssets,
  initialMaterials,
  type Asset,
  type MaterialStock
} from '../../data/mockData'
import { Plus, Check, Laptop, Archive, AlertTriangle, User } from 'lucide-react'

interface InventoryProps {
  defaultTab?: 'assets' | 'materials' | 'stock'
}

interface AssetFormInputs {
  assetId: string
  assetName: string
  assetType: Asset['assetType']
  department: string
  assignedTo: string
  purchaseDate: string
  warrantyDate: string
  status: Asset['status']
}

interface MaterialFormInputs {
  materialName: string
  category: string
  stockLevel: number
  unit: string
  reorderPoint: number
}

export const Inventory: React.FC<InventoryProps> = ({ defaultTab = 'assets' }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'assets' | 'materials' | 'stock'>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [materials, setMaterials] = useState<MaterialStock[]>(initialMaterials)
  
  const [isAssetOpen, setIsAssetOpen] = useState(false)
  const [isMaterialOpen, setIsMaterialOpen] = useState(false)

  const { register: registerAsset, handleSubmit: handleSubmitAsset, reset: resetAsset, formState: { errors: assetErrors } } = useForm<AssetFormInputs>()
  const { register: registerMat, handleSubmit: handleSubmitMat, reset: resetMat, formState: { errors: matErrors } } = useForm<MaterialFormInputs>()

  // Submit new Asset
  const onSubmitAsset = (data: AssetFormInputs) => {
    const newA: Asset = {
      id: `AST-${Math.floor(700 + Math.random() * 300)}`,
      ...data
    }
    setAssets([...assets, newA])
    setIsAssetOpen(false)
    resetAsset()
  }

  // Submit new Material
  const onSubmitMaterial = (data: MaterialFormInputs) => {
    const status = Number(data.stockLevel) === 0
      ? 'Out of Stock'
      : Number(data.stockLevel) < Number(data.reorderPoint)
      ? 'Low Stock'
      : 'In Stock'

    const newM: MaterialStock = {
      id: `MAT-${Math.floor(800 + Math.random() * 200)}`,
      ...data,
      stockLevel: Number(data.stockLevel),
      reorderPoint: Number(data.reorderPoint),
      status
    }
    setMaterials([...materials, newM])
    setIsMaterialOpen(false)
    resetMat()
  }

  const deleteAsset = (id: string) => {
    if (confirm('Decommission this asset from registry?')) {
      setAssets(assets.filter(a => a.id !== id))
    }
  }

  const deleteMaterial = (id: string) => {
    if (confirm('Delete this material record?')) {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-charcoal tracking-tight sm:text-3xl font-extrabold">Asset & Stock Inventory</h1>
          <p className="text-sm text-brand-gray mt-1 font-medium">Track CAD workstation hardware, Revit multi-user licenses, plotting roll stock, and textures.</p>
        </div>
        <div>
          {activeTab === 'assets' ? (
            <button
              onClick={() => setIsAssetOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          ) : (
            <button
              onClick={() => setIsMaterialOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Stock Item
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => navigate('/inventory/assets')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'assets'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Assets Registry
        </button>
        <button
          onClick={() => navigate('/inventory/materials')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'materials'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Consumable Materials
        </button>
        <button
          onClick={() => navigate('/inventory/stock')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stock'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          Stock Warnings
        </button>
      </div>

      {/* 1. ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="p-4 font-semibold">Asset Code</th>
                  <th className="p-4 font-semibold">Asset Name / Model</th>
                  <th className="p-4 font-semibold">Classification</th>
                  <th className="p-4 font-semibold">Assigned To</th>
                  <th className="p-4 font-semibold">Purchase Date</th>
                  <th className="p-4 font-semibold">Warranty Expiry</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-primary">{a.assetId}</td>
                    <td className="p-4 font-bold text-brand-charcoal">{a.assetName}</td>
                    <td className="p-4 text-brand-gray">{a.assetType}</td>
                    <td className="p-4 font-medium text-brand-charcoal">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{a.assignedTo}</span>
                      </div>
                    </td>
                    <td className="p-4 text-brand-gray">{a.purchaseDate}</td>
                    <td className="p-4 text-brand-gray">{a.warrantyDate}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Assigned'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : a.status === 'In Stock'
                            ? 'bg-brand-primary/10 text-brand-gold border border-brand-primary/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteAsset(a.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        Decommission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. MATERIALS TAB */}
      {(activeTab === 'materials' || activeTab === 'stock') && (
        <div className="glass-card rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-charcoal">
              <thead className="bg-slate-50 text-brand-gray uppercase tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Material Description</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-center">Current Stock</th>
                  <th className="p-4 font-semibold text-center">Reorder Threshold</th>
                  <th className="p-4 font-semibold">Stock Health</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials
                  .filter((m) => activeTab !== 'stock' || m.status !== 'In Stock')
                  .map((m) => (
                    <tr key={m.id} className="hover:bg-white/10 transition-colors">
                      <td className="p-4 font-mono font-semibold text-brand-primary">{m.id}</td>
                      <td className="p-4 font-bold text-brand-charcoal">{m.materialName}</td>
                      <td className="p-4 text-slate-500">{m.category}</td>
                      <td className="p-4 text-center font-extrabold text-brand-charcoal">
                        {m.stockLevel} {m.unit}
                      </td>
                      <td className="p-4 text-center text-gray-500">
                        {m.reorderPoint} {m.unit}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'In Stock'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : m.status === 'Low Stock'
                              ? 'bg-amber-500/10 text-amber-405 border border-amber-500/20 animate-pulse'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {m.status === 'In Stock' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteMaterial(m.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAssetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Laptop className="w-5 h-5 text-brand-primary" /> Catalog System Asset
              </h2>
              <button
                onClick={() => setIsAssetOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset(onSubmitAsset)} className="space-y-4">
              {/* Asset Name */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Asset Name</label>
                <input
                  type="text"
                  {...registerAsset('assetName', { required: 'Asset name is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="e.g. Dell Precision 7920"
                />
                {assetErrors.assetName && <p className="text-red-500 text-[10px] mt-1">{assetErrors.assetName.message}</p>}
              </div>

              {/* Asset Code ID */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Asset Serial Code</label>
                <input
                  type="text"
                  {...registerAsset('assetId', { required: 'Code is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="SSA-WS-012"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Asset Classification</label>
                <select
                  {...registerAsset('assetType', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                >
                  <option value="Workstation">Workstation Computer</option>
                  <option value="Server">System Core Server</option>
                  <option value="VR Headset">Virtual Reality Headset</option>
                  <option value="Plotting Device">Plotting Device / Wide Plotter</option>
                  <option value="Tablet">iPad / Design Tablet</option>
                  <option value="BIM Software License">BIM Autodesk License</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Department</label>
                  <select
                    {...registerAsset('department', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="BIM & Rendering">BIM & Rendering</option>
                    <option value="Studio A">Studio A</option>
                    <option value="Studio B">Studio B</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="Admin Office">Admin Office</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Status</label>
                  <select
                    {...registerAsset('status', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Purchase Date</label>
                  <input
                    type="date"
                    {...registerAsset('purchaseDate', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    defaultValue="2025-01-10"
                  />
                </div>

                {/* Warranty Date */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Warranty Expiry</label>
                  <input
                    type="date"
                    {...registerAsset('warrantyDate', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    defaultValue="2028-01-10"
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Assigned Owner</label>
                <input
                  type="text"
                  {...registerAsset('assignedTo', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="e.g. Siddharth Sen"
                  defaultValue="None"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssetOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isMaterialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-lg font-extrabold text-brand-charcoal flex items-center gap-2">
                <Archive className="w-5 h-5 text-brand-primary" /> Log Consumable Stock
              </h2>
              <button
                onClick={() => setIsMaterialOpen(false)}
                className="p-1 rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-slate-100"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitMat(onSubmitMaterial)} className="space-y-4">
              {/* Material Name */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Material Description</label>
                <input
                  type="text"
                  {...registerMat('materialName', { required: 'Material Name is required' })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="A0 Plotting Paper Roll"
                />
                {matErrors.materialName && <p className="text-red-500 text-[10px] mt-1">{matErrors.materialName.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Category</label>
                <input
                  type="text"
                  {...registerMat('category', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="Plotting Supplies"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stock Level */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Current Stock</label>
                  <input
                    type="number"
                    {...registerMat('stockLevel', { required: true, min: 0 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="25"
                  />
                </div>

                {/* Reorder Point */}
                <div>
                  <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Reorder Threshold</label>
                  <input
                    type="number"
                    {...registerMat('reorderPoint', { required: true, min: 0 })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wider mb-2">Unit of Measure</label>
                <input
                  type="text"
                  {...registerMat('unit', { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary/60 outline-none rounded-xl px-4 py-2.5 text-xs text-brand-charcoal"
                  placeholder="e.g. Rolls, Units, Kits"
                  defaultValue="Rolls"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMaterialOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-gray hover:text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-xs font-bold text-white shadow-md shadow-brand-primary/10 cursor-pointer transition-colors"
                >
                  Register Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
