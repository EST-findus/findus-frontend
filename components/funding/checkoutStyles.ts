// 후원 단계(CheckoutFlow)·후원 완료(PledgeComplete)·가족 인증(FamilyVerifyFlow)이 함께 쓰는 클래스 묶음

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand";

export const back = `inline-flex items-center gap-1 text-[14px] font-bold text-muted hover:text-brand ${focusRing}`;

export const stepper = "mt-5 flex gap-2";
export const stepItem =
  "group relative flex flex-1 items-center gap-2 pb-3 text-[14px] font-bold text-subtle data-[state=current]:text-navy data-[state=done]:text-navy " +
  "after:absolute after:inset-x-0 after:top-auto after:bottom-0 after:h-[3px] after:rounded-[3px] after:bg-line after:content-[''] " +
  "data-[state=current]:after:origin-left data-[state=current]:after:animate-checkout-grow data-[state=current]:after:bg-brand " +
  "data-[state=done]:after:origin-left data-[state=done]:after:animate-checkout-grow data-[state=done]:after:bg-brand " +
  "motion-reduce:after:animate-none! max-sm:flex-col max-sm:items-start max-sm:gap-1 max-sm:text-[12px]";
export const stepDot =
  "grid size-[26px] place-items-center rounded-full bg-line text-[13px] text-white group-data-[state=current]:bg-navy group-data-[state=done]:bg-brand";

export const panel = "animate-checkout-slide-next data-[direction=prev]:animate-checkout-slide-prev motion-reduce:animate-none!";
export const title = "mt-7 text-[26px] font-extrabold tracking-[-0.5px] outline-none max-sm:text-[22px]";
export const notice = "mt-3 rounded-[10px] bg-brand-soft px-3.5 py-3 text-[14px] text-navy";
export const error = "mt-4 rounded-[10px] bg-red-soft px-3.5 py-3 text-[14px] font-bold text-red-dark";

export const block = "mt-7 [&_h2]:text-[17px] [&_h2]:font-extrabold";
export const blockLead = "mt-1 text-[13px] text-muted";
export const optional = "ml-1 text-[13px] font-semibold text-subtle";
export const textButton = `text-[13px] font-bold text-brand underline underline-offset-3 ${focusRing}`;

export const grid = "mt-3 grid grid-cols-2 gap-3.5 max-sm:grid-cols-[1fr]";
export const field = "flex flex-col gap-1.5";
export const fieldLabel = "text-[13px] font-bold";
export const fieldHint = "text-[12px] leading-[1.5] text-subtle";
/** 입력칸 공통. 너비·배경은 쓰는 곳에서 정한다. */
export const inputBase =
  "min-h-[46px] rounded-[10px] border border-line px-3.5 py-0 text-[15px] [transition:border-color_.2s,box-shadow_.2s] focus:border-brand focus:shadow-[0_0_0_3px_rgb(57_120_184/15%)] focus:outline-none";
export const input = `${inputBase} w-full bg-white`;

export const check =
  "mt-3 flex cursor-pointer items-start gap-2.5 text-[14px] leading-[1.55] [&_input]:mt-0.5 [&_input]:size-[18px] [&_input]:shrink-0 [&_input]:accent-brand [&_small]:block [&_small]:text-[12px] [&_small]:text-muted";

const button = "inline-flex min-h-[50px] items-center justify-center gap-1.5 rounded-xl px-[18px] disabled:cursor-wait disabled:opacity-60";
export const primary = `${button} bg-brand text-[15px] font-extrabold text-white [transition:background-color_.2s] hover:bg-navy ${focusRing}`;
export const secondary = `${button} border border-line bg-white text-[14px] font-bold hover:border-brand hover:text-brand ${focusRing}`;
export const payActions = "mt-5 grid grid-cols-[auto_1fr] gap-2";

export const closed = "py-24 text-center [&_h1]:text-[24px] [&_h1]:font-extrabold [&_p]:mt-2.5 [&_p]:mb-6 [&_p]:text-muted";

/* ───────── 후원 단계(CheckoutFlow) ───────── */
export const layout = "grid grid-cols-[minmax(0,1fr)_340px] gap-10 pt-7 pb-[72px] max-lg:grid-cols-[1fr] max-lg:gap-0 max-lg:pb-0";
export const main = "min-w-0 max-lg:pb-7";

