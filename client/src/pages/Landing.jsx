import { useEffect, useRef, useState } from "react";
import { useTypewriter } from "react-simple-typewriter";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import heroBg from "../assets/bg1.avif";
import heroImage from "../assets/heroimage.jpg";
import Button from "../components/Common/Button";
import useAuth from "../hooks/useAuth";

const GREEN = "#69d38b";

function Reveal({ className = "", children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} reveal ${visible ? "is-visible" : ""}`}>
      {children}
    </div>
  );
}

const portals = [
  {
    role: "Worker",
    title: "Workers",
    email: "worker@demo.com",
    points: ["Build a verified profile", "Discover matched jobs", "Track every application"],
  },
  {
    role: "Employer",
    title: "Employers",
    email: "employer@demo.com",
    points: ["Post jobs in minutes", "Search vetted candidates", "Move hires through a pipeline"],
  },
  {
    role: "Admin",
    title: "Admins",
    email: "admin@demo.com",
    points: ["Review verifications", "Monitor platform health", "Keep trust scores honest"],
  },
];

const trustFeatures = [
  ["Verified skills", "Every skill is checked against documents before it shows as verified on a profile."],
  ["Transparent trust score", "A single 0-100 score computed from skills, ratings, experience, and completions."],
  ["Real employer ratings", "Only confirmed hires can rate a worker, so feedback stays honest."],
];

const stats = [
  ["5k+", "Verified workers"],
  ["2k+", "Active employers"],
  ["98%", "Trust transparency"],
];

const testimonials = [
  { name: "Ravi Kumar", role: "Electrician · Delhi", quote: "Verified my skills and got three interview calls in the first week. Employers reached out before I even applied anywhere.", rating: 5 },
  { name: "Sita Devi", role: "Plumber · Mumbai", quote: "Companies see my experience before they call. No more wasted trips to a site that was never going to hire.", rating: 5 },
  { name: "Anil Sharma", role: "Contractor · BuildRight", quote: "We used to shortlist from a pile of resumes. Now we filter by trust score and verified skills first.", rating: 5 },
  { name: "Priya Nair", role: "Housekeeping · Kochi", quote: "The pipeline kept me updated on every stage. I always knew what was happening with my application.", rating: 5 },
  { name: "Rohit Verma", role: "Operations · CityFix", quote: "Hiring pipeline plus ratings means we onboard people we already trust. Turnaround time dropped by half.", rating: 4 },
];

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-slate-700 transition-transform duration-200 hover:translate-x-2 dark:text-[#e9edef]">
      <CheckMark />
      <span className="text-sm sm:text-base">{children}</span>
    </li>
  );
}

function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className={`text-xs font-bold uppercase tracking-[0.2em] text-[#2b84ea] ${light ? "text-[#00a884]" : "dark:text-[#00a884]"}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-2xl font-bold sm:text-3xl ${light ? "text-white" : "text-slate-950 dark:text-[#e9edef]"}`}>{title}</h2>
      <span aria-hidden="true" className="mx-auto mt-4 block h-1 w-6 rounded bg-[#69d38b]" />
      {description && <p className={`mt-4 text-sm ${light ? "text-[#aebac1]" : "text-slate-600 dark:text-[#aebac1]"}`}>{description}</p>}
    </div>
  );
}

