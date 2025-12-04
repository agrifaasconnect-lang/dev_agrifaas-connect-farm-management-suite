
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

export const ALL_FARMER_STATUSES = ['Active', 'Inactive', 'Pending'] as const;
export type FarmerStatus = typeof ALL_FARMER_STATUSES[number];

export const ALL_COMM_CHANNELS = ['Phone', 'SMS', 'WhatsApp', 'Email', 'Visit'] as const;
export const ALL_PHONE_TYPES = ['Feature Phone', 'Smartphone', 'None'] as const;
export const ALL_TENURE_TYPES = ['Owned', 'Leased', 'Rented', 'Sharecropping'] as const;
export const ALL_WATER_SOURCES = ['Rainfed', 'Irrigation', 'River/Stream', 'Well/Borehole'] as const;
export const ALL_GENDERS = ['Male', 'Female', 'Other'] as const;
export const ALL_CREDIT_HISTORIES = ['None', 'Good', 'Bad', 'No Record'] as const;

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
    supplierId?: string;
    purchaseDate: string;
    costPerUnit: number;
    reorderPoint?: number;
    currency?: string;
}

// AEO (Agricultural Extension Officer) specific types
export interface Farmer {
    id: string;
    name: string;
    contact: string;
    location: string;
    address?: string;
    status?: FarmerStatus;
    farmSize: number;
    landSize?: number; // Alias for farmSize
    crops: string[];
    cropPortfolio?: string[]; // Alias for crops
    notes: string;
    gpsCoordinates?: string;
    tenure?: string;
    waterSource?: string;
    livestock?: string[];
    equipment?: string[];
    certifications?: string[];
    hasBankAccount?: boolean;
    hasMobileMoney?: boolean;
    creditHistory?: string;
    preferredMarket?: string;
    age?: number;
    gender?: string;
    educationLevel?: string;
    phoneType?: string;
    preferredChannel?: string;
    offFarmIncome?: boolean;
    fieldDescription?: string;
    laborForceSize?: number;
    photoUrl?: string;
}

export interface Interaction {
    id: string;
    farmerId: string;
    date: string;
    type: 'Visit' | 'Call' | 'Meeting' | 'Training';
    summary: string;
    notes?: string; // Alias for summary
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

// New Types
export interface Supplier {
    id: string;
    name: string;
    contact: string;
    category: string;
}

export interface Customer {
    id: string;
    name: string;
    contact: string;
    type: 'Individual' | 'Commercial';
}

export interface Harvest {
    id: string;
    plotId: string;
    crop: string;
    date: string;
    quantity: number;
    unit: string;
    quality: 'A' | 'B' | 'C';
}

export interface Sale {
    id: string;
    customerId: string;
    date: string;
    items: { name: string, quantity: number, unitPrice: number, total: number }[];
    totalAmount: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
}


// User & Workspace
export interface User {
    id: string;
    name: string;
    email: string;
    status?: 'active' | 'suspended';
    contact?: string;
    currentWorkspaceId?: string;
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
    'Dashboard', 
    'Operations', 
    'Financials', 
    'HR', 
    'Inventory', 
    'Plots & Seasons', 
    'AEO', 
    'AI Insights', 
    'Admin',
    'Suppliers',
    'Harvest & Sales',
    'How To',
    'FAQ'
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
    logoUrl?: string;
    members: { [userId: string]: WorkspaceMember };
    featurePermissions: { [key in Feature]: FeaturePermission };
    permissions?: { [key in Feature]: FeaturePermission }; // Alias for featurePermissions
    status?: 'active' | 'suspended';
    ownerId?: string;
    createdAt?: string;
    pendingInvitations?: string[];
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
    customers: Customer[];
    harvests: Harvest[];
    sales: Sale[];
    activityLog: AuditLogEntry[];

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
    updateInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (id: string) => void;
    
    addFarmer: (farmer: Omit<Farmer, 'id'>) => void;
    updateFarmer: (farmer: Farmer) => void;
    deleteFarmer: (farmerId: string) => void;

    addInteraction: (interaction: Omit<Interaction, 'id'>) => void;
    
    addKBArticle: (article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateKBArticle: (article: KnowledgeBaseArticle) => void;
    deleteKBArticle: (articleId: string) => void;
    
    addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (id: string) => void;
    
    addCustomer: (customer: Omit<Customer, 'id'>) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;
    
    addHarvest: (harvest: Omit<Harvest, 'id'>) => void;
    updateHarvest: (harvest: Harvest) => void;
    deleteHarvest: (id: string) => void;
    
    addSale: (sale: Omit<Sale, 'id'>) => void;
    updateSale: (sale: Sale) => void;
    deleteSale: (id: string) => void;
}