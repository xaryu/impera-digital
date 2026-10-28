// The breakdown report: wording and HTML.
//
// The copy lives server-side on purpose. The browser only ever sends numbers
// and task ids, so nobody can use this function to mail text of their choosing
// to an address of their choosing.
import { TASKS, WORKING_WEEKS_PER_YEAR, AUTOMATION_SHARE_LOW, AUTOMATION_SHARE_HIGH, type Inputs, type Result, type TaskTier } from "./model.ts";

type Language = "en" | "fr" | "nl";

const LOW = Math.round(AUTOMATION_SHARE_LOW * 100);
const HIGH = Math.round(AUTOMATION_SHARE_HIGH * 100);

interface Copy {
  subject: string;
  greeting: string;
  intro: string;
  numbersTitle: string;
  hoursPerWeek: string;
  hoursPerYear: string;
  yearlyCost: string;
  rangeTitle: string;
  rangeNote: string;
  rankingTitle: string;
  rankingIntro: string;
  noTasks: string;
  firstTitle: string;
  firstBody: string;
  leaveTitle: string;
  leaveBody: string;
  leaveNone: string;
  tierLabel: Record<TaskTier, string>;
  tierNote: Record<TaskTier, string>;
  assumptionsTitle: string;
  assumptions: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  signoff: string;
  footer: string;
  tasks: Record<string, string>;
}

