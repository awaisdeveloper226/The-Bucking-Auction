"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, DollarSign, Receipt, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PaymentsReporting() {
  const [search, setSearch] = useState("");
  const [taxPercent, setTaxPercent] = useState(5); // Dynamic tax %
  const [lots, setLots] = useState([]);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const res = await fetch("/api/lots");
        const data = await res.json();

        // ✅ filter only lots with winning information
        const filtered = data.filter(
          (lot) =>
            (lot.winnerId && lot.winnerId !== null) ||
            (lot.winningBid && lot.winningBid > 0) ||
            (lot.soldAt && lot.soldAt !== null)
        );

        // ✅ resolve buyer names
        const formatted = await Promise.all(
          filtered.map(async (lot) => {
            let buyerName = "Unknown Buyer";
            let buyerEmail = "No email";
            let buyerAddress = "No address";
            let BuyerPhone = "No phone";

            if (lot.winnerId) {
              if (typeof lot.winnerId === "object" && lot.winnerId.name) {
                // Already populated
                buyerName = lot.winnerId.name;
              } else if (typeof lot.winnerId === "string") {
                // Need to fetch user by ID
                try {
                  const userRes = await fetch(`/api/users/${lot.winnerId}`);
                  if (userRes.ok) {
                    const user = await userRes.json();
                    buyerName =
                      `${user.firstName} ${user.lastName} ` || buyerName;
                    buyerEmail = user.emailAddress || "No email";
                    buyerAddress = user.physicalAddress || "No address";
                    BuyerPhone = user.cellPhone || "No phone";
                  }
                } catch (err) {
                  console.error(`Failed to fetch user ${lot.winnerId}`, err);
                }
              }
            }

            return {
              id: lot._id,
              lot: lot.title || `Lot #${lot.order}`,
              status: lot.paymentStatus || "Unpaid", // ✅ use actual DB value

              buyer: buyerName,
              price: lot.winningBid || 0,
              email: buyerEmail || "No email",
              address: buyerAddress || "No address",
              phone: BuyerPhone || "No phone",
            };
          })
        );

        setLots(formatted);
      } catch (error) {
        console.error("Error fetching lots:", error);
      }
    };

    fetchLots();
  }, []);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const summary = {
    totalLots: lots.length,
    totalSales: lots.reduce(
      (acc, lot) => acc + (lot.status === "Paid" ? lot.price : 0),
      0
    ), // ✅ only count paid sales
    avgPrice:
      lots.length > 0
        ? Math.round(
            lots.reduce(
              (acc, lot) => acc + (lot.status === "Paid" ? lot.price : 0),
              0
            ) / lots.length
          )
        : 0,
    highestBid: lots.length > 0 ? Math.max(...lots.map((lot) => lot.price)) : 0,
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await fetch(`/api/lots?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "Paid" }), // ✅ must match schema
      });

      if (res.ok) {
        const updatedLot = await res.json();
        setLots((prev) =>
          prev.map((lot) => (lot.id === id ? { ...lot, status: "Paid" } : lot))
        );
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  const handleShowInvoice = (lot) => {
    setSelectedInvoice(lot);
  };

  const handleCloseInvoice = () => {
    setSelectedInvoice(null);
  };

  const handleDownloadPDF = (invoice) => {
    const doc = new jsPDF();

    // Format invoice number (strip Mongo ID, just use last 6 chars or pad with zeros)
    const shortInvoiceId =
      typeof invoice.id === "string"
        ? invoice.id.slice(-6).toUpperCase() // last 6 chars of Mongo ID
        : invoice.id.toString().padStart(4, "0");

    // Company Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Buckers Auction", 14, 20);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
   

    // Invoice Info
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 150, 20);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${shortInvoiceId}`, 150, 26);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 32);

    // Buyer Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 42);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.buyer, 14, 48);
    doc.text(invoice.email, 14, 54);
    doc.text(invoice.address, 14, 60);
    doc.text(invoice.phone, 14, 66);

    // Invoice Table
    autoTable(doc, {
      startY: 68,
      head: [["Lot", "Price ($)"]],
      body: [[invoice.lot, `$${invoice.price}`]],
      styles: { halign: "right", font: "helvetica", fontSize: 11 },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 20,
        halign: "center",
      },
      columnStyles: { 0: { halign: "center" }, 1: { halign: "center" } },
    });

    // Totals
    const taxAmount = (invoice.price * (taxPercent / 100)).toFixed(2);
    const totalAmount = (invoice.price * (1 + taxPercent / 100)).toFixed(2);

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: $${invoice.price}`, 150, finalY);
    doc.text(`Tax (${taxPercent}%): $${taxAmount}`, 150, finalY + 6);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: $${totalAmount}`, 150, finalY + 14);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      "Thank you for your business!",
      105,
      290,
      { align: "center" }
    );

    doc.save(`Invoice-${invoice.lot}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Section Heading */}
      <h2 className="text-2xl font-bold text-gray-800">Payments & Reporting</h2>

      {/* Tax Field */}
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700">Tax %:</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={taxPercent}
          onChange={(e) => setTaxPercent(Number(e.target.value))}
          className="w-24"
        />
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
                  <td
                    className={`p-3 font-semibold ${
                      lot.status === "Paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {lot.status}
                  </td>
                  <td className="p-3 flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleShowInvoice(lot)}
                    >
                      <Receipt className="w-4 h-4" /> Invoice
                    </Button>
                    {lot.status === "Unpaid" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex items-center gap-1"
                        onClick={() => handleMarkPaid(lot.id)}
                      >
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

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4"
          onClick={handleCloseInvoice} // Click on overlay closes modal
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3"
              onClick={handleCloseInvoice}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Invoice Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Buckers Auction
                </h2>

               
              </div>
              <div className="text-right">
                <h3 className="text-xl font-semibold">INVOICE</h3>
                <p className="text-gray-500">
                  #
                  {typeof selectedInvoice.id === "string"
                    ? selectedInvoice.id.slice(-6).toUpperCase() // last 6 chars of Mongo ID
                    : selectedInvoice.id.toString().padStart(4, "0")}
                </p>
                <p className="text-gray-500">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
              <p className="font-semibold text-gray-700">Bill To:</p>
              <p className="text-gray-800">{selectedInvoice.buyer}</p>
              <p className="text-gray-500 text-sm">{selectedInvoice.email}</p>
              <p className="text-gray-500 text-sm">{selectedInvoice.address}</p>
              <p className="text-gray-500 text-sm">{selectedInvoice.phone}</p>
            </div>

            {/* Invoice Table */}
            <table className="w-full border-collapse mb-6 text-sm shadow-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-3 border">Lot</th>
                  <th className="text-right p-3 border">Price ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 border">{selectedInvoice.lot}</td>
                  <td className="p-3 border text-right">
                    ${selectedInvoice.price}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mb-6">
              <div className="w-1/2 sm:w-1/3">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${selectedInvoice.price}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Tax ({taxPercent}%):</span>
                  <span className="font-medium">
                    ${(selectedInvoice.price * (taxPercent / 100)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t mt-2 font-semibold text-lg">
                  <span>Total:</span>
                  <span>
                    $
                    {(selectedInvoice.price * (1 + taxPercent / 100)).toFixed(
                      2
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Download PDF Button */}
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="bg-blue-300"
              >
                Download PDF
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm border-t pt-3">
              Thank you for your business! 
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
