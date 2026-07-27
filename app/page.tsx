import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Parley — The AI agent that works with you, not just for you",
  description:
    "Parley thinks, plans, and acts alongside you — handling emails, scheduling, research, and complex workflows.",
};

const ASSETS = "https://parley-home.vercel.app/assets/";
const ICONS = "https://parley-home.vercel.app/assets/icons/";

function FBtn({
  href,
  variant,
  full,
  label,
}: {
  href: string;
  variant: "primary" | "secondary";
  full?: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={`fbtn fbtn--${variant}${full ? " fbtn--full" : ""}`}
    >
      <span className="fbtn__chip">
        <span className="fbtn__arrows">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9.5 6.5 15 12l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9.5 6.5 15 12l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className="fbtn__label">
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </a>
  );
}

function XIcon() {
  return (
    <svg className="tcard__source-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="parley-page">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400;1,9..40,500;1,9..40,600&family=Geist:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/parley/styles.css" />

      {/* ============ TOP NAV ============ */}
      <div className="nav-bar">
        <nav className="nav">
          <a href="#hero" className="nav__brand" aria-label="Parley">
            <img
              src={`${ASSETS}parley-logo.png`}
              alt="Parley"
              width={78}
              height={26}
            />
          </a>
          <div className="nav__right">
            <ul className="nav__links">
              <li>
                <a href="#delegation">Workflows</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#footer">Contact</a>
              </li>
              <li aria-hidden="true" className="nav__sep"></li>
              <li>
                <a href="#">Blog</a>
              </li>
            </ul>
            <FBtn href="#cta" variant="primary" label="Hire Parley" />
          </div>
        </nav>
      </div>

      <main className="page">
        <div className="container">
          {/* ============ HERO ============ */}
          <section className="hero" id="hero">
            <div className="hero__sticky">
              <div className="hero__media" id="hero-media">
                <img
                  className="hero__img"
                  src={`${ASSETS}hero.jpg`}
                  alt=""
                />
                <div className="hero__overlay"></div>
                <div className="hero__content">
                  <h1 className="hero__headline">
                    The AI agent that
                    <br />
                    works <em>with you</em>, not
                    <br />
                    just for you
                  </h1>
                  <p className="hero__lede">
                    Parley thinks, plans, and acts alongside you, handling
                    emails, scheduling, research, and complex workflows so you
                    can focus on the work only you can do.
                  </p>
                  <FBtn
                    href="#pricing"
                    variant="primary"
                    label="Start free trial"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============ LOGO STRIP ============ */}
          <section className="logos">
            <p className="logos__label">Trusted by 200+ businesses</p>
            <ul className="logos__list" role="list">
              <li className="logo logo--cloudplex">
                <span
                  className="logo__part logo__part--mark"
                  style={{ "--w": "24px", "--h": "24px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-cloudplex-mark-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-cloudplex-mark-h.svg`}
                    alt=""
                  />
                </span>
                <span
                  className="logo__part logo__part--type"
                  style={{ "--w": "88px", "--h": "19px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-cloudplex-type-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-cloudplex-type-h.svg`}
                    alt=""
                  />
                </span>
              </li>
              <li className="logo logo--tytotone">
                <span
                  className="logo__part logo__part--mark"
                  style={{ "--w": "25px", "--h": "20px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-tytotone-mark-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-tytotone-mark-h.svg`}
                    alt=""
                  />
                </span>
                <span
                  className="logo__part logo__part--type"
                  style={{ "--w": "90px", "--h": "16px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-tytotone-type-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-tytotone-type-h.svg`}
                    alt=""
                  />
                </span>
              </li>
              <li className="logo logo--bloopglow">
                <span
                  className="logo__part logo__part--mark"
                  style={{ "--w": "28px", "--h": "24px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-bloopglow-mark-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-bloopglow-mark-h.svg`}
                    alt=""
                  />
                </span>
                <span
                  className="logo__part logo__part--type"
                  style={{ "--w": "78px", "--h": "19px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-bloopglow-type-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-bloopglow-type-h.svg`}
                    alt=""
                  />
                </span>
              </li>
              <li className="logo logo--zingzap">
                <span
                  className="logo__part logo__part--mark"
                  style={{ "--w": "27px", "--h": "22px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-zingzap-mark-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-zingzap-mark-h.svg`}
                    alt=""
                  />
                </span>
                <span
                  className="logo__part logo__part--type"
                  style={{ "--w": "80px", "--h": "18px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-zingzap-type-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-zingzap-type-h.svg`}
                    alt=""
                  />
                </span>
              </li>
              <li className="logo logo--junotwig">
                <span
                  className="logo__part logo__part--type"
                  style={{ "--w": "80px", "--h": "18px" } as React.CSSProperties}
                >
                  <img
                    className="logo__d"
                    src={`${ASSETS}logo-junotwig-d.svg`}
                    alt=""
                  />
                  <img
                    className="logo__h"
                    src={`${ASSETS}logo-junotwig-h.svg`}
                    alt=""
                  />
                </span>
              </li>
            </ul>
          </section>

          {/* ============ WHY PARLEY ============ */}
          <section className="why" id="why">
            <header className="why__header">
              <div className="why__heading">
                <p className="badge">Why Parley</p>
                <h2 className="h2">
                  A real partner,
                  <br />
                  not a chatbot in disguise
                </h2>
              </div>
              <p className="why__lede">
                Most AI tools answer questions. Parley takes initiative —
                anticipating needs, executing tasks, and growing smarter with
                every interaction.
              </p>
            </header>

            <div className="why-cards" id="why-cards" role="list">
              <article
                className="wcard"
                data-index="01"
                tabIndex={0}
                role="listitem"
              >
                <div className="wcard__closed" aria-hidden="true">
                  <p className="wcard__number">01.</p>
                  <div className="wcard__mosaic">
                    <img src={`${ASSETS}mosaic-a.png`} alt="" loading="lazy" />
                  </div>
                  <h3 className="wcard__title-closed">Always context-aware</h3>
                </div>
                <div className="wcard__open">
                  <div className="wcard__img">
                    <img
                      src={`${ASSETS}benefit-1.png`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="wcard__content">
                    <h3 className="wcard__title">Always context-aware</h3>
                    <p className="wcard__desc">
                      Parley remembers your preferences, priorities, and past
                      decisions — so you never have to repeat yourself. It
                      understands your work the way a long-time colleague would.
                    </p>
                  </div>
                </div>
              </article>
              <article
                className="wcard is-active"
                data-index="02"
                tabIndex={0}
                role="listitem"
              >
                <div className="wcard__closed" aria-hidden="true">
                  <p className="wcard__number">02.</p>
                  <div className="wcard__mosaic">
                    <img src={`${ASSETS}mosaic-d.png`} alt="" loading="lazy" />
                  </div>
                  <h3 className="wcard__title-closed">Takes real action</h3>
                </div>
                <div className="wcard__open">
                  <div className="wcard__img">
                    <img
                      src={`${ASSETS}parleys-plan.png`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="wcard__content">
                    <h3 className="wcard__title">Takes real action</h3>
                    <p className="wcard__desc">
                      Beyond suggestions, Parley executes — sending emails,
                      booking meetings, updating records, and managing tasks
                      across all your tools without constant hand-holding.
                    </p>
                  </div>
                </div>
              </article>
              <article
                className="wcard"
                data-index="03"
                tabIndex={0}
                role="listitem"
              >
                <div className="wcard__closed" aria-hidden="true">
                  <p className="wcard__number">03.</p>
                  <div className="wcard__mosaic">
                    <img src={`${ASSETS}mosaic-b.png`} alt="" loading="lazy" />
                  </div>
                  <h3 className="wcard__title-closed">
                    Connects everything
                  </h3>
                </div>
                <div className="wcard__open">
                  <div className="wcard__img">
                    <img
                      src={`${ASSETS}benefit-3.png`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="wcard__content">
                    <h3 className="wcard__title">Connects everything</h3>
                    <p className="wcard__desc">
                      Slack, Notion, HubSpot, GitHub — all in one place. Parley
                      connects to 60+ tools. One conversation updates everything,
                      no extra work.
                    </p>
                  </div>
                </div>
              </article>
              <article
                className="wcard"
                data-index="04"
                tabIndex={0}
                role="listitem"
              >
                <div className="wcard__closed" aria-hidden="true">
                  <p className="wcard__number">04.</p>
                  <div className="wcard__mosaic">
                    <img src={`${ASSETS}mosaic-c.png`} alt="" loading="lazy" />
                  </div>
                  <h3 className="wcard__title-closed">
                    Gets better over time
                  </h3>
                </div>
                <div className="wcard__open">
                  <div className="wcard__img">
                    <img
                      src={`${ASSETS}benefit-4.png`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="wcard__content">
                    <h3 className="wcard__title">Gets better over time</h3>
                    <p className="wcard__desc">
                      The longer you work together, the less you explain. Parley
                      learns your tone, shortcuts, and rules. Today&apos;s prompts
                      become tomorrow&apos;s one-word commands.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* ============ INTELLIGENT DELEGATION ============ */}
          <section className="delegation" id="delegation">
            <div className="delegation__scroll" id="delegation-scroll">
              <div className="trigger" data-step="0"></div>
              <div className="trigger" data-step="1"></div>
              <div className="trigger" data-step="2"></div>
              <div className="trigger" data-step="3"></div>
              <div className="delegation__pin">
                <header className="delegation__header">
                  <div className="delegation__heading">
                    <p className="badge">Intelligent Delegation</p>
                    <h2 className="h2">
                      Tell Parley once.
                      <br />
                      <em>It handles the rest.</em>
                    </h2>
                  </div>
                  <p className="delegation__lede">
                    Describe a goal in plain language and Parley breaks it into
                    steps, selects the right tools, and executes, keeping you
                    updated along the way.
                  </p>
                </header>
                <div className="delegation__inner">
                  <ol className="features" role="tablist">
                    <li className="feature">
                      <button
                        className="feature__btn"
                        type="button"
                        role="tab"
                        data-step="0"
                        aria-selected="true"
                        aria-controls="mock-0"
                      >
                        <img
                          className="feature__chevron"
                          src={`${ASSETS}arrows.svg`}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="feature__head">
                          <span className="feature__label">
                            Natural language commands
                          </span>
                          <span className="feature__desc">
                            Just speak naturally — &ldquo;prep my Monday
                            morning&rdquo; or &ldquo;follow up with leads who
                            haven&apos;t replied in 5 days.&rdquo;
                          </span>
                        </span>
                      </button>
                    </li>
                    <li className="feature">
                      <button
                        className="feature__btn"
                        type="button"
                        role="tab"
                        data-step="1"
                        aria-selected="false"
                        aria-controls="mock-1"
                      >
                        <img
                          className="feature__chevron"
                          src={`${ASSETS}arrows.svg`}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="feature__head">
                          <span className="feature__label">
                            Multi-step task execution
                          </span>
                          <span className="feature__desc">
                            From a single intent, Parley plans the full sequence,
                            runs every step, and recovers when something breaks.
                          </span>
                        </span>
                      </button>
                    </li>
                    <li className="feature">
                      <button
                        className="feature__btn"
                        type="button"
                        role="tab"
                        data-step="2"
                        aria-selected="false"
                        aria-controls="mock-2"
                      >
                        <img
                          className="feature__chevron"
                          src={`${ASSETS}arrows.svg`}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="feature__head">
                          <span className="feature__label">
                            Human-in-the-loop control
                          </span>
                          <span className="feature__desc">
                            Stay in charge of high-stakes actions. Parley pauses
                            for approval whenever the call should be yours.
                          </span>
                        </span>
                      </button>
                    </li>
                    <li className="feature">
                      <button
                        className="feature__btn"
                        type="button"
                        role="tab"
                        data-step="3"
                        aria-selected="false"
                        aria-controls="mock-3"
                      >
                        <img
                          className="feature__chevron"
                          src={`${ASSETS}arrows.svg`}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className="feature__head">
                          <span className="feature__label">
                            Persistent user profile
                          </span>
                          <span className="feature__desc">
                            Knows your team, your tools, your customers, across
                            every session, never starting from zero.
                          </span>
                        </span>
                      </button>
                    </li>
                  </ol>

                  <div className="stage" aria-live="polite">
                    <div
                      className="mock is-active"
                      id="mock-0"
                      role="tabpanel"
                      data-step="0"
                    >
                      <img
                        className="mock__img"
                        src={`${ASSETS}mock-0.png`}
                        srcSet={`${ASSETS}mock-0.png 1x, ${ASSETS}mock-0@2x.png 2x`}
                        alt=""
                      />
                    </div>
                    <div
                      className="mock"
                      id="mock-1"
                      role="tabpanel"
                      data-step="1"
                      hidden
                    >
                      <img
                        className="mock__img"
                        src={`${ASSETS}mock-2.png`}
                        srcSet={`${ASSETS}mock-2.png 1x, ${ASSETS}mock-2@2x.png 2x`}
                        alt=""
                      />
                    </div>
                    <div
                      className="mock"
                      id="mock-2"
                      role="tabpanel"
                      data-step="2"
                      hidden
                    >
                      <img
                        className="mock__img"
                        src={`${ASSETS}mock-1.png`}
                        srcSet={`${ASSETS}mock-1.png 1x, ${ASSETS}mock-1@2x.png 2x`}
                        alt=""
                      />
                    </div>
                    <div
                      className="mock"
                      id="mock-3"
                      role="tabpanel"
                      data-step="3"
                      hidden
                    >
                      <img
                        className="mock__img"
                        src={`${ASSETS}mock-3.png`}
                        srcSet={`${ASSETS}mock-3.png 1x, ${ASSETS}mock-3@2x.png 2x`}
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============ TESTIMONIALS ============ */}
          <section className="testimonials bleed" id="testimonials">
            <header className="testimonials__header">
              <p className="badge">What people say</p>
              <h2 className="h2">
                Teams that work
                <br />
                with Parley, not around it
              </h2>
              <p className="testimonials__lede">
                From solo founders to enterprise teams — here&apos;s what our
                users have to say after making Parley their daily partner.
              </p>
            </header>

            <div className="marquee">
              <ul className="marquee__track" id="track" role="list">
                <li className="tcard">
                  <p className="tcard__quote">
                    Parley does what every other AI tool promised but never
                    delivered — it actually takes things off my plate. My inbox
                    went from 200 unread to zero, daily.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-james.png`}
                      srcSet={`${ASSETS}avatar-james.png 1x, ${ASSETS}avatar-james@2x.png 2x`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">James R.</span>
                      <span className="tcard__role">CEO, CloudPlex</span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
                <li className="tcard">
                  <p className="tcard__quote">
                    I was skeptical about &lsquo;AI partners&rsquo; — but Parley
                    learned my communication style in a week and now drafts
                    emails I barely need to edit. Genuinely impressive.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-sophie.png`}
                      srcSet={`${ASSETS}avatar-sophie.png 1x, ${ASSETS}avatar-sophie@2x.png 2x`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">Sophie K.</span>
                      <span className="tcard__role">
                        VP Marketing, Tytotone
                      </span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
                <li className="tcard">
                  <p className="tcard__quote">
                    The CRM follow-up workflow alone saved our sales team 12
                    hours a week. And the meeting notes are better than anything
                    our team was writing manually.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-daniel.png`}
                      srcSet={`${ASSETS}avatar-daniel.png 1x, ${ASSETS}avatar-daniel@2x.png 2x`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">Daniel M.</span>
                      <span className="tcard__role">
                        Head of Sales, Bloopglow
                      </span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
                <li className="tcard">
                  <p className="tcard__quote">
                    Parley is the first AI tool that actually reduces my
                    workload. I stay on top of emails, clients, and meetings
                    without the usual chaos.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-paul.png`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">Paul M.</span>
                      <span className="tcard__role">
                        Operations Director, ZingZap
                      </span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
                <li className="tcard">
                  <p className="tcard__quote">
                    Parley feels like the assistant I always needed. It keeps
                    conversations organized, handles follow-ups, and saves me
                    hours every week.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-emily.png`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">Emily C.</span>
                      <span className="tcard__role">
                        Head of Client Success, Junotwig
                      </span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
                <li className="tcard">
                  <p className="tcard__quote">
                    Onboarded Parley on a Tuesday. By Friday it had cleared two
                    weeks of backlog and surfaced three deals I would have
                    missed. It earns its seat on the team.
                  </p>
                  <figure className="tcard__author">
                    <img
                      className="tcard__avatar"
                      src={`${ASSETS}avatar-james.png`}
                      srcSet={`${ASSETS}avatar-james.png 1x, ${ASSETS}avatar-james@2x.png 2x`}
                      alt=""
                    />
                    <figcaption>
                      <span className="tcard__name">Marcus T.</span>
                      <span className="tcard__role">
                        Operations Lead, Pylon Foods
                      </span>
                    </figcaption>
                  </figure>
                  <a
                    className="tcard__source"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read on X"
                  >
                    <span>Read on</span>
                    <XIcon />
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* ============ PRICING ============ */}
          <section className="pricing" id="pricing">
            <header className="pricing__header">
              <div className="pricing__heading">
                <p className="badge">Pricing</p>
                <h2 className="h2">
                  Simple, transparent
                  <br />
                  pricing. <em>No surprises.</em>
                </h2>
              </div>
              <div className="pricing__side">
                <p className="pricing__lede">
                  Start free, scale as you grow. Every plan includes core
                  features — upgrade when you need more power or seats.
                </p>
                <div className="toggle" role="tablist" aria-label="Billing period">
                  <button
                    className="toggle__btn is-active"
                    type="button"
                    role="tab"
                    aria-selected="true"
                  >
                    Monthly
                  </button>
                  <button
                    className="toggle__btn"
                    type="button"
                    role="tab"
                    aria-selected="false"
                  >
                    Annual <span className="toggle__off">-15%</span>
                  </button>
                </div>
              </div>
            </header>

            <div className="plans" id="plans">
              <article className="plan" data-index="0">
                <h3 className="plan__name">Solo</h3>
                <div className="plan__price">
                  <span className="plan__currency">$</span>
                  <span className="plan__amount">0</span>
                </div>
                <p className="plan__period">Free forever</p>
                <p className="plan__desc">
                  Perfect for individuals getting started with AI-powered
                  productivity. No credit card required.
                </p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-features__dot"></span>1 connected
                    workspace
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Up to 5
                    integrations
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>100 AI tasks /
                    month
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Basic memory (30
                    days)
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Email + calendar
                    workflows
                  </li>
                  <li className="is-off">
                    <span className="plan-features__dot"></span>Custom workflows
                  </li>
                  <li className="is-off">
                    <span className="plan-features__dot"></span>Priority support
                  </li>
                  <li className="is-off">
                    <span className="plan-features__dot"></span>Team features
                  </li>
                </ul>
                <FBtn
                  href="#"
                  variant="secondary"
                  full
                  label="Get started free"
                />
              </article>

              <article className="plan is-featured" data-index="1">
                <h3 className="plan__name">Pro</h3>
                <div className="plan__price">
                  <span className="plan__currency">$</span>
                  <span className="plan__amount">49</span>
                </div>
                <p className="plan__period">per month, billed monthly</p>
                <p className="plan__desc">
                  The full Parley experience for professionals who want a true
                  AI partner in their work.
                </p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-features__dot"></span>1 connected
                    workspace
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Up to 5
                    integrations
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>100 AI tasks /
                    month
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Long-term memory
                    (forever)
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>All workflow
                    templates
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Custom workflows
                    &amp; automations
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Priority support
                  </li>
                  <li className="is-off">
                    <span className="plan-features__dot"></span>Team features
                  </li>
                </ul>
                <FBtn
                  href="#"
                  variant="primary"
                  full
                  label="Start 14 days free trial"
                />
              </article>

              <article className="plan" data-index="2">
                <h3 className="plan__name">Teams</h3>
                <div className="plan__price">
                  <span className="plan__currency">$</span>
                  <span className="plan__amount">89</span>
                </div>
                <p className="plan__period">per seat / month</p>
                <p className="plan__desc">
                  For growing teams that want shared intelligence, role-based
                  access, and centralized billing.
                </p>
                <ul className="plan-features">
                  <li>
                    <span className="plan-features__dot"></span>1 connected
                    workspace
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Up to 5
                    integrations
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>100 AI tasks /
                    month
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Basic memory (30
                    days)
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Email + calendar
                    workflows
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Custom workflows
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Priority support
                  </li>
                  <li>
                    <span className="plan-features__dot"></span>Team features
                  </li>
                </ul>
                <FBtn href="#" variant="secondary" full label="Talk to sales" />
              </article>
            </div>
          </section>

          {/* ============ HOW IT WORKS ============ */}
          <section className="hiw" id="how-it-works">
            <header className="hiw__header">
              <p className="badge">How it works</p>
              <h2 className="h2 h2--center">
                From ask to done.{" "}
                <em>
                  Without
                  <br />
                  the back-and-forth.
                </em>
              </h2>
            </header>

            <div className="hiw__panel" id="hiw-panel">
              <div className="hiw__pills" role="list">
                <button
                  className="hiw__pill is-active"
                  data-step="0"
                  type="button"
                  aria-pressed="true"
                >
                  Connect your tools
                </button>
                <button
                  className="hiw__pill"
                  data-step="1"
                  type="button"
                  aria-pressed="false"
                >
                  Brief &amp; customize
                </button>
                <button
                  className="hiw__pill"
                  data-step="2"
                  type="button"
                  aria-pressed="false"
                >
                  Delegate everywhere
                </button>
              </div>

              <div className="hiw__stage">
                <div className="hiw__lottie is-active" data-step="0"></div>
                <div className="hiw__lottie" data-step="1" hidden></div>
                <div className="hiw__lottie" data-step="2" hidden></div>
              </div>
            </div>
          </section>

          {/* ============ FAQ ============ */}
          <section className="faq" id="faq">
            <div className="faq__left">
              <p className="badge">FAQ</p>
              <h2 className="h2">
                Questions
                <br />
                answered.
              </h2>
              <p className="faq__sub">Still curious?</p>
              <FBtn href="#footer" variant="primary" label="Chat with us" />
              <img
                className="faq__mosaic"
                src={`${ASSETS}faq-mosaic.png`}
                alt=""
                loading="lazy"
              />
            </div>

            <div className="faq__list">
              <details className="faq__item">
                <summary>
                  <span>
                    How is Parley different from ChatGPT and Copilot?
                  </span>
                  <svg
                    className="faq__plus"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.5v13M1.5 8h13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="2.1 1.7"
                    />
                  </svg>
                </summary>
                <div className="faq__answer">
                  <p>
                    Parley isn&apos;t a chatbot — it&apos;s an action-taking
                    agent. While tools like ChatGPT generate text responses,
                    Parley connects to your real tools, executes multi-step
                    tasks, remembers your context across sessions, and
                    proactively manages your work. It&apos;s the difference
                    between answering a question and doing the job.
                  </p>
                </div>
              </details>
              <details className="faq__item">
                <summary>
                  <span>Is my data safe with Parley?</span>
                  <svg
                    className="faq__plus"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.5v13M1.5 8h13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="2.1 1.7"
                    />
                  </svg>
                </summary>
                <div className="faq__answer">
                  <p>
                    Yes — and it&apos;s not a checkbox answer. Your data is
                    encrypted in transit and at rest, never used to train shared
                    models, and stays inside your workspace. Parley is SOC 2 Type
                    II and GDPR-compliant, with EU data residency available on
                    request. You own every record we touch, and you can delete it
                    from us in one click.
                  </p>
                </div>
              </details>
              <details className="faq__item">
                <summary>
                  <span>What happens if Parley makes a mistake?</span>
                  <svg
                    className="faq__plus"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.5v13M1.5 8h13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="2.1 1.7"
                    />
                  </svg>
                </summary>
                <div className="faq__answer">
                  <p>
                    Every action Parley takes is logged with field-level
                    reasoning, so mistakes are traceable, not mysterious.
                    High-impact actions stay in human-approval mode by default —
                    Parley drafts, you confirm. If something does slip through,
                    one-click undo reverses the change in your connected tools,
                    and Parley learns from the correction so the same mistake
                    doesn&apos;t ship twice.
                  </p>
                </div>
              </details>
              <details className="faq__item">
                <summary>
                  <span>How long does setup take?</span>
                  <svg
                    className="faq__plus"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.5v13M1.5 8h13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="2.1 1.7"
                    />
                  </svg>
                </summary>
                <div className="faq__answer">
                  <p>
                    About 8 minutes for your first workflow. Connect one tool
                    (HubSpot, Slack, or Zendesk to start), pick a template, run
                    it in test mode against a real record. No implementation
                    calls, no four-week pilot. The teams shipping fastest have a
                    workflow running before lunch on day one — and a second one
                    before they head home.
                  </p>
                </div>
              </details>
              <details className="faq__item">
                <summary>
                  <span>Can I build custom workflows without code?</span>
                  <svg
                    className="faq__plus"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.5v13M1.5 8h13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="2.1 1.7"
                    />
                  </svg>
                </summary>
                <div className="faq__answer">
                  <p>
                    Yes — describe what you do in plain English and Parley drafts
                    the workflow for you to review. Edit any step the same way:
                    &ldquo;skip leads from competitors,&rdquo; &ldquo;only ping
                    me about deals over $50k.&rdquo; Templates are forkable on a
                    Friday afternoon. Engineers stay in their queue; RevOps,
                    Support, and Ops own their workflows directly.
                  </p>
                </div>
              </details>
            </div>
          </section>

          {/* ============ INTEGRATIONS ============ */}
          <section className="integrations" id="integrations">
            <header className="integrations__header">
              <p className="badge">Integrations</p>
              <h2 className="h2 h2--center">
                Connect your workflow.
                <br />
                <em>Parley meets you there.</em>
              </h2>
              <p className="integrations__lede">
                Slack, Linear, Notion, GitHub and 60+ more. Parley triggers
                actions, fetches context, and keeps things in sync — right where
                your team already works.
              </p>
            </header>

            <div className="int-marquee">
              <div className="int-marquee__row" data-dir="left">
                <div className="int-marquee__set">
                  <span className="int-tile">
                    <img src={`${ICONS}onenote.svg`} alt="OneNote" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}notion.svg`} alt="Notion" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}trello.svg`} alt="Trello" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}linear.svg`} alt="Linear" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}loom.svg`} alt="Loom" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}zapier.svg`} alt="Zapier" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}gcal.svg`} alt="Google Calendar" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}slack.svg`} alt="Slack" />
                  </span>
                </div>
                <div className="int-marquee__set" aria-hidden="true">
                  <span className="int-tile">
                    <img src={`${ICONS}onenote.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}notion.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}trello.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}linear.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}loom.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}zapier.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}gcal.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}slack.svg`} alt="" />
                  </span>
                </div>
              </div>
              <div className="int-marquee__row" data-dir="right">
                <div className="int-marquee__set">
                  <span className="int-tile">
                    <img src={`${ICONS}loom.svg`} alt="Loom" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}trello.svg`} alt="Trello" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}notion.svg`} alt="Notion" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}slack.svg`} alt="Slack" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}zapier.svg`} alt="Zapier" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}onenote.svg`} alt="OneNote" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}gcal.svg`} alt="Google Calendar" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}linear.svg`} alt="Linear" />
                  </span>
                </div>
                <div className="int-marquee__set" aria-hidden="true">
                  <span className="int-tile">
                    <img src={`${ICONS}loom.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}trello.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}notion.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}slack.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}zapier.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}onenote.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}gcal.svg`} alt="" />
                  </span>
                  <span className="int-tile">
                    <img src={`${ICONS}linear.svg`} alt="" />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CTA ============ */}
          <section className="cta" id="cta">
            <div className="cta__panel">
              <img
                className="cta__bg"
                src={`${ASSETS}cta-sunset.png`}
                alt=""
                loading="lazy"
              />
              <div className="cta__overlay"></div>
              <div className="cta__content">
                <h2 className="cta__title">
                  Meet your AI partner.
                  <br />
                  <em>Built for real work</em>
                </h2>
                <p className="cta__lede">
                  Join 12,000+ professionals who use Parley as their daily
                  partner.
                  <br />
                  Set up in minutes. Cancel anytime. Your first 100 tasks are on
                  us.
                </p>
                <FBtn
                  href="#pricing"
                  variant="primary"
                  label="Get started free"
                />
              </div>
            </div>
          </section>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="footer" id="footer">
          <div className="footer__inner">
            <div className="footer__top">
              <img
                className="footer__logo"
                src={`${ASSETS}parley-logo.png`}
                alt="Parley"
                width={78}
                height={26}
              />
              <div className="footer__social">
                <span className="footer__social-label">Social media</span>
                <div className="footer__social-btns">
                  <a
                    className="footer__social-btn"
                    href="https://x.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="X"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M17.53 3h3.18l-6.95 7.94L22 21h-6.41l-5.02-6.56L4.83 21H1.65l7.43-8.49L1.5 3h6.57l4.54 6.01zM16.4 19h1.76L7.69 4.9H5.81z"
                      />
                    </svg>
                  </a>
                  <a
                    className="footer__social-btn"
                    href="https://www.threads.net/"
                    target="_blank"
                    rel="noopener"
                    aria-label="Threads"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.18 2c2.7 0 4.85.9 6.38 2.68 1.36 1.58 2.07 3.77 2.12 6.52v.1c0 2.8-.7 5.04-2.1 6.66C17.06 19.72 14.9 20.6 12.2 20.6c-2.35 0-4.26-.65-5.68-1.93C4.9 17.2 4.06 15 4.06 12.3c0-2.68.84-4.88 2.44-6.36C7.93 4.6 9.84 3.95 12.18 2zm.02 1.9c-1.9 0-3.42.52-4.5 1.53-1.2 1.12-1.83 2.83-1.83 4.87 0 2.06.62 3.77 1.8 4.9 1.06 1 2.58 1.5 4.52 1.5 2.16 0 3.83-.66 4.96-1.96 1.06-1.22 1.6-3 1.6-5.28-.04-2.3-.6-4.07-1.63-5.27-1.13-1.3-2.8-1.96-4.92-1.96zm.25 3.62c1.3 0 2.34.4 3.08 1.17.6.63.97 1.5 1.1 2.57.5.26.93.6 1.25 1.03.5.65.74 1.48.68 2.4-.07 1.16-.55 2.15-1.4 2.86-.8.68-1.87 1.03-3.1 1.03-1.5 0-2.7-.52-3.48-1.5-.68-.87-1-2.04-.92-3.4l1.9.12c-.05.98.14 1.76.55 2.28.42.53 1.08.8 1.95.8.83 0 1.5-.2 1.96-.6.44-.37.7-.9.73-1.55.03-.5-.08-.92-.33-1.24-.2-.27-.5-.48-.87-.64-.1.63-.32 1.17-.66 1.6-.53.66-1.3 1-2.24.97-.83-.02-1.55-.3-2.03-.8-.5-.5-.74-1.16-.7-1.87.06-1.4 1.13-2.34 2.73-2.4.5-.02.98.02 1.42.1-.1-.5-.3-.9-.58-1.18-.38-.4-.94-.6-1.66-.6h-.04c-.6 0-1.36.16-1.85.92l-1.6-1.07c.8-1.2 2.03-1.87 3.5-1.9zm-.02 5.14c-.9.04-1.44.4-1.46 1-.01.3.1.55.3.74.23.22.58.35 1 .36.5.02.9-.14 1.2-.5.23-.28.4-.68.47-1.2-.44-.13-.95-.42-1.5-.4z"
                      />
                    </svg>
                  </a>
                  <a
                    className="footer__social-btn"
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noopener"
                    aria-label="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="footer__mid">
              <p className="footer__tagline">
                Your AI partner for email, calendar, research, and everything in
                between. Built for people who want to do their best work
              </p>
              <nav className="footer__cols" aria-label="Footer">
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Workflows
                  </p>
                  <a href="#delegation">Lead enrichment</a>
                  <a href="#delegation">Inbound triage</a>
                  <a href="#delegation">Ticket triage</a>
                </div>
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Company
                  </p>
                  <a href="#">Blog</a>
                  <a href="#">Contact</a>
                </div>
                <div className="footer__col">
                  <p className="footer__col-title">
                    <span className="footer__square"></span>Legal
                  </p>
                  <a href="#">404</a>
                  <a href="#">Waitlist</a>
                </div>
              </nav>
            </div>

            <div className="footer__mark">
              <img
                className="footer__watermark"
                src={`${ASSETS}watermark.png`}
                alt=""
                loading="lazy"
              />
              <img
                className="footer__mosaic"
                src={`${ASSETS}footer-mosaic.png`}
                alt=""
                loading="lazy"
              />

              <div className="footer__bottom">
                <p>
                  &copy; 2026 Parley. AI Agent template &middot; Designed by{" "}
                  <a
                    href="https://apollostudio.design"
                    target="_blank"
                    rel="noopener"
                  >
                    Apollo Studio
                  </a>
                </p>
                <a href="#">Terms&amp;Conditions</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <Script
        src="https://parley-home.vercel.app/assets/lottie.min.js"
        strategy="beforeInteractive"
      />
      <Script src="/parley/script.js" strategy="afterInteractive" />
    </div>
  );
}
