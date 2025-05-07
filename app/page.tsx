import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl">Visual Turing Test for Vitreous OCT Image Enhancement</CardTitle>
          <CardDescription className="text-lg mt-2">
            Evaluation of Deep Learning Models for Vitreous OCT Image Enhancement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg">
              Welcome to our clinical evaluation study for deep learning models used in enhancing low-quality OCT images
              of the vitreous body.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-6 text-left">
            <h3 className="font-medium text-lg mb-3">About This Study:</h3>
            <p className="mb-4">
              We have developed several deep learning models to enhance low-quality vitreous OCT images. Your clinical expertise
              is invaluable in helping us determine which models produce the most clinically relevant results.
            </p>
            <p className="mb-4">
              In this test, you will be shown 10 low-quality vitreous OCT images. For each image, you will see 5 enhanced
              versions created by 5 different AI models. Your task is to rank these enhanced images from best to worst
              based on your clinical judgment.
            </p>
            <h4 className="font-medium mt-6 mb-2">Example of a Low-Quality Vitreous OCT Image:</h4>
            <div className="relative mb-4">
              <div className="relative w-full" style={{ aspectRatio: "768/496" }}>
                <Image
                  src="https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/inputs/1.jpg"
                  alt="Example of a low-quality vitreous OCT image"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p>
              The test will take approximately 10-15 minutes to complete. Your responses will be anonymized and used
              solely for research purposes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Suspense fallback={<Button disabled>Loading...</Button>}>
            <Link href="/login">
              <Button size="lg">Start Evaluation</Button>
            </Link>
          </Suspense>
        </CardFooter>
      </Card>
    </div>
  )
}
