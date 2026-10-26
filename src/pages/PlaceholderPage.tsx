interface Props {
  title: string;
  note: string;
}

export default function PlaceholderPage({ title, note }: Props) {
  return (
    <section>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{note}</p>
    </section>
  );
}
