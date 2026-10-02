"use client";

import { US_STATES } from "@/lib/states";
import { regionsForState } from "@/lib/regions";

/** State dropdown plus its dependent location field, shared by the directory
 *  filters. Picking a state with predefined regions shows a region dropdown;
 *  a state without them falls back to a city search (ZIP + radius stay available
 *  in the parent filter panel either way). Changing state always clears region/city. */
export default function StateRegionFields({
  get,
  update,
  showCity = true,
}: {
  get: (k: string) => string;
  update: (changes: Record<string, string>) => void;
  showCity?: boolean;
}) {
  const state = get("state");
  const regions = regionsForState(state);

  return (
    <>
      <div>
        <label className="label" htmlFor="filter-state">State</label>
        <select
          id="filter-state"
          className="input"
          value={state}
          onChange={(e) => update({ state: e.target.value, region: "", city: "" })}
        >
          <option value="">All states</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      {state && regions.length > 0 && (
        <div>
          <label className="label" htmlFor="filter-region">Region</label>
          <select
            id="filter-region"
            className="input"
            value={get("region")}
            onChange={(e) => update({ region: e.target.value })}
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.key} value={r.key}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      {state && regions.length === 0 && showCity && (
        <div>
          <label className="label" htmlFor="filter-city">City</label>
          <input
            id="filter-city"
            key={state}
            className="input"
            placeholder="Any city"
            defaultValue={get("city")}
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ city: (e.target as HTMLInputElement).value });
            }}
            onBlur={(e) => {
              if (e.target.value !== get("city")) update({ city: e.target.value });
            }}
          />
        </div>
      )}
    </>
  );
}
