import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import cron from 'node-cron';
import WebSocket, { WebSocketServer } from 'ws';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { MACD, BollingerBands } from 'technicalindicators';
import dotenv from 'dotenv';
import {
  scanAndGenerateSignals,
  scanAndExecuteTop5,
  saveJSON,
  placeTrade
} from './crypto-pilot-trade.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

const SIGNALS_DIR = path.join(__dirname, 'output/signals');
const TRADES_DIR = path.join(__dirname, 'output/trades');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MODULES_DIR = path.join(__dirname, 'node_modules');
const capitalLogFile = path.join(__dirname, 'capital_log.json');

// Create folders
[PUBLIC_DIR, SIGNALS_DIR, TRADES_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Express middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));
app.use('/lib/chartjs', express.static(path.join(MODULES_DIR, 'chart.js', 'dist')));
app.use('/lib/chartjs-financial', express.static(path.join(MODULES_DIR, 'chartjs-chart-financial')));
app.use('/lib/chartjs-datefn', express.static(path.join(MODULES_DIR, 'chartjs-adapter-date-fns')));

let wsClients = [];
const activeTrades = {};
let capital = 1.0;
const TP_PERCENT = 0.25;
const SL_PERCENT = 0.10;

// Utility functions
function nowStr() {
  return new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
}

function safe(v, fallback = 'N/A') {
  return v != null ? v : fallback;
}

function updateCapital(result) {
  if (result === 'win') capital *= 1 + TP_PERCENT;
  else if (result === 'loss') capital *= 1 - SL_PERCENT;
  capital = +capital.toFixed(6);

  const log = fs.existsSync(capitalLogFile)
    ? JSON.parse(fs.readFileSync(capitalLogFile))
    : [];
  log.push({ capital, result, time: new Date().toISOString() });
  fs.writeFileSync(capitalLogFile, JSON.stringify(log, null, 2));
}

function generateTradePDF(trade, outPath) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);
  doc.fontSize(18).text(`Trade Report: ${trade.symbol}`, { align: 'center' }).moveDown();
  doc.fontSize(12);
  [
    `Mode        : ${safe(trade.mode)}`,
    `Status      : ${safe(trade.status)}`,
    `Entry Price : ${safe(trade.entry)}`,
    `Exit Price  : ${safe(trade.exit)}`,
    `Leverage    : ${safe(trade.leverage)}x`,
    `Size (USDT) : ${safe(trade.size)}`,
    `TP (%)      : ${safe(trade.take_profit)}`,
    `SL (%)      : ${safe(trade.stop_loss)}`,
    `Opened At   : ${safe(trade.timestamp)}`,
    `Closed At   : ${safe(trade.closed_at, 'Still Open')}`,
    `PnL (USDT)  : ${safe(trade.pnl)}`
  ].forEach(line => doc.text(line));
  doc.moveDown().text('📌 Log:');
  doc.text(trade.log || 'No log.');
  doc.end();
}

// === Signal Scanner ===
async function runSignalScript(isManual = false, res = null) {
  try {
    const { top5, others, all } = await scanAndGenerateSignals();
    saveJSON(all);

    const now = nowStr();
    all.forEach(s => {
      const file = path.join(SIGNALS_DIR, `${s.symbol}_${now}.json`);
      fs.writeFileSync(file, JSON.stringify(s, null, 2));
    });

    wsClients.forEach(c => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify({
          type: 'signal_refresh',
          count: all.length,
          capital
        }));
      }
    });

    if (res) return res.json(all);
  } catch (e) {
    console.error('[Signal Scan Error]', e.message);
    if (res) return res.status(500).json({ error: 'scan failed' });
  }
}

// === API Endpoints ===
app.get('/api/signals', (req, res) => runSignalScript(true, res));

app.get('/api/autotrade', async (req, res) => {
  try {
    await scanAndExecuteTop5();
    res.json({ status: 'Auto-trade executed' });
  } catch (e) {
    console.error('[Auto-Trade Error]', e.message);
    res.status(500).json({ error: 'Auto-trade failed' });
  }
});

app.get('/api/symbols', (req, res) => {
  try {
    const files = fs.readdirSync(SIGNALS_DIR).filter(f => f.endsWith('.json'));
    const symbols = [...new Set(files.map(f => f.split('_')[0].toUpperCase()))];
    res.json(symbols);
  } catch (e) {
    res.status(500).json({ error: 'symbol read error' });
  }
});

