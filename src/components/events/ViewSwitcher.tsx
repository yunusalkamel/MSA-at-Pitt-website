type View = "agenda" | "calendar";

interface Props {
  view: View;
  onChange: (v: View) => void;
}

const ViewSwitcher = ({ view, onChange }: Props) => (
  <div className="inline-flex liquid-glass rounded-full p-1 gap-1">
    {(["agenda", "calendar"] as View[]).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold font-body transition-all duration-200 capitalize
          ${view === v ? "gold-gradient text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        {v}
      </button>
    ))}
  </div>
);

export default ViewSwitcher;
