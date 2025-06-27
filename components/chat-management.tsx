"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { useChatContext, ChatMessage } from "@/contexts/chat-context"
import { useChatHistoryByDate, ChatHistoryByDate } from "@/hooks/use-chat-history-by-date"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogClose,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, ChevronDown, ChevronRight, Search, Trash2, AlertTriangle, FileText } from "lucide-react"
import { toast } from "sonner"
import { AdminChatExport } from "./admin-chat-export"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ChatManagement() {
  const { messages, exportChatHistory, deleteMessage } = useChatContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChat, setSelectedChat] = useState<ChatHistoryByDate | null>(null)
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set())
  const [deletionWarning, setDeletionWarning] = useState<string | null>(null)
  
  // Use our custom hook to group and filter messages by date
  const { chatHistoryByDate, filteredHistory: filteredChatHistory } = useChatHistoryByDate(messages, searchTerm);

  // Toggle selection of a chat history for export
  const toggleChatSelection = (dateKey: string) => {
    const newSelection = new Set(selectedChats);
    if (newSelection.has(dateKey)) {
      newSelection.delete(dateKey);
    } else {
      newSelection.add(dateKey);
    }
    setSelectedChats(newSelection);
  };
  
  // Export selected chat histories
  const exportSelected = () => {
    if (selectedChats.size === 0) {
      toast.error("Please select at least one chat history to export");
      return;
    }
    
    // Collect all messages from selected dates
    const selectedMessages = chatHistoryByDate
      .filter(chat => selectedChats.has(chat.date))
      .flatMap(chat => chat.messages);
    
    // Format chats for export
    const exportData = selectedMessages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(msg => ({
        timestamp: format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        sender: msg.displayName,
        walletAddress: msg.walletAddress,
        message: msg.text,
        isAdmin: msg.isAdmin,
        level: msg.level
      }));
    
    // Create and download the export file
    const exportBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const exportUrl = URL.createObjectURL(exportBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = exportUrl;
    downloadLink.download = `chat-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast.success(`Successfully exported ${selectedMessages.length} messages`);
  };
  
  // Select all chat histories
  const selectAll = () => {
    const allDates = new Set<string>(chatHistoryByDate.map(chat => chat.date));
    setSelectedChats(allDates);
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedChats(new Set<string>());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat Management</h1>
        <p className="text-muted-foreground">
          Manage chat messages and export conversation data
        </p>
      </div>
      
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages">Message Management</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Chat Messages</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={exportSelected} 
                    disabled={selectedChats.size === 0}
                    size="sm"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button 
                    onClick={selectAll} 
                    size="sm" 
                    variant="outline"
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={clearSelections} 
                    size="sm" 
                    variant="outline"
                    disabled={selectedChats.size === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                View and manage chat messages across the platform
              </CardDescription>
              <div className="pt-2">
                <Input
                  placeholder="Search by username, date, time, wallet address, keywords, or admin status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-lg"
                  type="search"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Search examples: "2024-06-23", "admin", "0x1234", "level 3", "hello", "14:30"
                </div>
              </div>
            </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Chat messages are automatically deleted after 7 days. Using Supabase for persistent storage.
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChatHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No chat history found
                  </TableCell>
                </TableRow>
              ) : (
                filteredChatHistory.map((chat) => (
                  <TableRow key={chat.date}>
                    <TableCell>
                      <Checkbox
                        checked={selectedChats.has(chat.date)}
                        onCheckedChange={() => toggleChatSelection(chat.date)}
                      />
                    </TableCell>
                    <TableCell>{chat.formattedDate}</TableCell>
                    <TableCell>{chat.messageCount}</TableCell>
                    <TableCell>{chat.participants.size}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedChat(chat)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Chat History - {chat?.formattedDate}</DialogTitle>
                            <DialogDescription>
                              {chat?.messageCount} messages from {chat?.participants.size} participants
                            </DialogDescription>
                            <div className="pt-2">
                              <Input
                                placeholder="Search messages in this conversation..."
                                className="w-full"
                                type="search"
                              />
                            </div>
                          </DialogHeader>
                          
                          <ScrollArea className="h-[calc(80vh-120px)] border rounded-md p-4">
                            {selectedChat?.messages.map((message) => (
                              <div 
                                key={message.id}
                                className="py-3 border-b last:border-b-0"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">
                                    {message.displayName} 
                                    {message.isAdmin && (
                                      <span className="ml-2 text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Admin</span>
                                    )}
                                    {message.level && (
                                      <span className="ml-2 text-xs bg-purple-500 text-white px-1 py-0.5 rounded">L{message.level}</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(message.timestamp), 'h:mm a')}
                                  </div>
                                </div>
                                <div className="mt-1">{message.text}</div>
                                <div className="mt-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDeletionWarning(`Are you sure you want to delete this message from ${message.displayName}?`);
                                      const handleConfirm = () => {
                                        deleteMessage(message.id);
                                        setDeletionWarning(null);
                                        toast.success("Message deleted");
                                      };
                                      toast.warning(deletionWarning || "", {
                                        action: {
                                          label: "Delete",
                                          onClick: handleConfirm
                                        },
                                        cancel: {
                                          label: "Cancel",
                                          onClick: () => setDeletionWarning(null)
                                        }
                                      });
                                    }}
                                    className="h-6 text-xs"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                          
                          <DialogFooter>
                            <Button 
                              onClick={() => {
                                if (!selectedChat) return;
                                
                                // Export only this conversation
                                const exportData = selectedChat.messages
                                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                  .map(msg => ({
                                    timestamp: format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss'),
                                    sender: msg.displayName,
                                    walletAddress: msg.walletAddress,
                                    message: msg.text,
                                    isAdmin: msg.isAdmin,
                                    level: msg.level
                                  }));
                                
                                const exportBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                                const exportUrl = URL.createObjectURL(exportBlob);
                                const downloadLink = document.createElement('a');
                                downloadLink.href = exportUrl;
                                downloadLink.download = `chat-${selectedChat.date}.json`;
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                                
                                toast.success(`Successfully exported chat history for ${selectedChat.formattedDate}`);
                              }} 
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <DialogClose asChild>
                              <Button type="button">
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <AdminChatExport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