export const tiers = "mt-5 grid grid-cols-2 gap-2.5 max-sm:grid-cols-[1fr]";
export const tier =
  "relative flex cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] border-line bg-white p-3.5 [transition:border-color_.2s,box-shadow_.2s,translate_.2s] hover:border-[#9DBCE6] " +
  "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand " +
  "data-[checked=true]:-translate-y-px data-[checked=true]:border-navy data-[checked=true]:shadow-[0_0_0_1px_var(--color-navy),0_8px_20px_rgb(23_59_112/10%)] " +
  "data-[checked=true]:after:absolute data-[checked=true]:after:top-2.5 data-[checked=true]:after:right-3 data-[checked=true]:after:grid data-[checked=true]:after:size-5 data-[checked=true]:after:place-items-center data-[checked=true]:after:rounded-full data-[checked=true]:after:bg-navy data-[checked=true]:after:text-[12px] data-[checked=true]:after:font-extrabold data-[checked=true]:after:text-white data-[checked=true]:after:content-['✓'] " +
  "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 motion-reduce:transition-none motion-reduce:translate-none!";
export const tierInput = "absolute opacity-0";
export const tierStage = "w-[86px] shrink-0";
export const tierText = "flex min-w-0 flex-col gap-0.5";
export const tierPrice = "text-[17px] font-extrabold text-navy";
export const tierName = "text-[14px] font-bold";
export const tierSummary = "text-[12px] leading-[1.5] break-keep text-muted";
export const tierLeft = "text-[12px] font-extrabold text-coral-ink";

export const blockHead = "flex items-center justify-between";
export const required = "not-italic text-coral-ink";
export const sizes = "mt-3 grid grid-cols-3 gap-2.5 max-sm:grid-cols-2";
export const extra = "mt-2.5 flex flex-wrap items-center gap-2";
export const extraInput = `${inputBase} w-[160px] bg-white text-right`;
export const quick = `rounded-full border border-line bg-white px-3 py-[9px] text-[13px] font-bold hover:border-brand hover:text-brand ${focusRing}`;

/* 저장된 배송지 요약 카드 */
export const addressCard =
  "mt-3 flex animate-[checkout-slide-next_.35s_ease] items-start gap-3 rounded-[14px] border-[1.5px] border-navy bg-white px-[18px] py-4 shadow-[0_0_0_1px_var(--color-navy)] max-sm:flex-wrap";
export const addressIcon = "mt-0.5 shrink-0 text-brand";
export const addressText = "min-w-0 flex-1 text-[14px] leading-[1.6]";
export const addressLabel = "text-[15px]";
export const addressDefault = "ml-1.5 rounded-full bg-brand-soft px-[7px] py-px align-[1px] text-[11px] font-extrabold text-brand";
export const addressLine = "break-keep text-muted";
export const addressMemo = "text-[12px] text-subtle";
export const addressEdit =
  "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-muted hover:bg-surface hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand max-sm:ml-auto";
export const onceNote = "mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[10px] bg-[#FFF8F7] px-3.5 py-2.5 text-[13px] text-coral-ink";
export const addressSearch = "mt-3.5 flex gap-2";
export const zipcode = `${inputBase} w-[120px] shrink-0 bg-[#F7F9FC]`;
export const loginHint =
  "mt-4 rounded-[10px] bg-[#F7F9FC] px-3.5 py-3 text-[13px] leading-[1.6] text-muted [&_a]:font-bold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-3";
export const noShipping = "mt-5 flex items-center gap-1.5 text-[14px] font-bold text-[#1D6B43]";
export const madeToOrder = "mt-3.5 rounded-xl border-[1.5px] border-[#FFD0C8] bg-coral-soft p-4 text-[13px] leading-[1.7]";
export const madeToOrderTitle = "flex items-center gap-1.5 text-[14px] text-coral-ink";
export const madeToOrderText = "mt-1.5 break-keep text-[#5D3B35]";

export const reviewList =
  "mt-5 border-t border-line [&_dt]:font-bold [&_dt]:text-muted [&>div]:grid [&>div]:grid-cols-[120px_minmax(0,1fr)] [&>div]:gap-3 [&>div]:border-b [&>div]:border-line [&>div]:py-3.5 [&>div]:text-[15px] [&>div]:leading-[1.6] max-sm:[&>div]:grid-cols-[1fr] max-sm:[&>div]:gap-0.5";
export const reviewNote = "mt-4 text-[13px] leading-[1.7] text-muted";

export const summary =
  "pt-11 max-lg:sticky max-lg:bottom-0 max-lg:z-40 max-lg:-mx-6 max-lg:p-0 max-md:bottom-[calc(64px+env(safe-area-inset-bottom))] max-sm:-mx-5";
export const summaryInner =
  "sticky top-[88px] rounded-[20px] border border-line bg-white p-5 shadow-[var(--shadow-panel)] " +
  "max-lg:static max-lg:grid max-lg:grid-cols-[1fr_auto] max-lg:items-center max-lg:gap-x-3 max-lg:gap-y-1 max-lg:rounded-none max-lg:border-x-0 max-lg:border-b-0 max-lg:px-6 max-lg:pt-3 max-lg:pb-[calc(12px+env(safe-area-inset-bottom))] max-lg:shadow-[0_-6px_20px_rgb(23_59_112/8%)] max-md:pb-3";
