# Creator Flow 🚀

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

Real-time MERN marketplace for creators featuring zero-latency WebSockets, AI automation, and a secure transaction ledger.

## ✨ Features

- **Real-Time Bidding**: Powered by `Socket.io`, bids are broadcasted instantly to all connected clients in the room without page refreshes.
- **Autonomous AI Bots**: A backend `BotEngine` dynamically monitors active auctions and deploys simulated AI buyers (e.g., *CryptoWhale*, *DubaiPrince*) to compete with human players based on randomized aggression thresholds.
- **Anti-Sniper Protection**: Any bid placed within the last 30 seconds of an auction automatically extends the timer by 2 minutes, ensuring fair price discovery.
- **Optimistic Wallet Sync**: Bidder wallet balances are dynamically deducted and refunded via WebSocket events in real-time.
- **Concurrent Locking**: Redis-backed distributed locks (`lock:auction:{id}`) prevent race conditions if multiple users attempt to bid on the exact same millisecond.

## 🏗️ Architecture

```mermaid
graph TD
    Client[React Client] <-->|WebSockets| SocketIO(Socket.io Server)
    Client -->|REST API| Express(Express Server)
    
    SocketIO -->|Acquire Lock| Redis[(Redis)]
    Express --> DB[(MongoDB)]
    
    subgraph Background Workers
        BotEngine[Autonomous Bot Engine] -->|Monitors| DB
        BotEngine -->|Injects Bids| SocketIO
        AuctionResolver[Auction End Resolver] -->|Finalizes| DB
    end
```

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/ChinmayPatil00/AuctionEngine.git
cd AuctionEngine
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (refer to `.env.example`).
```bash
npm start
```

### 3. Setup the Frontend
Open a new terminal window.
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Production Deployment
- **Frontend**: Deployed on Vercel. 
- **Backend**: Containerized Web Service on Render.
- **Database**: MongoDB Atlas.
- **Cache**: Redis Cloud.
