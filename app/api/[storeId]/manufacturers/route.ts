import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const { name } = await req.json();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!params.storeId)
      return new NextResponse("StoreId is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const manufacturer = await prismadb.manufacturer.create({
      data: {
        name,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(manufacturer);
  } catch (error) {
    console.log("[MANUFACTURERS_POST]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId)
      return new NextResponse("StoreId is required", { status: 400 });

    const manufacturers = await prismadb.manufacturer.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.log("[MANUFACTURERS_GET]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
