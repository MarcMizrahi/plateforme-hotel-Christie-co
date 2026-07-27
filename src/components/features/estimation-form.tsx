"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { fr } from "@/lib/i18n";
import { REGIONS, departmentsOfRegion } from "@/data/geo";
import { submitEstimation, type EstimationFormState } from "@/app/estimation/actions";

const STEP_KEYS = ["location", "type", "characteristics", "financials", "email"] as const;
type StepKey = (typeof STEP_KEYS)[number];

const TRANSACTION_TYPES = ["MURS_FONDS", "MURS", "FONDS", "GERANCE"] as const;
const SALE_INTENTIONS = ["LESS_THAN_1_YEAR", "ONE_TO_TWO_YEARS", "CURIOSITY"] as const;

const initialState: EstimationFormState = { status: "idle" };

interface Props {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export function EstimationForm({ utmSource, utmMedium, utmCampaign }: Props) {
  const [state, formAction, isPending] = useActionState(submitEstimation, initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [regionSlug, setRegionSlug] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [starRating, setStarRating] = useState("");
  const [email, setEmail] = useState("");
  const [saleIntention, setSaleIntention] = useState<string>("");
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const departments = useMemo(() => departmentsOfRegion(regionSlug), [regionSlug]);
  const currentStep: StepKey = STEP_KEYS[stepIndex];
  const referrer = typeof document !== "undefined" ? document.referrer : "";

  function goNext() {
    if (currentStep === "location" && (!regionSlug || !departmentSlug)) {
      setStepError(fr.estimationForm.errors.required);
      return;
    }
    if (currentStep === "characteristics" && (!roomCount || !starRating)) {
      setStepError(fr.estimationForm.errors.required);
      return;
    }
    setStepError(null);
    setStepIndex((i) => Math.min(i + 1, STEP_KEYS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <form ref={formRef} action={formAction} className="mx-auto max-w-xl">
      <input type="hidden" name="utmSource" value={utmSource ?? ""} />
      <input type="hidden" name="utmMedium" value={utmMedium ?? ""} />
      <input type="hidden" name="utmCampaign" value={utmCampaign ?? ""} />
      <input type="hidden" name="referrer" value={referrer} />

      <ol className="mb-8 flex items-center justify-between text-xs font-medium text-warm-500">
        {STEP_KEYS.map((key, i) => (
          <li key={key} className={i <= stepIndex ? "text-navy-800" : undefined}>
            {fr.estimationForm.steps[key]}
          </li>
        ))}
      </ol>

      <div className={currentStep === "location" ? "" : "hidden"}>
        <h2 className="mb-4 font-serif text-2xl text-navy-900">{fr.estimationForm.steps.location}</h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.region}</span>
          <select
            name="regionSlug"
            value={regionSlug}
            onChange={(e) => {
              setRegionSlug(e.target.value);
              setDepartmentSlug("");
            }}
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
            required
          >
            <option value="" disabled>
              —
            </option>
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.department}</span>
          <select
            name="departmentSlug"
            value={departmentSlug}
            onChange={(e) => setDepartmentSlug(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
            required
            disabled={!regionSlug}
          >
            <option value="" disabled>
              —
            </option>
            {departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.city}</span>
          <input name="city" type="text" className="w-full rounded-md border border-warm-200 bg-white px-3 py-2" />
        </label>
      </div>

      <div className={currentStep === "type" ? "" : "hidden"}>
        <h2 className="mb-4 font-serif text-2xl text-navy-900">{fr.estimationForm.steps.type}</h2>
        <div className="space-y-3">
          {TRANSACTION_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-3 rounded-md border border-warm-200 bg-white p-3">
              <input type="radio" name="transactionType" value={t} defaultChecked={t === "MURS_FONDS"} required />
              <span>{fr.estimationForm.transactionTypes[t]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={currentStep === "characteristics" ? "" : "hidden"}>
        <h2 className="mb-4 font-serif text-2xl text-navy-900">{fr.estimationForm.steps.characteristics}</h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.roomCount}</span>
          <input
            name="roomCount"
            type="number"
            min={1}
            max={2000}
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
            required
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.starRating}</span>
          <select
            name="starRating"
            value={starRating}
            onChange={(e) => setStarRating(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
            required
          >
            <option value="" disabled>
              —
            </option>
            {Object.entries(fr.estimationForm.starRatings).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input name="hasLicence4" type="checkbox" value="on" />
          <span className="text-sm text-navy-800">{fr.estimationForm.fields.hasLicence4}</span>
        </label>
      </div>

      <div className={currentStep === "financials" ? "" : "hidden"}>
        <h2 className="mb-2 font-serif text-2xl text-navy-900">{fr.estimationForm.steps.financials}</h2>
        <p className="mb-4 text-sm text-warm-700">{fr.estimationForm.financialsHint}</p>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.revenue}</span>
          <input name="revenue" type="number" min={0} className="w-full rounded-md border border-warm-200 bg-white px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.ebitda}</span>
          <input name="ebitda" type="number" className="w-full rounded-md border border-warm-200 bg-white px-3 py-2" />
        </label>
      </div>

      <div className={currentStep === "email" ? "" : "hidden"}>
        <h2 className="mb-4 font-serif text-2xl text-navy-900">{fr.estimationForm.steps.email}</h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.estimationForm.fields.email}</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
            required
          />
          {state.errors?.email && <p className="mt-1 text-sm text-red-700">{state.errors.email}</p>}
        </label>

        <fieldset className="mb-4">
          <legend className="mb-2 text-sm font-medium text-navy-800">{fr.estimationForm.fields.saleIntention}</legend>
          <div className="space-y-2">
            {SALE_INTENTIONS.map((intention) => (
              <label key={intention} className="flex items-center gap-3 rounded-md border border-warm-200 bg-white p-3">
                <input
                  type="radio"
                  name="saleIntention"
                  value={intention}
                  checked={saleIntention === intention}
                  onChange={() => setSaleIntention(intention)}
                  required
                />
                <span>{fr.estimationForm.saleIntentions[intention]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mb-6 flex items-start gap-2 text-sm text-navy-800">
          <input name="consentContact" type="checkbox" value="on" required className="mt-1" />
          <span>{fr.estimationForm.fields.consentContact}</span>
        </label>
        {state.errors?.consentContact && <p className="mb-4 text-sm text-red-700">{state.errors.consentContact}</p>}
        {state.message && <p className="mb-4 text-sm text-red-700">{state.message}</p>}
      </div>

      {stepError && <p className="mb-4 text-sm text-red-700">{stepError}</p>}

      <div className="mt-6 flex items-center justify-between">
        {stepIndex > 0 ? (
          <button type="button" onClick={goBack} className="rounded-md px-4 py-2 text-sm font-semibold text-navy-700">
            {fr.estimationForm.back}
          </button>
        ) : (
          <span />
        )}

        {stepIndex < STEP_KEYS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-warm-50 hover:bg-navy-800"
          >
            {fr.estimationForm.next}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {fr.estimationForm.submit}
          </button>
        )}
      </div>
    </form>
  );
}
