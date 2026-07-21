interface ProductCountProps {
  count: number;
}

export default function ProductCount({ count }: ProductCountProps) {
  return <span className="text-sm text-gray-600">{count} products</span>;
}
