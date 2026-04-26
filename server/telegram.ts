import TelegramBot from "node-telegram-bot-api";
import { generateChatReply } from "./ai.js";

/**
 * Sets up and initializes the Telegram bot integration
 * Using node-telegram-bot-api as per the original integration plan.
 */
export function setupTelegramBot(token: string) {
  if (!token) {
    console.warn("[Telegram] No bot token provided. Telegram integration disabled.");
    return;
  }

  try {
    // Initialize bot with polling
    // Note: If you face EPROTO errors, it might be due to SSL/TLS version mismatch in the environment.
    const bot = new TelegramBot(token, { 
      polling: true,
      // request: {
      //   // Optional: add proxy or specific SSL options if needed
      // }
    });

    console.log("[Telegram] Bot initialized and listening for messages (polling)...");

    // Handle incoming messages
    bot.on("message", async (msg) => {
      if (!msg.text) return;

      const chatId = msg.chat.id;
      const text = msg.text;
      const firstName = msg.from?.first_name || "User";

      console.log(`[Telegram] Received message from ${firstName}: ${text}`);

      // Don't respond to commands for now, or handle /start
      if (text.startsWith("/")) {
        if (text === "/start") {
          bot.sendMessage(chatId, "Hello! I am OpenClaw, the Sqamtho AI assistant. How can I help you today?");
        }
        return;
      }

      try {
        // Show typing indicator
        await bot.sendChatAction(chatId, "typing");

        // Generate reply from AI
        const reply = await generateChatReply(text);

        // Send reply back to user
        await bot.sendMessage(chatId, reply);
      } catch (error) {
        console.error("[Telegram] Error generating/sending reply:", error);
        bot.sendMessage(chatId, "Sorry, I am having trouble connecting to my brain (OpenClaw) right now. Please try again later.");
      }
    });

    // Handle polling errors for debugging
    bot.on("polling_error", (error) => {
      console.error("[Telegram] Polling error:", error.code, error.message);
      // Log more details for EPROTO
      if (error.code === 'EPROTO' || error.message.includes('SSL')) {
        console.error("[Telegram] SSL/TLS Protocol error detected. This may be due to environment network restrictions.");
      }
    });

    return bot;
  } catch (error) {
    console.error("[Telegram] Failed to initialize bot setup:", error);
  }
}
