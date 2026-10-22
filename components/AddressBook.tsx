"use client";

import { useId, useState } from "react";
import { ADDRESS_LABELS, MAX_ADDRESSES, emptyAddress, formatAddress, removeAddress, saveAddress, setDefaultAddress, validateAddress, type Address, type AddressInput } from "@/lib/addressBook";
import { useAddressBook } from "@/lib/useAddressBook";
import AddressSearchButton from "./AddressSearchButton";
import { PencilIcon, PlusIcon } from "./Icons";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const FIELD = "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] placeholder:text-subtle focus:border-brand focus:outline-none";

/** 배송지 한 개를 입력하는 폼. 주소록 추가·수정에 쓴다. */
export function AddressForm({ initial, onSave, onCancel, submitLabel = "저장" }: { initial: AddressInput; onSave: (value: AddressInput) => void | Promise<void>; onCancel?: () => void; submitLabel?: string }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const set = <K extends keyof AddressInput>(key: K, next: AddressInput[K]) => { setValue((current) => ({ ...current, [key]: next })); setError(null); };
  const customLabel = !(ADDRESS_LABELS as readonly string[]).includes(value.label);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    // 후원 단계 폼 위에 뜬 모달에서도 쓰므로, 제출이 바깥 폼으로 번지지 않게 막는다(포털도 React 트리로는 이어져 있다).
    event.stopPropagation();
    const problem = validateAddress(value);
    if (problem) { setError(problem); return; }
    try { await onSave(value); } catch (problem) { setError(problem instanceof Error ? problem.message : "저장하지 못했어요."); }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/50 p-5 max-sm:p-4">
      <fieldset>
        <legend className="text-[13px] font-bold">배송지 이름</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ADDRESS_LABELS.map((label) => (
            <button key={label} type="button" aria-pressed={value.label === label} onClick={() => set("label", label)}
              className={`rounded-full border px-3 py-1.5 text-[13px] font-bold ${value.label === label ? "border-[#173B70] bg-[#173B70] text-white" : "border-line bg-white text-muted hover:border-brand"} ${FOCUS}`}>{label}</button>
          ))}
          <input aria-label="배송지 이름 직접 입력" value={customLabel ? value.label : ""} onChange={(event) => set("label", event.target.value)} placeholder="직접 입력" maxLength={10}
            className={`h-9 w-28 rounded-full border px-3 text-[13px] focus:border-brand focus:outline-none ${customLabel ? "border-[#173B70]" : "border-line"} bg-white`} />
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className="text-[13px] font-bold">받는 분
          <input value={value.recipient} onChange={(event) => set("recipient", event.target.value)} autoComplete="name" className={`mt-1.5 ${FIELD}`} />
        </label>
        <label className="text-[13px] font-bold">휴대폰
          <input type="tel" value={value.phone} onChange={(event) => set("phone", event.target.value)} autoComplete="tel" placeholder="010-0000-0000" className={`mt-1.5 ${FIELD}`} />
        </label>
      </div>
      <div>
        <span id={`${id}-address`} className="text-[13px] font-bold">주소</span>
        <div className="mt-1.5 flex gap-2">
          <input aria-label="우편번호" value={value.zipcode} readOnly placeholder="우편번호" className={`${FIELD} w-28 shrink-0 bg-surface`} />
          <AddressSearchButton onSelect={({ zipcode, address }) => { setValue((current) => ({ ...current, zipcode, address })); setError(null); document.getElementById(`${id}-detail`)?.focus(); }} />
        </div>
        <input aria-labelledby={`${id}-address`} value={value.address} onChange={(event) => set("address", event.target.value)} autoComplete="street-address" placeholder="주소 검색을 누르거나 직접 입력" className={`mt-2 ${FIELD}`} />
        <input id={`${id}-detail`} aria-label="상세 주소" value={value.detail} onChange={(event) => set("detail", event.target.value)} placeholder="상세 주소 (동·호수)" className={`mt-2 ${FIELD}`} />
      </div>
      <label className="text-[13px] font-bold">배송 메모 <span className="font-medium text-muted">선택</span>
        <input value={value.memo} onChange={(event) => set("memo", event.target.value)} maxLength={50} placeholder="예: 문 앞에 놓아 주세요" className={`mt-1.5 ${FIELD}`} />
      </label>
      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" checked={!!value.isDefault} onChange={(event) => set("isDefault", event.target.checked)} className="h-4.5 w-4.5 accent-brand" />
        기본 배송지로 설정
      </label>
      {error && <p role="alert" className="text-[13px] font-semibold text-red">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" onClick={onCancel} className={`rounded-xl border border-line bg-white px-4 py-2.5 text-[14px] font-bold ${FOCUS}`}>취소</button>}
        <button type="submit" className={`rounded-xl bg-brand px-5 py-2.5 text-[14px] font-bold text-white hover:bg-brand-dark ${FOCUS}`}>{submitLabel}</button>
      </div>
    </form>
  );
}

