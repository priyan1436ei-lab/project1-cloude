import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer Pages
import Home from "./pages/customer/Home";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderTracking from "./pages/customer/OrderTracking";
import OrderHistory from "./pages/customer/OrderHistory";
import Profile from "./pages/customer/Profile";

// Restaurant Pages
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import RestaurantOrders from "./pages/restaurant/Orders";
import MenuManagement from "./pages/restaurant/MenuManagement";
import CategoryManagement from "./pages/restaurant/CategoryManagement";

// Delivery Pages
import AssignedOrders from "./pages/delivery/AssignedOrders";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Layout>
              <Routes>
                
                {/* --- Public & Auth Routes --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- Customer Protected Routes --- */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute allowedRoles={["customer"]}>
                      <Home />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <PrivateRoute allowedRoles={["customer"]}>
                      <Cart />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <PrivateRoute allowedRoles={["customer"]}>
                      <Checkout />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <PrivateRoute allowedRoles={["customer"]}>
                      <OrderHistory />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/track/:orderId" 
                  element={
                    <PrivateRoute allowedRoles={["customer", "restaurant_admin", "delivery_agent"]}>
                      <OrderTracking />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute allowedRoles={["customer"]}>
                      <Profile />
                    </PrivateRoute>
                  } 
                />

                {/* --- Restaurant Admin Protected Routes --- */}
                <Route 
                  path="/restaurant/dashboard" 
                  element={
                    <PrivateRoute allowedRoles={["restaurant_admin"]}>
                      <RestaurantDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/restaurant/orders" 
                  element={
                    <PrivateRoute allowedRoles={["restaurant_admin"]}>
                      <RestaurantOrders />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/restaurant/menu" 
                  element={
                    <PrivateRoute allowedRoles={["restaurant_admin"]}>
                      <MenuManagement />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/restaurant/categories" 
                  element={
                    <PrivateRoute allowedRoles={["restaurant_admin"]}>
                      <CategoryManagement />
                    </PrivateRoute>
                  } 
                />

                {/* --- Delivery Agent Protected Routes --- */}
                <Route 
                  path="/delivery/assigned" 
                  element={
                    <PrivateRoute allowedRoles={["delivery_agent"]}>
                      <AssignedOrders />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/delivery/history" 
                  element={
                    <PrivateRoute allowedRoles={["delivery_agent"]}>
                      <DeliveryHistory />
                    </PrivateRoute>
                  } 
                />

                {/* --- Fallback Route --- */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
