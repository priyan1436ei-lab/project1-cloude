import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, isFirebaseEnabled } from "../config/firebase";
import { getItem, setItem, getItems } from "./db";

// --- Mock Session Keys ---
const CURRENT_USER_KEY = "food_delivery_current_user";

// --- Unified Authentication Service ---

export const loginUser = async (email, password) => {
  if (isFirebaseEnabled) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } else {
    const users = JSON.parse(localStorage.getItem("food_delivery_users")) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("auth/user-not-found: No user found with this email.");
    }
    // Simplification for mini project: accept 'password123' or any password for mock accounts
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("mock_auth_change"));
    return user;
  }
};

export const registerUser = async (email, password, extraData) => {
  if (isFirebaseEnabled) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userDoc = {
      uid,
      email,
      name: extraData.name,
      phone: extraData.phone || "",
      role: extraData.role || "customer",
      addresses: [],
      createdAt: new Date().toISOString()
    };
    await setItem("users", uid, userDoc);
    return cred.user;
  } else {
    const users = JSON.parse(localStorage.getItem("food_delivery_users")) || [];
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("auth/email-already-in-use: Email already registered.");
    }

    const uid = `user-${Math.random().toString(36).substr(2, 9)}`;
    const userDoc = {
      uid,
      email,
      name: extraData.name,
      phone: extraData.phone || "",
      role: extraData.role || "customer",
      addresses: [],
      createdAt: new Date().toISOString()
    };

    users.push(userDoc);
    localStorage.setItem("food_delivery_users", JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userDoc));
    
    // Seed delivery agents table if the registered user is a delivery agent
    if (extraData.role === "delivery_agent") {
      const agents = JSON.parse(localStorage.getItem("food_delivery_deliveryAgents")) || [];
      agents.push({
        agentId: uid,
        uid,
        name: extraData.name,
        phone: extraData.phone || "",
        vehicleNumber: extraData.vehicleNumber || "MOTO-MOCK",
        isActive: true,
        currentOrderId: null,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("food_delivery_deliveryAgents", JSON.stringify(agents));
    }

    window.dispatchEvent(new CustomEvent("mock_auth_change"));
    return userDoc;
  }
};

export const logoutUser = async () => {
  if (isFirebaseEnabled) {
    await signOut(auth);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent("mock_auth_change"));
  }
};

export const subscribeToAuth = (onChanged) => {
  if (isFirebaseEnabled) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user document to read role
        const userDoc = await getItem("users", firebaseUser.uid);
        onChanged(userDoc || { uid: firebaseUser.uid, email: firebaseUser.email, role: "customer" });
      } else {
        onChanged(null);
      }
    });
  } else {
    const handler = () => {
      const curUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
      onChanged(curUser);
    };

    window.addEventListener("mock_auth_change", handler);
    // Initial execution
    handler();

    return () => {
      window.removeEventListener("mock_auth_change", handler);
    };
  }
};
