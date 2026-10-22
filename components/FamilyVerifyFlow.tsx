"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { RELATIONS, VERIFY_STEPS, emptyDraft, getFamilyRecord, submitFamilyRequest, validateStep, type FamilyDraft } from "@/lib/familyVerification";
import type { MissingPerson } from "@/lib/types";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";
import { KeptTable } from "./AccountSettings";
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, PhoneIcon, SearchIcon, ShieldIcon } from "./Icons";
import LoginRequired from "./LoginRequired";
import Modal from "./Modal";
import styles from "./funding/Checkout.module.css";
import verify from "./FamilyVerifyFlow.module.css";

/** 실종아동 검색 결과에 쓰는 최소 정보 (서버에서 넘겨준다) */
export type ChildOption = Pick<MissingPerson, "id" | "sourceId" | "name" | "missingDate" | "missingLocation" | "ageAtMissing" | "gender">;

const TITLES = [
  "휴대폰으로 본인확인을 해 주세요",
  "아이와의 관계를 증명해 주세요",
  "찾고 있는 아이를 알려 주세요",
  "확인 방법에 동의해 주세요",
];

/** 휴대폰 본인확인 모의 창. 실제로는 PASS 등 본인확인기관 창이 열리고 이름·생년월일·연계정보(CI)만 돌려받는다. */
function IdentityModal({ onDone, onClose, returnFocusTo }: { onDone: (name: string, birth: string) => void; onClose: () => void; returnFocusTo: HTMLElement | null }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal title="휴대폰 본인확인" onClose={onClose} returnFocusTo={returnFocusTo}>
      <p className={verify.mockNote}>데모 · 실제 서비스에서는 본인확인기관(PASS 등) 창이 열려요. FindUs는 이름·생년월일과 연계정보만 받아요.</p>
      <div className="mt-4 flex flex-col gap-3">
        <label className={styles.field}><span className={styles.fieldLabel}>이름</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={styles.input} data-autofocus /></label>
        <label className={styles.field}><span className={styles.fieldLabel}>생년월일</span><input type="date" value={birth} onChange={(event) => setBirth(event.target.value)} className={styles.input} /></label>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.payActions}>
        <button type="button" onClick={onClose} className={styles.secondary}>취소</button>
        <button type="button" onClick={() => { if (!name.trim() || !birth) { setError("이름과 생년월일을 입력해 주세요."); return; } onDone(name.trim(), birth); }} className={styles.primary}>인증 완료</button>
      </div>
    </Modal>
  );
}

