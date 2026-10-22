"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CAMPAIGN, CAMPAIGNS, EXTRA_MAX, SIZES, campaignStatus, canBack, formatWon, pledgeTotal, remainingStock, tierById, validatePledge, validateReward, type PledgeInput, type Size, type TierId } from "@/lib/funding";
import { createPledge } from "@/lib/fundingStore";
import { defaultAddress, formatAddress, saveAddress, type Address } from "@/lib/addressBook";
import { useAddressBook } from "@/lib/useAddressBook";
import AddressBook from "../AddressBook";
import AddressSearchButton from "../AddressSearchButton";
import { useFunding } from "@/lib/useFunding";
import { useAuthReady, useCurrentUser } from "@/lib/useCurrentUser";
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, HomeIcon, PencilIcon, ShieldIcon } from "../Icons";
import Modal from "../Modal";
import GoodsStage from "./GoodsStage";
import styles from "./Checkout.module.css";

const STEPS = ["리워드", "정보 입력", "확인·결제"] as const;

const SIZE_CHART: [Size, string, string][] = [
  ["S", "가슴 단면 52cm · 총장 68cm", "키 155~165cm"],
  ["M", "가슴 단면 55cm · 총장 71cm", "키 165~172cm"],
  ["L", "가슴 단면 58cm · 총장 74cm", "키 172~180cm"],
  ["XL", "가슴 단면 61cm · 총장 77cm", "키 180cm 이상"],
];

const emptyInput = (tierId: TierId): PledgeInput => ({
  tierId, sizes: [], extra: 0,
  name: "", phone: "", email: "", recipient: "", zipcode: "", address: "", addressDetail: "", memo: "",
  showOnWall: true, agreePrivacy: false, agreeMadeToOrder: false, agreeNews: false,
});

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}{required && <em aria-hidden="true"> *</em>}</span>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

