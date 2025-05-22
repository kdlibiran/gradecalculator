import GradeCalculatorComponent from "@/components/grade-calculator";
import { Analytics } from "@vercel/analytics/next";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Analytics />
      <GradeCalculatorComponent />
    </div>
  );
}
