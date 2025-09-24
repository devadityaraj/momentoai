"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Shield, Zap, BrainCircuit } from "lucide-react"

interface LimitationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LimitationsModal({ open, onOpenChange }: LimitationsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Momento AI Limitations
          </DialogTitle>
          <DialogDescription>Please be aware of these current limitations when using Momento AI.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
          <div className="flex items-start gap-3">
              <BrainCircuit className="h-4 w-4 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Model</p>
                <p className="text-sm text-muted-foreground">
                  Momento AI uses H20 1.8B Chat Model, Momento AI official is comming soon.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Rate Limiting</p>
                <p className="text-sm text-muted-foreground">Maximum 5 prompts per 12-hour period per account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Processing Time</p>
                <p className="text-sm text-muted-foreground">
                  Responses may take 30-120 seconds depending on server load and queue.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Server Specs</p>
                <p className="text-sm text-muted-foreground">
                  Intel Core i7 - 7300U Dual Core, 16GB RAM, NO CUDA so processing will be slow.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)} className="bg-primary hover:bg-primary/90">
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
