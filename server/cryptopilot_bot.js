// bot.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { EMA, RSI, MACD, BollingerBands } from 'technicalindicators';
import Binance from 'binance-api-node';

dotenv.config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
const client = API_KEY && API_SECRET ? Binance({ apiKey: API_KEY, apiSecret: API_SECRET }) : null;

const SIGNALS_DIR = 'output/signals';
const TRADES_DIR = 'output/trades';
const INTERVAL = '15m';
const LEVERAGE = 20;
const MAX_RISK_USDT = 1;
const CONFIDENCE_THRESHOLD = 80;

[ SIGNALS_DIR, TRADES_DIR ].forEach(dir => fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true }));

function utcnowISO() {
  return new Date().toISOString();
}

function nowStr() {
  return utcnowISO().replace(/[-:.TZ]/g, '').slice(0, 15);
}

async function getSymbols(limit = 100) {
  const res = await axios.get("https://fapi.binance.com/fapi/v1/exchangeInfo");
  return res.data.symbols
    .filter(s => s.contractType === 'PERPETUAL' && s.symbol.endsWith('USDT'))
    .map(s => s.symbol)
    .slice(0, limit);
}

async function fetchOHLCV(symbol) {
  const res = await axios.get(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${INTERVAL}&limit=300`);
  return res.data.map(c => ({
    timestamp: new Date(c[0]),
    open: +c[1], high: +c[2], low: +c[3], close: +c[4], volume: +c[5]
  }));
}

function computeIndicators(df) {
  const closes = df.map(c => c.close);
  const ema9 = EMA.calculate({ period: 9, values: closes });
  const ema21 = EMA.calculate({ period: 21, values: closes });
  const ma200 = closes.map((_, i) => i >= 199
    ? closes.slice(i - 199, i + 1).reduce((a, b) => a + b, 0) / 200
    : null);
  const rsi = RSI.calculate({ period: 14, values: closes });
  const macdRes = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
  const bbRes = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes });

  df.forEach((c, i) => {
    c.ema9 = i >= 8 ? ema9[i - 8] : null;
    c.ema21 = i >= 20 ? ema21[i - 20] : null;
    c.ma200 = ma200[i];
    c.rsi = i >= 13 ? rsi[i - 13] : null;
    const bb = i >= 19 ? bbRes[i - 19] : {};
    c.bbUpper = bb.upper; c.bbLower = bb.lower;
    const macd = i >= 33 ? macdRes[i - 33] : {};
    c.macd = macd.MACD; c.macdSignal = macd.signal; c.macdHist = macd.histogram;
  });

  return df;
}

async function generateSignal(symbol) {
  try {
    const df = await fetchOHLCV(symbol);
    if (df.length < 200) return null;
    const data = computeIndicators(df);
    const last = data[data.length - 1];
    const { close, ema9, ema21, bbUpper, bbLower } = last;
    if (!close || !ema9 || !ema21 || !bbUpper || !bbLower) return null;

    const trend = ema9 > ema21 ? 'bullish' : 'bearish';
    const side = trend === 'bullish' ? 'long' : 'short';
    const regime = trend === 'bullish' ? 'trend' : 'scalp';

    const SL_PCT = 0.015;
    const BASE_USDT = 1;
    const qty = +(BASE_USDT / close).toFixed(4);

    let stopLoss, takeProfit, risk, reward, liquidationPrice;
    if (side === 'long') {
      liquidationPrice = +(close * (1 - 1 / LEVERAGE)).toFixed(4);
      stopLoss = Math.max(close * (1 - SL_PCT), liquidationPrice * 1.01);
      takeProfit = close + (close - stopLoss) * 2;
      risk = close - stopLoss;
      reward = takeProfit - close;
    } else {
      liquidationPrice = +(close * (1 + 1 / LEVERAGE)).toFixed(4);
      stopLoss = Math.min(close * (1 + SL_PCT), liquidationPrice * 0.99);
      takeProfit = close - (stopLoss - close) * 2;
      risk = stopLoss - close;
      reward = close - takeProfit;
    }

    if (risk <= 0 || reward <= 0) return null;

    const forecastPNL = +(reward * qty).toFixed(4);
    const roiPct = +((forecastPNL / BASE_USDT) * 100).toFixed(2);
    const rrr = +(reward / risk).toFixed(2);
    const close96 = data[data.length - 96]?.close || close;
    const dailyPNL = +(((close - close96) / close96) * 100).toFixed(2);
    const confidence = (trend === 'bullish' && dailyPNL > 0) || (trend === 'bearish' && dailyPNL < 0) ? 90 : 70;

    if (confidence < CONFIDENCE_THRESHOLD || rrr < 2) return null;

    return {
      symbol, entry: +close.toFixed(4), stop_loss: +stopLoss.toFixed(4),
      take_profit: +takeProfit.toFixed(4), side, confidence, trend, regime,
      risk_reward: rrr, forecast_pnl_pct: roiPct, daily_pnl: dailyPNL,
      liquidation_price: liquidationPrice, quantity_usdt: BASE_USDT,
      roi_pct: roiPct, timestamp: utcnowISO()
    };

  } catch (e) {
    console.error(`[ERROR] ${symbol}:`, e.message);
    return null;
  }
}

export async function scanAndGenerateSignals() {
  const symbols = await getSymbols();
  const results = await Promise.all(symbols.map(s => generateSignal(s)));
  const valid = results.filter(Boolean);

  valid.forEach(sig => {
    fs.writeFileSync(path.join(SIGNALS_DIR, `${sig.symbol}.json`), JSON.stringify(sig, null, 2));
  });
  console.log(`✅ Saved ${valid.length} signals to ${SIGNALS_DIR}`);
  return valid;
}

export async function placeTrade(symbol, side, entry, stopLoss, takeProfit) {
  if (!client) {
    console.log(`[SKIP] API keys missing. Skipping trade for ${symbol}.`);
    return;
  }
  try {
    let qty = +(MAX_RISK_USDT / Math.abs(entry - stopLoss)).toFixed(3);
    qty = Math.max(qty, 0.001);

    await client.futuresOrder({
      symbol,
      side: side === 'long' ? 'BUY' : 'SELL',
      type: 'MARKET',
      quantity: qty
    });

    console.log(`[TRADE] ${symbol} ${side.toUpperCase()} @ ${entry}, qty ${qty}`);

    await client.futuresOrder({
      symbol,
      side: side === 'long' ? 'SELL' : 'BUY',
      type: 'TRAILING_STOP_MARKET',
      quantity: qty,
      callbackRate: 1.5,
      reduceOnly: true
    });

    const log = {
      symbol, side, entry, stop_loss: stopLoss, take_profit: takeProfit,
      qty, leverage: LEVERAGE, risk_amount: MAX_RISK_USDT, timestamp: utcnowISO()
    };
    fs.writeFileSync(path.join(TRADES_DIR, `${symbol}_trade_${nowStr()}.json`), JSON.stringify(log, null, 2));

  } catch (e) {
    console.error(`[Trade Error] ${symbol}:`, e.message);
  }
}

export async function scanAndExecuteTop5() {
  const signals = await scanAndGenerateSignals();
  if (!signals.length) return console.log("❌ No valid signals.");

  const top5 = signals.sort((a, b) => b.roi_pct - a.roi_pct).slice(0, 5);
  console.log(`🚀 Executing Top 5 Signals`);

  for (const s of top5) {
    await placeTrade(s.symbol, s.side, s.entry, s.stop_loss, s.take_profit);
  }

  console.log(`✅ Executed ${top5.length} trades.`);
}
