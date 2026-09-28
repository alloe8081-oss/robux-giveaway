export default async (req) => {
  // CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers
    });
  }

  try {
    const body = await req.json();
    const { nick, amount } = body;

    const TOKEN = Netlify.env.get('BOT_TOKEN');
    const CHAT_ID = Netlify.env.get('CHAT_ID');

    if (!nick || !amount) {
      return new Response(JSON.stringify({ error: 'no data' }), {
        status: 400, headers
      });
    }

    // Отправляем заявку тебе в Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `🔔 Новая заявка на Robux\n\n👤 Ник: ${nick}\n💰 Сумма: ${amount} R$\n\nОткрой сайт, чтобы одобрить.`,
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Одобрить', url: 'https://app.netlify.com' },
            { text: '❌ Отклонить', url: 'https://app.netlify.com' }
          ]]
        }
      })
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return new Response(JSON.stringify({ error: 'telegram failed', info: tgData }), {
        status: 500, headers
      });
    }

    // Отвечаем сайту, что заявка ушла (одобрение будет вручную, поэтому сразу пишем "sent")
    return new Response(JSON.stringify({ status: 'sent' }), {
      status: 200, headers
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers
    });
  }
};
