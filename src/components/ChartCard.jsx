export default function ChartCard({ title, children, filters }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      {filters && <div className="card-filters">{filters}</div>}
      {children}
    </div>
  );
}