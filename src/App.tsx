import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { createPublishedContent, deletePublishedContent, getPublishedContent, listPublishedContent, type PublishedContent } from "./contentApi";

type Service = { slug: string; title: string; description: string };

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-JO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`));
}

const homeServices = [
  ["قضايا الجرائم الإلكترونية", "فريقنا يضم محامين متخصصين في قضايا الجرائم الإلكترونية في عمان والأردن، لمكافحة الإبتزاز والتهديد الإلكتروني"],
  ["القضايا العمالية", "لدينا أفضل محام عمالي في عمان لتحصيل الحقوق العمالية وتعويضات الفصل التعسفي."],
  ["المطالبات المالية والديون", "تواصل مع أفضل محامي لقضية مطالبات مالية في الأردن من خلالنا"],
  ["قضايا التأمين", "نوفر محامي متخصص في قضايا التأمين في عمان ومتخصص في قضايا التعويضات الناشئة عن حوادث السير"],
  ["العقارات والأجور", "استشارة محام عقارات في الأردن لحل نزاعات الإخلاء وعقود الإيجار."],
  ["قضايا الشركات", "لدينا أفضل محام شركات في عمان متخصص في القانون التجاري ولديه خبرة ممتدة للتعامل مع كافة قضايا الشركات وتقديم الاستشارات القانونية المتخصصة لها"],
];

const services: Service[] = [
  { slug: "companies", title: "محامي شركات في الأردن", description: "نقدم الدعم القانوني الشامل للشركات والمؤسسات، بدءاً من التأسيس والتسجيل، وصياغة العقود التجارية، وحتى الحماية القانونية اليومية وتحصيل الديون." },
  { slug: "labor", title: "محامين قضايا عمالية", description: "صياغة وتدقيق الأنظمة الداخلية للشركات واللوائح التنظيمية، وتمثيل أصحاب العمل والعمال في النزاعات العمالية، وحساب التعويضات العادلة بموجب قانون العمل الأردني" },
  { slug: "insolvency", title: "محامي إعسار في عمان", description: "نرافق الشركات والمنشآت التي تواجه تعثراً مالياً لحمايتها من التصفية الجبرية، وتطبيق حلول إعادة الهيكلة وجدولة الديون وفقاً لقانون الإعسار الأردني." },
  { slug: "cybercrime", title: "محامي جرائم إلكترونية في الأردن", description: "حماية خصوصيتك الرقمية وسمعتك التجارية. نتولى ملاحقة قضايا الابتزاز، الاحتيال المالي الإلكتروني، والقرصنة عبر منصات التواصل والإنترنت بأعلى درجات السرية." },
  { slug: "criminal", title: "محامي قضايا جزائية في الأردن", description: "تمثيل قانوني صارم ودفاع استراتيجي في كافة القضايا الجنائية والجنحوية، والدفاع عن الحقوق الشخصية واستردادها أمام المحاكم المختصة لحماية حريتك وسمعتك" },
];

const blogTitles = [
  "القضايا الشائعة في المحاكم الأردنية وإجراءاتها واختصاصات القضاء",
  "نطاق تطبيق نظام المعاملات المدنية السعودي وآلية احتساب المدد النظامية",
  "الشخصية الطبيعية وأحكام القرابة ودرجاتها في نظام المعاملات المدنية السعودي",
  "كيفية معالجة الجرائم الإلكترونية: خطوات قانونية تنصح بها شركة محاماة في الأردن",
  "التزييف العميق واختراق الخصوصية وتركيب الصور والفيديوهات المادة 20 جرائم إلكترونية أردني",
  "ملاحقة الجرائم الإلكترونية المرتكبة من خارج الأردن | المادة 38 جرائم إلكترونية",
  "عقوبة نشر الأخبار الكاذبة والشائعات الرقمية | قانون الجرائم الإلكترونية الأردني",
  "عقوبة سرقة واختراق المحافظ الإلكترونية وكليك",
  "حيازة وتداول أدوات وكلمات سر بهدف ارتكاب جرائم",
  "القرصنة الإلكترونية والاعتداء على الملكية الفكرية البرمجية",
  "عقوبة تحويل الأموال غير المشروع والاحتيال الرقمي",
  "الاحتيال الإلكتروني والاعتداء على البطاقات المصرفية",
  "انتحال الشخصية والتزوير الرقمي",
  "جريمة الدخول غير المصرح به للأنظمة المعلوماتية",
  "المسؤولية القانونية في الفضاء الرقمي: خطاب الكراهية والذم والقدح والتحقير",
  "حجية الدليل الرقمي في القانون الأردني: القيمة القانونية للرسائل والتسجيلات الإلكترونية",
  "اغتيال السمعة الرقمية: كيف تواجه الابتزاز والتشهير الإلكتروني؟",
  "التعديلات الجديدة لعام 2026 على منح الجنسية الأردنية والإقامة للمستثمر الأجنبي وعائلته",
  "عقود العمل عن بعد وطرق حماية الشركات لأسرارها وملكيتها الفكرية",
  "شرط التحكيم كوسيلة بديلة لحل النزاعات",
  "الأركان القانونية لترخيص المتاجر الإلكترونية وحماية البيانات في الأردن لعام 2026",
  "آليات قانون الإعسار الأردني: طوق النجاة لإعادة هيكلة الشركات وحمايتها من الإفلاس",
  "دليل الاستثمار الأجنبي في الأردن لعام 2026: الشروط، الحوافز، والقيود القطاعية",
  "الامتثال والنزاعات الضريبية للشركات في الأردن وكيفية تجنب الغرامات الفورية",
  "دليل حوكمة الشركات في الأردن: تنظيم الصلاحيات والامتثال القانوني",
  "حوكمة الشركات العائلية وآليات انتقال الإدارة في القانون الأردني",
  "الفرق بين الشركة ذات المسؤولية المحدودة والمساهمة الخاصة بالقانون الأردني",
  "دليل الشركات ذات المسؤولية المحدودة في الأردن",
  "توازن الحقوق والواجبات في قانون العمل والنزاعات العمالية في الأردن",
  "الاستشارة القانونية في الأردن",
  "العقود والاتفاقيات القانونية في الأردن",
  "قضايا الأفراد والتمثيل القضائي في الأردن",
  "قضايا الشركات والاستشارات التجارية في الأردن",
  "دليل للمتضررين من الاحتيال الإلكتروني في الأردن",
  "الحماية القانونية للإجازة السنوية في القانون الأردني",
  "نموذج عقد عمل تحت التجربة",
  "الطبيعة القانونية لسند الأمانة في التشريع الأردني",
  "المحامي القوي حجر الزاوية والأساس المتين في نجاح القضية",
  "إلغاء الحماية الجزائية عن الشيكات البنكية في القانون الأردني",
  "حبس المدين التنفيذي في القانون الأردني",
  "المسؤولية القانونية عن أخطاء أنظمة الذكاء الاصطناعي في التشريع الأردني",
  "جريمة الاحتيال المباشر والإلكتروني في الأردن",
  "التعويض عن الإصابات الجسدية في القانون الأردني",
  "تأسيس الشركات في الأردن من حيث الطريقة المثلى للمستثمرين",
  "الحكمة في اختيار المحامي لضمان التمثيل القانوني الأمثل",
  "المحامي المتخصص: لماذا هو خيارك الأفضل؟",
];

const blogDates = [
  "2026-09-09", "2026-08-30", "2026-08-30", "2026-08-24", "2026-08-24", "2026-08-24",
  "2026-08-12", "2026-08-12", "2026-08-11", "2026-08-11", "2026-08-11", "2026-07-27",
  "2026-07-26", "2026-07-26", "2026-07-19", "2026-07-19", "2026-07-19", "2026-07-18",
  "2026-07-13", "2026-07-04", "2026-07-02", "2026-07-01", "2026-07-01", "2026-07-01",
  "2026-07-01", "2026-06-29", "2026-06-27", "2026-06-27", "2026-06-07", "2026-06-07",
  "2026-05-21", "2026-05-21", "2026-05-21", "2026-05-18", "2026-02-16", "2026-01-19",
  "2026-01-19", "2026-01-14", "2026-01-14", "2026-01-14", "2026-01-10", "2025-10-29",
  "2025-10-14", "2025-10-07", "2025-10-07", "2025-10-07",
];

const blogPosts = blogTitles.map((title, index) => ({
  title,
  date: blogDates[index],
}));

const laws = [
  ["قانون الجرائم الإلكترونية رقم 17 لسنة 2023 مع آخر التعديلات حتى 2026", "27 يوليو 2026"],
  ["قانون محاكم الصلح 2026", "2 يونيو 2026"],
  ["قانون الأحوال المدنية وفقاً لآخر التعديلات حتى 2026", "17 مايو 2026"],
  ["قانون التنفيذ الأردني وفقاً لآخر التعديلات حتى 2026", "10 يناير 2026"],
  ["قانون المالكين والمستأجرين مع كامل التعديلات", "2 أكتوبر 2024"],
  ["قانون أصول المحاكمات المدنية", "20 مارس 2021"],
  ["القانون المدني في الأردن", "16 مارس 2021"],
  ["نصوص تنفيذ الاحكام الأجنبية في مصر", "13 أكتوبر 2012"],
];

const faqs = [
  ["ما هي آليتكم في تجنب النزاعات القضائية للشركات؟", "يعتمد فريقنا في شركة بيت الترافع على حلول استباقية تتضمن مراجعة وصياغة العقود بدقة متناهية وتقديم استشارات قانونية تجارية مستمرة تغلق أي ثغرات قانونية قبل نشوب النزاع، مما يوفر على المنشأة الوقت والتكاليف القضائية."],
  ["كيف يضمن محامي شركات في عمان صياغة عقود عمل تحمي المنشأة والموظف معاً؟", "يقوم محامي شركات في عمان بدراسة طبيعة عمل مؤسستك وصياغة لوائح داخلية وعقود عمل تتوافق مع قانون العمل الأردني، مما يضمن تحديد الواجبات والحقوق بوضوح ويمنع الخلافات العمالية المستقبلية."],
  ["ما الذي يميز استشاراتكم القانونية التجارية عن غيرها؟", "نتميز كوننا مكتب محاماة في عمان يدمج بين الفهم القانوني العميق والوعي البيئي والتجاري للأعمال، حيث لا نكتفي بإعطاء رأي قانوني مجرد، بل نوفر حلولاً استراتيجية تدعم نمو استثماراتكم وتدفقاتكم المالية بأمان."],
  ["لماذا شركة بيت الترافع من ضمن أفضل شركات المحاماة في الأردن وعمان؟", "لأننا في شركة بيت الترافع لا نقدم خدمات قانونية تقليدية، بل نضم نخبة مميزة من أفضل المحامين والمستشارين القانونيين في الأردن وعمان، ممن يملكون خبرة عميقة وسجلاً حافلاً بالنجاحات في أعقد القضايا والنزاعات. نحن نجمع بين الفهم الدقيق للتشريعات المحلية والدولية والالتزام المطلق بحماية مصالح عملائنا، والخبرة التخصصية في الشؤون التجارية والمدنية، والقدرة على التمثيل القانوني القوي أمام المحاكم، مما يجعلنا الشريك القانوني الأكثر موثوقية لأعمالكم واستثماراتكم."],
  ["هل تقدمون استشارات قانونية للشركات وللمستثمرين من دول الخليج العربي في الأردن؟", "نعم، توفر شركة بيت الترافع كشركة محاماة في الأردن وعمان خدمات الدعم والتأطير القانوني الشامل للمستثمرين والشركات الخليجية والأجنبية في الأردن، بدءاً من التأسيس وصياغة العقود وحتى التمثيل القانوني وتحصيل الحقوق."],
];

const nav = [
  ["/", "الرئيسية"],
  ["/about", "من نحن"],
  ["/services", "خدماتنا"],
  ["/blog", "المدونة"],
  ["/laws", "القوانين"],
  ["/faq", "الأسئلة الشائعة"],
  ["/contact", "تواصل معنا"],
];

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { path, go };
}

function Link({ to, go, className = "", children, onClick, ariaLabel }: { to: string; go: (to: string) => void; className?: string; children: ReactNode; onClick?: () => void; ariaLabel?: string }) {
  return <a href={to} className={className} aria-label={ariaLabel} onClick={(event) => { event.preventDefault(); onClick?.(); go(to); }}>{children}</a>;
}

function Arrow() {
  return <span aria-hidden="true" className="arrow">←</span>;
}

type IconName = "shield" | "work" | "wallet" | "document" | "home" | "building" | "phone" | "pin" | "instagram" | "facebook" | "x" | "whatsapp" | "copy" | "share";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9.4 12 1.7 1.7 3.7-4" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2" /></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h11" /><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" /></>,
    document: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 12h6M9 16h6" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    building: <><path d="M4 21V6l8-3 8 3v15M2 21h20" /><path d="M8 8h1M15 8h1M8 12h1M15 12h1M8 16h1M15 16h1" /></>,
    phone: <path d="M7 3 4 5c0 8.3 6.7 15 15 15l2-3-5-3-2 2c-2.7-1.1-4.9-3.3-6-6l2-2-3-5Z" />,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    facebook: <path d="M14 21v-8h3l.5-4H14V7.5c0-1.2.4-2 2.1-2H18V2.2c-.7-.1-1.7-.2-2.8-.2-3 0-5.2 1.9-5.2 5.3V9H7v4h3v8" />,
    x: <path d="m4 3 16 18M20 3 4 21" />,
    whatsapp: <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z" /><path d="M9 8c.5 3 2 4.5 5 5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></>,
  };
  return <svg className="icon" aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ to, go, children, secondary = false, onClick }: { to: string; go: (to: string) => void; children: ReactNode; secondary?: boolean; onClick?: () => void }) {
  return <Link to={to} go={go} onClick={onClick} className={`button ${secondary ? "button-secondary" : ""}`}>{children}<Arrow /></Link>;
}

function Navbar({ path, go }: { path: string; go: (to: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="nav-shell">
        <Link to="/" go={go} className="brand" onClick={() => setOpen(false)}>
          <img src="/assets/logo-light.png" alt="بيت الترافع لأعمال المحاماة والتحكيم" />
        </Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {nav.map(([to, label]) => <Link key={to} to={to} go={go} className={path === to ? "active" : ""}>{label}</Link>)}
        </nav>
        <Button to="/contact" go={go} onClick={() => setOpen(false)}>احجز استشارة</Button>
        <button className="menu-button" aria-label="فتح القائمة" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span></span><span></span>
        </button>
      </div>
      <div className={`mobile-nav ${open ? "open" : ""}`}>
        {nav.map(([to, label], index) => <Link key={to} to={to} go={go} onClick={() => setOpen(false)}><small>{String(index + 1).padStart(2, "0")}</small>{label}</Link>)}
        <Button to="/contact" go={go} onClick={() => setOpen(false)}>احجز استشارة</Button>
      </div>
    </header>
  );
}

function SectionHeader({ eyebrow, title, intro, light = false }: { eyebrow?: string; title: string; intro?: string; light?: boolean }) {
  return (
    <div className={`section-header ${light ? "light" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}

