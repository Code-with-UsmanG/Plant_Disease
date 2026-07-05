interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorPanel({ message, onRetry }: Props) {
  return (
    <section className="error-panel">
      <div className="container">
        <div className="error-panel__card">
          <span className="error-panel__mark mono">!</span>
          <h3>The reading didn't complete</h3>
          <p>{message}</p>
          <button className="btn btn-primary" type="button" onClick={onRetry}>Try again</button>
        </div>
      </div>
    </section>
  );
}
