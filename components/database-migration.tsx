"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MigrationService } from '@/lib/migration'
import { PinataService } from '@/lib/pinata'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Download, Upload, Database, AlertTriangle } from 'lucide-react'

interface MigrationStatus {
  users: number
  artists: number
  artworks: number
  bids: number
  errors: string[]
}

export function DatabaseMigration() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [step, setStep] = useState('')
  const [backup, setBackup] = useState('')
  const [connectionTest, setConnectionTest] = useState<{
    supabase: boolean | null
    pinata: boolean | null
  }>({
    supabase: null,
    pinata: null
  })

  const testConnections = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      setConnectionTest(prev => ({ ...prev, supabase: !error }))

      // Test Pinata connection
      const pinataTest = await PinataService.testConnection()
      setConnectionTest(prev => ({ ...prev, pinata: pinataTest }))
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionTest({ supabase: false, pinata: false })
    }
  }

  const createBackup = () => {
    try {
      const backupData = MigrationService.backupLocalStorage()
      setBackup(backupData)
      
      // Create download link
      const blob = new Blob([backupData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auction-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Backup failed:', error)
    }
  }

  const runMigration = async () => {
    setIsRunning(true)
    setProgress(0)
    setStatus(null)

    try {
      setStep('Starting migration...')
      setProgress(10)

      setStep('Migrating users...')
      setProgress(25)

      setStep('Migrating artists...')
      setProgress(50)

      setStep('Migrating artworks...')
      setProgress(75)

      setStep('Migrating bids...')
      setProgress(90)

      const result = await MigrationService.migrateAllData()
      setStatus(result)
      setProgress(100)
      setStep('Migration completed!')

      if (result.errors.length === 0) {
        // Ask user if they want to clear localStorage
        const shouldClear = window.confirm(
          'Migration completed successfully! Do you want to clear the old localStorage data?'
        )
        if (shouldClear) {
          MigrationService.clearLocalStorage()
        }
      }
    } catch (error) {
      console.error('Migration failed:', error)
      setStatus({
        users: 0,
        artists: 0,
        artworks: 0,
        bids: 0,
        errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Tool
          </CardTitle>
          <CardDescription>
            Migrate your data from localStorage to Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Test Connections</h3>
            <div className="flex gap-4">
              <Button onClick={testConnections} variant="outline">
                Test Connections
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {connectionTest.supabase === null ? (
                    <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  ) : connectionTest.supabase ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Supabase</span>
                </div>
                <div className="flex items-center gap-2">
                  {connectionTest.pinata === null ? (
                    <div className="w-4 h-4 bg-gray-300 rounded-full" />
                  ) : connectionTest.pinata ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Pinata IPFS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Create Backup</h3>
            <p className="text-sm text-muted-foreground">
              Create a backup of your current localStorage data before migration
            </p>
            <Button onClick={createBackup} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Backup
            </Button>
          </div>

          {/* Migration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Run Migration</h3>
            <p className="text-sm text-muted-foreground">
              This will transfer all your data from localStorage to the Supabase database
            </p>
            
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{step}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button 
              onClick={runMigration} 
              disabled={isRunning || connectionTest.supabase !== true}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {isRunning ? 'Migrating...' : 'Start Migration'}
            </Button>
          </div>

          {/* Results */}
          {status && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Migration Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{status.users}</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{status.artists}</div>
                    <div className="text-sm text-muted-foreground">Artists</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{status.artworks}</div>
                    <div className="text-sm text-muted-foreground">Artworks</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{status.bids}</div>
                    <div className="text-sm text-muted-foreground">Bids</div>
                  </CardContent>
                </Card>
              </div>

              {status.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-semibold">Migration Errors:</div>
                      {status.errors.map((error, index) => (
                        <div key={index} className="text-sm">{error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">Before running migration:</div>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>Ensure your Supabase database is set up with the correct schema</li>
                  <li>Test connections to both Supabase and Pinata</li>
                  <li>Create a backup of your current data</li>
                  <li>Migration can be run multiple times safely (existing records won't be duplicated)</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
