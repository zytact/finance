"use client";

import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Pie, PieChart } from "recharts";

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

function GoalCalculatorContent() {
  const searchParams = useSearchParams();

  const [goalAmount, setGoalAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [duration, setDuration] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [inflationRate, setInflationRate] = useState<string>("");
  const [requiredSip, setRequiredSip] = useState<number | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const goal = searchParams.get("goal");
    const freq = searchParams.get("frequency") as Frequency;
    const dur = searchParams.get("duration");
    const ret = searchParams.get("return");
    const inf = searchParams.get("inflation");

    if (goal && !Number.isNaN(Number(goal)) && Number(goal) > 0) {
      setGoalAmount(goal);
    }
    if (freq && frequencyOptions.some((f) => f.value === freq)) {
      setFrequency(freq);
    }
    if (dur && !Number.isNaN(Number(dur)) && Number(dur) > 0) {
      setDuration(dur);
    }
    if (ret && !Number.isNaN(Number(ret)) && Number(ret) >= 0) {
      setExpectedReturn(ret);
    }
    if (inf && !Number.isNaN(Number(inf)) && Number(inf) >= 0) {
      setInflationRate(inf);
    }

    setInitialized(true);
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "") {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });

      const newSearchString = newSearchParams.toString();
      const currentSearchString = searchParams.toString();

      if (newSearchString !== currentSearchString) {
        const newUrl = `${window.location.pathname}${newSearchString ? `?${newSearchString}` : ""}`;
        window.history.replaceState(null, "", newUrl);
      }
    },
    [searchParams],
  );

  useEffect(() => {
    const goal = parseFloat(goalAmount);
    const time = parseFloat(duration);
    const rate = parseFloat(expectedReturn);
    const inflation = parseFloat(inflationRate);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    if (goal > 0 && time > 0 && rate >= 0 && inflation >= 0) {
      try {
        const adjustedGoal = goal * (1 + inflation / 100) ** time;

        const periodicRate = rate / 100 / periodsPerYear;
        const totalPeriods = time * periodsPerYear;

        let calculatedSip: number;

        if (periodicRate === 0) {
          calculatedSip = adjustedGoal / totalPeriods;
        } else {
          calculatedSip =
            (adjustedGoal * periodicRate) /
            ((1 + periodicRate) ** totalPeriods - 1);
        }

        if (Number.isFinite(calculatedSip) && calculatedSip > 0) {
          setRequiredSip(calculatedSip);
        } else {
          setRequiredSip(null);
        }
      } catch {
        setRequiredSip(null);
      }
    } else {
      setRequiredSip(null);
    }
  }, [goalAmount, frequency, duration, expectedReturn, inflationRate]);

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      goal: goalAmount,
      frequency: frequency,
      duration: duration,
      return: expectedReturn,
      inflation: inflationRate,
    });
  }, [
    goalAmount,
    frequency,
    duration,
    expectedReturn,
    inflationRate,
    updateSearchParams,
    initialized,
  ]);

  const numbers = useMemo(() => {
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;
    const time = parseFloat(duration);
    const inflation = parseFloat(inflationRate);
    const goal = parseFloat(goalAmount);

    if (!requiredSip || !Number.isFinite(requiredSip) || requiredSip <= 0) {
      return { totalInvested: 0, goalAmount: 0, inflationAdjustedGoal: 0 };
    }

    const totalInvested = requiredSip * periodsPerYear * time;
    const inflationAdjustedGoal =
      goal > 0 && inflation >= 0 ? goal * (1 + inflation / 100) ** time : goal;

    return {
      totalInvested,
      goalAmount: goal,
      inflationAdjustedGoal,
    };
  }, [requiredSip, frequency, duration, goalAmount, inflationRate]);

  const chartData = useMemo(() => {
    if (numbers.totalInvested <= 0 && numbers.inflationAdjustedGoal <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;

    const invested = numbers.totalInvested;
    const profit = Math.max(numbers.inflationAdjustedGoal - invested, 0);

    return [
      { name: "Invested ", value: invested, fill: "var(--chart-1)" },
      { name: "Returns", value: profit, fill: "var(--chart-2)" },
    ];
  }, [numbers]);

  const chartConfig: ChartConfig = {
    invested: { label: "Invested", color: "var(--chart-1)" },
    returns: { label: "Returns", color: "var(--chart-2)" },
  };

  const selectedFrequencyLabel =
    frequencyOptions.find((f) => f.value === frequency)?.label || "Monthly";

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
        <h1 className="font-bold text-4xl">Goal Calculator</h1>
        <p className="text-muted-foreground">
          Calculate the SIP required to achieve your financial goal
        </p>

        <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2">
          <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="goalAmount"
                  className="mb-1 block font-medium text-sm"
                >
                  Goal Amount (₹)
                </label>
                <input
                  id="goalAmount"
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="1000000"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="frequency"
                  className="mb-1 block font-medium text-sm"
                >
                  Investment Frequency
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="mb-1 block font-medium text-sm"
                >
                  Time Horizon (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="return"
                  className="mb-1 block font-medium text-sm"
                >
                  Expected Annual Return (%)
                </label>
                <input
                  id="return"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  placeholder="12"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="inflation"
                  className="mb-1 block font-medium text-sm"
                >
                  Expected Inflation Rate (%)
                </label>
                <input
                  id="inflation"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  placeholder="6"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Required SIP Amount:
                    </span>
                    <span
                      className={cn(
                        "font-bold text-lg",
                        requiredSip !== null
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {requiredSip !== null
                        ? `₹${requiredSip.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                        : "Enter values above"}
                    </span>
                  </div>
                  {numbers.inflationAdjustedGoal > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Inflation Adjusted Goal:
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ₹
                        {numbers.inflationAdjustedGoal.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="font-semibold text-lg">Investment Breakdown</h3>
            </div>
            <div className="flex-1 pb-6">
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
                <div className="mt-4 flex flex-col gap-2">
                  {chartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-sm"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="font-medium text-sm">
                          {item.name.trim()}
                        </span>
                      </div>
                      <span className="font-bold text-sm">
                        ₹
                        {item.value.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GoalCalculator() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
          <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
            <h1 className="font-bold text-4xl">Goal Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <GoalCalculatorContent />
    </Suspense>
  );
}
