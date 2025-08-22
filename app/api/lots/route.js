// pages/api/lots.js or app/api/lots/route.js (depending on your Next.js version)

import { connectToDB } from "@/lib/mongodb"; // Adjust path as needed
import { Lot } from "@/models/Lot"; // Adjust path as needed

// For App Router (Next.js 13+)
export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get('auctionId');
    
    let query = {};
    if (auctionId) {
      query.auctionId = auctionId;
    }
    
   const lots = await Lot.find(query)
  .populate({ path: 'auctionId', select: 'title' }) // make sure path is 'auctionId'
  .sort({ order: 1, createdAt: 1 });


    
    return Response.json(lots);
  } catch (error) {
    console.error('GET /api/lots error:', error);
    return Response.json(
      { error: 'Failed to fetch lots' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    const {
      title,
      description,
      abbi,
      sire,
      dam,
      startingBid,
      photos,
      videos,
      auctionId
    } = body;
    
    // Validation
    if (!title || !auctionId) {
      return Response.json(
        { error: 'Title and auction selection are required' },
        { status: 400 }
      );
    }
    
    // Get the highest order number for this auction
    const lastLot = await Lot.findOne({ auctionId })
      .sort({ order: -1 })
      .select('order');
    
    const newOrder = lastLot ? lastLot.order + 1 : 1;
    
    const lotData = {
      title,
      description: description || '',
      abbi: abbi || '',
      sire: sire || '',
      dam: dam || '',
      startingBid: Number(startingBid) || 0,
      photos: photos || [],
      videos: videos || [],
      auctionId,
      order: newOrder,
      status: 'active'
    };
    
    const newLot = new Lot(lotData);
    const savedLot = await newLot.save();
    
    // Populate auction info for response
    await savedLot.populate('auctionId', 'title name');
    
    return Response.json(savedLot, { status: 201 });
  } catch (error) {
    console.error('POST /api/lots error:', error);
    return Response.json(
      { error: 'Failed to create lot' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { error: 'Lot ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    const updatedLot = await Lot.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('auctionId', 'title name');
    
    if (!updatedLot) {
      return Response.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }
    
    return Response.json(updatedLot);
  } catch (error) {
    console.error('PUT /api/lots error:', error);
    return Response.json(
      { error: 'Failed to update lot' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json(
        { error: 'Lot ID is required' },
        { status: 400 }
      );
    }
    
    const deletedLot = await Lot.findByIdAndDelete(id);
    
    if (!deletedLot) {
      return Response.json(
        { error: 'Lot not found' },
        { status: 404 }
      );
    }
    
    return Response.json({ message: 'Lot deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/lots error:', error);
    return Response.json(
      { error: 'Failed to delete lot' },
      { status: 500 }
    );
  }
}
