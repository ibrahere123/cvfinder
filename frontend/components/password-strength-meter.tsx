"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0)
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  })

  useEffect(() => {
    // Check validations
    const newValidations = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    }
    setValidations(newValidations)

    // Calculate strength
    const validCount = Object.values(newValidations).filter(Boolean).length
    setStrength(validCount)
  }, [password])

  const getStrengthText = () => {
    if (strength === 0) return "Very Weak"
    if (strength === 1) return "Weak"
    if (strength === 2) return "Fair"
    if (strength === 3) return "Good"
    if (strength === 4) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = () => {
    if (strength === 0) return "bg-red-500"
    if (strength === 1) return "bg-red-400"
    if (strength === 2) return "bg-yellow-400"
    if (strength === 3) return "bg-yellow-300"
    if (strength === 4) return "bg-emerald-400"
    return "bg-emerald-500"
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Password strength:</span>
          <span
            className={`text-xs font-medium ${
              strength < 2 ? "text-red-500" : strength < 4 ? "text-yellow-500" : "text-emerald-500"
            }`}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()}`}
            initial={{ width: "0%" }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ValidationItem isValid={validations.minLength} text="At least 8 characters" />
        <ValidationItem isValid={validations.hasUppercase} text="Uppercase letter" />
        <ValidationItem isValid={validations.hasLowercase} text="Lowercase letter" />
        <ValidationItem isValid={validations.hasNumber} text="Number" />
        <ValidationItem isValid={validations.hasSpecial} text="Special character" />
      </div>
    </div>
  )
}

function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {isValid ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-gray-300" />}
      <span className={`text-xs ${isValid ? "text-emerald-500" : "text-gray-500"}`}>{text}</span>
    </div>
  )
}
