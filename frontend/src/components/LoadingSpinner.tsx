interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ label, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrap spinner-${size}`} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      {label ? <p className="spinner-label">{label}</p> : null}
    </div>
  );
}
