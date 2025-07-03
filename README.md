Here's your full **📘 `README.md` installation and usage guide** for running the hybrid trading bot:

---

# 📈 Hybrid Binance Futures Trading Bot

This bot scans the top 200 Binance USDT Futures symbols, generates trading signals with charts and indicator overlays, places trades for the top 5 signals, and creates a detailed PDF report.

---

## ✅ Features

* ✅ Scans 200 Binance USDT perpetual symbols
* ✅ Generates TA-based signals (EMA, MACD, RSI, BB)
* ✅ Saves per-symbol `.json` signal files
* ✅ Saves indicator chart `.png` per symbol
* ✅ Automatically places top 5 trades using 1 USDT risk
* ✅ Saves a full `signals_report_<timestamp>.pdf` for all signals

---

## 🧰 Prerequisites

1. **Install Python 3.10+**
   Recommended: [https://www.python.org/downloads/](https://www.python.org/downloads/)

2. **Install Required Libraries**
   Open **CMD** or **Terminal** and run:

   ```bash
   pip install -r requirements.txt
   ```

   If no `requirements.txt`, install manually:

   ```bash
   pip install pandas numpy matplotlib ta python-binance fpdf python-dotenv
   ```

---

## 📁 Directory Structure

```text
hybrid_bot/
├── bot1.py                     # Main script
├── .env                        # API credentials and mode
├── output/
│   ├── charts/                 # Symbol charts (e.g. BTCUSDT.png)
│   ├── reports/                # Combined PDF report
│   ├── signals/                # Symbol signals (e.g. ETHUSDT.json)
│   └── trades/                 # Executed trade logs
```

---

## 🔐 .env File Setup

Create a file named `.env` in the project folder with:

```ini
MODE=live
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
```

> 🧪 To backtest only without placing trades, remove or leave `BINANCE_API_KEY` and `API_SECRET` blank.

---

## ▶️ Running the Bot

1. Open CMD and navigate to the bot folder:

   ```
   cd path\to\hybrid_bot
   ```

2. Run the bot:

   ```
   python bot1.py
   ```

---

## 📤 Outputs

After running, the bot will generate:

* **Top 5 trades executed** (if API is present)
* `output/signals/*.json`: One JSON file per symbol with signal info
* `output/charts/*.png`: One chart image per symbol
* `output/reports/signals_report_<timestamp>.pdf`: All signals visualized
* `output/trades/*.json`: Trade logs for each executed position

---

## ⚠️ Notes & Tips

* If you're seeing GUI-related Matplotlib errors, it's because `matplotlib` tries to use a display in a background thread. This is fixed by:

  ```python
  import matplotlib
  matplotlib.use('Agg')  # Already added in your script
  ```

* Make sure `bot1.py` is not blocked by antivirus or firewall when using live API keys.

* To avoid rate limits, don't rerun too quickly.

---


