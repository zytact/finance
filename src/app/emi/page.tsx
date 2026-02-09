"use client";

import { useSearchParams } from "next/navigation";
import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Pie, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TenureUnit = "years" | "months";

interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

interface ExtraPayments {
  lumpSum: string;
  lumpSumMonth: string;
  monthlyExtra: string;
  annualBonus: string;
  annualBonusMonth: string;
}

function EMICalculatorContent() {
  const searchParams = useSearchParams();

  const [principal, setPrincipal] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("years");
  const [enableExtraPayments, setEnableExtraPayments] =
    useState<boolean>(false);
  const [extraPayments, setExtraPayments] = useState<ExtraPayments>({
    lumpSum: "",
    lumpSumMonth: "",
    monthlyExtra: "",
    annualBonus: "",
    annualBonusMonth: "",
  });
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (initialized) return;

    const p = searchParams.get("principal");
    const rate = searchParams.get("rate");
    const t = searchParams.get("tenure");
    const unit = searchParams.get("unit");
    const extra = searchParams.get("extra");
    const lumpSum = searchParams.get("lumpSum");
    const lumpSumMonth = searchParams.get("lumpSumMonth");
    const monthlyExtra = searchParams.get("monthlyExtra");
    const annualBonus = searchParams.get("annualBonus");
    const annualBonusMonth = searchParams.get("annualBonusMonth");

    if (p && !Number.isNaN(Number(p)) && Number(p) > 0) {
      setPrincipal(p);
    }
    if (rate && !Number.isNaN(Number(rate)) && Number(rate) >= 0) {
      setInterestRate(rate);
    }
    if (t && !Number.isNaN(Number(t)) && Number(t) > 0) {
      setTenure(t);
    }
    if (unit && (unit === "years" || unit === "months")) {
      setTenureUnit(unit as TenureUnit);
    }
    if (extra) {
      setEnableExtraPayments(extra === "true");
    }
    if (lumpSum && !Number.isNaN(Number(lumpSum))) {
      setExtraPayments((prev) => ({ ...prev, lumpSum }));
    }
    if (lumpSumMonth && !Number.isNaN(Number(lumpSumMonth))) {
      setExtraPayments((prev) => ({ ...prev, lumpSumMonth }));
    }
    if (monthlyExtra && !Number.isNaN(Number(monthlyExtra))) {
      setExtraPayments((prev) => ({ ...prev, monthlyExtra }));
    }
    if (annualBonus && !Number.isNaN(Number(annualBonus))) {
      setExtraPayments((prev) => ({ ...prev, annualBonus }));
    }
    if (annualBonusMonth && !Number.isNaN(Number(annualBonusMonth))) {
      setExtraPayments((prev) => ({ ...prev, annualBonusMonth }));
    }

    setInitialized(true);
  }, [searchParams, initialized]);

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
    if (!initialized) return;
    updateSearchParams({
      principal: principal,
      rate: interestRate,
      tenure: tenure,
      unit: tenureUnit,
      extra: enableExtraPayments.toString(),
      lumpSum: extraPayments.lumpSum,
      lumpSumMonth: extraPayments.lumpSumMonth,
      monthlyExtra: extraPayments.monthlyExtra,
      annualBonus: extraPayments.annualBonus,
      annualBonusMonth: extraPayments.annualBonusMonth,
    });
  }, [
    principal,
    interestRate,
    tenure,
    tenureUnit,
    enableExtraPayments,
    extraPayments,
    updateSearchParams,
    initialized,
  ]);

  const baseCalculation = useMemo(() => {
    const p = parseFloat(principal);
    const rate = parseFloat(interestRate);
    const t = parseFloat(tenure);

    if (
      p <= 0 ||
      rate < 0 ||
      t <= 0 ||
      !Number.isFinite(p) ||
      !Number.isFinite(rate) ||
      !Number.isFinite(t)
    ) {
      return null;
    }

    const tenureInMonths = tenureUnit === "years" ? t * 12 : t;
    const monthlyRate = rate / 100 / 12;

    let emi: number;
    if (monthlyRate === 0) {
      emi = p / tenureInMonths;
    } else {
      emi =
        (p * monthlyRate * (1 + monthlyRate) ** tenureInMonths) /
        ((1 + monthlyRate) ** tenureInMonths - 1);
    }

    const amortization: AmortizationRow[] = [];
    let balance = p;

    for (let month = 1; month <= tenureInMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance = Math.max(0, balance - principalPayment);

      amortization.push({
        month,
        emi,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });
    }

    const totalInterest = amortization.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const totalPayment = p + totalInterest;

    const today = new Date();
    const loanEndDate = new Date(today);
    loanEndDate.setMonth(loanEndDate.getMonth() + tenureInMonths);

    return {
      emi,
      totalInterest,
      totalPayment,
      loanEndDate,
      amortization,
      tenureInMonths,
    };
  }, [principal, interestRate, tenure, tenureUnit]);

  const extraPaymentCalculation = useMemo(() => {
    if (!enableExtraPayments || !baseCalculation) {
      return null;
    }

    const p = parseFloat(principal);
    const rate = parseFloat(interestRate);
    const tenureInMonths = baseCalculation.tenureInMonths;
    const monthlyRate = rate / 100 / 12;
    const baseEmi = baseCalculation.emi;

    const lumpSum = parseFloat(extraPayments.lumpSum) || 0;
    const lumpSumMonth = parseInt(extraPayments.lumpSumMonth, 10) || 0;
    const monthlyExtra = parseFloat(extraPayments.monthlyExtra) || 0;
    const annualBonus = parseFloat(extraPayments.annualBonus) || 0;
    const annualBonusMonth = parseInt(extraPayments.annualBonusMonth, 10) || 1;

    const amortization: AmortizationRow[] = [];
    let balance = p;
    let month = 1;

    while (balance > 0.01 && month <= tenureInMonths * 2) {
      const interestPayment = balance * monthlyRate;
      let totalPayment = baseEmi;

      if (month === lumpSumMonth && lumpSum > 0) {
        totalPayment += lumpSum;
      }

      if (monthlyExtra > 0) {
        totalPayment += monthlyExtra;
      }

      if (annualBonus > 0 && month === annualBonusMonth) {
        totalPayment += annualBonus;
      }
      if (
        annualBonus > 0 &&
        month > annualBonusMonth &&
        (month - annualBonusMonth) % 12 === 0
      ) {
        totalPayment += annualBonus;
      }

      const principalPayment = Math.min(
        totalPayment - interestPayment,
        balance,
      );
      balance = Math.max(0, balance - principalPayment);

      const actualPayment = interestPayment + principalPayment;

      amortization.push({
        month,
        emi: actualPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      });

      month++;
    }

    const actualTenure = amortization.length;
    const totalInterest = amortization.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const totalPayment = p + totalInterest;

    const today = new Date();
    const loanEndDate = new Date(today);
    loanEndDate.setMonth(loanEndDate.getMonth() + actualTenure);

    const interestSaved = baseCalculation.totalInterest - totalInterest;
    const monthsReduced = baseCalculation.tenureInMonths - actualTenure;

    return {
      emi: baseEmi,
      totalInterest,
      totalPayment,
      loanEndDate,
      amortization,
      tenureInMonths: actualTenure,
      interestSaved,
      monthsReduced,
    };
  }, [
    enableExtraPayments,
    baseCalculation,
    principal,
    interestRate,
    extraPayments,
  ]);

  const activeCalculation =
    enableExtraPayments && extraPaymentCalculation
      ? extraPaymentCalculation
      : baseCalculation;

  const chartData = useMemo(() => {
    if (!activeCalculation) return [];

    const totalPrincipal = parseFloat(principal) || 0;
    const totalInterest = activeCalculation.totalInterest;

    if (totalPrincipal <= 0 || totalInterest < 0) return [];

    return [
      {
        name: "Principal",
        value: totalPrincipal,
        fill: "var(--chart-1)",
      },
      {
        name: "Interest",
        value: totalInterest,
        fill: "var(--chart-2)",
      },
    ];
  }, [activeCalculation, principal]);

  const chartConfig: ChartConfig = {
    principal: { label: "Principal", color: "var(--chart-1)" },
    interest: { label: "Interest", color: "var(--chart-2)" },
  };

  const displayedAmortization = useMemo(() => {
    if (!activeCalculation) return [];

    const schedule = activeCalculation.amortization;
    if (schedule.length <= 12) {
      return schedule;
    }

    return [...schedule.slice(0, 6), ...schedule.slice(-6)];
  }, [activeCalculation]);

  const hasHiddenRows =
    activeCalculation && activeCalculation.amortization.length > 12;

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
        <h1 className="font-bold text-4xl">Loan/EMI Calculator</h1>
        <p className="text-muted-foreground">
          Calculate your loan EMI, total interest, and amortization schedule
        </p>

        <div className="grid w-full max-w-6xl gap-12 md:grid-cols-2">
          <div className="w-full rounded-lg border bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-y-4">
              <div>
                <label
                  htmlFor="principal"
                  className="mb-1 block font-medium text-sm"
                >
                  Loan Amount (Principal)
                </label>
                <input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="1000000"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="interestRate"
                  className="mb-1 block font-medium text-sm"
                >
                  Interest Rate (Annual %)
                </label>
                <input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="8.5"
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="tenure"
                  className="mb-1 block font-medium text-sm"
                >
                  Tenure
                </label>
                <div className="flex gap-2">
                  <input
                    id="tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="20"
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTenureUnit("years")}
                      className={cn(
                        "whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors",
                        tenureUnit === "years"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background hover:bg-accent",
                      )}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => setTenureUnit("months")}
                      className={cn(
                        "whitespace-nowrap rounded-md border px-3 py-2 text-sm transition-colors",
                        tenureUnit === "months"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background hover:bg-accent",
                      )}
                    >
                      Months
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <label
                    htmlFor="enableExtraPayments"
                    className="font-medium text-sm"
                  >
                    Enable Extra Payments
                  </label>
                  <Switch
                    id="enableExtraPayments"
                    checked={enableExtraPayments}
                    onCheckedChange={setEnableExtraPayments}
                  />
                </div>

                {enableExtraPayments && (
                  <div className="flex flex-col gap-y-4">
                    <div>
                      <label
                        htmlFor="lumpSum"
                        className="mb-1 block font-medium text-sm"
                      >
                        One-time Lump Sum (₹)
                      </label>
                      <input
                        id="lumpSum"
                        type="number"
                        value={extraPayments.lumpSum}
                        onChange={(e) =>
                          setExtraPayments((prev) => ({
                            ...prev,
                            lumpSum: e.target.value,
                          }))
                        }
                        placeholder="50000"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lumpSumMonth"
                        className="mb-1 block font-medium text-sm"
                      >
                        Lump Sum Payment Month
                      </label>
                      <input
                        id="lumpSumMonth"
                        type="number"
                        value={extraPayments.lumpSumMonth}
                        onChange={(e) =>
                          setExtraPayments((prev) => ({
                            ...prev,
                            lumpSumMonth: e.target.value,
                          }))
                        }
                        placeholder="12"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="monthlyExtra"
                        className="mb-1 block font-medium text-sm"
                      >
                        Monthly Extra EMI (₹)
                      </label>
                      <input
                        id="monthlyExtra"
                        type="number"
                        value={extraPayments.monthlyExtra}
                        onChange={(e) =>
                          setExtraPayments((prev) => ({
                            ...prev,
                            monthlyExtra: e.target.value,
                          }))
                        }
                        placeholder="5000"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="annualBonus"
                        className="mb-1 block font-medium text-sm"
                      >
                        Annual Bonus Payment (₹)
                      </label>
                      <input
                        id="annualBonus"
                        type="number"
                        value={extraPayments.annualBonus}
                        onChange={(e) =>
                          setExtraPayments((prev) => ({
                            ...prev,
                            annualBonus: e.target.value,
                          }))
                        }
                        placeholder="100000"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="annualBonusMonth"
                        className="mb-1 block font-medium text-sm"
                      >
                        Annual Bonus First Payment Month
                      </label>
                      <input
                        id="annualBonusMonth"
                        type="number"
                        value={extraPayments.annualBonusMonth}
                        onChange={(e) =>
                          setExtraPayments((prev) => ({
                            ...prev,
                            annualBonusMonth: e.target.value,
                          }))
                        }
                        placeholder="12"
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                {activeCalculation && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">EMI Amount:</span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹
                        {activeCalculation.emi.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Total Interest:
                      </span>
                      <span className="font-bold text-sm">
                        ₹
                        {activeCalculation.totalInterest.toLocaleString(
                          "en-IN",
                          { maximumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Total Payable:
                      </span>
                      <span className="font-bold text-sm">
                        ₹
                        {activeCalculation.totalPayment.toLocaleString(
                          "en-IN",
                          { maximumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        Loan End Date:
                      </span>
                      <span className="font-bold text-sm">
                        {activeCalculation.loanEndDate.toLocaleDateString(
                          "en-IN",
                          { year: "numeric", month: "short" },
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {!activeCalculation && (
                  <p className="text-muted-foreground text-sm">
                    Enter values above to calculate
                  </p>
                )}
              </div>

              {enableExtraPayments &&
                extraPaymentCalculation &&
                baseCalculation && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <h4 className="mb-2 font-semibold text-green-900 text-sm dark:text-green-100">
                      Extra Payment Impact
                    </h4>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 dark:text-green-200">
                          Interest Saved:
                        </span>
                        <span className="font-bold text-green-900 dark:text-green-100">
                          ₹
                          {extraPaymentCalculation.interestSaved.toLocaleString(
                            "en-IN",
                            { maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 dark:text-green-200">
                          Months Reduced:
                        </span>
                        <span className="font-bold text-green-900 dark:text-green-100">
                          {extraPaymentCalculation.monthsReduced} months
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-green-700 text-xs dark:text-green-300">
                      {extraPayments.monthlyExtra &&
                      parseFloat(extraPayments.monthlyExtra) > 0
                        ? `Pay ₹${parseFloat(extraPayments.monthlyExtra).toLocaleString("en-IN")} extra monthly → Save ₹${(extraPaymentCalculation.interestSaved / 100000).toFixed(2)}L interest`
                        : "Add extra payments to see impact"}
                    </p>
                  </div>
                )}
            </div>
          </div>

          <div className="w-full">
            <div className="mb-8">
              <h3 className="mb-4 font-semibold text-lg">Payment Breakdown</h3>
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
                        <span className="font-medium text-sm">{item.name}</span>
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

            {activeCalculation && (
              <div>
                <h3 className="mb-4 font-semibold text-lg">
                  Amortization Schedule
                </h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border-b px-3 py-2 text-left font-medium">
                          Month
                        </th>
                        <th className="border-b px-3 py-2 text-right font-medium">
                          EMI
                        </th>
                        <th className="border-b px-3 py-2 text-right font-medium">
                          Principal
                        </th>
                        <th className="border-b px-3 py-2 text-right font-medium">
                          Interest
                        </th>
                        <th className="border-b px-3 py-2 text-right font-medium">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAmortization.map((row, index) => {
                        const isGap = hasHiddenRows && index === 6;

                        if (isGap) {
                          const hiddenCount =
                            activeCalculation.amortization.length - 12;
                          return (
                            <Fragment key={`fragment-${row.month}`}>
                              <tr className="border-b bg-muted/30">
                                <td
                                  colSpan={5}
                                  className="px-3 py-2 text-center text-muted-foreground"
                                >
                                  ... {hiddenCount} months not shown ...
                                </td>
                              </tr>
                              <tr
                                key={row.month}
                                className="border-b hover:bg-muted/50"
                              >
                                <td className="px-3 py-2">{row.month}</td>
                                <td className="px-3 py-2 text-right">
                                  ₹
                                  {row.emi.toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  ₹
                                  {row.principal.toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  ₹
                                  {row.interest.toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  ₹
                                  {row.balance.toLocaleString("en-IN", {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                              </tr>
                            </Fragment>
                          );
                        }

                        return (
                          <tr
                            key={row.month}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="px-3 py-2">{row.month}</td>
                            <td className="px-3 py-2 text-right">
                              ₹
                              {row.emi.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-3 py-2 text-right">
                              ₹
                              {row.principal.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-3 py-2 text-right">
                              ₹
                              {row.interest.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="px-3 py-2 text-right">
                              ₹
                              {row.balance.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EMICalculator() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
          <main className="row-start-2 flex w-full flex-col items-center gap-[32px]">
            <h1 className="font-bold text-4xl">Loan/EMI Calculator</h1>
            <p className="text-muted-foreground">Loading...</p>
          </main>
        </div>
      }
    >
      <EMICalculatorContent />
    </Suspense>
  );
}
