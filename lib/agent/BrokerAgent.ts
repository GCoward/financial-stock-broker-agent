/**
 * @file BrokerAgent.ts
 * @description Autonomous broker agent powered by OpenAI Function Calling.
 *
 * * The BrokerAgent orchestrates three core financial capabilities:
 *   1. fetchStockPrice  – retrieves real-time price for a given ticker symbol.
 *   2. analyzeSentiment – scores market sentiment from news headlines.
 *   3. executeTrade     – simulates or places a BUY/SELL order.
 *
 * ! CRITICAL: Never log or persist the OpenAI API key anywhere in this file.
 *   Always read it from process.env.OPENAI_API_KEY at runtime.
 *
 * ? This file uses OpenAI's tool/function-calling feature (not Assistants API)
 *   so that each capability maps 1-to-1 to a JSON Schema tool definition.
 *
 * TODO: Add streaming support via openai.chat.completions.stream() once
 *       the SSE endpoint is wired into the Next.js App Router.
 * TODO: Integrate real brokerage API (Alpaca / Interactive Brokers) to
 *       replace the mock executeTrade implementation.
 */

import OpenAI from 'openai';
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ---------------------------------------------------------------------------
// Domain Types
// ---------------------------------------------------------------------------

/** Direction of a trade order. */
export type TradeSide = 'BUY' | 'SELL';

