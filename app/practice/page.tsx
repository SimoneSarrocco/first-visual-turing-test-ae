"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DragDropRanking } from "@/components/drag-drop-ranking"
import { ImageViewer } from "@/components/image-viewer"
import { ZoomIn, AlertCircle, CheckCircle2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

// Define model types for practice
const models = ["DDPM", "VQGAN", "UNET", "Pix2Pix", "BBDM"]
const practiceImage = 1 // Use image #1 for practice

export default function PracticePage() {
  const router = useRouter()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [viewingInputImage, setViewingInputImage] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [viewingImage, setViewingImage] = useState(false) // Fix: Declare viewingImage state

  // Only run client-side code after component is mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle practice submission
  const handlePracticeSubmit = (modelOrder: string[]) => {
    setHasSubmitted(true)
  }

  // Handle direct navigation to test
  const handleStartTest = () => {
    // Navigate programmatically instead of using Link
    router.push("/test")
  }

  // Don't render anything until client-side
  if (!isMounted) {
    return null
  }

  return (
    <div className="w-full px-4 py-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Practice Question</span>
            <span className="text-sm font-normal text-muted-foreground">
              This is a practice question to help you get familiar with the interface
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a practice question. Your response will not be recorded. Try ranking the images to get familiar
              with the interface before starting the actual test.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Input Low-Quality OCT Image:</h3>
              <div className="relative group bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: "768/496", height: "200px" }}>
                  <Image
                    src={`https://cdn.jsdelivr.net/gh/SimoneSarrocco/images-oct@main/inputs/${practiceImage}.jpg`}
                    alt="Practice input OCT image"
                    fill
                    className="object-contain"
                    onDoubleClick={() => setViewingInputImage(true)}
                  />
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

            <div>
              <h3 className="font-medium mb-2">Enhanced Images - Drag to Rank (Best to Worst):</h3>
              <DragDropRanking
                inputImage={practiceImage}
                models={models}
                onSubmit={handlePracticeSubmit}
                initialRanking={null}
              />
            </div>
          </div>

          {hasSubmitted && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">Great job!</h4>
                  <p className="text-green-700 dark:text-green-400 mt-1">
                    You've successfully completed the practice question. You're now ready to start the actual
                    evaluation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {hasSubmitted ? (
            <Button onClick={handleStartTest}>Start Actual Test</Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Please rank all images and click "Submit Ranking" to continue
            </div>
          )}
        </CardFooter>
      </Card>

      {viewingInputImage && (
        <ImageViewer
          src={`https://cdn.jsdelivr.net/gh/SimoneSarrocco/images-oct@main/inputs/${practiceImage}.jpg`}
          alt="Practice input OCT image (full size)"
          isOpen={viewingInputImage}
          onClose={() => setViewingInputImage(false)}
        />
      )}

      {/* Custom positioning for the toaster */}
      <div className="fixed top-4 right-4 z-50 max-w-xs">
        <Toaster />
      </div>
    </div>
  )
}
