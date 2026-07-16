import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { placeOrder } from "../../services/orderService";
import { addUserAddress } from "../../services/userService";
import { MapPin, Plus, Landmark, CreditCard, ShoppingBag, ArrowLeft } from "lucide-react";

export function Checkout() {
  const { currentUser, refreshUser } = useAuth();
  const { cartItems, activeRestaurant, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [selectedAddrId, setSelectedAddrId] = useState(() => {
    return currentUser?.addresses?.length > 0 ? currentUser.addresses[0].id : "";
  });

  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrDetails, setNewAddrDetails] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState(currentUser?.phone || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const deliveryFee = 3.99;
  const serviceTax = cartTotal * 0.05;
  const finalTotal = cartTotal + deliveryFee + serviceTax;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddrName || !newAddrDetails || !newAddrPhone) {
      setError("Please fill in all address details.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const newId = await addUserAddress(currentUser.uid, {
        name: newAddrName,
        details: newAddrDetails,
        phone: newAddrPhone
      });
      await refreshUser();
      setSelectedAddrId(newId);
      setIsAddingAddr(false);
      setNewAddrName("");
      setNewAddrDetails("");
    } catch (err) {
      setError(err.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddrId) {
      setError("Please select a delivery address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const selectedAddress = currentUser.addresses.find(a => a.id === selectedAddrId);
      
      const orderData = {
        customerId: currentUser.uid,
        customerName: currentUser.name,
        customerPhone: selectedAddress.phone,
        deliveryAddress: {
          name: selectedAddress.name,
          details: selectedAddress.details,
          phone: selectedAddress.phone
        },
        restaurantId: activeRestaurant.id,
        restaurantName: activeRestaurant.name,
        items: cartItems.map(item => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: parseFloat(finalTotal.toFixed(2))
      };

      const result = await placeOrder(orderData);
      clearCart();
      navigate(`/track/${result.id}`);
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeRestaurant || cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold">No active items to checkout</h2>
        <button 
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate("/cart")}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
          aria-label="Back to Cart"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Checkout</h2>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" /> Delivery Address
              </h3>
              {!isAddingAddr && (
                <button 
                  onClick={() => setIsAddingAddr(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add New
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {!isAddingAddr ? (
              currentUser?.addresses?.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400 space-y-3">
                  <p>You haven't saved any delivery addresses yet.</p>
                  <button 
                    onClick={() => setIsAddingAddr(true)}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-semibold rounded-lg text-xs"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentUser.addresses.map(addr => (
                    <label 
                      key={addr.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col space-y-2 relative transition-all ${
                        selectedAddrId === addr.id 
                          ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/10" 
                          : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id}
                        checked={selectedAddrId === addr.id}
                        onChange={() => setSelectedAddrId(addr.id)}
                        className="absolute right-3.5 top-3.5 accent-indigo-600"
                      />
                      <span className="font-bold text-sm tracking-tight capitalize">{addr.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-6">{addr.details}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Phone: {addr.phone}</span>
                    </label>
                  ))}
                </div>
              )
            ) : (
              /* Add New Address Form */
              <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Label (e.g. Home, Office)</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Home"
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Delivery Contact Number</label>
                    <input 
                      type="tel"
                      required
                      placeholder="Phone number"
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Full Address Details</label>
                    <input 
                      type="text"
                      required
                      placeholder="Building, street name, apartment number"
                      value={newAddrDetails}
                      onChange={(e) => setNewAddrDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsAddingAddr(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Landmark className="h-5 w-5 text-indigo-600" /> Payment Mode
            </h3>
            <label className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/10 cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <div className="text-left">
                  <p className="font-bold text-sm tracking-tight">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay cash upon delivery. No card required.</p>
                </div>
              </div>
              <input type="radio" checked readOnly className="accent-indigo-600" />
            </label>
          </div>

        </div>

        {/* Order Summary & Proceed Button */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" /> Order Summary
          </h3>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{item.name} <strong className="text-gray-900 dark:text-white">x{item.quantity}</strong></span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex justify-between text-gray-500 dark:text-gray-500">
              <span>Item Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-500">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-500">
              <span>Tax & Svc charges (5%)</span>
              <span>${serviceTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-1 text-gray-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-base">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddrId}
            className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center cursor-pointer ${
              loading || !selectedAddrId
                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
            }`}
          >
            {loading ? "Placing Order..." : "Confirm & Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}
export default Checkout;
