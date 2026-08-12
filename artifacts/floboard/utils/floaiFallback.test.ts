import { describe, expect, it } from 'vitest';
import { generateFallbackAiResponse } from './floaiFallback';

/**
 * Tests for the FloAI offline fallback generator. This is the response shown
 * whenever the backend proxy AND the direct Gemini call fail, so it must
 * still reflect the user's selected risk mode and route by topic.
 * No real Gemini API calls are made anywhere in these tests.
 */

describe('generateFallbackAiResponse — conversational routing', () => {
  it('answers greetings conversationally instead of forcing an investment report', () => {
    const out = generateFallbackAiResponse('hi there', 'moderate');
    expect(out).not.toContain('[MODERATE MODE] Analysis');
    expect(out).toMatch(/FloAI/);
  });

  it('mentions the active risk profile in conversational replies', () => {
    const out = generateFallbackAiResponse('what can you do?', 'aggressive');
    expect(out).toContain('AGGRESSIVE');
  });

  it('does not force a risk report for plain "thanks"', () => {
    const out = generateFallbackAiResponse('thank you', 'conservative');
    expect(out).toContain('CONSERVATIVE');
    expect(out).not.toContain('Analysis (');
  });
});

describe('generateFallbackAiResponse — gold/precious metals', () => {
  it('tags the aggressive analysis as AGGRESSIVE MODE', () => {
    const out = generateFallbackAiResponse('Should I buy gold right now?', 'aggressive');
    expect(out).toContain('[AGGRESSIVE MODE]');
    expect(out).toMatch(/Breakout/);
  });

  it('tags the conservative analysis as CONSERVATIVE MODE with capital preservation', () => {
    const out = generateFallbackAiResponse('What about gold?', 'conservative');
    expect(out).toContain('[CONSERVATIVE MODE]');
    expect(out).toMatch(/Capital Preservation/);
  });

  it('tags the moderate analysis as MODERATE MODE', () => {
    const out = generateFallbackAiResponse('gold outlook', 'moderate');
    expect(out).toContain('[MODERATE MODE]');
  });
});

describe('generateFallbackAiResponse — crypto', () => {
  it('conservative mode caps crypto exposure and warns of volatility', () => {
    const out = generateFallbackAiResponse('Is now a good time to buy bitcoin?', 'conservative');
    expect(out).toContain('[CONSERVATIVE MODE]');
    expect(out).toMatch(/0% and 3%/);
    expect(out).toMatch(/drawdowns|volatility/i);
  });

  it('aggressive mode favors breakout momentum in crypto', () => {
    const out = generateFallbackAiResponse('should I buy more ethereum', 'aggressive');
    expect(out).toContain('[AGGRESSIVE MODE]');
    expect(out).toMatch(/Layer-1/);
  });
});

describe('generateFallbackAiResponse — stocks/equities', () => {
  it('conservative mode highlights dividend safety', () => {
    const out = generateFallbackAiResponse('How is Apple (AAPL) performing?', 'conservative');
    expect(out).toContain('[CONSERVATIVE MODE]');
    expect(out).toMatch(/Dividend Safety/);
  });

  it('moderate mode references the 60/40 allocation', () => {
    const out = generateFallbackAiResponse('analyze nvda stock', 'moderate');
    expect(out).toContain('[MODERATE MODE]');
    expect(out).toMatch(/60\/40|Index Allocation/);
  });
});

describe('generateFallbackAiResponse — forex', () => {
  it('conservative mode warns against leveraged forex', () => {
    const out = generateFallbackAiResponse('EURUSD outlook', 'conservative');
    expect(out).toContain('[CONSERVATIVE MODE]');
    expect(out).toMatch(/Zero Speculative Leverage/);
  });
});

describe('generateFallbackAiResponse — default/macro branch', () => {
  it('uses the risk mode for generic bond/macro questions', () => {
    const out = generateFallbackAiResponse('How are treasury yields trending?', 'aggressive');
    expect(out).toContain('[AGGRESSIVE MODE]');
    expect(out).toMatch(/Maximum Growth/);
  });

  it('falls back to moderate when the risk arg is invalid/empty', () => {
    const out = generateFallbackAiResponse('inflation outlook', '');
    expect(out).toContain('[MODERATE MODE]');
  });
});
