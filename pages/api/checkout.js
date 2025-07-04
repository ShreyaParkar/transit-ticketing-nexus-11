
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { type, pass, ticket, wallet } = await req.json();

    let lineItems, successUrl, cancelUrl, metadata = {};
    if (type === "pass" && pass) {
      if (!pass.userId || !pass.routeId || !pass.fare) {
        return NextResponse.json({ error: "Missing required fields for pass" }, { status: 400 });
      }
      lineItems = [
        {
          price_data: {
            currency: "inr",
            unit_amount: pass.fare * 100,
            product_data: { name: `Monthly Pass (Route ${pass.routeId})` }
          },
          quantity: 1
        }
      ];
      successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pass?status=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pass?status=cancel`;
      metadata = { userId: pass.userId, type: "pass", routeId: pass.routeId };
    } else if (type === "ticket" && ticket) {
      if (!ticket.userId || !ticket.busId || !ticket.stationId || !ticket.price) {
        return NextResponse.json({ error: "Missing required fields for ticket" }, { status: 400 });
      }
      lineItems = [
        {
          price_data: {
            currency: "inr",
            unit_amount: ticket.price * 100,
            product_data: { name: `Ticket for Bus ${ticket.busId}, Station ${ticket.stationId}` }
          },
          quantity: 1
        }
      ];
      successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tickets?status=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking?status=cancel`;
      metadata = { userId: ticket.userId, type: "ticket", busId: ticket.busId, stationId: ticket.stationId };
    } else if (type === "wallet" && wallet) {
      if (!wallet.userId || !wallet.amount) {
        return NextResponse.json({ error: "Missing required fields for wallet top-up" }, { status: 400 });
      }
      lineItems = [
        {
          price_data: {
            currency: "inr",
            unit_amount: wallet.amount * 100,
            product_data: { name: "Wallet Top-up" }
          },
          quantity: 1
        }
      ];
      successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet?status=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet?status=cancel`;
      metadata = { userId: wallet.userId, type: "wallet" };
    } else {
      return NextResponse.json({ error: "Invalid type or parameters" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: "Failed to create Stripe checkout session" }, { status: 500 });
  }
}
