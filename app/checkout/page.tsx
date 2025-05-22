"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import Link from "next/link";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  whatsappNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Введите корректный номер WhatsApp"),
  deliveryAddress: z.string().min(5, "Адрес должен содержать минимум 5 символов"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, clearCart, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    // Redirect to home if cart is empty
    if (items.length === 0 && !isSuccess) {
      router.push("/");
    }
  }, [items, router, isSuccess]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: data.customerName,
          whatsappNumber: data.whatsappNumber,
          deliveryAddress: data.deliveryAddress,
          totalAmount: totalPrice,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при оформлении заказа");
      }

      // Clear cart and show success message
      clearCart();
      setIsSuccess(true);
      toast.success("Заказ успешно оформлен!");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Произошла ошибка при оформлении заказа");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-6">
              <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Заказ успешно оформлен!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
            </p>
            <Link href="/" className="btn btn-primary btn-lg w-full">
              Вернуться на главную
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к покупкам
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-green-600 text-white flex items-center">
            <ShoppingBag className="h-6 w-6 mr-3" />
            <h1 className="text-2xl font-bold">Оформление заказа</h1>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} кг × {item.price} ₽
                        </p>
                      </div>
                      <p className="font-medium">{(item.quantity * item.price).toFixed(2)} ₽</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <p>Итого:</p>
                  <p>{totalPrice.toFixed(2)} ₽</p>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Оплата производится наличными при получении
                </p>
              </div>

              {/* Checkout Form */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Информация для доставки</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                        Ваше имя
                      </label>
                      <input
                        id="customerName"
                        type="text"
                        className={`w-full p-3 border rounded-md ${
                          errors.customerName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700`}
                        placeholder="Иван Иванов"
                        {...register("customerName")}
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-500">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="whatsappNumber" className="block text-sm font-medium mb-1">
                        Номер WhatsApp
                      </label>
                      <input
                        id="whatsappNumber"
                        type="text"
                        className={`w-full p-3 border rounded-md ${
                          errors.whatsappNumber ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700`}
                        placeholder="+7 XXX XXX XX XX"
                        {...register("whatsappNumber")}
                      />
                      {errors.whatsappNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.whatsappNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="deliveryAddress" className="block text-sm font-medium mb-1">
                        Адрес доставки
                      </label>
                      <textarea
                        id="deliveryAddress"
                        rows={3}
                        className={`w-full p-3 border rounded-md ${
                          errors.deliveryAddress ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700`}
                        placeholder="Улица, дом, квартира, город"
                        {...register("deliveryAddress")}
                      />
                      {errors.deliveryAddress && (
                        <p className="mt-1 text-sm text-red-500">{errors.deliveryAddress.message}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full btn btn-primary btn-lg mt-6"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Оформление...
                        </div>
                      ) : (
                        "Оформить заказ"
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}