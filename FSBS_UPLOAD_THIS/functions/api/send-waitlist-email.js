const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const email = String(body.email || '').trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return json({ error: 'Enter a valid email address.' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return json(
      {
        error: 'Email is saved locally, but Resend is not configured yet.',
      },
      500,
    );
  }

  const safeEmail = escapeHtml(email);

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `fsbs-waitlist-${email}`,
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [email],
      subject: 'You are on the FSBS beta waitlist',
      text: [
        'You are on the FSBS beta waitlist!',
        '',
        'Thanks for joining early. We will email you when the Android beta is ready.',
        '',
        'Block distractions. Finish focus sessions. Level up your pet.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; background: #fff7e7; padding: 28px;">
          <div style="max-width: 560px; margin: 0 auto; background: #fffaf0; border: 2px solid #d8b99f; border-radius: 22px; padding: 28px; color: #231916;">
            <p style="margin: 0 0 10px; color: #7852c6; font-weight: 800;">FSBS Android Beta</p>
            <h1 style="margin: 0 0 16px; font-size: 30px;">You are on the waitlist!</h1>
            <p style="font-size: 16px; line-height: 1.6;">Thanks for joining early. We will email <strong>${safeEmail}</strong> when the Android beta is ready.</p>
            <p style="font-size: 16px; line-height: 1.6;">Block distractions, finish focus sessions, earn XP, and level up your pet.</p>
            <p style="margin-top: 24px; font-weight: 800;">See you soon,<br />The FSBS team</p>
          </div>
        </div>
      `,
    }),
  });

  if (!resendResponse.ok) {
    let providerError = 'Email provider rejected the request.';

    try {
      const data = await resendResponse.json();
      providerError = data.message || data.error || providerError;
    } catch {
      // Keep the generic message when Resend does not return JSON.
    }

    return json({ error: providerError }, 502);
  }

  return json({ ok: true });
}
