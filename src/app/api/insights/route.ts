import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  datasetName: z.string().max(100),
  rowCount: z.number().int().nonnegative(),
  columnCount: z.number().int().nonnegative(),
  qualityScore: z.number().min(0).max(100),
  numericSummaries: z.array(
    z.object({
      column: z.string(),
      mean: z.number().nullable(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      stdDev: z.number().nullable(),
    })
  ).max(50),
  categoricalSummaries: z.array(
    z.object({
      column: z.string(),
      uniqueCount: z.number().int().nonnegative(),
      mode: z.string().nullable(),
      modePercentage: z.number().nullable(),
    })
  ).max(50),
  strongCorrelations: z.array(
    z.object({
      col1: z.string(),
      col2: z.string(),
      correlation: z.number(),
    })
  ).max(25),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload structure.',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check for configured API keys (supports OpenAI or compatible endpoint)
    const apiKey =
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        isRealAI: false,
        message:
          'No AI API key found in server environment variables (OPENAI_API_KEY or AI_API_KEY). InsightFlow has fallen back to the deterministic local rule engine.',
        modelUsed: 'Local Rule Engine (Offline)',
        executiveSummary: `Analysis of ${data.datasetName} (${data.rowCount.toLocaleString()} rows, ${data.columnCount} columns) shows an overall health score of ${data.qualityScore}/100. Local analysis detected ${data.strongCorrelations.length} key correlation pairs across numeric metrics.`,
        keyFindings: [
          `Dataset includes ${data.numericSummaries.length} numeric metrics and ${data.categoricalSummaries.length} categorical dimensions.`,
          data.strongCorrelations.length > 0
            ? `Top relationship observed between ${data.strongCorrelations[0].col1} and ${data.strongCorrelations[0].col2} (r = ${data.strongCorrelations[0].correlation}).`
            : 'No extreme collinearities detected among numeric features.',
        ],
        hypotheses: [
          'Variance in primary metrics is likely concentrated within high-density categories.',
        ],
        dataQualityObservations: [
          `Quality score currently stands at ${data.qualityScore}/100 based on completeness and uniqueness heuristics.`,
        ],
        suggestedActions: [
          'Inspect distribution histograms for potential skew in primary metrics.',
          'Consider segmenting data across top categorical features to identify sub-group trends.',
        ],
      });
    }

    // If API key is present, invoke OpenAI-compatible endpoint
    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    const systemPrompt = `You are a Senior Data Scientist analyzing dataset metadata.
You will receive statistical summaries (means, ranges, top categories, correlations).
Provide a structured JSON response matching this schema:
{
  "executiveSummary": "Concise 2-3 sentence executive synthesis",
  "keyFindings": ["3-5 concrete factual analytical observations based on the numbers"],
  "hypotheses": ["2-3 plausible hypotheses to test"],
  "dataQualityObservations": ["1-2 observations on data distribution or hygiene"],
  "suggestedActions": ["2-3 specific business or analytical next steps"]
}
Respond strictly with valid JSON.`;

    const userPrompt = `Dataset Name: ${data.datasetName}
Records: ${data.rowCount} rows, ${data.columnCount} columns
Quality Rating: ${data.qualityScore}/100
Numeric Features: ${JSON.stringify(data.numericSummaries)}
Categorical Features: ${JSON.stringify(data.categoricalSummaries)}
Strong Correlations: ${JSON.stringify(data.strongCorrelations)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const apiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return NextResponse.json({
        isRealAI: false,
        error: `AI provider error (${apiResponse.status}): ${errText.substring(0, 150)}`,
        modelUsed: 'Fallback to Local Engine',
      });
    }

    const resultJson = await apiResponse.json();
    const content = resultJson.choices?.[0]?.message?.content;
    const parsedAI = JSON.parse(content);

    return NextResponse.json({
      isRealAI: true,
      modelUsed: model,
      executiveSummary: parsedAI.executiveSummary || 'Executive summary generated.',
      keyFindings: parsedAI.keyFindings || [],
      hypotheses: parsedAI.hypotheses || [],
      dataQualityObservations: parsedAI.dataQualityObservations || [],
      suggestedActions: parsedAI.suggestedActions || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        isRealAI: false,
        error: err.name === 'AbortError' ? 'AI request timed out.' : (err.message || 'Server error'),
        modelUsed: 'Fallback Engine',
      },
      { status: 200 } // Keep 200 so frontend gracefully handles fallback without crashing
    );
  }
}
