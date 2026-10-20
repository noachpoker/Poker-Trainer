export function Choices({
  options, onPick, answered, correct, picked,
}: {
  options: string[];
  onPick: (o: string) => void;
  answered: boolean;
  correct?: string;
  picked?: string;
}) {
  return (
    <div className={options.some((o) => o.length > 24) ? 'choices long' : 'choices'}>
      {options.map((o) => {
        let cls = 'choice';
        if (answered && o === correct) cls += ' right';
        else if (answered && o === picked) cls += ' wrong';
        return (
          <button key={o} className={cls} disabled={answered} onClick={() => onPick(o)}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Feedback({ ok, children, onNext, nextLabel = 'Next hand' }: { ok: boolean; children: React.ReactNode; onNext: () => void; nextLabel?: string }) {
  return (
    <div className={`feedback ${ok ? 'ok' : 'bad'}`}>
      <strong>{ok ? 'Correct.' : 'Not quite.'}</strong> {children}
      <button className="next" onClick={onNext} autoFocus>
        {nextLabel}
      </button>
    </div>
  );
}