function PageHero({ title, intro, visual }: { title: string; intro?: string; visual?: "about" | "services" | "blog" | "laws" | "faq" | "contact" }) {
  const image = visual === "about"
    ? "/assets/about-banner.jpg"
    : visual === "services"
      ? "/assets/services-banner.jpg"
      : visual === "blog"
        ? "/assets/blog-banner.jpg"
      : visual === "laws"
        ? "/assets/laws-banner.jpg"
        : visual === "faq"
          ? "/assets/faq-banner.jpg"
          : visual === "contact"
            ? "/assets/contact-banner.jpg"
          : "";
  const imageAlt = visual === "about"
    ? "مناقشة وثائق قانونية بين محامين"
    : visual === "services"
      ? "ملف قانوني ووثائق مهنية"
      : visual === "blog"
        ? "مكتبة ومراجع قانونية"
      : visual === "laws"
        ? "كتب ومراجع قانونية"
        : visual === "faq"
          ? "مرجع قانوني للإرشاد والاستشارة"
          : visual === "contact"
            ? "جلسة استشارة قانونية"
          : "";
  return (
    <section className={`page-hero ${visual ? `page-hero-${visual}` : ""}`}>
      <div className="container page-hero-inner">
        <div className="page-hero-copy">
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        {image && <div className={`banner-visual banner-${visual}`}><img src={image} alt={imageAlt} /></div>}
      </div>
    </section>
  );
}

