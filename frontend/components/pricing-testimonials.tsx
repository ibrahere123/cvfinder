"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"

export function PricingTestimonials() {
  const testimonials = [
    {
      quote:
        "ResumeRanker has transformed our hiring process. We've reduced time-to-hire by 60% and found better candidates for our roles.",
      author: "Sarah Johnson",
      title: "HR Director, Acme Inc",
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "The AI ranking is incredibly accurate. It's like having an expert recruiter pre-screen all our candidates automatically.",
      author: "Michael Chen",
      title: "Talent Acquisition Manager, TechCorp",
      image: "/placeholder.svg?height=64&width=64",
    },
    {
      quote:
        "The ROI is clear - we're spending less time on recruitment and getting better results. Worth every penny.",
      author: "Jessica Williams",
      title: "COO, StartupX",
      image: "/placeholder.svg?height=64&width=64",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Trusted by hiring teams everywhere</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-emerald-500 mb-4 opacity-50" />
                <p className="text-gray-600 mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="grayscale hover:grayscale-0 transition-all duration-300">
                <img
                  src={`/placeholder.svg?height=40&width=120&text=Company+${i}`}
                  alt={`Company ${i}`}
                  className="h-10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
