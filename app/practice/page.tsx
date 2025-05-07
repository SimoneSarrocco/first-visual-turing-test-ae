"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageRanking } from "@/components/image-ranking"
import { ImageViewer } from "@/components/image-viewer"
import { ZoomIn, AlertCircle, CheckCircle2 } from "lucide-react"

// Define model types for practice
const models = ["DDPM", "VQGAN", "UNET", "Pix2Pix", "BBDM"]
const practiceImage = 1 // Use image #1 for practice

export default function PracticePage() {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [viewingInputImage, setViewingInputImage] = useState(false)

  // Handle practice submission
  const handlePracticeSubmit = (modelOrder: string[]) => {
    setHasSubmitted(true)
  }

  return (
    <div className="w-full px-4 py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Practice Question</span>
            <span className="text-sm font-normal text-muted-foreground">
              This is a practice question to help you get familiar with the interface
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a practice question. Your response will not be recorded. Try ranking the images to get familiar
              with the interface before starting the actual test.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 lg:sticky lg:top-4 lg:self-start">
              <h3 className="font-medium mb-2">Input Low-Quality Vitreous OCT Image:</h3>
              <div className="relative group">
                <div className="relative w-full" style={{ aspectRatio: "768/496" }}>
                  <Image
                    src={`https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/${practiceImage}.jpg`}
                    alt="Practice Input Vitreous OCT Image"
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

            <div className="lg:w-2/3">
              <h3 className="font-medium mb-2">Enhanced Images - Rank from 1 (best) to 5 (worst):</h3>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Instructions:</strong> Use the buttons at the top of each image to assign a rank from 1 (best) to 5 (worst) for
                  each enhanced image.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>Click the zoom icon or double-click any image to view it in full size</li>
                  <li>Use the zoom controls to examine image details</li>
                  <li>Drag when zoomed in to pan around the image</li>
                  <li>Each image must have a unique rank (1-5)</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-2">
                
                <strong>Important</strong>: The name of each image (e.g. Image A) is not referring to a specific AI model, but it is just a fake name given to highlight the fact that each image is different from all the others shown in the same question.
                </p>
              </div>
              <ImageRanking
                inputImage={practiceImage}
                models={models}
                onSubmit={handlePracticeSubmit}
                initialRanking={null}
              />
            </div>
          </div>

          {hasSubmitted && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
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
            <Link href="/test">
              <Button>Start Actual Test</Button>
            </Link>
          ) : (
            <div className="text-sm text-muted-foreground">
              Please rank all images and click "Submit Ranking" to continue
            </div>
          )}
        </CardFooter>
      </Card>

      <ImageViewer
        src={`https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/${practiceImage}.jpg`}
        alt="Practice Input Vitreous OCT Image (full size)"
        isOpen={viewingInputImage}
        onClose={() => setViewingInputImage(false)}
      />
    </div>
  )
}