function Hero({ go }: { go: (to: string) => void }) {
  return (
    <section className="hero">
      <div className="hero-grid container">
        <div className="hero-content">
          <p className="hero-label">شركة بيت الترافع لأعمال المحاماة والتحكيم</p>
          <h1>الأمان القانوني يبدأ من القرار الصحيح</h1>
          <div className="hero-actions"><Button to="/contact" go={go}>احجز استشارة</Button><Button to="/about" go={go} secondary>تعرّف علينا</Button></div>
        </div>
        <div className="hero-visual-wrap">
          <div className="hero-reveal-image"><img src="/assets/hero-legal.jpg" alt="مشهد مهني لمراجعة ملف قانوني" /></div>
          <div className="hero-document" aria-hidden="true">
            <div className="document-sheet back"><i></i><i></i><i></i></div>
            <div className="document-sheet front">
              <div className="doc-mark"><img src="/assets/logo-hero.png" alt="" /></div>
              <div className="seal">2014</div>
            </div>
            <div className="strike"><span></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeIndex({ item, index, go }: { item: string[]; index: number; go: (to: string) => void }) {
  const icons: IconName[] = ["shield", "work", "wallet", "document", "home", "building"];
  return (
    <article className="practice-row">
      <div className="practice-card-top"><span className="practice-no">{String(index + 1).padStart(2, "0")}</span><Icon name={icons[index]} /></div>
      <div><h3>{item[0]}</h3><p>{item[1]}</p></div>
      <Link to="/services" go={go} ariaLabel={`اكتشف المزيد عن ${item[0]}`}><Arrow /></Link>
    </article>
  );
}

function TeamCard({ person, index, go }: { person: "abdullah" | "layla"; index: number; go: (to: string) => void }) {
  const info = person === "abdullah"
    ? { name: "عبدالله الزبيدي", role: "إدارة الشركة", exp: "أكثر من 13 عاماً من الخبرة", letter: "ع" }
    : { name: "ليلى خالد أبو الرُب", role: "محامية", exp: "أكثر من 10 سنوات من الخبرة", letter: "ل" };
  return (
    <article className="team-card">
      <div className="team-visual">
        {person === "abdullah" ? <img src="/assets/abdullah.jpg" alt="المحامي عبدالله الزبيدي" /> : <span className="portrait-letter">{info.letter}</span>}
      </div>
      <div className="team-info"><h3>{info.name}</h3><p>{info.role}</p><span>{info.exp}</span>
        <Link to={`/team/${person}`} go={go}>عرض الملف الكامل <Arrow /></Link>
      </div>
    </article>
  );
}

function Consultation({ go }: { go: (to: string) => void }) {
  return (
    <section className="consultation">
      <div className="container consultation-inner">
        <div><h2>احجز استشارتك</h2><p>خطوة هادئة ومدروسة نحو حماية موقفك القانوني.</p></div>
        <Button to="/contact" go={go}>احجز استشارة</Button>
      </div>
    </section>
  );
}

function Home({ go }: { go: (to: string) => void }) {
  return (
    <>
      <Hero go={go} />
      <section className="about-intro">
        <div className="container editorial-split">
          <SectionHeader eyebrow="عن الشركة" title="خبرة قانونية ترى الصورة كاملة." />
          <div className="about-copy">
            <p>مرحباً بكم في شركة محاماة الأردن بيت الترافع لأعمال المحاماة والتحكيم بإدارة المحامي عبدالله الزبيدي، الذي يمتلك خبرة تمتد لـ 13 سنة في مجال القانون.</p>
            <p>في شركة بيت الترافع لأعمال المحاماة والتحكيم نحرص على تحديث معرفتنا بأحدث التطورات القانونية والتقنية لضمان تقديم خدمة أفضل لعملائنا.</p>
            <Button to="/about" go={go} secondary>تعرف علينا</Button>
          </div>
        </div>
      </section>
      <section className="services-home">
        <div className="container"><SectionHeader title="مجالات الممارسة" intro="دليل مختصر للمجالات القانونية التي نخدمها بخبرة متخصصة." />
          <div className="practice-index">{homeServices.map((item, index) => <PracticeIndex key={item[0]} item={item} index={index} go={go} />)}</div>
        </div>
      </section>
      <section className="home-editorial"><div className="container"><div className="home-editorial-image"><img src="/assets/contracts.jpg" alt="مراجعة وثائق قانونية" /></div><div><SectionHeader eyebrow="عن ممارستنا" title="معرفة قانونية تواكب المستجدات." /><p>في شركة بيت الترافع لأعمال المحاماة والتحكيم نحرص على تحديث معرفتنا بأحدث التطورات القانونية والتقنية لضمان تقديم خدمة أفضل لعملائنا.</p><Button to="/about" go={go}>تعرف علينا</Button></div></div></section>
      <Consultation go={go} />
    </>
  );
}

function About({ go }: { go: (to: string) => void }) {
  return (
    <>
      <PageHero title="من نحن" intro="مؤسسة قانونية أردنية تنظر إلى المحاماة بوصفها أماناً يبدأ قبل النزاع." visual="about" />
      <section className="story"><div className="container story-grid"><div><h2>من عمّان، منذ عام 2014.</h2></div><div className="story-record"><p>تأسست شركة بيت الترافع لأعمال المحاماة والتحكيم عام 2014.</p><dl><div><dt>الموقع</dt><dd>عمّان - شارع الأميرة رحمة بنت الحسن</dd></div><div><dt>مجال العمل</dt><dd>المحاماة والتحكيم والاستشارات القانونية</dd></div></dl></div></div></section>
      <section className="vision"><div className="container vision-grid">
        <article><span>01 / الرؤية</span><h3>إعادة تعريف مفهوم المحاماة والاستشارات القانونية في الأردن من خلال الانتقال من الدفاع التقليدي إلى الأمان القانوني.</h3></article>
        <article><span>02 / الرسالة</span><h3>تقديم خدمات قانونية وتمثيل قضائي يرتكز على السرية المطلقة، السرعة في الإجراءات، الشفافية الكاملة مع العميل.</h3></article>
      </div></section>
      <section className="about-support"><div className="container">
        <div className="about-support-visual"><img src="/assets/hero-legal.jpg" alt="معالجة مهنية لملف قانوني" /></div>
        <div><p className="eyebrow">منهجية مهنية</p><h2>تحديث المعرفة القانونية والتقنية.</h2><p>في شركة بيت الترافع لأعمال المحاماة والتحكيم نحرص على تحديث معرفتنا بأحدث التطورات القانونية والتقنية لضمان تقديم خدمة أفضل لعملائنا.</p></div>
      </div></section>
      <section className="about-practices"><div className="container">
        <SectionHeader eyebrow="تخصصات الفريق" title="فريق قانوني متعدد الخبرات." intro="لدينا فريق من المحامين المتخصصين في العديد من المجالات القضائية، ويعمل كل تخصص ضمن رؤية قانونية متكاملة." />
        <div className="about-practices-grid">
          {homeServices.map(([title, description], index) => {
            const icons: IconName[] = ["shield", "work", "wallet", "document", "home", "building"];
            return <article key={title}><div className="about-practice-icon"><Icon name={icons[index]} size={24} /></div><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{description}</p></article>;
          })}
        </div>
      </div></section>
      <section className="team-section"><div className="container"><SectionHeader eyebrow="الفريق" title="الخبرة في خدمة القرار." /><div className="team-grid"><TeamCard person="abdullah" index={1} go={go} /><TeamCard person="layla" index={2} go={go} /></div></div></section>
      <Consultation go={go} />
    </>
  );
}

function Services({ go }: { go: (to: string) => void }) {
  return (
    <>
      <PageHero title="خدماتنا" intro="خمس ممارسات قانونية واضحة، تتعامل مع احتياجك دون تعقيد." visual="services" />
      <section className="services-list"><div className="container">
        {services.map((service, index) => <article key={service.slug}><div className="service-card-index"><span className="list-no">{String(index + 1).padStart(2, "0")}</span><Icon name={(["building", "work", "wallet", "shield", "document"] as IconName[])[index]} /></div><div><h2>{service.title}</h2><p>{service.description}</p></div><Link className="service-button" to={`/services/${service.slug}`} go={go}>اقرأ المزيد <Arrow /></Link></article>)}
      </div></section>
      <Consultation go={go} />
    </>
  );
}

function ServiceDetail({ slug, go }: { slug: string; go: (to: string) => void }) {
  const service = services.find((item) => item.slug === slug) || services[0];
  return (
    <>
      <section className="detail-page"><div className="container narrow">
        <Breadcrumb items={[["الرئيسية", "/"], ["خدماتنا", "/services"], [service.title, ""]]} go={go} />
        <h1>{service.title}</h1>
        <div className="detail-rule"></div><p className="lead">{service.description}</p>
      </div></section>
      <Consultation go={go} />
    </>
  );
}

function LawyerProfile({ person, go }: { person: string; go: (to: string) => void }) {
  const abdullah = person === "abdullah";
  const data = abdullah
    ? { index: "01", name: "عبدالله الزبيدي", role: "إدارة الشركة", exp: "أكثر من 13 سنة", areas: ["الشركات", "المنازعات التجارية", "الجرائم الإلكترونية"], phone: "+962 79 808 0228", letter: "ع" }
    : { index: "02", name: "ليلى خالد أبو الرُب", role: "محامية", exp: "أكثر من 10 سنوات", areas: ["القضايا العمالية", "التنفيذ", "المطالبات المالية", "الإجراءات القانونية أمام الجهات الرسمية"], phone: "+962 78 234 3333", letter: "ل" };
  return (
    <>
      <section className="profile-head"><div className="container">
        <Breadcrumb items={[["الرئيسية", "/"], ["من نحن", "/about"], [data.name, ""]]} go={go} />
        <div className="profile-grid"><div><h1>{data.name}</h1><p className="profile-role">{data.role}</p>
          <div className="profile-stats"><div><span>الخبرة</span><strong>{data.exp}</strong></div><div><span>الدور</span><strong>{data.role}</strong></div><div><span>رقم التلفون</span><strong dir="ltr">{data.phone}</strong></div><div><span>واتس</span><a className="profile-whatsapp" href={`https://wa.me/${data.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={15} />فتح واتساب</a></div></div>
        </div><div className={`profile-portrait ${abdullah ? "has-photo" : ""}`}>{abdullah ? <img src="/assets/abdullah.jpg" alt="المحامي عبدالله الزبيدي" /> : <span>{data.letter}</span>}</div></div>
      </div></section>
      <section className="expertise"><div className="container narrow"><SectionHeader title="مجالات العمل" intro="خبرات عملية متخصصة تُدار ضمن منهج قانوني واضح." /><ol className="expertise-list">{data.areas.map((area, index) => <li key={area}><span>{String(index + 1).padStart(2, "0")}</span><h3>{area}</h3></li>)}</ol></div></section>
      <Consultation go={go} />
    </>
  );
}

function Blog({ go }: { go: (to: string) => void }) {
  const [visible, setVisible] = useState(12);
  const [published, setPublished] = useState<PublishedContent[]>([]);
  useEffect(() => {
    let active = true;
    listPublishedContent("blog").then((items) => { if (active) setPublished(items); });
    return () => { active = false; };
  }, []);
  const showMore = () => setVisible((current) => Math.min(current + 12, blogPosts.length));
  return (
    <>
      <PageHero title="المدونة" intro="ملاحظات قانونية مرتبة للقراءة والرجوع." visual="blog" />
      <section className="archive"><div className="container">
        <div className="notes-grid">
          {published.map((post) => <BlogNoteCard key={post.id} post={post} path={`/blog/published/${post.id}`} go={go} />)}
          {blogPosts.slice(0, visible).map((post, index) => <BlogNoteCard key={post.title} post={post} path={`/blog/${index + 1}`} go={go} />)}
        </div>
        {visible < blogPosts.length && <button className="load-more" onClick={showMore}>اكتشف المزيد <Arrow /></button>}
      </div></section>
    </>
  );
}

function BlogNoteCard({ post, path, go }: { post: { title: string; date: string }; path: string; go: (to: string) => void }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Closing the native share dialog should leave the card unchanged.
    }
  };
  return (
    <article className="note-card note-enter">
      <header className="note-card-meta"><time dateTime={post.date}>{formatDate(post.date)}</time><span>مقال قانوني</span></header>
      <h2>{post.title}</h2>
      <nav className="note-card-actions" aria-label={`إجراءات مقال ${post.title}`}>
        <Link to={path} go={go}>اقرأ المقال <Arrow /></Link>
        <button type="button" onClick={share} aria-label={`مشاركة مقال ${post.title}`}><Icon name={copied ? "copy" : "share"} size={15} />{copied ? "تم النسخ" : "مشاركة"}</button>
      </nav>
    </article>
  );
}

function ContentBody({ id, type }: { id: number; type: "article" | "law" }) {
  const [content, setContent] = useState<{ html: string; date: string; source: string } | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setContent(null);
    setMissing(false);
    const directory = type === "article" ? "articles" : "laws";
    fetch(`/content/${directory}/${id}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Content not found");
        return response.json();
      })
      .then(setContent)
      .catch((error) => {
        if (error.name !== "AbortError") setMissing(true);
      });
    return () => controller.abort();
  }, [id, type]);
  if (missing) return <p className="content-unavailable">لا يتوفر نص معتمد لهذه المادة في المصدر القديم.</p>;
  if (!content) return <div className="content-loading"><span></span><span></span><span></span></div>;
  return <article className="imported-content" dangerouslySetInnerHTML={{ __html: content.html }} />;
}