export const summaryStage = "w-full rounded-[14px] bg-[linear-gradient(160deg,#F3F8FF,#FFF5F2)] p-1.5 max-lg:hidden";
export const summaryCampaign = "mt-3.5 text-[12px] font-extrabold break-keep text-coral-ink max-lg:hidden";
/** 바로 앞에 summaryCampaign이 있어 위 여백이 2px이다. */
export const summaryTier = "mt-0.5 text-[18px] font-extrabold text-navy max-lg:text-[14px]";
export const summaryItems = "mt-1.5 text-[13px] leading-[1.7] text-muted max-lg:hidden [&_li]:before:content-['·_']";
export const summaryTotal = "mt-3.5 border-t border-line pt-3 text-[14px] [&_dt]:text-muted max-lg:col-[1] max-lg:m-0 max-lg:border-0 max-lg:p-0";
export const summaryRow = "flex justify-between py-1 max-lg:hidden";
export const summarySum = "mt-1.5 flex justify-between border-t border-dashed border-line pt-2.5! pb-1 max-lg:m-0 max-lg:border-0 max-lg:p-0!";
export const summarySumLabel = "font-extrabold text-ink! max-lg:text-[12px]";
export const summarySumValue = "text-[20px] font-extrabold text-navy";
export const actions = "mt-4 grid grid-cols-[auto_1fr] gap-2 max-lg:col-[2] max-lg:row-[1/span_2] max-lg:m-0";
export const summaryNote = "mt-2.5 text-center text-[12px] text-subtle max-lg:hidden";

export const sizeTable =
  "w-full border-collapse text-[14px] [&_:is(th,td)]:border-b [&_:is(th,td)]:border-line [&_:is(th,td)]:px-2 [&_:is(th,td)]:py-2.5 [&_:is(th,td)]:text-left [&_thead_th]:text-[12px] [&_thead_th]:text-muted";
export const payLead = "text-[14px] text-muted";
export const payAmount = "mt-2.5 mb-2 text-[30px] font-extrabold text-navy";

/* ───────── 후원 완료(PledgeComplete) ───────── */
const still = "motion-reduce:animate-none!";
export const complete = "max-w-[40rem] pt-12 pb-20 text-center";
export const box = "relative mx-auto w-[260px]";
export const boxGoods = "animate-checkout-drop motion-reduce:hidden";
export const boxBody = `relative -mt-10 h-[120px] animate-checkout-box-in rounded-[6px_6px_12px_12px] bg-[#E2C9A6] shadow-[inset_0_-10px_0_rgb(0_0_0/6%)] ${still}`;
const boxFlap = `absolute top-[-18px] h-[22px] w-1/2 bg-[#D9BC94] ${still}`;
export const boxFlapLeft = `${boxFlap} left-0 origin-bottom-left animate-checkout-flap-l rounded-[4px_0_0_0]`;
export const boxFlapRight = `${boxFlap} right-0 origin-bottom-right animate-checkout-flap-r rounded-[0_4px_0_0]`;
export const boxTape = `absolute top-[-18px] left-1/2 -ml-[18px] h-0 w-9 animate-checkout-tape bg-brand opacity-85 ${still} motion-reduce:h-[60px]`;
export const boxStamp = `absolute right-3.5 bottom-3.5 -rotate-10 animate-checkout-stamp rounded-[6px] border-[2.5px] border-coral px-[9px] py-[5px] text-[13px] font-extrabold text-coral ${still}`;
export const completeTitle = `mt-8 animate-[checkout-slide-next_.6s_ease_2.2s_both] text-[28px] font-extrabold tracking-[-0.5px] ${still}`;
export const completeLead = `mt-2.5 animate-[checkout-slide-next_.6s_ease_2.3s_both] text-[15px] leading-[1.7] text-muted ${still}`;
export const completeCard = `mt-7 animate-[checkout-slide-next_.6s_ease_2.4s_both] rounded-2xl border border-line bg-white p-5 text-left ${still}`;
export const completeList =
  "[&_dd]:text-right [&_dd]:font-bold [&_dt]:text-muted [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&>div]:border-b [&>div]:border-line [&>div]:py-2 [&>div]:text-[14px] [&>div:last-child]:border-b-0";
export const pledgeNo = "text-[18px] tracking-[.04em] text-navy";
export const completeActions = `mt-6 flex animate-[checkout-slide-next_.6s_ease_2.5s_both] flex-wrap justify-center gap-2 ${still}`;
export const completeNote = "mt-4 text-[13px] leading-[1.6] text-subtle [&_a]:font-bold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-3";
