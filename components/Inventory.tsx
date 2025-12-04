
import React, { useState, useEffect } from 'react';
import type { FarmDataContextType, InventoryItem } from '../types';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/shared/Input';

interface InventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
    initialData: InventoryItem | null;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'Seeds' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Other'>('Other');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState('');
    const [supplier, setSupplier] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [costPerUnit, setCostPerUnit] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setCategory(initialData.category);
                setQuantity(initialData.quantity);
                setUnit(initialData.unit);
                setSupplier(initialData.supplier);
                setPurchaseDate(initialData.purchaseDate);
                setCostPerUnit(initialData.costPerUnit);
            } else {
                setName('');
                setCategory('Other');
                setQuantity(0);
                setUnit('');
                setSupplier('');
                setPurchaseDate(new Date().toISOString().split('T')[0]);
                setCostPerUnit(0);
            }
        }
    }, [isOpen, initialData]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit || quantity <= 0 || costPerUnit < 0) {
            alert('Please fill out all fields with valid values.');
            return;
        }
        const itemData = { name, category, quantity, unit, supplier, purchaseDate, costPerUnit };
        if (initialData) {
             onSubmit({ ...itemData, id: initialData.id });
        } else {
            onSubmit(itemData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Inventory Item" : "Add New Inventory Item"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="item-name" label="Item Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <div>
                    <label htmlFor="item-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="item-category" value={category} onChange={e => setCategory(e.target.value as any)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900" required>
                        <option>Seeds</option>
                        <option>Fertilizer</option>
                        <option>Pesticide</option>
                        <option>Equipment</option>
                        <option>Other</option>
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input id="item-quantity" label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                    <Input id="item-unit" label="Unit (e.g., kg, bag)" type="text" value={unit} onChange={e => setUnit(e.target.value)} required />
                 </div>
                 <Input id="item-cost" label="Cost per Unit ($)" type="number" step="0.01" value={costPerUnit} onChange={e => setCostPerUnit(Number(e.target.value))} required />
                 <Input id="item-supplier" label="Supplier" type="text" value={supplier} onChange={e => setSupplier(e.target.value)} />
                 <Input id="item-date" label="Purchase Date" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                </div>
            </form>
        </Modal>
    );
};

interface InventoryProps {
    farmData: FarmDataContextType;
}

export const Inventory: React.FC<InventoryProps> = ({ farmData }) => {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = farmData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    }
    
    const handleOpenEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }

    const handleSubmit = (item: Omit<InventoryItem, 'id'> | InventoryItem) => {
        if ('id' in item) {
            updateInventoryItem(item);
        } else {
            addInventoryItem(item);
        }
    }
    
    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this inventory item?')) {
            deleteInventoryItem(id);
        }
    }

    const inventoryColumns = [
        { header: 'Item Name', accessor: 'name' as keyof InventoryItem },
        { header: 'Category', accessor: 'category' as keyof InventoryItem },
        { header: 'Quantity', accessor: (item: InventoryItem) => `${item.quantity} ${item.unit}` },
        { header: 'Cost/Unit', accessor: (item: InventoryItem) => `$${item.costPerUnit.toLocaleString()}`},
        { header: 'Total Value', accessor: (item: InventoryItem) => `$${(item.quantity * item.costPerUnit).toLocaleString()}`},
        { header: 'Supplier', accessor: 'supplier' as keyof InventoryItem },
    ];

    return (
        <>
            <InventoryItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} initialData={editingItem} />
            <div className="space-y-6">
                <Card title="Inventory Management">
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenAddModal}>Add Inventory Item</Button>
                    </div>
                    <Table<InventoryItem> 
                        columns={inventoryColumns} 
                        data={inventory}
                        renderActions={(item) => (
                             <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditModal(item)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                            </div>
                        )} 
                    />
                </Card>
            </div>
        </>
    );
};
