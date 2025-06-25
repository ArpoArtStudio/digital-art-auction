'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Instagram, Twitter, Facebook, Globe, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";

interface Artist {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  artCount: number;
  totalSales: string;
  verified: boolean;
  joinedDate: string;
  location?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  description: string;
  achievements: string[];
}

interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  price: string;
  status: 'available' | 'sold' | 'auction';
  createdAt: string;
}

// Mock data
const mockArtists: { [key: string]: Artist } = {
  "1": {
    id: "1",
    name: "Digital Visionary",
    bio: "Creating ethereal digital landscapes that blur the boundaries between reality and imagination.",
    description: "Award-winning digital artist with over 8 years of experience in creating immersive digital experiences. My work explores the intersection of technology and human emotion, often featuring surreal landscapes and abstract forms that challenge traditional perceptions of reality.\n\nI specialize in digital painting, 3D modeling, and mixed media installations. My pieces have been featured in galleries worldwide and collected by art enthusiasts across the globe.",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    artCount: 12,
    totalSales: "45.5",
    verified: true,
    joinedDate: "March 2022",
    location: "San Francisco, CA",
    socialLinks: {
      website: "https://digitalvisionary.art",
      twitter: "https://twitter.com/digitalvisionary",
      instagram: "https://instagram.com/digitalvisionary",
      facebook: "https://facebook.com/digitalvisionary"
    },
    achievements: [
      "Featured Artist 2024",
      "Digital Art Award Winner",
      "Top Seller Q3 2024",
      "Community Choice Award"
    ]
  },
  "2": {
    id: "2",
    name: "Pixel Prophet",
    bio: "Exploring the intersection of traditional art techniques and digital innovation.",
    description: "Contemporary artist bridging the gap between classical techniques and modern digital art. My journey began with traditional oil painting and evolved into digital mastery, combining both worlds to create unique hybrid artworks.\n\nEach piece tells a story of transformation and evolution, much like my own artistic journey. I believe in pushing boundaries while respecting the fundamentals of artistic expression.",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    artCount: 8,
    totalSales: "32.2",
    verified: true,
    joinedDate: "June 2022",
    location: "New York, NY",
    socialLinks: {
      website: "https://pixelprophet.io",
      twitter: "https://twitter.com/pixelprophet",
      instagram: "https://instagram.com/pixelprophet"
    },
    achievements: [
      "Rising Star 2024",
      "Innovation Award",
      "Gallery Partnership"
    ]
  },
  "3": {
    id: "3",
    name: "Crypto Canvas",
    bio: "Abstract expressions of blockchain technology and its impact on society.",
    description: "Blockchain enthusiast and digital artist creating thought-provoking pieces that explore the societal implications of cryptocurrency and decentralized technology. My work often features geometric patterns and data visualizations that represent the flow of digital assets.\n\nI'm passionate about the democratization of art through blockchain technology and believe NFTs represent a fundamental shift in how we perceive and trade artistic value.",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    artCount: 15,
    totalSales: "67.8",
    verified: true,
    joinedDate: "January 2022",
    location: "London, UK",
    socialLinks: {
      website: "https://cryptocanvas.art",
      twitter: "https://twitter.com/cryptocanvas",
      instagram: "https://instagram.com/cryptocanvas",
      facebook: "https://facebook.com/cryptocanvas"
    },
    achievements: [
      "Top 10 Artist 2024",
      "Blockchain Innovation Award",
      "Featured in CryptoArt Magazine",
      "Gallery Exhibition NYC"
    ]
  },
  "4": {
    id: "4",
    name: "NFT Nomad",
    bio: "Traveling the digital realm to capture moments of virtual beauty.",
    description: "Digital nomad and artist exploring virtual worlds to capture their hidden beauty. My work focuses on landscape photography within digital environments, from metaverse spaces to procedurally generated worlds.\n\nI believe virtual spaces have their own aesthetic value that deserves to be preserved and celebrated. Each piece represents a moment in digital time that may never be seen again.",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    artCount: 6,
    totalSales: "18.3",
    verified: false,
    joinedDate: "August 2023",
    location: "Remote",
    socialLinks: {
      website: "https://nftnomad.digital",
      instagram: "https://instagram.com/nftnomad"
    },
    achievements: [
      "Virtual World Explorer",
      "New Artist Spotlight"
    ]
  }
};

const mockArtworks: { [key: string]: Artwork[] } = {
  "1": [
    {
      id: "1",
      title: "Ethereal Dreams",
      imageUrl: "/placeholder.svg?height=300&width=300",
      price: "5.2 ETH",
      status: "available",
      createdAt: "2024-06-15"
    },
    {
      id: "2",
      title: "Digital Horizon",
      imageUrl: "/placeholder.svg?height=300&width=300",
      price: "3.8 ETH",
      status: "sold",
      createdAt: "2024-05-20"
    }
  ],
  "2": [
    {
      id: "3",
      title: "Traditional Fusion",
      imageUrl: "/placeholder.svg?height=300&width=300",
      price: "4.1 ETH",
      status: "auction",
      createdAt: "2024-06-10"
    }
  ],
  "3": [
    {
      id: "4",
      title: "Blockchain Genesis",
      imageUrl: "/placeholder.svg?height=300&width=300",
      price: "8.5 ETH",
      status: "available",
      createdAt: "2024-06-18"
    }
  ],
  "4": [
    {
      id: "5",
      title: "Virtual Vista",
      imageUrl: "/placeholder.svg?height=300&width=300",
      price: "2.4 ETH",
      status: "available",
      createdAt: "2024-06-20"
    }
  ]
};

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    const artistData = mockArtists[artistId];
    const artistArtworks = mockArtworks[artistId] || [];
    
    if (artistData) {
      setArtist(artistData);
      setArtworks(artistArtworks);
    }
  }, [artistId]);

  if (!artist) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Artist Not Found</h1>
            <p className="text-muted-foreground mt-2">The artist you're looking for doesn't exist.</p>
            <Link href="/artists">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Artists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link href="/artists">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Artists
          </Button>
        </Link>

        {/* Profile Section */}
        <div className="text-center mb-8">
          {/* Large Profile Picture */}
          <div className="relative inline-block mb-6">
            <Image
              src={artist.avatarUrl}
              alt={artist.name}
              width={200}
              height={200}
              className="rounded-full mx-auto border-4 border-background shadow-lg"
            />
            {artist.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Artist Name */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{artist.name}</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-4">{artist.bio}</p>
          </div>

          {/* Basic Info */}
          <div className="flex items-center justify-center gap-6 text-muted-foreground mb-6">
            {artist.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{artist.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Joined {artist.joinedDate}</span>
            </div>
          </div>

          {/* Social Links */}
          {artist.socialLinks && (
            <div className="flex justify-center gap-4 mb-8">
              {artist.socialLinks.website && (
                <a 
                  href={artist.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
              {artist.socialLinks.twitter && (
                <a 
                  href={artist.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {artist.socialLinks.instagram && (
                <a 
                  href={artist.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {artist.socialLinks.facebook && (
                <a 
                  href={artist.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{artist.artCount}</div>
              <div className="text-muted-foreground">Artworks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{artist.totalSales} ETH</div>
              <div className="text-muted-foreground">Total Sales</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="artworks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Artworks Tab */}
          <TabsContent value="artworks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={artwork.status === 'sold' ? 'destructive' : artwork.status === 'auction' ? 'default' : 'secondary'}
                      >
                        {artwork.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{artwork.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">{artwork.price}</span>
                      <div className="text-sm text-muted-foreground">
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About the Artist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {artist.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artist.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
