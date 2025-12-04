
import React, { useMemo } from 'react';
import type { User, Workspace, WorkspaceMember } from '@/types';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { formatCurrency, DEFAULT_CURRENCY } from '@/constants';
import { queryCollection } from '@/services/firestoreService';

// Helper to get data from Firestore
const getWorkspaceData = async <T,>(workspaceId: string, collection: string): Promise<T[]> => {
    try {
        const data = await queryCollection<T>(`workspaces/${workspaceId}/${collection}`);
        return data;
    } catch (error) {
        return [];
    }
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; description?: string }> = ({ title, value, icon, description }) => (
    <Card className="flex items-start p-6">
        <div className="text-3xl mr-4 bg-gray-100 p-3 rounded-lg text-gray-700">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    </Card>
);

const getOwnerName = (workspace: Workspace, users: User[]): string => {
    const ownerEntry = Object.entries(workspace.members).find(([, member]: [string, WorkspaceMember]) => member.role === 'owner');
    if (!ownerEntry) return 'N/A';
    const owner = users.find(u => u.id === ownerEntry[0]);
    return owner?.name || 'N/A';
};

interface SuperAdminDashboardProps {
    allUsers: User[];
    allWorkspaces: Workspace[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ allUsers, allWorkspaces }) => {

    const platformStats = useMemo(() => {
        const activeWorkspaces = allWorkspaces.filter(ws => ws.status === 'active').length;

        // Note: For Firebase, we would need to aggregate data from all workspaces
        // This is a simplified version - in production, you might want to cache this data
        return {
            totalUsers: allUsers.length,
            totalWorkspaces: allWorkspaces.length,
            activeWorkspaces,
            suspendedWorkspaces: allWorkspaces.length - activeWorkspaces,
            totalInventoryValue: 0, // TODO: Aggregate from Firebase
            totalSalesRevenue: 0, // TODO: Aggregate from Firebase
            totalTasks: 0, // TODO: Aggregate from Firebase
        };
    }, [allUsers, allWorkspaces]);

    const recentWorkspaces = useMemo(() => {
        return [...allWorkspaces]
            .sort((a, b) => {
                // Sort by creation time if available, otherwise by ID
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            })
            .slice(0, 5);
    }, [allWorkspaces]);

    const recentWorkspacesColumns = [
        { header: 'Workspace Name', accessor: 'name' as keyof Workspace },
        { header: 'Owner', accessor: (ws: Workspace) => getOwnerName(ws, allUsers) },
        {
            header: 'Created On',
            accessor: (ws: Workspace) => ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : 'N/A'
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={platformStats.totalUsers}
                    icon="👤"
                />
                <StatCard
                    title="Workspaces"
                    value={platformStats.totalWorkspaces}
                    icon="🏢"
                    description={`${platformStats.activeWorkspaces} Active / ${platformStats.suspendedWorkspaces} Suspended`}
                />
                 <StatCard
                    title="Total Tasks Logged"
                    value={platformStats.totalTasks.toLocaleString()}
                    icon="🛠️"
                />
                <StatCard
                    title="Platform Inventory Value"
                    value={formatCurrency(platformStats.totalInventoryValue, DEFAULT_CURRENCY)}
                    icon="📦"
                />
                 <StatCard
                    title="Platform Sales Revenue"
                    value={formatCurrency(platformStats.totalSalesRevenue, DEFAULT_CURRENCY)}
                    icon="📈"
                    description="Across all workspaces"
                />
            </div>
             <Card title="Recent Workspaces">
                <Table<Workspace>
                    columns={recentWorkspacesColumns}
                    data={recentWorkspaces}
                />
            </Card>
        </div>
    );
};
