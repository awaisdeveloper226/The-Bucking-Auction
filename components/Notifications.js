"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Bell } from "lucide-react";

export default function NotificationsManagement() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [auctionLive, setAuctionLive] = useState(true);
  const [outbidNotice, setOutbidNotice] = useState(true);
  const [winnerConfirm, setWinnerConfirm] = useState(false);

  return (
    <Card className="w-full shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Bell className="h-5 w-5 text-[#6ED0CE]" />
          Notifications & Communication
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email / SMS */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Channels</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <Label>Email Notifications</Label>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <Label>SMS Notifications</Label>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Types</h3>

          <div className="flex items-center justify-between">
            <Label>Auction Live Reminder</Label>
            <Switch checked={auctionLive} onCheckedChange={setAuctionLive} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Outbid Notice</Label>
            <Switch checked={outbidNotice} onCheckedChange={setOutbidNotice} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Winner Confirmation</Label>
            <Switch checked={winnerConfirm} onCheckedChange={setWinnerConfirm} />
          </div>
        </div>

        {/* Send Test */}
        <div className="pt-4 border-t">
          <Button className="w-full bg-[#6ED0CE] hover:bg-[#57b2b0] text-white">
            Send Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
