import { useState, useEffect } from "react"

export interface PasswordCriteria {
  lowercase: boolean
  uppercase: boolean
  number: boolean
  special: boolean
  length: boolean
}

interface UsePasswordValidationReturn {
  passwordStrength: number
  passwordCriteria: PasswordCriteria
  isValid: boolean
}

const hasLowerCase = (str: string) => /[a-z]/.test(str)
const hasUpperCase = (str: string) => /[A-Z]/.test(str)
const hasNumber = (str: string) => /\d/.test(str)
const hasSpecialChar = (str: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(str)
const isLongEnough = (str: string) => str.length >= 8

export const usePasswordValidation = (password: string): UsePasswordValidationReturn => {
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false,
  })

  useEffect(() => {
    const criteria = {
      lowercase: hasLowerCase(password),
      uppercase: hasUpperCase(password),
      number: hasNumber(password),
      special: hasSpecialChar(password),
      length: isLongEnough(password),
    }

    setPasswordCriteria(criteria)
    const strength = Object.values(criteria).filter(Boolean).length
    setPasswordStrength(strength)
  }, [password])

  // Password is considered valid if it meets at least 3 criteria
  const isValid = passwordStrength >= 3

  return {
    passwordStrength,
    passwordCriteria,
    isValid,
  }
}

export const getStrengthColor = (strength: number): string => {
  switch (strength) {
    case 0:
      return "bg-gray-200"
    case 1:
      return "bg-red-500"
    case 2:
      return "bg-orange-500"
    case 3:
      return "bg-yellow-500"
    case 4:
      return "bg-green-500"
    case 5:
      return "bg-emerald-500"
    default:
      return "bg-gray-200"
  }
}

export const getStrengthText = (strength: number): string => {
  switch (strength) {
    case 0:
      return "Very Weak"
    case 1:
      return "Weak"
    case 2:
      return "Fair"
    case 3:
      return "Good"
    case 4:
      return "Strong"
    case 5:
      return "Very Strong"
    default:
      return "Very Weak"
  }
}