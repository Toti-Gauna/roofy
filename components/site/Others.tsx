'use client';

import { useState, type ReactNode } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { PhaseGlyph } from '@/components/ui/PhaseGlyph';
import { Plate } from '@/components/sections/products/Plate';
import { useSound } from '@/components/sound/SoundContext';
import { sectionNumber, sectionPhase } from '@/lib/sections';
import { STATUS_PHASE, type ProductId, type ProductStatus } from '@/lib/products';
import './others.css';

/** One product of the list, already in the visitor's language (built on the server: this component holds no copy). */
export interface OtherItem {
  id: ProductId;
  status: ProductStatus;
  /** «Eclipse para locales de comida» / «Handy» / «DentalOS»: the full name, for the screen readers and the panel's label. */
  name: string;
  /** The short title the row and the panel lead with, when the name is «Eclipse para …» (the label above says it). */
  title: string;
  rubro: string;
  line: string;
  points: string[];
  statusText: string;
  /** «Sin precio publicado todavía» / «Sin precio ni fecha todavía»: what is not there yet, said out loud. */
  note: string | null;
  /** The WhatsApp action: a heads-up («Avisame cuando esté») or «Pedir información», with its prefilled message. */
  cta: { label: string; href: string };
}

export interface OthersText {
  section: string;
  title: ReactNode;
  sub: string;
  listLabel: string;
  forLabel: string;
  whatsappNote: string;
}

/**
 * 05 · Otros negocios (lote B3): the rest of Eclipse's products, each honest about where it stands — in the works, with a
 * launch date, or coming — and none with a price (only Roofy, section 02, is on sale; its price is in the plans).
 * An index list with a live preview: the list on the left, the selected product's plate (drawn when it is picked, then
 * alive), what it does and its status on the right; on a phone each row opens under itself. Always one product open.
 * One DOM for both: the list is a grid and, from 1024px, every panel sits in the same cell of the right column — the open one
 * visible, the others only `visibility: hidden` — so the cell is as tall as the tallest panel and the rows never reflow
 * when another product is picked (others.css).
 *
 * No solid amber here (the hero's is the page's one): the WhatsApp action is the quiet button.
 * Tour stops (`data-tour-stop`): the head and the list.
 */
export function Others({ id, items, text }: { id: 'otros-negocios'; items: OtherItem[]; text: OthersText }) {
  const [active, setActive] = useState(0);
  const { play } = useSound();

  return (
    <section id={id} aria-labelledby={`${id}-title`} tabIndex={-1} className="ob theme-dark grain relative isolate bg-void">
      <div aria-hidden className="ob-light" />
      <div className="ob-head container-x" data-tour-stop>
        <p className="label ob-index">
          <PhaseGlyph phase={sectionPhase(id)} size={16} />
          <span className="readout">{sectionNumber(id)}</span>
          <span>{text.section}</span>
        </p>
        <h2 id={`${id}-title`} className="display ob-title">
          {text.title}
        </h2>
        <p className="ob-sub">{text.sub}</p>
      </div>

      <div className="ob-grid container-x" role="group" aria-label={text.listLabel} style={{ ['--ob-n' as string]: items.length }} data-tour-stop>
        {items.map((item, i) => {
          const open = i === active;
          return (
            <Row
              key={item.id}
              item={item}
              index={i}
              open={open}
              forLabel={text.forLabel}
              whatsappNote={text.whatsappNote}
              onOpen={() => {
                if (open) return;
                play('select');
                setActive(i);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

function Row({
  item,
  index,
  open,
  forLabel,
  whatsappNote,
  onOpen,
}: {
  item: OtherItem;
  index: number;
  open: boolean;
  forLabel: string;
  whatsappNote: string;
  onOpen: () => void;
}) {
  const panel = `ob-panel-${item.id}`;
  const titled = item.title !== item.name;
  return (
    <>
      <h3 className="ob-row-head">
        <button type="button" className="ob-row" aria-expanded={open} aria-controls={panel} onClick={onOpen} data-product={item.id}>
          <span aria-hidden className="readout ob-row-index">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="ob-row-name">
            {titled ? <span className="sr-only">{forLabel} </span> : null}
            {item.title}
          </span>
          <span className="ob-row-status" data-status={item.status}>
            <PhaseGlyph phase={STATUS_PHASE[item.status]} size={14} />
            <span>{item.statusText}</span>
          </span>
        </button>
      </h3>
      <div id={panel} role="region" aria-label={item.name} className="ob-panel" data-open={open || undefined}>
        {/* The slot keeps the plate's size when closed, so every panel is as tall as the others (the list never reflows). */}
        <div className="ob-plate">{open ? <Plate key={item.id} id={item.id} /> : null}</div>
        <div className="ob-copy">
          <p className="label ob-meta">
            {titled ? <span>{forLabel}</span> : null}
            <span>{item.rubro}</span>
          </p>
          <p className="display ob-name" aria-hidden>
            {item.title}
          </p>
          <p className="ob-line">{item.line}</p>
          <ul className="ob-points">
            {item.points.map((point) => (
              <li key={point}>
                <span aria-hidden className="ob-tick" />
                {point}
              </li>
            ))}
          </ul>
          <div className="ob-foot">
            <p className="ob-status" data-status={item.status}>
              <PhaseGlyph phase={STATUS_PHASE[item.status]} size={16} />
              <span>{item.statusText}</span>
              {item.note ? <span className="ob-note">{item.note}</span> : null}
            </p>
            <a href={item.cta.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost ob-cta">
              <MessageCircle aria-hidden className="size-4" strokeWidth={1.6} />
              {item.cta.label}
              <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
              <span className="sr-only"> · {whatsappNote}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
