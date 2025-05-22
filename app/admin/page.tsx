"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, LogOut, Package, ShoppingBag } from "lucide-react";
import AdminLogin from "@/components/admin-login";
import ProductManagement from "@/components/product-management";
import OrderManagement from "@/components/order-management";

type AdminTab = "products" | "orders";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      router.push("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-green-600" />
            <h1 className="text-xl font-bold">Панель администратора</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium">Администратор</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex space-x-4 mb-6">
          <motion.button
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              activeTab === "products" 
                ? "bg-green-600 text-white" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("products")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Package className="h-5 w-5" />
            <span>Управление товарами</span>
          </motion.button>
          <motion.button
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              activeTab === "orders" 
                ? "bg-green-600 text-white" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("orders")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Управление заказами</span>
          </motion.button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {activeTab === "products" ? (
            <ProductManagement />
          ) : (
            <OrderManagement />
          )}
        </div>
      </div>
    </div>
  );
}