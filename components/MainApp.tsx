import React, { useState, useMemo } from 'react';
import type { User, Workspace, Feature, Task, Role } from '../types';
import { useFarmData } from '../hooks/useFarmData';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Operations } from './Operations';
import { Financials } from './Financials';
import { HR } from './HR';
import { Inventory } from './Inventory';
import { AEO } from './AEO';
import { AIInsights } from './AIInsights';
import { Admin } from './Admin';
import { PlotsAndSeasons } from './PlotsAndSeasons';
import { Suppliers } from './Suppliers';
import { HarvestAndSales } from './HarvestAndSales';
import { HowToPage } from './HowToPage';
import { FAQPage } from './FAQPage';
import { TaskDetailModal } from './TaskDetailModal';
import { ProfileModal } from './ProfileModal';
import { Avatar } from './shared/Avatar';
import { ImpersonationBanner } from './shared/ImpersonationBanner';


interface MainAppProps {
    user: User;
    workspace: Workspace;
    allUsers: User[];
    onLogout: () => void;
    impersonatingUser: User | null;
    onExitImpersonation: () => void;
    onInviteUser: (workspaceId: string, email: string, role: Role) => void;
    onRevokeInvitation: (workspaceId: string, email: string) => void;
    onUpdateFeaturePermissions: (workspaceId: string, newPermissions: Workspace['permissions']) => void;
    onExportWorkspaceData: (workspaceId: string) => void;
    onUpdateUserRole: (workspaceId: string, userId: string, role: Role) => void;
    onUpdateUser: (user: User) => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const MainApp: React.FC<MainAppProps> = ({ 
    user, 
    workspace, 
    allUsers, 
    onLogout, 
    impersonatingUser, 
    onExitImpersonation,
    onInviteUser,
    onRevokeInvitation,
    onUpdateFeaturePermissions,
    onExportWorkspaceData,
    onUpdateUserRole,
    onUpdateUser
}) => {
    const [currentView, setCurrentView] = useState<Feature>('Dashboard');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const farmData = useFarmData(workspace.id);

    const workspaceUsers = useMemo(() => {
        const memberIds = Object.keys(workspace.members);
        return allUsers.filter(u => memberIds.includes(u.id));
    }, [workspace.members, allUsers]);
    
    const currentUserRole = workspace.members[user.id]?.role || 'member';

    const enabledFeatures = useMemo(() => {
        const platformPermissions = (Object.keys(workspace.permissions) as Feature[]).filter(
            f => workspace.permissions[f]?.enabled && workspace.permissions[f]?.allowedRoles.includes(currentUserRole)
        );
        // Ensure Admin is always available to owners
        if (currentUserRole === 'owner' && !platformPermissions.includes('Admin')) {
            platformPermissions.push('Admin');
        }
        return platformPermissions;
    }, [workspace.permissions, currentUserRole]);


    const renderContent = () => {
        if (!enabledFeatures.includes(currentView)) {
            return (
                 <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-gray-700">Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view the "{currentView}" feature.</p>
                </div>
            );
        }
        
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard farmData={farmData} user={user} />;
            case 'Operations':
                return <Operations farmData={farmData} user={user} workspaceUsers={workspaceUsers} onSelectTask={setSelectedTask} />;
            case 'Financials':
                return <Financials farmData={farmData} user={user} />;
            case 'HR':
                return <HR farmData={farmData} user={user} />;
            case 'Inventory':
                return <Inventory farmData={farmData} user={user} />;
            case 'Plots & Seasons':
                return <PlotsAndSeasons farmData={farmData} user={user} />;
            case 'AEO':
                return <AEO farmData={farmData} user={user} />;
            case 'AI Insights':
                return <AIInsights farmData={farmData} />;
            case 'Suppliers':
                return <Suppliers farmData={farmData} user={user} />;
            case 'Harvest & Sales':
                return <HarvestAndSales farmData={farmData} user={user} />;
            case 'How To':
                return <HowToPage />;
            case 'FAQ':
                return <FAQPage />;
            case 'Admin':
                return <Admin 
                    workspace={workspace}
                    workspaceUsers={workspaceUsers}
                    farmData={farmData}
                    onInviteUser={onInviteUser}
                    onRevokeInvitation={onRevokeInvitation}
                    onUpdateFeaturePermissions={onUpdateFeaturePermissions}
                    onExportWorkspaceData={onExportWorkspaceData}
                    onUpdateUserRole={onUpdateUserRole}
                />;
            default:
                return <div>Select a feature</div>;
        }
    };

    return (
        <>
            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={(task) => farmData.updateTask(task, user.name)}
                    onAddTaskComment={(taskId, comment) => farmData.addTaskComment(taskId, comment, user.name)}
                    allUsers={workspaceUsers}
                    allPlots={farmData.plots}
                    inventory={farmData.inventory}
                    currentUser={user}
                />
            )}
            <ProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
                user={user} 
                onLogout={onLogout} 
                onUpdateUser={onUpdateUser}
            />
            
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar
                    currentView={currentView}
                    onSetView={(view) => {
                        setCurrentView(view);
                        setIsSidebarOpen(false); // Close sidebar on mobile navigation
                    }}
                    features={enabledFeatures}
                    workspaceName={workspace.name}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    {impersonatingUser && <ImpersonationBanner userName={impersonatingUser.name} onExit={onExitImpersonation} />}
                    <header className="flex justify-between items-center p-4 bg-white border-b">
                         <div className="flex items-center space-x-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden" aria-label="Open sidebar">
                                <MenuIcon className="h-6 w-6" />
                            </button>
                             <h1 className="text-2xl font-semibold text-gray-800">{currentView}</h1>
                         </div>
                         <div className="flex items-center space-x-4">
                             <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-2">
                                 <span className="hidden sm:inline text-right">
                                     <span className="font-semibold text-gray-700">{user.name}</span>
                                     <span className="block text-xs text-gray-500 capitalize">{currentUserRole}</span>
                                 </span>
                                 <Avatar name={user.name} />
                             </button>
                         </div>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </>
    );
};