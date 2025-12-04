
import React, { useState } from 'react';
import type { FarmDataContextType, Account, JournalEntry, User } from '../types';
import { Card } from '@/components/shared/Card';
import { Table } from '@/components/shared/Table';
import { Button } from '@/components/shared/Button';
import { AccountModal } from './AccountModal';
import { JournalEntryDialog } from './JournalEntryDialog';
import { ImportJournalEntriesModal } from './ImportJournalEntriesModal';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';
import { IncomeStatement } from './IncomeStatement';
import { BalanceSheet } from './BalanceSheet';
import { TrialBalance } from './TrialBalance';
import { ProfitabilityReport } from './ProfitabilityReport';
import { ExpenseByCategoryReport } from './ExpenseByCategoryReport';
import { Projections } from './Projections';

type FinancialView = 'Journal' | 'Accounts' | 'Income Statement' | 'Balance Sheet' | 'Trial Balance' | 'Profitability' | 'Expense Report' | 'Projections';

export const Financials: React.FC<{ farmData: FarmDataContextType; user: User }> = ({ farmData, user }) => {
    const { 
        accounts, 
        journalEntries, 
        plots, 
        seasons,
        addAccount,
        updateAccount,
        deleteAccount,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addMultipleJournalEntries,
    } = farmData;

    const [currentView, setCurrentView] = useState<FinancialView>('Journal');
    
    // Modals state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Account Handlers
    const handleOpenAddAccount = () => {
        setEditingAccount(null);
        setIsAccountModalOpen(true);
    };

    const handleOpenEditAccount = (account: Account) => {
        setEditingAccount(account);
        setIsAccountModalOpen(true);
    };

    const handleAccountSubmit = (accountData: Omit<Account, 'id'> | Account) => {
        if ('id' in accountData) {
            updateAccount(accountData);
        } else {
            addAccount(accountData);
        }
        setIsAccountModalOpen(false);
    };

    const handleDeleteAccount = (id: string) => {
        if (window.confirm('Are you sure you want to delete this account? associated data might be affected.')) {
            deleteAccount(id);
        }
    };

    // Journal Entry Handlers
    const handleOpenAddEntry = () => {
        setEditingEntry(null);
        setIsEntryModalOpen(true);
    };

    const handleOpenEditEntry = (entry: JournalEntry) => {
        setEditingEntry(entry);
        setIsEntryModalOpen(true);
    };

    const handleEntrySubmit = (entryData: Omit<JournalEntry, 'id'> | JournalEntry) => {
        if ('id' in entryData) {
            updateJournalEntry(entryData);
        } else {
            addJournalEntry(entryData);
        }
        setIsEntryModalOpen(false);
    };

    const handleDeleteEntry = (id: string) => {
        if (window.confirm('Are you sure you want to delete this journal entry?')) {
            deleteJournalEntry(id);
        }
    };

    const handleImportEntries = (entries: Omit<JournalEntry, 'id'>[]) => {
        addMultipleJournalEntries(entries);
        setIsImportModalOpen(false);
    };

    // Columns
    const accountColumns = [
        { header: 'Name', accessor: 'name' as keyof Account },
        { header: 'Type', accessor: 'type' as keyof Account },
        { header: 'Currency', accessor: 'currency' as keyof Account },
        { header: 'Initial Balance', accessor: (acc: Account) => formatCurrency(acc.initialBalance, acc.currency) },
    ];

    const journalColumns = [
        { header: 'Date', accessor: 'date' as keyof JournalEntry },
        { header: 'Description', accessor: 'description' as keyof JournalEntry },
        { header: 'Category', accessor: 'category' as keyof JournalEntry },
        { 
            header: 'Amount', 
            accessor: (entry: JournalEntry) => {
                const total = entry.lines.reduce((sum, line) => line.type === 'debit' ? sum + line.amount : sum, 0);
                return formatCurrency(total, entry.currency);
            } 
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'Accounts':
                return (
                    <Card title="Chart of Accounts">
                        <div className="flex justify-end mb-4">
                            <Button onClick={handleOpenAddAccount}>Add Account</Button>
                        </div>
                        <Table<Account>
                            columns={accountColumns}
                            data={accounts}
                            renderActions={(account) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditAccount(account)}>Edit</Button>
                                    <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteAccount(account.id)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                );
            case 'Journal':
                return (
                    <Card title="General Journal">
                        <div className="flex justify-end mb-4 space-x-2">
                            <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>Import Entries</Button>
                            <Button onClick={handleOpenAddEntry}>New Entry</Button>
                        </div>
                        <Table<JournalEntry>
                            columns={journalColumns}
                            data={journalEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                            renderActions={(entry) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditEntry(entry)}>Edit</Button>
                                    <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteEntry(entry.id)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                );
            case 'Income Statement':
                return <IncomeStatement farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Balance Sheet':
                return <BalanceSheet farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Trial Balance':
                return <TrialBalance farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Profitability':
                return <ProfitabilityReport farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Expense Report':
                return <ExpenseByCategoryReport farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Projections':
                return <Projections farmData={farmData} currency={DEFAULT_CURRENCY} />;
            default:
                return null;
        }
    };

    const views: FinancialView[] = ['Journal', 'Accounts', 'Income Statement', 'Balance Sheet', 'Trial Balance', 'Profitability', 'Expense Report', 'Projections'];

    return (
        <>
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSubmit={handleAccountSubmit}
                initialData={editingAccount}
            />
            <JournalEntryDialog
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSubmit={handleEntrySubmit}
                initialData={editingEntry}
                accounts={accounts}
                plots={plots}
                seasons={seasons}
            />
            <ImportJournalEntriesModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportEntries}
                accounts={accounts}
                plots={plots}
                seasons={seasons}
            />

            <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    {views.map(view => (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentView === view 
                                    ? 'bg-green-600 text-white shadow-sm' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
                {renderContent()}
            </div>
        </>
    );
};
