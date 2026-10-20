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
    <div className="choices">
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

export function Feedback({ ok, children, onNext }: { ok: boolean; children: React.ReactNode; onNext: () => void }) {
  return (
    <div className={`feedback ${ok ? 'ok' : 'bad'}`}>
      <strong>{ok ? 'Correct.' : 'Not quite.'}</strong> {children}
      <button className="next" onClick={onNext} autoFocus>
        Next hand
      </button>
    </div>
  );
}
