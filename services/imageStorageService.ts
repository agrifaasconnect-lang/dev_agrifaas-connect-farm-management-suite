
import { storage } from '../config/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const uploadPlantImage = async (base64Image: string): Promise<string> => {
  // Create a reference to 'plant-images/timestamp.jpg'
  const filename = `plant_diagnosis_${Date.now()}.jpg`;
  const storageRef = ref(storage, `plant-images/${filename}`);

  // Upload the base64 string
  // Note: The AIInsights component passes the base64 string without the data:image/ type prefix usually
  await uploadString(storageRef, base64Image, 'base64', { contentType: 'image/jpeg' });

  // Get the download URL
  const url = await getDownloadURL(storageRef);
  return url;
};

export const uploadWorkspaceLogo = async (base64Image: string): Promise<string> => {
  const filename = `workspace_logo_${Date.now()}.jpg`;
  const storageRef = ref(storage, `workspace-logos/${filename}`);
  await uploadString(storageRef, base64Image, 'base64', { contentType: 'image/jpeg' });
  return await getDownloadURL(storageRef);
};
