import { WalletDebugger } from "@/components/wallet-debugger"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Wallet Connection Debug</h1>
      <WalletDebugger />
    </div>
  )
}
