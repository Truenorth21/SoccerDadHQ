import type { PollResult } from "@/lib/pollResults";

function ResultCard({ r }: { r: PollResult }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading text-base font-bold text-navy">
          {r.poll.emoji} {r.poll.question}
        </h4>
        <span className="chip shrink-0">{r.realTotal} vote{r.realTotal === 1 ? "" : "s"}</span>
      </div>
      {r.realTotal === 0 ? (
        <p className="mt-2 text-xs text-slate-400">Awaiting first vote.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {r.options.map((o, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm">
                <span className={i === r.topIndex ? "font-semibold text-navy" : "text-slate-600"}>{o.label}</span>
                <span className="font-heading font-bold text-brand-blue">
                  {o.pct}% <span className="font-normal text-slate-400">· {o.votes}</span>
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded bg-slate-100">
                <div
                  className="h-2 rounded"
                  style={{ width: `${o.pct}%`, background: i === r.topIndex ? "#e8a020" : "#2a7de1" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Admin panel: live, real (un-seeded) poll votes. Insight polls lead since their
 *  tallies are the useful data for newsletter & social; fun polls follow. */
export default function PollPulse({ results }: { results: PollResult[] }) {
  const insight = results.filter((r) => r.poll.kind === "insight").sort((a, b) => b.realTotal - a.realTotal);
  const fun = results.filter((r) => r.poll.kind === "fun").sort((a, b) => b.realTotal - a.realTotal);
  const funAnswered = fun.filter((r) => r.realTotal > 0);
  const totalVotes = results.reduce((a, r) => a + r.realTotal, 0);
  const answeredPolls = results.filter((r) => r.realTotal > 0).length;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        {totalVotes.toLocaleString()} vote{totalVotes === 1 ? "" : "s"} · {answeredPolls} of {results.length} polls answered
      </p>

      {totalVotes === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
          No poll votes recorded yet. Real votes from the Sideline deck show up here (the on-site bars use seeded
          numbers; this panel shows actual votes only).
        </p>
      ) : (
        <>
          <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-slate-500">
            Parent Pulse — insight polls
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {insight.map((r) => (
              <ResultCard key={r.poll.id} r={r} />
            ))}
          </div>

          <h3 className="mb-2 mt-8 font-heading text-sm font-bold uppercase tracking-wide text-slate-500">
            Sideline Life — fun polls
          </h3>
          {funAnswered.length === 0 ? (
            <p className="text-sm text-slate-400">No fun-poll votes yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {funAnswered.map((r) => (
                <ResultCard key={r.poll.id} r={r} />
              ))}
            </div>
          )}
          {fun.length - funAnswered.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {fun.length - funAnswered.length} fun poll{fun.length - funAnswered.length === 1 ? "" : "s"} awaiting their first vote.
            </p>
          )}
        </>
      )}
    </div>
  );
}
