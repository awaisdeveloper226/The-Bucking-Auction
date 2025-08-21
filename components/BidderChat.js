"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

export default function BidderChatToggle() {
  const [chatEnabled, setChatEnabled] = useState(true);

  return (
    <Card className="w-full shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <MessageCircle className="h-5 w-5 text-[#6ED0CE]" />
          Bidder Chat Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-gray-700">
            Enable Real-Time Chat Between Bidders
          </Label>
          <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
        </div>

        <p className="text-sm text-gray-500">
          When enabled, bidders can communicate in real-time during live auctions.
        </p>
      </CardContent>
    </Card>
  );
}
