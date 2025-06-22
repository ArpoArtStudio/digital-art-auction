import { SiteHeader } from "@/components/site-header"
import { EnhancedArtworkSubmissionForm } from "@/components/enhanced-artwork-submission-form"

export default function SubmitArtworkPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Submit Your Artwork</h1>
              <p className="text-muted-foreground mt-2">
                Create a new NFT or select from your existing collection to auction on our platform
              </p>
            </div>
            <EnhancedArtworkSubmissionForm />
          </div>
        </div>
      </main>
    </div>
  )
}
