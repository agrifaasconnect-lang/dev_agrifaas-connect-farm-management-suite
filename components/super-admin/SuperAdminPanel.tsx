
import React, { useState, useEffect } from 'react';
import type { User, Workspace, PlatformConfig, AuditLogEntry, WorkspaceMember } from '../../types';
import { queryCollection, updateDocument, getDocument, addDocument } from '../../services/firestoreService';
import { SuperAdmin } from '@/components/super-admin/SuperAdmin';

// Wrapper component to handle Firebase data loading
interface SuperAdminPanelProps {
    onLogout: () => void;
    onImpersonateUser: (user: User, workspace: Workspace) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onLogout, onImpersonateUser }) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [platformConfig, setPlatformConfig] = useState<PlatformConfig | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [workspacesData, usersData, configData, auditData] = await Promise.all([
                queryCollection<Workspace>('workspaces'),
                queryCollection<User>('users'),
                getDocument<PlatformConfig>('platform', 'config'),
                queryCollection<AuditLogEntry>('platform/config/auditLog')
            ]);

            setWorkspaces(workspacesData);
            setUsers(usersData);
            setPlatformConfig(configData || { featureFlags: {}, defaultPermissions: {} } as PlatformConfig);
            setAuditLog(auditData);
        } catch (error) {
            console.error('Error loading Super Admin data:', error);
        }
    };

    const logAction = async (action: string, details: string) => {
        const entry: Omit<AuditLogEntry, 'id'> = {
            timestamp: new Date().toISOString(),
            superAdminId: 'superadmin',
            action,
            details,
        };

        try {
            await addDocument('platform/config/auditLog', entry);
            await loadData();
        } catch (error) {
            console.error('Error logging action:', error);
        }
    };

    const handleToggleWorkspaceStatus = async (workspaceId: string) => {
        try {
            const workspace = workspaces.find(w => w.id === workspaceId);
            if (!workspace) return;

            const newStatus = workspace.status === 'active' ? 'suspended' : 'active';
            await updateDocument('workspaces', workspaceId, { status: newStatus });
            await logAction('Workspace Status Change', `Workspace ${workspace.name} (${workspace.id}) status changed to ${newStatus}.`);
            await loadData();
        } catch (error) {
            console.error('Error toggling workspace status:', error);
        }
    };

    const handleImpersonate = async (workspaceId: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (!workspace) return;

        const ownerEntry = Object.entries(workspace.members).find(([_, member]) => (member as WorkspaceMember).role === 'owner');
        if (!ownerEntry) {
            alert('No owner found for this workspace');
            return;
        }

        const owner = users.find(u => u.id === ownerEntry[0]);
        if (!owner) {
            alert('Owner user not found');
            return;
        }

        await logAction('Impersonation Start', `Started impersonating user ${owner.name} (${owner.id}) in workspace ${workspace.name} (${workspace.id}).`);
        onImpersonateUser(owner, workspace);
    };

    const handleToggleUserStatus = async (userId: string) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;

            const newStatus = user.status === 'active' ? 'suspended' : 'active';
            await updateDocument('users', userId, { status: newStatus });
            await logAction('User Status Change', `User ${user.name} (${user.id}) status changed to ${newStatus}.`);
            await loadData();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    const handleUpdatePlatformConfig = async (newConfig: PlatformConfig) => {
        try {
            await updateDocument('platform', 'config', newConfig);
            await logAction('Platform Config Update', 'Global feature flags or default permissions were updated.');
            await loadData();
        } catch (error) {
            console.error('Error updating platform config:', error);
        }
    };

    if (!platformConfig) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <SuperAdmin
            allUsers={users}
            allWorkspaces={workspaces}
            platformConfig={platformConfig}
            auditLog={auditLog}
            onLogout={onLogout}
            onToggleWorkspaceStatus={handleToggleWorkspaceStatus}
            onImpersonate={handleImpersonate}
            onToggleUserStatus={handleToggleUserStatus}
            onUpdatePlatformConfig={handleUpdatePlatformConfig}
        />
    );
};
