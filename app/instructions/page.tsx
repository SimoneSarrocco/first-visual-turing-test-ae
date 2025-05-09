"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ZoomIn } from "lucide-react"
import { ImageViewer } from "@/components/image-viewer"

export default function InstructionsPage() {
  const router = useRouter()
  const [viewingImage, setViewingImage] = useState<{ src: string; alt: string } | null>(null)

  const handleViewImage = (src: string, alt: string) => {
    setViewingImage({ src, alt })
  }

  const handleStartPractice = () => {
    router.push("/practice")
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Instructions</CardTitle>
          <CardDescription>Please read carefully before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">How the Test Works:</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>You will be presented with 10 low-quality OCT images, one at a time.</li>
              <li>For each low-quality image, you will see 5 enhanced versions created by different AI models.</li>
              <li>Your task is to rank these 5 enhanced images from best (left) to worst (right).</li>
              <li>To rank the images, drag and drop them into your preferred order.</li>
              <li>After arranging all 5 images, click "Submit Ranking" to proceed to the next image.</li>
              <li>You can navigate between questions using the question number buttons at the top.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Evaluation Criteria:</h3>
            <p>When ranking the enhanced images, please consider:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Overall image quality and clarity</li>
              <li>Visibility of anatomical structures</li>
              <li>Reduction of noise and artifacts</li>
              <li>Clinical usefulness for diagnosis</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Drag and Drop Instructions:</h3>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Click and hold an image to pick it up</li>
              <li>Drag the image to your desired position in the ranking</li>
              <li>Release to drop the image in its new position</li>
              <li>Images are color-coded by rank (green = best, red = worst)</li>
              <li>The leftmost position represents the best image</li>
              <li>The rightmost position represents the worst image</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Image Viewing Features:</h3>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Double-click on any image to view it in full size</li>
              <li>Use the zoom controls to examine image details more closely</li>
              <li>When zoomed in, you can drag to pan around the image</li>
              <li>Click the zoom icon in the corner of any image for full-size view</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Example:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 font-medium">Original Low-Quality Image:</p>
                <div className="relative group">
                  <div className="relative w-full" style={{ aspectRatio: "768/496", height: "200px" }}>
                    <Image
                      src="https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/1.jpg"
                      alt="Example of a low-quality OCT image"
                      fill
                      className="object-contain"
                      onDoubleClick={() =>
                        handleViewImage(
                          "https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/1.jpg",
                          "Example of a low-quality OCT image",
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-black/50 hover:bg-black/70"
                    onClick={() =>
                      handleViewImage(
                        "https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/1.jpg",
                        "Example of a low-quality OCT image",
                      )
                    }
                  >
                    <ZoomIn className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Enhanced Images (to be ranked):</p>
                <div className="relative group">
                  <div className="relative w-full" style={{ aspectRatio: "768/496", height: "200px" }}>
                    <Image
                      src="https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/DDPM/output_1.png"
                      alt="Example of an enhanced OCT image"
                      fill
                      className="object-contain"
                      onDoubleClick={() =>
                        handleViewImage(
                          "https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/DDPM/output_1.png",
                          "Example of an enhanced OCT image",
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-black/50 hover:bg-black/70"
                    onClick={() =>
                      handleViewImage(
                        "https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/DDPM/output_1.png",
                        "Example of an enhanced OCT image",
                      )
                    }
                  >
                    <ZoomIn className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={handleStartPractice}>
            Try Practice Question
          </Button>
        </CardFooter>
      </Card>

      {viewingImage && (
        <ImageViewer
          src={viewingImage.src || "/placeholder.svg"}
          alt={viewingImage.alt}
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
    </div>
  )
}
