"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, Image, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const productSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Цена должна быть положительным числом"),
  minQuantity: z.coerce.number().positive("Минимальное количество должно быть положительным числом"),
  image: z.string().optional(),
  category: z.string(),
  inStock: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

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

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      minQuantity: 0.5,
      image: "",
      category: "other",
      inStock: true,
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Не удалось загрузить продукты");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    reset({
      name: "",
      description: "",
      price: 0,
      minQuantity: 0.5,
      image: "",
      category: "other",
      inStock: true,
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setValue("name", product.name);
    setValue("description", product.description || "");
    setValue("price", product.price);
    setValue("minQuantity", product.minQuantity);
    setValue("image", product.image || "");
    setValue("category", product.category);
    setValue("inStock", product.inStock);
    setIsEditing(true);
    setCurrentProductId(product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && currentProductId) {
        // Update existing product
        const response = await fetch(`/api/products/${currentProductId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        toast.success("Продукт успешно обновлен");
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create product");
        }

        toast.success("Продукт успешно добавлен");
      }

      // Refresh product list
      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(isEditing ? "Ошибка при обновлении продукта" : "Ошибка при добавлении продукта");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Продукт успешно удален");
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Ошибка при удалении продукта");
    }
  };

  const categoryNames: Record<string, string> = {
    vegetables: "Овощи",
    fruits: "Фрукты",
    dairy: "Молочные продукты",
    other: "Другие продукты",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Управление товарами</h2>
        <motion.button
          className="btn btn-primary btn-sm"
          onClick={openAddModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </motion.button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Товары не найдены</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить первый товар
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-left">Название</th>
                <th className="px-4 py-2 text-left">Категория</th>
                <th className="px-4 py-2 text-left">Цена (₽/кг)</th>
                <th className="px-4 py-2 text-left">Мин. кол-во (кг)</th>
                <th className="px-4 py-2 text-left">В наличии</th>
                <th className="px-4 py-2 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <motion.tr
                  key={product.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{categoryNames[product.category] || product.category}</td>
                  <td className="px-4 py-3">{product.price}</td>
                  <td className="px-4 py-3">{product.minQuantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.inStock 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}>
                      {product.inStock ? "Да" : "Нет"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold">
                    {isEditing ? "Редактировать товар" : "Добавить новый товар"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Название *
                      </label>
                      <input
                        id="name"
                        type="text"
                        className={`w-full p-2 border rounded-md ${
                          errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700`}
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Описание
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        {...register("description")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium mb-1">
                          Цена (₽/кг) *
                        </label>
                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          className={`w-full p-2 border rounded-md ${
                            errors.price ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700`}
                          {...register("price")}
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="minQuantity" className="block text-sm font-medium mb-1">
                          Мин. количество (кг) *
                        </label>
                        <input
                          id="minQuantity"
                          type="number"
                          step="0.1"
                          className={`w-full p-2 border rounded-md ${
                            errors.minQuantity ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          } bg-white dark:bg-gray-700`}
                          {...register("minQuantity")}
                        />
                        {errors.minQuantity && (
                          <p className="mt-1 text-sm text-red-500">{errors.minQuantity.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium mb-1">
                        URL изображения
                      </label>
                      <div className="flex">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Image className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            id="image"
                            type="text"
                            className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                            placeholder="https://example.com/image.jpg"
                            {...register("image")}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-1">
                        Категория
                      </label>
                      <select
                        id="category"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        {...register("category")}
                      >
                        <option value="vegetables">Овощи</option>
                        <option value="fruits">Фрукты</option>
                        <option value="dairy">Молочные продукты</option>
                        <option value="other">Другие продукты</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="inStock"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        {...register("inStock")}
                      />
                      <label htmlFor="inStock" className="ml-2 block text-sm">
                        В наличии
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-outline btn-sm"
                      >
                        Отмена
                      </button>
                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Сохранение...
                          </div>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}