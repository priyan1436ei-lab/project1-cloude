import { getItems, addItem, updateItem, deleteItem, setItem } from "./db";

// --- Restaurants ---
export const fetchRestaurants = async () => {
  return await getItems("restaurants", [{ field: "isActive", operator: "==", value: true }]);
};

export const fetchRestaurantById = async (id) => {
  const rest = await getItems("restaurants");
  return rest.find(r => r.id === id);
};

export const createRestaurant = async (restData) => {
  return await addItem("restaurants", {
    ...restData,
    isActive: true
  });
};

export const updateRestaurant = async (id, restData) => {
  return await updateItem("restaurants", id, restData);
};

// --- Categories ---
export const fetchCategories = async (restaurantId) => {
  return await getItems("categories", [{ field: "restaurantId", operator: "==", value: restaurantId }]);
};

export const createCategory = async (catData) => {
  return await addItem("categories", {
    ...catData,
    isActive: true
  });
};

export const updateCategory = async (id, catData) => {
  return await updateItem("categories", id, catData);
};

export const deleteCategory = async (id) => {
  return await deleteItem("categories", id);
};

// --- Food Items ---
export const fetchFoodItems = async (restaurantId) => {
  return await getItems("foodItems", [{ field: "restaurantId", operator: "==", value: restaurantId }]);
};

export const fetchAllAvailableFoodItems = async () => {
  return await getItems("foodItems", [{ field: "isAvailable", operator: "==", value: true }]);
};

export const createFoodItem = async (itemData) => {
  return await addItem("foodItems", {
    ...itemData,
    price: parseFloat(itemData.price),
    isAvailable: itemData.isAvailable !== undefined ? itemData.isAvailable : true
  });
};

export const updateFoodItem = async (id, itemData) => {
  const payload = { ...itemData };
  if (itemData.price !== undefined) {
    payload.price = parseFloat(itemData.price);
  }
  return await updateItem("foodItems", id, payload);
};

export const deleteFoodItem = async (id) => {
  return await deleteItem("foodItems", id);
};
