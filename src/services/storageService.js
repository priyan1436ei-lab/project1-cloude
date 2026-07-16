import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseEnabled } from "../config/firebase";

/**
 * Uploads a file to Firebase Storage or returns a Base64 string for Local Demo Mode
 * @param {File} file The file to upload
 * @param {string} path Target path in storage (e.g., 'restaurants/logo.jpg')
 * @returns {Promise<string>} Download URL or Base64 string representation
 */
export const uploadImage = async (file, path) => {
  if (!file) return null;

  if (isFirebaseEnabled && storage) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Storage upload failed, fallback to base64:", error);
    }
  }

  // Demo mode fallback: Read file as Base64 string so it renders in browser
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};
