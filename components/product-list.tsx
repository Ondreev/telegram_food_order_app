"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  minQuantity: number;
  image: string | null;
  category: string;
  inStock: boolean;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Initialize quantities with minimum values
        const initialQuantities: Record<string, number> = {};
        data.forEach((product: Product) => {
          initialQuantities[product.id] = product.minQuantity;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Не удалось загрузить продукты. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId: string, value: number, minQuantity: number) => {
    // Ensure quantity is not less than minimum
    const newQuantity = Math.max(value, minQuantity);
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
    toast.success(`${product.name} добавлен в корзину`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Продукты не найдены</p>
      </div>
    );
  }

  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const categoryNames: Record<string, string> = {
    vegetables: "Овощи",
    fruits: "Фрукты",
    dairy: "Молочные продукты",
    other: "Другие продукты",
  };

  return (
    <div ref={ref}>
      {Object.entries(categories).map(([category, categoryProducts]) => (
        <div key={category} className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 pl-2 border-l-4 border-green-500">
            {categoryNames[category] || category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={product.image || "https://i.pinimg.com/originals/27/f2/02/27f202975f0473774cd0d21067a16709.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {product.price} ₽/кг
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Мин: {product.minQuantity} кг
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <button
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleQuantityChange(
                          product.id, 
                          quantities[product.id] - 0.5, 
                          product.minQuantity
                        )}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[60px] text-center">
                        {quantities[product.id]} кг
                      </span>
                      <button
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleQuantityChange(
                          product.id, 
                          quantities[product.id] + 0.5, 
                          product.minQuantity
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      В корзину
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}