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
import { Switch } from "@/components/ui/switch";
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
  const [paymentTiming, setPaymentTiming] = useState<"beginning" | "end">(
    "end",
  );
  const [isStepUpEnabled, setIsStepUpEnabled] = useState<boolean>(false);
  const [stepUpFrequency, setStepUpFrequency] = useState<Frequency>("yearly");
  const [stepUpPercentage, setStepUpPercentage] = useState<string>("10");
  const [initialized, setInitialized] = useState<boolean>(false);

  // Get valid step-up frequency options (must be <= investment frequency)
  const validStepUpFrequencies = useMemo(() => {
    const investmentPeriodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;
    return frequencyOptions.filter(
      (f) => f.periodsPerYear <= investmentPeriodsPerYear,
    );
  }, [frequency]);

  // Auto-correct step-up frequency if it becomes invalid
  useEffect(() => {
    if (!initialized) return;
    const currentStepUpPeriodsPerYear =
      frequencyOptions.find((f) => f.value === stepUpFrequency)
        ?.periodsPerYear || 1;
    const investmentPeriodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    // If step-up is more frequent than investment, clamp it
    if (currentStepUpPeriodsPerYear > investmentPeriodsPerYear) {
      setStepUpFrequency(frequency);
    }
  }, [frequency, stepUpFrequency, initialized]);

  useEffect(() => {
    const goal = searchParams.get("goal");
    const freq = searchParams.get("frequency") as Frequency;
    const dur = searchParams.get("duration");
    const ret = searchParams.get("return");
    const inf = searchParams.get("inflation");
    const timing = searchParams.get("timing") as "beginning" | "end";
    const stepUp = searchParams.get("stepUp");
    const stepUpFreq = searchParams.get("stepUpFreq") as Frequency;
    const stepUpPerc = searchParams.get("stepUpPerc");

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
    if (timing && (timing === "beginning" || timing === "end")) {
      setPaymentTiming(timing);
    }
    if (stepUp) {
      setIsStepUpEnabled(stepUp === "true");
    }
    if (stepUpFreq && frequencyOptions.some((f) => f.value === stepUpFreq)) {
      setStepUpFrequency(stepUpFreq);
    }
    if (
      stepUpPerc &&
      !Number.isNaN(Number(stepUpPerc)) &&
      Number(stepUpPerc) >= 0
    ) {
      setStepUpPercentage(stepUpPerc);
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

        if (isStepUpEnabled) {
          const stepUpPercent = parseFloat(stepUpPercentage) / 100;
          // Treat invalid stepUpPercentage as calculation abort
          if (!Number.isFinite(stepUpPercent) || stepUpPercent < 0) {
            setRequiredSip(null);
            return;
          }

          const stepUpPeriodsPerYear =
            frequencyOptions.find((f) => f.value === stepUpFrequency)
              ?.periodsPerYear || 1;

          const stepUpInterval = Math.max(
            1,
            Math.round(periodsPerYear / stepUpPeriodsPerYear),
          );

          let low = 0;
          let high = adjustedGoal / totalPeriods;
          let iterations = 0;
          const maxIterations = 100;
          const tolerance = 0.01;

          while (iterations < maxIterations && high - low > tolerance) {
            const mid = (low + high) / 2;
            let futureValue = 0;
            let currentAmount = mid;

            for (let period = 1; period <= totalPeriods; period++) {
              if (periodicRate === 0) {
                futureValue += currentAmount;
              } else {
                const futureValueOfPayment =
                  currentAmount *
                  (1 + periodicRate) **
                    (totalPeriods -
                      period +
                      (paymentTiming === "beginning" ? 1 : 0));
                futureValue += futureValueOfPayment;
              }

              if (period % stepUpInterval === 0 && period < totalPeriods) {
                currentAmount *= 1 + stepUpPercent;
              }
            }

            if (futureValue < adjustedGoal) {
              low = mid;
            } else {
              high = mid;
            }
            iterations++;
          }

          calculatedSip = (low + high) / 2;
        } else {
          if (periodicRate === 0) {
            calculatedSip = adjustedGoal / totalPeriods;
          } else {
            calculatedSip =
              (adjustedGoal * periodicRate) /
              ((1 + periodicRate) ** totalPeriods - 1);

            if (paymentTiming === "beginning") {
              calculatedSip /= 1 + periodicRate;
            }
          }
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
  }, [
    goalAmount,
    frequency,
    duration,
    expectedReturn,
    inflationRate,
    paymentTiming,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
  ]);

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      goal: goalAmount,
      frequency: frequency,
      duration: duration,
      return: expectedReturn,
      inflation: inflationRate,
      timing: paymentTiming,
      stepUp: isStepUpEnabled.toString(),
      stepUpFreq: stepUpFrequency,
      stepUpPerc: stepUpPercentage,
    });
  }, [
    goalAmount,
    frequency,
    duration,
    expectedReturn,
    inflationRate,
    paymentTiming,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
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

    let totalInvested: number;

    if (isStepUpEnabled) {
      const stepUpPercent = parseFloat(stepUpPercentage) / 100;
      // If stepUpPercent is invalid, treat as 0 invested
      if (!Number.isFinite(stepUpPercent) || stepUpPercent < 0) {
        return { totalInvested: 0, goalAmount: 0, inflationAdjustedGoal: 0 };
      }

      const stepUpPeriodsPerYear =
        frequencyOptions.find((f) => f.value === stepUpFrequency)
          ?.periodsPerYear || 1;

      const stepUpInterval = Math.max(
        1,
        Math.round(periodsPerYear / stepUpPeriodsPerYear),
      );

      totalInvested = 0;
      let currentAmount = requiredSip;
      const totalPeriods = time * periodsPerYear;

      for (let period = 1; period <= totalPeriods; period++) {
        totalInvested += currentAmount;

        if (period % stepUpInterval === 0 && period < totalPeriods) {
          currentAmount *= 1 + stepUpPercent;
        }
      }
    } else {
      totalInvested = requiredSip * periodsPerYear * time;
    }

    const inflationAdjustedGoal =
      goal > 0 && inflation >= 0 ? goal * (1 + inflation / 100) ** time : goal;

    return {
      totalInvested,
      goalAmount: goal,
      inflationAdjustedGoal,
    };
  }, [
    requiredSip,
    frequency,
    duration,
    goalAmount,
    inflationRate,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
  ]);

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

  // Detect unreasonable step-up configuration
  const hasUnreasonableStepUp = useMemo(() => {
    if (!isStepUpEnabled) return false;

    // Check 1: Required SIP is below ₹1 (impractical)
    if (requiredSip !== null && requiredSip > 0 && requiredSip < 1) {
      return true;
    }

    // Check 2: totalInvested is non-finite or explodes relative to goal
    if (
      numbers.totalInvested > 0 &&
      (!Number.isFinite(numbers.totalInvested) ||
        numbers.totalInvested > numbers.inflationAdjustedGoal * 1000)
    ) {
      return true;
    }

    return false;
  }, [isStepUpEnabled, requiredSip, numbers]);

  const stepUpTimeline = useMemo(() => {
    const time = parseFloat(duration);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    if (!isStepUpEnabled || !requiredSip || requiredSip <= 0 || time <= 0) {
      return [];
    }

    const stepUpPercent = parseFloat(stepUpPercentage) / 100;
    // Treat invalid or negative stepUpPercentage as invalid
    if (!Number.isFinite(stepUpPercent) || stepUpPercent < 0) {
      return [];
    }

    const stepUpPeriodsPerYear =
      frequencyOptions.find((f) => f.value === stepUpFrequency)
        ?.periodsPerYear || 1;

    const stepUpInterval = Math.max(
      1,
      Math.round(periodsPerYear / stepUpPeriodsPerYear),
    );

    const timeline: Array<{ index: number; amount: number }> = [];
    let currentAmount = requiredSip;
    const totalPeriods = time * periodsPerYear;
    let segmentIndex = 1;

    for (let period = 1; period <= totalPeriods; period++) {
      // Record the SIP amount at the start of each step-up segment
      if (period === 1 || (period - 1) % stepUpInterval === 0) {
        timeline.push({ index: segmentIndex, amount: currentAmount });
        segmentIndex++;
      }

      // Apply step-up after the appropriate number of periods
      if (period % stepUpInterval === 0 && period < totalPeriods) {
        currentAmount *= 1 + stepUpPercent;
      }
    }

    return timeline;
  }, [
    requiredSip,
    duration,
    frequency,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
  ]);

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
          <div className="w-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="gap-y-4">
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
                      <ChevronDown className="h-4 w-4 text-current/50" />
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

              <div>
                <label
                  htmlFor="paymentTimingEnd"
                  className="mb-1 block font-medium text-sm"
                >
                  Payment Timing
                </label>
                <div className="flex gap-2">
                  <button
                    id="paymentTimingEnd"
                    type="button"
                    onClick={() => setPaymentTiming("end")}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      paymentTiming === "end"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent",
                    )}
                  >
                    End of Period
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTiming("beginning")}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      paymentTiming === "beginning"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent",
                    )}
                  >
                    Beginning of Period
                  </button>
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Most SIP calculators use "Beginning of Period" - try switching
                  if your results don't match
                </p>
              </div>

              <div className="border-t pt-2">
                <div className="mb-4 flex items-center justify-between">
                  <label htmlFor="stepUpToggle" className="font-medium text-sm">
                    Enable Step-up SIP
                  </label>
                  <Switch
                    id="stepUpToggle"
                    checked={isStepUpEnabled}
                    onCheckedChange={setIsStepUpEnabled}
                  />
                </div>

                {isStepUpEnabled && (
                  <div className="gap-y-4">
                    <div>
                      <label
                        htmlFor="stepUpFrequency"
                        className="mb-1 block font-medium text-sm"
                      >
                        Step-up Frequency
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <span>
                              {frequencyOptions.find(
                                (f) => f.value === stepUpFrequency,
                              )?.label || "Yearly"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-current/50" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuLabel>
                            Select Step-up Frequency
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={stepUpFrequency}
                            onValueChange={(value) =>
                              setStepUpFrequency(value as Frequency)
                            }
                          >
                            {validStepUpFrequencies.map((option) => (
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
                      <p className="mt-1 text-muted-foreground text-xs">
                        Step-up frequency cannot exceed investment frequency
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="stepUpPercentage"
                        className="mb-1 block font-medium text-sm"
                      >
                        Step-up Percentage (%)
                      </label>
                      <input
                        id="stepUpPercentage"
                        type="number"
                        value={stepUpPercentage}
                        onChange={(e) => setStepUpPercentage(e.target.value)}
                        placeholder="10"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="gap-y-2">
                  {!hasUnreasonableStepUp && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {isStepUpEnabled
                            ? "Starting SIP Amount:"
                            : "Required SIP Amount:"}
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
                      {isStepUpEnabled && requiredSip !== null && (
                        <p className="text-muted-foreground text-xs">
                          This is the starting SIP amount. It will increase by{" "}
                          {stepUpPercentage}%{" "}
                          {frequencyOptions
                            .find((f) => f.value === stepUpFrequency)
                            ?.label.toLowerCase()}
                          .
                        </p>
                      )}
                    </>
                  )}
                  {hasUnreasonableStepUp && (
                    <p className="text-destructive text-sm">
                      ⚠️ Your step-up settings result in unrealistic calculations
                      (starting SIP below ₹1 or excessively large totals).
                      Please reduce step-up percentage, choose less frequent
                      step-up, or adjust duration/goal.
                    </p>
                  )}
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
            {hasUnreasonableStepUp ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
                <div className="mb-4 text-4xl">⚠️</div>
                <h3 className="mb-2 font-semibold text-destructive text-lg">
                  Unreasonable Step-up Configuration
                </h3>
                <p className="mb-4 max-w-md text-muted-foreground text-sm">
                  Your step-up settings result in unrealistic calculations
                  (starting SIP below ₹1 or excessively large totals due to
                  aggressive step-ups), which makes the breakdown unreliable.
                </p>
                <div className="text-muted-foreground text-sm">
                  <p className="font-medium">To fix this:</p>
                  <ul className="mt-2 list-inside list-disc text-left">
                    <li>Reduce the step-up percentage</li>
                    <li>
                      Choose a less frequent step-up (e.g., Quarterly or Yearly)
                    </li>
                    <li>Increase the investment duration</li>
                    <li>Reduce the goal amount</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="items-center pb-0">
                  <h3 className="font-semibold text-lg">
                    Investment Breakdown
                  </h3>
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
                              className="h-4 w-4 rounded-xs"
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

                {isStepUpEnabled && stepUpTimeline.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 font-semibold text-lg">
                      SIP Timeline (Per Step-up Period)
                    </h3>
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const ordinalSuffix = (n: number) => {
                          const s = ["th", "st", "nd", "rd"];
                          const v = n % 100;
                          return s[(v - 20) % 10] || s[v] || s[0];
                        };

                        const getUnitLabel = (freq: Frequency): string => {
                          switch (freq) {
                            case "yearly":
                              return "Year";
                            case "quarterly":
                              return "Quarter";
                            case "monthly":
                              return "Month";
                            case "weekly":
                              return "Week";
                            case "15-days":
                              return "15 Days";
                            default:
                              return "Period";
                          }
                        };

                        const getUnitPluralLabel = (
                          freq: Frequency,
                        ): string => {
                          switch (freq) {
                            case "yearly":
                              return "years";
                            case "quarterly":
                              return "quarters";
                            case "monthly":
                              return "months";
                            case "weekly":
                              return "weeks";
                            case "15-days":
                              return "periods";
                            default:
                              return "periods";
                          }
                        };

                        const unit = getUnitLabel(stepUpFrequency);
                        const unitPlural = getUnitPluralLabel(stepUpFrequency);
                        const total = stepUpTimeline.length;

                        if (total <= 10) {
                          // Show all entries
                          return stepUpTimeline.map((item) => (
                            <div
                              key={item.index}
                              className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                            >
                              <span className="font-medium text-sm">
                                {item.index}
                                {ordinalSuffix(item.index)} {unit}
                              </span>
                              <span className="font-bold text-sm">
                                ₹
                                {item.amount.toLocaleString("en-IN", {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          ));
                        }

                        // Show first 4 + divider + last 4
                        const firstFour = stepUpTimeline.slice(0, 4);
                        const lastFour = stepUpTimeline.slice(-4);
                        const hiddenCount = total - 8;

                        return (
                          <>
                            {firstFour.map((item) => (
                              <div
                                key={item.index}
                                className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                              >
                                <span className="font-medium text-sm">
                                  {item.index}
                                  {ordinalSuffix(item.index)} {unit}
                                </span>
                                <span className="font-bold text-sm">
                                  ₹
                                  {item.amount.toLocaleString("en-IN", {
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center justify-center rounded-md border border-dashed bg-muted/30 px-3 py-2">
                              <span className="text-muted-foreground text-sm">
                                {hiddenCount} {unitPlural} not shown
                              </span>
                            </div>
                            {lastFour.map((item) => (
                              <div
                                key={item.index}
                                className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                              >
                                <span className="font-medium text-sm">
                                  {item.index}
                                  {ordinalSuffix(item.index)} {unit}
                                </span>
                                <span className="font-bold text-sm">
                                  ₹
                                  {item.amount.toLocaleString("en-IN", {
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
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
