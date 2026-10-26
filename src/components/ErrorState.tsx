interface Props {
  title?: string;
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry, retrying = false }: Props) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {retrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );
}
