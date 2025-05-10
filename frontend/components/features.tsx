import { CheckCircle, Search, Clock, Award } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Search className="h-6 w-6 text-emerald-600" />,
      title: "Intelligent Search",
      description: "Natural language search that understands your requirements and finds the perfect match.",
    },
    {
      icon: <Award className="h-6 w-6 text-emerald-600" />,
      title: "AI-Powered Ranking",
      description: "Our algorithm ranks candidates based on how well they match your specific requirements.",
    },
    {
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      title: "Time Saving",
      description: "Reduce hiring time by up to 75% by focusing only on the most qualified candidates.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
      title: "Bias Reduction",
      description: "Our objective ranking system helps reduce unconscious bias in the hiring process.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose ResumeRanker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-lg border border-gray-100 hover:shadow-md transition-shadow text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
