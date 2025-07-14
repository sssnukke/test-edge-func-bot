import { Hono } from "hono";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { serve } from "@hono/node-server";

const TELEGRAM_TOKEN = '-';

const supabase: SupabaseClient = createClient(
    '-',
    '-'
);

const app = new Hono();

app.post('/webhook', async (c) => {
    try {
        const update = await c.req.json();
        const message = update?.message;

        if (!message || message.text !== '/start') {
            return c.text('Ожидается команда /start', 200);
        }

        const user = message.from;
        if (!user) return c.text('Нет данных пользователя', 400);

        const { error } = await supabase
            .from('users')
            .upsert({
                tgId: user.id
            });

        if (error) throw error;

        await sendTelegramMessage(user.id, 'Вы успешно зарегистрированы!');

        return c.text('OK');
    } catch (error: any) {
        console.error('Ошибка в /webhook:', error);
        return c.text('Ошибка: ' + error.message, 500);
    }
});

async function sendTelegramMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        })
    });
}

serve(app, (info) => {
    console.log(`Сервер запущен на http://localhost:${info.port}`);
});
