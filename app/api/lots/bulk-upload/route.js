// pages/api/lots/bulk-upload.js or app/api/lots/bulk-upload/route.js

import { connectToDB } from "@/lib/mongodb";
import { Lot } from "@/models/Lot"; 
import { Auction } from "@/models/Auction"; // Assuming you have this model

// For App Router (Next.js 13+)
export async function POST(request) {
  try {
    await connectToDB();
    
    const { lots } = await request.json();
    
    if (!Array.isArray(lots) || lots.length === 0) {
      return Response.json(
        { error: 'No lots data provided' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      failed: 0,
      errors: []
    };

    // Process lots in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < lots.length; i += batchSize) {
      const batch = lots.slice(i, i + batchSize);
      
      for (const lotData of batch) {
        try {
          // Validate required fields
          if (!lotData.title || !lotData.auctionId) {
            results.failed++;
            results.errors.push(`Lot "${lotData.title || 'Unknown'}": Missing required fields`);
            continue;
          }

          // Verify auction exists
          const auctionExists = await Auction.findById(lotData.auctionId);
          if (!auctionExists) {
            results.failed++;
            results.errors.push(`Lot "${lotData.title}": Invalid auction ID`);
            continue;
          }

          // Get the highest order number for this auction
          const lastLot = await Lot.findOne({ auctionId: lotData.auctionId })
            .sort({ order: -1 })
            .select('order');
          
          const newOrder = lastLot ? lastLot.order + 1 : 1;

          // Prepare lot data
          const processedLotData = {
            title: lotData.title.trim(),
            description: lotData.description?.trim() || '',
            abbi: lotData.abbi?.trim() || '',
            sire: lotData.sire?.trim() || '',
            dam: lotData.dam?.trim() || '',
            startingBid: Number(lotData.startingBid) || 0,
            photos: lotData.photos || [],
            videos: lotData.videos || [],
            auctionId: lotData.auctionId,
            order: lotData.order || newOrder,
            status: 'active',
            
            // ✅ ADDED: Seller fields that were missing
            sellerName: lotData.sellerName?.trim() || '',
            sellerMobile: lotData.sellerMobile?.trim() || '',
            sellerEmail: lotData.sellerEmail?.trim() || '',
            
            // Optional fields from Excel
            weight: lotData.weight ? Number(lotData.weight) : undefined,
            age: lotData.age?.trim() || undefined,
            breed: lotData.breed?.trim() || undefined,
            color: lotData.color?.trim() || undefined,
            consignerName: lotData.consignerName?.trim() || undefined,
            specialInstructions: lotData.specialInstructions?.trim() || undefined,
            
            // Location handling
            ...(lotData.location && {
              location: {
                ranch: lotData.location.trim()
              }
            })
          };

          // Remove undefined fields to keep document clean
          Object.keys(processedLotData).forEach(key => {
            if (processedLotData[key] === undefined) {
              delete processedLotData[key];
            }
          });

          // Create the lot
          const newLot = new Lot(processedLotData);
          await newLot.save();
          
          results.created++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Lot "${lotData.title || 'Unknown'}": ${error.message}`);
          console.error('Error creating lot:', error);
        }
      }
    }

    // Return results
    const response = {
      success: results.created > 0,
      created: results.created,
      failed: results.failed,
      message: `Successfully created ${results.created} lots${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
      ...(results.errors.length > 0 && { errors: results.errors.slice(0, 10) }) // Limit error messages
    };

    return Response.json(response, { 
      status: results.created > 0 ? 200 : 400 
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return Response.json(
      { 
        success: false,
        error: 'Internal server error during bulk upload',
        message: error.message 
      },
      { status: 500 }
    );
  }
}