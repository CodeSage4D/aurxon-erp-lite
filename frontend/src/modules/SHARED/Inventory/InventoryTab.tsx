'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { 
  getInventoryApi, 
  createInventoryItemApi, 
  updateInventoryItemApi, 
  deleteInventoryItemApi 
} from '@/services/api';

interface InventoryTabProps {
  triggerToast: (msg: string) => void;
}

export default function InventoryTab({
  triggerToast
}: InventoryTabProps) {
  // Local state for inventory desk
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'STATIONERY', quantity: '', unit: 'PCS', vendor: '' });
  const [editingInventoryId, setEditingInventoryId] = useState<string>('');

  const loadInventoryData = async () => {
    try {
      const data = await getInventoryApi();
      setInventory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const handleCreateInventoryItemLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInventoryItemApi({
        name: inventoryForm.name,
        category: inventoryForm.category,
        quantity: parseInt(inventoryForm.quantity) || 0,
        unit: inventoryForm.unit,
        vendor: inventoryForm.vendor
      });
      triggerToast('Inventory item registered!');
      setInventoryForm({ name: '', category: 'STATIONERY', quantity: '', unit: 'PCS', vendor: '' });
      loadInventoryData();
    } catch (err: any) {
      alert(err.message || 'Failed to add inventory item');
    }
  };

  const handleUpdateInventoryItemLocal = async (id: string, updateData: any) => {
    try {
      await updateInventoryItemApi(id, updateData);
      triggerToast('Stock details updated!');
      setEditingInventoryId('');
      loadInventoryData();
    } catch (err: any) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleDeleteInventoryItemLocal = async (id: string) => {
    if (confirm('Delete this item from inventory?')) {
      try {
        await deleteInventoryItemApi(id);
        triggerToast('Item removed!');
        loadInventoryData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  const lowStockCount = inventory.filter(i => i.status === 'LOW_STOCK').length;
  const outOfStockCount = inventory.filter(i => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Inventory & Consumables Ledger</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
            Catalogue school assets, furniture, laboratory tools, and stationery supplies. Track stock levels in real-time.
          </p>
        </div>
        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <div className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-600 uppercase flex items-center gap-1.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{lowStockCount} low stock</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[9px] font-bold text-rose-600 uppercase flex items-center gap-1.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>{outOfStockCount} out of stock</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to catalogue items */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-4 h-fit">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Catalogue Supplies & Assets
          </h4>
          <form onSubmit={handleCreateInventoryItemLocal} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Item Name</label>
              <input 
                required 
                placeholder="e.g. Marker Pens (Pack of 10)" 
                value={inventoryForm.name} 
                onChange={e => setInventoryForm({...inventoryForm, name: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Category</label>
              <select 
                value={inventoryForm.category} 
                onChange={e => setInventoryForm({...inventoryForm, category: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-200"
              >
                <option value="STATIONERY">Stationery & Office</option>
                <option value="FURNITURE">Classroom Furniture</option>
                <option value="LAB_EQUIPMENT">Science Lab Equipment</option>
                <option value="SPORTS">Sports & Athletics</option>
                <option value="OTHER">Others</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Quantity</label>
                <input 
                  required 
                  type="number" 
                  placeholder="e.g. 50" 
                  value={inventoryForm.quantity} 
                  onChange={e => setInventoryForm({...inventoryForm, quantity: e.target.value})} 
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250 font-bold" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase">Unit</label>
                <input 
                  required 
                  placeholder="e.g. PCS, PACKS" 
                  value={inventoryForm.unit} 
                  onChange={e => setInventoryForm({...inventoryForm, unit: e.target.value.toUpperCase()})} 
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">Vendor Supplier</label>
              <input 
                placeholder="e.g. Century Papers Ltd." 
                value={inventoryForm.vendor} 
                onChange={e => setInventoryForm({...inventoryForm, vendor: e.target.value})} 
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-250" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-xs font-bold text-white shadow-md transition"
            >
              Log Stock item
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Inventory directory</h4>
          
          <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">In-Stock Quantity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{item.name}</td>
                    <td className="p-3 text-zinc-400 text-[10px]">{item.category}</td>
                    <td className="p-3">
                      {editingInventoryId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            defaultValue={item.quantity} 
                            onBlur={(e) => handleUpdateInventoryItemLocal(item.id, { quantity: parseInt(e.target.value) || 0 })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateInventoryItemLocal(item.id, { quantity: parseInt((e.target as HTMLInputElement).value) || 0 });
                              }
                            }}
                            autoFocus
                            className="w-16 rounded border border-zinc-200 px-1 py-0.5 outline-none dark:border-zinc-800 dark:bg-zinc-950 font-mono text-center text-zinc-850 dark:text-zinc-200 font-bold"
                          />
                          <span className="text-[10px] text-zinc-400">{item.unit}</span>
                        </div>
                      ) : (
                        <div className="cursor-pointer hover:underline" onClick={() => setEditingInventoryId(item.id)} title="Click to edit quantity inline">
                          <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.quantity}</span>{' '}
                          <span className="text-[10px] text-zinc-400 font-normal">{item.unit}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        item.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-600' :
                        item.status === 'LOW_STOCK' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-550 dark:text-zinc-400">{item.vendor || 'Not Linked'}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleDeleteInventoryItemLocal(item.id)} 
                        className="text-zinc-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
