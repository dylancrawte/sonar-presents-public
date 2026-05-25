import { verifyWebhook } from '@clerk/express/webhooks';
import express from 'express';
import { createUser, deleteUser } from '../../features/users/actions/user.action';

const router = express.Router();
const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

router.get('/test', (_req, res) => {
  res.json({ ok: true, route: 'webhooks' });
});

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!webhookSecret) {
    console.warn(
      'CLERK_WEBHOOK_SIGNING_SECRET not set — webhook stub only (demo mode).',
    );
    return res.status(501).json({
      message:
        'Webhooks disabled in demo mode. Set CLERK_WEBHOOK_SIGNING_SECRET to enable Clerk sync.',
    });
  }

  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const clerkID = evt.data.id;
      const primaryEmail = evt.data.email_addresses?.find(
        (e: { id: string }) => e.id === evt.data.primary_email_address_id,
      );
      const email =
        primaryEmail?.email_address ??
        evt.data.email_addresses?.[0]?.email_address ??
        null;

      if (!email) {
        console.warn('user.created: no email for user', clerkID);
        return res.send('Webhook received');
      }

      await createUser({ clerkID, email });
    }

    if (eventType === 'user.deleted') {
      await deleteUser(evt.data.id!);
    }

    return res.send('Webhook received');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).send('Error verifying webhook');
  }
});

export default router;
