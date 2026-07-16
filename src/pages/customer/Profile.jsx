import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateUserProfile, addUserAddress, removeUserAddress } from "../../services/userService";
import { User, MapPin, Phone, Trash2, Plus, Check } from "lucide-react";

export function Profile() {
  const { currentUser, refreshUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrDetails, setAddrDetails] = useState("");
  const [addrPhone, setAddrPhone] = useState(currentUser?.phone || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await updateUserProfile(currentUser.uid, { name, phone });
      await refreshUser();
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName || !addrDetails || !addrPhone) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await addUserAddress(currentUser.uid, {
        name: addrName,
        details: addrDetails,
        phone: addrPhone
      });
      await refreshUser();
      setIsAddingAddr(false);
      setAddrName("");
      setAddrDetails("");
      setSuccessMsg("New address added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add address.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await removeUserAddress(currentUser.uid, addrId);
      await refreshUser();
      setSuccessMsg("Address removed successfully!");
    } catch (err) {
      setError(err.message || "Failed to remove address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-sm rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
          <Check className="h-4 w-4 stroke-[3]" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-base border-b border-gray-50 dark:border-gray-800 pb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" /> Account Settings
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Email Address (Read Only)</label>
              <input 
                type="email" 
                readOnly
                value={currentUser?.email || ""}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Addresses Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> Saved Delivery Addresses
            </h3>
            {!isAddingAddr && (
              <button 
                onClick={() => setIsAddingAddr(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Address
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {isAddingAddr && (
            <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-sm font-bold">New Delivery Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Label (e.g. Home, Office)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Home" 
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Contact Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Phone number" 
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Full Address Details</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Building name, street, apartment number" 
                    value={addrDetails}
                    onChange={(e) => setAddrDetails(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List Addresses */}
          <div className="space-y-3">
            {currentUser?.addresses?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">You don't have any saved addresses.</p>
            ) : (
              (currentUser?.addresses || []).map(addr => (
                <div 
                  key={addr.id}
                  className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm capitalize">{addr.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{addr.details}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      <Phone className="h-3 w-3" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors shrink-0"
                    aria-label="Delete Address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
export default Profile;
