import Image from "next/image"
import Link from "next/link"

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="rounded-md" />
      <span className="font-bold text-lg sm:text-xl whitespace-nowrap">Arpo Studio</span>
    </Link>
  )
}
