interface ProductCare {
  instructions: string[];
}

interface ProductCareProps {
  care: ProductCare;
}

export default function ProductCare({ care }: ProductCareProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl lg:text-2xl font-normal text-black">
        PRODUCT CARE
      </h2>
      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
        {care.instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>
    </div>
  );
}
