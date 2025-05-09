"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ZoomIn, ArrowUpDownIcon as ArrowsUpDown } from "lucide-react"
import { ImageViewer } from "@/components/image-viewer"
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

// Helper function to get the correct image filename based on model and image number
const getImageFilename = (model: string, imageNumber: number): string => {
  if (model === "BBDM") {
    // BBDM uses x_{index}_0.png format (0-indexed)
    return `x_${imageNumber - 1}_0.png`
  } else {
    // Other models use output_{number}.png format (1-indexed)
    return `output_${imageNumber}.png`
  }
}

// Helper function to get border color based on rank position
const getBorderColorClass = (position: number): string => {
  switch (position) {
    case 0: // Rank 1 (Best)
      return "border-emerald-500"
    case 1: // Rank 2
      return "border-green-500"
    case 2: // Rank 3
      return "border-amber-500"
    case 3: // Rank 4
      return "border-orange-500"
    case 4: // Rank 5 (Worst)
      return "border-red-500"
    default:
      return "border-gray-200"
  }
}

// Helper function to get text color based on rank position
const getTextColorClass = (position: number): string => {
  switch (position) {
    case 0: // Rank 1 (Best)
      return "text-emerald-600"
    case 1: // Rank 2
      return "text-green-600"
    case 2: // Rank 3
      return "text-amber-600"
    case 3: // Rank 4
      return "text-orange-600"
    case 4: // Rank 5 (Worst)
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

interface SortableImageProps {
  model: string
  imageNumber: number
  index: number
  position: number
  id: string
  onViewFullSize: () => void
  imageLabel: string
  onTapToSwap: () => void
  isSelected: boolean
}

// Component for a single sortable image
const SortableImage = ({
  model,
  imageNumber,
  index,
  position,
  id,
  onViewFullSize,
  imageLabel,
  onTapToSwap,
  isSelected,
}: SortableImageProps) => {
  const filename = getImageFilename(model, imageNumber)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  const borderColorClass = getBorderColorClass(position)
  const textColorClass = getTextColorClass(position)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all border-2 rounded-md overflow-hidden",
        borderColorClass,
        isDragging ? "opacity-80 scale-105 shadow-lg" : "",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "",
        "cursor-pointer", // Make it look clickable for mobile users
      )}
      onClick={(e) => {
        // Only trigger tap-to-swap if not clicking on a button or image (for zoom)
        if (!(e.target as HTMLElement).closest("button") && !(e.target as HTMLElement).closest(".image-container")) {
          onTapToSwap()
        }
      }}
      {...attributes}
      {...listeners}
    >
      {/* Rank indicator at the top */}
      <div className={cn("p-1 text-center font-medium text-sm", textColorClass)}>Rank {position + 1}</div>

      <div className="p-1 flex justify-between items-center bg-gray-50">
        <div className="font-medium text-sm">Image {imageLabel}</div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:hidden" // Only show on mobile
            onClick={(e) => {
              e.stopPropagation()
              onTapToSwap()
            }}
          >
            <ArrowsUpDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onViewFullSize()
            }}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="relative bg-white">
        <div className="relative w-full image-container" style={{ aspectRatio: "768/496" }}>
          <Image
            src={`https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/${model}/${filename}`}
            alt={`Enhanced Vitreous OCT Image ${imageLabel}`}
            fill
            className="object-contain"
            onDoubleClick={(e) => {
              e.stopPropagation()
              onViewFullSize()
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface DragDropRankingProps {
  inputImage: number
  models: string[]
  onSubmit: (modelOrder: string[]) => void
  initialRanking: string[] | null
}

export function DragDropRanking({ inputImage, models, onSubmit, initialRanking }: DragDropRankingProps) {
  // State for model order
  const [modelOrder, setModelOrder] = useState<string[]>([])
  const [viewingImage, setViewingImage] = useState<{ src: string; alt: string } | null>(null)
  // Map to keep track of original image labels (A, B, C, etc.)
  const [imageLabels, setImageLabels] = useState<Record<string, string>>({})
  // State for tap-to-swap functionality
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  // State to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false)
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false)

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Check if we're on client-side and set up window resize listener
  useEffect(() => {
    setIsMounted(true)

    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Initial check
    checkIfMobile()

    // Set up listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Initialize or randomize models when input image changes
  useEffect(() => {
    let newModelOrder: string[] = []

    if (initialRanking) {
      // If we have initial rankings, use those
      newModelOrder = initialRanking
    } else {
      // Otherwise randomize
      newModelOrder = [...models].sort(() => 0.5 - Math.random())
    }

    setModelOrder(newModelOrder)

    // Create image labels (A, B, C, etc.) for each model
    const labels: Record<string, string> = {}
    newModelOrder.forEach((model, idx) => {
      labels[model] = String.fromCharCode(65 + idx) // A, B, C, etc.
    })
    setImageLabels(labels)
  }, [inputImage, models, initialRanking])

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Get the old and new indices
      const oldIndex = modelOrder.findIndex((id) => id === active.id)
      const newIndex = modelOrder.findIndex((id) => id === over.id)

      // Update model order
      setModelOrder(arrayMove(modelOrder, oldIndex, newIndex))
    }
  }

  // Handle tap-to-swap functionality
  const handleTapToSwap = (index: number) => {
    if (selectedImageIndex === null) {
      // First image selected
      setSelectedImageIndex(index)
    } else if (selectedImageIndex === index) {
      // Same image tapped twice, deselect it
      setSelectedImageIndex(null)
    } else {
      // Second image selected, swap them
      const newOrder = [...modelOrder]
      const temp = newOrder[selectedImageIndex]
      newOrder[selectedImageIndex] = newOrder[index]
      newOrder[index] = temp
      setModelOrder(newOrder)
      setSelectedImageIndex(null) // Clear selection after swap
    }
  }

  // Handle submission
  const handleSubmit = () => {
    onSubmit(modelOrder)
  }

  // Handle full-size image view
  const handleViewFullSize = (model: string, index: number) => {
    const filename = getImageFilename(model, inputImage)
    setViewingImage({
      src: `https://ykpapaa0p8nihfde.public.blob.vercel-storage.com/${model}/${filename}`,
      alt: `Enhanced Vitreous OCT Image ${imageLabels[model]}`,
    })
  }

  // Don't render anything during SSR
  if (!isMounted) {
    return <div className="min-h-[400px] bg-gray-50 rounded-md flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={modelOrder}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {modelOrder.map((model, index) => (
              <SortableImage
                key={model}
                id={model}
                model={model}
                imageNumber={inputImage}
                index={index}
                position={index}
                onViewFullSize={() => handleViewFullSize(model, index)}
                imageLabel={imageLabels[model] || String.fromCharCode(65 + index)}
                onTapToSwap={() => handleTapToSwap(index)}
                isSelected={selectedImageIndex === index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {selectedImageIndex !== null && (
        <div className="text-center p-2 bg-blue-50 rounded-md text-blue-700 text-sm">
          Now tap another image to swap positions, or tap the same image again to cancel.
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-muted-foreground">
          {isMobile
            ? "Tap images to select and swap positions"
            : "Drag to reorder images from best (left) to worst (right)"}
        </div>
        <Button onClick={handleSubmit}>Submit Ranking</Button>
      </div>

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
