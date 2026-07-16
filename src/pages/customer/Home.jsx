import { useState, useEffect } from "react";
import { fetchRestaurants, fetchCategories, fetchFoodItems } from "../../services/restaurantService";
import { useCart } from "../../contexts/CartContext";
import { Search, MapPin, Phone, ArrowLeft, Plus, Check } from "lucide-react";

export function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const rests = await fetchRestaurants();
        setRestaurants(rests);
      } catch (err) {
        console.error("Error loading restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRestaurants();
  }, []);

  const handleSelectRestaurant = async (rest) => {
    setSelectedRest(rest);
    setLoading(true);
    try {
      const cats = await fetchCategories(rest.id);
      const items = await fetchFoodItems(rest.id);
      setCategories(cats);
      setFoodItems(items);
      setSelectedCategory("all");
      setSearchQuery("");
    } catch (err) {
      console.error("Error loading restaurant details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getQuantityInCart = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const filteredFoodItems = foodItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  const filteredRestaurants = restaurants.filter(rest => 
    rest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && restaurants.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Search Header for Restaurant Browsing or Menu Browsing */}
      <div className="relative rounded-2xl overflow-hidden bg-indigo-600 text-white p-8 sm:p-12 shadow-lg shadow-indigo-600/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-indigo-800 opacity-90"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {selectedRest ? selectedRest.name : "Hungry? Let's order delicious food!"}
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base">
            {selectedRest 
              ? selectedRest.description 
              : "Discover the best restaurants and top dishes in your neighborhood, delivered straight to your door."}
          </p>
          <div className="relative max-w-md mt-4">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={selectedRest ? "Search menu items..." : "Search restaurants..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-white/50 text-sm placeholder-gray-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* --- RESTAURANT LIST VIEW --- */}
      {!selectedRest ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Popular Restaurants</h2>
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No restaurants match your search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map(rest => (
                <div 
                  key={rest.id} 
                  onClick={() => handleSelectRestaurant(rest)}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-950/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img 
                      src={rest.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60"} 
                      alt={rest.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow space-y-3">
                    <h3 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {rest.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
                      {rest.description}
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-800 pt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{rest.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{rest.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* --- MENU VIEW --- */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedRest(null)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors shadow-sm"
              aria-label="Back to restaurants"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{selectedRest.name} Menu</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {selectedRest.location}
              </p>
            </div>
          </div>

          {/* Category Quick Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : filteredFoodItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No items available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFoodItems.map(item => {
                const qty = getQuantityInCart(item.id);
                return (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex hover:shadow-lg transition-all duration-300 h-40"
                  >
                    <div className="w-1/3 relative overflow-hidden bg-gray-100 shrink-0">
                      <img 
                        src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"} 
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div className="space-y-1">
                        <h3 className="font-bold text-base leading-snug line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${item.price.toFixed(2)}</span>
                        <button 
                          onClick={() => addToCart(item, selectedRest)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            qty > 0 
                              ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {qty > 0 ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Added ({qty})</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
export default Home;
