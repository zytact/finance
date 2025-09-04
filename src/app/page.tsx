import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pb-16 gap-12 sm:p-20 sm:gap-16">
        <main className="flex flex-col gap-8 sm:gap-[32px] items-center">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 items-center w-full max-w-sm sm:max-w-none">
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
