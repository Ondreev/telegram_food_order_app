import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// This endpoint is for initial setup only
export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        isAdmin: true,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Wow787CvP#", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
      },
    });

    // Create sample products
    const products = [
      {
        name: "Картофель",
        description: "Свежий картофель местного производства",
        price: 45.0,
        minQuantity: 1.0,
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
        category: "vegetables",
        inStock: true,
      },
      {
        name: "Морковь",
        description: "Сочная морковь",
        price: 60.0,
        minQuantity: 0.5,
        image: "https://images.unsplash.com/photo-1447175008436-054170c2e979",
        category: "vegetables",
        inStock: true,
      },
      {
        name: "Яблоки",
        description: "Сладкие яблоки сорта Голден",
        price: 120.0,
        minQuantity: 1.0,
        image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a",
        category: "fruits",
        inStock: true,
      },
      {
        name: "Помидоры",
        description: "Спелые помидоры",
        price: 180.0,
        minQuantity: 0.5,
        image: "https://images.unsplash.com/photo-1561136594-7f68413baa99",
        category: "vegetables",
        inStock: true,
      },
      {
        name: "Огурцы",
        description: "Свежие огурцы",
        price: 150.0,
        minQuantity: 0.5,
        image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e",
        category: "vegetables",
        inStock: true,
      },
      {
        name: "Бананы",
        description: "Спелые бананы",
        price: 90.0,
        minQuantity: 1.0,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
        category: "fruits",
        inStock: true,
      },
      {
        name: "Лук",
        description: "Свежий лук",
        price: 40.0,
        minQuantity: 0.5,
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb",
        category: "vegetables",
        inStock: true,
      },
      {
        name: "Молоко",
        description: "Свежее фермерское молоко",
        price: 85.0,
        minQuantity: 1.0,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
        category: "dairy",
        inStock: true,
      },
    ];

    await prisma.product.createMany({
      data: products,
    });

    return NextResponse.json(
      { message: "Database seeded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}