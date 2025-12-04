
import React, { useState, useMemo } from 'react';
import type { FarmDataContextType, Plot } from '../types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { formatCurrency } from '@/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ProjectionsProps {
    farmData: FarmDataContextType;
    currency: string;
}

interface PlotProjection {
    yieldPerAcre: number;
    pricePerUnit: number;
}

interface ProjectedExpense {
    id: string;
    name: string;
    amount: number;
}

export const Projections: React.FC<ProjectionsProps> = ({ farmData, currency }) => {
    const { plots } = farmData;

    // State for Revenue Drivers
    const [plotProjections, setPlotProjections] = useState<Record<string, PlotProjection>>({});

    // State for Expense Drivers
    const [projectedExpenses, setProjectedExpenses] = useState<ProjectedExpense[]>([
        { id: '1', name: 'Harvest Labor', amount: 0 },
        { id: '2', name: 'Transport to Market', amount: 0 },
        { id: '3', name: 'Packaging Materials', amount: 0 },
    ]);
    const [newExpenseName, setNewExpenseName] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState(0);

    // Handlers
    const handlePlotChange = (plotId: string, field: keyof PlotProjection, value: number) => {
        setPlotProjections(prev => ({
            ...prev,
            [plotId]: {
                ...prev[plotId],
                [field]: value
            }
        }));
    };

    const handleAddExpense = () => {
        if (newExpenseName && newExpenseAmount > 0) {
            setProjectedExpenses([...projectedExpenses, { id: Date.now().toString(), name: newExpenseName, amount: newExpenseAmount }]);
            setNewExpenseName('');
            setNewExpenseAmount(0);
        }
    };

    const handleRemoveExpense = (id: string) => {
        setProjectedExpenses(projectedExpenses.filter(e => e.id !== id));
    };

    const handleUpdateExpense = (id: string, amount: number) => {
        setProjectedExpenses(prev => prev.map(e => e.id === id ? { ...e, amount } : e));
    }

    // Calculations
    const calculations = useMemo(() => {
        let totalRevenue = 0;
        const revenueByPlot = plots.map(plot => {
            const proj = plotProjections[plot.id] || { yieldPerAcre: 0, pricePerUnit: 0 };
            const revenue = plot.area * proj.yieldPerAcre * proj.pricePerUnit;
            totalRevenue += revenue;
            return {
                name: plot.name,
                crop: plot.crop,
                revenue
            };
        });

        const totalExpenses = projectedExpenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalExpenses, netProfit, margin, revenueByPlot };
    }, [plots, plotProjections, projectedExpenses]);

    const chartData = [
        { name: 'Projections', Revenue: calculations.totalRevenue, Expenses: calculations.totalExpenses, Profit: calculations.netProfit }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-green-50 border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800 uppercase">Projected Revenue</h4>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(calculations.totalRevenue, currency)}</p>
                </Card>
                <Card className="bg-red-50 border border-red-100">
                    <h4 className="text-sm font-semibold text-red-800 uppercase">Projected Cost</h4>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(calculations.totalExpenses, currency)}</p>
                </Card>
                <Card className="bg-blue-50 border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800 uppercase">Projected Profit</h4>
                    <p className={`text-2xl font-bold ${calculations.netProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                        {formatCurrency(calculations.netProfit, currency)}
                    </p>
                </Card>
                <Card className="bg-gray-50 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 uppercase">Profit Margin</h4>
                    <p className="text-2xl font-bold text-gray-700">{typeof calculations.margin === 'number' ? calculations.margin.toFixed(1) : '0.0'}%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Revenue Drivers */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Revenue Calculator (By Plot)">
                        <p className="text-sm text-gray-600 mb-4">
                            Estimate your harvest yield and expected market price to forecast revenue.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plot</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop / Area</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Yield (Unit/Acre)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Price (per Unit)</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {plots.map(plot => {
                                        const proj = plotProjections[plot.id] || { yieldPerAcre: 0, pricePerUnit: 0 };
                                        const total = plot.area * proj.yieldPerAcre * proj.pricePerUnit;
                                        return (
                                            <tr key={plot.id}>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{plot.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">
                                                    <div>{plot.crop}</div>
                                                    <div className="text-xs">{plot.area} acres</div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="w-24 p-1 text-sm border rounded focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                                                        value={proj.yieldPerAcre || ''}
                                                        onChange={(e) => handlePlotChange(plot.id, 'yieldPerAcre', parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        className="w-24 p-1 text-sm border rounded focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                                                        value={proj.pricePerUnit || ''}
                                                        onChange={(e) => handlePlotChange(plot.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right font-semibold text-green-700">
                                                    {formatCurrency(total, currency)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Financial Outlook">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(val) => `${val / 1000}k`} />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="Expenses" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="Profit" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    <ReferenceLine x={0} stroke="#000" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Cost Drivers */}
                <div className="space-y-6">
                    <Card title="Anticipated Expenses">
                        <p className="text-sm text-gray-600 mb-4">
                            Add future expenses to see how they impact your bottom line (e.g., Harvesting, Transport).
                        </p>
                        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                            {projectedExpenses.map(expense => (
                                <div key={expense.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{expense.name}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            className="w-20 p-1 text-sm border rounded text-right bg-white text-gray-900"
                                            value={expense.amount || ''}
                                            onChange={(e) => handleUpdateExpense(expense.id, parseFloat(e.target.value) || 0)}
                                        />
                                        <button onClick={() => handleRemoveExpense(expense.id)} className="text-red-500 hover:text-red-700">
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <h5 className="text-sm font-semibold mb-2">Add New Expense</h5>
                            <div className="space-y-2">
                                <Input 
                                    id="new-exp-name" 
                                    label="" 
                                    placeholder="Expense Name" 
                                    value={newExpenseName} 
                                    onChange={(e) => setNewExpenseName(e.target.value)} 
                                />
                                <div className="flex space-x-2">
                                    <Input 
                                        id="new-exp-amount" 
                                        label="" 
                                        type="number" 
                                        placeholder="Amount" 
                                        value={newExpenseAmount || ''} 
                                        onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value))} 
                                    />
                                    <Button onClick={handleAddExpense} disabled={!newExpenseName || newExpenseAmount <= 0}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