export const COPY: Record<Language, Copy> = {
  en: {
    subject: "Your automation breakdown",
    greeting: "Here is the breakdown you asked for.",
    intro:
      "You told us how much repetitive admin work your team does. Below are the numbers you saw, and what we would do about them in the order we would do it.",
    numbersTitle: "Your numbers",
    hoursPerWeek: "Hours lost per week",
    hoursPerYear: "Hours lost per year",
    yearlyCost: "What that costs per year",
    rangeTitle: "What could realistically be automated",
    rangeNote:
      `This is an estimate built from the figures you entered and the assumptions at the bottom of this email. It is not a measurement of your business. The ${LOW}%–${HIGH}% band is the planning range we scope automation projects with, and where a business lands inside it depends on its tools, its data and how consistent the process already is.`,
    rankingTitle: "Your tasks, ranked by likely time saved",
    rankingIntro:
      "Ranked by how readily each kind of work automates in our experience. This is our judgement about the type of task, not a measurement of yours — the order can change once we see how your process actually runs.",
    noTasks:
      "You did not pick any tasks, so there is nothing to rank here. Reply with the two or three that eat the most time and we will send the ranked version.",
    firstTitle: "What we would automate first",
    firstBody:
      "We start with the work that is rule-driven and repeats the same way every time. It pays back soonest, and it is the safest place to prove the approach before touching anything that needs judgement.",
    leaveTitle: "What is probably not worth automating",
    leaveBody:
      "Work that needs a decision every time is usually not worth automating end to end. The useful move there is to automate the preparation around it — gathering the inputs, drafting the standard parts — and leave the judgement with your team.",
    leaveNone:
      "Nothing you picked falls into that category. That is a good sign: it means the hours above are mostly addressable.",
    tierLabel: {
      high: "Automates well",
      medium: "Automates in part",
      low: "Needs a person",
    },
    tierNote: {
      high: "Rule-driven and repetitive — this is normally where we start.",
      medium: "The routine half can run itself; someone still reviews the output.",
      low: "Needs judgement every time, so automating it end to end rarely pays back.",
    },
    assumptionsTitle: "Assumptions behind these figures",
    assumptions: [
      `${WORKING_WEEKS_PER_YEAR} working weeks a year, allowing for holidays and public holidays.`,
      `The ${LOW}%–${HIGH}% band is a planning range, not a measured result.`,
      "The figures are gross: they do not subtract the cost of building and running the automation.",
      "Everything above rests on the numbers you entered. If those were rough, so is the estimate.",
    ],
    ctaTitle: "Want the version that is actually measured?",
    ctaBody:
      "The Growth Audit replaces every assumption above with your real process: we map where the hours go, rank what to automate by hours and euros at stake, and tell you plainly what is not worth doing.",
    ctaButton: "Book your Growth Audit",
    signoff: "— The Impera team",
    footer:
      "You are receiving this because you asked for it in the calculator on our website. Reply to this email if you would rather we deleted your details.",
    tasks: {
      documentProcessing: "Document processing",
      dataEntry: "Data entry",
      quotes: "Quotes",
      followUpEmails: "Follow-up emails",
      reporting: "Reporting",
      invoicing: "Invoicing",
    },
  },

  nl: {
    subject: "Uw automatiseringsrapport",
    greeting: "Hier is de uitsplitsing die u vroeg.",
    intro:
      "U vertelde ons hoeveel repetitief administratief werk uw team doet. Hieronder staan de cijfers die u zag, en wat wij ermee zouden doen — in de volgorde waarin we het zouden aanpakken.",
    numbersTitle: "Uw cijfers",
    hoursPerWeek: "Verloren uren per week",
    hoursPerYear: "Verloren uren per jaar",
    yearlyCost: "Wat dat per jaar kost",
    rangeTitle: "Wat realistisch geautomatiseerd kan worden",
    rangeNote:
      `Dit is een schatting op basis van de cijfers die u invulde en de aannames onderaan deze mail. Het is geen meting van uw bedrijf. De band van ${LOW}% tot ${HIGH}% is het planningsbereik waarmee wij automatiseringsprojecten inschatten; waar een bedrijf daarbinnen uitkomt, hangt af van zijn tools, zijn data en hoe consistent het proces vandaag al verloopt.`,
    rankingTitle: "Uw taken, gerangschikt naar verwachte tijdwinst",
    rankingIntro:
      "Gerangschikt naar hoe vlot dat soort werk zich volgens onze ervaring laat automatiseren. Dit is ons oordeel over het type taak, geen meting van het uwe — de volgorde kan veranderen zodra we zien hoe uw proces echt loopt.",
    noTasks:
      "U koos geen taken, dus valt er hier niets te rangschikken. Antwoord met de twee of drie die de meeste tijd opslorpen en we sturen de gerangschikte versie.",
    firstTitle: "Wat we eerst zouden automatiseren",
    firstBody:
      "We beginnen bij het werk dat regelgestuurd is en elke keer op dezelfde manier terugkeert. Dat betaalt zich het snelst terug, en het is de veiligste plek om de aanpak te bewijzen voor we iets aanraken dat beoordeling vraagt.",
    leaveTitle: "Wat wellicht niet de moeite is om te automatiseren",
    leaveBody:
      "Werk waar elke keer een beslissing aan te pas komt, is zelden de moeite om van begin tot eind te automatiseren. Wat daar wél werkt: de voorbereiding eromheen automatiseren — de gegevens verzamelen, de standaarddelen opstellen — en het oordeel bij uw team laten.",
    leaveNone:
      "Niets van wat u koos valt in die categorie. Dat is een goed teken: de uren hierboven zijn grotendeels aanpakbaar.",
    tierLabel: {
      high: "Laat zich goed automatiseren",
      medium: "Deels te automatiseren",
      low: "Vraagt een mens",
    },
    tierNote: {
      high: "Regelgestuurd en repetitief — hier beginnen we meestal.",
      medium: "De routineuze helft kan vanzelf lopen; iemand controleert nog het resultaat.",
      low: "Vraagt elke keer een oordeel, dus volledig automatiseren betaalt zich zelden terug.",
    },
    assumptionsTitle: "Aannames achter deze cijfers",
    assumptions: [
      `${WORKING_WEEKS_PER_YEAR} werkweken per jaar, rekening houdend met verlof en feestdagen.`,
      `De band van ${LOW}% tot ${HIGH}% is een planningsbereik, geen gemeten resultaat.`,
      "De cijfers zijn bruto: de kost om de automatisering te bouwen en te laten draaien is er niet van afgetrokken.",
      "Alles hierboven steunt op de cijfers die u invulde. Waren die ruw, dan is de schatting dat ook.",
    ],
    ctaTitle: "Wilt u de versie die wél gemeten is?",
    ctaBody:
      "De Growth Audit vervangt elke aanname hierboven door uw echte proces: we brengen in kaart waar de uren heen gaan, rangschikken wat te automatiseren naar uren en euro's die op het spel staan, en zeggen u ronduit wat het niet waard is.",
    ctaButton: "Boek uw Growth Audit",
    signoff: "— Het team van Impera",
    footer:
      "U ontvangt dit omdat u het vroeg via de rekenmodule op onze website. Antwoord op deze mail als u liever heeft dat we uw gegevens wissen.",
    tasks: {
      documentProcessing: "Documenten verwerken",
      dataEntry: "Gegevens invoeren",
      quotes: "Offertes",
      followUpEmails: "Opvolgmails",
      reporting: "Rapportering",
      invoicing: "Facturatie",
    },
  },

  fr: {
    subject: "Votre rapport d'automatisation",
    greeting: "Voici le détail que vous avez demandé.",
    intro:
      "Vous nous avez indiqué le volume de tâches administratives répétitives de votre équipe. Voici les chiffres que vous avez vus, et ce que nous en ferions — dans l'ordre où nous nous y prendrions.",
    numbersTitle: "Vos chiffres",
    hoursPerWeek: "Heures perdues par semaine",
    hoursPerYear: "Heures perdues par an",
    yearlyCost: "Ce que cela coûte par an",
    rangeTitle: "Ce qui peut réalistement être automatisé",
    rangeNote:
      `Il s'agit d'une estimation fondée sur les chiffres que vous avez saisis et sur les hypothèses en bas de cet e-mail. Ce n'est pas une mesure de votre entreprise. La fourchette de ${LOW} % à ${HIGH} % est la plage de planification avec laquelle nous cadrons nos projets d'automatisation ; où une entreprise se situe à l'intérieur dépend de ses outils, de ses données et de la régularité du processus actuel.`,
    rankingTitle: "Vos tâches, classées selon le temps probablement gagné",
    rankingIntro:
      "Classées selon la facilité avec laquelle ce type de travail s'automatise, d'après notre expérience. C'est notre jugement sur le type de tâche, pas une mesure de la vôtre — l'ordre peut changer dès que nous voyons comment votre processus fonctionne réellement.",
    noTasks:
      "Vous n'avez sélectionné aucune tâche, il n'y a donc rien à classer ici. Répondez-nous avec les deux ou trois qui prennent le plus de temps et nous vous enverrons la version classée.",
    firstTitle: "Ce que nous automatiserions en premier",
    firstBody:
      "Nous commençons par le travail régi par des règles et qui se répète à l'identique. C'est ce qui se rentabilise le plus vite, et l'endroit le plus sûr pour prouver l'approche avant de toucher à ce qui demande du jugement.",
    leaveTitle: "Ce qui ne vaut probablement pas la peine d'être automatisé",
    leaveBody:
      "Le travail qui exige une décision à chaque fois vaut rarement la peine d'être automatisé de bout en bout. Ce qui fonctionne : automatiser la préparation autour — rassembler les éléments, rédiger les parties standard — et laisser le jugement à votre équipe.",
    leaveNone:
      "Rien de ce que vous avez choisi n'entre dans cette catégorie. C'est bon signe : les heures ci-dessus sont en grande partie récupérables.",
    tierLabel: {
      high: "S'automatise bien",
      medium: "S'automatise en partie",
      low: "Demande une personne",
    },
    tierNote: {
      high: "Régi par des règles et répétitif — c'est normalement par là que nous commençons.",
      medium: "La moitié routinière peut tourner seule ; quelqu'un relit encore le résultat.",
      low: "Demande un jugement à chaque fois : l'automatiser entièrement se rentabilise rarement.",
    },
    assumptionsTitle: "Hypothèses derrière ces chiffres",
    assumptions: [
      `${WORKING_WEEKS_PER_YEAR} semaines travaillées par an, congés et jours fériés déduits.`,
      `La fourchette de ${LOW} % à ${HIGH} % est une plage de planification, pas un résultat mesuré.`,
      "Les chiffres sont bruts : ils ne déduisent pas le coût de construction et d'exploitation de l'automatisation.",
      "Tout ce qui précède repose sur les chiffres que vous avez saisis. S'ils étaient approximatifs, l'estimation l'est aussi.",
    ],
    ctaTitle: "Vous voulez la version réellement mesurée ?",
    ctaBody:
      "Le Growth Audit remplace chaque hypothèse ci-dessus par votre processus réel : nous cartographions où partent les heures, classons ce qu'il faut automatiser selon les heures et les euros en jeu, et vous disons franchement ce qui n'en vaut pas la peine.",
    ctaButton: "Réserver votre Growth Audit",
    signoff: "— L'équipe Impera",
    footer:
      "Vous recevez cet e-mail parce que vous l'avez demandé via le calculateur de notre site. Répondez-y si vous préférez que nous supprimions vos données.",
    tasks: {
      documentProcessing: "Traitement de documents",
      dataEntry: "Saisie de données",
      quotes: "Devis",
      followUpEmails: "E-mails de relance",
      reporting: "Reporting",
      invoicing: "Facturation",
    },
  },
};