function ArticleDetail({ id, go }: { id: number; go: (to: string) => void }) {
  const post = blogPosts[id - 1] || blogPosts[0];
  return <section className="detail-page article-detail"><div className="container narrow"><Breadcrumb items={[["الرئيسية", "/"], ["المدونة", "/blog"], [post.title, ""]]} go={go} /><h1>{post.title}</h1>{post.date && <time>{formatDate(post.date)}</time>}<div className="detail-rule"></div><ContentBody id={id} type="article" /><ShareControls /><Link to="/blog" go={go} className="back-link"><Arrow /> العودة إلى المدونة</Link></div></section>;
}

function Laws({ go }: { go: (to: string) => void }) {
  const [published, setPublished] = useState<PublishedContent[]>([]);
  useEffect(() => {
    let active = true;
    listPublishedContent("law").then((items) => { if (active) setPublished(items); });
    return () => { active = false; };
  }, []);
  return (
    <>
      <PageHero title="القوانين" intro="أرشيف مرجعي منظم للنصوص القانونية المعتمدة." visual="laws" />
      <section className="laws"><div className="container narrow">
        {published.map((item, index) => <article className="law-card" key={item.id}><div><span>LAW {String(index + 1).padStart(2, "0")}</span><time>{formatDate(item.date)}</time></div><h2>{item.title}</h2><Link to={`/laws/published/${item.id}`} go={go}>عرض القانون <Arrow /></Link></article>)}
        {laws.map(([title, date], index) => <LawCard key={title} title={title} date={date} index={index} go={go} />)}
      </div></section>
    </>
  );
}

