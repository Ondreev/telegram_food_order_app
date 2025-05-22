"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  User,
  Phone,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type OrderStatus = "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
};

type Order = {
  id: string;
  customerName: string;
  whatsappNumber: string;
  deliveryAddress: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast.success("Статус заказа обновлен");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Ошибка при обновлении статуса заказа");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Ожидает";
      case "PROCESSING":
        return "В обработке";
      case "DELIVERED":
        return "Доставлен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: ru });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Заказы отсутствуют</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Управление заказами</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Order Header */}
            <div 
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
              onClick={() => toggleOrderExpand(order.id)}
            >
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                  <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Заказ #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <span className="font-semibold">{order.totalAmount.toFixed(2)} ₽</span>
                </div>
                
                {expandedOrderId === order.id ? (
                  <ChevronUp className="h-5 w-5 ml-2 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 ml-2 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Order Details */}
            <AnimatePresence>
              {expandedOrderId === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4">
                    {/* Customer Info */}
                    <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Информация о клиенте</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-start">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                          <a 
                            href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline"
                          >
                            {order.whatsappNumber}
                          </a>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <h4 className="font-medium mb-2">Товары в заказе</h4>
                    <ul className="mb-4 space-y-2">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <div className="flex items-center">
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              ({item.quantity} кг × {item.price} ₽)
                            </span>
                          </div>
                          <span className="font-medium">{(item.quantity * item.price).toFixed(2)} ₽</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-2 justify-end mt-4">
                      {order.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                            disabled={updatingOrderId === order.id}
                          >
                            {updatingOrderId === order.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Обновление...
                              </div>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-1" />
                                В обработку
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                            disabled={updatingOrderId === order.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Отменить
                          </button>
                        </>
                      )}
                      
                      {order.status === "PROCESSING" && (
                        <button
                          className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                          disabled={updatingOrderId === order.id}
                        >
                          {updatingOrderId === order.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Обновление...
                            </div>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Доставлен
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}