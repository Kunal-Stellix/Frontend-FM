import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

type FieldLabelProps = BaseProps & {
  helper?: React.ReactNode;
};

export function FormField({ children, className }: BaseProps) {
  return <label className={cn("form-control w-full", className)}>{children}</label>;
}

export function FieldLabel({ children, helper, className }: FieldLabelProps) {
  return (
    <div className={cn("label", className)}>
      <span className="label-text">{children}</span>
      {helper ? <span className="label-text-alt">{helper}</span> : null}
    </div>
  );
}
