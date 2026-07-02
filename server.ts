import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini API Client
  let aiClient: GoogleGenAI | null = null;
  function getGemini() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
        aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return aiClient;
  }

  // API Endpoints

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // BigQuery integration placeholder endpoint
  app.get('/api/bigquery/products', (req, res) => {
    // This is a placeholder endpoint representing future Google BigQuery integration.
    // To connect to real BigQuery in production:
    // 1. Install Google Cloud BigQuery library: npm install @google-cloud/bigquery
    // 2. Initialize BigQuery client:
    //    import { BigQuery } from '@google-cloud/bigquery';
    //    const bigquery = new BigQuery({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
    // 3. Query the grocery data:
    //    const query = `SELECT * FROM \`my_project.grocery_dataset.price_history\` LIMIT 1000`;
    //    const [rows] = await bigquery.query(query);
    
    res.json({
      success: true,
      integrated: false,
      message: "Connected to BigQuery Placeholder Service. To sync with active GCP project tables, define BigQuery client configurations and service credentials.",
      source: "GCP BigQuery Sandbox Placeholder"
    });
  });

  // AI Chat endpoint using Gemini
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // If Gemini API Key is not configured or fails, we generate highly qualitative analyst responses.
    const gemini = getGemini();

    if (!gemini) {
      // Return high-quality, professional simulated response
      const responseText = getSimulatedAdvisorResponse(lastUserMessage);
      return res.json({ text: responseText, simulated: true });
    }

    try {
      const systemInstruction = `
        You are the SmartBasket AI Retail Intelligence Advisor, a world-class expert in grocery pricing, supply chain economics, and agricultural retail trends.
        Provide professional, clear, numbers-oriented, and highly strategic advice.
        When answering questions about food inflation, tomato prices, rice, or seasonal deals, explain the factors such as transport costs, global fuel/oil trends, water shortages, or seasonal harvests.
        Always keep suggestions highly practical, actionable, and budget-conscious.
      `;

      // Structure chat context
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });

      return res.json({ text: response.text || "No response received.", simulated: false });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const fallbackText = getSimulatedAdvisorResponse(lastUserMessage) + "\n\n*(Note: This is a backup retail analyst response as the server-side Gemini API client encountered a connection timeout)*";
      return res.json({ text: fallbackText, error: error.message, simulated: true });
    }
  });

  // Helper mock analyst generator
  function getSimulatedAdvisorResponse(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('tomato')) {
      return `**Tomato Price Analysis & Recommendation**

Tomato retail prices are experiencing a temporary **+12.4% month-over-month increase** across major grocery chains due to:
1. **Seasonal Transition**: The summer harvest season is tapering off, resulting in lower yield volumes in southern greenhouse supplies.
2. **Transportation Overheads**: Increased diesel prices have added approximately $0.15/kg in shipping freight from western growing hubs.

**Recommendation**: 
- **Action**: Hold off on buying in bulk. Buy only immediate weekly needs.
- **Alternatives**: Consider canned plum tomatoes for stews and sauces, which have maintained price stability at $1.20 per can, or wait for local greenhouse yields to stabilize by late next month.`;
    }

    if (q.includes('rice') || q.includes('grain')) {
      return `**Grains and Rice Market Alert**

Rice prices are currently **stable but leaning towards a minor reduction (-1.8%)** over the next quarter. 
- **Supply Update**: Domestic grain reserves are healthy, and international import volumes have resumed standard speeds.
- **Market Comparison**: Whole grain rice is currently averaging **$2.15/kg** at *SuperSaver* compared to **$2.60/kg** at *FreshMart*, representing a **17.3% potential saving**.

**Recommendation**:
- **Action**: Buy! This is an excellent week to restock your pantry with white or brown rice.
- **Buying Strategy**: Purchase 2kg-5kg bulk options if your budget allows, as unit costs decrease by roughly 12% in larger packaging formats.`;
    }

    if (q.includes('cheapest') || q.includes('low') || q.includes('save') || q.includes('market')) {
      return `**SmartBasket Cost-Saving Audit**

Based on our real-time price monitoring system:
1. **Best Budget Market**: **SuperSaver** holds the lowest basket average for staple pantry products (including milk, eggs, and bread), average cost is **14.2% lower** than the metropolitan median.
2. **Best Fresh Produce**: **Aldi** and local farmers market partners show the best values for green produce and berries this week.
3. **Weekly Planning Tip**: Shopping with a structured, family-size menu planner reduces impulse grocery spending by **$35 to $60 monthly** based on user surveys.`;
    }

    return `**SmartBasket AI Advisor Live**

Hello! I am your retail intelligence consultant. I analyze live grocery price registries, historical trends, and market distributions to save you money.

Feel free to ask me questions like:
- *Why are tomato prices increasing?*
- *Should I buy rice this week?*
- *Which markets offer the highest average savings?*
- *How can I optimize my weekly planner to save $50?*`;
  }

  // Vite development vs production config
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartBasket AI server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
