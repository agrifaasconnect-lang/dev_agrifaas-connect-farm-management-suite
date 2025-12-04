import React, { useMemo } from 'react';
import type { Task } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface CostByCategoryReportProps {
    tasks: Task[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const CostByCategoryReport: React.FC<CostByCategoryReportProps> = ({ tasks }) => {
    const chartData = useMemo(() => {
        const categoryMap = new Map<string, number>();
        
        tasks.forEach(task => {
            const current = categoryMap.get(task.category) || 0;
            categoryMap.set(task.category, current + task.cost);
        });

        const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value
        }));

        // Sort by value descending
        return data.sort((a, b) => b.value - a.value);
    }, [tasks]);

    const totalCost = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Cost by Category</h3>
            <div className="bg-white p-4 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value, DEFAULT_CURRENCY)}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Breakdown</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {chartData.map((item, index) => (
                                <tr key={item.name}>
                                    <td className="px-4 py-2 text-sm text-gray-900 flex items-center">
                                        <span 
                                            className="w-3 h-3 rounded-full mr-2" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                                        {formatCurrency(item.value, DEFAULT_CURRENCY)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 text-right">
                                        {totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

