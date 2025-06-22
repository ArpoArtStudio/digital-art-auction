"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { useChatContext, ChatMessage } from "@/contexts/chat-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBiddingContext, BiddingLevel } from "@/contexts/bidding-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Search, Trash2, AlertTriangle, VolumeX } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWallet } from "@/contexts/wallet-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function ChatHistory() {
  const { isConnected, walletAddress } = useWallet()
  const { messages, deleteMessage, muteUser, exportChatHistory } = useChatContext()
  const { getLevelColor, getLevelBadge, getLevelName } = useBiddingContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null)
  const [muteDuration, setMuteDuration] = useState("10")
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([])

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMessages(messages)
      return
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase()
    setFilteredMessages(
      messages.filter(
        (message) =>
          message.text.toLowerCase().includes(lowerCaseSearch) ||
          message.walletAddress.toLowerCase().includes(lowerCaseSearch) ||
          message.displayName.toLowerCase().includes(lowerCaseSearch)
      )
    )
  }, [searchTerm, messages])

  const handleDeleteMessage = (message: ChatMessage) => {
    deleteMessage(message.id)
    toast.success("Message deleted successfully")
  }

  const handleMuteUser = () => {
    if (!selectedMessage) return
    
    muteUser(selectedMessage.walletAddress, parseInt(muteDuration))
    setSelectedMessage(null)
    toast.success(`User muted for ${muteDuration} minutes`)
  }

  const handleExport = () => {
    exportChatHistory()
    toast.success("Chat history exported to CSV")
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
          <CardDescription>Connect your admin wallet to view chat history</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Admin authentication required</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const formatMessageDate = (timestamp: string) => {
    return format(new Date(timestamp), "MMM dd, yyyy h:mm a")
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>
                View and manage platform chat messages
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border mb-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className={message.isAdmin ? 'text-red-400' : getLevelColor(message.level || 1)}>
                                {message.displayName}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] h-4 border-0 ml-1 ${message.isAdmin ? 'bg-red-400/10 text-red-400' : `${getLevelColor(message.level || 1).replace('text-', 'bg-').replace('-400', '-400/10')}`}`}
                              >
                                {message.isAdmin ? 'Admin' : getLevelBadge(message.level || 1)}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {message.walletAddress}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate">
                          {message.text}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatMessageDate(message.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMessage(message)}
                              title="Delete Message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Mute User"
                                  onClick={() => setSelectedMessage(message)}
                                >
                                  <VolumeX className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Mute User</DialogTitle>
                                  <DialogDescription>
                                    Select how long to mute this user for.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="wallet">User Wallet</Label>
                                    <Input
                                      id="wallet"
                                      value={selectedMessage?.walletAddress || ""}
                                      readOnly
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Select
                                      value={muteDuration}
                                      onValueChange={setMuteDuration}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select duration" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="10">10 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="1440">24 hours</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleMuteUser}>Mute User</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Chat messages are automatically deleted after 7 days.
            </div>
            <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
              Using Supabase for persistent storage
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
