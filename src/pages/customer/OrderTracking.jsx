import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { subscribeToOrder } from "../../services/orderService";
import StatusBadge from "../../components/StatusBadge";
import { 
  ShoppingBag, Check, MapPin, Phone, Car, Clock, 
  ArrowLeft, CheckCircle2, CircleDot, AlertTriangle 
} from "lucide-react";

export function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    const unsubscribe = subscribeToOrder(orderId, (updatedOrder) => {
      setLoading(false);
      if (updatedOrder) {
        setOrder(updatedOrder);
        setError("");
      } else {
        setError("Order not found or access denied.");
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  // Order status progression list for timeline
  const statusSteps = [
    { key: "placed", title: "Order Placed", note: "Waiting for restaurant approval" },
    { key: "accepted", title: "Order Accepted", note: "Restaurant approved the order" },
    { key: "preparing", title: "Preparing Meal", note: "Chef is working on your food" },
    { key: "ready_for_pickup", title: "Ready for Pickup", note: "Order packed and waiting for agent" },
    { key: "picked_up", title: "Picked Up", note: "Agent has picked up your food" },
    { key: "on_the_way", title: "On The Way", note: "Agent is heading to your location" },
    { key: "delivered", title: "Delivered", note: "Order delivered. Enjoy!" }
  ];

  const getStepState = (stepKey) => {
    if (!order) return "pending";
    if (order.status === "cancelled") return "cancelled";
    
    const currentIndex = statusSteps.findIndex(s => s.key === order.status);
    const stepIndex = statusSteps.findIndex(s => s.key === stepKey);

    if (stepIndex === -1) return "pending";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="inline-flex p-4 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error || "Unable to display tracking status."}</p>
        <Link to="/orders" className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">
          Go to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div className="flex items-center gap-3">
        <Link 
          to="/orders"
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          aria-label="Back to History"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Track Your Order</h2>
          <p className="text-xs text-gray-500">ID: {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Real-time status timeline (Left Columns) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Estimated Delivery</p>
              <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="h-5 w-5 stroke-[2.5]" /> 25 - 35 mins
              </h3>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Timeline Display */}
          <div className="relative pl-6 space-y-6">
            {/* Vertical timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100 dark:bg-gray-800"></div>

            {statusSteps.map((step) => {
              const state = getStepState(step.key);
              
              // Timeline step styles
              let iconElement;
              let titleClass = "text-sm font-bold text-gray-400 dark:text-gray-600";
              let noteClass = "text-xs text-gray-400 dark:text-gray-600";
              
              if (state === "completed") {
                iconElement = (
                  <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                );
                titleClass = "text-sm font-bold text-gray-700 dark:text-gray-300";
                noteClass = "text-xs text-gray-500 dark:text-gray-400";
              } else if (state === "active") {
                iconElement = (
                  <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border-2 border-indigo-600 animate-pulse">
                    <CircleDot className="h-3.5 w-3.5" />
                  </div>
                );
                titleClass = "text-sm font-bold text-indigo-600 dark:text-indigo-400";
                noteClass = "text-xs text-gray-600 dark:text-gray-400 font-medium";
              } else {
                iconElement = (
                  <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-white dark:bg-gray-950 text-gray-200 dark:text-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                );
              }

              // Special handling for cancelled
              if (order.status === "cancelled" && step.key === "cancelled") {
                iconElement = (
                  <div className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-500">
                    <X className="h-3.5 w-3.5" />
                  </div>
                );
                titleClass = "text-sm font-bold text-red-600";
                noteClass = "text-xs text-red-500";
              }

              // Filter timeline events that have occurred or are next. Stop listing if cancelled.
              if (order.status === "cancelled" && step.key !== "placed") return null;

              return (
                <div key={step.key} className="relative pl-6 flex flex-col items-start text-left">
                  {iconElement}
                  <h4 className={titleClass}>{step.title}</h4>
                  <p className={noteClass}>
                    {/* If we have a matching logs, show the custom timeline note & timestamp, else default */}
                    {order.statusTimeline?.find(t => t.status === step.key)?.note || step.note}
                  </p>
                  {order.statusTimeline?.find(t => t.status === step.key) && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                      {new Date(order.statusTimeline.find(t => t.status === step.key).timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Details & Order Bill (Right Column) */}
        <div className="space-y-6">
          {/* Agent Assignment Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-600" /> Delivery Partner
            </h3>
            
            {order.assignedDeliveryAgentId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {order.assignedDeliveryAgentName?.charAt(0) || "D"}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">{order.assignedDeliveryAgentName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Professional Rider</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-gray-400" />
                    <span>Vehicle Info: Custom Bike</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>Contact: +1 555-RIDER</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                {order.status === "cancelled" 
                  ? "Order was cancelled." 
                  : "Awaiting restaurant preparation. We will assign a delivery partner shortly."}
              </div>
            )}
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> Delivery Address
            </h3>
            <div className="text-left text-xs space-y-1 leading-relaxed">
              <p className="font-bold text-sm capitalize">{order.deliveryAddress.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{order.deliveryAddress.details}</p>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Contact: {order.deliveryAddress.phone}</p>
            </div>
          </div>

          {/* Bill details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" /> Bill Details
            </h3>
            <div className="space-y-1.5 text-xs text-left max-h-32 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{item.name} x{item.quantity}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-2">
              <span>Paid via COD</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-base">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default OrderTracking;
