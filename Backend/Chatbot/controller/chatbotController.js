const { Groq } = require("groq-sdk");
const checkLimit = require("../utils/checkLimit");
const getTopDocuments = require("../utils/getTopDoc");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getChatBotResponce (req, res) {
  const { query, phone } = req.body;

  if (!query || !phone) {
    return res.status(400).json({ response: "Query and phone are required." });
  }

  const allowed = await checkLimit(phone);
  if (!allowed) {
    return res.json({ response: "Daily limit of 15 queries reached. Try tomorrow." });
  }

  const topDocs = getTopDocuments(query, 6000);
  const context = topDocs.join("\n---\n");

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content:
            "You are a kind, helpful assistant for Velammal Engineering College in Surapet, Chennai. " +
            "Only answer queries related to the college. Ignore irrelevant info.\n\n" +
            "Context:\n" + context + "\n\n" +
            "Query:\n" + query,
        },
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const answer = chatCompletion.choices[0].message.content;
    res.json({ response: answer, debug: topDocs });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ response: "Error from Groq API" });
  }
}

module.exports = { getChatBotResponce }