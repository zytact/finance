import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex justify-end w-full mb-4">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-bold">Let's get started</h1>
        <p className="text-muted-foreground">
          Welcome to your finance app with dark/light mode support!
        </p>
      </main>
    </div>
  );
}
