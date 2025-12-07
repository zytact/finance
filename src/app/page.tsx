import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 p-4 pb-16 sm:gap-16 sm:p-20">
        <main className="flex flex-col items-center gap-8 sm:gap-[32px]">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 sm:max-w-none">
            <Link href="/sip" className="w-full">
              <Button size="lg" className="w-full">
                SIP Calculator
              </Button>
            </Link>
            <Link href="/lumpsum" className="w-full">
              <Button size="lg" className="w-full">
                Lumpsum Calculator
              </Button>
            </Link>
            <Link href="/cagr" className="w-full">
              <Button size="lg" className="w-full">
                CAGR Calculator
              </Button>
            </Link>
            <Link href="/inflation" className="w-full">
              <Button size="lg" className="w-full">
                Inflation Calculator
              </Button>
            </Link>
            <Link href="/multiplier" className="w-full">
              <Button size="lg" className="w-full">
                Multiplier Calculator
              </Button>
            </Link>
            <Link href="/goal" className="w-full">
              <Button size="lg" className="w-full">
                Goal Calculator
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
