import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ShoppingBag, Mail, Lock, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      // Navigate based on user role
      if (user.role === "restaurant_admin") {
        navigate("/restaurant/dashboard");
      } else if (user.role === "delivery_agent") {
        navigate("/delivery/assigned");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill demo account details instantly
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl shadow-gray-100/10 dark:shadow-none space-y-6 text-left">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400">
          <ShoppingBag className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-xs text-gray-500">Sign in to order food or manage deliveries</p>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">Password</label>
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Demo Credentials Quick Inject Section */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-3">
        <h4 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Academic Review Quick Login</h4>
        <p className="text-[10px] text-gray-400 leading-normal">
          Click any button below to instantly populate credentials for that role.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button 
            type="button"
            onClick={() => handleQuickLogin("customer@test.com")}
            className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-lg text-[10px] font-bold truncate text-center"
          >
            Customer
          </button>
          <button 
            type="button"
            onClick={() => handleQuickLogin("admin@test.com")}
            className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-lg text-[10px] font-bold truncate text-center"
          >
            Restaurant Admin
          </button>
          <button 
            type="button"
            onClick={() => handleQuickLogin("delivery@test.com")}
            className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-lg text-[10px] font-bold truncate text-center"
          >
            Delivery Agent
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Don't have an account?{" "}
        <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Register here
        </Link>
      </div>

    </div>
  );
}
export default Login;
