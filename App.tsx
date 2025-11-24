
import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { CreateWorkspacePage } from './components/auth/CreateWorkspacePage';
import { MainApp } from './components/MainApp';
import { SuperAdminPanel } from './components/super-admin/SuperAdminPanel';
import { ImpersonationBanner } from './components/shared/ImpersonationBanner';
import type { User, Workspace, Role, Feature, FeaturePermission } from './types';
import { ALL_ROLES, ALL_FEATURES } from './types';
import { seedFirestoreData } from './services/seedFirestoreData';
import { useAuth } from './hooks/useAuth';
import { useFirestoreUsers } from './hooks/useFirestoreUsers';
import { signUp, signIn, signInWithGoogle, logout } from './services/authService';
import { setDocument, getDocument, queryCollection } from './services/firestoreService';

const SUPER_ADMIN_PASSWORD = 'superadmin';

// Mock user and workspace data for demonstration purposes
const getMockUser = (email: string, name: string): User => ({ id: `user_${email}`, email, name });
const createMockWorkspace = (name: string, owner: User): Workspace => {
    const wsId = `ws_${Date.now()}`;
    return {
        id: wsId,
        name,
        members: { [owner.id]: { role: 'owner' } },
        featurePermissions: {
            'Dashboard': { enabled: true, allowedRoles: [...ALL_ROLES] },
            'Operations': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager', 'Field Officer'] },
            'Financials': { enabled: true, allowedRoles: ['owner', 'Accountant', 'Farm Manager', 'Office Manager'] },
            'HR': { enabled: true, allowedRoles: ['owner', 'PeopleHR', 'Farm Manager', 'Office Manager'] },
            'Inventory': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] },
            'Plots & Seasons': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] },
            'AEO': { enabled: true, allowedRoles: ['owner', 'Agr_iEx_Off'] },
            'AI Insights': { enabled: true, allowedRoles: ['owner', 'Farm Manager'] },
            'Admin': { enabled: true, allowedRoles: ['owner'] },
            'Suppliers': { enabled: true, allowedRoles: [...ALL_ROLES] },
            'Harvest & Sales': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] },
            'How To': { enabled: true, allowedRoles: [...ALL_ROLES] },
            'FAQ': { enabled: true, allowedRoles: [...ALL_ROLES] },
        }
    };
};

