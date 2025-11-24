import React, { useState, useMemo, useEffect } from 'react';
import type { User, Workspace, Feature, Role, FeaturePermission, Task } from '../types';
import { ALL_FEATURES } from '../types';
import { useFarmDataFirestore } from '../hooks/useFarmDataFirestore';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Operations } from './Operations';
import { Financials } from './Financials';
import { HR } from './HR';
import { Inventory } from './Inventory';
import { PlotsAndSeasons } from './PlotsAndSeasons';
import { AEO } from './AEO';
import { AIInsights } from './AIInsights';
import { Admin } from './Admin';
import { Suppliers } from './Suppliers';
import { HarvestAndSales } from './HarvestAndSales';
import { HowToPage } from './HowToPage';
import { FAQPage } from './FAQPage';
import { ProfileModal } from './ProfileModal';
import { Avatar } from './shared/Avatar';
import { TaskDetailModal } from './TaskDetailModal';
import { ImpersonationBanner } from './shared/ImpersonationBanner';

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface MainAppProps {
    user: User;
    initialWorkspace: Workspace;
    onLogout: () => Promise<void>;
    allUsers: User[];
    onRemoveUser: (userId: string) => Promise<void>;
    onUpdateUserRole: (userId: string, newRole: Role) => Promise<void>;
    onDeleteWorkspace: () => Promise<void>;
    onUpdateFeaturePermissions: (feature: Feature, permission: FeaturePermission) => Promise<void>;
    impersonatingUser?: User | null;
    onExitImpersonation?: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({
    user,
    initialWorkspace,
    onLogout,
    allUsers,
    onRemoveUser,
    onUpdateUserRole,
    onDeleteWorkspace,
    onUpdateFeaturePermissions,
    impersonatingUser,
    onExitImpersonation
}) => {
    const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
    const [currentView, setCurrentView] = useState<Feature>('Dashboard');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const farmData = useFarmDataFirestore(workspace.id);

    useEffect(() => {
        setWorkspace(initialWorkspace);
    }, [initialWorkspace]);

    const workspaceUsers = useMemo(() => {
        return allUsers.filter(u => workspace.members[u.id]);
    }, [allUsers, workspace.members]);
    
    const currentUserRole = workspace.members[user.id]?.role;

    const enabledFeatures = useMemo(() => {
        if (!currentUserRole) return [];
        return ALL_FEATURES.filter(f => {
            const permission = workspace.featurePermissions[f];
            return permission && permission.enabled && permission.allowedRoles.includes(currentUserRole);
        });
    }, [workspace.featurePermissions, currentUserRole]);

    useEffect(() => {
        if (!enabledFeatures.includes(currentView)) {
            setCurrentView('Dashboard');
        }
    }, [enabledFeatures, currentView]);

    const renderContent = () => {
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard farmData={farmData} user={user} />;
            case 'Operations':
                return <Operations farmData={farmData} user={user} workspaceUsers={workspaceUsers} onSelectTask={setSelectedTask} />;
            case 'Financials':
                return <Financials farmData={farmData} />;
            case 'HR':
                return <HR farmData={farmData} />;
            case 'Inventory':
                return <Inventory farmData={farmData} />;
            case 'Plots & Seasons':
                return <PlotsAndSeasons farmData={farmData} />;
            case 'AEO':
                return <AEO farmData={farmData} />;
            case 'AI Insights':
                return <AIInsights farmData={farmData} />;
            case 'Admin':
                return <Admin
                    workspace={workspace}
                    workspaceUsers={workspaceUsers}
                    onUpdateFeaturePermissions={onUpdateFeaturePermissions}
                    onRemoveUser={onRemoveUser}
                    onDeleteWorkspace={onDeleteWorkspace}
                    onUpdateUserRole={onUpdateUserRole}
                    currentUser={user}
                />;
            case 'Suppliers':
                return <Suppliers farmData={farmData} user={user} />;
            case 'Harvest & Sales':
                return <HarvestAndSales farmData={farmData} user={user} />;
            case 'How To':
                return <HowToPage />;
            case 'FAQ':
                return <FAQPage />;
            default:
                return <Dashboard farmData={farmData} user={user} />;
        }
    };
    
    return (
        <>
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={farmData.updateTask}
                    onAddTaskComment={farmData.addTaskComment}
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
                        setIsSidebarOpen(false);
                    }}
                    features={enabledFeatures}
                    workspaceName={workspace.name}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    {impersonatingUser && onExitImpersonation && (
                        <ImpersonationBanner userName={impersonatingUser.name} onExit={onExitImpersonation} />
                    )}
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
}