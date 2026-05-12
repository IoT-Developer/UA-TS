import Razorpay from 'razorpay';
import crypto from 'node:crypto';

/**
 * Razorpay server-side client. Used for creating orders, fetching payment details,
 * and refunds. Never expose the keyId or keySecret to the browser — the browser
 * only ever sees NEXT_PUBLIC_RAZORPAY_KEY_ID.
 */
function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
    );
  }
  return { keyId, keySecret };
}

let _razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (_razorpay) return _razorpay;
  const { keyId, keySecret } = getRazorpayKeys();
  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
}

/**
 * Verify the signature returned by Razorpay's browser callback.
 * Razorpay signs `${order_id}|${payment_id}` with HMAC-SHA256(keySecret).
 * If our computed HMAC matches, the payment is authentic.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');
  // Constant-time compare to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(params.signature)
  );
}

/**
 * Verify the signature on incoming webhook requests.
 * Razorpay puts the signature in the x-razorpay-signature header and signs
 * the raw request body with HMAC-SHA256(webhookSecret).
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set');
    return false;
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
