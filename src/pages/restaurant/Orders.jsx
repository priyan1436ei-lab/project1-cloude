import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getItems } from "../../services/db";
import { subscribeToRestaurantOrders, updateOrderStatus } from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import { ClipboardList, Check, Play, ShoppingBag, X, User, Phone, MapPin, Truck } from "lucide-react";

export function Orders() {
  const { currentUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("new"); // new | preparing | ready | history

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
        console.error("Error loading restaurant profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRest();
  }, [currentUser]);

  useEffect(() => {
    if (!restaurant?.id) return;

    const unsubscribe = subscribeToRestaurantOrders(restaurant.id, (data) => {
      setOrders(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restaurant]);

  const handleUpdateStatus = async (orderId, newStatus, note = "") => {
    try {
      await updateOrderStatus(orderId, newStatus, note);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Filter orders by tab
  const getFilteredOrders = () => {
    switch (activeTab) {
      case "new":
        return orders.filter(o => o.status === "placed");
      case "preparing":
        return orders.filter(o => o.status === "accepted" || o.status === "preparing");
      case "ready":
        return orders.filter(o => o.status === "ready_for_pickup");
      case "history":
        return orders.filter(o => ["picked_up", "on_the_way", "delivered", "cancelled"].includes(o.status));
      default:
        return [];
    }
  };

  const getTabCount = (tabName) => {
    switch (tabName) {
      case "new":
        return orders.filter(o => o.status === "placed").length;
      case "preparing":
        return orders.filter(o => o.status === "accepted" || o.status === "preparing").length;
      case "ready":
        return orders.filter(o => o.status === "ready_for_pickup").length;
      default:
        return 0;
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

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Active Orders Board</h2>
        <p className="text-xs text-gray-500">Manage orders incoming from customer clients live.</p>
      </div>

      {/* Columns / Tabs controls */}
      <div className="flex items-center gap-2 border-b border-gray-150 dark:border-gray-800 pb-px overflow-x-auto scrollbar-none">
        {[
          { key: "new", label: "Incoming Placed", badge: true },
          { key: "preparing", label: "Preparing in Kitchen", badge: true },
          { key: "ready", label: "Ready for Agent", badge: true },
          { key: "history", label: "Order History", badge: false }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 shrink-0 ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.badge && getTabCount(tab.key) > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white animate-pulse">
                {getTabCount(tab.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List Container */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400">
          No orders found in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <div 
              key={order.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Order Meta Header */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider block">ORDER ID</span>
                  <span className="font-mono text-xs font-bold">{order.id}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Order content */}
              <div className="p-5 flex-grow space-y-4">
                
                {/* User details */}
                <div className="flex items-start gap-2.5 text-xs">
                  <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="text-left leading-normal">
                    <p className="font-bold text-sm tracking-tight capitalize">{order.customerName}</p>
                    <p className="text-gray-500 dark:text-gray-400">{order.customerPhone}</p>
                    <div className="flex items-start gap-1 text-[10px] text-gray-400 mt-1">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress.details}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t border-gray-50 dark:border-gray-850 pt-3 space-y-2 text-xs">
                  <span className="text-[10px] text-gray-450 dark:text-gray-500 font-extrabold uppercase tracking-wider block">Dish Details</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span className="text-gray-600 dark:text-gray-400">{item.name} x{item.quantity}</span>
                        <span className="text-gray-950 dark:text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t border-gray-50 dark:border-gray-850 text-gray-900 dark:text-white">
                    <span>COD Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Agent details */}
                {order.assignedDeliveryAgentId && (
                  <div className="border-t border-gray-50 dark:border-gray-850 pt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>Rider: <strong>{order.assignedDeliveryAgentName}</strong></span>
                  </div>
                )}

              </div>

              {/* Action Buttons depending on status */}
              <div className="p-4 bg-gray-50/30 dark:bg-gray-950/10 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                {order.status === "placed" && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "cancelled", "Cancelled by restaurant.")}
                      className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, "accepted", "Restaurant accepted your order. Starting prep.")}
                      className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept Order
                    </button>
                  </>
                )}

                {order.status === "accepted" && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, "preparing", "Chef is in the kitchen preparing the food.")}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" /> Start Preparing
                  </button>
                )}

                {order.status === "preparing" && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, "ready_for_pickup", "Food is ready for pickup. Waiting for agent assignment.")}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark Ready for Pickup
                  </button>
                )}

                {order.status === "ready_for_pickup" && (
                  <div className="w-full py-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl font-bold select-none">
                    Waiting for Delivery Rider Claim
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Orders;
