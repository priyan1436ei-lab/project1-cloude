import { getItem, setItem, updateItem } from "./db";

export const fetchUserProfile = async (uid) => {
  return await getItem("users", uid);
};

export const updateUserProfile = async (uid, profileData) => {
  return await updateItem("users", uid, profileData);
};

export const addUserAddress = async (uid, newAddress) => {
  const user = await fetchUserProfile(uid);
  if (!user) throw new Error("User profile not found");

  const addresses = [...(user.addresses || [])];
  const addressId = `addr-${Math.random().toString(36).substr(2, 9)}`;
  
  addresses.push({
    id: addressId,
    ...newAddress
  });

  await updateItem("users", uid, { addresses });
  return addressId;
};

export const removeUserAddress = async (uid, addressId) => {
  const user = await fetchUserProfile(uid);
  if (!user) throw new Error("User profile not found");

  const addresses = (user.addresses || []).filter(addr => addr.id !== addressId);
  await updateItem("users", uid, { addresses });
};
