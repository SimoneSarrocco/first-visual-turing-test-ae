"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRankingsForExport, createCSV, downloadCSV } from "@/lib/export-utils"

// Define full model names with abbreviations
const MODEL_FULL_NAMES: Record<string, string> = {
  DDPM: "Denoising Diffusion Probabilistic Model",
  VQGAN: "Vector-Quantized Generative Adversarial Network",
  UNET: "U-Net Architecture",
  Pix2Pix: "Pix2Pix GAN",
  BBDM: "Brownian-Bridge Diffusion Model",
}

interface ModelRanking {
  model: string
  averageRank: number
  count: number
}

export default function ThankYouPage() {
  const [hasLocalData, setHasLocalData] = useState(false)
  const [modelRankings, setModelRankings] = useState<ModelRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Only access sessionStorage on the client side
    if (typeof window !== "undefined") {
      // Check if there's any data in session storage
      const rankings = sessionStorage.getItem("rankings")
      if (rankings) {
        setHasLocalData(true)
        calculateResults(rankings)
      }
    }

    setIsLoading(false)
  }, [])

  const calculateResults = (rankingsJson: string) => {
    try {
      const rankings = JSON.parse(rankingsJson)
      const models = ["DDPM", "VQGAN", "UNET", "Pix2Pix", "BBDM"]

      // Initialize model stats
      const modelStats: Record<string, { totalRank: number; count: number }> = {}
      models.forEach((model) => {
        modelStats[model] = { totalRank: 0, count: 0 }
      })

      // Calculate total rankings for each model
      Object.values(rankings).forEach((modelOrder: any) => {
        modelOrder.forEach((model: string, index: number) => {
          if (modelStats[model]) {
            // Add rank position (0-indexed, so add 1)
            modelStats[model].totalRank += index + 1
            modelStats[model].count += 1
          }
        })
      })

      // Calculate average rank for each model
      const results = models.map((model) => ({
        model,
        averageRank: modelStats[model].count > 0 ? modelStats[model].totalRank / modelStats[model].count : 0,
        count: modelStats[model].count,
      }))

      // Sort by average rank (lower is better)
      setModelRankings(results.sort((a, b) => a.averageRank - b.averageRank))
    } catch (error) {
      console.error("Error calculating results:", error)
    }
  }

  const handleDownloadData = () => {
    try {
      if (typeof window === "undefined") return

      // Get data from session storage
      const rankings = sessionStorage.getItem("rankings")
      const modelSequences = sessionStorage.getItem("modelSequences")
      const clinicianId = sessionStorage.getItem("clinicianId")

      if (!rankings || !clinicianId) {
        console.error("Missing required data in session storage")
        return
      }

      // Parse the rankings
      const parsedRankings = JSON.parse(rankings)
      const parsedModelSequences = modelSequences ? JSON.parse(modelSequences) : {}

      // Get clinician data
      const clinicianData = {
        id: clinicianId,
        name: sessionStorage.getItem("clinicianName") || "Anonymous",
        institution: sessionStorage.getItem("clinicianInstitution") || "Not specified",
        experience: sessionStorage.getItem("clinicianExperience") || "unknown",
        created_at: sessionStorage.getItem("clinicianCreatedAt") || new Date().toISOString(),
      }

      // Format the data for export - combine clinician and ranking data
      const formattedData = formatRankingsForExport(parsedRankings, parsedModelSequences, clinicianId, clinicianData)

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
    } catch (error) {
      console.error("Error downloading data:", error)
    }
  }

  // Helper function to get color class based on rank
  const getRankColorClass = (rank: number): string => {
    if (rank <= 1.5) return "text-emerald-600"
    if (rank <= 2.5) return "text-green-600"
    if (rank <= 3.5) return "text-amber-600"
    if (rank <= 4.5) return "text-orange-600"
    return "text-red-600"
  }

  // Helper function to get background color class based on rank
  const getBackgroundColorClass = (rank: number): string => {
    if (rank <= 1.5) return "bg-emerald-100"
    if (rank <= 2.5) return "bg-green-100"
    if (rank <= 3.5) return "bg-amber-100"
    if (rank <= 4.5) return "bg-orange-100"
    return "bg-red-100"
  }

  // Don't render anything during SSR
  if (!isMounted) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md card-gradient">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            Your evaluation has been successfully submitted. We greatly appreciate your participation in this clinical
            study.
          </p>
          <p className="mt-4">
            Your expert feedback will help us improve deep learning models for OCT image enhancement.
          </p>

          {/* Results Summary - Always show if we have rankings */}
          {!isLoading && modelRankings.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Your Evaluation Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your rankings, here's how you rated the different deep learning models:
              </p>
              <div className="space-y-4">
                {modelRankings.map((model, index) => (
                  <div key={model.model} className="text-left">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">
                        <span title={MODEL_FULL_NAMES[model.model]}>{model.model}</span>
                        <span className="text-xs text-muted-foreground ml-1 hidden md:inline">
                          ({MODEL_FULL_NAMES[model.model]})
                        </span>
                      </div>
                      <span className={`font-bold ${getRankColorClass(model.averageRank)}`}>
                        {model.averageRank.toFixed(2)}
                      </span>
                    </div>
                    {/* More intuitive progress bars - shorter is better (since lower rank is better) */}
                    <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className={`absolute top-0 right-0 h-full ${getBackgroundColorClass(model.averageRank)}`}
                        style={{ width: `${model.averageRank * 20}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>Better</span>
                      <span>Average rank: {model.averageRank.toFixed(2)} (lower is better)</span>
                      <span>Worse</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                Based on your {modelRankings[0].count} evaluations
              </div>
            </div>
          )}

          {hasLocalData && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-yellow-800 dark:text-yellow-300">
                It seems your data might not have been saved to our database. You can download your results as a CSV
                file to ensure your valuable feedback is preserved.
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 mt-2">Please send the downloaded CSV file to:</p>
              <div className="flex flex-col gap-1 mt-2">
                <a
                  href="mailto:simone.sarrocco@unibas.ch"
                  className="text-blue-600 hover:underline flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-1" /> simone.sarrocco@unibas.ch
                </a>
                <span className="text-yellow-800 dark:text-yellow-300">or</span>
                <a
                  href="mailto:philippe.valmaggia@unibas.ch"
                  className="text-blue-600 hover:underline flex items-center justify-center"
                >
                  <Mail className="h-4 w-4 mr-1" /> philippe.valmaggia@unibas.ch
                </a>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center flex-col gap-2">
          {hasLocalData && (
            <Button onClick={handleDownloadData} className="w-full mb-2">
              <Download className="mr-2 h-4 w-4" />
              Download Your Results
            </Button>
          )}
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