function LawCard({ title, date, index, go }: { title: string; date: string; index: number; go: (to: string) => void }) {
  return <article className="law-card"><div><span>LAW {String(index + 1).padStart(2, "0")}</span><time>{date}</time></div><h2>{title}</h2><Link to={`/laws/${index + 1}`} go={go}>عرض القانون <Arrow /></Link></article>;
}

function LawDetail({ id, go }: { id: number; go: (to: string) => void }) {
  const law = laws[id - 1] || laws[0];
  return <section className="detail-page article-detail"><div className="container narrow"><Breadcrumb items={[["الرئيسية", "/"], ["القوانين", "/laws"], [law[0], ""]]} go={go} /><h1>{law[0]}</h1><time>{law[1]}</time><div className="detail-rule"></div><ContentBody id={id} type="law" /><ShareControls /><Link to="/laws" go={go} className="back-link"><Arrow /> العودة إلى القوانين</Link></div></section>;
}

function PublishedDetail({ id, type, go }: { id: string; type: "blog" | "law"; go: (to: string) => void }) {
  const [item, setItem] = useState<PublishedContent | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    getPublishedContent(id).then((content) => {
      if (active) setItem(content?.type === type ? content : null);
    });
    return () => { active = false; };
  }, [id, type]);
  const parentPath = type === "blog" ? "/blog" : "/laws";
  const parentLabel = type === "blog" ? "المدونة" : "القوانين";
  if (item === undefined) return <section className="detail-page"><div className="container narrow"><div className="content-loading"><span></span><span></span><span></span></div></div></section>;
  if (!item) return <section className="detail-page"><div className="container narrow"><h1>المحتوى غير متوفر</h1><Link to={parentPath} go={go} className="back-link"><Arrow /> العودة إلى {parentLabel}</Link></div></section>;
  return <section className="detail-page article-detail"><div className="container narrow">
    <Breadcrumb items={[["الرئيسية", "/"], [parentLabel, parentPath], [item.title, ""]]} go={go} />
    <h1>{item.title}</h1><time>{formatDate(item.date)}</time><div className="detail-rule"></div>
    {item.images.length > 0 && <div className="published-gallery">{item.images.map((image, index) => <img key={`${item.id}-${index}`} src={image} alt={`${item.title} — صورة ${index + 1}`} />)}</div>}
    <article className="published-copy">{item.content}</article>
    <ShareControls /><Link to={parentPath} go={go} className="back-link"><Arrow /> العودة إلى {parentLabel}</Link>
  </div></section>;
}

