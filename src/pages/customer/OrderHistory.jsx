import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToCustomerOrders } from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import { ShoppingBag, Eye, Calendar, DollarSign, Clock, ArrowRight } from "lucide-react";

export function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToCustomerOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight">Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-4">
          <div className="inline-flex p-5 rounded-full bg-indigo-50 dark:bg-gray-900 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-bold">No orders placed yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't ordered any food yet. Browse our list of amazing restaurants and place your first order!
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all"
          >
            Order Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base tracking-tight">{order.restaurantName}</h3>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> 
                    {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> 
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-0.5 font-bold text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-3.5 w-3.5" /> {order.totalAmount.toFixed(2)}
                  </span>
                </div>
                {/* List items briefly */}
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-sm">
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-50 dark:border-gray-800 pt-3 sm:pt-0 shrink-0 gap-2">
                <Link 
                  to={`/track/${order.id}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Track Status</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default OrderHistory;
