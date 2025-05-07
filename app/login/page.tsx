"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [institution, setInstitution] = useState("")
  const [experience, setExperience] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!experience) {
      toast({
        title: "Required Field",
        description: "Please select your years of experience with OCT images",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Generate a unique ID for this clinician
      const clinicianId = `clinician_${Math.random().toString(36).substring(2, 12)}`

      // Store all clinician info in session storage
      sessionStorage.setItem("clinicianId", clinicianId)
      sessionStorage.setItem("clinicianName", name || "Anonymous")
      sessionStorage.setItem("clinicianInstitution", institution || "Not specified")
      sessionStorage.setItem("clinicianExperience", experience)
      sessionStorage.setItem("clinicianCreatedAt", new Date().toISOString())

      // Navigate to the test page
      router.push("/instructions")
    } catch (error) {
      console.error("Error saving clinician info:", error)
      toast({
        title: "Error",
        description: "There was an error saving your information. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Clinician Information</CardTitle>
          <CardDescription>Please provide some information before starting the evaluation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution (Optional)</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Your institution"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center">
                Years of Experience with OCT Images
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <RadioGroup value={experience || ""} onValueChange={setExperience}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="less_than_5" id="less_than_5" />
                  <Label htmlFor="less_than_5">Less than 5 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5_or_more" id="5_or_more" />
                  <Label htmlFor="5_or_more">5 years or more</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
