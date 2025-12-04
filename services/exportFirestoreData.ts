
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const exportFirestoreData = async (workspaceId: string, workspaceName: string) => {
  const collections = [
    'plots', 'seasons', 'tasks', 'accounts', 'journalEntries', 
    'employees', 'timesheets', 'inventory', 'farmers', 
    'kbArticles', 'interactions'
  ];

  const exportData: Record<string, any[]> = {};

  for (const colName of collections) {
    const snapshot = await getDocs(collection(db, `workspaces/${workspaceId}/${colName}`));
    exportData[colName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${workspaceName.replace(/\s+/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
