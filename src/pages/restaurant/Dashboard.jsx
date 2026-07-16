import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getItems, addItem } from "../../services/db";
import { subscribeToRestaurantOrders } from "../../services/orderService";
import { uploadImage } from "../../services/storageService";
import { DollarSign, ShoppingBag, TrendingUp, AlertCircle, Plus, MapPin, Store } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

export function Dashboard() {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restaurant Creation Form States
  const [restName, setRestName] = useState("");
  const [restDesc, setRestDesc] = useState("");
  const [restLoc, setRestLoc] = useState("");
  const [restPhone, setRestPhone] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [savingRest, setSavingRest] = useState(false);

  // Load restaurant profile
  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadRest = async () => {
      try {
        setLoading(true);
        const rests = await getItems("restaurants", [{ field: "ownerId", operator: "==", value: currentUser.uid }]);
        if (rests.length > 0) {
          setRestaurant(rests[0]);
        }
      } catch (err) {
        console.error("Error loading restaurant:", err);
        setError("Could not load restaurant profile.");
      } finally {
        setLoading(false);
      }
    };

    loadRest();
  }, [currentUser]);

  // Subscribe to orders if restaurant exists
  useEffect(() => {
    if (!restaurant?.id) return;

    const unsubscribe = subscribeToRestaurantOrders(restaurant.id, (data) => {
      setOrders(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurant]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!restName || !restLoc || !restPhone) {
      setError("Please fill in restaurant name, location and phone.");
      return;
    }
    setError("");
    setSavingRest(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `restaurants/${currentUser.uid}_logo`);
      }

      const restDoc = {
        ownerId: currentUser.uid,
        name: restName,
        description: restDesc,
        location: restLoc,
        phone: restPhone,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60",
        isActive: true
      };

      const newRest = await addItem("restaurants", restDoc);
      setRestaurant(newRest);
    } catch (err) {
      setError(err.message || "Failed to create restaurant profile.");
    } finally {
      setSavingRest(false);
    }
  };

  // Calculations for stats
  const completedOrders = orders.filter(o => o.status === "delivered");
  const activeOrdersCount = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;
  
  const totalSales = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const averageTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // --- RESTAURANT SETUP REQUIRED VIEW ---
  if (!restaurant) {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400">
            <Store className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Set Up Your Restaurant</h2>
          <p className="text-xs text-gray-500">Provide details to register your food outlet on the cloud.</p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Restaurant Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Pizza Corner" 
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Short Description</label>
              <textarea 
                rows="2"
                placeholder="Brief summary of your menu, cuisine types, details..." 
                value={restDesc}
                onChange={(e) => setRestDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Location / Address</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 12 Main St, Tech City" 
                value={restLoc}
                onChange={(e) => setRestLoc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Phone Number</label>
              <input 
                type="tel" 
                required 
                placeholder="Contact number" 
                value={restPhone}
                onChange={(e) => setRestPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">Restaurant Banner Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-indigo-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={savingRest}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center cursor-pointer"
          >
            {savingRest ? "Creating Profile..." : "Create Restaurant Profile"}
          </button>
        </form>
      </div>
    );
  }

  // --- STANDARD DASHBOARD VIEW ---
  return (
    <div className="space-y-6 text-left">
      {/* Restaurant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{restaurant.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
            <MapPin className="h-3.5 w-3.5" /> {restaurant.location} | Phone: {restaurant.phone}
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider shadow-sm">
          Outlet Dashboard
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Sales */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">${totalSales.toFixed(2)}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <DollarSign className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Metric 2: Completed Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completed Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{completedOrders.length}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Metric 3: Active Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeOrdersCount}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse">
            <AlertCircle className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Metric 4: Avg Ticket */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Average Ticket</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">${averageTicket.toFixed(2)}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 shrink-0">
            <TrendingUp className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-5">
        <h3 className="font-bold text-lg border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center justify-between">
          <span>Recent Sales Transactions</span>
          <span className="text-xs text-gray-450 dark:text-gray-500 font-medium">Auto Updates Realtime</span>
        </h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
            No sales records available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Items</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20">
                    <td className="py-3.5 px-2 font-mono text-xs">{order.id}</td>
                    <td className="py-3.5 px-2">
                      <p className="font-bold text-sm leading-tight">{order.customerName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-2 max-w-xs truncate">
                      {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-indigo-600 dark:text-indigo-400">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-2">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-2 text-right text-xs text-gray-450 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
export default Dashboard;
