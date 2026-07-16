import { 
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy 
} from "firebase/firestore";
import { db, isFirebaseEnabled } from "../config/firebase";
import * as mockData from "../config/mockData";

// --- Seed LocalStorage Demo Database ---
const LOCAL_PREFIX = "food_delivery_";

function initDemoDatabase() {
  if (localStorage.getItem(`${LOCAL_PREFIX}seeded`)) return;

  localStorage.setItem(`${LOCAL_PREFIX}users`, JSON.stringify(mockData.MOCK_USERS));
  localStorage.setItem(`${LOCAL_PREFIX}restaurants`, JSON.stringify(mockData.MOCK_RESTAURANTS));
  localStorage.setItem(`${LOCAL_PREFIX}categories`, JSON.stringify(mockData.MOCK_CATEGORIES));
  localStorage.setItem(`${LOCAL_PREFIX}foodItems`, JSON.stringify(mockData.MOCK_FOOD_ITEMS));
  localStorage.setItem(`${LOCAL_PREFIX}orders`, JSON.stringify(mockData.MOCK_ORDERS));
  localStorage.setItem(`${LOCAL_PREFIX}deliveryAgents`, JSON.stringify(mockData.MOCK_DELIVERY_AGENTS));
  
  localStorage.setItem(`${LOCAL_PREFIX}seeded`, "true");
}

if (!isFirebaseEnabled) {
  initDemoDatabase();
}

// --- Helper Functions for Mock DB ---
const getMockTable = (table) => {
  return JSON.parse(localStorage.getItem(`${LOCAL_PREFIX}${table}`)) || [];
};

const saveMockTable = (table, data) => {
  localStorage.setItem(`${LOCAL_PREFIX}${table}`, JSON.stringify(data));
  // Dispatch custom event to simulate real-time updates in same window
  window.dispatchEvent(new CustomEvent(`mock_db_update_${table}`));
};

// --- Unified Database Services ---

export const getItems = async (collectionName, filters = []) => {
  if (isFirebaseEnabled) {
    let q = collection(db, collectionName);
    filters.forEach(f => {
      // f is { field, operator, value }
      q = query(q, where(f.field, f.operator, f.value));
    });
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    let data = getMockTable(collectionName);
    filters.forEach(f => {
      const { field, operator, value } = f;
      data = data.filter(item => {
        const itemVal = item[field];
        if (operator === "==") return itemVal === value;
        if (operator === "!=") return itemVal !== value;
        if (operator === "array-contains") return Array.isArray(itemVal) && itemVal.includes(value);
        if (operator === "in") return Array.isArray(value) && value.includes(itemVal);
        return true;
      });
    });
    return data;
  }
};

export const getItem = async (collectionName, docId) => {
  if (isFirebaseEnabled) {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } else {
    const data = getMockTable(collectionName);
    return data.find(item => item.id === docId || item.uid === docId || item.agentId === docId) || null;
  }
};

export const setItem = async (collectionName, docId, data) => {
  if (isFirebaseEnabled) {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
    return { id: docId, ...data };
  } else {
    const items = getMockTable(collectionName);
    const index = items.findIndex(item => item.id === docId || item.uid === docId || item.agentId === docId);
    
    const updatedData = { ...data, updatedAt: new Date().toISOString() };
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedData };
    } else {
      updatedData.id = docId;
      updatedData.createdAt = new Date().toISOString();
      items.push(updatedData);
    }
    saveMockTable(collectionName, items);
    return updatedData;
  }
};

export const addItem = async (collectionName, data) => {
  if (isFirebaseEnabled) {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  } else {
    const items = getMockTable(collectionName);
    const newId = `${collectionName.slice(0, 4)}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    saveMockTable(collectionName, items);
    return newItem;
  }
};

export const updateItem = async (collectionName, docId, data) => {
  if (isFirebaseEnabled) {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { id: docId, ...data };
  } else {
    const items = getMockTable(collectionName);
    const index = items.findIndex(item => item.id === docId || item.uid === docId || item.agentId === docId);
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
      saveMockTable(collectionName, items);
      return items[index];
    }
    throw new Error(`Document with ID ${docId} not found in mock ${collectionName}`);
  }
};

export const deleteItem = async (collectionName, docId) => {
  if (isFirebaseEnabled) {
    await deleteDoc(doc(db, collectionName, docId));
  } else {
    const items = getMockTable(collectionName);
    const filtered = items.filter(item => item.id !== docId && item.uid !== docId && item.agentId !== docId);
    saveMockTable(collectionName, filtered);
  }
};

// --- Realtime Subscriptions ---

export const subscribeToDoc = (collectionName, docId, onUpdate) => {
  if (isFirebaseEnabled) {
    return onSnapshot(doc(db, collectionName, docId), (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        onUpdate(null);
      }
    });
  } else {
    const handler = () => {
      getItem(collectionName, docId).then(onUpdate);
    };
    
    // Listen for updates
    window.addEventListener(`mock_db_update_${collectionName}`, handler);
    // Initial call
    handler();
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(`mock_db_update_${collectionName}`, handler);
    };
  }
};

export const subscribeToCollection = (collectionName, filters = [], onUpdate) => {
  if (isFirebaseEnabled) {
    let q = collection(db, collectionName);
    filters.forEach(f => {
      q = query(q, where(f.field, f.operator, f.value));
    });
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onUpdate(items);
    });
  } else {
    const handler = () => {
      getItems(collectionName, filters).then(onUpdate);
    };
    
    window.addEventListener(`mock_db_update_${collectionName}`, handler);
    handler();
    
    return () => {
      window.removeEventListener(`mock_db_update_${collectionName}`, handler);
    };
  }
};
