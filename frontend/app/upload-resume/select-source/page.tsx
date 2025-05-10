"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileUp,
  Cloud,
  Database,
  Info,
  ArrowLeft,
  Box,
  HardDriveIcon as OneDrive,
  Server,
  Shield,
  Zap,
  Lock,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SelectUploadSourcePage() {
  const router = useRouter()
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const uploadOptions = [
    {
      id: "device",
      title: "Upload from Device",
      description: "Upload resume files directly from your computer",
      icon: <FileUp className="h-6 w-6" />,
      color: "bg-emerald-600",
      hoverColor: "border-emerald-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      route: "/upload",
      tooltip: "Upload PDF, DOCX, or TXT files from your device",
      category: "local",
      available: true,
      popular: true,
    },
    {
      id: "google",
      title: "Google Drive",
      description: "Import resumes from your Google Drive account",
      icon: <Cloud className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=google",
      tooltip: "Connect to Google Drive to import resume files (Premium feature)",
      category: "cloud",
      premium: true,
      available: false,
    },
    {
      id: "dropbox",
      title: "Dropbox",
      description: "Import resumes from your Dropbox account",
      icon: <Cloud className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=dropbox",
      tooltip: "Connect to Dropbox to import resume files (Premium feature)",
      category: "cloud",
      premium: true,
      available: false,
    },
    {
      id: "onedrive",
      title: "Microsoft OneDrive",
      description: "Import resumes from your OneDrive account",
      icon: <OneDrive className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=onedrive",
      tooltip: "Connect to OneDrive to import resume files (Premium feature)",
      category: "cloud",
      premium: true,
      available: false,
    },
    {
      id: "box",
      title: "Box",
      description: "Import resumes from your Box account",
      icon: <Box className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=box",
      tooltip: "Connect to Box to import resume files (Premium feature)",
      category: "cloud",
      premium: true,
      available: false,
    },
    {
      id: "local-db",
      title: "Local Database",
      description: "Import from your existing resume database",
      icon: <Database className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=local",
      tooltip: "Connect to your local database to import existing resumes (Premium feature)",
      category: "database",
      premium: true,
      available: false,
    },
    {
      id: "api",
      title: "API Integration",
      description: "Connect via our API to import resumes programmatically",
      icon: <Server className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/external-storage?tab=api",
      tooltip: "Use our API to programmatically upload resumes (Premium feature)",
      category: "advanced",
      premium: true,
      available: false,
    },
    {
      id: "bulk",
      title: "Bulk Upload",
      description: "Upload and process multiple resumes at once",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-gray-400",
      hoverColor: "border-gray-300",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      route: "/upload?method=bulk",
      tooltip: "Upload multiple resumes in a single batch (Premium feature)",
      category: "local",
      premium: true,
      available: false,
    },
  ]

  const filteredOptions =
    selectedCategory === "all" ? uploadOptions : uploadOptions.filter((option) => option.category === selectedCategory)

  const handleSelect = (route: string, available: boolean) => {
    if (available) {
      router.push(route)
    }
    // If not available, do nothing (or could show a premium upgrade modal)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const categories = [
    { id: "all", name: "All Sources" },
    { id: "local", name: "Local Files" },
    { id: "cloud", name: "Cloud Storage" },
    { id: "database", name: "Databases" },
    { id: "advanced", name: "Advanced" },
  ]

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Resumes</h1>
        <p className="text-lg text-gray-600">Choose how you want to upload or import your resume files</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-full ${selectedCategory === category.id ? "" : "text-gray-600"}`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <Card className="border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900">Select Upload Source</CardTitle>
          <CardDescription className="text-gray-600 mt-2 max-w-2xl">
            Choose the method that works best for you. Currently, only "Upload from Device" is available. Other methods
            will be available in future updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredOptions.map((option) => (
              <TooltipProvider key={option.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      className="h-full"
                      onMouseEnter={() => setHoveredOption(option.id)}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <Card
                        className={`group cursor-pointer h-full border-2 transition-all duration-300 relative ${
                          hoveredOption === option.id && option.available ? option.hoverColor : "border-transparent"
                        } ${option.available ? "hover:shadow-lg" : "opacity-75"}`}
                        onClick={() => handleSelect(option.route, option.available)}
                      >
                        {option.premium && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">Premium</Badge>
                        )}
                        {option.popular && option.available && (
                          <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">Popular</Badge>
                        )}
                        {!option.available && (
                          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
                            <div className="bg-white p-2 rounded-full shadow-lg">
                              <Lock className="h-6 w-6 text-amber-500" />
                            </div>
                          </div>
                        )}
                        <CardContent className="p-6 flex flex-col items-center text-center h-full">
                          <div
                            className={`p-4 rounded-full ${option.iconBg} ${option.iconColor} mb-4 transition-transform duration-300 ${
                              hoveredOption === option.id && option.available ? "scale-110" : ""
                            }`}
                          >
                            {option.icon}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                          <p className="text-gray-600 text-sm">{option.description}</p>

                          <div
                            className={`mt-4 w-full opacity-0 ${
                              option.available ? "group-hover:opacity-100" : ""
                            } transition-opacity duration-300`}
                          >
                            <Button
                              className={`w-full ${option.color} hover:opacity-90 text-white`}
                              disabled={!option.available}
                            >
                              {option.available ? "Select" : "Coming Soon"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-900 text-white border-none p-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>{option.tooltip}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>All uploads are securely processed and stored according to our privacy policy</span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pricing">Upgrade to unlock all features</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
