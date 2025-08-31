// server.js
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

// In-memory storage
const lotData = new Map();
const activeBidders = new Map();

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a lot room
    socket.on("joinLot", (lotId) => {
      socket.join(`lot_${lotId}`);
      console.log(`Socket ${socket.id} joined lot ${lotId}`);

      const currentLotData = lotData.get(lotId);
      if (currentLotData) socket.emit("lotData", currentLotData);

      if (!activeBidders.has(lotId)) {
        activeBidders.set(lotId, new Set());
      }
      activeBidders.get(lotId).add(socket.id);
    });

    // Leave lot
    socket.on("leaveLot", (lotId) => {
      socket.leave(`lot_${lotId}`);
      console.log(`Socket ${socket.id} left lot ${lotId}`);
      if (activeBidders.has(lotId)) {
        activeBidders.get(lotId).delete(socket.id);
      }
    });
    // Add this to your existing socket.io useEffect
    socket.on("auctionExtended", (data) => {
      if (data.lotId === String(lotId)) {
        // Update the auction end time locally
        setAuction((prev) => ({
          ...prev,
          endDate: data.extendedUntil,
        }));

        // Show a notification to the user
        setBidError(`Auction extended by ${data.extendedBy}!`);
        setTimeout(() => setBidError(""), 5000);
      }
    });

    // Place bid (using client-sent info only)
    socket.on("placeBid", (bidData) => {
      const { lotId, amount, userId, userName, biddingNumber } = bidData;
      console.log(`📩 Bid for lot ${lotId}:`, {
        amount,
        userId,
        userName,
        biddingNumber,
      });

      try {
        let currentLot = lotData.get(lotId) || {
          currentBid: 0,
          totalBids: 0,
          bids: [],
        };

        const bidAmount = parseFloat(amount);
        const currentBid = currentLot.currentBid || 0;

        // validate bid
        if (isNaN(bidAmount) || bidAmount <= currentBid) {
          socket.emit("bidRejected", {
            reason: `Bid must be higher than $${currentBid}`,
            currentBid,
          });
          return;
        }

        // Create bid object
        // Build newBid payload
        // Build newBid payload
        const newBid = {
          _id: Date.now(), // or any unique id
          amount: bidAmount,
          createdAt: new Date(),
          userId: {
            _id: userId,
            userName, // keep full name
            biddingNumber, // keep bidder number
          },
        };

        // update in-memory lot data
        currentLot.currentBid = bidAmount;
        currentLot.totalBids = (currentLot.totalBids || 0) + 1;
        currentLot.bids = [newBid, ...(currentLot.bids || [])];

        if (currentLot.bids.length > 100) {
          currentLot.bids = currentLot.bids.slice(0, 100);
        }

        lotData.set(lotId, currentLot);

        // Broadcast to room
        io.to(`lot_${lotId}`).emit("bidUpdate", {
          currentBid: bidAmount,
          totalBids: currentLot.totalBids,
          bid: newBid,
          lotId,
        });

        console.log(
          `✅ Bid accepted: $${bidAmount} by ${userName} (${biddingNumber})`
        );
      } catch (err) {
        console.error("❌ Error processing bid:", err);
        socket.emit("bidRejected", {
          reason: "Server error, please try again",
          currentBid: lotData.get(lotId)?.currentBid || 0,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      for (let [lotId, bidders] of activeBidders.entries()) {
        if (bidders.has(socket.id)) {
          bidders.delete(socket.id);
          console.log(`Removed ${socket.id} from lot ${lotId} active bidders`);
        }
      }
    });

    socket.on("error", (err) => {
      console.error(`Socket error for ${socket.id}:`, err);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running`);
  });
});

// Helpers
function initializeLotData(lotId, lotInfo) {
  if (!lotData.has(lotId)) {
    lotData.set(lotId, {
      currentBid: lotInfo.currentBid || lotInfo.startingBid || 0,
      totalBids: lotInfo.totalBids || 0,
      bids: lotInfo.bids || [],
    });
  }
}
function getCurrentLotData(lotId) {
  return lotData.get(lotId) || null;
}

module.exports = { initializeLotData, getCurrentLotData };
