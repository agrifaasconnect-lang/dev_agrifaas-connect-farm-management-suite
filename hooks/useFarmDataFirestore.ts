import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Plot, Season, Task, Account, JournalEntry, Employee, Timesheet, InventoryItem, Farmer, KnowledgeBaseArticle, FarmDataContextType, Interaction, Supplier, Harvest, Sale, Customer } from '../types';

export const useFarmDataFirestore = (workspaceId: string): FarmDataContextType => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, `workspaces/${workspaceId}/plots`), snap => setPlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plot)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/seasons`), snap => setSeasons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Season)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/tasks`), snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/accounts`), snap => setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Account)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/journalEntries`), snap => setJournalEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/employees`), snap => setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/timesheets`), snap => setTimesheets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Timesheet)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/inventory`), snap => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/farmers`), snap => setFarmers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Farmer)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/kbArticles`), snap => setKbArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeBaseArticle)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/interactions`), snap => setInteractions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Interaction)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/suppliers`), snap => setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/harvests`), snap => setHarvests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Harvest)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/sales`), snap => setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale)))),
      onSnapshot(collection(db, `workspaces/${workspaceId}/customers`), snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer))))
    ];
    return () => unsubscribers.forEach(u => u());
  }, [workspaceId]);

  const addPlot = useCallback((plot: Omit<Plot, 'id'>) => {
    const id = `plot_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/plots`, id), plot);
  }, [workspaceId]);

  const updatePlot = useCallback((plot: Plot) => updateDoc(doc(db, `workspaces/${workspaceId}/plots`, plot.id), plot as any), [workspaceId]);
  const deletePlot = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/plots`, id)), [workspaceId]);

  const addSeason = useCallback((season: Omit<Season, 'id'>) => {
    const id = `season_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/seasons`, id), season);
  }, [workspaceId]);

  const updateSeason = useCallback((season: Season) => updateDoc(doc(db, `workspaces/${workspaceId}/seasons`, season.id), season as any), [workspaceId]);
  const deleteSeason = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/seasons`, id)), [workspaceId]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    const id = `task_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/tasks`, id), { ...task, createdAt: new Date().toISOString(), comments: [] });
  }, [workspaceId]);

  const updateTask = useCallback((task: Task) => updateDoc(doc(db, `workspaces/${workspaceId}/tasks`, task.id), task as any), [workspaceId]);
  
  const addTaskComment = useCallback((taskId: string, comment: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateDoc(doc(db, `workspaces/${workspaceId}/tasks`, taskId), { comments: [...task.comments, { ...comment, id: `comment_${Date.now()}`, createdAt: new Date().toISOString() }] });
    }
  }, [workspaceId, tasks]);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    const id = `acc_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/accounts`, id), account);
  }, [workspaceId]);

  const updateAccount = useCallback((account: Account) => updateDoc(doc(db, `workspaces/${workspaceId}/accounts`, account.id), account as any), [workspaceId]);
  const deleteAccount = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/accounts`, id)), [workspaceId]);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const id = `je_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/journalEntries`, id), entry);
  }, [workspaceId]);

  const updateJournalEntry = useCallback((entry: JournalEntry) => updateDoc(doc(db, `workspaces/${workspaceId}/journalEntries`, entry.id), entry as any), [workspaceId]);
  const deleteJournalEntry = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/journalEntries`, id)), [workspaceId]);
  
  const addMultipleJournalEntries = useCallback((entries: Omit<JournalEntry, 'id'>[]) => {
    entries.forEach((entry, i) => {
      const id = `je_${Date.now()}_${i}`;
      setDoc(doc(db, `workspaces/${workspaceId}/journalEntries`, id), entry);
    });
  }, [workspaceId]);

  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const id = `emp_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/employees`, id), employee);
  }, [workspaceId]);

  const addTimesheet = useCallback((timesheet: Omit<Timesheet, 'id'>) => {
    const id = `ts_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/timesheets`, id), timesheet);
  }, [workspaceId]);

  const updateTimesheet = useCallback((timesheet: Timesheet) => updateDoc(doc(db, `workspaces/${workspaceId}/timesheets`, timesheet.id), timesheet as any), [workspaceId]);
  const deleteTimesheet = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/timesheets`, id)), [workspaceId]);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const id = `inv_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/inventory`, id), item);
  }, [workspaceId]);

  const addFarmer = useCallback((farmer: Omit<Farmer, 'id'>) => {
    const id = `farmer_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/farmers`, id), farmer);
  }, [workspaceId]);

  const updateFarmer = useCallback((farmer: Farmer) => updateDoc(doc(db, `workspaces/${workspaceId}/farmers`, farmer.id), farmer as any), [workspaceId]);
  const deleteFarmer = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/farmers`, id)), [workspaceId]);

  const addInteraction = useCallback((interaction: Omit<Interaction, 'id'>) => {
    const id = `interaction_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/interactions`, id), interaction);
  }, [workspaceId]);

  const addKBArticle = useCallback((article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `kb_${Date.now()}`;
    const now = new Date().toISOString();
    setDoc(doc(db, `workspaces/${workspaceId}/kbArticles`, id), { ...article, createdAt: now, updatedAt: now });
  }, [workspaceId]);

  const updateKBArticle = useCallback((article: KnowledgeBaseArticle) => {
    updateDoc(doc(db, `workspaces/${workspaceId}/kbArticles`, article.id), { ...article, updatedAt: new Date().toISOString() } as any);
  }, [workspaceId]);

  const deleteKBArticle = useCallback((id: string) => deleteDoc(doc(db, `workspaces/${workspaceId}/kbArticles`, id)), [workspaceId]);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>, createdBy: string) => {
    const id = `supplier_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/suppliers`, id), supplier);
  }, [workspaceId]);

  const updateSupplier = useCallback((supplier: Supplier, updatedBy: string) =>
    updateDoc(doc(db, `workspaces/${workspaceId}/suppliers`, supplier.id), supplier as any), [workspaceId]);

  const deleteSupplier = useCallback((id: string, deletedBy: string, supplierName: string) =>
    deleteDoc(doc(db, `workspaces/${workspaceId}/suppliers`, id)), [workspaceId]);

  const addHarvest = useCallback((harvest: Omit<Harvest, 'id' | 'quantityRemaining'>, createdBy: string) => {
    const id = `harvest_${Date.now()}`;
    const harvestWithRemaining = { ...harvest, quantityRemaining: harvest.quantity };
    setDoc(doc(db, `workspaces/${workspaceId}/harvests`, id), harvestWithRemaining);
  }, [workspaceId]);

  const addSale = useCallback(async (sale: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>, createdBy: string) => {
    const id = `sale_${Date.now()}`;
    const invoiceNumber = `INV-${Date.now()}`;

    // Save the sale
    await setDoc(doc(db, `workspaces/${workspaceId}/sales`, id), { ...sale, invoiceNumber });

    // Update harvest quantities
    for (const item of sale.items) {
      const harvestRef = doc(db, `workspaces/${workspaceId}/harvests`, item.harvestId);
      const harvestSnap = await getDoc(harvestRef);
      if (harvestSnap.exists()) {
        const harvestData = harvestSnap.data();
        const newQuantityRemaining = (harvestData.quantityRemaining || 0) - item.quantitySold;
        await updateDoc(harvestRef, { quantityRemaining: newQuantityRemaining });
      }
    }
  }, [workspaceId]);

  const addCustomer = useCallback((customer: Omit<Customer, 'id'>, createdBy: string) => {
    const id = `customer_${Date.now()}`;
    setDoc(doc(db, `workspaces/${workspaceId}/customers`, id), customer);
  }, [workspaceId]);

  const updateCustomer = useCallback((customer: Customer, updatedBy: string) =>
    updateDoc(doc(db, `workspaces/${workspaceId}/customers`, customer.id), customer as any), [workspaceId]);

  const deleteCustomer = useCallback((id: string, deletedBy: string, customerName: string) =>
    deleteDoc(doc(db, `workspaces/${workspaceId}/customers`, id)), [workspaceId]);

  return {
    plots, seasons, tasks, accounts, journalEntries, employees, timesheets, inventory, farmers, kbArticles, interactions,
    suppliers, harvests, sales, customers,
    addPlot, updatePlot, deletePlot,
    addSeason, updateSeason, deleteSeason,
    addTask, updateTask, addTaskComment,
    addAccount, updateAccount, deleteAccount,
    addJournalEntry, updateJournalEntry, deleteJournalEntry, addMultipleJournalEntries,
    addEmployee,
    addTimesheet, updateTimesheet, deleteTimesheet,
    addInventoryItem,
    addFarmer, updateFarmer, deleteFarmer,
    addInteraction,
    addKBArticle, updateKBArticle, deleteKBArticle,
    addSupplier, updateSupplier, deleteSupplier,
    addHarvest,
    addSale,
    addCustomer, updateCustomer, deleteCustomer
  };
};
