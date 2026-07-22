interface ProductCountProps {
  count: number;
}

export default function ProductCount({ count }: ProductCountProps) {
  return (
    <span className="text-sm text-muted-foreground">{count} products</span>
  );
}
