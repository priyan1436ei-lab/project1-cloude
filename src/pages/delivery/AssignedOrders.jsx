import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  subscribeToUnassignedOrders, 
  subscribeToAgentOrders, 
  assignDeliveryAgent, 
  updateOrderStatus 
} from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import { ClipboardList, Navigation, Check, User, Phone, MapPin, Truck, HelpCircle, Store } from "lucide-react";

export function AssignedOrders() {
  const { currentUser } = useAuth();
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    // Subscribe to available orders awaiting pickup
    const unsubUnassigned = subscribeToUnassignedOrders((data) => {
      setUnassignedOrders(data);
      setLoading(false);
    });

    // Subscribe to orders assigned to this agent
    const unsubMy = subscribeToAgentOrders(currentUser.uid, (data) => {
      setMyOrders(data);
      setLoading(false);
    });

    return () => {
      if (unsubUnassigned) unsubUnassigned();
      if (unsubMy) unsubMy();
    };
  }, [currentUser]);

  // Claim an available order
  const handleClaimOrder = async (orderId) => {
    try {
      // Assign agent
      await assignDeliveryAgent(orderId, currentUser.uid, currentUser.name);
      // Automatically advance status to 'picked_up'
      await updateOrderStatus(orderId, "picked_up", `Agent ${currentUser.name} has claimed the task and is picking up the food.`);
    } catch (err) {
      alert("Failed to claim order. It may have been claimed by another rider.");
    }
  };

  // Progress active order status
  const handleUpdateStatus = async (orderId, newStatus, note = "") => {
    try {
      await updateOrderStatus(orderId, newStatus, note);
    } catch (err) {
      alert("Failed to update delivery status.");
    }
  };

  // Separate my assigned orders: active vs history
  const activeTask = myOrders.find(o => ["picked_up", "on_the_way"].includes(o.status));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Delivery Tasks Panel</h2>
        <p className="text-xs text-gray-500">Claim available tasks or update active delivery progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Active Task (Main Focus) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b border-gray-50 dark:border-gray-850 pb-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <span>Active Delivery Job</span>
          </h3>

          {activeTask ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-4">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block">ORDER ID</span>
                  <span className="font-mono text-xs font-bold">{activeTask.id}</span>
                </div>
                <StatusBadge status={activeTask.status} />
              </div>

              {/* Delivery Node Details */}
              <div className="space-y-4">
                
                {/* Node 1: Restaurant Pickup */}
                <div className="flex gap-3 text-xs">
                  <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Pickup Restaurant</span>
                    <p className="text-sm font-bold leading-tight">{activeTask.restaurantName}</p>
                    {/* Add location details if we fetch or keep simplified */}
                    <p className="text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup Food Items here</p>
                  </div>
                </div>

                {/* Node 2: Customer Address */}
                <div className="flex gap-3 text-xs border-t border-gray-50 dark:border-gray-850 pt-4">
                  <div className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Deliver To</span>
                    <p className="text-sm font-bold leading-tight capitalize">{activeTask.customerName}</p>
                    <p className="text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeTask.deliveryAddress.details}</p>
                    <p className="text-gray-400 font-semibold flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> Call: {activeTask.customerPhone}</p>
                  </div>
                </div>

                {/* Node 3: Billing details */}
                <div className="flex gap-3 text-xs border-t border-gray-50 dark:border-gray-850 pt-4">
                  <div className="h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    $
                  </div>
                  <div className="text-left space-y-1 w-full">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Payment Details</span>
                    <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 dark:text-white pt-0.5">
                      <span>Collect Cash (COD):</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-base">${activeTask.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Progress workflow buttons */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-5 flex flex-col sm:flex-row gap-3">
                {activeTask.status === "picked_up" && (
                  <button
                    onClick={() => handleUpdateStatus(activeTask.id, "on_the_way", `Rider ${currentUser.name} is on the way with your food.`)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    <Navigation className="h-4 w-4 animate-bounce" /> Start Heading to Customer (On The Way)
                  </button>
                )}

                {activeTask.status === "on_the_way" && (
                  <button
                    onClick={() => handleUpdateStatus(activeTask.id, "delivered", `Rider ${currentUser.name} delivered the order successfully. Collected $${activeTask.totalAmount}.`)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Mark Order as Delivered & Collected Cash
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl text-gray-500 dark:text-gray-400 text-sm">
              You do not have any active delivery jobs. Select an available job from the sidebar on the right!
            </div>
          )}
        </div>

        {/* Right Column: Available orders list to claim */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg border-b border-gray-50 dark:border-gray-850 pb-2">
            Available Jobs ({unassignedOrders.length})
          </h3>

          {unassignedOrders.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 text-xs">
              No orders ready for pickup. Available jobs appear here when restaurant owners mark preparing orders as "Ready".
            </div>
          ) : (
            <div className="space-y-4">
              {unassignedOrders.map(order => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{order.id}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30 uppercase tracking-wide">Ready</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-left text-gray-600 dark:text-gray-400 leading-normal">
                    <p className="flex items-center gap-1"><Store className="h-3.5 w-3.5 text-gray-400 shrink-0" /> Pickup: <strong className="text-gray-900 dark:text-white truncate">{order.restaurantName}</strong></p>
                    <p className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" /> Dropoff: <span className="truncate">{order.deliveryAddress.details}</span></p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 pt-1 text-sm">Value: ${order.totalAmount.toFixed(2)} (COD)</p>
                  </div>
                  
                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    disabled={activeTask !== undefined}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTask
                        ? "bg-gray-150 text-gray-400 dark:bg-gray-950 dark:text-gray-650 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                  >
                    {activeTask ? "Claim Disabled (Finish Active Job)" : "Claim & Pick Up"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export default AssignedOrders;
