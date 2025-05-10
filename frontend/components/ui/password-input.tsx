"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { usePasswordValidation, getStrengthColor, getStrengthText } from "@/hooks/use-password-validation"

interface PasswordInputProps {
  id?: string
  name?: string
  label?: string
  value: string
  onChange: (value: string) => void
  showStrengthMeter?: boolean
  showCriteria?: boolean
  autoComplete?: string
  required?: boolean
  className?: string
}

export function PasswordInput({
  id = "password",
  name = "password",
  label = "Password",
  value,
  onChange,
  showStrengthMeter = true,
  showCriteria = true,
  autoComplete = "new-password",
  required = true,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { passwordStrength, passwordCriteria, isValid } = usePasswordValidation(value)

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-gray-700">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full pr-10 ${className}`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrengthMeter && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Strength: {getStrengthText(passwordStrength)}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300 ease-in-out`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showCriteria && value && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <div
            className={`flex items-center text-sm ${
              passwordCriteria.lowercase ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordCriteria.lowercase ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Lowercase letter
          </div>
          <div
            className={`flex items-center text-sm ${
              passwordCriteria.uppercase ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordCriteria.uppercase ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Uppercase letter
          </div>
          <div
            className={`flex items-center text-sm ${
              passwordCriteria.number ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordCriteria.number ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Number
          </div>
          <div
            className={`flex items-center text-sm ${
              passwordCriteria.special ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordCriteria.special ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Special character
          </div>
          <div
            className={`flex items-center text-sm ${
              passwordCriteria.length ? "text-green-600" : "text-gray-500"
            }`}
          >
            {passwordCriteria.length ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            At least 8 characters
          </div>
        </div>
      )}
    </div>
  )
}