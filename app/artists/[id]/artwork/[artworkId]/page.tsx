'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Eye, Calendar, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

interface ArtworkDetail {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  status: 'available' | 'sold' | 'auction';
  views: number;
  likes: number;
  createdAt: string;
  dimensions: string;
  medium: string;
  edition: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  tags: string[];
  history: Array<{
    event: string;
    date: string;
    price?: string;
  }>;
}

// Mock artwork data
const mockArtworkDetails: { [key: string]: ArtworkDetail } = {
  "1": {
    id: "1",
    title: "Ethereal Dimensions",
    description: "A mesmerizing journey through digital consciousness, this piece explores the liminal space between our physical reality and the infinite possibilities of virtual existence. Created using advanced digital painting techniques combined with AI-assisted rendering, each layer reveals new depths of meaning and visual complexity.\n\nThe swirling forms represent the flow of data and consciousness in our increasingly connected world, while the ethereal lighting suggests the spiritual aspect of our digital evolution.",
    imageUrl: "/placeholder.svg?height=600&width=600",
    price: "5.2 ETH",
    status: "available",
    views: 1240,
    likes: 89,
    createdAt: "2024-06-15",
    dimensions: "3840 x 2160 pixels",
    medium: "Digital Art, AI-Assisted",
    edition: "1/1 Unique",
    artistId: "1",
    artistName: "Digital Visionary",
    artistAvatar: "/placeholder.svg?height=100&width=100",
    tags: ["Digital Art", "Abstract", "Consciousness", "Technology", "Spiritual"],
    history: [
      { event: "Created", date: "2024-06-15" },
      { event: "Listed for Sale", date: "2024-06-16", price: "5.2 ETH" }
    ]
  },
  "2": {
    id: "2",
    title: "Digital Consciousness",
    description: "An exploration of what it means to be conscious in a digital age. This piece combines traditional artistic principles with cutting-edge digital techniques to create a visual representation of the modern mind.",
    imageUrl: "/placeholder.svg?height=600&width=600",
    price: "8.7 ETH",
    status: "sold",
    views: 2100,
    likes: 156,
    createdAt: "2024-05-20",
    dimensions: "4096 x 4096 pixels",
    medium: "Digital Painting",
    edition: "1/1 Unique",
    artistId: "1",
    artistName: "Digital Visionary",
    artistAvatar: "/placeholder.svg?height=100&width=100",
    tags: ["Digital Art", "Portrait", "Consciousness", "Modern"],
    history: [
      { event: "Created", date: "2024-05-20" },
      { event: "Listed for Sale", date: "2024-05-21", price: "8.7 ETH" },
      { event: "Sold", date: "2024-05-25", price: "8.7 ETH" }
    ]
  }
};

export default function ArtworkDetailPage() {
  const params = useParams();
  const artistId = params.id as string;
  const artworkId = params.artworkId as string;
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Simulate API call
    const artworkData = mockArtworkDetails[artworkId];
    if (artworkData) {
      setArtwork(artworkData);
    }
  }, [artworkId]);

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Artwork Not Found</h1>
            <p className="text-muted-foreground mt-2">The artwork you're looking for doesn't exist.</p>
            <Link href={`/artists/${artistId}`}>
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Artist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href={`/artists/${artistId}`}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Artist Profile
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork Image */}
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                width={600}
                height={600}
                className="w-full rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={artwork.status === 'sold' ? 'destructive' : artwork.status === 'auction' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {artwork.status}
                </Badge>
              </div>
            </div>
            
            {/* Image Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {artwork.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {artwork.likes + (isLiked ? 1 : 0)} likes
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLike}>
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{artwork.price}</span>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(artwork.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Artist Info */}
            <Link href={`/artists/${artwork.artistId}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={artwork.artistAvatar}
                      alt={artwork.artistName}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{artwork.artistName}</div>
                      <div className="text-sm text-muted-foreground">Artist</div>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {artwork.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Artwork Details */}
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span>{artwork.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medium</span>
                    <span>{artwork.medium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Edition</span>
                    <span>{artwork.edition}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {artwork.status === 'available' && (
                <Button size="lg" className="w-full">
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now for {artwork.price}
                </Button>
              )}
              {artwork.status === 'auction' && (
                <Button size="lg" className="w-full">
                  <Zap className="h-5 w-5 mr-2" />
                  Place Bid
                </Button>
              )}
              {artwork.status === 'sold' && (
                <Button size="lg" className="w-full" disabled>
                  Sold
                </Button>
              )}
            </div>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artwork.history.map((event, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{event.event}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {event.price && (
                        <div className="font-semibold">{event.price}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
