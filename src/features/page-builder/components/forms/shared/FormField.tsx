import { cn } from '@/lib/utils';

interface Props {
  label: string;
  optional?: boolean;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, optional, required, error, children }: Props) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 text-xs text-muted-foreground">(optional)</span>}
        {required && <span className="ml-1 text-xs text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