export default function CheckoutFlow({ campaignId, initialTier }: { campaignId: string; initialTier: TierId | null }) {
  // 주소는 서버에서 이미 확인했다. 예시 캠페인도 개발 환경에서는 열리므로 전체에서 찾는다.
  const campaign = CAMPAIGNS.find((item) => item.id === campaignId) ?? CAMPAIGN;
  const campaignPath = `/funding/${campaign.id}`;
  const router = useRouter();
  const user = useCurrentUser();
  const ready = useAuthReady();
  const funding = useFunding(campaign);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [input, setInput] = useState<PledgeInput>(() => emptyInput(initialTier ?? "keyring"));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sizeChart, setSizeChart] = useState(false);
  const prefilled = useRef(false);
  const book = useAddressBook(user?.id);
  // 저장된 배송지에서 고른 것. null이면 칸에 직접 입력한다.
  const [addressId, setAddressId] = useState<string | null>(null);
  // 저장된 배송지를 이번 후원에만 고쳐 쓰는 중인지
  const [editingOnce, setEditingOnce] = useState(false);
  const [saveToBook, setSaveToBook] = useState(true);
  const [picking, setPicking] = useState(false);
  const pickRef = useRef<HTMLButtonElement>(null);
  const autoPicked = useRef(false);
  const selectedAddress = book.find((item) => item.id === addressId) ?? null;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formId = useId();

  const tier = tierById(input.tierId, campaign)!;
  const total = pledgeTotal(tier, input.extra);
  const status = campaignStatus(campaign, funding.raised, new Date());
  const open = canBack(status);

  // 로그인했다면 이메일과 이름(닉네임)을 한 번만 채워 둔다. 고쳐 쓴 값은 덮어쓰지 않는다.
  useEffect(() => {
    if (!ready || !user || prefilled.current) return;
    prefilled.current = true;
    setInput((current) => ({ ...current, email: current.email || user.email, name: current.name || user.nickname }));
  }, [ready, user]);

  const applyAddress = (item: Address) => {
    setAddressId(item.id);
    setEditingOnce(false);
    setInput((current) => ({ ...current, recipient: item.recipient, phone: item.phone, zipcode: item.zipcode, address: item.address, addressDetail: item.detail, memo: item.memo }));
    setError(null);
  };

  // 로그인했고 저장된 배송지가 있으면 기본 배송지를 한 번 골라 둔다.
  useEffect(() => {
    if (autoPicked.current || !user || book.length === 0) return;
    autoPicked.current = true;
    const item = defaultAddress(book);
    if (item) applyAddress(item);
  }, [user, book]);

  // 단계가 바뀌면 제목으로 포커스를 옮겨 화면 읽기 프로그램이 새 단계를 읽게 한다. 첫 화면에서는 옮기지 않는다.
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const update = <K extends keyof PledgeInput>(key: K, value: PledgeInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const go = (next: number) => {
    setDirection(next > step ? "next" : "prev");
    setStep(next);
    setError(null);
  };

  const submitStep = (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const problem = step === 0 ? validateReward(input, campaign) : validatePledge(input, campaign);
    if (problem) { setError(problem); return; }
    if (step < 2) go(step + 1);
    else setPaying(true);
  };

  const pay = async () => {
    setSubmitting(true);
    try {
      const pledge = await createPledge(input, user?.id ?? null, campaign);
      // 처음 입력한 배송지를 저장하겠다고 했으면 주소록에 넣는다. 실패해도 후원은 이미 끝났으므로 넘어간다.
      if (user && tier.needsShipping && !addressId && saveToBook) {
        try {
          saveAddress(user.id, { label: "집", recipient: input.recipient || input.name, phone: input.phone, zipcode: input.zipcode, address: input.address, detail: input.addressDetail, memo: input.memo, isDefault: book.length === 0 });
        } catch { /* 주소록이 가득 찼거나 저장 공간 문제 */ }
      }
      router.push(`/funding/complete/${encodeURIComponent(pledge.no)}`);
    } catch (problem) {
      setPaying(false);
      setSubmitting(false);
      setError(problem instanceof Error ? problem.message : "후원을 처리하지 못했어요.");
    }
  };

  // 결제창을 닫거나 실패하면 입력값을 그대로 두고 정보 입력 단계로 돌아간다.
  const cancelPayment = () => {
    setPaying(false);
    go(1);
    setNotice("결제가 취소됐어요. 입력한 내용은 그대로 남아 있어요.");
  };

  if (!open) {
    return (
      <div className={`page-container ${styles.closed}`}>
        <h1>지금은 후원할 수 없어요</h1>
        <p>{status === "upcoming" ? "펀딩이 아직 열리지 않았어요." : "펀딩이 마감됐어요."}</p>
        <Link href={campaignPath} className={styles.primary}>펀딩 페이지로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={`page-container ${styles.layout}`}>
      <div className={styles.main}>
        <Link href={campaignPath} className={styles.back}><ChevronLeftIcon size={18} />{campaign.child.name}님을 기억하는 펀딩</Link>
        <ol className={styles.stepper} aria-label="후원 단계">
          {STEPS.map((label, index) => (
            <li key={label} data-state={index < step ? "done" : index === step ? "current" : "todo"} aria-current={index === step ? "step" : undefined}>
              <span className={styles.stepDot}>{index < step ? <CheckIcon size={14} strokeWidth={2.6} /> : index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>

        <form id={formId} onSubmit={submitStep} noValidate>
          <div key={step} className={styles.panel} data-direction={direction}>
            <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
              {step === 0 ? "어떤 리워드로 함께할까요?" : step === 1 ? "후원 정보를 입력해 주세요" : "후원 내용을 확인해 주세요"}
            </h1>
            {notice && <p role="status" className={styles.notice}>{notice}</p>}

            {step === 0 && (
              <>
                <fieldset className={styles.tiers}>
                  <legend className="sr-only">리워드</legend>
                  {campaign.tiers.map((item) => {
                    const left = remainingStock(item, funding.sold[item.id] ?? 0);
                    const soldOut = left === 0;
                    return (
                      <label key={item.id} className={styles.tier} data-checked={item.id === input.tierId} data-disabled={soldOut}>
                        <input type="radio" name="tier" value={item.id} checked={item.id === input.tierId} disabled={soldOut}
                          onChange={() => setInput((current) => ({ ...current, tierId: item.id, sizes: current.sizes.slice(0, item.sizeCount) }))} />
                        <GoodsStage kinds={item.stage} label="" idPrefix={`tier-${item.id}`} still className={styles.tierStage} />
                        <span className={styles.tierText}>
                          <strong>{formatWon(item.price)}</strong>
                          <span className={styles.tierName}>{item.title}</span>
                          <span className={styles.tierSummary}>{item.summary}</span>
                          {left !== null && <span className={styles.tierLeft}>{soldOut ? "마감" : `${left}개 남음`}</span>}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                {tier.sizeCount > 0 && (
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <h2>사이즈</h2>
                      <button type="button" onClick={() => setSizeChart(true)} className={styles.textButton}>사이즈표 보기</button>
                    </div>
                    <div className={styles.sizes}>
                      {Array.from({ length: tier.sizeCount }, (_, index) => (
                        <Field key={index} label={tier.id === "family" ? (index === 0 ? "후드" : `티셔츠 ${index}`) : tier.id === "hoodie" ? "후드" : "티셔츠"} required>
                          <select value={input.sizes[index] ?? ""} onChange={(event) => { const sizes = [...input.sizes]; sizes[index] = event.target.value as Size; update("sizes", sizes); }} className={styles.input}>
                            <option value="" disabled>선택</option>
                            {SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                          </select>
                        </Field>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.block}>
                  <h2>추가 후원금 <span className={styles.optional}>선택</span></h2>
                  <p className={styles.blockLead}>리워드 없이 금액만 더 보탤 수 있어요.</p>
                  <div className={styles.extra}>
                    <input type="number" inputMode="numeric" min={0} max={EXTRA_MAX} step={1000} value={input.extra || ""} placeholder="0"
                      onChange={(event) => update("extra", Number(event.target.value) || 0)} aria-label="추가 후원금(원)" className={styles.input} />
                    <span>원</span>
                    {[1000, 5000, 10000].map((amount) => (
                      <button key={amount} type="button" onClick={() => update("extra", Math.min(EXTRA_MAX, input.extra + amount))} className={styles.quick}>+{amount.toLocaleString("ko-KR")}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                {!user && ready && (
                  <p className={styles.loginHint}>
                    로그인 없이도 후원할 수 있어요. <Link href={`/login?next=${encodeURIComponent(`${campaignPath}/checkout`)}`}>로그인</Link>하면 마이페이지에서 후원 내역을 보고 취소할 수 있어요.
                  </p>
                )}
                <div className={styles.block}>
                  <h2>후원자</h2>
                  <div className={styles.grid}>
                    <Field label="이름" required><input value={input.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" className={styles.input} /></Field>
                    <Field label="이메일" required hint="후원번호와 결과 소식을 보내드려요."><input type="email" value={input.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" className={styles.input} /></Field>
                  </div>
                </div>

                {tier.needsShipping ? (
                  <div className={styles.block}>
                    <div className={styles.blockHead}>
                      <h2>배송지</h2>
                      {user && book.length > 0 && <button ref={pickRef} type="button" onClick={() => setPicking(true)} className={styles.textButton}>배송지 변경</button>}
                    </div>
                    {selectedAddress && !editingOnce ? (
                      <div className={styles.addressCard}>
                        <HomeIcon size={20} className={styles.addressIcon} />
                        <div className={styles.addressText}>
                          <p><strong>{selectedAddress.label}</strong>{selectedAddress.isDefault && <span className={styles.addressDefault}>기본</span>}</p>
                          <p>{input.recipient} · {input.phone}</p>
                          <p className={styles.addressLine}>{formatAddress({ zipcode: input.zipcode, address: input.address, detail: input.addressDetail })}</p>
                          {input.memo && <p className={styles.addressMemo}>메모: {input.memo}</p>}
                        </div>
                        <button type="button" onClick={() => setEditingOnce(true)} className={styles.addressEdit}><PencilIcon size={14} />이번만 수정</button>
                      </div>
                    ) : (
                      <>
                        {editingOnce && selectedAddress && (
                          <p className={styles.onceNote}>
                            이번 후원에만 반영돼요. 저장된 &lsquo;{selectedAddress.label}&rsquo; 배송지는 그대로예요.
                            <button type="button" onClick={() => applyAddress(selectedAddress)} className={styles.textButton}>되돌리기</button>
                          </p>
                        )}
                        <div className={styles.grid}>
                          <Field label="받는 분" required><input value={input.recipient} onChange={(event) => update("recipient", event.target.value)} autoComplete="name" placeholder={input.name || "받는 분 이름"} className={styles.input} /></Field>
                          <Field label="휴대폰" required hint="배송 연락에만 써요."><input type="tel" value={input.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" placeholder="010-0000-0000" className={styles.input} /></Field>
                        </div>
                        <div className={styles.addressSearch}>
                          <input aria-label="우편번호" value={input.zipcode} readOnly placeholder="우편번호" className={`${styles.input} ${styles.zipcode}`} />
                          <AddressSearchButton onSelect={({ zipcode, address }) => { setInput((current) => ({ ...current, zipcode, address })); setError(null); document.getElementById(`${formId}-detail`)?.focus(); }} />
                        </div>
                        <div className={styles.grid}>
                          <Field label="주소" required><input value={input.address} onChange={(event) => update("address", event.target.value)} autoComplete="street-address" placeholder="주소 검색을 누르거나 직접 입력" className={styles.input} /></Field>
                          <Field label="상세 주소"><input id={`${formId}-detail`} value={input.addressDetail} onChange={(event) => update("addressDetail", event.target.value)} placeholder="동·호수" className={styles.input} /></Field>
                          <Field label="배송 메모"><input value={input.memo} onChange={(event) => update("memo", event.target.value)} maxLength={50} placeholder="예: 문 앞에 놓아 주세요" className={styles.input} /></Field>
                        </div>
                        {user && !selectedAddress && (
                          <label className={styles.check}>
                            <input type="checkbox" checked={saveToBook} onChange={(event) => setSaveToBook(event.target.checked)} />
                            <span>이 배송지를 내 배송지에 저장하기 (선택) <small>다음 후원부터 자동으로 채워져요. 마이페이지 &gt; 계정에서 언제든 지울 수 있어요.</small></span>
                          </label>
                        )}
                      </>
                    )}
                  </div>
) : (
                  <p className={styles.noShipping}><CheckIcon size={16} />응원 리워드는 배송이 없어 주소를 묻지 않아요.</p>
                )}

                <div className={styles.block}>
                  <label className={styles.check}>
                    <input type="checkbox" checked={input.showOnWall} onChange={(event) => update("showOnWall", event.target.checked)} />
                    <span>후원자 벽에 이름 보이기 <small>끄면 후원자 벽에 나오지 않아요.</small></span>
                  </label>
                </div>

                <div className={styles.block}>
                  <h2>동의</h2>
                  <label className={styles.check}>
                    <input type="checkbox" checked={input.agreePrivacy} onChange={(event) => update("agreePrivacy", event.target.checked)} />
                    <span><strong>[필수]</strong> 개인정보 수집·이용 <small>이름·이메일{tier.needsShipping ? "·휴대폰·배송지" : ""}를 후원 처리와 배송에만 쓰고, 배송이 끝나면 파기해요.</small></span>
                  </label>
                  {tier.needsShipping && (
                    <div className={styles.madeToOrder}>
                      <p><ShieldIcon size={16} /><strong>주문 제작 상품 안내</strong></p>
                      <p>이 리워드는 펀딩이 끝난 뒤 후원 수량만큼 만드는 주문 제작 상품이에요. <strong>마감 전까지는 언제든 전액 취소</strong>할 수 있지만, <strong>마감 후에는 단순 변심으로 취소할 수 없어요.</strong> 불량·오배송은 교환하거나 환불해요.</p>
                      <label className={styles.check}>
                        <input type="checkbox" checked={input.agreeMadeToOrder} onChange={(event) => update("agreeMadeToOrder", event.target.checked)} />
                        <span><strong>[필수]</strong> 위 취소 제한을 확인했어요</span>
                      </label>
                    </div>
                  )}
                  <label className={styles.check}>
                    <input type="checkbox" checked={input.agreeNews} onChange={(event) => update("agreeNews", event.target.checked)} />
                    <span>[선택] 결과 공개와 다음 펀딩 소식 받기</span>
                  </label>
                </div>
              </>
            )}

            {step === 2 && (
              <div className={styles.review}>
                <dl>
                  <div><dt>리워드</dt><dd>{tier.title} · {formatWon(tier.price)}{input.sizes.length > 0 && ` · 사이즈 ${input.sizes.join(", ")}`}</dd></div>
                  {input.extra > 0 && <div><dt>추가 후원금</dt><dd>{formatWon(input.extra)}</dd></div>}
                  <div><dt>후원자</dt><dd>{input.name} · {input.email}</dd></div>
                  {tier.needsShipping && <div><dt>배송지</dt><dd>{input.recipient || input.name} · {input.phone}<br />{formatAddress({ zipcode: input.zipcode, address: input.address, detail: input.addressDetail })}{input.memo && ` · ${input.memo}`}</dd></div>}
                  <div><dt>후원자 벽</dt><dd>{input.showOnWall ? "이름 보이기" : "보이지 않기"}</dd></div>
                </dl>
                <p className={styles.reviewNote}>
                  지금 결제되고, 목표 {formatWon(campaign.goal)}에 닿지 못하면 마감 다음 날 전액 취소돼요. {tier.needsShipping ? campaign.deliveryNote : "감사 카드는 이메일로 바로 보내드려요"}.
                </p>
              </div>
            )}

            {error && <p role="alert" className={styles.error}>{error}</p>}
          </div>
        </form>
      </div>

      <aside className={styles.summary} aria-label="주문 요약">
        <div className={styles.summaryInner}>
          <GoodsStage kinds={tier.stage} label={`${tier.title} 구성`} idPrefix="checkout-summary" className={styles.summaryStage} />
          <p className={styles.summaryCampaign}>{campaign.child.name}님을 기억하는 {campaign.title}</p>
          <p className={styles.summaryTier}>{tier.title}</p>
          <ul className={styles.summaryItems}>{tier.items.map((item) => <li key={item}>{item}</li>)}</ul>
          <dl className={styles.summaryTotal}>
            <div><dt>리워드</dt><dd>{formatWon(tier.price)}</dd></div>
            {input.extra > 0 && <div><dt>추가 후원금</dt><dd>{formatWon(input.extra)}</dd></div>}
            <div><dt>배송비</dt><dd>무료</dd></div>
            <div className={styles.summarySum}><dt>최종 후원 금액</dt><dd>{formatWon(total)}</dd></div>
          </dl>
          <div className={styles.actions}>
            {step > 0 && <button type="button" onClick={() => go(step - 1)} className={styles.secondary}>이전</button>}
            <button type="submit" form={formId} className={styles.primary}>
              {step < 2 ? <>다음 <ArrowRightIcon size={16} /></> : <>{formatWon(total)} 결제하기</>}
            </button>
          </div>
          <p className={styles.summaryNote}>결제 연동 전 데모예요. 실제로 결제되지 않아요.</p>
        </div>
      </aside>

      {picking && user && (
        <Modal title="배송지 선택" onClose={() => setPicking(false)} returnFocusTo={pickRef.current}>
          <AddressBook userId={user.id} mode="pick" selectedId={addressId} onPick={(item) => { applyAddress(item); setPicking(false); }} />
        </Modal>
      )}

      {sizeChart && (
        <Modal title="사이즈표" onClose={() => setSizeChart(false)}>
          <table className={styles.sizeTable}>
            <thead><tr><th scope="col">사이즈</th><th scope="col">실측</th><th scope="col">추천</th></tr></thead>
            <tbody>{SIZE_CHART.map(([size, measure, fit]) => <tr key={size}><th scope="row">{size}</th><td>{measure}</td><td>{fit}</td></tr>)}</tbody>
          </table>
          <p className={styles.fieldHint}>샘플 기준 예시 값이에요. 제작 견적 후 확정해요.</p>
        </Modal>
      )}

      {paying && (
        <Modal title="결제" onClose={cancelPayment}>
          <p className={styles.payLead}>결제 대행사(PG) 결제창이 열리는 자리예요.</p>
          <p className={styles.payAmount}>{formatWon(total)}</p>
          <p className={styles.fieldHint}>결제 연동 전 데모라 실제로 결제되지 않아요. 아래 버튼으로 결과를 골라 흐름을 확인할 수 있어요.</p>
          <div className={styles.payActions}>
            <button type="button" onClick={cancelPayment} className={styles.secondary} disabled={submitting}>결제 취소</button>
            <button type="button" onClick={pay} className={styles.primary} data-autofocus disabled={submitting}>{submitting ? "처리 중…" : "결제 완료로 진행"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