app.get('/api/signal/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const tf = req.query.tf || '1d';
  try {
    const files = fs.readdirSync(SIGNALS_DIR).filter(f => f.startsWith(symbol)).sort().reverse();
    if (files.length === 0) return res.status(404).json({ error: 'no signal' });
    const sig = JSON.parse(fs.readFileSync(path.join(SIGNALS_DIR, files[0])));
    const raw = (await axios.get(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${tf}&limit=200`)).data;

    const candles = raw.map(c => ({
      timestamp: new Date(c[0]).toISOString(),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5])
    }));

    const closes = candles.map(c => c.close);
    const ma200 = closes.map((_, i) => i < 199 ? null : closes.slice(i - 199, i + 1).reduce((a, b) => a + b) / 200);
    const bb = BollingerBands.calculate({ period: 20, values: closes });
    const bbFull = Array(closes.length - bb.length).fill({ upper: null, lower: null }).concat(bb);
    const bb_upper = bbFull.map(b => b.upper), bb_lower = bbFull.map(b => b.lower);
    const macd = MACD.calculate({ fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, values: closes });
    const macdFull = Array(closes.length - macd.length).fill({ MACD: null, signal: null, histogram: null }).concat(macd);
    const macd_line = macdFull.map(m => m.MACD), macd_signal = macdFull.map(m => m.signal), macd_hist = macdFull.map(m => m.histogram);

    res.json({ ...sig, candles, ma200, bb_upper, bb_lower, macd_line, macd_signal, macd_hist });
  } catch (e) {
    res.status(500).json({ error: 'failed to load signal' });
  }
});

app.post('/api/trade', async (req, res) => {
  try {
    const t = req.body;
    await placeTrade(t.symbol, t.side, t.entry, t.stop_loss, t.take_profit);

    const id = `${t.symbol}_${Date.now()}`;
    const tr = {
      ...t,
      id,
      status: 'open',
      timestamp: new Date().toISOString(),
      mode: 'live',
      leverage: t.leverage || 20,
      size: t.size || 1.0,
      log: '',
    };

    const jsonPath = path.join(TRADES_DIR, `${id}.json`);
    const pdfPath = path.join(TRADES_DIR, `${id}.pdf`);
    fs.writeFileSync(jsonPath, JSON.stringify(tr, null, 2));
    generateTradePDF(tr, pdfPath);
    activeTrades[id] = { ...tr, jsonPath, pdfPath };

    res.json({ status: 'executed', id });
  } catch (e) {
    console.error('[Trade Error]', e.message);
    res.status(500).json({ error: 'trade failed' });
  }
});

app.get('/api/trades', (req, res) => {
  try {
    const trades = fs.readdirSync(TRADES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(TRADES_DIR, f))));
    res.json(trades);
  } catch {
    res.status(500).json({ error: 'failed to list trades' });
  }
});

app.get('/api/capital-log', (req, res) => {
  try {
    const log = fs.existsSync(capitalLogFile)
      ? JSON.parse(fs.readFileSync(capitalLogFile))
      : [];
    res.json({ capital, history: log });
  } catch {
    res.status(500).json({ error: 'capital log error' });
  }
});

// === Auto-Trade Monitor ===
setInterval(async () => {
  for (const id in activeTrades) {
    const tr = activeTrades[id];
    try {
      const { data } = await axios.get(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${tr.symbol}`);
      const cur = parseFloat(data.price), ent = parseFloat(tr.entry);
      const tp = ent * (1 + tr.take_profit / 100), sl = ent * (1 - tr.stop_loss / 100);

      if (cur >= tp || cur <= sl) {
        tr.status = 'closed';
        tr.exit = cur;
        tr.closed_at = new Date().toISOString();
        tr.pnl = (((cur - ent) / ent) * tr.leverage * tr.size).toFixed(2);

        if (cur >= tp) updateCapital('win');
        else if (cur <= sl) updateCapital('loss');

        tr.log += `Auto-closed @ ${cur} | PnL = ${tr.pnl}\n`;
        fs.writeFileSync(tr.jsonPath, JSON.stringify(tr, null, 2));
        generateTradePDF(tr, tr.pdfPath);
        delete activeTrades[id];
        console.log(`[CLOSE] ${tr.symbol} | ${tr.pnl} USDT`);
      }
    } catch (e) {
      console.error('[Auto-close error]', e.message);
    }
  }
}, 60000);

// === WebSocket Server ===
const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', ws => {
  wsClients.push(ws);
  ws.on('close', () => wsClients = wsClients.filter(c => c !== ws));
});

// === Start Express Server ===
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.listen(PORT, () => console.log(`📡 HTTP API @ http://localhost:${PORT}`));
console.log(`🔌 WS API  @ ws://localhost:${WS_PORT}`);

// === Initial Run & Scheduler ===
runSignalScript();
cron.schedule('0 */4 * * *', () => {
  console.log('⏱️ Running Scheduled Signal + Trade Execution...');
  scanAndExecuteTop5();
});
