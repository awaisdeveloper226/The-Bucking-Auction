const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// In-memory storage (replace with your database)
const lotData = new Map();
const activeBidders = new Map();

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a specific lot room
    socket.on('joinLot', (lotId) => {
      console.log(`Socket ${socket.id} joining lot ${lotId}`);
      socket.join(`lot_${lotId}`);
      
      // Send current lot data if available
      const currentLotData = lotData.get(lotId);
      if (currentLotData) {
        socket.emit('lotData', currentLotData);
      }
      
      // Track active bidders
      if (!activeBidders.has(lotId)) {
        activeBidders.set(lotId, new Set());
      }
      activeBidders.get(lotId).add(socket.id);
    });

    // Leave a lot room
    socket.on('leaveLot', (lotId) => {
      console.log(`Socket ${socket.id} leaving lot ${lotId}`);
      socket.leave(`lot_${lotId}`);
      
      // Remove from active bidders
      if (activeBidders.has(lotId)) {
        activeBidders.get(lotId).delete(socket.id);
      }
    });

    // Handle bid placement
    socket.on('placeBid', async (bidData) => {
      const { lotId, amount, user, userId } = bidData;
      console.log(`Received bid for lot ${lotId}:`, { amount, user, userId });

      try {
        // Get current lot data
        let currentLot = lotData.get(lotId) || {
          currentBid: 0,
          totalBids: 0,
          bids: []
        };

        // Validate bid
        const bidAmount = parseFloat(amount);
        const currentBid = currentLot.currentBid || 0;

        if (isNaN(bidAmount) || bidAmount <= currentBid) {
          socket.emit('bidRejected', {
            reason: `Bid must be higher than $${currentBid}`,
            currentBid: currentBid
          });
          return;
        }

        // Create new bid
        const newBid = {
          id: Date.now(),
          amount: bidAmount,
          user: user || 'Anonymous',
          userId: userId,
          time: new Date().toISOString(),
          socketId: socket.id
        };

        // Update lot data
        currentLot.currentBid = bidAmount;
        currentLot.totalBids = (currentLot.totalBids || 0) + 1;
        currentLot.bids = [newBid, ...(currentLot.bids || [])];

        // Keep only last 100 bids
        if (currentLot.bids.length > 100) {
          currentLot.bids = currentLot.bids.slice(0, 100);
        }

        // Store updated data
        lotData.set(lotId, currentLot);

        // Here you would typically save to your database
        // await saveLotToDatabase(lotId, currentLot);

        // Broadcast bid update to all clients in the lot room
        io.to(`lot_${lotId}`).emit('bidUpdate', {
          currentBid: bidAmount,
          totalBids: currentLot.totalBids,
          bid: newBid,
          lotId: lotId
        });

        console.log(`Bid placed successfully for lot ${lotId}: $${bidAmount} by ${user}`);

      } catch (error) {
        console.error('Error processing bid:', error);
        socket.emit('bidRejected', {
          reason: 'Server error, please try again',
          currentBid: lotData.get(lotId)?.currentBid || 0
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Remove from all active bidders
      for (let [lotId, bidders] of activeBidders.entries()) {
        if (bidders.has(socket.id)) {
          bidders.delete(socket.id);
          console.log(`Removed ${socket.id} from lot ${lotId} active bidders`);
        }
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});

// Optional: Function to initialize lot data from your existing database
async function initializeLotData(lotId, lotInfo) {
  const existingData = lotData.get(lotId);
  if (!existingData) {
    lotData.set(lotId, {
      currentBid: lotInfo.currentBid || lotInfo.startingBid || 0,
      totalBids: lotInfo.totalBids || 0,
      bids: lotInfo.bids || []
    });
  }
}

// Optional: Function to get current lot data
function getCurrentLotData(lotId) {
  return lotData.get(lotId) || null;
}

module.exports = { initializeLotData, getCurrentLotData };