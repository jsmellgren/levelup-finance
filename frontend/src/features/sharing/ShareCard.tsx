import { useRef } from "react";
import { Button } from "../../components/ui/Button";

type Props = {
  headline: string; // e.g. "I just saved $1,000 💰"
  subline: string; // e.g. "30-Day Challenge COMPLETE"
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  onClose: () => void;
};

/**
 * Renders the share card as an on-screen div (what the user sees) and, separately,
 * draws the same content onto a <canvas> so it can be exported as a PNG — no
 * external screenshot library or backend image service required for the MVP.
 */
export function ShareCard({ headline, subline, stat1Label, stat1Value, stat2Label, stat2Value, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function download() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, "#0B0F14");
    gradient.addColorStop(1, "#121824");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.fillStyle = "#2DD4AA";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText("LevelUp Finance", 80, 140);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px sans-serif";
    wrapText(ctx, headline, 80, 320, 900, 76);

    ctx.fillStyle = "#7C6CF7";
    ctx.font = "44px sans-serif";
    ctx.fillText(subline, 80, 460);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(stat1Value, 80, 700);
    ctx.fillStyle = "#FFFFFF80";
    ctx.font = "28px sans-serif";
    ctx.fillText(stat1Label, 80, 740);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(stat2Value, 560, 700);
    ctx.fillStyle = "#FFFFFF80";
    ctx.font = "28px sans-serif";
    ctx.fillText(stat2Label, 560, 740);

    ctx.fillStyle = "#FFFFFF50";
    ctx.font = "26px sans-serif";
    ctx.fillText("Join me on LevelUp Finance →", 80, 980);

    const link = document.createElement("a");
    link.download = "levelup-finance-share.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-xl2 border border-white/10 bg-gradient-to-br from-bg to-bg-card p-8 text-center">
          <p className="text-xs font-bold text-brand-teal">LevelUp Finance</p>
          <h2 className="mt-4 text-2xl font-bold leading-tight">{headline}</h2>
          <p className="mt-2 text-brand-purple">{subline}</p>
          <div className="mt-6 flex justify-center gap-8">
            <div>
              <p className="text-lg font-bold">{stat1Value}</p>
              <p className="text-xs text-white/40">{stat1Label}</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stat2Value}</p>
              <p className="text-xs text-white/40">{stat2Label}</p>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={download}>Download Image</Button>
        </div>
      </div>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line, x, curY);
      line = word + " ";
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