function ShareControls() {
  const copy = () => navigator.clipboard?.writeText(window.location.href);
  return <div className="share"><span>مشاركة</span><a aria-label="مشاركة عبر واتساب" href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={17} />WhatsApp</a><a aria-label="مشاركة عبر إكس" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"><Icon name="x" size={15} />X</a><a aria-label="مشاركة عبر فيسبوك" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"><Icon name="facebook" size={16} />Facebook</a><button onClick={copy}><Icon name="copy" size={16} />نسخ الرابط</button></div>;
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHero title="الأسئلة الشائعة" intro="إجابات قانونية مختصرة للأسئلة الأكثر تكراراً." visual="faq" />
      <section className="faq"><div className="container narrow">
        {faqs.map(([question, answer], index) => <div className={`faq-item ${open === index ? "open" : ""}`} key={question}>
          <button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><strong>{question}</strong><i>{open === index ? "−" : "+"}</i></button>
          <div className="faq-answer">{answer ? <p>{answer}</p> : <p className="unavailable">لم يتم تزويدنا بإجابة معتمدة لهذا السؤال.</p>}</div>
        </div>)}
      </div></section>
    </>
  );
}

function Contact({ go }: { go: (to: string) => void }) {
  const rows = [
    ["01", "الهاتف", "+962 79 808 0228", "عبدالله الزبيدي", "tel:+962798080228"],
    ["02", "واتساب", "+962 79 808 0228", "المحامي عبدالله الزبيدي", "https://wa.me/962798080228"],
    ["03", "الهاتف", "+962 78 234 3333", "ليلى خالد أبو الرُب", "tel:+962782343333"],
    ["04", "واتساب", "+962 78 234 3333", "المحامية ليلى خالد أبو الرُب", "https://wa.me/962782343333"],
    ["05", "العنوان", "عمّان - شارع الأميرة رحمة بنت الحسن", "", "https://maps.google.com/?q=Princess+Rahma+Bint+Al+Hassan+Street+Amman"],
  ];
  return (
    <>
      <PageHero title="تواصل معنا" intro="الخطوة الأولى نحو القرار القانوني الصحيح." visual="contact" />
      <section className="contact-page"><div className="container contact-grid">
        <div>
          <div className="contact-index">{rows.map(([no, label, value, sub, href]) => <a key={no} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><span className="contact-icon"><Icon name={label === "الهاتف" ? "phone" : label === "واتساب" ? "whatsapp" : "pin"} /></span><small>{label}</small><strong dir={label === "الهاتف" || label === "واتساب" ? "ltr" : "rtl"}>{value}</strong><em>{sub}</em><Arrow /></a>)}</div>
          <div className="email-note"><span>البريد الإلكتروني</span><a dir="ltr" href="mailto:lawyerabdullah960@gmail.com">lawyerabdullah960@gmail.com</a></div>
        </div>
        <div className="location"><div className="map-frame"><span>LOCATION / AMMAN</span><iframe title="موقع شركة بيت الترافع في عمّان" src="https://www.google.com/maps?q=Princess%20Rahma%20Bint%20Al%20Hassan%20Street%2C%20Amman%2C%20Jordan&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div><p>عمّان — شارع الأميرة رحمة بنت الحسن</p><a href="https://maps.google.com/?q=Princess+Rahma+Bint+Al+Hassan+Street+Amman" target="_blank" rel="noreferrer">فتح الموقع <Arrow /></a></div>
      </div></section>
      <section className="contact-final"><div className="container"><h2>جاهز لاتخاذ الخطوة الصحيحة؟</h2><Button to="/contact" go={go}>احجز استشارة</Button></div></section>
    </>
  );
}

