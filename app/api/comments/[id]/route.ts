import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { deleteProductComment, updateProductComment } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ message: "Please log in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rating = Number(body.rating);
  const comment = String(body.comment || "").trim();

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
    const updated = await updateProductComment(params.id, session.customerId, { rating, comment });
    if (!updated) {
      return NextResponse.json({ message: "Comment not found." }, { status: 404 });
    }
    return NextResponse.json({ comment: updated });
  } catch (err) {
    console.error("update comment error", err);
    return NextResponse.json({ message: "Could not update your comment." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ message: "Please log in." }, { status: 401 });
  }

  try {
    await deleteProductComment(params.id, session.customerId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete comment error", err);
    return NextResponse.json({ message: "Could not delete your comment." }, { status: 500 });
  }
}
