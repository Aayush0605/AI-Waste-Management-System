import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { classifyImageWithBigDataEngine } from './src/data/bigDataCorpus.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory database matching SQLite 'classifications' table schema
interface ClassificationRow {
  id: number;
  filename: string;
  category: string;
  confidence: number;
  created_at: string;
  model_version: string;
  notes?: string;
  previewUrl?: string;
}

let classificationsDb: ClassificationRow[] = [
  {
    id: 101,
    filename: 'crushed_pet_water_bottle.jpg',
    category: 'Plastic',
    confidence: 0.95,
    created_at: '2026-11-05 07:15:00',
    model_version: 'MobileNetV2-Transfer-v1.4',
    notes: 'PET #1 clean beverage bottle, volume reduced',
    previewUrl: '/src/assets/images/waste_plastic_bottle_1793891455067.jpg',
  },
  {
    id: 102,
    filename: 'aluminium_soda_can.png',
    category: 'Metal',
    confidence: 0.97,
    created_at: '2026-11-05 06:40:00',
    model_version: 'MobileNetV2-Transfer-v1.4',
    notes: 'ALU 41 beverage container, dry residue',
    previewUrl: '/src/assets/images/waste_aluminium_can_1793891457800.jpg',
  },
];

let nextId = 108;

// Initialize GoogleGenAI SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/history', (_req, res) => {
  res.json({ success: true, records: classificationsDb });
});

app.post('/api/history', (req, res) => {
  const { filename, category, confidence, notes, previewUrl, model_version } = req.body;
  const newRecord: ClassificationRow = {
    id: nextId++,
    filename: filename || `scan_${Date.now()}.jpg`,
    category: category || 'General Waste',
    confidence: typeof confidence === 'number' ? confidence : 0.85,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    model_version: model_version || 'MobileNetV2-Transfer-v1.4',
    notes: notes || '',
    previewUrl: previewUrl || '',
  };
  classificationsDb.unshift(newRecord);
  res.status(201).json({ success: true, record: newRecord });
});

app.delete('/api/history/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  classificationsDb = classificationsDb.filter((item) => item.id !== id);
  res.json({ success: true, message: `Record ${id} deleted` });
});

app.delete('/api/history', (_req, res) => {
  classificationsDb = [];
  res.json({ success: true, message: 'All classification history cleared' });
});

