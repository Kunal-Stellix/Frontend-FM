import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, type = "checkbox", ...props }: CheckboxProps) {
  return <input type={type} className={cn("checkbox checkbox-primary checkbox-sm", className)} {...props} />;
}
