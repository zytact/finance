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

function SIPCalculatorContent() {
  const searchParams = useSearchParams();

  const [sipAmount, setSipAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [duration, setDuration] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [futureValue, setFutureValue] = useState<number | null>(null);
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
    const amount = searchParams.get("amount");
    const freq = searchParams.get("frequency") as Frequency;
    const dur = searchParams.get("duration");
    const ret = searchParams.get("return");
    const timing = searchParams.get("timing") as "beginning" | "end";
    const stepUp = searchParams.get("stepUp");
    const stepUpFreq = searchParams.get("stepUpFreq") as Frequency;
    const stepUpPerc = searchParams.get("stepUpPerc");

    if (amount && !Number.isNaN(Number(amount)) && Number(amount) > 0) {
      setSipAmount(amount);
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
        if (value && value !== "" && value !== "false") {
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
    const principal = parseFloat(sipAmount);
    const time = parseFloat(duration);
    const rate = parseFloat(expectedReturn);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    if (principal > 0 && time > 0 && rate >= 0) {
      const periodicRate = rate / 100 / periodsPerYear;
      const totalPeriods = time * periodsPerYear;

      let calculatedValue: number;

      if (isStepUpEnabled) {
        const stepUpPercent = parseFloat(stepUpPercentage) / 100;
        // Treat invalid stepUpPercentage as calculation abort
        if (!Number.isFinite(stepUpPercent) || stepUpPercent < 0) {
          setFutureValue(null);
          return;
        }

        const stepUpPeriodsPerYear =
          frequencyOptions.find((f) => f.value === stepUpFrequency)
            ?.periodsPerYear || 1;

        const stepUpInterval = Math.max(
          1,
          Math.round(periodsPerYear / stepUpPeriodsPerYear),
        );

        calculatedValue = 0;
        let currentAmount = principal;

        for (let period = 1; period <= totalPeriods; period++) {
          if (periodicRate === 0) {
            calculatedValue += currentAmount;
          } else {
            const futureValueOfPayment =
              currentAmount *
              (1 + periodicRate) **
                (totalPeriods -
                  period +
                  (paymentTiming === "beginning" ? 1 : 0));
            calculatedValue += futureValueOfPayment;
          }

          if (period % stepUpInterval === 0 && period < totalPeriods) {
            currentAmount *= 1 + stepUpPercent;
          }
        }
      } else {
        if (periodicRate === 0) {
          calculatedValue = principal * totalPeriods;
        } else {
          calculatedValue =
            (principal * ((1 + periodicRate) ** totalPeriods - 1)) /
            periodicRate;

          if (paymentTiming === "beginning") {
            calculatedValue *= 1 + periodicRate;
          }
        }
      }

      setFutureValue(calculatedValue);
    } else {
      setFutureValue(null);
    }
  }, [
    sipAmount,
    frequency,
    duration,
    expectedReturn,
    paymentTiming,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
  ]);

  useEffect(() => {
    if (!initialized) return;
    updateSearchParams({
      amount: sipAmount,
      frequency: frequency,
      duration: duration,
      return: expectedReturn,
      timing: paymentTiming,
      stepUp: isStepUpEnabled.toString(),
      stepUpFreq: stepUpFrequency,
      stepUpPerc: stepUpPercentage,
    });
  }, [
    sipAmount,
    frequency,
    duration,
    expectedReturn,
    paymentTiming,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
    updateSearchParams,
    initialized,
  ]);

  const numbers = useMemo(() => {
    const principal = parseFloat(sipAmount);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;
    const time = parseFloat(duration);
    let totalInvested: number;

    if (isStepUpEnabled) {
      const stepUpPercent = parseFloat(stepUpPercentage) / 100;
      // If stepUpPercent is invalid, treat as 0 invested
      if (!Number.isFinite(stepUpPercent) || stepUpPercent < 0) {
        return { totalInvested: 0, final: 0, profit: 0 };
      }

      const stepUpPeriodsPerYear =
        frequencyOptions.find((f) => f.value === stepUpFrequency)
          ?.periodsPerYear || 1;

      const stepUpInterval = Math.max(
        1,
        Math.round(periodsPerYear / stepUpPeriodsPerYear),
      );

      totalInvested = 0;
      let currentAmount = principal;
      const totalPeriods = time * periodsPerYear;

      for (let period = 1; period <= totalPeriods; period++) {
        totalInvested += currentAmount;

        if (period % stepUpInterval === 0 && period < totalPeriods) {
          currentAmount *= 1 + stepUpPercent;
        }
      }
    } else {
      totalInvested = principal * periodsPerYear * time;
    }

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
  }, [
    sipAmount,
    frequency,
    duration,
    futureValue,
    isStepUpEnabled,
    stepUpFrequency,
    stepUpPercentage,
  ]);

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

  // Detect unreasonable step-up configuration
  const hasUnreasonableStepUp = useMemo(() => {
    if (!isStepUpEnabled) return false;

    // Check: totalInvested or futureValue is non-finite or explodes
    if (
      (numbers.totalInvested > 0 && !Number.isFinite(numbers.totalInvested)) ||
      (futureValue !== null && !Number.isFinite(futureValue)) ||
      numbers.totalInvested > 1e15 || // 1 quadrillion threshold
      (futureValue !== null && futureValue > 1e15)
    ) {
      return true;
    }

    return false;
  }, [isStepUpEnabled, numbers, futureValue]);

  const stepUpTimeline = useMemo(() => {
    const principal = parseFloat(sipAmount);
    const time = parseFloat(duration);
    const periodsPerYear =
      frequencyOptions.find((f) => f.value === frequency)?.periodsPerYear || 12;

    if (!isStepUpEnabled || principal <= 0 || time <= 0) {
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
    let currentAmount = principal;
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
    sipAmount,
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
        <h1 className="font-bold text-4xl">SIP Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your Systematic Investment Plan returns
        </p>

        <div className="grid w-full max-w-4xl gap-12 md:grid-cols-2">
          <div className="w-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-y-4">
              <div>
                <label
                  htmlFor="sipAmount"
                  className="mb-1 block font-medium text-sm"
                >
                  SIP Amount
                </label>
                <input
                  id="sipAmount"
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  placeholder="5000"
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
                  Duration of Investment (Years)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5"
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
                  placeholder="10"
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
                  <div className="flex flex-col gap-y-4">
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
                {!hasUnreasonableStepUp && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Future Value:</span>
                    <span
                      className={cn(
                        "font-bold text-lg",
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
                )}
                {hasUnreasonableStepUp && (
                  <p className="text-destructive text-sm">
                    ⚠️ Your step-up settings result in unrealistic values
                    (exceeding reasonable limits). Please reduce step-up
                    percentage, choose less frequent step-up, or adjust
                    duration/amount.
                  </p>
                )}
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
                  Your step-up settings result in unrealistic values that exceed
                  reasonable calculation limits.
                </p>
                <div className="text-muted-foreground text-sm">
                  <p className="font-medium">To fix this:</p>
                  <ul className="mt-2 list-inside list-disc text-left">
                    <li>Reduce the step-up percentage</li>
                    <li>
                      Choose a less frequent step-up (e.g., Quarterly or Yearly)
                    </li>
                    <li>Reduce the investment duration</li>
                    <li>Reduce the SIP amount</li>
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

export default function SIPCalculator() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
          <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
            <h1 className="font-bold text-4xl">SIP Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <SIPCalculatorContent />
    </Suspense>
  );
}
