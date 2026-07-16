import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { isFirebaseEnabled } from "../config/firebase";
import { 
  Sun, Moon, ShoppingBag, LogOut, User, ClipboardList, Utensils, LayoutDashboard, 
  MapPin, CheckSquare, History, ListCollapse, Menu, X 
} from "lucide-react";
import { useState } from "react";

export function Layout({ children }) {
  const { currentUser, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Cloud-Computing / Demo Mode Indicator */}
      {!isFirebaseEnabled && (
        <div className="bg-amber-500 text-white py-1 px-4 text-center text-xs font-semibold select-none flex items-center justify-center gap-1.5 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
          Running in Local Demo Mode. Configure Firebase env keys to sync to live cloud databases.
        </div>
      )}

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
            <span>Cloud<span className="text-gray-900 dark:text-white font-normal">Bites</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {currentUser && role === "customer" && (
              <>
                <Link to="/" className={navLinkClass("/")}>
                  <Utensils className="h-4 w-4" /> Browse
                </Link>
                <Link to="/orders" className={navLinkClass("/orders")}>
                  <History className="h-4 w-4" /> My Orders
                </Link>
                <Link to="/profile" className={navLinkClass("/profile")}>
                  <User className="h-4 w-4" /> Profile
                </Link>
              </>
            )}

            {currentUser && role === "restaurant_admin" && (
              <>
                <Link to="/restaurant/dashboard" className={navLinkClass("/restaurant/dashboard")}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/restaurant/orders" className={navLinkClass("/restaurant/orders")}>
                  <ClipboardList className="h-4 w-4" /> Active Orders
                </Link>
                <Link to="/restaurant/menu" className={navLinkClass("/restaurant/menu")}>
                  <Utensils className="h-4 w-4" /> Menu Items
                </Link>
                <Link to="/restaurant/categories" className={navLinkClass("/restaurant/categories")}>
                  <ListCollapse className="h-4 w-4" /> Categories
                </Link>
              </>
            )}

            {currentUser && role === "delivery_agent" && (
              <>
                <Link to="/delivery/assigned" className={navLinkClass("/delivery/assigned")}>
                  <ClipboardList className="h-4 w-4" /> Assigned Tasks
                </Link>
                <Link to="/delivery/history" className={navLinkClass("/delivery/history")}>
                  <History className="h-4 w-4" /> Deliveries
                </Link>
              </>
            )}
          </nav>

          {/* User Utilities */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {currentUser ? (
              <>
                {/* Cart icon for customer */}
                {role === "customer" && (
                  <Link 
                    to="/cart" 
                    className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-colors relative"
                    aria-label="View Cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Account info drop placeholder */}
                <div className="hidden sm:flex flex-col text-right text-xs">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{currentUser.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium capitalize">{role?.replace("_", " ")}</span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 text-sm font-semibold transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-3.5 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            {currentUser && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && currentUser && (
          <nav className="md:hidden px-4 pt-2 pb-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-1 transition-all duration-200">
            {role === "customer" && (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/")}>
                  <Utensils className="h-4 w-4" /> Browse Menu
                </Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/orders")}>
                  <History className="h-4 w-4" /> My Orders
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/profile")}>
                  <User className="h-4 w-4" /> Profile
                </Link>
              </>
            )}

            {role === "restaurant_admin" && (
              <>
                <Link to="/restaurant/dashboard" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/restaurant/dashboard")}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/restaurant/orders" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/restaurant/orders")}>
                  <ClipboardList className="h-4 w-4" /> Active Orders
                </Link>
                <Link to="/restaurant/menu" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/restaurant/menu")}>
                  <Utensils className="h-4 w-4" /> Menu Items
                </Link>
                <Link to="/restaurant/categories" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/restaurant/categories")}>
                  <ListCollapse className="h-4 w-4" /> Categories
                </Link>
              </>
            )}

            {role === "delivery_agent" && (
              <>
                <Link to="/delivery/assigned" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/delivery/assigned")}>
                  <ClipboardList className="h-4 w-4" /> Assigned Tasks
                </Link>
                <Link to="/delivery/history" onClick={() => setMobileMenuOpen(false)} className={navLinkClass("/delivery/history")}>
                  <History className="h-4 w-4" /> Deliveries
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CloudBites Delivery. B.Tech Cloud Computing Mini Project.</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Built using React, Tailwind CSS, & Firebase Cloud Services.</p>
        </div>
      </footer>

    </div>
  );
}
export default Layout;