const LOCALES: Record<Language, string> = { en: "en-IE", fr: "fr-BE", nl: "nl-BE" };
const TIER_RANK: Record<TaskTier, number> = { high: 0, medium: 1, low: 2 };

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const resolveLanguage = (value: unknown): Language =>
  value === "nl" || value === "fr" ? value : "en";

export interface ReportOptions {
  language: Language;
  inputs: Inputs;
  result: Result;
  calendlyUrl: string;
}

export const buildReport = ({ language, inputs, result, calendlyUrl }: ReportOptions) => {
  const copy = COPY[language];
  const locale = LOCALES[language];

  const num = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const euro = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

  const selected = TASKS.filter((task) => inputs.tasks.includes(task.id)).sort(
    (a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier],
  );
  const notWorthIt = selected.filter((task) => task.tier === "low");

  const stat = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e4e1d9;font:400 14px/1.5 Helvetica,Arial,sans-serif;color:#4a5568;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e4e1d9;font:700 18px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;text-align:right;">${value}</td>
    </tr>`;

  const rankingRows = selected
    .map(
      (task, index) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e4e1d9;vertical-align:top;">
          <span style="font:700 16px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;">${index + 1}. ${escapeHtml(copy.tasks[task.id] ?? task.id)}</span>
          <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:10px;background:#f3ecd9;font:600 11px/1.6 Helvetica,Arial,sans-serif;color:#8a6d1f;">${copy.tierLabel[task.tier]}</span>
          <div style="margin-top:4px;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.tierNote[task.tier]}</div>
        </td>
      </tr>`,
    )
    .join("");

  const rankingBlock = selected.length
    ? `<p style="margin:0 0 14px;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.rankingIntro}</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rankingRows}</table>`
    : `<p style="margin:0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.noTasks}</p>`;

  const leaveBody = notWorthIt.length
    ? `${copy.leaveBody}<br><br><strong style="color:#1d3a5c;">${notWorthIt.map((task) => escapeHtml(copy.tasks[task.id] ?? task.id)).join(", ")}</strong>`
    : copy.leaveNone;

  const html = `
<!doctype html>
<html lang="${language}">
  <body style="margin:0;padding:0;background:#f7f5f0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e1d9;">

          <tr><td style="background:#1d3a5c;padding:28px 32px;">
            <div style="font:700 13px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;color:#d4af5a;text-transform:uppercase;">IMPERA</div>
            <h1 style="margin:14px 0 0;font:700 24px/1.3 Georgia,'Times New Roman',serif;color:#faf8f4;">${copy.greeting}</h1>
          </td></tr>

          <tr><td style="padding:28px 32px 0;">
            <p style="margin:0 0 24px;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.intro}</p>

            <h2 style="margin:0 0 8px;font:700 17px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;">${copy.numbersTitle}</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${stat(copy.hoursPerWeek, num(result.hoursPerWeek))}
              ${stat(copy.hoursPerYear, num(result.hoursPerYear))}
              ${stat(copy.yearlyCost, euro(result.yearlyCost))}
            </table>
          </td></tr>

          <tr><td style="padding:24px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7ec;border:1px solid #e8d9ad;">
              <tr><td style="padding:20px 22px;">
                <div style="font:700 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:#8a6d1f;text-transform:uppercase;">${copy.rangeTitle}</div>
                <div style="margin-top:8px;font:700 24px/1.2 Georgia,'Times New Roman',serif;color:#1d3a5c;">${num(result.automatable.hoursLow)} – ${num(result.automatable.hoursHigh)} h</div>
                <div style="margin-top:2px;font:700 16px/1.3 Georgia,'Times New Roman',serif;color:#8a6d1f;">${euro(result.automatable.costLow)} – ${euro(result.automatable.costHigh)}</div>
                <p style="margin:12px 0 0;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:#6b7280;">${copy.rangeNote}</p>
              </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 8px;font:700 17px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;">${copy.rankingTitle}</h2>
            ${rankingBlock}
          </td></tr>

          <tr><td style="padding:28px 32px 0;">
            <h2 style="margin:0 0 8px;font:700 17px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;">${copy.firstTitle}</h2>
            <p style="margin:0;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.firstBody}</p>
          </td></tr>

          <tr><td style="padding:24px 32px 0;">
            <h2 style="margin:0 0 8px;font:700 17px/1.3 Georgia,'Times New Roman',serif;color:#1d3a5c;">${copy.leaveTitle}</h2>
            <p style="margin:0;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#4a5568;">${leaveBody}</p>
          </td></tr>

          <tr><td style="padding:28px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1d3a5c;">
              <tr><td style="padding:24px 24px;">
                <h2 style="margin:0 0 8px;font:700 18px/1.3 Georgia,'Times New Roman',serif;color:#faf8f4;">${copy.ctaTitle}</h2>
                <p style="margin:0 0 16px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#c9d2de;">${copy.ctaBody}</p>
                <a href="${calendlyUrl}" style="display:inline-block;padding:13px 26px;background:#d4af5a;color:#0f1f33;font:700 13px/1 Helvetica,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;">${copy.ctaButton}</a>
              </td></tr>
            </table>
          </td></tr>

          <tr><td style="padding:26px 32px 0;">
            <div style="font:700 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.18em;color:#9aa3af;text-transform:uppercase;">${copy.assumptionsTitle}</div>
            <ul style="margin:8px 0 0;padding-left:18px;">
              ${copy.assumptions.map((line) => `<li style="font:400 12px/1.7 Helvetica,Arial,sans-serif;color:#9aa3af;">${line}</li>`).join("")}
            </ul>
          </td></tr>

          <tr><td style="padding:24px 32px 32px;">
            <p style="margin:0 0 16px;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#4a5568;">${copy.signoff}</p>
            <p style="margin:0;font:400 11px/1.6 Helvetica,Arial,sans-serif;color:#9aa3af;border-top:1px solid #e4e1d9;padding-top:14px;">${copy.footer}</p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject: `${copy.subject} — ${num(result.hoursPerYear)} h`, html };
};
