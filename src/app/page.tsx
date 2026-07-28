import { Header } from "@/components/Header";
import { DesktopGrid } from "@/components/DesktopGrid";
import { MobileFeed } from "@/components/MobileFeed";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b1120]">
      <div className="md:hidden">
        <MobileFeed />
      </div>
      <div className="hidden md:block">
        <Header />
        <DesktopGrid />
      </div>
    </div>
  );
}
