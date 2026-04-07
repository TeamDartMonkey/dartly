type LabelProps = {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
};

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-400">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
