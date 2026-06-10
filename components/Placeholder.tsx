export function Placeholder({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="tri-placeholder">
      <span className="tri-placeholder-eyebrow">In construction</span>
      <h1 className="tri-placeholder-title">{title}</h1>
      <p className="tri-placeholder-hint">
        {hint ?? "This section is on the way. Check back soon."}
      </p>
    </div>
  );
}
