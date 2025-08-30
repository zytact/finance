"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Frequency = "monthly" | "weekly" | "quarterly" | "yearly" | "15-days";

const frequencyOptions = [
  { value: "monthly" as Frequency, label: "Monthly", periodsPerYear: 12 },
  { value: "weekly" as Frequency, label: "Weekly", periodsPerYear: 52 },
  { value: "quarterly" as Frequency, label: "Quarterly", periodsPerYear: 4 },
  { value: "yearly" as Frequency, label: "Yearly", periodsPerYear: 1 },
  { value: "15-days" as Frequency, label: "15 Days", periodsPerYear: 24 },
];

export default function SIPCalculator() {
  const [sipAmount, setSipAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [duration, setDuration] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [paymentTiming, setPaymentTiming] = useState<"beginning" | "end">(
    "end",
  );

  useEffect(() => {
    const principal = parseFloat(sipAmount);
    const time = parseFloat(duration);
    const rate = parseFloat(expectedReturn);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    if (principal > 0 && time > 0 && rate >= 0) {
      const periodicRate = rate / 100 / periodsPerYear;
      const totalPeriods = time * periodsPerYear;

      let calculatedValue: number;

      if (periodicRate === 0) {
        // If no interest, just sum all payments
        calculatedValue = principal * totalPeriods;
      } else {
        // Standard SIP formula (payments at end of period)
        calculatedValue =
          (principal * ((1 + periodicRate) ** totalPeriods - 1)) / periodicRate;

        // If payments are at beginning of period, multiply by (1 + r)
        if (paymentTiming === "beginning") {
          calculatedValue *= 1 + periodicRate;
        }
      }

      setFutureValue(calculatedValue);
    } else {
      setFutureValue(null);
    }
  }, [sipAmount, frequency, duration, expectedReturn, paymentTiming]);

  const numbers = useMemo(() => {
    const principal = parseFloat(sipAmount);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;
    const time = parseFloat(duration);
    const totalInvested = principal * periodsPerYear * time;
    const final = futureValue || 0;

    if (
      !Number.isFinite(totalInvested) ||
      totalInvested <= 0 ||
      !Number.isFinite(final) ||
      final <= 0
    ) {
      return { totalInvested: 0, final: 0, profit: 0 };
    }
    const profit = Math.max(final - totalInvested, 0);
    return { totalInvested, final, profit };
  }, [sipAmount, frequency, duration, futureValue]);

  const chartData = useMemo(() => {
    if (numbers.totalInvested <= 0 && numbers.final <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const invested = numbers.totalInvested;
    const profit = numbers.profit;
    return [
      { name: "Invested ", value: invested, fill: "var(--chart-1)" },
      { name: "Profit", value: profit, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    invested: { label: "Invested", color: "var(--chart-1)" },
    profit: { label: "Profit", color: "var(--chart-2)" },
  };

  const selectedFrequencyLabel =
    frequencyOptions.find((f) => f.value === frequency)?.label || "Monthly";

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">SIP Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Systematic Investment Plan returns
        </p>

        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sipAmount"
                  className="block text-sm font-medium mb-1"
                >
                  SIP Amount
                </label>
                <input
                  id="sipAmount"
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium mb-1"
                >
                  Investment Frequency
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between bg-background"
                    >
                      <span>{selectedFrequencyLabel}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Select Frequency</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={frequency}
                      onValueChange={(value) =>
                        setFrequency(value as Frequency)
                      }
                    >
                      {frequencyOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium mb-1"
                >
                  Duration of Investment (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="return"
                  className="block text-sm font-medium mb-1"
                >
                  Expected Annual Return (%)
                </label>
                <input
                  id="return"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentTimingEnd"
                  className="block text-sm font-medium mb-1"
                >
                  Payment Timing
                </label>
                <div className="flex gap-2">
                  <button
                    id="paymentTimingEnd"
                    type="button"
                    onClick={() => setPaymentTiming("end")}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm border transition-colors",
                      paymentTiming === "end"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent",
                    )}
                  >
                    End of Period
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTiming("beginning")}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm border transition-colors",
                      paymentTiming === "beginning"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent",
                    )}
                  >
                    Beginning of Period
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Most SIP calculators use "Beginning of Period" - try switching
                  if your results don't match
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Future Value:</span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      futureValue !== null
                        ? "text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {futureValue !== null
                      ? `₹${futureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "Enter values above"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full">
            <CardHeader className="items-center pb-0">
              <CardTitle>Investment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[280px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    stroke="0"
                  />
                </PieChart>
              </ChartContainer>

              {chartData.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {chartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm font-medium">
                          {item.name.trim()}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        ₹
                        {item.value.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
