"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  isRequired?: boolean
  className?: string
}

/**
 * Simple mathematical CAPTCHA component
 * For production, consider using services like Google reCAPTCHA or hCaptcha
 */
export function Captcha({ onVerify, isRequired = false, className = '' }: CaptchaProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(0)

  // Generate a new CAPTCHA question
  const generateQuestion = useCallback(() => {
    const operations = ['+', '-', '×']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let num1: number, num2: number, result: number
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        result = num1 + num2
        setQuestion(`${num1} + ${num2}`)
        break
      case '-':
        num1 = Math.floor(Math.random() * 30) + 10
        num2 = Math.floor(Math.random() * num1) + 1
        result = num1 - num2
        setQuestion(`${num1} - ${num2}`)
        break
      case '×':
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        result = num1 * num2
        setQuestion(`${num1} × ${num2}`)
        break
      default:
        num1 = 5
        num2 = 3
        result = 8
        setQuestion('5 + 3')
    }
    
    setCorrectAnswer(result)
    setUserInput('')
    setIsVerified(false)
    setAnswer('')
  }, [])

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  // Verify user input
  const handleVerification = useCallback((input?: string) => {
    const currentInput = input ?? userInput
    const userAnswer = parseInt(currentInput.trim())
    const isCorrect = userAnswer === correctAnswer
    
    setIsVerified(isCorrect)
    setAnswer(currentInput)
    onVerify(isCorrect)
    
    if (!isCorrect) {
      // Generate new question on wrong answer
      setTimeout(() => {
        generateQuestion()
      }, 1500)
    }
  }, [userInput, correctAnswer, onVerify, generateQuestion])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)
    
    // Attempt verification immediately if numeric input
    if (value.trim() && !isNaN(parseInt(value.trim()))) {
      handleVerification(value)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification()
    }
  }

  if (!isRequired) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="captcha-input" className="text-sm font-medium">
          Security Verification
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateQuestion}
          className="h-6 w-6 p-0"
          aria-label="Generate new CAPTCHA"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-lg font-semibold bg-muted px-3 py-2 rounded border">
              {question} = ?
            </span>
          </div>
        </div>
        
        <div className="w-20">
          <Input
            id="captcha-input"
            type="number"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Answer"
            className={`text-center ${
              answer ? (isVerified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''
            }`}
            aria-label="CAPTCHA answer"
            aria-describedby="captcha-description"
          />
        </div>
      </div>
      
      <div id="captcha-description" className="text-xs text-muted-foreground">
        {isVerified ? (
          <span className="text-green-600 font-medium">✓ Verification successful</span>
        ) : answer && !isVerified ? (
          <span className="text-red-600 font-medium">✗ Incorrect answer, try again</span>
        ) : (
          'Please solve the math problem to continue'
        )}
      </div>
    </div>
  )
}

export default Captcha