export default function FamilyVerifyFlow({ options }: { options: ChildOption[] }) {
  const router = useRouter();
  const user = useCurrentUser();
  const ready = useAuthReady();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [draft, setDraft] = useState<FamilyDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const identityRef = useRef<HTMLButtonElement>(null);
  const fileId = useId();

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return options.filter((child) => child.name.includes(q) || child.missingLocation.includes(q)).slice(0, 8);
  }, [options, query]);

  if (!ready) return <p role="status" className="page-container py-24 text-center text-muted">화면을 준비하고 있어요.</p>;
  if (!user) return <div className="page-container max-w-xl py-16"><LoginRequired message="가족 인증은 로그인한 뒤 신청할 수 있어요." /></div>;

  const existing = getFamilyRecord(user.id);
  if (existing && (existing.status === "reviewing" || existing.status === "verified")) {
    return (
      <div className={`page-container ${styles.closed}`}>
        <h1>이미 신청한 가족 인증이 있어요</h1>
        <p>진행 상황은 마이페이지 &gt; 계정에서 확인할 수 있어요.</p>
        <Link href="/mypage?tab=account" className={styles.primary}>마이페이지로</Link>
      </div>
    );
  }

  const set = <K extends keyof FamilyDraft>(key: K, value: FamilyDraft[K]) => { setDraft((current) => ({ ...current, [key]: value })); setError(null); };
  const go = (next: number) => { setDirection(next > step ? "next" : "prev"); setStep(next); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateStep(step, draft);
    if (problem) { setError(problem); return; }
    if (step < VERIFY_STEPS.length - 1) { go(step + 1); return; }
    setSubmitting(true);
    try {
      await submitFamilyRequest(user.id, draft);
      router.push("/mypage?tab=account");
    } catch (problem) {
      setSubmitting(false);
      setError(problem instanceof Error ? problem.message : "신청하지 못했어요.");
    }
  };

  const selected = options.find((child) => child.sourceId === draft.childSourceId);

  return (
    <div className={`page-container ${verify.layout}`}>
      <Link href="/mypage?tab=account" className={styles.back}><ChevronLeftIcon size={18} />마이페이지 · 계정</Link>
      <p className={verify.eyebrow}><ShieldIcon size={15} />실종아동 가족 인증</p>
      <ol className={styles.stepper} aria-label="가족 인증 단계">
        {VERIFY_STEPS.map((label, index) => (
          <li key={label} data-state={index < step ? "done" : index === step ? "current" : "todo"} aria-current={index === step ? "step" : undefined}>
            <span className={styles.stepDot}>{index < step ? <CheckIcon size={14} strokeWidth={2.6} /> : index + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      {existing?.status === "needs_more" && step === 0 && <p className={styles.notice}>보완 요청: {existing.note}</p>}

      <form onSubmit={submit} noValidate>
        <div key={step} className={styles.panel} data-direction={direction}>
          <h1 className={styles.title}>{TITLES[step]}</h1>

          {step === 0 && (
            <div className={styles.block}>
              <p className={verify.lead}>다른 사람이 가족을 사칭하지 못하도록, 신청하는 분이 누구인지 먼저 확인해요. 주민등록번호는 받지 않아요.</p>
              {draft.identity ? (
                <div className={verify.done}><CheckIcon size={18} strokeWidth={2.6} /><span><strong>{draft.identity.name}</strong> · {draft.identity.birth} 본인확인 완료</span>
                  <button type="button" onClick={() => set("identity", null)} className={styles.textButton}>다시 하기</button></div>
              ) : (
                <button ref={identityRef} type="button" onClick={() => setIdentityOpen(true)} className={verify.bigButton}><PhoneIcon size={20} />휴대폰 본인확인 (PASS)</button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className={styles.block}>
              <p className={verify.lead}><strong>가족관계증명서(특정증명서)</strong>를 <strong>주민등록번호 뒷자리를 가린 채</strong> 발급해 제출해 주세요. 정부24에서 발급할 때 &lsquo;주민등록번호 뒷자리 비공개&rsquo;를 고를 수 있어요.</p>
              <div className={verify.options}>
                <div className={verify.option} data-checked={draft.document?.method === "gov24"}>
                  <p className={verify.optionTitle}>정부24 전자증명서로 제출 <span className={verify.recommend}>추천</span></p>
                  <p className={verify.optionText}>진본 확인이 되는 전자문서라 위변조 걱정이 없고, 확인이 빨라요.</p>
                  <button type="button" onClick={() => set("document", { method: "gov24", fileName: "가족관계증명서(특정) · 정부24 전자증명서", masked: true })} className={styles.secondary}>
                    {draft.document?.method === "gov24" ? <><CheckIcon size={15} />불러왔어요</> : "정부24에서 불러오기 (데모)"}
                  </button>
                </div>
                <div className={verify.option} data-checked={draft.document?.method === "pdf"}>
                  <p className={verify.optionTitle}>파일로 올리기</p>
                  <p className={verify.optionText}>PDF·이미지. 확인이 끝나면 바로, 늦어도 30일 안에 파기해요.</p>
                  <label htmlFor={fileId} className={styles.secondary}>파일 고르기</label>
                  <input id={fileId} type="file" accept=".pdf,image/*" className="sr-only"
                    onChange={(event) => { const file = event.target.files?.[0]; if (file) set("document", { method: "pdf", fileName: file.name, masked: false }); }} />
                  {draft.document?.method === "pdf" && (
                    <>
                      <p className={verify.fileName}>{draft.document.fileName}</p>
                      <label className={styles.check}>
                        <input type="checkbox" checked={draft.document.masked} onChange={(event) => set("document", { ...draft.document!, masked: event.target.checked })} />
                        <span>주민등록번호 뒷자리가 가려진 서류예요</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
              <p className={verify.never}><ShieldIcon size={15} />DNA·유전정보와 주민등록번호 전체는 어떤 경우에도 받지 않아요.</p>
            </div>
          )}

          {step === 2 && (
            <>
              <div className={styles.block}>
                <h2>찾고 있는 아이</h2>
                <p className={styles.blockLead}>안전Dream에 공개된 실종아동 중에서 골라 주세요. 이름이나 실종 장소로 찾을 수 있어요.</p>
                {selected ? (
                  <div className={verify.done}><CheckIcon size={18} strokeWidth={2.6} /><span><strong>{selected.name}</strong> · {formatDate(selected.missingDate)} · {selected.missingLocation}</span>
                    <button type="button" onClick={() => setDraft((current) => ({ ...current, childSourceId: "", childPersonId: "", childName: "" }))} className={styles.textButton}>다시 고르기</button></div>
                ) : (
                  <>
                    <div className={verify.search}>
                      <SearchIcon size={18} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 최준원, 중랑구" aria-label="실종아동 검색" />
                    </div>
                    {query.trim() && (
                      <ul className={verify.results}>
                        {results.length === 0 ? <li className={verify.empty}>찾지 못했어요. 공개되지 않은 아이라면 182에 먼저 공개 여부를 문의해 주세요.</li> : results.map((child) => (
                          <li key={child.id}>
                            <button type="button" onClick={() => setDraft((current) => ({ ...current, childSourceId: child.sourceId ?? child.id, childPersonId: child.id, childName: child.name }))}>
                              <strong>{child.name}</strong>
                              <span>{formatDate(child.missingDate)} · {child.missingLocation} · 당시 {child.ageAtMissing ?? "?"}세</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              <fieldset className={styles.block}>
                <legend className="text-[17px] font-extrabold">아이와의 관계</legend>
                <div className={verify.relations}>
                  {RELATIONS.map((item) => (
                    <label key={item.id} className={verify.relation} data-checked={draft.relation === item.id}>
                      <input type="radio" name="relation" checked={draft.relation === item.id} onChange={() => set("relation", item.id)} />{item.label}
                    </label>
                  ))}
                </div>
                <p className={styles.fieldHint}>실종아동법의 보호자(친권자·후견인·법률상 보호 의무가 있는 사람)만 신청할 수 있어요.</p>
              </fieldset>
              <div className={styles.block}>
                <h2>신고 정보 <span className={styles.optional}>아는 만큼</span></h2>
                <div className={styles.grid}>
                  <label className={styles.field}><span className={styles.fieldLabel}>신고한 경찰서</span><input value={draft.reportOffice} onChange={(event) => set("reportOffice", event.target.value)} placeholder="예: 중랑경찰서" className={styles.input} /></label>
                  <label className={styles.field}><span className={styles.fieldLabel}>신고 연도</span><input inputMode="numeric" maxLength={4} value={draft.reportYear} onChange={(event) => set("reportYear", event.target.value.replace(/\D/g, ""))} placeholder="예: 2000" className={styles.input} /></label>
                </div>
                <p className={styles.fieldHint}>기관에 확인을 요청할 때 함께 전달해요.</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.block}>
                <h2>이렇게 확인해요</h2>
                <ol className={verify.howList}>
                  <li><strong>서류 확인</strong> 가족관계증명서의 이름과 본인확인 결과를 맞춰 봐요.</li>
                  <li><strong>기관 확인</strong> 아동권리보장원 실종아동전문센터·관할 경찰서에 보호자가 맞는지 확인을 요청해요.</li>
                  <li><strong>결과 안내</strong> 보통 5~10일(영업일) 걸리고, 마이페이지와 이메일로 알려 드려요. [가정]</li>
                  <li><strong>서류 파기</strong> 확인이 끝나면 원본을 바로 파기하고, 1년마다 다시 확인해요.</li>
                </ol>
                <KeptTable />
              </div>
              <div className={styles.block}>
                <h2>동의</h2>
                <label className={styles.check}>
                  <input type="checkbox" checked={draft.agreeAgencyCheck} onChange={(event) => set("agreeAgencyCheck", event.target.checked)} />
                  <span><strong>[필수]</strong> 기관 확인 문의 <small>아동권리보장원·관할 경찰서에 아이 관리번호·신청인 이름·관계를 전달해 보호자인지 확인하는 데 동의해요.</small></span>
                </label>
                <label className={styles.check}>
                  <input type="checkbox" checked={draft.agreeDestroy} onChange={(event) => set("agreeDestroy", event.target.checked)} />
                  <span><strong>[필수]</strong> 서류 보관·파기 안내 확인 <small>제출한 서류는 확인에만 쓰고, 확인이 끝나면 바로(늦어도 30일 안에) 파기해요.</small></span>
                </label>
                <label className={styles.check}>
                  <input type="checkbox" checked={draft.agreeContact} onChange={(event) => set("agreeContact", event.target.checked)} />
                  <span>[선택] 아이를 기억하는 펀딩이 준비되면 연락 받기</span>
                </label>
              </div>
            </>
          )}

          {error && <p role="alert" className={styles.error}>{error}</p>}
          <div className={verify.actions}>
            {step > 0 && <button type="button" onClick={() => go(step - 1)} className={styles.secondary}>이전</button>}
            <button type="submit" disabled={submitting} className={styles.primary}>
              {step < VERIFY_STEPS.length - 1 ? <>다음 <ArrowRightIcon size={16} /></> : submitting ? "신청하는 중…" : "인증 신청하기"}
            </button>
          </div>
        </div>
      </form>

      {identityOpen && (
        <IdentityModal returnFocusTo={identityRef.current} onClose={() => setIdentityOpen(false)}
          onDone={(name, birth) => { set("identity", { name, birth, verifiedAt: new Date().toISOString() }); setIdentityOpen(false); }} />
      )}
    </div>
  );
}
