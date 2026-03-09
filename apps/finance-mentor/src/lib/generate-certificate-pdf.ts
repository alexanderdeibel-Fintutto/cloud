/**
 * Generate a certificate PDF entirely client-side using Canvas → Blob.
 * No external dependencies required.
 */

export interface CertificateData {
  name: string;
  courseTitle: string;
  date: string;
  certificateNumber: string;
  score: number;
}

export function generateCertificatePDF(data: CertificateData): void {
  const WIDTH = 1200;
  const HEIGHT = 850;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, WIDTH - 60, HEIGHT - 60);

  // Inner border
  ctx.strokeStyle = "#4f46e520";
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, WIDTH - 100, HEIGHT - 100);

  // Top accent line
  const gradient = ctx.createLinearGradient(100, 80, WIDTH - 100, 80);
  gradient.addColorStop(0, "#6366f1");
  gradient.addColorStop(0.5, "#a855f7");
  gradient.addColorStop(1, "#6366f1");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 80);
  ctx.lineTo(WIDTH - 100, 80);
  ctx.stroke();

  // Fintutto Logo Text
  ctx.fillStyle = "#6366f1";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FINTUTTO FINANCE MENTOR", WIDTH / 2, 130);

  // Certificate Title
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
  ctx.fillText("Zertifikat", WIDTH / 2, 200);

  // Subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "18px system-ui, -apple-system, sans-serif";
  ctx.fillText("Hiermit wird bescheinigt, dass", WIDTH / 2, 270);

  // Name
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
  ctx.fillText(data.name || "Teilnehmer/in", WIDTH / 2, 330);

  // Decorative line under name
  ctx.strokeStyle = "#6366f130";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 350);
  ctx.lineTo(WIDTH - 300, 350);
  ctx.stroke();

  // Course completion text
  ctx.fillStyle = "#94a3b8";
  ctx.font = "18px system-ui, -apple-system, sans-serif";
  ctx.fillText("den Kurs erfolgreich abgeschlossen hat:", WIDTH / 2, 400);

  // Course title
  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(data.courseTitle, WIDTH / 2, 450);

  // Score
  ctx.fillStyle = "#6366f1";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Ergebnis: ${data.score}%`, WIDTH / 2, 510);

  // Bottom info
  ctx.fillStyle = "#64748b";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Ausgestellt am ${data.date}`, WIDTH / 2, 680);
  ctx.fillText(`Zertifikat-Nr.: ${data.certificateNumber}`, WIDTH / 2, 710);

  // Bottom accent line
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, HEIGHT - 80);
  ctx.lineTo(WIDTH - 100, HEIGHT - 80);
  ctx.stroke();

  // Footer
  ctx.fillStyle = "#475569";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText("fintutto.com/finance-mentor", WIDTH / 2, HEIGHT - 50);

  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Zertifikat-${data.courseTitle.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}
