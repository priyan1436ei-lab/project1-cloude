import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";

export function Cart() {
  const { cartItems, activeRestaurant, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryFee = activeRestaurant ? 3.99 : 0;
  const serviceTax = cartTotal * 0.05; // 5% tax
  const finalTotal = cartTotal + deliveryFee + serviceTax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-5">
        <div className="inline-flex p-5 rounded-full bg-indigo-50 dark:bg-gray-900 text-indigo-600 dark:text-indigo-400">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Looks like you haven't added any items to your cart yet. Explore our restaurant menus to find something delicious!
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight">Your Cart</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Ordering from</p>
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400">{activeRestaurant?.name}</h3>
            </div>
            <button 
              onClick={clearCart}
              className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear All
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            {cartItems.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-grow space-y-1">
                  <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">${item.price.toFixed(2)} each</p>
                </div>
                
                {/* Quantity Manager */}
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shrink-0 bg-gray-50 dark:bg-gray-950">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary & Checkout Button */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-5">
          <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3">Bill Summary</h3>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900 dark:text-white">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Charges (5%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">${serviceTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
              <span>To Pay</span>
              <span className="text-indigo-600 dark:text-indigo-400">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => navigate("/checkout")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
export default Cart;
