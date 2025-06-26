// Test script to create mock artist data for testing the badge system and My Profile functionality

// Mock artist data with different submission counts to demonstrate badges
const mockArtists = [
  {
    id: "test-artist-1",
    name: "Test Artist",
    bio: "I'm a test artist with multiple submissions to demonstrate the badge system.",
    email: "test@artist.com",
    location: "New York, NY",
    specialization: "Digital Art",
    experience: "intermediate",
    website: "https://testartist.com",
    twitter: "@testartist",
    instagram: "@testartist",
    facebook: "",
    portfolio: "https://portfolio.testartist.com",
    walletAddress: "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0", // Using the default admin wallet for testing
    avatarUrl: "/placeholder.svg?height=200&width=200",
    status: "active",
    artworks: 0,
    totalSales: "0.0",
    joinDate: "2024-01-15",
    registeredAt: new Date().toISOString(),
  }
];

// Mock submissions to demonstrate different badge levels
const mockSubmissions = [
  // 6 submissions for blue badge (5+)
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `submission-${i + 1}`,
    title: `Test Artwork ${i + 1}`,
    description: `This is test artwork number ${i + 1}`,
    category: "digital-art",
    startingPrice: "0.1",
    artistWallet: "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0",
    imageUrl: "/placeholder.svg?height=400&width=400",
    status: i < 2 ? "approved" : i < 4 ? "pending" : "live",
    submittedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
    queuePosition: i + 1
  }))
];

// Store in localStorage (simulating the registration process)
if (typeof window !== "undefined") {
  // Add mock artist to registered artists
  const existingArtists = JSON.parse(localStorage.getItem('registeredArtists') || '[]');
  const walletAddress = "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0";
  
  // Remove any existing test artist
  const filteredArtists = existingArtists.filter(artist => artist.walletAddress !== walletAddress);
  
  // Add our test artist
  filteredArtists.push(mockArtists[0]);
  localStorage.setItem('registeredArtists', JSON.stringify(filteredArtists));
  
  // Mark as registered
  localStorage.setItem(`artistRegistered_${walletAddress}`, 'true');
  
  // Add mock submissions
  const existingSubmissions = JSON.parse(localStorage.getItem('artworkSubmissions') || '[]');
  const filteredSubmissions = existingSubmissions.filter(sub => sub.artistWallet !== walletAddress);
  filteredSubmissions.push(...mockSubmissions);
  localStorage.setItem('artworkSubmissions', JSON.stringify(filteredSubmissions));
  
  console.log("✅ Mock artist data created!");
  console.log("Artist:", mockArtists[0]);
  console.log("Submissions:", mockSubmissions.length);
  console.log("Connect wallet 0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0 to see the My Profile section");
} else {
  console.log("❌ Not in browser environment");
}
