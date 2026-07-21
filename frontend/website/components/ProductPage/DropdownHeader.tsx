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
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <span className="text-sm text-gray-600">
        {selectedCount} {label}
      </span>
      <button
        onClick={onReset}
        className="text-sm text-black underline hover:no-underline"
      >
        Reset
      </button>
    </div>
  );
}