/** Result returned by fetchStockPrice. */
export interface StockPriceResult {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

/** Per-headline sentiment score in [-1, 1]. */
export interface HeadlineSentiment {
  headline: string;
  /** -1 = very negative, 0 = neutral, +1 = very positive */
  score: number;
}

/** Aggregate sentiment result across all supplied headlines. */
export interface SentimentResult {
  overall: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  averageScore: number;
  headlines: HeadlineSentiment[];
}

/** Result of a trade execution request. */
export interface TradeResult {
  orderId: string;
  symbol: string;
  side: TradeSide;
  amount: number;
  status: 'FILLED' | 'PENDING' | 'REJECTED';
  executedAt: string;
}

/** Union of all possible tool call results. */
export type ToolCallResult = StockPriceResult | SentimentResult | TradeResult;

/** Arguments for a raw tool-call dispatcher. */
interface ToolCallArgs {
  name: string;
  arguments: string;
}

// ---------------------------------------------------------------------------
// OpenAI Tool Definitions (JSON Schema)
// ---------------------------------------------------------------------------

/**
 * * Defines the three financial tools exposed to the language model.
 *   The model decides which tool(s) to call based on the user's prompt.
 */
const BROKER_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'fetchStockPrice',
      description: 'Retrieves the latest market price for a given stock ticker symbol.',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock ticker symbol, e.g. "AAPL" or "TSLA".',
          },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyzeSentiment',
      description:
        'Analyses a list of news headlines and returns an overall market sentiment score.',
      parameters: {
        type: 'object',
        properties: {
          newsHeadlines: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of recent news headline strings to analyse.',
          },
        },
        required: ['newsHeadlines'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'executeTrade',
      description: 'Places a BUY or SELL order for a specified stock symbol and share amount.',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock ticker symbol.',
          },
          side: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            description: 'Direction of the trade.',
          },
          amount: {
            type: 'number',
            description: 'Number of shares to trade (must be a positive integer).',
          },
        },
        required: ['symbol', 'side', 'amount'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// BrokerAgent Class
// ---------------------------------------------------------------------------

/**
 * BrokerAgent wraps OpenAI Function Calling to provide an autonomous
 * financial assistant capable of fetching prices, analysing sentiment,
 * and executing simulated trades.
 *
 * @example
 * ```ts
 * const agent = new BrokerAgent(process.env.OPENAI_API_KEY!);
 * const result = await agent.run('What is the current price of AAPL?');
 * console.log(result);
 * ```
 */
export class BrokerAgent {
  private readonly client: OpenAI;
  private readonly model: string;

  /**
   * Creates a new BrokerAgent instance.
   *
   * @param apiKey - OpenAI API key. Read from environment; never hard-code.
   * @param model  - OpenAI model to use (default: 'gpt-4o-mini').
   *
   * ! CRITICAL: Ensure apiKey is loaded exclusively from environment variables.
   *   Exposing this key in source control is a critical security violation.
   */
  constructor(apiKey: string, model = 'gpt-4o-mini') {
    // ! apiKey must never be committed to source control or logged.
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Processes a natural-language instruction from the user.
   * The model autonomously selects and calls the appropriate tools.
   *
   * * This method implements a single-turn agentic loop:
   *   1. Send the user message to the model with available tools.
   *   2. If the model requests tool calls, execute them.
   *   3. Feed results back and return the final assistant message.
   *
   * @param userMessage - Natural-language instruction, e.g. "Buy 10 shares of TSLA".
   * @returns The final assistant text response.
   */
  async run(userMessage: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are an autonomous financial broker agent. ' +
          'Use the available tools to fulfil user requests accurately. ' +
          'Always confirm trade details before reporting back.',
      },
      { role: 'user', content: userMessage },
    ];

    // First model call – may request tool calls
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: BROKER_TOOLS,
      tool_choice: 'auto',
    });

    const assistantMessage = response.choices[0].message;

    // ? If there are no tool calls the model answered directly – return immediately.
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return assistantMessage.content ?? '';
    }

    // Execute every requested tool call in parallel for efficiency
    const toolResults = await Promise.all(
      assistantMessage.tool_calls.map(async (toolCall) => {
        const result = await this.dispatchToolCall({
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        });
        return {
          tool_call_id: toolCall.id,
          role: 'tool' as const,
          content: JSON.stringify(result),
        };
      }),
    );

    // Second model call – provide tool results and get final answer
    const finalResponse = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        ...messages,
        assistantMessage,
        ...toolResults,
      ],
      tools: BROKER_TOOLS,
    });

    return finalResponse.choices[0].message.content ?? '';
  }

  // -------------------------------------------------------------------------
  // Tool Implementations
  // -------------------------------------------------------------------------

  /**
   * Fetches the latest stock price for a given ticker symbol.
   *
   * * Currently returns a realistic mock price. Replace this with a call to
   *   a real market data provider (e.g. Alpaca, Polygon.io, Yahoo Finance).
   *
   * @param symbol - Uppercase stock ticker, e.g. "AAPL".
   * @returns StockPriceResult containing price, currency and timestamp.
   *
   * TODO: Integrate Polygon.io REST API: GET /v2/last/trade/{symbol}
   */
  async fetchStockPrice(symbol: string): Promise<StockPriceResult> {
    // ? Mock implementation – returns a stable seeded price for determinism in tests.
    const mockPrices: Record<string, number> = {
      AAPL: 189.84,
      TSLA: 245.11,
      MSFT: 415.26,
      AMZN: 185.07,
      GOOGL: 175.98,
      NVDA: 875.4,
    };

    const price = mockPrices[symbol.toUpperCase()] ?? parseFloat((Math.random() * 500 + 50).toFixed(2));

    return {
      symbol: symbol.toUpperCase(),
      price,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Scores market sentiment from an array of news headlines.
   *
   * * Uses a simple keyword-based scoring model. In production this should
   *   be replaced with an ML-backed NLP service or the OpenAI Embeddings API.
   *
   * @param newsHeadlines - Array of raw headline strings.
   * @returns SentimentResult with per-headline scores and an overall verdict.
   *
   * TODO: Replace keyword heuristic with a fine-tuned sentiment classifier.
   */
  async analyzeSentiment(newsHeadlines: string[]): Promise<SentimentResult> {
    const positiveKeywords = ['surge', 'gain', 'bull', 'rally', 'profit', 'beat', 'rise', 'soar', 'upgrade', 'record'];
    const negativeKeywords = ['crash', 'drop', 'bear', 'loss', 'miss', 'fall', 'plunge', 'downgrade', 'concern', 'risk'];

    const headlines: HeadlineSentiment[] = newsHeadlines.map((headline) => {
      const lower = headline.toLowerCase();
      const posHits = positiveKeywords.filter((kw) => lower.includes(kw)).length;
      const negHits = negativeKeywords.filter((kw) => lower.includes(kw)).length;
      const score = parseFloat(((posHits - negHits) / Math.max(posHits + negHits, 1)).toFixed(2));
      return { headline, score };
    });

    const averageScore =
      headlines.length === 0
        ? 0
        : parseFloat(
            (headlines.reduce((acc, h) => acc + h.score, 0) / headlines.length).toFixed(2),
          );

    const overall: SentimentResult['overall'] =
      averageScore > 0.1 ? 'BULLISH' : averageScore < -0.1 ? 'BEARISH' : 'NEUTRAL';

    return { overall, averageScore, headlines };
  }

  /**
   * Executes a mock trade order for the given symbol, side and amount.
   *
   * ! CRITICAL: Replace this mock with a real brokerage integration before
   *   any production deployment. Real order placement requires regulatory
   *   compliance, proper error handling, and idempotency guarantees.
   *
   * @param symbol - Stock ticker symbol.
   * @param side   - 'BUY' or 'SELL'.
   * @param amount - Number of shares (positive integer).
   * @returns TradeResult confirming the order details and fill status.
   *
   * TODO: Integrate Alpaca Markets Orders API: POST /v2/orders
   */
  async executeTrade(symbol: string, side: TradeSide, amount: number): Promise<TradeResult> {
    if (amount <= 0) {
      return {
        orderId: '',
        symbol,
        side,
        amount,
        status: 'REJECTED',
        executedAt: new Date().toISOString(),
      };
    }

    // ? Simulates a ~95 % fill rate with occasional PENDING status.
    const status: TradeResult['status'] = Math.random() < 0.95 ? 'FILLED' : 'PENDING';

    return {
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      symbol: symbol.toUpperCase(),
      side,
      amount,
      status,
      executedAt: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Dispatches a raw tool-call object to the appropriate method.
   *
   * @param toolCall - Tool name and serialised JSON arguments from the model.
   * @returns Resolved ToolCallResult or an error object on failure.
   */
  private async dispatchToolCall(toolCall: ToolCallArgs): Promise<ToolCallResult | { error: string }> {
    try {
      const args = JSON.parse(toolCall.arguments) as Record<string, unknown>;

      switch (toolCall.name) {
        case 'fetchStockPrice':
          return this.fetchStockPrice(args['symbol'] as string);

        case 'analyzeSentiment':
          return this.analyzeSentiment(args['newsHeadlines'] as string[]);

        case 'executeTrade':
          return this.executeTrade(
            args['symbol'] as string,
            args['side'] as TradeSide,
            args['amount'] as number,
          );

        default:
          return { error: `Unknown tool: ${toolCall.name}` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: `Tool call failed: ${message}` };
    }
  }
}
