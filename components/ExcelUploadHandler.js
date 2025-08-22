// components/ExcelUploadHandler.js
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Upload, X, CheckCircle, AlertCircle, Download } from "lucide-react";

const ExcelUploadHandler = ({ auctions, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (uploadResults && uploadResults.success) {
      const timer = setTimeout(() => {
        setUploadResults(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [uploadResults]);

  // Expected column headers (exact match required)
  const REQUIRED_HEADERS = [
    "title",
    "description",
    "abbi",
    "sire",
    "dam",
    "startingBid",
    "auctionId", // or 'auctionName' - we'll handle both
  ];

  const OPTIONAL_HEADERS = [
    "auctionName", // Alternative to auctionId
    "weight",
    "age",
    "breed",
    "color",
    "location",
    "consignerName",
    "specialInstructions",
  ];

  const ALL_VALID_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

  // Generate sample Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        title: "Lot #1 - Bull Calf Example",
        description: "Strong bloodline, excellent genetics",
        abbi: "AB12345",
        sire: "Champion Bull A",
        dam: "Premium Cow B",
        startingBid: 500,
        auctionName: "Spring Bull Sale 2024", // Use auction name instead of ID
        weight: 450,
        age: "8 months",
        breed: "Angus",
        color: "Black",
        location: "Ranch A, Texas",
        consignerName: "John Smith",
        specialInstructions: "Handle with care",
      },
      {
        title: "Lot #2 - Heifer Example",
        description: "Excellent breeding potential",
        abbi: "AB67890",
        sire: "Elite Bull X",
        dam: "Top Cow Y",
        startingBid: 700,
        auctionName: "Spring Bull Sale 2024",
        weight: 380,
        age: "10 months",
        breed: "Hereford",
        color: "Red/White",
        location: "Ranch B, Oklahoma",
        consignerName: "Jane Doe",
        specialInstructions: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lots Template");

    // Set column widths
    const colWidths = [
      { wch: 25 }, // title
      { wch: 40 }, // description
      { wch: 12 }, // abbi
      { wch: 20 }, // sire
      { wch: 20 }, // dam
      { wch: 12 }, // startingBid
      { wch: 25 }, // auctionName
      { wch: 10 }, // weight
      { wch: 12 }, // age
      { wch: 15 }, // breed
      { wch: 15 }, // color
      { wch: 25 }, // location
      { wch: 20 }, // consignerName
      { wch: 30 }, // specialInstructions
    ];
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, "lots_upload_template.xlsx");
  };

  // Validate headers
  const validateHeaders = (headers) => {
    const errors = [];
    const cleanHeaders = headers.map((h) => h?.toString().trim().toLowerCase());

    // Check for required headers
    const missingRequired = REQUIRED_HEADERS.filter((required) => {
      const variants = [required.toLowerCase()];
      if (required === "auctionId") {
        variants.push("auctionname", "auction_name", "auction name");
      }
      return !variants.some((variant) => cleanHeaders.includes(variant));
    });

    if (missingRequired.length > 0) {
      errors.push({
        type: "missing_required",
        message: `Missing required columns: ${missingRequired.join(", ")}`,
        columns: missingRequired,
      });
    }

    // Check for invalid headers
    const invalidHeaders = headers.filter((header) => {
      const clean = header?.toString().trim().toLowerCase();
      const validVariants = [
        ...ALL_VALID_HEADERS.map((h) => h.toLowerCase()),
        "auctionname",
        "auction_name",
        "auction name",
      ];
      return clean && !validVariants.includes(clean);
    });

    if (invalidHeaders.length > 0) {
      errors.push({
        type: "invalid_headers",
        message: `Invalid column names found: ${invalidHeaders.join(
          ", "
        )}. Please check spelling.`,
        columns: invalidHeaders,
      });
    }

    return errors;
  };

  // Normalize header names
  const normalizeHeaders = (headers) => {
    return headers.map((header) => {
      const clean = header?.toString().trim().toLowerCase();

      // Map variations to standard names
      const headerMap = {
        auctionname: "auctionName",
        auction_name: "auctionName",
        "auction name": "auctionName",
        startingbid: "startingBid",
        starting_bid: "startingBid",
        "starting bid": "startingBid",
      };

      return headerMap[clean] || clean;
    });
  };

  // Process Excel file
  const processExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "", // Default empty cells to empty string
          });

          if (jsonData.length < 2) {
            reject(
              new Error(
                "Excel file must contain headers and at least one data row"
              )
            );
            return;
          }

          const headers = jsonData[0].filter((h) => h !== ""); // Remove empty headers
          const rows = jsonData
            .slice(1)
            .filter((row) =>
              row.some(
                (cell) => cell !== "" && cell !== null && cell !== undefined
              )
            ); // Remove completely empty rows

          resolve({ headers, rows });
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  // Validate and process data
  const validateAndProcessData = (headers, rows) => {
    const errors = [];
    const processedData = [];
    const normalizedHeaders = normalizeHeaders(headers);

    // Create header index mapping
    const headerMap = {};
    normalizedHeaders.forEach((header, index) => {
      headerMap[header] = index;
    });

    rows.forEach((row, rowIndex) => {
      const rowData = {};
      const rowErrors = [];

      // Process each required field
      REQUIRED_HEADERS.forEach((field) => {
        let value = "";

        if (field === "auctionId") {
          const auctionNameIndex = headerMap["auctionName"];
          const auctionIdIndex = headerMap["auctionId"];

          if (auctionNameIndex !== undefined) {
            const auctionName = row[auctionNameIndex]?.toString().trim();
            if (auctionName) {
              // Robust mapping: trim and lowercase for exact match
              const matchedAuction = auctions.find(
                (auction) =>
                  auction.title?.trim().toLowerCase() ===
                  auctionName.toLowerCase()
              );

              if (matchedAuction) {
                value = matchedAuction._id.toString(); // Ensure string conversion
              } else {
                rowErrors.push(
                  `Row ${
                    rowIndex + 2
                  }: Auction "${auctionName}" not found. Available auctions: ${auctions
                    .map((a) => a.title)
                    .join(", ")}`
                );
              }
            }
          } else if (auctionIdIndex !== undefined) {
            const auctionId = row[auctionIdIndex]?.toString().trim();
            const matchedAuction = auctions.find(
              (auction) => auction._id.toString() === auctionId
            );
            if (matchedAuction) {
              value = auctionId;
            } else if (auctionId) {
              rowErrors.push(
                `Row ${rowIndex + 2}: Auction ID "${auctionId}" not found`
              );
            }
          }
        } else {
          const fieldIndex = headerMap[field];
          if (fieldIndex !== undefined) {
            value = row[fieldIndex];
          }
        }

        // Validation for required fields
        if (field === "title" && !value) {
          rowErrors.push(`Row ${rowIndex + 2}: Title is required`);
        }
        if (field === "auctionId" && !value) {
          rowErrors.push(`Row ${rowIndex + 2}: Valid auction is required`);
        }
        if (field === "startingBid" && value !== "" && isNaN(Number(value))) {
          rowErrors.push(`Row ${rowIndex + 2}: Starting bid must be a number`);
        }

        rowData[field] = value || "";
      });

      // Process optional fields
      OPTIONAL_HEADERS.forEach((field) => {
        const fieldIndex = headerMap[field];
        if (fieldIndex !== undefined) {
          rowData[field] = row[fieldIndex] || "";
        }
      });

      // Convert startingBid to number
      if (rowData.startingBid) {
        rowData.startingBid = Number(rowData.startingBid) || 0;
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        processedData.push({
          ...rowData,
          photos: [], // Initialize empty arrays
          videos: [],
          order: rowIndex + 1,
        });
      }
    });

    return { processedData, errors };
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setValidationErrors([]);
    setUploadResults(null);
    setShowPreview(false);

    try {
      // Process Excel file
      const { headers, rows } = await processExcelFile(file);

      // Validate headers
      const headerErrors = validateHeaders(headers);
      if (headerErrors.length > 0) {
        setValidationErrors(headerErrors);
        setUploading(false);
        return;
      }

      // Validate and process data
      const { processedData, errors } = validateAndProcessData(headers, rows);

      if (errors.length > 0) {
        setValidationErrors(
          errors.map((error) => ({
            type: "data_error",
            message: error,
          }))
        );
        setUploading(false);
        return;
      }

      // Show preview
      setPreviewData(processedData);
      setShowPreview(true);
    } catch (error) {
      setValidationErrors([
        {
          type: "file_error",
          message: error.message,
        },
      ]);
    } finally {
      setUploading(false);
    }
  };

  // Confirm upload
  const confirmUpload = async () => {
    setUploading(true);

    try {
      const response = await fetch("/api/lots/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lots: previewData }),
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults({
          success: true,
          message: `Successfully created ${result.created} lots`,
          created: result.created,
          failed: result.failed || 0,
        });
        setShowPreview(false);
        onUploadComplete?.();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      setUploadResults({
        success: false,
        message: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="block font-medium">Bulk Upload (Excel)</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="p-3 border border-gray-300 rounded-lg bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={uploading}
          />

          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Upload className="mr-2" size={18} />
            {uploading ? "Processing..." : "Upload"}
          </button>
        </div>

        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="mr-2" size={18} />
          Download Template
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <h3 className="font-semibold text-red-800">Validation Errors</h3>
          </div>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">
                • {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div
          className={`mb-4 p-4 border rounded-lg ${
            uploadResults.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {uploadResults.success ? (
                <CheckCircle className="text-green-500 mr-2" size={20} />
              ) : (
                <AlertCircle className="text-red-500 mr-2" size={20} />
              )}
              <h3
                className={`font-semibold ${
                  uploadResults.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {uploadResults.success ? "Upload Successful" : "Upload Failed"}
              </h3>
            </div>
            {uploadResults.success && (
              <button
                onClick={() => setUploadResults(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p
            className={`${
              uploadResults.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {uploadResults.message}
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">
                Preview Lots ({previewData.length})
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4">
                {previewData.slice(0, 10).map((lot, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold">{lot.title}</h4>
                    <p className="text-sm text-gray-600">
                      ABBI: {lot.abbi} | {lot.sire} × {lot.dam} | Starting: $
                      {lot.startingBid}
                    </p>
                    <p className="text-xs text-gray-500">
                      Auction:{" "}
                      {auctions.find(
                        (a) => a._id.toString() === lot.auctionId.toString()
                      )?.title || "Unknown"}
                    </p>
                  </div>
                ))}
                {previewData.length > 10 && (
                  <p className="text-gray-500 text-center">
                    ... and {previewData.length - 10} more lots
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={uploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? "Creating Lots..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploadHandler;
