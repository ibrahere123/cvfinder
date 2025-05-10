"use client"
import { motion } from "framer-motion"

export function PricingHeader() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-8">
            Choose the plan that's right for your recruiting needs. All plans include access to our AI-powered resume
            ranking technology.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
