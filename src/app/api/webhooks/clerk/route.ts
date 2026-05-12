import { headers } from 'next/headers';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * Clerk webhook endpoint.
 *
 * Set up in Clerk Dashboard → Webhooks → Add Endpoint:
 *   URL:     https://yourdomain.com/api/webhooks/clerk
 *   Events:  user.created, user.updated, user.deleted
 *
 * Copy the signing secret into CLERK_WEBHOOK_SECRET env var.
 */
export async function POST(req: Request) {
  const SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  // Verify the webhook signature using svix
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle the event
  try {
    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses[0]?.email_address;
        if (!primaryEmail) break;

        await prisma.user.upsert({
          where: { clerkId: id },
          create: {
            clerkId: id,
            email: primaryEmail,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
            role: 'STUDENT',
          },
          update: {
            email: primaryEmail,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
          },
        });
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses[0]?.email_address;
        if (!primaryEmail) break;

        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
          },
        });
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;
        if (!id) break;
        // Soft-handle: don't actually delete (preserve enrollment history).
        // If you want hard-delete, switch to prisma.user.delete and ensure cascades are right.
        await prisma.user.updateMany({
          where: { clerkId: id },
          data: { email: `deleted_${id}@removed.local` },
        });
        break;
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Handler error', { status: 500 });
  }
}
