import { SiteHeader } from "@/components/site-header"
import { ArtworkSubmissionForm } from "@/components/artwork-submission-form"

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
                Join our community of artists! Complete your artist profile and submit your NFT artwork for auction on our platform
              </p>
            </div>
            <ArtworkSubmissionForm />
          </div>
        </div>
      </main>
    </div>
  )
}
