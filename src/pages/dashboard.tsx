import React from "react";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold">
        QFX AI Trading Dashboard
      </h1>

      <p className="mt-3 text-gray-400">
        AI Market Analysis Platform
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-8">

        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-xl font-bold">
            BTC/USDT
          </h2>
          <p className="text-green-400 mt-2">
            AI Signal: BUY
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-xl font-bold">
            ETH/USDT
          </h2>
          <p className="text-yellow-400 mt-2">
            AI Signal: HOLD
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-xl font-bold">
            Risk AI
          </h2>
          <p className="text-blue-400 mt-2">
            Low Risk
          </p>
        </div>

      </div>

    </main>
  );
}
