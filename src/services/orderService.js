import { getItems, addItem, updateItem, subscribeToDoc, subscribeToCollection } from "./db";

export const placeOrder = async (orderData) => {
  const initialTimeline = [
    {
      status: "placed",
      timestamp: new Date().toISOString(),
      note: "Order placed successfully. Waiting for restaurant approval."
    }
  ];

  const orderPayload = {
    ...orderData,
    status: "placed",
    assignedDeliveryAgentId: null,
    assignedDeliveryAgentName: null,
    paymentMethod: "cod",
    paymentStatus: "pending",
    statusTimeline: initialTimeline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return await addItem("orders", orderPayload);
};

export const updateOrderStatus = async (orderId, newStatus, note = "") => {
  const order = await getItems("orders");
  const target = order.find(o => o.id === orderId);
  if (!target) throw new Error("Order not found");

  const timeline = [...(target.statusTimeline || [])];
  
  // Custom default notes if empty
  let defaultNote = note;
  if (!defaultNote) {
    switch (newStatus) {
      case "placed": defaultNote = "Order placed successfully."; break;
      case "accepted": defaultNote = "Restaurant accepted your order."; break;
      case "preparing": defaultNote = "Chef is preparing your meal."; break;
      case "ready_for_pickup": defaultNote = "Order is packed and ready for pickup."; break;
      case "picked_up": defaultNote = `Order picked up by delivery agent.`; break;
      case "on_the_way": defaultNote = "Delivery agent is on the way to your address."; break;
      case "delivered": defaultNote = "Order delivered. Enjoy your meal!"; break;
      case "cancelled": defaultNote = "Order was cancelled."; break;
      default: defaultNote = `Status changed to ${newStatus}`;
    }
  }

  timeline.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: defaultNote
  });

  const payload = {
    status: newStatus,
    statusTimeline: timeline,
    updatedAt: new Date().toISOString()
  };

  // Mark payment completed if delivered
  if (newStatus === "delivered") {
    payload.paymentStatus = "completed";
  }

  return await updateItem("orders", orderId, payload);
};

export const assignDeliveryAgent = async (orderId, agentId, agentName) => {
  const payload = {
    assignedDeliveryAgentId: agentId,
    assignedDeliveryAgentName: agentName,
    updatedAt: new Date().toISOString()
  };

  return await updateItem("orders", orderId, payload);
};

export const subscribeToOrder = (orderId, onUpdate) => {
  return subscribeToDoc("orders", orderId, onUpdate);
};

export const subscribeToRestaurantOrders = (restaurantId, onUpdate) => {
  return subscribeToCollection("orders", [{ field: "restaurantId", operator: "==", value: restaurantId }], (orders) => {
    // Sort by createdAt descending
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    onUpdate(sorted);
  });
};

export const subscribeToCustomerOrders = (customerId, onUpdate) => {
  return subscribeToCollection("orders", [{ field: "customerId", operator: "==", value: customerId }], (orders) => {
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    onUpdate(sorted);
  });
};

export const subscribeToUnassignedOrders = (onUpdate) => {
  // Unassigned orders are in status 'ready_for_pickup' and have assignedDeliveryAgentId == null
  return subscribeToCollection(
    "orders", 
    [
      { field: "status", operator: "==", value: "ready_for_pickup" }
    ], 
    (orders) => {
      const unassigned = orders.filter(o => !o.assignedDeliveryAgentId);
      const sorted = unassigned.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      onUpdate(sorted);
    }
  );
};

export const subscribeToAgentOrders = (agentId, onUpdate) => {
  return subscribeToCollection(
    "orders", 
    [{ field: "assignedDeliveryAgentId", operator: "==", value: agentId }], 
    (orders) => {
      const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      onUpdate(sorted);
    }
  );
};
