import React, { useMemo } from 'react';
import type { Task, Plot } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface CostByPlotReportProps {
    tasks: Task[];
    plots: Plot[];
}

export const CostByPlotReport: React.FC<CostByPlotReportProps> = ({ tasks, plots }) => {
    const chartData = useMemo(() => {
        const plotCosts = plots.map(plot => {
            const plotTasks = tasks.filter(t => t.plotId === plot.id);
            const totalCost = plotTasks.reduce((sum, t) => sum + t.cost, 0);
            return {
                name: plot.name,
                cost: totalCost
            };
        });
        
        // Sort by cost descending
        return plotCosts.sort((a, b) => b.cost - a.cost);
    }, [tasks, plots]);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Cost by Plot</h3>
            <div className="bg-white p-4 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value, DEFAULT_CURRENCY)}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        />
                        <Legend />
                        <Bar dataKey="cost" fill="#10b981" name="Total Estimated Cost" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                <div className="space-y-1">
                    {chartData.map(item => (
                        <div key={item.name} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name}:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(item.cost, DEFAULT_CURRENCY)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

