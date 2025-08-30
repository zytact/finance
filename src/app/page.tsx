import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] items-center">
          <div className="flex flex-row gap-4 items-center">
            <Link href="/sip">
              <Button size="lg">SIP Calculator</Button>
            </Link>
            <Link href="/lumpsum">
              <Button size="lg">Lumpsum Calculator</Button>
            </Link>
            <Link href="/cagr">
              <Button size="lg">CAGR Calculator</Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
