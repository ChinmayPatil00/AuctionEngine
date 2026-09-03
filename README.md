# Auction Engine

![Auction Engine Live Demo](https://auction-engine-app.vercel.app/)

Auction Engine is a high-performance, real-time distributed marketplace built for creators. It features zero-latency bidding, robust concurrency control, and absolute financial ledger integrity.

## 🚀 Live Demo
- **Frontend:** [https://auction-engine-app.vercel.app/](https://auction-engine-app.vercel.app/)
- **Backend:** [https://creatorflow-1.onrender.com](https://creatorflow-1.onrender.com)

## ✨ Core Features

* **Zero-Latency Live Bidding:** Utilizes persistent WebSocket TCP connections (Socket.io) to instantly synchronize the bidding state across all connected clients without HTTP polling delays.
* **Concurrency & Race Condition Mitigation:** Implements distributed mutex locks via **Redis**. Even if multiple users attempt to bid at the exact same millisecond, the Redis lock ensures sequential execution, eliminating duplicate charges and phantom bids.
* **Financial Ledger Integrity:** Every bid transaction (deducting funds, recording the bid, and updating the auction) is wrapped in a **MongoDB ACID Transaction** (`mongoose.startSession`). If any part of the process fails, the entire transaction rolls back automatically.
* **Algorithmic Anti-Sniping:** Automatically extends the auction timer by 120 seconds if a bid is placed in the final 30 seconds of an auction, ensuring fair price discovery.
* **Performance Optimizations:** Leverages dynamic bundle splitting (`React.lazy`) and Skeleton UI architectures for near-instant Time-To-Interactive (TTI) metrics.

## 🛠️ Technology Stack
* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (ACID Transactions enabled)
* **Caching & Locking:** Redis Cloud
* **Real-time Engine:** Socket.io
* **Hosting:** Vercel (Frontend), Render (Backend)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ChinmayPatil00/AuctionEngine.git
   cd AuctionEngine
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_cloud_url
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the Development Servers**
   ```bash
   # Start the backend (from /backend)
   npm run dev

   # Start the frontend (from /frontend)
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
