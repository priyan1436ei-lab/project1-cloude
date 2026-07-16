export const MOCK_USERS = [
  {
    uid: "customer-1",
    name: "John Doe",
    email: "customer@test.com",
    phone: "+1234567890",
    role: "customer",
    addresses: [
      { id: "addr-1", name: "Home", details: "Apartment 4B, Pine Towers, Green Street", phone: "+1234567890" },
      { id: "addr-2", name: "Office", details: "Floor 12, Tech Hub, Business Avenue", phone: "+1234567890" }
    ],
    createdAt: new Date().toISOString()
  },
  {
    uid: "admin-1",
    name: "Alice Chef",
    email: "admin@test.com",
    phone: "+1987654321",
    role: "restaurant_admin",
    createdAt: new Date().toISOString()
  },
  {
    uid: "delivery-1",
    name: "Bob Rider",
    email: "delivery@test.com",
    phone: "+1555555555",
    role: "delivery_agent",
    createdAt: new Date().toISOString()
  }
];

export const MOCK_RESTAURANTS = [
  {
    id: "rest-1",
    ownerId: "admin-1",
    name: "The Burger Joint",
    description: "Flame-grilled gourmet burgers, artisan buns, and crispy hand-cut fries.",
    location: "456 Downtown Blvd, Food District",
    phone: "+1000111222",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rest-2",
    ownerId: "admin-1", // For convenience, let this admin manage multiple or we can assign mock owner
    name: "Pizza & Co.",
    description: "Stone-baked Neapolitan pizzas with fresh mozzarella and organic toppings.",
    location: "789 Plaza Avenue, Little Italy",
    phone: "+1000333444",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rest-3",
    ownerId: "admin-1",
    name: "Wok & Roll",
    description: "Sizzling stir-fried noodles, fresh sushi rolls, and traditional dim sums.",
    location: "123 Cherry Lane, Chinatown",
    phone: "+1000555666",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CATEGORIES = [
  { id: "cat-1", restaurantId: "rest-1", name: "Signature Burgers", isActive: true, createdAt: new Date().toISOString() },
  { id: "cat-2", restaurantId: "rest-1", name: "Sides & Drinks", isActive: true, createdAt: new Date().toISOString() },
  { id: "cat-3", restaurantId: "rest-2", name: "Woodfired Pizza", isActive: true, createdAt: new Date().toISOString() },
  { id: "cat-4", restaurantId: "rest-2", name: "Salads & Desserts", isActive: true, createdAt: new Date().toISOString() },
  { id: "cat-5", restaurantId: "rest-3", name: "Wok Specials", isActive: true, createdAt: new Date().toISOString() }
];

export const MOCK_FOOD_ITEMS = [
  // Burger Joint
  {
    id: "food-1",
    restaurantId: "rest-1",
    categoryId: "cat-1",
    name: "Classic Cheeseburger",
    description: "Prime beef patty, melted cheddar, lettuce, tomato, pickles, and signature house sauce.",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-2",
    restaurantId: "rest-1",
    categoryId: "cat-1",
    name: "Double Bacon BBQ Burger",
    description: "Two beef patties, crispy smoked bacon, onion rings, cheddar cheese, and sweet BBQ sauce.",
    price: 13.49,
    imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-3",
    restaurantId: "rest-1",
    categoryId: "cat-2",
    name: "Sweet Potato Fries",
    description: "Crispy sweet potato fries seasoned with sea salt, served with garlic aioli.",
    price: 4.49,
    imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-4",
    restaurantId: "rest-1",
    categoryId: "cat-2",
    name: "Craft Lemonade",
    description: "Freshly squeezed lemons with mint leaves and a touch of organic honey.",
    price: 2.99,
    imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },

  // Pizza & Co
  {
    id: "food-5",
    restaurantId: "rest-2",
    categoryId: "cat-3",
    name: "Margherita Pizza",
    description: "Simple yet perfect: tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.",
    price: 11.99,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-6",
    restaurantId: "rest-2",
    categoryId: "cat-3",
    name: "Diablo Spicy Pepperoni",
    description: "Spicy Italian pepperoni, jalapenos, chili flakes, tomato sauce, and mozzarella.",
    price: 14.49,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-7",
    restaurantId: "rest-2",
    categoryId: "cat-4",
    name: "Mediterranean Salad",
    description: "Cherry tomatoes, cucumbers, kalamata olives, red onion, feta cheese, and balsamic dressing.",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },

  // Wok & Roll
  {
    id: "food-8",
    restaurantId: "rest-3",
    categoryId: "cat-5",
    name: "Teriyaki Chicken Wok",
    description: "Stir-fried chicken, fresh vegetables, egg noodles, and savory house teriyaki sauce.",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "food-9",
    restaurantId: "rest-3",
    categoryId: "cat-5",
    name: "Rainbow Sushi Platter",
    description: "Premium roll topped with tuna, salmon, yellowtail, shrimp, and avocado.",
    price: 16.99,
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isAvailable: true,
    createdAt: new Date().toISOString()
  }
];

export const MOCK_ORDERS = [
  {
    id: "order-101",
    customerId: "customer-1",
    customerName: "John Doe",
    customerPhone: "+1234567890",
    deliveryAddress: { name: "Home", details: "Apartment 4B, Pine Towers, Green Street", phone: "+1234567890" },
    restaurantId: "rest-1",
    restaurantName: "The Burger Joint",
    items: [
      { itemId: "food-1", name: "Classic Cheeseburger", quantity: 2, price: 9.99 },
      { itemId: "food-3", name: "Sweet Potato Fries", quantity: 1, price: 4.49 }
    ],
    totalAmount: 24.47,
    status: "delivered",
    assignedDeliveryAgentId: "delivery-1",
    assignedDeliveryAgentName: "Bob Rider",
    paymentMethod: "cod",
    paymentStatus: "completed",
    statusTimeline: [
      { status: "placed", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: "Order placed successfully." },
      { status: "accepted", timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), note: "Restaurant accepted your order." },
      { status: "preparing", timestamp: new Date(Date.now() - 3600000 * 1.7).toISOString(), note: "Chef is preparing the food." },
      { status: "ready_for_pickup", timestamp: new Date(Date.now() - 3600000 * 1.3).toISOString(), note: "Food is ready for pickup." },
      { status: "picked_up", timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(), note: "Agent Bob Rider picked up the order." },
      { status: "on_the_way", timestamp: new Date(Date.now() - 3600000 * 1.0).toISOString(), note: "Agent is heading to your address." },
      { status: "delivered", timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(), note: "Order delivered. Thank you!" }
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 0.8).toISOString()
  },
  {
    id: "order-102",
    customerId: "customer-1",
    customerName: "John Doe",
    customerPhone: "+1234567890",
    deliveryAddress: { name: "Home", details: "Apartment 4B, Pine Towers, Green Street", phone: "+1234567890" },
    restaurantId: "rest-2",
    restaurantName: "Pizza & Co.",
    items: [
      { itemId: "food-5", name: "Margherita Pizza", quantity: 1, price: 11.99 },
      { itemId: "food-7", name: "Mediterranean Salad", quantity: 1, price: 8.99 }
    ],
    totalAmount: 20.98,
    status: "placed",
    assignedDeliveryAgentId: null,
    assignedDeliveryAgentName: null,
    paymentMethod: "cod",
    paymentStatus: "pending",
    statusTimeline: [
      { status: "placed", timestamp: new Date().toISOString(), note: "Order placed. Awaiting restaurant acceptance." }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_DELIVERY_AGENTS = [
  {
    agentId: "delivery-1",
    uid: "delivery-1",
    name: "Bob Rider",
    phone: "+1555555555",
    vehicleNumber: "MOTO-7788",
    isActive: true,
    currentOrderId: null,
    createdAt: new Date().toISOString()
  }
];
