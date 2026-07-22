interface DropdownHeaderProps {
  selectedCount: number;
  onReset: () => void;
  label?: string;
}

export default function DropdownHeader({
  selectedCount,
  onReset,
  label = "selected",
}: DropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} {label}
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-foreground underline underline-offset-4 hover:text-primary hover:no-underline"
      >
        Reset
      </button>
    </div>
  );
}
