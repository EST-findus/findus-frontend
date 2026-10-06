import { formatPastLabel } from "@/lib/format";
import type { MissingPerson } from "@/lib/types";
import InfoRows from "./InfoRows";
import PhotoFrame from "./PhotoFrame";

type Opener = (person: MissingPerson, trigger: HTMLElement) => void;

interface PersonCardProps {
  person: MissingPerson;
  onOpenDetail: Opener;
  onOpenTip: Opener;
}

const SECTION_LABEL = "mb-2 text-[12.5px] font-semibold break-keep";
const BUTTON =
  "rounded-lg px-3.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

export default function PersonCard({ person, onOpenDetail, onOpenTip }: PersonCardProps) {
  const openDetail = (e: React.MouseEvent<HTMLButtonElement>) =>
    onOpenDetail(person, e.currentTarget);
  const frameLabel = `${person.name} 상세 비교 열기`;

  return (
    <article
      aria-labelledby={`person-${person.id}`}
      className="flex flex-col rounded-2xl border border-line bg-card p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transform-none"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 id={`person-${person.id}`} className="min-w-0 text-[18px] font-extrabold">
          {person.name} <span className="font-semibold text-muted">({person.gender})</span>
        </h3>
        <span className="shrink-0 rounded-full border border-red-line bg-red-soft px-2.5 py-0.5 text-[12px] font-bold text-red">
          {person.status}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-[1fr_2fr] gap-3">
        <div>
          <p className={`${SECTION_LABEL} text-muted`}>실종당시 모습</p>
          <PhotoFrame
            src={person.photos.past}
            alt={`${person.name} 실종 당시 사진`}
            sizes="(min-width: 1024px) 180px, 30vw"
            label={formatPastLabel(person)}
            ariaLabel={frameLabel}
            onClick={openDetail}
          />
        </div>
        <div>
          <p className={`${SECTION_LABEL} text-navy`}>AI 예상 사진</p>
          <div className="grid grid-cols-2 gap-3">
            {person.photos.ai.map((ai) => (
              <PhotoFrame
                key={ai.src}
                src={ai.src}
                alt={`${person.name} ${ai.label}`}
                sizes="(min-width: 1024px) 180px, 30vw"
                label={ai.label}
                ariaLabel={frameLabel}
                onClick={openDetail}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 border-t border-line pt-4">
        <InfoRows person={person} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 text-[14px] font-bold">
        <button
          type="button"
          onClick={(e) => onOpenTip(person, e.currentTarget)}
          className={`${BUTTON} bg-navy text-white hover:bg-navy-dark`}
        >
          목격 제보하기
        </button>
        <button
          type="button"
          onClick={openDetail}
          className={`${BUTTON} border border-line bg-card text-ink hover:border-navy hover:text-navy`}
        >
          상세 비교보기
        </button>
      </div>
    </article>
  );
}
