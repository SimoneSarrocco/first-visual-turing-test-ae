import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function InstructionsPage() {
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
              <li>You will be presented with 10 low-quality OCT images of the vitreous body of the human eye, one at a time.</li>
              <li>For each low-quality image, you will see 5 enhanced versions created by 5 different AI models.</li>
              <li>Your task is to rank these 5 enhanced images from best (1) to worst (5).</li>
              <li>To rank the images, use the buttons close to each image to assign a rank.</li>
              <li>After ranking all 5 images, click "Submit Ranking" to proceed to the next image.</li>
              <li>You can navigate between questions using the question number buttons at the top.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Evaluation Criteria:</h3>
            <p>When ranking the enhanced images, please consider:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Overall image quality and clarity</li>
              <li>Visibility of anatomical structures</li>
              <li>Reduction of speckle noise and motion artifacts</li>
              <li>Clinical usefulness for diagnosis</li>
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
                <div className="relative">
                  <div className="relative w-full" style={{ aspectRatio: "768/496" }}>
                    <Image
                      src="https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/1.jpg"
                      alt="Example of a low-quality vitreous OCT image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Enhanced Images (to be ranked):</p>
                <div className="relative">
                  <div className="relative w-full" style={{ aspectRatio: "768/496" }}>
                    <Image
                      src="https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/DDPM/output_1.png"
                      alt="Example of an enhanced vitreous OCT image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/practice">
            <Button size="lg">Try Practice Question</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
