import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import {
  addProductComment,
  getCommentByCustomerForProduct,
  getCommentsByProductId,
  getCustomerById,
  getProductById
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  try {
    const [comments, session] = await Promise.all([
      getCommentsByProductId(productId),
      getCurrentCustomer()
    ]);
    const myComment = session
      ? comments.find((c) => c.customerId === session.customerId) || null
      : null;
    return NextResponse.json({ comments, myComment, loggedIn: !!session });
  } catch (err) {
    console.error("get comments error", err);
    return NextResponse.json(
      { message: "Could not load comments. Run migration_11.sql in Supabase if the table is missing." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ message: "Please log in to leave a comment." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId || "").trim();
  const rating = Number(body.rating);
  const comment = String(body.comment || "").trim();

  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Rating must be between 1 and 5." }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ message: "Comment cannot be empty." }, { status: 400 });
  }
  if (comment.length > 1000) {
    return NextResponse.json({ message: "Comment is too long (max 1000 characters)." }, { status: 400 });
  }

  try {
    const existing = await getCommentByCustomerForProduct(productId, session.customerId);
    if (existing) {
      return NextResponse.json(
        {
          message: "You already reviewed this product. Edit your existing review instead.",
          existing
        },
        { status: 409 }
      );
    }

    const customer = await getCustomerById(session.customerId);
    if (!customer) {
      return NextResponse.json({ message: "Customer account not found." }, { status: 404 });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const created = await addProductComment({
      productId,
      customerId: customer.id,
      customerName: customer.name || "Customer",
      customerAvatar: customer.avatarUrl,
      rating,
      comment
    });

    return NextResponse.json({ comment: created }, { status: 201 });
  } catch (err) {
    console.error("post comment error", err);
    return NextResponse.json({ message: "Could not save your comment." }, { status: 500 });
  }
}
