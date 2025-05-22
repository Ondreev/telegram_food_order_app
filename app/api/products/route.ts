import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create a new product
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || typeof data.price !== "number") {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: data.price,
        minQuantity: data.minQuantity || 0.5,
        image: data.image || "",
        category: data.category || "other",
        inStock: data.inStock !== undefined ? data.inStock : true,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}