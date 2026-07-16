import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getItems } from "../../services/db";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../services/restaurantService";
import { Plus, Edit2, Trash2, Save, X, ListCollapse } from "lucide-react";

export function CategoryManagement() {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [editCatId, setEditCatId] = useState(null); // null if adding
  const [savingCat, setSavingCat] = useState(false);

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
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories or restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const loadCats = async (restId) => {
    try {
      const cats = await fetchCategories(restId);
      setCategories(cats);
    } catch (err) {
      console.error("Error refreshing categories:", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setError("");
    setSuccess("");
    setSavingCat(true);

    try {
      if (editCatId) {
        await updateCategory(editCatId, { name });
        setSuccess("Category updated successfully!");
      } else {
        await createCategory({
          restaurantId: restaurant.id,
          name
        });
        setSuccess("New category created successfully!");
      }
      setName("");
      setEditCatId(null);
      await loadCats(restaurant.id);
    } catch (err) {
      setError("Failed to save category.");
    } finally {
      setSavingCat(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setEditCatId(cat.id);
    setName(cat.name);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditCatId(null);
    setName("");
    setError("");
  };

  const handleDelete = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category? (Food items associated with this category will remain, but their category label might be cleared).")) return;
    setError("");
    setSuccess("");

    try {
      await deleteCategory(catId);
      setSuccess("Category deleted.");
      await loadCats(restaurant.id);
    } catch (err) {
      setError("Could not delete category.");
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
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
        <p className="text-xs text-gray-500">Manage categories to organize food menu items.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Create/Edit Form (Left Side) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
            <ListCollapse className="h-5 w-5 text-indigo-600" />
            <span>{editCatId ? "Edit Category" : "New Category"}</span>
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">Category Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Pasta, Beverages"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex gap-2">
              {editCatId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="px-3 py-2 rounded-lg border border-gray-250 text-gray-650 text-xs hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 font-semibold"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button 
                type="submit" 
                disabled={savingCat}
                className="w-full flex items-center justify-center gap-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                {editCatId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                <span>{savingCat ? "Saving..." : editCatId ? "Update" : "Add Category"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Categories List Table (Right Side) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3">Active Food Categories</h3>
          
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No food categories configured.</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-850">
              {categories.map(cat => (
                <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                  <span className="font-bold text-sm tracking-tight capitalize">{cat.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-lg border border-gray-100 text-gray-450 hover:text-indigo-600 hover:bg-indigo-50/20 dark:border-gray-850 dark:text-gray-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors"
                      aria-label="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50/20 dark:border-gray-850 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                      aria-label="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export default CategoryManagement;
