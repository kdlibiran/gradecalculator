"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Moon,
  Sun,
  Edit,
  Copy,
  Calculator,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreEntry {
  id: number;
  score: number;
  total: number;
  weight: number;
  passingScore?: number; // Make passingScore optional
}

export default function GradeCalculatorComponent() {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [newScore, setNewScore] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newPassingScore, setNewPassingScore] = useState("");
  const [goalGrade, setGoalGrade] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<ScoreEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState("");
  const [calculatorResult, setCalculatorResult] = useState("");
  const { theme, setTheme } = useTheme();
  const calculatorInputRef = useRef<HTMLInputElement>(null);

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScore && newTotal && newWeight) {
      const score = parseFloat(newScore);
      const total = parseFloat(newTotal);
      const weight = parseFloat(newWeight);
      const passingScore = newPassingScore
        ? parseFloat(newPassingScore)
        : undefined; // Handle empty passingScore

      if (score > total) {
        setError("Score cannot be greater than total.");
        return;
      }

      if (passingScore && passingScore > total) {
        setError("Passing score cannot be greater than total.");
        return;
      }

      const newTotalWeight =
        entries.reduce((sum, entry) => sum + entry.weight, 0) + weight;
      if (newTotalWeight > 100) {
        setError("Total weight exceeds 100%. Please adjust your entries.");
        return;
      }

      setEntries([
        ...entries,
        {
          id: Date.now(),
          score,
          total,
          weight,
          passingScore,
        },
      ]);
      setNewScore("");
      setNewTotal("");
      setNewWeight("");
      setNewPassingScore("");
      setError(null);
    }
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const editEntry = (entry: ScoreEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const saveEditedEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntry.id ? editingEntry : entry
      );
      setEntries(updatedEntries);
      setEditingEntry(null);
      setIsDialogOpen(false);
    }
  };

  const duplicateEntry = (entry: ScoreEntry) => {
    const newEntry = { ...entry, id: Date.now() };
    setEntries([...entries, newEntry]);
  };

  const calculateAdjustedGrade = (entry: ScoreEntry) => {
    const { score, total, passingScore } = entry;
    if (passingScore === undefined) {
      return (score / total) * 100;
    }
    return (25 / (total - passingScore)) * (score - passingScore) + 75;
  };

  const calculateWeightedPercentage = (entry: ScoreEntry) => {
    return (calculateAdjustedGrade(entry) / 100) * entry.weight;
  };

  const calculateTotalGrade = () => {
    return entries.reduce(
      (sum, entry) => sum + calculateWeightedPercentage(entry),
      0
    );
  };

  const calculateHighestPossibleGrade = () => {
    const currentGrade = calculateTotalGrade();
    const remainingWeight = 100 - totalWeight;
    return currentGrade + remainingWeight;
  };

  const calculateNeededGrade = () => {
    if (!goalGrade) return null;
    const goal = parseFloat(goalGrade);
    if (isNaN(goal) || goal < 0 || goal > 100) return null;

    const currentGrade = calculateTotalGrade();
    const remainingWeight = 100 - totalWeight;

    if (remainingWeight === 0) return null;

    const neededGrade = ((goal - currentGrade) / remainingWeight) * 100;
    return neededGrade > 100 ? null : neededGrade;
  };

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

  useEffect(() => {
    if (totalWeight > 100) {
      setError("Total weight exceeds 100%. Please adjust your entries.");
    } else {
      setError(null);
    }
  }, [totalWeight]);

  const handleCalculatorInput = (value: string) => {
    setCalculatorInput((prev) => prev + value);
  };

  const calculateResult = () => {
    try {
      const result = eval(calculatorInput);
      setCalculatorResult(result.toString());
      setCalculatorInput("");
    } catch (error) {
      setCalculatorResult("Error");
    }
  };

  const clearCalculator = () => {
    setCalculatorInput("");
    setCalculatorResult("");
  };

  const clearGradeCalculator = () => {
    setEntries([]);
    setNewScore("");
    setNewTotal("");
    setNewWeight("");
    setNewPassingScore("");
    setGoalGrade("");
    setError(null);
  };

  const handleCalculatorKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      calculateResult();
    } else if (e.key === "Escape") {
      clearCalculator();
    } else if (/^[0-9+\-*/.]$/.test(e.key)) {
      e.preventDefault();
      handleCalculatorInput(e.key);
    }
  };

  useEffect(() => {
    if (calculatorInputRef.current) {
      calculatorInputRef.current.focus();
    }
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 bg-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Je's Grade Calculator
            </CardTitle>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={clearGradeCalculator}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all entries</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={addEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="passingScore">Passing Score</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    placeholder="Enter passing score"
                    value={newPassingScore}
                    onChange={(e) => setNewPassingScore(e.target.value)}
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
                    <li
                      key={entry.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-secondary p-3 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>
                          Score: {entry.score}/{entry.total}
                        </span>
                        <span>Weight: {entry.weight}%</span>
                        {entry.passingScore && (
                          <span>Passing: {entry.passingScore}</span>
                        )}
                        <span className="font-semibold">
                          Adjusted Grade:{" "}
                          {calculateAdjustedGrade(entry).toFixed(2)}%
                        </span>
                        <span className="font-semibold">
                          Weighted %:{" "}
                          {calculateWeightedPercentage(entry).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => editEntry(entry)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit entry</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => duplicateEntry(entry)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate entry</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove entry</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                  <div className="text-xl font-bold text-center">
                    Current Grade: {calculateTotalGrade().toFixed(2)}% (
                    {((calculateTotalGrade() / totalWeight) * 100).toFixed(2)}%)
                  </div>
                  <div className="text-center">
                    Total Weight: {totalWeight.toFixed(2)}%
                  </div>
                  <div className="text-center font-semibold">
                    Highest Possible Grade:{" "}
                    {calculateHighestPossibleGrade().toFixed(2)}%
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
                      <>
                        Needed Grade on Remaining Assignments:{" "}
                        {calculateNeededGrade()?.toFixed(2)}%
                      </>
                    ) : (
                      <>Goal grade is not achievable or invalid</>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-right text-2xl font-bold h-12 flex items-center justify-end bg-secondary rounded-md px-3">
                {calculatorResult || calculatorInput || "0"}
              </div>
              <Input
                ref={calculatorInputRef}
                value={calculatorInput}
                onChange={(e) => setCalculatorInput(e.target.value)}
                onKeyDown={handleCalculatorKeyDown}
                placeholder="Enter calculation"
                className="text-right text-lg"
              />
              <div className="grid grid-cols-4 gap-2">
                {[
                  "7",
                  "8",
                  "9",
                  "/",
                  "4",
                  "5",
                  "6",
                  "*",
                  "1",
                  "2",
                  "3",
                  "-",
                  "0",
                  ".",
                  "=",
                  "+",
                ].map((btn) => (
                  <Button
                    key={btn}
                    onClick={() =>
                      btn === "="
                        ? calculateResult()
                        : handleCalculatorInput(btn)
                    }
                    className="h-12 text-lg"
                  >
                    {btn}
                  </Button>
                ))}
              </div>
              <Button onClick={clearCalculator} className="w-full">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Score</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEditedEntry} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="editScore">Score</Label>
                <Input
                  id="editScore"
                  type="number"
                  value={editingEntry?.score || ""}
                  onChange={(e) =>
                    setEditingEntry((prev) =>
                      prev
                        ? { ...prev, score: parseFloat(e.target.value) }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editTotal">Total</Label>
                <Input
                  id="editTotal"
                  type="number"
                  value={editingEntry?.total || ""}
                  onChange={(e) =>
                    setEditingEntry((prev) =>
                      prev
                        ? { ...prev, total: parseFloat(e.target.value) }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editPassingScore">Passing Score</Label>
                <Input
                  id="editPassingScore"
                  type="number"
                  value={editingEntry?.passingScore || ""}
                  onChange={(e) =>
                    setEditingEntry((prev) =>
                      prev
                        ? { ...prev, passingScore: parseFloat(e.target.value) }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editWeight">Weight (%)</Label>
                <Input
                  id="editWeight"
                  type="number"
                  value={editingEntry?.weight || ""}
                  onChange={(e) =>
                    setEditingEntry((prev) =>
                      prev
                        ? { ...prev, weight: parseFloat(e.target.value) }
                        : null
                    )
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