const App: React.FC = () => {
    const { user: firebaseUser, loading } = useAuth();
    const allUsers = useFirestoreUsers();
    const [user, setUser] = useState<User | null>(null);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
    const [impersonatedWorkspace, setImpersonatedWorkspace] = useState<Workspace | null>(null);

    useEffect(() => {
        // Skip this effect if we're in impersonation mode
        if (impersonatedUser) {
            return;
        }

        if (!firebaseUser) {
            setUser(null);
            setWorkspace(null);
            setAllWorkspaces([]);
            return;
        }

        const loadUserData = async () => {
            const userData = await getDocument<User>('users', firebaseUser.uid);
            if (userData) {
                setUser(userData);

                const workspaces = await queryCollection<Workspace>('workspaces', `members.${firebaseUser.uid}`, '!=', null);

                // Migrate workspaces to add missing feature permissions
                const migratedWorkspaces = await Promise.all(workspaces.map(async (ws) => {
                    let needsUpdate = false;
                    const updatedPermissions = { ...ws.featurePermissions };

                    // Check if any features are missing from featurePermissions
                    ALL_FEATURES.forEach(feature => {
                        if (!updatedPermissions[feature]) {
                            needsUpdate = true;
                            // Add default permissions for missing features
                            if (feature === 'Suppliers' || feature === 'How To' || feature === 'FAQ') {
                                updatedPermissions[feature] = { enabled: true, allowedRoles: [...ALL_ROLES] };
                            } else if (feature === 'Harvest & Sales') {
                                updatedPermissions[feature] = { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] };
                            }
                        }
                    });

                    // Update workspace in Firestore if needed
                    if (needsUpdate) {
                        const updatedWorkspace = { ...ws, featurePermissions: updatedPermissions };
                        await setDocument('workspaces', ws.id, updatedWorkspace);
                        return updatedWorkspace;
                    }
                    return ws;
                }));

                setAllWorkspaces(migratedWorkspaces);

                if (migratedWorkspaces.length > 0) {
                    setWorkspace(migratedWorkspaces[0]);
                }
            }
        };
        loadUserData();
    }, [firebaseUser, impersonatedUser]);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setWorkspace(null);
        setIsSuperAdmin(false);
        setImpersonatedUser(null);
        setImpersonatedWorkspace(null);
    };

    const handleSuperAdminLogin = (password: string): boolean => {
        if (password === SUPER_ADMIN_PASSWORD) {
            setIsSuperAdmin(true);
            return true;
        }
        return false;
    };

    const handleImpersonateUser = (impUser: User, impWorkspace: Workspace) => {
        setImpersonatedUser(impUser);
        setImpersonatedWorkspace(impWorkspace);
        setUser(impUser);
        setWorkspace(impWorkspace);
        setIsSuperAdmin(false);
    };

    const handleExitImpersonation = () => {
        setImpersonatedUser(null);
        setImpersonatedWorkspace(null);
        setUser(null);
        setWorkspace(null);
        setIsSuperAdmin(true);
    };

    const handleCreateAccount = async (name: string, email: string, password: string) => {
        try {
            const userCredential = await signUp(email, password);
            await setDocument('users', userCredential.user.uid, { email, name });
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };
    
    const handleJoinWorkspace = async (name: string, email: string, password: string, workspaceId: string) => {
        try {
            const userCredential = await signUp(email, password);
            await setDocument('users', userCredential.user.uid, { email, name });
            
            const wsData = await getDocument<Workspace>('workspaces', workspaceId);
            if (!wsData) {
                alert('Workspace not found.');
                return false;
            }
            wsData.members[userCredential.user.uid] = { role: 'member' };
            await setDocument('workspaces', workspaceId, wsData);
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            await signIn(email, password);
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };

    const handleGoogleLogin = async (workspaceId?: string) => {
        try {
            const userCredential = await signInWithGoogle();
            const userData = await getDocument<User>('users', userCredential.user.uid);
            
            if (!userData) {
                await setDocument('users', userCredential.user.uid, {
                    email: userCredential.user.email,
                    name: userCredential.user.displayName || 'User'
                });
            }
            
            if (workspaceId) {
                const wsData = await getDocument<Workspace>('workspaces', workspaceId);
                if (!wsData) {
                    alert('Workspace not found.');
                    return;
                }
                wsData.members[userCredential.user.uid] = { role: 'member' };
                await setDocument('workspaces', workspaceId, wsData);
            }
        } catch (error: any) {
            alert(error.message);
        }
    };


    const handleCreateWorkspace = async (workspaceName: string) => {
        if (!firebaseUser) return;
        const newWorkspace = createMockWorkspace(workspaceName, { id: firebaseUser.uid, email: firebaseUser.email!, name: user?.name || '' });
        await setDocument('workspaces', newWorkspace.id, newWorkspace);
        await seedFirestoreData(newWorkspace.id);
        setAllWorkspaces([...allWorkspaces, newWorkspace]);
        setWorkspace(newWorkspace);
    };

    const handleRemoveUserFromWorkspace = async (userId: string) => {
        if (!workspace) return;
        const newMembers = { ...workspace.members };
        delete newMembers[userId];
        const updatedWorkspace = { ...workspace, members: newMembers };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };

    const handleUpdateUserRole = async (userId: string, newRole: Role) => {
        if (!workspace) return;
        const owners = Object.keys(workspace.members).filter(id => workspace.members[id].role === 'owner');
        if (owners.length === 1 && owners[0] === userId && newRole !== 'owner') {
            alert('Cannot demote the last owner of the workspace.');
            return;
        }
        const newMembers = { ...workspace.members };
        if (newMembers[userId]) {
            newMembers[userId].role = newRole;
        }
        const updatedWorkspace = { ...workspace, members: newMembers };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };
    
    const handleUpdateFeaturePermissions = async (feature: Feature, newPermission: FeaturePermission) => {
        if (!workspace) return;
        const updatedWorkspace = {
            ...workspace,
            featurePermissions: {
                ...workspace.featurePermissions,
                [feature]: newPermission,
            },
        };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };


    const handleDeleteWorkspace = async () => {
        if (!workspace) return;
        await handleLogout();
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Super Admin Panel
    if (isSuperAdmin) {
        return <SuperAdminPanel onLogout={handleLogout} onImpersonateUser={handleImpersonateUser} />;
    }

    // Auth Page
    if (!user) {
        return <AuthPage
            onCreateAccount={handleCreateAccount}
            onJoinWorkspace={handleJoinWorkspace}
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onSuperAdminLogin={handleSuperAdminLogin}
        />;
    }

    // Check if user is suspended
    if (user.status === 'suspended') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h1 className="text-3xl font-bold text-red-600">Account Suspended</h1>
                <p className="text-gray-700 mt-2">Your account has been suspended by the platform administrator.</p>
                <p className="text-gray-600 mt-1 text-sm">Please contact support for more information.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Logout
                </button>
            </div>
        );
    }

    // Create Workspace Page
    if (!workspace) {
        return <CreateWorkspacePage user={user} onCreateWorkspace={handleCreateWorkspace} />;
    }

    // Check if workspace is suspended
    if (workspace.status === 'suspended') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h1 className="text-3xl font-bold text-red-600">Workspace Suspended</h1>
                <p className="text-gray-700 mt-2">This workspace has been suspended by the platform administrator.</p>
                <p className="text-gray-600 mt-1 text-sm">Please contact support for more information.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Logout
                </button>
            </div>
        );
    }

    // Main App
    return (
        <MainApp
            user={user}
            initialWorkspace={workspace}
            onLogout={handleLogout}
            allUsers={allUsers}
            onRemoveUser={handleRemoveUserFromWorkspace}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteWorkspace={handleDeleteWorkspace}
            onUpdateFeaturePermissions={handleUpdateFeaturePermissions}
            impersonatingUser={impersonatedUser}
            onExitImpersonation={handleExitImpersonation}
        />
    );
};

export default App;
