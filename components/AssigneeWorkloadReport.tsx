import React, { useMemo } from 'react';
import type { Task, User } from '../types';
import { TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AssigneeWorkloadReportProps {
    tasks: Task[];
    users: User[];
}

export const AssigneeWorkloadReport: React.FC<AssigneeWorkloadReportProps> = ({ tasks, users }) => {
    const chartData = useMemo(() => {
        const userMap = new Map<string, { name: string; todo: number; inProgress: number; done: number }>();
        
        // Initialize all users
        users.forEach(user => {
            userMap.set(user.id, {
                name: user.name,
                todo: 0,
                inProgress: 0,
                done: 0
            });
        });

        // Count tasks by assignee and status
        tasks.forEach(task => {
            if (task.assigneeId) {
                const userData = userMap.get(task.assigneeId);
                if (userData) {
                    if (task.status === TaskStatus.ToDo) {
                        userData.todo++;
                    } else if (task.status === TaskStatus.InProgress) {
                        userData.inProgress++;
                    } else if (task.status === TaskStatus.Done) {
                        userData.done++;
                    }
                }
            }
        });

        // Convert to array and filter out users with no tasks
        const data = Array.from(userMap.values()).filter(
            user => user.todo > 0 || user.inProgress > 0 || user.done > 0
        );

        // Sort by total tasks descending
        return data.sort((a, b) => {
            const totalA = a.todo + a.inProgress + a.done;
            const totalB = b.todo + b.inProgress + b.done;
            return totalB - totalA;
        });
    }, [tasks, users]);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Assignee Workload</h3>
            <div className="bg-white p-4 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                        <Legend />
                        <Bar dataKey="todo" stackId="a" fill="#ef4444" name="To Do" />
                        <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
                        <Bar dataKey="done" stackId="a" fill="#10b981" name="Done" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">To Do</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">In Progress</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Done</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {chartData.map(user => (
                                <tr key={user.name}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
                                    <td className="px-4 py-2 text-sm text-center text-red-600 font-medium">{user.todo}</td>
                                    <td className="px-4 py-2 text-sm text-center text-yellow-600 font-medium">{user.inProgress}</td>
                                    <td className="px-4 py-2 text-sm text-center text-green-600 font-medium">{user.done}</td>
                                    <td className="px-4 py-2 text-sm text-center text-gray-900 font-semibold">
                                        {user.todo + user.inProgress + user.done}
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