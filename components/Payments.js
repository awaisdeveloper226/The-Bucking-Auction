"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, DollarSign, Receipt } from "lucide-react";

export default function PaymentsReporting() {
  const [search, setSearch] = useState("");

  const lots = [
    { id: 1, lot: "Lot #101", status: "Paid", buyer: "John Doe", price: 1200 },
    { id: 2, lot: "Lot #102", status: "Unpaid", buyer: "Jane Smith", price: 800 },
    { id: 3, lot: "Lot #103", status: "Paid", buyer: "David Miller", price: 950 },
  ];

  const summary = {
    totalLots: 3,
    totalSales: 2950,
    avgPrice: 983,
    highestBid: 1200,
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Section Heading */}
      <h2 className="text-2xl font-bold text-gray-800">Payments & Reporting</h2>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          placeholder="Search lots or buyers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0"
        />
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="flex-1 sm:flex-none">Filter Paid</Button>
          <Button variant="outline" className="flex-1 sm:flex-none">Filter Unpaid</Button>
        </div>
      </div>

      {/* Lots Table */}
      <Card className="shadow-md overflow-x-auto">
        <CardContent>
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="border-b bg-gray-100 text-gray-700">
                <th className="p-3">Lot</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Price ($)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{lot.lot}</td>
                  <td className="p-3">{lot.buyer}</td>
                  <td className="p-3">${lot.price}</td>
                  <td className={`p-3 font-semibold ${lot.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                    {lot.status}
                  </td>
                  <td className="p-3 flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Receipt className="w-4 h-4" /> Invoice
                    </Button>
                    {lot.status === "Unpaid" && (
                      <Button size="sm" variant="default" className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Auction Summary */}
      <Card className="shadow-md">
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{summary.totalLots}</p>
            <p className="text-gray-500">Lots Sold</p>
          </div>
          <div>
            <p className="text-lg font-semibold">${summary.totalSales}</p>
            <p className="text-gray-500">Total Sales</p>
          </div>
          <div>
            <p className="text-lg font-semibold">${summary.avgPrice}</p>
            <p className="text-gray-500">Average Price</p>
          </div>
          <div>
            <p className="text-lg font-semibold">${summary.highestBid}</p>
            <p className="text-gray-500">Highest Bid</p>
          </div>
        </CardContent>
      </Card>

      {/* Generate Reports */}
      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <FileText className="w-4 h-4" /> Generate Full Report
        </Button>
      </div>
    </div>
  );
}
