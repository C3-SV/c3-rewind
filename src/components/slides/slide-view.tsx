import type { ContentBlock, Slide } from "../../content/schema.ts";
import { resolveMediaSource } from "../../lib/media.ts";
import { OrbitMotif } from "../motion/orbits.tsx";
import { MediaGallery } from "../ui/media-gallery.tsx";

export type RecipientPresentation = {
  id: string;
  commercialName: string;
  logo: string | null;
  welcomeMessage: string | null;
  closingMessage: string | null;
  contactDestination: string | null;
  supportedEvents: string[];
  enabledByEvent: Array<{ eventId: string; contribution: string; description: string | null }>;
  impact: Array<{ label: string; value: string; status: string }>;
  media: Array<{ file: string; alt: string; status: string }>;
  people: Array<{ name: string; role: string }>;
  testimonials: Array<{ text: string; person: string; permission: boolean }>;
};

type Props = {
  slide: Slide;
  edition: string;
  imageKitEndpoint?: string;
  recipient?: RecipientPresentation;
  isDevelopment?: boolean;
  staticMode?: boolean;
  onStart?: () => void;
  pdfHref: string;
};

function isApproved(block: ContentBlock): boolean {
  if (block.type === "image") return block.media.status === "approved";
  if (block.type === "gallery") return block.status === "approved" && block.media.every((asset) => asset.status === "approved");
  return block.status === "approved";
}

function visibleBlocks(slide: Slide, isDevelopment: boolean): ContentBlock[] {
  return slide.blocks.filter((block) => isDevelopment || isApproved(block));
}

function ContentBlocks({ blocks, imageKitEndpoint, staticMode }: { blocks: ContentBlock[]; imageKitEndpoint?: string; staticMode: boolean }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "copy":
        return <p className="story-copy" key={`copy-${index}`}>{block.text}</p>;
      case "stat":
        return (
          <div className="story-stat" key={`stat-${index}`}>
            <strong>{block.value}</strong>
            <span>{block.label}</span>
            <small>{block.context}</small>
          </div>
        );
      case "image":
        return (
          <figure className="story-image" key={`image-${index}`}>
            <img
              src={resolveMediaSource(block.media, imageKitEndpoint)}
              alt={block.media.alt}
              loading={index > 0 ? "lazy" : "eager"}
              style={{ objectPosition: block.media.focalPoint ? `${block.media.focalPoint.x}% ${block.media.focalPoint.y}%` : undefined }}
            />
            <figcaption>{block.media.alt}</figcaption>
          </figure>
        );
      case "gallery":
        return <MediaGallery key={`gallery-${index}`} media={block.media} imageKitEndpoint={imageKitEndpoint} staticMode={staticMode} />;
      case "quote":
        return (
          <blockquote className="story-quote" key={`quote-${index}`}>
            <p>“{block.text}”</p>
            <cite>{block.person}{block.role ? ` · ${block.role}` : ""}</cite>
          </blockquote>
        );
      case "initiative":
        return (
          <div className="initiative" key={`initiative-${index}`}>
            <span>{block.body}</span>
            <strong>{block.title}</strong>
          </div>
        );
    }
  });
}

function Placeholder({ label, isDevelopment }: { label: string; isDevelopment: boolean }) {
  if (!isDevelopment) return null;
  return (
    <div className="media-placeholder" aria-label={`Pendiente editorial: ${label}`}>
      <span aria-hidden="true">✳</span>
      <small>FOTO PENDIENTE · {label}</small>
    </div>
  );
}