function Breadcrumb({ items, go }: { items: string[][]; go: (to: string) => void }) {
  return <nav className="breadcrumb" aria-label="مسار الصفحة">{items.map(([label, to], index) => <span key={label}>{to ? <Link to={to} go={go}>{label}</Link> : label}{index < items.length - 1 && <i>/</i>}</span>)}</nav>;
}

function Login({ go }: { go: (to: string) => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); go("/admin"); };
  return <section className="login"><div className="login-panel"><h1>دخول الإدارة</h1><p>للمحامين والإداريين المخولين فقط.</p><form onSubmit={submit}><Input label="البريد الإلكتروني" type="email" /><Input label="كلمة المرور" type="password" /><button type="submit" className="button">تسجيل الدخول <Arrow /></button></form></div><div className="login-aside"><div className="login-aside-icon"><Icon name="document" size={28} /></div><h2>إدارة المحتوى القانوني بدقة وهدوء.</h2></div></section>;
}

function Input({ label, type = "text", value, onChange }: { label: string; type?: string; value?: string; onChange?: (value: string) => void }) {
  return <label className="input"><span>{label}</span><input required type={type} value={value} onChange={(event) => onChange?.(event.target.value)} /></label>;
}

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxWidth = 1400;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function Admin({ go }: { go: (to: string) => void }) {
  const [type, setType] = useState<"blog" | "law">("blog");
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [items, setItems] = useState<PublishedContent[]>([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [publishing, setPublishing] = useState(false);
  useEffect(() => {
    let active = true;
    listPublishedContent().then((contentItems) => { if (active) setItems(contentItems); });
    return () => { active = false; };
  }, []);
  const handleImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setProcessingImages(true);
    try {
      const compressed = await Promise.all(files.map(compressImage));
      setImages((current) => [...current, ...compressed]);
    } finally {
      setProcessingImages(false);
      event.target.value = "";
    }
  };
  const publish = async (event: FormEvent) => {
    event.preventDefault();
    setPublishing(true);
    try {
      const nextItem = await createPublishedContent({
        type,
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString().slice(0, 10),
        images,
      });
      setItems((current) => [nextItem, ...current]);
      setTitle("");
      setContent("");
      setImages([]);
      setToast(type === "blog" ? "تم نشر المقال في المدونة" : "تم نشر القانون في صفحة القوانين");
    } catch {
      setToast("تعذر النشر. تحقق من اتصال الباك إند وحاول مجددًا.");
    } finally {
      setPublishing(false);
    }
    window.setTimeout(() => setToast(""), 3000);
  };
  const removeItem = async (id: string) => {
    try {
      await deletePublishedContent(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setToast("تعذر حذف المحتوى من الباك إند.");
      window.setTimeout(() => setToast(""), 3000);
    }
  };
  const shareItem = async (item: PublishedContent) => {
    const path = item.type === "blog" ? `/blog/published/${item.id}` : `/laws/published/${item.id}`;
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("تم نسخ رابط المحتوى");
        window.setTimeout(() => setToast(""), 2200);
      }
    } catch {
      // Closing the native share dialog does not require feedback.
    }
  };
  return <section className="admin admin-compose">
    <main className="admin-main"><header><div><span>مساحة الإدارة</span><h1>إنشاء محتوى</h1><p>أنشئ مقالًا أو قانونًا، أضف الصور ثم انشره مباشرة في القسم المختار.</p></div><Link to="/" go={go} className="admin-return">العودة للموقع <Arrow /></Link></header>
      <div className="admin-dashboard">
        <form className="admin-editor" onSubmit={publish}>
          <div className="admin-editor-heading"><div className="admin-step">01</div><div><h2>محتوى جديد</h2><p>حدد القسم واكتب المحتوى الذي تريد نشره.</p></div></div>
          <fieldset className="content-type"><legend>مكان النشر</legend><button type="button" className={type === "blog" ? "selected" : ""} onClick={() => setType("blog")}><Icon name="document" size={21} /><span><b>المدونة</b><small>مقال أو خبر قانوني</small></span></button><button type="button" className={type === "law" ? "selected" : ""} onClick={() => setType("law")}><Icon name="building" size={21} /><span><b>القوانين</b><small>قانون أو مرجع تشريعي</small></span></button></fieldset>
          <Input label="عنوان المحتوى" value={title} onChange={setTitle} />
          <label className="input admin-content-field"><span>المحتوى</span><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="اكتب المقال أو القانون هنا..." /></label>
          <label className="admin-upload"><input type="file" accept="image/*" multiple onChange={handleImages} /><span className="admin-upload-icon">+</span><strong>{processingImages ? "جاري تجهيز الصور..." : "أضف صورًا للمحتوى"}</strong><small>يمكن اختيار عدة صور وإضافة المزيد لاحقًا</small></label>
          {images.length > 0 && <div className="admin-image-preview">{images.map((image, index) => <div key={`${image.slice(-20)}-${index}`}><img src={image} alt={`معاينة ${index + 1}`} /><button type="button" aria-label={`حذف الصورة ${index + 1}`} onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}>×</button></div>)}</div>}
          <button className="button admin-publish" type="submit" disabled={processingImages || publishing}>{publishing ? "جاري النشر..." : `نشر في ${type === "blog" ? "المدونة" : "القوانين"}`} {!publishing && <Arrow />}</button>
        </form>
        <section className="admin-library">
          <div className="admin-library-heading"><span>{String(items.length).padStart(2, "0")}</span><div><h2>المحتوى المنشور</h2><p>إدارة المقالات والقوانين التي تمت إضافتها.</p></div></div>
          {items.length === 0 ? <div className="admin-empty"><Icon name="document" size={30} /><p>لا يوجد محتوى منشور بعد.</p></div> : <div className="admin-content-table"><div className="admin-table-head"><span>النوع</span><span>العنوان</span><span>التاريخ</span><span>الإجراءات</span></div>{items.map((item) => {
            const path = item.type === "blog" ? `/blog/published/${item.id}` : `/laws/published/${item.id}`;
            return <article key={item.id}><span className={`content-badge ${item.type}`}>{item.type === "blog" ? "مدونة" : "قانون"}</span><h3>{item.title}</h3><time>{formatDate(item.date)}</time><div><Link to={path} go={go}>عرض</Link><button type="button" onClick={() => shareItem(item)}><Icon name="share" size={14} />مشاركة</button><button className="danger" type="button" onClick={() => removeItem(item.id)}>حذف</button></div></article>;
          })}</div>}
        </section>
      </div>
    </main>
    {toast && <div className="toast">{toast}</div>}
  </section>;
}

