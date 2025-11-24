
// Enums
export enum TaskStatus {
    ToDo = 'To-Do',
    InProgress = 'In Progress',
    Blocked = 'Blocked',
    Done = 'Done',
}

export enum AccountType {
    Asset = 'Asset',
    Liability = 'Liability',
    Equity = 'Equity',
    Income = 'Income',
    Expense = 'Expense',
}

// Core Data Structures
export interface Plot {
    id: string;
    name: string;
    crop: string;
    area: number;
    soilType: string;
}

export interface Season {
    id: string;
    name: string;
    year: number;
}

export interface Comment {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
}

export interface InventoryConsumption {
    inventoryId: string;
    quantityUsed: number;
}

export interface Task {
    id:string;
    title: string;
    description: string;
    plotId: string;
    assigneeId: string;
    dueDate: string;
    status: TaskStatus;
    cost: number;
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    createdAt: string;
    comments: Comment[];
    reminderDate?: string;
    inventoryConsumed?: InventoryConsumption[];
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    initialBalance: number;
    currency: string;
}

export interface JournalEntryLine {
    accountId: string;
    type: 'debit' | 'credit';
    amount: number;
    plotId?: string;
    seasonId?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    description: string;
    lines: JournalEntryLine[];
    category?: string;
    currency: string;
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    payRate: number;
    contact: string;
}

export interface Timesheet {
    id: string;
    employeeId: string;
    date: string;
    hoursWorked: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Seeds' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Other';
    quantity: number;
    unit: string;
    supplier: string;
    purchaseDate: string;
    costPerUnit: number;
    reorderPoint?: number;
}

// AEO (Agricultural Extension Officer) specific types
export interface Farmer {
    id: string;
    name: string;
    location: string;
    contact: string;
    farmSize: number;
    crops: string[];
    notes: string;
}

export interface Interaction {
    id: string;
    farmerId: string;
    date: string;
    type: 'Visit' | 'Call' | 'Meeting' | 'Training';
    summary: string;
    aeoId: string;
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}


// User & Workspace
export interface User {
    id: string;
    name: string;
    email: string;
    status?: 'active' | 'suspended';
}

export const ALL_ROLES = [
    'owner', 
    'member', 
    'Office Manager', 
    'Accountant', 
    'PeopleHR', 
    'Agr_iEx_Off', 
    'Field Manager', 
    'Farm Manager', 
    'Field Officer'
] as const;
export type Role = typeof ALL_ROLES[number];


export const ALL_FEATURES = [
    'Dashboard', 'Operations', 'Financials', 'HR', 'Inventory',
    'Plots & Seasons', 'AEO', 'AI Insights', 'Admin', 'Suppliers',
    'Harvest & Sales', 'How To', 'FAQ'
] as const;
export type Feature = typeof ALL_FEATURES[number];

export interface FeaturePermission {
    enabled: boolean;
    allowedRoles: Role[];
}

export interface WorkspaceMember {
    role: Role;
}

export interface Workspace {
    id: string;
    name: string;
    members: { [userId: string]: WorkspaceMember };
    featurePermissions: { [key in Feature]: FeaturePermission };
    status?: 'active' | 'suspended';
    ownerId?: string;
    createdAt?: string;
}

// Super Admin types
export type SuperAdminView = 'Dashboard' | 'Workspaces' | 'Users' | 'Configuration' | 'Audit Log';

export interface PlatformConfig {
    featureFlags: {
        [key in Feature]?: { enabled: boolean };
    };
    defaultPermissions: { [key in Feature]: FeaturePermission };
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    superAdminId: string;
    action: string;
    details: string;
}

// Farm Data Context
export interface FarmDataContextType {
    plots: Plot[];
    seasons: Season[];
    tasks: Task[];
    accounts: Account[];
    journalEntries: JournalEntry[];
    employees: Employee[];
    timesheets: Timesheet[];
    inventory: InventoryItem[];
    farmers: Farmer[];
    kbArticles: KnowledgeBaseArticle[];
    interactions: Interaction[];
    suppliers: Supplier[];
    harvests: Harvest[];
    sales: Sale[];
    customers: Customer[];

    // Mutators
    addPlot: (plot: Omit<Plot, 'id'>) => void;
    updatePlot: (plot: Plot) => void;
    deletePlot: (plotId: string) => void;

    addSeason: (season: Omit<Season, 'id'>) => void;
    updateSeason: (season: Season) => void;
    deleteSeason: (seasonId: string) => void;

    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
    updateTask: (task: Task) => void;
    addTaskComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

    addAccount: (account: Omit<Account, 'id'>) => void;
    updateAccount: (account: Account) => void;
    deleteAccount: (accountId: string) => void;

    addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
    updateJournalEntry: (entry: JournalEntry) => void;
    deleteJournalEntry: (entryId: string) => void;
    addMultipleJournalEntries: (entries: Omit<JournalEntry, 'id'>[]) => void;

    addEmployee: (employee: Omit<Employee, 'id'>) => void;

    addTimesheet: (timesheet: Omit<Timesheet, 'id'>) => void;
    updateTimesheet: (timesheet: Timesheet) => void;
    deleteTimesheet: (timesheetId: string) => void;

    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    
    addFarmer: (farmer: Omit<Farmer, 'id'>) => void;
    updateFarmer: (farmer: Farmer) => void;
    deleteFarmer: (farmerId: string) => void;

    addInteraction: (interaction: Omit<Interaction, 'id'>) => void;
    
    addKBArticle: (article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateKBArticle: (article: KnowledgeBaseArticle) => void;
    deleteKBArticle: (articleId: string) => void;

    addSupplier: (supplier: Omit<Supplier, 'id'>, createdBy: string) => void;
    updateSupplier: (supplier: Supplier, updatedBy: string) => void;
    deleteSupplier: (supplierId: string, deletedBy: string, supplierName: string) => void;

    addHarvest: (harvest: Omit<Harvest, 'id' | 'quantityRemaining'>, createdBy: string) => void;

    addSale: (sale: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>, createdBy: string) => void;

    addCustomer: (customer: Omit<Customer, 'id'>, createdBy: string) => void;
    updateCustomer: (customer: Customer, updatedBy: string) => void;
    deleteCustomer: (customerId: string, deletedBy: string, customerName: string) => void;
}
