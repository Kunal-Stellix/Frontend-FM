type DividerProps = {
  children?: React.ReactNode;
};

export function Divider({ children }: DividerProps) {
  return <div className="divider">{children}</div>;
}
