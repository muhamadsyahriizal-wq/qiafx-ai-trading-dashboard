import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold">
        QFX AI Trading Dashboard
      </h1>

      <p className="mt-3 text-gray-400">
        AI Market Analysis Platform
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-8">

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2>BTC/USDT</h2>
          <p className="text-green-400">
            AI Signal: BUY
          </p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2>ETH/USDT</h2>
          <p className="text-yellow-400">
            AI Signal: HOLD
          </p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2>Risk AI</h2>
          <p>Low Risk</p>
        </div>

      </div>
    </div>
  );
}
