const { Groq } = require("groq-sdk");
const checkLimit = require("../utils/checkLimit");
const getTopDocuments = require("../utils/getTopDoc");

const groqApiKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
];

function getCurrentApiKey() {
  const intervalSeconds = 16200; // 4 hours 30 mins
  const now = Math.floor(Date.now() / 1000);
  const index = Math.floor(now / intervalSeconds) % groqApiKeys.length;
  return groqApiKeys[index];
}

async function getChatBotResponce(req, res) {
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

  const groq = new Groq({ apiKey: getCurrentApiKey() });

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: `
          You are an AI chatbot assistant for **Velammal Engineering College**, located in **Surapet, Chennai**. 
          Your primary role is to help students, parents, staff, and visitors by providing accurate and concise information **only** about Velammal Engineering College.

          Strictly follow these rules:
          - Keep the answer short and within 100 tokens.
          - Do not guess or hallucinate.
          - Answer only queries related to Velammal Engineering College.
          - Do **not** respond to questions that are not relevant to the college.
          - Politely reject any unrelated queries with a response like: "I'm here to assist with Velammal Engineering College related questions only."
          - Use the context provided to answer queries. If the answer is not found in the context, you can say: "Sorry, I couldn't find that information at the moment."
          - Always be polite, helpful, and respectful in your responses.
          - Do not fabricate information. If you're unsure, say so.

          Context provided may include course details, faculty info, admissions, events, departments, contact info, achievements, and more related to the college.
          `.trim(),
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuery:\n${query}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 100,
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

module.exports = { getChatBotResponce };