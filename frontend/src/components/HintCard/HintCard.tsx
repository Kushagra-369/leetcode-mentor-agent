// HintCard.tsx
interface HintCardProps {
  title: string;
  hint: string;
}

export default function HintCard({ title, hint }: HintCardProps) {
  return (
    <div className="p-4">
      <p className="text-gray-300 leading-relaxed">{hint}</p>
    </div>
  );
}