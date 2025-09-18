import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 p-4 pb-16 sm:gap-16 sm:p-20">
        <main className="flex flex-col items-center gap-8 sm:gap-[32px]">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:gap-4">
            <Link href="/sip" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                SIP Calculator
              </Button>
            </Link>
            <Link href="/lumpsum" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Lumpsum Calculator
              </Button>
            </Link>
            <Link href="/cagr" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                CAGR Calculator
              </Button>
            </Link>
            <Link href="/inflation" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Inflation Calculator
              </Button>
            </Link>
            <Link href="/multiplier" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Multiplier Calculator
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
