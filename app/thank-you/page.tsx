"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRankingsForExport, createCSV, downloadCSV } from "@/lib/export-utils"

export default function ThankYouPage() {
  const [hasLocalData, setHasLocalData] = useState(false)

  useEffect(() => {
    // Check if there's any data in session storage
    const rankings = sessionStorage.getItem("rankings")
    if (rankings) {
      setHasLocalData(true)
    }
  }, [])

  const handleDownloadData = () => {
    try {
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

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
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
          {hasLocalData && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-yellow-800 dark:text-yellow-300">
                It seems your data might not have been saved to our database. You can download your results as a CSV
                file to ensure your valuable feedback is preserved.
              </p>
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
