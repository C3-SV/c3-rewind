const orbitColors = ["var(--compite-light)", "var(--crea-light)", "var(--conecta-light)"];

export function OrbitMotif({ active = 0, quiet = false }: { active?: number; quiet?: boolean }) {
  return (
    <div className={`orbit-motif${quiet ? " orbit-motif--quiet" : ""}`} aria-hidden="true">
      {orbitColors.map((color, index) => (
        <span
          className={`orbit-ring orbit-ring--${index + 1}${active === index + 1 ? " is-lit" : ""}`}
          key={color}
          style={{ "--orbit-color": color } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
