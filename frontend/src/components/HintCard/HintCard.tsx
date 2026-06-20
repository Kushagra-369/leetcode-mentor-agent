interface HintCardProps {
  title: string;
  hint: string;
}

export default function HintCard({
  title,
  hint,
}: HintCardProps) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h3 className="font-semibold mb-2">
        {title}
      </h3>

      <p>{hint}</p>
    </div>
  );
}