"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, UserPlus, Eye } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export function ArtistManagement() {
  const [artists, setArtists] = useState([
    {
      id: "1",
      name: "Digital Visionary",
      email: "digital@example.com",
      status: "active",
      artworks: 12,
      totalSales: "45.5",
      joinDate: "2023-01-15",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      bio: "Creating ethereal digital landscapes that blur the boundaries between reality and imagination."
    },
    {
      id: "2",
      name: "Pixel Prophet",
      email: "pixel@example.com",
      status: "active",
      artworks: 8,
      totalSales: "32.2",
      joinDate: "2023-02-20",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      bio: "Exploring the intersection of traditional art techniques and digital innovation."
    },
    {
      id: "3",
      name: "Crypto Canvas",
      email: "crypto@example.com",
      status: "pending",
      artworks: 0,
      totalSales: "0.0",
      joinDate: "2023-06-01",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      bio: "Abstract expressions of blockchain technology and its impact on society."
    },
    {
      id: "4",
      name: "NFT Nomad",
      email: "nomad@example.com",
      status: "suspended",
      artworks: 6,
      totalSales: "18.3",
      joinDate: "2023-03-10",
      avatarUrl: "/placeholder.svg?height=40&width=40",
      bio: "Traveling the digital realm to capture fleeting moments of virtual beauty."
    },
  ])
  
  const [viewArtist, setViewArtist] = useState<typeof artists[0] | null>(null)
  const [editArtist, setEditArtist] = useState<typeof artists[0] | null>(null)
  const [deleteArtistId, setDeleteArtistId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newArtist, setNewArtist] = useState({
    name: "",
    email: "",
    bio: ""
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const handleAddArtist = () => {
    const id = Math.random().toString(36).substring(2, 11)
    const newArtistEntry = {
      id,
      name: newArtist.name,
      email: newArtist.email,
      status: "pending",
      artworks: 0,
      totalSales: "0.0",
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: "/placeholder.svg?height=40&width=40",
      bio: newArtist.bio
    }
    
    setArtists([...artists, newArtistEntry])
    setNewArtist({ name: "", email: "", bio: "" })
    toast.success("Artist added successfully")
  }
  
  const handleUpdateArtist = () => {
    if (!editArtist) return
    
    setArtists(artists.map(artist => 
      artist.id === editArtist.id ? editArtist : artist
    ))
    setEditArtist(null)
    toast.success("Artist updated successfully")
  }
  
  const handleDeleteArtist = () => {
    if (!deleteArtistId) return
    
    setArtists(artists.filter(artist => artist.id !== deleteArtistId))
    setDeleteArtistId(null)
    toast.success("Artist deleted successfully")
  }
  
  const filteredArtists = searchTerm 
    ? artists.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        artist.email.toLowerCase().includes(searchTerm.toLowerCase()))
    : artists

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Input 
            placeholder="Search artists..." 
            className="w-64" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            {searchTerm ? "Clear" : "Filter"}
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
              <DialogDescription>Create a new artist profile</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="Artist name" 
                  className="col-span-3" 
                  value={newArtist.name}
                  onChange={e => setNewArtist({...newArtist, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="artist@example.com" 
                  className="col-span-3" 
                  value={newArtist.email}
                  onChange={e => setNewArtist({...newArtist, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Textarea 
                  id="bio" 
                  placeholder="Artist biography..." 
                  className="col-span-3" 
                  value={newArtist.bio}
                  onChange={e => setNewArtist({...newArtist, bio: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddArtist}>Add Artist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Artworks</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={artist.avatarUrl || "/placeholder.svg"}
                        alt={artist.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">{artist.name}</div>
                        <div className="text-sm text-muted-foreground">{artist.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(artist.status)}</TableCell>
                  <TableCell>{artist.artworks}</TableCell>
                  <TableCell>{artist.totalSales} ETH</TableCell>
                  <TableCell>{artist.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setViewArtist(artist)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Artist Profile</DialogTitle>
                          </DialogHeader>
                          {viewArtist && (
                            <div className="space-y-4 py-4">
                              <div className="flex justify-center">
                                <Image
                                  src={viewArtist.avatarUrl}
                                  alt={viewArtist.name}
                                  width={80}
                                  height={80}
                                  className="rounded-full"
                                />
                              </div>
                              <div className="text-center">
                                <h3 className="text-lg font-medium">{viewArtist.name}</h3>
                                <p className="text-muted-foreground">{viewArtist.email}</p>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <strong>Status:</strong> {viewArtist.status}
                                </div>
                                <div>
                                  <strong>Artworks:</strong> {viewArtist.artworks}
                                </div>
                                <div>
                                  <strong>Total Sales:</strong> {viewArtist.totalSales} ETH
                                </div>
                                <div>
                                  <strong>Joined:</strong> {viewArtist.joinDate}
                                </div>
                                <div>
                                  <strong>Bio:</strong>
                                  <p className="mt-1">{viewArtist.bio}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setEditArtist({...artist})}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Artist</DialogTitle>
                          </DialogHeader>
                          {editArtist && (
                            <>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editArtist.name}
                                    onChange={e => setEditArtist({...editArtist, name: e.target.value})}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                                  <Input
                                    id="edit-email"
                                    value={editArtist.email}
                                    onChange={e => setEditArtist({...editArtist, email: e.target.value})}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-status" className="text-right">Status</Label>
                                  <select
                                    id="edit-status"
                                    value={editArtist.status}
                                    onChange={e => setEditArtist({...editArtist, status: e.target.value})}
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-bio" className="text-right">Bio</Label>
                                  <Textarea
                                    id="edit-bio"
                                    value={editArtist.bio}
                                    onChange={e => setEditArtist({...editArtist, bio: e.target.value})}
                                    className="col-span-3"
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateArtist}>Save Changes</Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setDeleteArtistId(artist.id)} 
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this artist profile and all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteArtistId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteArtist}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
