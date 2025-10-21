import { Highlight } from "./ui/highlight";
import Odsbranding from "./Odsbranding";
import { Star } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative flex flex-col items-center justify-center px-2 py-8 mx-auto lg:px-0">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium border rounded-full bg-secondary/50 border-secondary backdrop-blur-sm">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span>Open Source GitHub Profile Generator</span>
      </div>

      <h1 className="w-full mb-6 text-4xl font-bold text-center sm:text-6xl lg:text-7xl sm:leading-tight">
        Your GitHub Profile, <br/>
        <Highlight className="text-transparent bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text">
          Reimagined
        </Highlight>
      </h1>

      <p className="max-w-3xl mx-auto mb-8 text-lg leading-relaxed text-center text-muted-foreground sm:text-xl">
        <Highlight className="font-semibold text-foreground ">Open, Transparent, and Fully Yours.</Highlight>
      </p>

      <div className="flex flex-col items-center gap-6 mt-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Trusted by the Community</span>
          <span className="text-lg font-bold text-teal-500">10+ GitHub Stars</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Initiative by</span>
          <Odsbranding />
        </div>
      </div>
    </div>
  );
}
