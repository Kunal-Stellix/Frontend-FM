import { cn } from "@/lib/utils";

type MockupCodeProps = {
  lines: string[];
  className?: string;
};

export function MockupCode({ lines, className }: MockupCodeProps) {
  return (
    <div className={cn("mockup-code text-sm shadow", className)}>
      {lines.map((line, index) => (
        <pre key={line} data-prefix={index + 1}>
          <code>{line}</code>
        </pre>
      ))}
    </div>
  );
}