function Footer({ go }: { go: (to: string) => void }) {
  return <footer><div className="container footer-grid"><div className="footer-brand"><img src="/assets/logo-dark.png" alt="بيت الترافع لأعمال المحاماة والتحكيم" /><p>شركة بيت الترافع لأعمال المحاماة والتحكيم</p><span className="footer-location"><Icon name="pin" size={17} />عمّان - شارع الأميرة رحمة بنت الحسن</span></div><div><strong>روابط</strong>{nav.slice(0, 5).map(([to, label]) => <Link key={to} to={to} go={go}>{label}</Link>)}</div><div><strong>تواصل</strong><a className="footer-phone" dir="ltr" href="tel:+962798080228"><Icon name="phone" size={16} />+962 79 808 0228</a><a className="footer-phone" dir="ltr" href="tel:+962782343333"><Icon name="phone" size={16} />+962 78 234 3333</a><a dir="ltr" href="mailto:lawyerabdullah960@gmail.com">lawyerabdullah960@gmail.com</a><Button to="/contact" go={go}>احجز استشارة</Button></div></div><div className="footer-bottom container"><span>© {new Date().getFullYear()} بيت الترافع</span><Link to="/login" go={go}>دخول الإدارة</Link><span>AMMAN / JORDAN</span></div></footer>;
}

function WhatsAppFloat() {
  return <a className="whatsapp-float" href="https://wa.me/962798080228" target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب مع المحامي عبدالله"><Icon name="whatsapp" size={24} /></a>;
}

export default function App() {
  const { path, go } = usePath();
  const isAdmin = path === "/admin";
  let page: ReactNode;
  if (path === "/") page = <Home go={go} />;
  else if (path === "/about") page = <About go={go} />;
  else if (path === "/services") page = <Services go={go} />;
  else if (path.startsWith("/services/")) page = <ServiceDetail slug={path.split("/")[2]} go={go} />;
  else if (path.startsWith("/team/")) page = <LawyerProfile person={path.split("/")[2]} go={go} />;
  else if (path === "/blog") page = <Blog go={go} />;
  else if (path.startsWith("/blog/published/")) page = <PublishedDetail id={path.split("/")[3]} type="blog" go={go} />;
  else if (path.startsWith("/blog/")) page = <ArticleDetail id={Number(path.split("/")[2])} go={go} />;
  else if (path === "/laws") page = <Laws go={go} />;
  else if (path.startsWith("/laws/published/")) page = <PublishedDetail id={path.split("/")[3]} type="law" go={go} />;
  else if (path.startsWith("/laws/")) page = <LawDetail id={Number(path.split("/")[2])} go={go} />;
  else if (path === "/faq") page = <FAQ />;
  else if (path === "/contact") page = <Contact go={go} />;
  else if (path === "/login") page = <Login go={go} />;
  else if (path === "/admin") page = <Admin go={go} />;
  else page = <Home go={go} />;
  useEffect(() => { document.documentElement.dir = "rtl"; document.documentElement.lang = "ar"; }, []);
  useEffect(() => {
    const elements = document.querySelectorAll("main section:not(.hero):not(.page-hero), .practice-row, .services-list article, .note-card, .law-card, .faq-item, .contact-index a");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      (element as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 70}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [path]);
  if (isAdmin) return <>{page}<WhatsAppFloat /></>;
  return <><Navbar path={path} go={go} /><main>{page}</main><Footer go={go} /><WhatsAppFloat /></>;
}
