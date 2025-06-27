"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { DatabaseService } from '@/lib/database'
import { useWallet } from '@/contexts/wallet-context'
import { Download, FileText, Calendar, User, Flag, Trash2, Clock } from 'lucide-react'

interface ChatExport {
  id: string
  export_type: string
  status: string
  file_url?: string
  file_size_bytes?: number
  total_messages?: number
  created_at: string
  expires_at?: string
  download_count: number
}

export function AdminChatExport() {
  const { isAdmin } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [exports, setExports] = useState<ChatExport[]>([])
  const [exportType, setExportType] = useState<string>('full')
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [deletedIncluded, setDeletedIncluded] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')

  useEffect(() => {
    if (isAdmin) {
      loadExports()
    }
  }, [isAdmin])

  const loadExports = async () => {
    try {
      // This would call the database service to get exports
      // For now, we'll use mock data
      setExports([])
    } catch (error) {
      console.error('Failed to load exports:', error)
    }
  }

  const createExport = async () => {
    if (!isAdmin) return

    setIsLoading(true)
    try {
      const exportData = {
        export_type: exportType,
        export_format: exportFormat,
        date_range_start: dateRangeStart || null,
        date_range_end: dateRangeEnd || null,
        user_filter: userFilter || null,
        flagged_only: flaggedOnly,
        deleted_included: deletedIncluded,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }

      // Here you would call the actual export service
      console.log('Creating export with data:', exportData)
      
      // Mock the export creation
      const newExport: ChatExport = {
        id: `export_${Date.now()}`,
        export_type: exportType,
        status: 'processing',
        total_messages: 0,
        created_at: new Date().toISOString(),
        download_count: 0
      }

      setExports(prev => [newExport, ...prev])
      
      // Simulate processing completion
      setTimeout(() => {
        setExports(prev => prev.map(exp => 
          exp.id === newExport.id 
            ? { 
                ...exp, 
                status: 'completed', 
                file_url: '/exports/chat_export.json',
                file_size_bytes: 1024 * 50, // 50KB
                total_messages: 150
              }
            : exp
        ))
      }, 3000)

    } catch (error) {
      console.error('Failed to create export:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadExport = async (exportItem: ChatExport) => {
    if (!exportItem.file_url) return

    try {
      // Increment download count
      setExports(prev => prev.map(exp => 
        exp.id === exportItem.id 
          ? { ...exp, download_count: exp.download_count + 1 }
          : exp
      ))

      // Create download
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `chat_export_${timestamp}.${exportItem.file_url.split('.').pop()}`
      
      // For now, create a mock download
      const exportContent = {
        export_info: {
          type: exportItem.export_type,
          created_at: exportItem.created_at,
          total_messages: exportItem.total_messages,
          filters: {
            flagged_only: flaggedOnly,
            deleted_included: deletedIncluded,
            user_filter: userFilter || null,
            date_range: {
              start: dateRangeStart || null,
              end: dateRangeEnd || null
            }
          }
        },
        messages: [
          // Mock message data
          {
            id: "msg_1",
            user_address: "0x123...",
            message: "Hello world!",
            timestamp: new Date().toISOString(),
            user_level: "L3",
            is_deleted: false,
            is_flagged: false
          }
        ]
      }

      const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Failed to download export:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
      expired: "secondary"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          Access denied. Only administrators can export chat data.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Chat Export
          </CardTitle>
          <CardDescription>
            Export chat messages with advanced filtering options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-type">Export Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Export</SelectItem>
                  <SelectItem value="date_range">Date Range</SelectItem>
                  <SelectItem value="user_specific">User Specific</SelectItem>
                  <SelectItem value="flagged_only">Flagged Messages Only</SelectItem>
                  <SelectItem value="moderated_only">Moderated Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(exportType === 'date_range' || exportType === 'full') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          {exportType === 'user_specific' && (
            <div className="space-y-2">
              <Label htmlFor="user-filter">User Wallet Address</Label>
              <Input
                id="user-filter"
                placeholder="0x..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flagged-only"
                checked={flaggedOnly}
                onCheckedChange={setFlaggedOnly}
              />
              <Label htmlFor="flagged-only">Flagged messages only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deleted-included"
                checked={deletedIncluded}
                onCheckedChange={setDeletedIncluded}
              />
              <Label htmlFor="deleted-included">Include deleted messages</Label>
            </div>
          </div>

          <Button onClick={createExport} disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Export...' : 'Create Export'}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            Manage and download your chat exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exports created yet
            </div>
          ) : (
            <div className="space-y-4">
              {exports.map((exportItem) => (
                <div
                  key={exportItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {exportItem.export_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {getStatusBadge(exportItem.status)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(exportItem.created_at).toLocaleDateString()}
                      </span>
                      {exportItem.total_messages && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {exportItem.total_messages} messages
                        </span>
                      )}
                      {exportItem.file_size_bytes && (
                        <span>{formatFileSize(exportItem.file_size_bytes)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {exportItem.download_count} downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exportItem.status === 'completed' && exportItem.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadExport(exportItem)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    {exportItem.status === 'processing' && (
                      <Button variant="outline" size="sm" disabled>
                        <Clock className="h-4 w-4 mr-1 animate-spin" />
                        Processing...
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
