
import { db } from '../config/firebase';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { AccountType } from '../types';

export const seedFirestoreData = async (workspaceId: string) => {
  const batch = writeBatch(db);
  const workspaceRef = doc(db, 'workspaces', workspaceId);

  // Initial Accounts
  const accounts = [
    { name: 'Cash at Bank', type: AccountType.Asset, initialBalance: 50000, currency: 'GHS' },
    { name: 'Accounts Receivable', type: AccountType.Asset, initialBalance: 0, currency: 'GHS' },
    { name: 'Farm Equipment', type: AccountType.Asset, initialBalance: 25000, currency: 'GHS' },
    { name: 'Land', type: AccountType.Asset, initialBalance: 100000, currency: 'GHS' },
    { name: 'Accounts Payable', type: AccountType.Liability, initialBalance: 5000, currency: 'GHS' },
    { name: 'Owner\'s Equity', type: AccountType.Equity, initialBalance: 170000, currency: 'GHS' },
    { name: 'Crop Sales', type: AccountType.Income, initialBalance: 0, currency: 'GHS' },
    { name: 'Seed Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
    { name: 'Fertilizer Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
    { name: 'Labor Wages', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
  ];

  accounts.forEach((acc, i) => {
    const id = `acc_seed_${i}`;
    const ref = doc(collection(workspaceRef, 'accounts'), id);
    batch.set(ref, { ...acc, id });
  });

  // Initial Plots
  const plots = [
    { name: 'North Field', crop: 'Maize', area: 50, soilType: 'Loam' },
    { name: 'West Valley', crop: 'Soybean', area: 75, soilType: 'Clay Loam' },
  ];

  plots.forEach((plot, i) => {
    const id = `plot_seed_${i}`;
    const ref = doc(collection(workspaceRef, 'plots'), id);
    batch.set(ref, { ...plot, id });
  });

  // Initial Seasons
  const currentYear = new Date().getFullYear();
  const seasons = [
    { name: 'Main Season', year: currentYear },
    { name: 'Minor Season', year: currentYear },
  ];

  seasons.forEach((season, i) => {
    const id = `season_seed_${i}`;
    const ref = doc(collection(workspaceRef, 'seasons'), id);
    batch.set(ref, { ...season, id });
  });

  await batch.commit();
};
