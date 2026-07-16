import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToAgentOrders } from "../../services/orderService";
import { Landmark, Calendar, Clock, DollarSign, Sparkles } from "lucide-react";

export function DeliveryHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeToAgentOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const completedDeliveries = orders.filter(o => o.status === "delivered");
  // Simulating delivery earnings: $3.99 delivery fee per delivery + 10% of order totals as tip/bonus
  const totalEarnings = completedDeliveries.reduce((acc, o) => acc + 3.99 + (o.totalAmount * 0.10), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Delivery History & Earnings</h2>
        <p className="text-xs text-gray-500 font-sans">Logs of your completed cloud delivery transactions.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Earnings Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Earnings</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">${totalEarnings.toFixed(2)}</h3>
            <p className="text-[10px] text-gray-400">Includes base fees ($3.99) + tip commissions</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <DollarSign className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Deliveries Count Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jobs Completed</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedDeliveries.length}</h3>
            <p className="text-[10px] text-gray-400">Successfully handed over to customers</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="h-6 w-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-indigo-600" /> Completed Deliveries Logs
        </h3>

        {completedDeliveries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No completed deliveries found in your account.</p>
        ) : (
          <div className="space-y-4">
            {completedDeliveries.map(order => {
              const orderEarning = 3.99 + (order.totalAmount * 0.10);
              return (
                <div 
                  key={order.id}
                  className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-left hover:bg-gray-50/30 dark:hover:bg-gray-950/10"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{order.id}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">DELIVERED</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                      Picked up from: <strong>{order.restaurantName}</strong><br />
                      Delivered to: {order.deliveryAddress.details}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {new Date(order.updatedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-50 dark:border-gray-800 pt-2 sm:pt-0 shrink-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Earnings</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">+${orderEarning.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
export default DeliveryHistory;
