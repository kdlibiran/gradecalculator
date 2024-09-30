"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"

interface ScoreEntry {
  id: number
  score: number
  total: number
  weight: number
}

export function GradeCalculatorComponent() {
  const [entries, setEntries] = useState<ScoreEntry[]>([])
  const [newScore, setNewScore] = useState("")
  const [newTotal, setNewTotal] = useState("")
  const [newWeight, setNewWeight] = useState("")
  const [goalGrade, setGoalGrade] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (newScore && newTotal && newWeight) {
      const score = parseFloat(newScore)
      const total = parseFloat(newTotal)
      const weight = parseFloat(newWeight)

      if (score > total) {
        setError("Score cannot be greater than total.")
        return
      }

      const newTotalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0) + weight
      if (newTotalWeight > 100) {
        setError("Total weight cannot exceed 100%.")
        return
      }

      setEntries([
        ...entries,
        {
          id: Date.now(),
          score,
          total,
          weight,
        },
      ])
      setNewScore("")
      setNewTotal("")
      setNewWeight("")
      setError(null)
    }
  }

  const removeEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const calculateWeightedPercentage = (entry: ScoreEntry) => {
    return ((entry.score / entry.total) * entry.weight)
  }

  const calculateTotalGrade = () => {
    return entries.reduce((sum, entry) => sum + calculateWeightedPercentage(entry), 0)
  }

  const calculateHighestPossibleGrade = () => {
    const currentGrade = calculateTotalGrade()
    const remainingWeight = 100 - totalWeight
    return currentGrade + remainingWeight
  }

  const calculateNeededGrade = () => {
    if (!goalGrade) return null
    const goal = parseFloat(goalGrade)
    if (isNaN(goal) || goal < 0 || goal > 100) return null

    const currentGrade = calculateTotalGrade()
    const remainingWeight = 100 - totalWeight

    if (remainingWeight === 0) return null

    const neededGrade = (goal - currentGrade) / remainingWeight * 100
    return neededGrade > 100 ? null : neededGrade
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)

  useEffect(() => {
    if (totalWeight > 100) {
      setError("Total weight exceeds 100%. Please adjust your entries.")
    } else {
      setError(null)
    }
  }, [totalWeight])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="bg-background shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold">Jebinks' Grade Calculator</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="Enter score"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  type="number"
                  placeholder="Enter total"
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="weight">Weight (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter weight"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Score
            </Button>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {entries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Entered Scores:</h3>
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-secondary p-3 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>
                        Score: {entry.score}/{entry.total}
                      </span>
                      <span>
                        Weight: {entry.weight}%
                      </span>
                      <span className="font-semibold">
                        Weighted %: {calculateWeightedPercentage(entry).toFixed(2)}%
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="mt-2 sm:mt-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <div className="text-xl font-bold text-center">
                  Current Grade: {calculateTotalGrade().toFixed(2)}%
                </div>
                <div className="text-center">
                  Total Weight: {totalWeight.toFixed(2)}%
                </div>
                <div className="text-center font-semibold">
                  Highest Possible Grade: {calculateHighestPossibleGrade().toFixed(2)}%
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalGrade">Goal Grade (%)</Label>
                <Input
                  id="goalGrade"
                  type="number"
                  placeholder="Enter your goal grade"
                  value={goalGrade}
                  onChange={(e) => setGoalGrade(e.target.value)}
                />
              </div>
              {goalGrade && (
                <div className="text-center font-semibold p-3 bg-secondary rounded-lg">
                  {calculateNeededGrade() !== null ? (
                    <>Needed Grade on Remaining Assignments: {calculateNeededGrade()?.toFixed(2)}%</>
                  ) : (
                    <>Goal grade is not achievable or invalid</>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}