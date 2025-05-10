"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PricingFAQ() {
  const faqs = [
    {
      question: "How does the free trial work?",
      answer:
        "Our free trial gives you full access to all features of your selected plan for 14 days. No credit card is required to start. At the end of your trial, you can choose to subscribe or your account will automatically downgrade to a limited free version.",
    },
    {
      question: "Can I switch plans later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be available immediately. When downgrading, the changes will take effect at the start of your next billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. For Enterprise plans, we also offer invoicing and bank transfers.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No, there are no setup fees for any of our plans. You only pay the advertised monthly or annual subscription fee.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regular security audits to ensure your data remains protected.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll still have access to your paid features until the end of your current billing period.",
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer:
        "Yes, we offer special pricing for non-profits, educational institutions, and startups. Please contact our sales team for more information.",
    },
    {
      question: "What kind of support is included?",
      answer:
        "All plans include email support with varying response times. The Professional plan includes priority email support, while the Enterprise plan includes 24/7 phone and email support plus a dedicated account manager.",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently asked questions</h2>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <div className="inline-flex gap-4">
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4">
              Contact Sales
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4">
              Read Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
