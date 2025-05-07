"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ImageRanking } from "@/components/image-ranking"
import { createClient } from "@/lib/supabase-client"
import { ImageViewer } from "@/components/image-viewer"
import { ZoomIn, Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatRankingsForExport, createCSV, downloadCSV } from "@/lib/export-utils"

// Define model types
const models = ["DDPM", "VQGAN", "UNET", "Pix2Pix", "BBDM"]

// Generate test sequence - consistently select 10 random sets out of 17
const generateTestSequence = () => {
  // Use a fixed seed for random selection to ensure consistency
  const fixedSeed = 42
  const pseudoRandom = (seed: number) => {
    let value = seed
    return () => {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    }
  }

  const random = pseudoRandom(fixedSeed)

  // Create an array of all possible group indices (0 to 16)
  const allGroups = Array.from({ length: 17 }, (_, i) => i)

  // Shuffle the array using our seeded random function
  for (let i = allGroups.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[allGroups[i], allGroups[j]] = [allGroups[j], allGroups[i]]
  }

  // Take the first 10 groups
  const selectedGroups = allGroups.slice(0, 10)

  // For each selected group, pick one random image
  const sequence = selectedGroups.map((groupIndex) => {
    const baseIndex = groupIndex * 10
    const randomOffset = Math.floor(random() * 10)
    return baseIndex + randomOffset + 1 // +1 because images are 1-indexed
  })

  return sequence
}

