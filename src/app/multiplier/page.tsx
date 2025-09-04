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

type CalculationMode = "time" | "multiplier";

const modeOptions = [
  {
    value: "time" as CalculationMode,
    label: "Calculate Time to Reach Multiplier",
  },
  {
    value: "multiplier" as CalculationMode,
    label: "Calculate Multiplier from Amounts",
  },
];

function MultiplierCalculatorContent() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<CalculationMode>("time");
  const [principal, setPrincipal] = useState<string>("");
  const [expectedReturn, setExpectedReturn] = useState<string>("");
  const [multiplier, setMultiplier] = useState<string>("");
  const [finalAmount, setFinalAmount] = useState<string>("");
  const [timeRequired, setTimeRequired] = useState<number | null>(null);
  const [calculatedMultiplier, setCalculatedMultiplier] = useState<
    number | null
  >(null);

  useEffect(() => {
    const mod = searchParams.get("mode") as CalculationMode;
    const prin = searchParams.get("principal");
    const ret = searchParams.get("return");
    const mult = searchParams.get("multiplier");
    const final = searchParams.get("final");

    if (mod && (mod === "time" || mod === "multiplier")) {
      setMode(mod);
    }
    if (prin && !Number.isNaN(Number(prin)) && Number(prin) > 0) {
      setPrincipal(prin);
    }
    if (ret && !Number.isNaN(Number(ret)) && Number(ret) > 0) {
      setExpectedReturn(ret);
    }
    if (mult && !Number.isNaN(Number(mult)) && Number(mult) > 1) {
      setMultiplier(mult);
    }
    if (final && !Number.isNaN(Number(final)) && Number(final) > 0) {
      setFinalAmount(final);
    }
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
    if (mode === "time") {
      const p = parseFloat(principal);
      const r = parseFloat(expectedReturn);
      const m = parseFloat(multiplier);

      if (p > 0 && r > 0 && m > 1) {
        const calculatedTime = Math.log(m) / Math.log(1 + r / 100);
        setTimeRequired(calculatedTime);
      } else {
        setTimeRequired(null);
      }
      setCalculatedMultiplier(null);
    } else {
      const p = parseFloat(principal);
      const f = parseFloat(finalAmount);

      if (p > 0 && f > p) {
        const calculatedMult = f / p;
        setCalculatedMultiplier(calculatedMult);
      } else {
        setCalculatedMultiplier(null);
      }
      setTimeRequired(null);
    }
  }, [mode, principal, expectedReturn, multiplier, finalAmount]);

  useEffect(() => {
    updateSearchParams({
      mode: mode,
      principal: principal,
      return: expectedReturn,
      multiplier: multiplier,
      final: finalAmount,
    });
  }, [
    mode,
    principal,
    expectedReturn,
    multiplier,
    finalAmount,
    updateSearchParams,
  ]);

  const futureValue = useMemo(() => {
    if (mode === "time") {
      const p = parseFloat(principal);
      const m = parseFloat(multiplier);
      return p > 0 && m > 1 ? p * m : 0;
    } else {
      return parseFloat(finalAmount) || 0;
    }
  }, [mode, principal, multiplier, finalAmount]);

  const numbers = useMemo(() => {
    const p = parseFloat(principal);
    const fv = futureValue;
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(fv) || fv <= 0) {
      return { principal: 0, final: 0, profit: 0 };
    }
    const profit = Math.max(fv - p, 0);
    return { principal: p, final: fv, profit };
  }, [principal, futureValue]);

  const chartData = useMemo(() => {
    if (numbers.principal <= 0 && numbers.final <= 0)
      return [] as Array<{ name: string; value: number; fill: string }>;
    const invested = numbers.principal;
    const profit = numbers.profit;
    return [
      {
        name: mode === "time" ? "Initial " : "Initial Amount",
        value: invested,
        fill: "var(--chart-1)",
      },
      {
        name: mode === "time" ? "Growth" : "Final Amount",
        value: profit,
        fill: "var(--chart-2)",
      },
    ];
  }, [numbers, mode]);

  const chartConfig: ChartConfig = {
    initial: { label: "Initial Amount", color: "var(--chart-1)" },
    growth: { label: "Growth", color: "var(--chart-2)" },
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-4xl font-bold">Multiplier Calculator</h1>
        <p className="text-muted-foreground">
          Calculate time to reach a multiplier or find the multiplier between
          two amounts
        </p>

        <div className="w-full max-w-4xl grid gap-12 md:grid-cols-2">
          <div className="w-full p-6 border rounded-lg shadow-sm bg-card">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="mode"
                  className="block text-sm font-medium mb-1"
                >
                  Calculation Mode
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between bg-background"
                    >
                      <span>
                        {modeOptions.find((m) => m.value === mode)?.label ||
                          "Calculate Time to Reach Multiplier"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>
                      Select Calculation Mode
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={mode}
                      onValueChange={(value) =>
                        setMode(value as CalculationMode)
                      }
                    >
                      {modeOptions.map((option) => (
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
                  htmlFor="principal"
                  className="block text-sm font-medium mb-1"
                >
                  Initial Amount
                </label>
                <input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {mode === "time" ? (
                <>
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
                      htmlFor="multiplier"
                      className="block text-sm font-medium mb-1"
                    >
                      Multiplier (e.g., 2 for double, 3 for triple)
                    </label>
                    <input
                      id="multiplier"
                      type="number"
                      value={multiplier}
                      onChange={(e) => setMultiplier(e.target.value)}
                      placeholder="2"
                      min="1.1"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label
                    htmlFor="finalAmount"
                    className="block text-sm font-medium mb-1"
                  >
                    Final Amount
                  </label>
                  <input
                    id="finalAmount"
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    placeholder="20000"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                {mode === "time" ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Time Required:
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          timeRequired !== null
                            ? "text-green-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {timeRequired !== null
                          ? `${timeRequired.toFixed(2)} years`
                          : "Enter values above"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Future Value:</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          futureValue > 0
                            ? "text-blue-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {futureValue > 0
                          ? `₹${futureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                          : "Enter values above"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Multiplier:</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          calculatedMultiplier !== null
                            ? "text-green-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {calculatedMultiplier !== null
                          ? `${calculatedMultiplier.toFixed(2)}x`
                          : "Enter values above"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Growth:</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          calculatedMultiplier !== null
                            ? "text-blue-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {calculatedMultiplier !== null
                          ? `₹${(futureValue - parseFloat(principal)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                          : "Enter values above"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="items-center pb-0">
              <h3 className="text-lg font-semibold">
                {mode === "time" ? "Growth Breakdown" : "Investment Breakdown"}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MultiplierCalculator() {
  return (
    <Suspense
      fallback={
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
          <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
            <h1 className="text-4xl font-bold">Multiplier Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <MultiplierCalculatorContent />
    </Suspense>
  );
}