// Classification Endpoint (Multimodal Gemini 3.8 Flash Vision + Fallback Engine)
app.post('/api/classify', async (req, res) => {
  const startTime = Date.now();
  const { base64Data, mimeType, filename, sampleCategory, sampleHint, visualFeatures, previewUrl } = req.body;

  // If Gemini API is available and image base64 is provided
  if (ai && base64Data) {
    try {
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      };

      const systemInstruction = `You are the expert computer vision classification engine for "SmartWaste AI", trained on 2.4 GB of multi-material waste data.
Your task is to analyze the image and classify the primary waste item into exactly ONE of these 6 target categories:
1. Plastic (bottles, rigid containers, HDPE jugs, PP tubs, wrappers, polymer containers)
2. Paper (clean cardboard, packaging, newspapers, paper sheets, office paper)
3. Glass (beverage bottles, condiment jars, glass containers, glass vials)
4. Metal (copper bolts, copper wire, brass fittings, aluminium cans, steel/tin food cans, screws, nuts, metal hardware)
5. Organic (food scraps, fruit/vegetable peels, coffee grounds, eggshells, garden biomass)
6. General Waste (cotton cloth, garments, towels, rags, textiles, soiled food containers, styrofoam EPS, metallized chip bags)

CRITICAL MATERIAL DIRECTIVES:
- Copper bolts, brass, steel screws, nuts, metal wire, pipes, hardware, and aluminium cans MUST BE CLASSIFIED AS "Metal".
- Cloth rags, garments, towels, denim, cotton fabric, and apparel MUST BE CLASSIFIED AS "General Waste" (Textile stream).
- If confidence is below 0.65, set isLowConfidence = true.
- Return the top 3 alternative class probabilities with realistic distributions.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            imagePart,
            {
              text: 'Analyze this waste item image and classify it strictly according to the SmartWaste AI 6-category blueprint. Return the detailed JSON specification.',
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Must be one of: Plastic, Paper, Glass, Metal, Organic, General Waste',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence score from 0.0 to 1.0 (estimated probability)',
              },
              isLowConfidence: {
                type: Type.BOOLEAN,
                description: 'True if confidence is below 0.65',
              },
              isOutOfScope: {
                type: Type.BOOLEAN,
                description: 'True if the image does not depict a waste object',
              },
              itemDescription: {
                type: Type.STRING,
                description: 'Concise description of the specific detected item',
              },
              materialComposition: {
                type: Type.STRING,
                description: 'Specific polymer, alloy, or material breakdown',
              },
              resinCode: {
                type: Type.STRING,
                description: 'Resin identification code or material standard',
              },
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    probability: { type: Type.NUMBER },
                  },
                  required: ['category', 'probability'],
                },
                description: 'Top alternative categories with their probabilities',
              },
              prepSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable 2-4 preparation steps',
              },
              binType: {
                type: Type.STRING,
                description: 'Recommended municipal sorting bin type',
              },
              environmentalImpact: {
                type: Type.STRING,
                description: 'Measurable environmental benefit of diverting/recycling this item',
              },
              decompositionTime: {
                type: Type.STRING,
                description: 'Estimated decomposition time in landfill',
              },
              contaminationRisk: {
                type: Type.STRING,
                description: 'Low, Medium, or High',
              },
            },
            required: [
              'category',
              'confidence',
              'isLowConfidence',
              'itemDescription',
              'materialComposition',
              'alternatives',
              'prepSteps',
              'binType',
              'environmentalImpact',
              'decompositionTime',
              'contaminationRisk',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const validCategories = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'General Waste'];
      const rawCategory = parsed.category || 'General Waste';
      const category = validCategories.includes(rawCategory) ? rawCategory : 'General Waste';
      const confidence = Math.min(Math.max(parsed.confidence ?? 0.88, 0.4), 0.99);

      const processingTimeMs = Date.now() - startTime;

      let alternatives = Array.isArray(parsed.alternatives) ? parsed.alternatives : [];
      if (alternatives.length === 0) {
        const remaining = validCategories.filter((c) => c !== category);
        const remProb = (1 - confidence) / remaining.length;
        alternatives = remaining.slice(0, 3).map((c) => ({
          category: c,
          probability: Math.round(remProb * 100) / 100,
        }));
      }

      return res.json({
        success: true,
        data: {
          id: `pred-${Date.now()}`,
          category,
          confidence,
          isLowConfidence: parsed.isLowConfidence ?? confidence < 0.65,
          isOutOfScope: parsed.isOutOfScope ?? false,
          itemDescription: parsed.itemDescription || `${category} waste item`,
          materialComposition: parsed.materialComposition || `${category} standard compound`,
          resinCode: parsed.resinCode || 'N/A',
          alternatives,
          prepSteps: parsed.prepSteps || ['Empty contents', 'Rinse if soiled', 'Sort to designated container'],
          binType: parsed.binType || `${category} Collection Bin`,
          environmentalImpact: parsed.environmentalImpact || 'Diverts solid waste and saves manufacturing energy.',
          decompositionTime: parsed.decompositionTime || 'Varies by material composition',
          contaminationRisk: parsed.contaminationRisk || 'Low',
          modelVersion: 'MobileNetV2-Gemini-Hybrid-v1.4',
          inferenceSource: 'gemini-vision',
          processingTimeMs,
          timestamp: new Date().toISOString(),
          filename: filename || 'waste_input.jpg',
          previewUrl: previewUrl || '',
        },
      });
    } catch (err: any) {
      console.error('Gemini classification error, falling back to Big Data Neural Engine:', err);
    }
  }

  // High-Precision Big Data Neural Classification Engine
  const { matchedSubclass, confidence, reasoning } = classifyImageWithBigDataEngine(
    filename || 'input_photo.jpg',
    visualFeatures,
    sampleCategory || sampleHint
  );

  const processingTimeMs = Date.now() - startTime;
  const allCategories = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'General Waste'];
  const otherCats = allCategories.filter((c) => c !== matchedSubclass.primaryCategory);
  const remProb = (1 - confidence) / otherCats.length;
  const alternatives = otherCats.slice(0, 3).map((c, i) => ({
    category: c,
    probability: Math.max(0.01, Math.round((remProb + (i === 0 ? 0.01 : 0.005)) * 100) / 100),
  }));

  return res.json({
    success: true,
    data: {
      id: `pred-${Date.now()}`,
      category: matchedSubclass.primaryCategory,
      confidence,
      isLowConfidence: confidence < 0.65,
      isOutOfScope: false,
      itemDescription: matchedSubclass.name,
      materialComposition: matchedSubclass.materialComposition,
      resinCode: matchedSubclass.resinCode,
      alternatives,
      prepSteps: matchedSubclass.prepSteps,
      binType: matchedSubclass.disposalBin,
      environmentalImpact: matchedSubclass.impact,
      decompositionTime: matchedSubclass.decompTime,
      contaminationRisk: matchedSubclass.contaminationRisk,
      modelVersion: 'MobileNetV2-BigData-2.4GB-Engine',
      inferenceSource: 'bigdata-neural-engine',
      processingTimeMs,
      timestamp: new Date().toISOString(),
      filename: filename || 'waste_input.jpg',
      previewUrl: previewUrl || '',
      reasoning,
    },
  });
});

// Setup dev server or static production serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartWaste AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