export default function TestPage() {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [testSequence, setTestSequence] = useState<number[]>([])
  const [rankings, setRankings] = useState<Record<number, string[]>>({})
  const [modelSequences, setModelSequences] = useState<Record<number, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [clinicianId, setClinicianId] = useState("")
  const [clinicianData, setClinicianData] = useState<Record<string, string>>({})
  const [viewingInputImage, setViewingInputImage] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  const [supabaseError, setSupabaseError] = useState<string | null>(null)

  // Initialize test sequence on component mount
  useEffect(() => {
    // Generate a fixed sequence for all users
    const sequence = generateTestSequence()
    setTestSequence(sequence)

    // Get clinician ID and data from session storage
    const storedClinicianId = sessionStorage.getItem("clinicianId")
    if (!storedClinicianId) {
      // Redirect to login if no clinician ID is found
      router.push("/login")
      return
    }

    setClinicianId(storedClinicianId)

    // Collect all clinician data from session storage
    setClinicianData({
      id: storedClinicianId,
      name: sessionStorage.getItem("clinicianName") || "Anonymous",
      institution: sessionStorage.getItem("clinicianInstitution") || "Not specified",
      experience: sessionStorage.getItem("clinicianExperience") || "unknown",
      created_at: sessionStorage.getItem("clinicianCreatedAt") || new Date().toISOString(),
    })

    // Check if we have any saved rankings in session storage
    const savedRankings = sessionStorage.getItem("rankings")
    if (savedRankings) {
      try {
        const parsedRankings = JSON.parse(savedRankings)
        setRankings(parsedRankings)

        // Mark questions as completed
        const completed = new Set<number>()
        Object.keys(parsedRankings).forEach((key) => {
          const index = sequence.findIndex((num) => num === Number(key))
          if (index !== -1) {
            completed.add(index)
          }
        })
        setCompletedQuestions(completed)
      } catch (e) {
        console.error("Error parsing saved rankings:", e)
      }
    }

    // Check if we have any saved model sequences in session storage
    const savedModelSequences = sessionStorage.getItem("modelSequences")
    if (savedModelSequences) {
      try {
        setModelSequences(JSON.parse(savedModelSequences))
      } catch (e) {
        console.error("Error parsing saved model sequences:", e)
      }
    }

    // Check if there was a previous Supabase error
    const savedError = sessionStorage.getItem("supabaseError")
    if (savedError) {
      setSupabaseError(savedError)
    }

    setLoading(false)
  }, [router])

  const currentImage = testSequence[currentImageIndex]
  const progress = testSequence.length > 0 ? (completedQuestions.size / testSequence.length) * 100 : 0

  // Navigate to a specific question
  const navigateToQuestion = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Handle ranking submission for current image
  const handleRankingSubmit = (modelOrder: string[]) => {
    // Store both the rankings and the original model sequence for this image
    const newRankings = {
      ...rankings,
      [currentImage]: modelOrder,
    }

    setRankings(newRankings)

    // Store the model sequence that was shown to the user
    const newModelSequences = {
      ...modelSequences,
      [currentImage]: modelOrder,
    }

    setModelSequences(newModelSequences)

    // Save to session storage for persistence
    sessionStorage.setItem("rankings", JSON.stringify(newRankings))
    sessionStorage.setItem("modelSequences", JSON.stringify(newModelSequences))

    // Mark this question as completed
    const newCompleted = new Set(completedQuestions)
    newCompleted.add(currentImageIndex)
    setCompletedQuestions(newCompleted)

    if (currentImageIndex < testSequence.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
      window.scrollTo(0, 0)
    } else {
      setShowCompletionDialog(true)
    }

    toast({
      title: "Ranking saved",
      description: "Your ranking for this image has been saved",
    })
  }

  // Submit all rankings to the database
  const submitAllRankings = async () => {
    setSubmitting(true)
    try {
      const supabase = createClient()

      // First, try to save clinician data if it hasn't been saved yet
      try {
        const { error: clinicianError } = await supabase.from("clinicians").insert([
          {
            id: clinicianData.id,
            name: clinicianData.name,
            institution: clinicianData.institution,
            experience: clinicianData.experience,
            created_at: clinicianData.created_at,
          },
        ])

        // If there's an error but it's just because the record already exists, that's fine
        if (clinicianError && !clinicianError.message.includes("duplicate key")) {
          console.warn("Could not save clinician data:", clinicianError)
        }
      } catch (err) {
        console.warn("Error saving clinician data, continuing anyway:", err)
      }

      // Format the data for submission
      const formattedRankings = Object.entries(rankings).map(([imageId, modelOrder]) => ({
        clinician_id: clinicianData.id,
        image_id: Number.parseInt(imageId),
        model_rankings: modelOrder,
        model_sequence: modelSequences[Number.parseInt(imageId)] || modelOrder,
        submitted_at: new Date().toISOString(),
      }))

      // Insert data into Supabase one by one to avoid potential issues with batch inserts
      for (const ranking of formattedRankings) {
        const { error } = await supabase.from("rankings").insert([ranking])
        if (error) {
          console.error("Error inserting ranking:", error, ranking)
          throw error
        }
      }

      // Clear session storage after successful submission
      sessionStorage.removeItem("rankings")
      sessionStorage.removeItem("modelSequences")
      sessionStorage.removeItem("supabaseError")

      router.push("/thank-you")
    } catch (error: any) {
      console.error("Error submitting rankings:", error)

      // Store the error message in session storage
      const errorMessage = error?.message || "Unknown error occurred"
      sessionStorage.setItem("supabaseError", errorMessage)
      setSupabaseError(errorMessage)

      // Show export dialog instead of error toast
      setShowExportDialog(true)
      setSubmitting(false)
      setShowCompletionDialog(false)
    }
  }

  // Export data as CSV
  const exportDataAsCSV = () => {
    try {
      // Format the data for export - combine clinician and ranking data
      const formattedData = formatRankingsForExport(rankings, modelSequences, clinicianId, clinicianData)

      // Define headers for the combined CSV
      const headers = [
        "clinician_id",
        "clinician_name",
        "clinician_institution",
        "clinician_experience",
        "clinician_created_at",
        "image_id",
        "model_rankings",
        "model_sequence",
        "submitted_at",
      ]

      // Create and download the CSV
      const csvContent = createCSV(headers, formattedData)
      downloadCSV(csvContent, `oct_evaluation_results_${clinicianId}`)

      // Navigate to thank you page
      router.push("/thank-you")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-10 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading test...</h2>
          <Progress value={0} className="w-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-6">
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>
              Question {currentImageIndex + 1} of {testSequence.length}
            </span>
            <span className="text-sm font-normal text-muted-foreground">Progress: {Math.round(progress)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={progress} className="mb-4" />

          {supabaseError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There was an error connecting to the database. Your answers are being saved locally. You'll be able to
                export your results at the end.
              </AlertDescription>
            </Alert>
          )}

          {/* Question navigation */}
          <div className="mb-4 flex flex-wrap gap-2">
            {testSequence.map((_, index) => (
              <Button
                key={index}
                variant={
                  index === currentImageIndex ? "default" : completedQuestions.has(index) ? "outline" : "secondary"
                }
                size="sm"
                className={completedQuestions.has(index) ? "border-green-500" : ""}
                onClick={() => navigateToQuestion(index)}
              >
                {index + 1}
                {completedQuestions.has(index) && <span className="ml-1 text-green-500">✓</span>}
              </Button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Input image section - fixed on the left for large screens */}
            <div className="lg:w-1/3 lg:sticky lg:top-4 lg:self-start">
              <h3 className="font-medium mb-2">Input Low-Quality OCT Image:</h3>
              <div className="relative group">
                <div className="relative w-full" style={{ aspectRatio: "768/496" }}>
                  {currentImage && (
                    <Image
                      src={`https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/${currentImage}.jpg`}
                      alt={`Input Vitreous OCT Image ${currentImage}`}
                      fill
                      className="object-contain"
                      onDoubleClick={() => setViewingInputImage(true)}
                    />
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-black/50 hover:bg-black/70"
                  onClick={() => setViewingInputImage(true)}
                >
                  <ZoomIn className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Enhanced images section - takes remaining space */}
            <div className="lg:w-2/3">
              <h3 className="font-medium mb-4">Enhanced Images - Rank from 1 (best) to 5 (worst):</h3>
              {currentImage && (
                <ImageRanking
                  inputImage={currentImage}
                  models={models}
                  onSubmit={handleRankingSubmit}
                  initialRanking={rankings[currentImage] || null}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Evaluation</DialogTitle>
            <DialogDescription>
              You have ranked all the images. Would you like to submit your evaluation now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Review Answers
            </Button>
            <Button onClick={submitAllRankings} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Database Connection Error</DialogTitle>
            <DialogDescription>
              We couldn't connect to our database to save your results. This could be due to network issues or because
              the app hasn't been deployed yet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Error: {supabaseError}</AlertDescription>
            </Alert>
            <p className="mb-4">
              You can export your results as a CSV file, which you can then send to the researchers or upload later.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Go Back
            </Button>
            <Button onClick={exportDataAsCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export Results as CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentImage && (
        <ImageViewer
          src={`https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/${currentImage}.jpg`}
          alt={`Input Vitreous OCT Image ${currentImage} (full size)`}
          isOpen={viewingInputImage}
          onClose={() => setViewingInputImage(false)}
        />
      )}

      <Toaster />
    </div>
  )
}
