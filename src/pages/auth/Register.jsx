import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ShoppingBag, Mail, Lock, User, Phone, Car } from "lucide-react";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  
  // Rider specific field
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in name, email, and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const extraData = { name, phone, role };
      if (role === "delivery_agent") {
        extraData.vehicleNumber = vehicleNumber || "MOTO-TBD";
      }

      await register(email, password, extraData);
      
      // Navigate based on user role
      if (role === "restaurant_admin") {
        navigate("/restaurant/dashboard");
      } else if (role === "delivery_agent") {
        navigate("/delivery/assigned");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-100/10 dark:shadow-none space-y-6 text-left">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400">
          <ShoppingBag className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
        <p className="text-xs text-gray-500">Sign up and join CloudBites Delivery</p>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Join As</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-150 dark:border-gray-800">
            <button 
              type="button" 
              onClick={() => setRole("customer")}
              className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                role === "customer" 
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Customer
            </button>
            <button 
              type="button" 
              onClick={() => setRole("restaurant_admin")}
              className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                role === "restaurant_admin" 
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Merchant
            </button>
            <button 
              type="button" 
              onClick={() => setRole("delivery_agent")}
              className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                role === "delivery_agent" 
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Delivery Partner
            </button>
          </div>
        </div>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Phone input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="tel" 
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Rider specific input */}
        {role === "delivery_agent" && (
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Vehicle Plate Number</label>
            <div className="relative">
              <Car className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                required
                placeholder="e.g. MOTO-9988"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Password input */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center cursor-pointer"
        >
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Sign in here
        </Link>
      </div>

    </div>
  );
}
export default Register;