function PortalCard({ portal, onNavigate }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[4px_4px_0_#c4ddf9] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[4px_6px_0_#9cc6f5] dark:border-[#2a3942] dark:bg-[#202c33] dark:shadow-[4px_4px_0_rgba(0,168,132,0.4)] dark:hover:shadow-[4px_6px_0_rgba(0,168,132,0.6)]">
      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f1fd] text-lg font-black text-[#2b84ea] dark:bg-[#2a3942] dark:text-[#00a884]">
        {portal.title[0]}
      </span>
      <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-[#e9edef]">{portal.title}</h3>
      <ul className="mt-4 space-y-2.5">
        {portal.points.map((point) => (
          <CheckItem key={point}>{point}</CheckItem>
        ))}
      </ul>
      <div className="mt-6 flex flex-1 flex-col justify-end gap-1">
        <Button variant="ghost" className="justify-start px-0 font-bold" onClick={() => onNavigate?.("/login")}>
          Try the demo →
        </Button>
        <p className="text-xs font-semibold text-slate-400 dark:text-[#8696a0]">{portal.email}</p>
      </div>
    </article>
  );
}

function MockJobCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[4px_4px_0_#c4ddf9] dark:border-[#2a3942] dark:bg-[#202c33] dark:shadow-[4px_4px_0_rgba(0,168,132,0.4)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2b84ea] dark:text-[#00a884]">Recommended job</p>
        <span className="rounded-full bg-[#e9f8ef] px-2.5 py-1 text-xs font-bold text-[#1f9d55] dark:bg-[#005c4b] dark:text-[#25d366]">
          92% match
        </span>
      </div>
      <h4 className="mt-3 text-lg font-bold text-slate-950 dark:text-[#e9edef]">Industrial Electrician</h4>
      <p className="mt-1 text-sm text-slate-500 dark:text-[#8696a0]">BuildRight Contractors · 5 km away</p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-[#aebac1]">Rs 25,000 - 35,000 / month</p>
      <button type="button" className="mt-5 w-full cursor-pointer rounded-lg bg-[#2b84ea] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1f6fce] dark:bg-[#00a884] dark:hover:bg-[#06cf9c]" onClick={(event) => event.preventDefault()}>
        Apply now
      </button>
    </div>
  );
}

function Typewriter({ words, className }) {
  const [text] = useTypewriter({
    words,
    loop: true,
    typeSpeed: 85,
    deleteSpeed: 45,
    delaySpeed: 1800,
  });

  return (
    <span className={className}>
      {text}
      <span aria-hidden="true" className="inline-block w-[2px] translate-y-1 bg-[#69d38b] animate-pulse" style={{ height: "0.9em" }} />
    </span>
  );
}

function Spacer() {
  return (
    <svg viewBox="0 0 1440 72" className="block h-10 w-full text-slate-50 sm:h-14 dark:text-[#0b141a]" preserveAspectRatio="none" aria-hidden="true">
      <path fill="currentColor" d="M0 72V36c240 36 480 36 720 0s480-36 720 0v36z" />
    </svg>
  );
}

export default function Landing({ onNavigate }) {
  const { user, profile, dashboardPath, isAuthenticated } = useAuth();
  const displayName = profile?.name || profile?.companyName || null;

  return (
    <main>
      <div className="bg-[#0b2545] px-4 py-2.5 text-center text-xs text-blue-100 dark:border-b dark:border-[#222d34] dark:bg-[#202c33] dark:text-[#aebac1]">
        <span className="inline-flex flex-wrap items-center justify-center gap-2 font-medium">
          New: trust scores are now visible to verified employers.
          <button type="button" className="cursor-pointer font-bold text-[#69d38b] hover:underline" onClick={() => onNavigate?.("/register")}>
            Learn more →
          </button>
        </span>
      </div>

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#071b36] via-[#0d2d57] to-[#16508c] text-white dark:from-[#0b141a] dark:via-[#101f26] dark:to-[#16382e]">
        <img src={heroBg} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071b36]/95 via-[#0d2d57]/75 to-transparent dark:from-[#111b21]/95 dark:via-[#111b21]/75 dark:to-transparent" />
        <div aria-hidden="true" className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-[#2b84ea]/30 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#69d38b]/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-[3.4rem]">
              Power your hiring, <br className="hidden sm:block" />
              <Typewriter
                words={["grow your workforce.", "hire verified talent.", "advance your career.", "build your dream team."]}
                className="text-[#69d38b]"
              />
            </h1>
            <span aria-hidden="true" className="mt-6 block h-1 w-6 rounded bg-[#69d38b]" />
            <p className="mt-5 max-w-xl text-base text-slate-300">
              Verified blue-collar profiles, transparent trust scores, and a hiring pipeline that moves
              workers and employers forward — all in one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Button onClick={() => onNavigate?.(dashboardPath)}>
                    {displayName ? `Go to dashboard, ${displayName.split(" ")[0]}` : "Go to dashboard"}
                  </Button>
                  {user?.role === "WORKER" && (
                    <Button
                      variant="ghost"
                      className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                      onClick={() => onNavigate?.("/worker/jobs")}
                    >
                      Browse jobs
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={() => onNavigate?.("/login")}>Sign up now</Button>
                  <Button
                    variant="ghost"
                    className="border border-white/30 bg-transparent text-white hover:bg-white/10"
                    onClick={() => onNavigate?.("/register")}
                  >
                    Create account
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <Reveal>
              <div className="animate-float overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[6px_6px_0_rgba(46,132,234,0.9)] dark:border-[#2a3942] dark:bg-[#202c33] dark:shadow-[6px_6px_0_rgba(0,168,132,0.6)]">
                <img
                  src={heroImage}
                  alt="KaushalSetu platform preview"
                  className="h-52 w-full object-cover"
                  loading="eager"
                />
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2b84ea] dark:text-[#00a884]">Trust at a glance</p>
                  <dl className="mt-4 grid gap-5">
                    {stats.map(([value, label]) => (
                      <div key={label} className="flex items-baseline justify-between gap-4">
                        <dt className="text-sm font-medium text-slate-500 dark:text-[#aebac1]">{label}</dt>
                        <dd className="text-xl font-black text-slate-950 dark:text-[#e9edef]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <span aria-hidden="true" className="mt-5 block h-1 w-6 rounded bg-[#69d38b]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <Spacer />
      </section>

      <section className="bg-slate-50 py-16 dark:bg-[#0b141a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="One platform, three portals"
            title="Supercharge your hiring with KaushalSetu"
            description="Built for every side of the hiring journey — from first application to first day on site."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {portals.map((portal) => (
              <PortalCard key={portal.role} portal={portal} onNavigate={onNavigate} />
            ))}
          </div>

          <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[4px_4px_0_#c4ddf9] dark:border-[#2a3942] dark:bg-[#202c33] dark:shadow-[4px_4px_0_rgba(0,168,132,0.4)]">
            <div className="grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center lg:p-12">
              <div>
                <h3 className="text-2xl font-bold text-slate-950 sm:text-3xl dark:text-[#e9edef]">
                  The all-powerful{" "}
                  <span className="text-[#2b84ea] dark:text-[#00a884]">job matching</span>
                </h3>
                <ul className="mt-8 space-y-3">
                  <CheckItem>Smart match scoring against every open job</CheckItem>
                  <CheckItem>Skill-based recommendations updated daily</CheckItem>
                  <CheckItem>Nearby jobs with distance and salary clarity</CheckItem>
                  <CheckItem>Apply in one click with a verified profile</CheckItem>
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => onNavigate?.(isAuthenticated ? "/worker/jobs" : "/register")}>Explore jobs</Button>
                  <Button variant="secondary" onClick={() => onNavigate?.("/worker")}>How it works</Button>
                </div>
              </div>
              <MockJobCard />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111b21] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            light
            eyebrow="Why KaushalSetu"
            title="Built on trust, every step of the way"
            description="Verification without a middleman. Transparency you can see on every profile."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map(([title, text]) => (
              <article key={title} className="group rounded-2xl border border-[#2a3942] bg-[#202c33] p-6 shadow-[4px_4px_0_rgba(0,168,132,0.35)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[4px_6px_0_rgba(0,168,132,0.55)]">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#aebac1]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark:bg-[#0b141a] bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by workers and employers"
            description="Real stories from the people who hire and get hired on KaushalSetu."
          />
          <div className="relative mt-12">
            <Swiper
              modules={[Navigation, Autoplay]}
              loop
              slidesPerView={1}
              spaceBetween={16}
              centeredSlides
              grabCursor
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".testimonial-next",
                prevEl: ".testimonial-prev",
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="testimonial-swiper py-4 px-2"
            >
              {testimonials.map((item) => (
                <SwiperSlide key={item.name} className="!h-auto my-2 mr-2">
                  <article className="flex h-full flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-6 shadow-[4px_4px_0_#c4ddf9] transition-transform duration-300 ease-out hover:-translate-y-2 dark:border-[#2a3942] dark:bg-[#202c33] dark:shadow-[4px_4px_0_rgba(0,168,132,0.4)]">
                    <div aria-label={`${item.rating} out of 5 stars`} className="text-sm text-amber-400">
                      {"★".repeat(item.rating)}
                      {"☆".repeat(5 - item.rating)}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700 dark:text-[#e9edef]">“{item.quote}”</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[#2b84ea] text-sm font-bold text-white dark:bg-[#00a884]">
                        {item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-[#e9edef]">{item.name}</p>
                        <p className="text-xs text-slate-500 dark:text-[#8696a0]">{item.role}</p>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Previous testimonials"
                className="testimonial-prev grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-[#2b84ea] transition-colors hover:bg-[#e7f1fd] dark:border-[#2a3942] dark:bg-[#202c33] dark:text-[#00a884] dark:hover:bg-[#2a3942]"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next testimonials"
                className="testimonial-next grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-slate-300 bg-white text-[#2b84ea] transition-colors hover:bg-[#e7f1fd] dark:border-[#2a3942] dark:bg-[#202c33] dark:text-[#00a884] dark:hover:bg-[#2a3942]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}