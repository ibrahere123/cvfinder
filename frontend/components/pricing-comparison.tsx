import React from "react"
import { Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PricingComparison() {
  const features = [
    {
      category: "Core Features",
      items: [
        {
          name: "AI Resume Ranking",
          starter: true,
          professional: true,
          enterprise: true,
          description: "Automatically rank resumes based on job requirements",
        },
        {
          name: "Database Connection",
          starter: "1 connection",
          professional: "3 connections",
          enterprise: "Unlimited",
          description: "Connect to your existing resume databases",
        },
        {
          name: "Resume Processing",
          starter: "500 per month",
          professional: "5,000 per month",
          enterprise: "Unlimited",
          description: "Number of resumes that can be processed monthly",
        },
      ],
    },
    {
      category: "Search & Filtering",
      items: [
        {
          name: "Basic Search",
          starter: true,
          professional: true,
          enterprise: true,
          description: "Simple keyword and boolean search",
        },
        {
          name: "Advanced Search",
          starter: false,
          professional: true,
          enterprise: true,
          description: "Complex queries with multiple parameters",
        },
        {
          name: "Natural Language Search",
          starter: false,
          professional: true,
          enterprise: true,
          description: "Search using conversational language",
        },
        {
          name: "Custom Filters",
          starter: "3 filters",
          professional: "10 filters",
          enterprise: "Unlimited",
          description: "Create custom filters for your searches",
        },
      ],
    },
    {
      category: "Analytics & Reporting",
      items: [
        {
          name: "Basic Analytics",
          starter: true,
          professional: true,
          enterprise: true,
          description: "Simple usage statistics",
        },
        {
          name: "Advanced Analytics",
          starter: false,
          professional: true,
          enterprise: true,
          description: "Detailed insights and trends",
        },
        {
          name: "Custom Reports",
          starter: false,
          professional: "3 reports",
          enterprise: "Unlimited",
          description: "Create and schedule custom reports",
        },
        {
          name: "Data Export",
          starter: "CSV",
          professional: "CSV, Excel",
          enterprise: "CSV, Excel, API",
          description: "Export your data in various formats",
        },
      ],
    },
    {
      category: "Support & Services",
      items: [
        {
          name: "Customer Support",
          starter: "Email",
          professional: "Priority Email",
          enterprise: "24/7 Phone & Email",
          description: "Access to customer support",
        },
        {
          name: "Onboarding",
          starter: "Self-service",
          professional: "Guided setup",
          enterprise: "Full onboarding",
          description: "Help getting started with the platform",
        },
        {
          name: "Dedicated Account Manager",
          starter: false,
          professional: false,
          enterprise: true,
          description: "Personal point of contact for your account",
        },
        {
          name: "SLA",
          starter: false,
          professional: false,
          enterprise: true,
          description: "Service Level Agreement with guaranteed uptime",
        },
      ],
    },
  ]

  const renderValue = (value: any) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    }
    if (value === false) {
      return <X className="h-5 w-5 text-gray-300 mx-auto" />
    }
    return <span className="text-sm text-center block">{value}</span>
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Compare all features</h2>

        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-1/3 py-4 px-6 text-left font-semibold text-gray-900">Feature</TableHead>
                <TableHead className="w-1/6 py-4 px-6 text-center font-semibold text-gray-900">Starter</TableHead>
                <TableHead className="w-1/6 py-4 px-6 text-center font-semibold text-gray-900">Professional</TableHead>
                <TableHead className="w-1/6 py-4 px-6 text-center font-semibold text-gray-900">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((category) => (
                <React.Fragment key={category.category}>
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={4} className="py-3 px-6 font-medium text-gray-900 bg-gray-100">
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.items.map((feature) => (
                    <TableRow key={feature.name} className="border-b border-gray-200">
                      <TableCell className="py-4 px-6">
                        <div className="font-medium text-gray-900">{feature.name}</div>
                        <div className="text-sm text-gray-500">{feature.description}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">{renderValue(feature.starter)}</TableCell>
                      <TableCell className="py-4 px-6 text-center">{renderValue(feature.professional)}</TableCell>
                      <TableCell className="py-4 px-6 text-center">{renderValue(feature.enterprise)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
