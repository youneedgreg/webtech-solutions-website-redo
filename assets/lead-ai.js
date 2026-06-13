// Client helper for the AI-aside in the lead chat (assets/lead-agent.js).
// Talks to api/lead-ai.php. Any failure (network, non-2xx, bad JSON,
// or this script being unreachable e.g. when opened via file://) returns
// null so the chat can fall back to a friendly WhatsApp nudge.
window.WebtechAI = (function () {
  const ENDPOINT = '/api/lead-ai.php';

  async function ask(payload) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json || typeof json.reply !== 'string' || !json.reply.trim()) return null;
      return { reply: json.reply.trim() };
    } catch (err) {
      return null;
    }
  }

  return { ask };
})();