function AddressSummary({ item }: { item: Address }) {
  return (
    <span className="block min-w-0">
      <span className="flex flex-wrap items-center gap-1.5">
        <strong className="text-[15px]">{item.label}</strong>
        {item.isDefault && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">기본</span>}
      </span>
      <span className="mt-1 block text-[14px]">{item.recipient} · {item.phone}</span>
      <span className="mt-0.5 block text-[13px] break-keep text-muted">{formatAddress(item)}</span>
      {item.memo && <span className="mt-0.5 block text-[12px] text-subtle">메모: {item.memo}</span>}
    </span>
  );
}

type Props =
  | { userId: string; mode: "manage" }
  | { userId: string; mode: "pick"; selectedId: string | null; onPick: (address: Address) => void };

/** 주소록. 마이페이지에서는 관리, 후원할 때는 고르기에 쓴다. */
export default function AddressBook(props: Props) {
  const { userId, mode } = props;
  const book = useAddressBook(userId);
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const full = book.length >= MAX_ADDRESSES;
  const groupName = useId();

  const run = (action: () => void) => {
    try { action(); setError(null); } catch (problem) { setError(problem instanceof Error ? problem.message : "처리하지 못했어요."); }
  };

  const save = (value: AddressInput) => {
    const saved = saveAddress(userId, value);
    setEditing(null);
    if (mode === "pick") props.onPick(saved);
  };

  return (
    <div>
      {book.length === 0 && editing === null && (
        <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-[14px] text-muted">
          저장된 배송지가 없어요. 배송지를 저장해 두면 후원할 때 자동으로 채워져요.
        </p>
      )}
      <ul className="flex flex-col gap-2.5">
        {book.map((item) => editing === item.id ? (
          <li key={item.id}><AddressForm initial={item} onSave={save} onCancel={() => setEditing(null)} /></li>
        ) : (
          <li key={item.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 ${mode === "pick" && props.selectedId === item.id ? "border-[#173B70] shadow-[0_0_0_1px_#173B70]" : "border-line"}`}>
            {mode === "pick" ? (
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                <input type="radio" name={groupName} checked={props.selectedId === item.id} onChange={() => props.onPick(item)} className="mt-1 h-4.5 w-4.5 shrink-0 accent-brand" />
                <AddressSummary item={item} />
              </label>
            ) : <span className="min-w-0 flex-1"><AddressSummary item={item} /></span>}
            <span className="flex shrink-0 flex-col items-end gap-1 text-[13px] font-bold">
              <button type="button" onClick={() => setEditing(item.id)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted hover:bg-surface hover:text-brand ${FOCUS}`} aria-label={`${item.label} 배송지 수정`}><PencilIcon size={14} />수정</button>
              {mode === "manage" && !item.isDefault && <button type="button" onClick={() => run(() => setDefaultAddress(userId, item.id))} className={`rounded-lg px-2 py-1 text-muted hover:bg-surface hover:text-brand ${FOCUS}`}>기본으로</button>}
              {mode === "manage" && <button type="button" onClick={() => run(() => removeAddress(userId, item.id))} className={`rounded-lg px-2 py-1 text-muted hover:bg-surface hover:text-red ${FOCUS}`} aria-label={`${item.label} 배송지 삭제`}>삭제</button>}
            </span>
          </li>
        ))}
      </ul>
      {editing === "new" ? (
        <div className="mt-3"><AddressForm initial={{ ...emptyAddress(), isDefault: book.length === 0 }} onSave={save} onCancel={() => setEditing(null)} submitLabel={mode === "pick" ? "저장하고 이 배송지로" : "저장"} /></div>
      ) : (
        <button type="button" disabled={full} onClick={() => setEditing("new")}
          className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3.5 text-[14px] font-bold text-brand hover:border-brand hover:bg-brand-soft/40 disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent ${FOCUS}`}>
          <PlusIcon size={16} />{full ? `배송지는 ${MAX_ADDRESSES}개까지 저장할 수 있어요` : `새 배송지 추가 (${book.length}/${MAX_ADDRESSES})`}
        </button>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] font-semibold text-red">{error}</p>}
    </div>
  );
}