export function SlideView({ slide, edition, imageKitEndpoint, recipient, isDevelopment = false, staticMode = false, onStart, pdfHref }: Props) {
  const blocks = visibleBlocks(slide, isDevelopment);
  const color = slide.chapter === "compite" ? "compite" : slide.chapter === "crea" ? "crea" : slide.chapter === "conecta" ? "conecta" : "navy";
  const className = ["story-scene", `scene--${slide.layout}`, `scene--${slide.background}`, staticMode ? "is-static" : ""].filter(Boolean).join(" ");
  const name = recipient?.commercialName;
  const privateMediaBase = pdfHref.replace(/\/pdf$/, "/media");
  const partnerLogo = recipient?.logo
    ? /^https:\/\//i.test(recipient.logo) ? recipient.logo : `${privateMediaBase}/${encodeURIComponent(recipient.logo)}`
    : null;

  return (
    <article className={className} data-slide-id={slide.id} data-chapter={slide.chapter} aria-label={slide.title}>
      {slide.layout !== "cover" && <OrbitMotif active={slide.chapter === "compite" ? 1 : slide.chapter === "crea" ? 2 : slide.chapter === "conecta" ? 3 : 0} quiet={staticMode} />}
      <div className="scene-copy">
        <p className="scene-kicker"><span className={`chapter-dot chapter-dot--${color}`} />{slide.chapterLabel} · C3 REWIND {edition}</p>
        <h1>{slide.layout === "cover" ? "2026" : slide.title}</h1>
        {slide.layout === "cover" && <p className="cover-byline">{recipient ? `Para ${name}` : slide.body}</p>}
        {slide.layout === "cover" && recipient && <p className="cover-byline">El año que nos ayudaron a construir.</p>}
        {slide.layout === "thanks" && recipient && <p className="thanks-name">{recipient.commercialName}</p>}
        {slide.body && slide.layout !== "imprint" && slide.layout !== "cover" && <p className="scene-body">{slide.layout === "thanks" && recipient?.welcomeMessage ? recipient.welcomeMessage : slide.body}</p>}
        {slide.layout === "axes" && <div className="axes-line" aria-label="Compite, Crea y Conecta">
          <div className="axis axis--compite"><b>Compite</b><span>Desarrollar excelencia técnica.</span></div>
          <div className="axis axis--crea"><b>Crea</b><span>Convertir conocimiento en proyectos reales.</span></div>
          <div className="axis axis--conecta"><b>Conecta</b><span>Acercar talento a oportunidades.</span></div>
        </div>}
        {blocks.length > 0 && <div className={`story-blocks story-blocks--${slide.layout}`}><ContentBlocks blocks={blocks} imageKitEndpoint={imageKitEndpoint} staticMode={staticMode} /></div>}
        {slide.layout === "cover" && !staticMode && <button className="story-cta" onClick={onStart}>Comenzar <span aria-hidden="true">→</span></button>}
        {slide.layout === "cover" && <div className="cover-mark"><img src="/brand/lockup.png" alt="C3" />{partnerLogo && <><span aria-hidden="true">×</span><img src={partnerLogo} alt={name ?? "Empresa aliada"} /></>}</div>}
        {slide.layout === "thanks" && <Placeholder label={name ? "participación de la empresa" : "comunidad C3"} isDevelopment={isDevelopment} />}
        {slide.layout === "event" && <Placeholder label="Copa · competencia y premiación" isDevelopment={isDevelopment} />}
        {slide.layout === "build" && <Placeholder label="HTC · equipos construyendo" isDevelopment={isDevelopment} />}
        {slide.layout === "connect" && <Placeholder label="talleres y comunidad" isDevelopment={isDevelopment} />}
        {slide.layout === "imprint" && recipient && (
          <div className="partner-huella">
            <p>{name} apoyó {recipient.supportedEvents.join(" · ") || "[EVENTO PENDIENTE]"}.</p>
            {recipient.enabledByEvent.map((event) => <p key={event.eventId}>{event.description ?? event.contribution}</p>)}
            {recipient.impact.filter((item) => item.status === "approved").map((item) => <p key={item.label}><b>{item.value}</b> {item.label}</p>)}
            {recipient.testimonials.filter((quote) => quote.permission).map((quote) => <blockquote key={quote.person}>“{quote.text}” <cite>{quote.person}</cite></blockquote>)}
            {recipient.media.filter((asset) => asset.status === "approved").map((asset) => {
              const mediaBase = pdfHref.replace(/\/pdf$/, "/media");
              return <figure className="private-event-photo" key={asset.file}><img src={`${mediaBase}/${encodeURIComponent(asset.file)}`} alt={asset.alt} loading="lazy" /></figure>;
            })}
            <Placeholder label="evento apoyado" isDevelopment={isDevelopment && recipient.media.length === 0} />
          </div>
        )}
        {slide.layout === "team" && <div className="team-number"><span>Somos</span><strong>36</strong></div>}
        {slide.layout === "future" && <div className="year-turn" aria-hidden="true"><span>2026</span><i>→</i><strong>2027</strong></div>}
        {slide.layout === "close" && (
          <>
            <p className="closing-copy">{recipient?.closingMessage ?? slide.body}</p>
            {recipient?.contactDestination && <a className="story-cta" href={recipient.contactDestination}>Conversemos <span aria-hidden="true">→</span></a>}
            {recipient?.contactDestination && <p className="pdf-contact">Contacto: {recipient.contactDestination}</p>}
            <a className="home-link" href="https://c3.com.sv" rel="noreferrer">C3 · c3.com.sv</a>
            <a className="pdf-link" href={pdfHref}>Descargar PDF</a>
          </>
        )}
      </div>
      {slide.layout === "cover" && <div className="cover-orbits"><OrbitMotif quiet={staticMode} /></div>}
      {slide.layout === "imprint" && partnerLogo && <img className="partner-logo" src={partnerLogo} alt={name ?? "Empresa aliada"} />}
      {slide.layout === "close" && partnerLogo && <div className="closing-marks"><img src="/brand/lockup.png" alt="C3" /><span aria-hidden="true">×</span><img src={partnerLogo} alt={name ?? "Empresa aliada"} /></div>}
      {isDevelopment && slide.editorialNotes.length > 0 && !staticMode && (
        <aside className="editorial-notes"><b>Pendientes editoriales</b><ul>{slide.editorialNotes.map((note) => <li key={note}>{note}</li>)}</ul></aside>
      )}
    </article>
  );
}
