
import React, { useState } from 'react';
import type { Workspace, User, Feature, Role, FeaturePermission } from '../types';
import { ALL_FEATURES, ALL_ROLES } from '../types';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Button } from '@/components/shared/Button';
import { ToggleSwitch } from '@/components/shared/ToggleSwitch';
import { Input } from '@/components/shared/Input';
import { exportFirestoreData } from '../services/exportFirestoreData';
import { uploadWorkspaceLogo } from '../services/imageStorageService';
import { UploadIcon } from '../constants';

interface AdminProps {
    workspace: Workspace;
    workspaceUsers: User[];
    onUpdateFeaturePermissions: (feature: Feature, permission: FeaturePermission) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    onDeleteWorkspace: () => Promise<void>;
    onUpdateUserRole: (userId: string, newRole: Role) => Promise<void>;
    onUpdateWorkspace: (details: Partial<Workspace>) => Promise<void>;
    currentUser: User;
}

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

type AdminTab = 'settings' | 'users' | 'features' | 'data' | 'danger';

export const Admin: React.FC<AdminProps> = ({ workspace, workspaceUsers, onUpdateFeaturePermissions, onRemoveUser, onDeleteWorkspace, onUpdateUserRole, onUpdateWorkspace, currentUser }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('settings');
    const [copySuccess, setCopySuccess] = useState('');
    const [newName, setNewName] = useState(workspace.name);
    const [newLogo, setNewLogo] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(workspace.logoUrl || null);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(workspace.id).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
             setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setNewLogo(base64String);
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const updates: Partial<Workspace> = { name: newName };

            if (newLogo) {
                try {
                    const url = await uploadWorkspaceLogo(newLogo);
                    if (url) {
                        updates.logoUrl = url;
                    }
                } catch (uploadError: any) {
                    console.error("Upload failed", uploadError);
                    if (uploadError.code === 'storage/unauthorized') {
                        alert("Permission denied. Storage rules may need to be updated to allow uploads.");
                    } else {
                        alert(`Failed to upload logo: ${uploadError.message}`);
                    }
                    setIsSavingSettings(false);
                    return; 
                }
            }
            
            // Explicitly ensure we aren't passing undefined
            const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            await onUpdateWorkspace(cleanUpdates);
            setNewLogo(null);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleRemoveUser = (userId: string) => {
        const userToRemove = workspaceUsers.find(u => u.id === userId);
        if (userToRemove && window.confirm(`Are you sure you want to remove ${userToRemove.name} from the workspace?`)) {
            onRemoveUser(userId);
        }
    };

    const handleExportData = async () => {
        await exportFirestoreData(workspace.id, workspace.name);
    };

    const handleDeleteWorkspaceClick = () => {
        const confirmation = prompt(`This action is permanent and cannot be undone. It will delete all data associated with this workspace.\n\nPlease type "${workspace.name}" to confirm.`);
        if (confirmation === workspace.name) {
            if (window.confirm("FINAL CONFIRMATION: Are you absolutely sure you want to delete this workspace?")) {
                onDeleteWorkspace();
            }
        } else if (confirmation !== null) {
            alert("The name you entered did not match. Deletion cancelled.");
        }
    };

    const handleRolePermissionChange = (feature: Feature, role: Role, checked: boolean) => {
        const currentPermission = workspace.featurePermissions[feature];
        const newAllowedRoles = checked
            ? [...currentPermission.allowedRoles, role]
            : currentPermission.allowedRoles.filter(r => r !== role);
        
        onUpdateFeaturePermissions(feature, { ...currentPermission, allowedRoles: newAllowedRoles });
    };

    const currentUserRole = workspace.members[currentUser.id]?.role;
    const userColumns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { 
            header: 'Role', 
            accessor: (user: User) => {
                const userRole = workspace.members[user.id]?.role;

                if (currentUserRole !== 'owner') {
                    return <span className="capitalize">{userRole}</span>;
                }

                return (
                    <select
                        value={userRole}
                        onChange={(e) => onUpdateUserRole(user.id, e.target.value as Role)}
                        className="block w-full max-w-[150px] px-2 py-1 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        aria-label={`Role for ${user.name}`}
                    >
                       {ALL_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                       ))}
                    </select>
                );
            } 
        },
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm px-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {[
                        { id: 'settings', label: 'Settings' },
                        { id: 'users', label: 'Users' },
                        { id: 'features', label: 'Features' },
                        { id: 'data', label: 'Data Export' },
                        { id: 'danger', label: 'Danger Zone', className: 'text-red-600 hover:text-red-800 border-transparent hover:border-red-300' }
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        let borderClass = 'border-transparent';
                        let textClass = 'text-gray-500 hover:text-gray-700 hover:border-gray-300';
                        
                        if (isActive) {
                            borderClass = tab.id === 'danger' ? 'border-red-500' : 'border-green-500';
                            textClass = tab.id === 'danger' ? 'text-red-600' : 'text-green-600';
                        } else if (tab.className) {
                            textClass = tab.className;
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as AdminTab)}
                                className={`${borderClass} ${textClass} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {activeTab === 'settings' && (
                <Card title="Workspace Settings">
                    <div className="space-y-4">
                        <Input 
                            id="workspace-name" 
                            label="Workspace Name" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Logo</label>
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Workspace Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Logo</span>
                                    )}
                                </div>
                                <label className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-50 text-sm">
                                    <UploadIcon className="w-4 h-4 mr-2" />
                                    Change Logo
                                    <input type='file' className="hidden" accept="image/*" onChange={handleLogoChange} />
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="mb-2 text-sm text-gray-600">
                                Workspace ID (Share this to invite members):
                            </p>
                            <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                                <span className="font-mono text-sm text-gray-700 flex-1 break-all">{workspace.id}</span>
                                <Button variant="secondary" onClick={handleCopyId} className="!py-1 !px-2 text-sm flex-shrink-0">
                                    <CopyIcon className="w-4 h-4 mr-1 inline"/>
                                    {copySuccess || 'Copy ID'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                                {isSavingSettings ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'users' && (
                <Card title="User Management">
                     <Table<User>
                        columns={userColumns}
                        data={workspaceUsers}
                        renderActions={(user) => {
                            const userRole = workspace.members[user.id]?.role;
                            
                            if (currentUserRole !== 'owner' || user.id === currentUser.id || userRole === 'owner') {
                                return null;
                            }
                            return (
                               <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleRemoveUser(user.id)}>
                                   Remove
                               </Button>
                            );
                        }}
                    />
                </Card>
            )}

            {activeTab === 'features' && (
                <Card title="Feature Management">
                    <p className="mb-4 text-gray-600">
                        Enable modules for the workspace, then select which roles can access them.
                    </p>
                    <div className="space-y-4">
                        {ALL_FEATURES.map(feature => {
                            const permission = workspace.featurePermissions[feature];
                            return (
                                <div key={feature} className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800 text-lg">{feature}</span>
                                        <ToggleSwitch 
                                            isEnabled={permission.enabled}
                                            onToggle={(isEnabled) => onUpdateFeaturePermissions(feature, { ...permission, enabled: isEnabled })}
                                        />
                                    </div>
                                    <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 ${!permission.enabled ? 'opacity-50' : ''}`}>
                                        {ALL_ROLES.map(role => (
                                            <label key={role} className="flex items-center space-x-2 text-sm">
                                                <input 
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                    checked={permission.allowedRoles.includes(role)}
                                                    onChange={(e) => handleRolePermissionChange(feature, role, e.target.checked)}
                                                    disabled={!permission.enabled}
                                                />
                                                <span>{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}
            
            {activeTab === 'data' && (
                <Card title="Workspace Data" className="border-blue-500 border-2">
                     <p className="mb-4 text-gray-600">
                        Export a full backup of all your workspace data, including plots, financials, tasks, and more, into a single JSON file.
                    </p>
                    <Button variant="secondary" onClick={handleExportData}>Export All Data as JSON</Button>
                </Card>
            )}

            {activeTab === 'danger' && (
                 <Card title="🚨 Danger Zone" className="border-red-500 border-2">
                     <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-red-700">Delete this workspace</h4>
                            <p className="text-sm text-gray-600">Once you delete a workspace, there is no going back. Please be certain.</p>
                        </div>
                        <Button variant="danger" onClick={handleDeleteWorkspaceClick}>Delete Workspace</Button>
                     </div>
                </Card>
            )}
        </div>
    );
};
