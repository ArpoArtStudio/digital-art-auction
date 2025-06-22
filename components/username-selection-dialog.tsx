"use client"

import React, { useState } from "react"
import { useWallet, DisplayNameOption } from "@/contexts/wallet-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UsernameSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  isChangeRequest?: boolean
}

export function UsernameSelectionDialog({ isOpen, onClose, isChangeRequest = false }: UsernameSelectionDialogProps) {
  const { 
    walletAddress, 
    selectUsername, 
    availableEnsNames,
    displayNameOption: currentOption
  } = useWallet()
  
  const [selectedOption, setSelectedOption] = useState<DisplayNameOption>(currentOption)
  const [selectedEnsName, setSelectedEnsName] = useState<string>(availableEnsNames[0] || "")
  
  const handleSave = () => {
    selectUsername(
      selectedOption,
      selectedOption === DisplayNameOption.ENS ? selectedEnsName : undefined
    )
    onClose()
  }
  
  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 5)}`
    : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isChangeRequest ? "Request Username Change" : "Select Your Display Name"}
          </DialogTitle>
          <DialogDescription>
            {isChangeRequest 
              ? "This change requires admin approval. You'll continue to use your current username until approved."
              : "Choose how you want to be identified in the auction chat."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <RadioGroup 
            value={selectedOption} 
            onValueChange={(val) => setSelectedOption(val as DisplayNameOption)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={DisplayNameOption.SHORT_ADDRESS} id="short" />
              <Label htmlFor="short" className="cursor-pointer">
                Short Address ({shortAddress})
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={DisplayNameOption.FULL_ADDRESS} id="full" />
              <Label htmlFor="full" className="cursor-pointer">
                Full Address ({walletAddress})
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value={DisplayNameOption.ENS} 
                id="ens" 
                disabled={availableEnsNames.length === 0}
              />
              <Label 
                htmlFor="ens" 
                className={`cursor-pointer ${availableEnsNames.length === 0 ? 'opacity-50' : ''}`}
              >
                ENS Name
              </Label>
            </div>
            
            {selectedOption === DisplayNameOption.ENS && availableEnsNames.length > 0 && (
              <div className="pl-6 pt-2">
                {availableEnsNames.length === 1 ? (
                  <div className="text-sm font-medium">
                    {availableEnsNames[0]}
                  </div>
                ) : (
                  <Select value={selectedEnsName} onValueChange={setSelectedEnsName}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ENS name" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEnsNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isChangeRequest ? "Submit Request" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
