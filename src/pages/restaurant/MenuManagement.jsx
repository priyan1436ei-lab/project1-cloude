import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getItems } from "../../services/db";
import { 
  fetchFoodItems, createFoodItem, updateFoodItem, deleteFoodItem, fetchCategories 
} from "../../services/restaurantService";
import { uploadImage } from "../../services/storageService";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Utensils } from "lucide-react";

export function MenuManagement() {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null); // null if adding
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [savingItem, setSavingItem] = useState(false);

  // Fetch restaurant and categories
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const rests = await getItems("restaurants", [{ field: "ownerId", operator: "==", value: currentUser.uid }]);
        if (rests.length > 0) {
          setRestaurant(rests[0]);
          const cats = await fetchCategories(rests[0].id);
          setCategories(cats);
          
          const items = await fetchFoodItems(rests[0].id);
          setFoodItems(items);
        }
      } catch (err) {
        console.error("Error loading restaurant menu data:", err);
        setError("Failed to load restaurant details or categories.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const loadMenu = async (restId) => {
    try {
      const items = await fetchFoodItems(restId);
      setFoodItems(items);
    } catch (err) {
      console.error("Error refreshing menu:", err);
    }
  };

  const handleOpenAddForm = () => {
    setIsEditing(true);
    setEditItemId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
    setIsAvailable(true);
    setImageFile(null);
    setError("");
  };

  const handleOpenEditForm = (item) => {
    setIsEditing(true);
    setEditItemId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId);
    setIsAvailable(item.isAvailable);
    setImageFile(null);
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      setError("Please fill in name, price, and category.");
      return;
    }
    setError("");
    setSuccess("");
    setSavingItem(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `food_items/${restaurant.id}_${Date.now()}`);
      }

      const itemPayload = {
        restaurantId: restaurant.id,
        categoryId,
        name,
        description,
        price: parseFloat(price),
        isAvailable
      };

      if (imageUrl) {
        itemPayload.imageUrl = imageUrl;
      }

      if (editItemId) {
        await updateFoodItem(editItemId, itemPayload);
        setSuccess("Food item updated successfully!");
      } else {
        if (!imageUrl) {
          // Default placeholder
          itemPayload.imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60";
        }
        await createFoodItem(itemPayload);
        setSuccess("New food item created successfully!");
      }

      setIsEditing(false);
      await loadMenu(restaurant.id);
    } catch (err) {
      setError(err.message || "Failed to save food item.");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    setError("");
    setSuccess("");
    try {
      await deleteFoodItem(itemId);
      setSuccess("Food item deleted.");
      await loadMenu(restaurant.id);
    } catch (err) {
      setError("Could not delete menu item.");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await updateFoodItem(item.id, { isAvailable: !item.isAvailable });
      await loadMenu(restaurant.id);
    } catch (err) {
      console.error("Availability toggle failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <p className="text-gray-500">Please configure your restaurant details in the Dashboard first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu Items Management</h2>
          <p className="text-xs text-gray-500">Create, edit, or delete items on your catalog.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Food Item
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
          {success}
        </div>
      )}

      {/* Item Creation / Modification Panel */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Utensils className="h-5 w-5 text-indigo-600" /> {editItemId ? "Edit Menu Item" : "Create New Menu Item"}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Item Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Garlic Parmesan Breadsticks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Food Category</label>
                <select 
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {categories.length === 0 && (
                    <option value="">-- No Categories Found --</option>
                  )}
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Banner Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-indigo-400"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Description</label>
                <textarea 
                  rows="2"
                  placeholder="Ingredients, sizes, notes, options..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="accent-indigo-600 h-4 w-4"
                />
                <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mark as Available for Order
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-gray-50 dark:border-gray-800 pt-3">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={savingItem}
                className="flex items-center gap-1 px-4.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/10"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingItem ? "Saving..." : "Save Item"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Listing Grid */}
      {foodItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400">
          No food items added to this restaurant catalog yet. Click "Add Food Item" above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map(item => (
            <div 
              key={item.id}
              className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                item.isAvailable 
                  ? "border-gray-100 dark:border-gray-800" 
                  : "border-dashed border-gray-250 dark:border-gray-850 opacity-60"
              }`}
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"} 
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                      Unavailable
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-snug line-clamp-1">{item.name}</h3>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">${item.price.toFixed(2)}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-850 text-gray-500 dark:text-gray-450 text-[10px] font-semibold capitalize">
                    {categories.find(c => c.id === item.categoryId)?.name || "Uncategorized"}
                  </span>
                  <p className="text-xs text-gray-450 dark:text-gray-500 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-50 dark:border-gray-850 flex justify-between gap-2">
                <button 
                  onClick={() => handleToggleAvailability(item)}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 flex-grow justify-center transition-colors ${
                    item.isAvailable
                      ? "border-gray-100 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                      : "border-indigo-100 bg-indigo-50/20 text-indigo-600 hover:bg-indigo-100/30 dark:border-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-950/20"
                  }`}
                  aria-label="Toggle availability"
                >
                  {item.isAvailable ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Enable</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEditForm(item)}
                    className="p-2 rounded-lg border border-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/30 dark:border-gray-850 dark:text-gray-450 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors"
                    aria-label="Edit Item"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50/30 dark:border-gray-850 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                    aria-label="Delete Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MenuManagement;
