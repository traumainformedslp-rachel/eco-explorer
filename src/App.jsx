import { useState, useCallback, useRef, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   ════════════════════════════════════════════════════════════════════ */

const styleTag = document.createElement("style");
styleTag.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { min-height: 100vh; }
  body {
    font-family: 'DM Sans', sans-serif;
    transition: background 0.3s ease, color 0.3s ease;
    position: relative;
  }
  :focus-visible { outline: 2px solid #2b446e !important; outline-offset: 3px; border-radius: 2px; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  .effect-chip {
    transition: all 0.18s ease;
    cursor: pointer;
    user-select: none;
  }
  .effect-chip:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(0,0,0,0.3);
  }
  ::selection { background: rgba(42,157,143,0.2); color: inherit; }
  input:focus, textarea:focus { outline: none; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
if (!document.querySelector("[data-trauma-explorer-styles]")) {
  styleTag.setAttribute("data-trauma-explorer-styles", "");
  document.head.appendChild(styleTag);
}


/* ════════════════════════════════════════════════════════════════════
   THEME
   ════════════════════════════════════════════════════════════════════ */

const T = {
  dark: {
    bg: "#0d1510", card: "#1a2418", border: "#2b3326", inputBg: "#0d1510",
    text: "#e8e4d8", textMuted: "#a9a373", textDim: "#6b6b6f", textSub: "#a9a373",
    accent: "#cac26d", btnBg: "#1a2418",
    ringCenter: "#1a2418", ringStroke: "#2b3326", ringPersonFill: "#e8e4d8", ringPersonLabel: "#6b6b6f",
  },
  light: {
    bg: "#fafaf5", card: "#ffffff", border: "#e0ddd0", inputBg: "#f7f6f0",
    text: "#1a1a2a", textMuted: "#4d566d", textDim: "#8a8678", textSub: "#4d566d",
    accent: "#2b446e", btnBg: "#f7f6f0",
    ringCenter: "#f7f6f0", ringStroke: "#e0ddd0", ringPersonFill: "#1a1a2a", ringPersonLabel: "#8a8678",
  },
};

/* ════════════════════════════════════════════════════════════════════
   DATA — Ecological System Levels & Trauma Types
   ════════════════════════════════════════════════════════════════════ */

const SYSTEM_LEVELS = [
  {
    id: "micro",
    label: "Microsystem",
    subtitle: "Immediate, direct environments",
    description:
      "The closest layer — direct, face-to-face settings and relationships that shape daily lived experience.",
    color: { bg: "#0C1520", accent: "#7EB8E0", text: "#DCF0FF", light: "#7EB8E015", ring: "#7EB8E0", dark: "#081018" },
    settings: [
      {
        id: "home_family",
        label: "Home & Family",
        icon: "\u{1F3E0}",
        description: "The primary caregiving environment and household dynamics.",
        traumas: [
          { id: "phys_abuse", label: "Physical abuse", desc: "Hitting, shaking, burning, or other physical harm by a caregiver or household member." },
          { id: "sex_abuse", label: "Sexual abuse", desc: "Any sexual contact or behavior imposed on a child or vulnerable person by someone in the home." },
          { id: "emot_abuse", label: "Emotional / psychological abuse", desc: "Chronic belittling, threatening, rejecting, isolating, or terrorizing." },
          { id: "phys_neglect", label: "Physical neglect", desc: "Failure to provide adequate food, shelter, clothing, hygiene, or medical care." },
          { id: "emot_neglect", label: "Emotional neglect", desc: "Failure to provide affection, emotional support, attention, or responsiveness." },
          { id: "dom_violence", label: "Witnessing domestic violence", desc: "Exposure to intimate partner violence between caregivers." },
          { id: "parent_sub", label: "Parental substance use", desc: "Living with a caregiver who misuses alcohol, opioids, or other substances." },
          { id: "parent_mh", label: "Parental mental illness", desc: "Caregiver depression, PTSD, psychosis, or other untreated conditions affecting parenting." },
          { id: "parent_incarc", label: "Parental incarceration", desc: "Separation from a caregiver due to arrest, jail, or prison." },
          { id: "caregiver_loss", label: "Loss or separation from caregiver", desc: "Death, deportation, foster care placement, or abandonment." },
          { id: "food_housing", label: "Food or housing insecurity", desc: "Chronic hunger, homelessness, frequent moves, or unstable living conditions." },
          { id: "parentification", label: "Parentification", desc: "Child forced into adult caregiving roles for siblings or parents." },
        ],
      },
      {
        id: "school",
        label: "School & Classroom",
        icon: "\u{1F3EB}",
        description: "The educational setting including interactions with teachers, administrators, and school policies.",
        traumas: [
          { id: "bullying", label: "Bullying / cyberbullying", desc: "Repeated verbal, physical, social, or digital aggression by peers." },
          { id: "teacher_harm", label: "Educator-perpetrated harm", desc: "Verbal abuse, humiliation, physical punishment, or inappropriate conduct by school staff." },
          { id: "school_violence", label: "School violence exposure", desc: "Witnessing fights, weapon incidents, or active shooter events." },
          { id: "exclusion_discipline", label: "Exclusionary discipline", desc: "Suspension, expulsion, restraint, or seclusion — disproportionately affecting marginalized students." },
          { id: "academic_shame", label: "Academic shaming / labeling", desc: "Public humiliation for performance, learning differences, or placement in stigmatized tracks." },
          { id: "sped_trauma", label: "Special education-related trauma", desc: "Inappropriate placement, denial of services, coercive IEP processes, or restraint/seclusion." },
          { id: "school_policing", label: "School policing / SRO encounters", desc: "Criminalization of behavior, arrests on school grounds, or intimidation by resource officers." },
        ],
      },
      {
        id: "peers",
        label: "Peer Relationships",
        icon: "\u{1F465}",
        description: "Social networks including friendships, romantic relationships, and peer group dynamics.",
        traumas: [
          { id: "peer_reject", label: "Social rejection / exclusion", desc: "Systematic ostracism, being 'frozen out,' or relational aggression." },
          { id: "dating_violence", label: "Dating / intimate partner violence", desc: "Physical, emotional, or sexual abuse within adolescent or adult romantic relationships." },
          { id: "peer_sex_exploit", label: "Sexual exploitation by peers", desc: "Coercion, trafficking, non-consensual image sharing, or exploitation within peer networks." },
          { id: "gang_involvement", label: "Gang involvement / pressure", desc: "Coerced participation, witnessing violence, or victimization related to gang activity." },
          { id: "peer_substance", label: "Peer-driven substance exposure", desc: "Pressure to use, or being harmed by others' substance use in social settings." },
          { id: "identity_harassment", label: "Identity-based peer harassment", desc: "Targeting based on race, gender identity, sexual orientation, disability, religion, or immigration status." },
        ],
      },
      {
        id: "religious",
        label: "Religious / Spiritual Setting",
        icon: "\u{1F54A}️",
        description: "Faith-based communities, places of worship, and spiritual practice environments.",
        traumas: [
          { id: "clergy_abuse", label: "Clergy / leader-perpetrated abuse", desc: "Sexual, physical, or emotional abuse by religious authority figures." },
          { id: "spiritual_abuse", label: "Spiritual abuse", desc: "Using religious doctrine to control, shame, isolate, or manipulate." },
          { id: "conversion", label: "Conversion practices", desc: "Attempts to change sexual orientation or gender identity through religious intervention." },
          { id: "shunning", label: "Shunning / excommunication", desc: "Forced social isolation or family severance for violating religious norms." },
          { id: "religious_shame", label: "Shame-based religious messaging", desc: "Chronic messaging around sin, unworthiness, or fear-based theology affecting self-concept." },
        ],
      },
      {
        id: "neighborhood_imm",
        label: "Immediate Neighborhood",
        icon: "\u{1F3D8}️",
        description: "The physical environment where one lives — streets, buildings, local spaces experienced daily.",
        traumas: [
          { id: "comm_violence", label: "Community violence exposure", desc: "Witnessing shootings, assaults, or other violence in one's immediate surroundings." },
          { id: "environ_hazard", label: "Environmental hazards", desc: "Lead exposure, contaminated water, toxic air quality, or unsafe housing conditions." },
          { id: "police_encounter", label: "Direct police encounters", desc: "Witnessing or experiencing aggressive policing, raids, or use of force." },
          { id: "displacement", label: "Displacement / gentrification", desc: "Forced relocation due to eviction, urban renewal, or rising costs disrupting stability." },
        ],
      },
    ],
  },
  {
    id: "meso",
    label: "Mesosystem",
    subtitle: "Interactions between microsystems",
    description:
      "The connections and conflicts between the individual's immediate settings. Trauma arises when microsystems clash, fail to communicate, or compound harm.",
    color: { bg: "#140A1A", accent: "#9B59B6", text: "#EAD8F4", light: "#9B59B615", ring: "#9B59B6", dark: "#0E0612" },
    settings: [
      {
        id: "home_school",
        label: "Home ↔ School",
        icon: "\u{1F517}",
        description: "How family and school systems interact — or fail to.",
        traumas: [
          { id: "parent_school_conflict", label: "Parent–school conflict", desc: "Adversarial IEP meetings, cultural clashes, or schools undermining parental authority." },
          { id: "inconsistent_response", label: "Inconsistent trauma response", desc: "School unaware of home trauma, or home unaware of school-based harm." },
          { id: "reporting_retraumatize", label: "Mandatory reporting retraumatization", desc: "CPS involvement triggered by school that leads to family disruption without support." },
          { id: "homework_stress", label: "School demands compounding home stress", desc: "Academic expectations impossible to meet given home instability." },
          { id: "cultural_mismatch", label: "Cultural / linguistic mismatch", desc: "School culture invalidating home language, cultural practices, or family structure." },
        ],
      },
      {
        id: "family_peers",
        label: "Family ↔ Peers",
        icon: "\u{1F517}",
        description: "How family situations interact with peer relationships.",
        traumas: [
          { id: "stigma_home", label: "Peer stigma about home life", desc: "Bullying or exclusion from poverty, parental incarceration, foster care, or family differences." },
          { id: "isolation_family", label: "Family-imposed social isolation", desc: "Caregiver restricting peer contact due to abuse concealment, cultural control, or mental health." },
          { id: "family_peer_conflict", label: "Family–peer value conflicts", desc: "Identity conflicts when family norms clash with peer acceptance (e.g., LGBTQI+ youth)." },
        ],
      },
      {
        id: "school_community",
        label: "School ↔ Community",
        icon: "\u{1F517}",
        description: "How school and neighborhood/community systems interact.",
        traumas: [
          { id: "school_to_prison", label: "School-to-prison pipeline", desc: "School discipline feeding into juvenile justice, compounded by neighborhood policing." },
          { id: "unsafe_commute", label: "Unsafe routes to/from school", desc: "Exposure to community violence or hazards during daily commute." },
          { id: "community_school_distrust", label: "Community–school distrust", desc: "Historical mistreatment leading communities to distrust educational institutions." },
        ],
      },
      {
        id: "multi_system",
        label: "Multi-System Compounding",
        icon: "\u{1F517}",
        description: "When failures across multiple systems compound and amplify trauma.",
        traumas: [
          { id: "system_retrauma", label: "Re-traumatization across systems", desc: "Retelling trauma story to multiple providers, teachers, caseworkers without coordination." },
          { id: "contradictory_demands", label: "Contradictory system demands", desc: "Court orders conflicting with school requirements conflicting with treatment plans." },
          { id: "service_fragmentation", label: "Service fragmentation", desc: "Uncoordinated care across child welfare, schools, mental health, and healthcare." },
        ],
      },
    ],
  },
  {
    id: "exo",
    label: "Exosystem",
    subtitle: "Indirect environmental influences",
    description:
      "Settings the individual doesn't directly participate in, but whose decisions cascade down to affect them.",
    color: { bg: "#081A10", accent: "#27AE60", text: "#D0F0DE", light: "#27AE6015", ring: "#27AE60", dark: "#051208" },
    settings: [
      {
        id: "parent_workplace",
        label: "Caregiver's Workplace",
        icon: "\u{1F4BC}",
        description: "Employment conditions affecting caregiver capacity and child stability.",
        traumas: [
          { id: "job_loss", label: "Caregiver job loss / unemployment", desc: "Sudden income loss leading to housing instability, food insecurity, or family stress." },
          { id: "exploitative_work", label: "Exploitative working conditions", desc: "Low wages, unsafe conditions, no benefits — leaving caregivers depleted." },
          { id: "no_leave", label: "Lack of family / medical leave", desc: "No paid leave for illness or child's needs — forcing impossible choices." },
          { id: "shift_instability", label: "Unpredictable scheduling", desc: "Irregular shifts preventing consistent childcare, routines, or school involvement." },
          { id: "workplace_ice", label: "Workplace immigration enforcement", desc: "Raids or audits creating terror of parental detention/deportation." },
        ],
      },
      {
        id: "school_district",
        label: "School Board & District",
        icon: "\u{1F4CB}",
        description: "Administrative decisions shaping the educational environment.",
        traumas: [
          { id: "zero_tolerance", label: "Zero-tolerance discipline policies", desc: "Automatic suspension/expulsion disproportionately targeting marginalized students." },
          { id: "resource_inequity", label: "Resource inequity across schools", desc: "Underfunding in low-income areas — fewer counselors, outdated materials." },
          { id: "curriculum_exclusion", label: "Exclusionary curriculum", desc: "Curricula that erase or distort histories of marginalized groups." },
          { id: "testing_pressure", label: "High-stakes testing culture", desc: "Over-emphasis on standardized testing creating chronic stress." },
          { id: "school_closure", label: "School closures / consolidation", desc: "Closing neighborhood schools, disrupting community ties." },
        ],
      },
      {
        id: "local_gov",
        label: "Local Government & Services",
        icon: "\u{1F3DB}️",
        description: "Municipal decisions, law enforcement, and community services.",
        traumas: [
          { id: "policing_policy", label: "Policing practices & policies", desc: "Stop-and-frisk, over-policing of certain neighborhoods, use-of-force policies." },
          { id: "housing_policy", label: "Housing policy failures", desc: "Zoning exclusion, insufficient affordable housing, slow waitlists." },
          { id: "mental_health_gap", label: "Mental health service gaps", desc: "Insufficient resources, long waitlists, lack of culturally competent providers." },
          { id: "child_welfare", label: "Child welfare system practices", desc: "Disproportionate family separation in communities of color." },
          { id: "food_desert", label: "Food access policy failures", desc: "Lack of grocery stores, food assistance barriers, inadequate school meals." },
        ],
      },
      {
        id: "media_tech",
        label: "Media & Technology",
        icon: "\u{1F4F1}",
        description: "Mass media, social media platforms, and technology ecosystems.",
        traumas: [
          { id: "media_violence", label: "Vicarious trauma via media", desc: "Repeated exposure to violence or disaster coverage through news and social media." },
          { id: "online_exploit", label: "Online exploitation / predation", desc: "Platforms enabling grooming, sextortion, or trafficking recruitment." },
          { id: "algorithmic_harm", label: "Algorithmic amplification of harm", desc: "Algorithms promoting self-harm content, extremism, or body image distortion." },
          { id: "digital_divide", label: "Digital divide", desc: "Lack of internet/devices creating educational exclusion." },
        ],
      },
    ],
  },
  {
    id: "macro",
    label: "Macrosystem",
    subtitle: "Cultural, societal & ideological context",
    description:
      "The outermost layer — cultural blueprints, societal structures, political systems, and dominant ideologies that shape all other systems.",
    color: { bg: "#1A1208", accent: "#E89B2D", text: "#F8ECD8", light: "#E89B2D15", ring: "#E89B2D", dark: "#120C04" },
    settings: [
      {
        id: "racism_struct",
        label: "Structural Racism & Racial Trauma",
        icon: "⚖️",
        description: "Systemic racial inequity in institutions, policies, and cultural norms.",
        traumas: [
          { id: "systemic_racism", label: "Systemic / institutional racism", desc: "Racial disparities in healthcare, education, criminal justice, housing, and employment." },
          { id: "racial_micro", label: "Racial microaggressions (cumulative)", desc: "Chronic subtle slights and indignities based on race." },
          { id: "intergenerational_racial", label: "Intergenerational racial trauma", desc: "Transmission from slavery, Jim Crow, colonization, genocide." },
          { id: "anti_immigrant", label: "Anti-immigrant policies & xenophobia", desc: "Detention, family separation, deportation threats, dehumanizing rhetoric." },
          { id: "indigenous_erasure", label: "Indigenous erasure & colonial legacy", desc: "Boarding school legacy, land dispossession, treaty violations." },
        ],
      },
      {
        id: "economic_sys",
        label: "Economic Systems & Class",
        icon: "\u{1F4B0}",
        description: "Wealth distribution, class structures, and economic policies.",
        traumas: [
          { id: "poverty_structural", label: "Structural poverty", desc: "Economic systems concentrating poverty through wage policy, taxation, and resource allocation." },
          { id: "wealth_gap", label: "Racial wealth gap", desc: "Multigenerational wealth disparities from historical exclusion." },
          { id: "safety_net_gaps", label: "Inadequate social safety nets", desc: "Insufficient welfare, disability, unemployment, or healthcare programs." },
          { id: "class_stigma", label: "Classism & poverty stigma", desc: "Cultural narratives blaming individuals for poverty." },
        ],
      },
      {
        id: "political_legal",
        label: "Political & Legal Systems",
        icon: "\u{1F3DB}️",
        description: "Laws, political ideology, and justice systems.",
        traumas: [
          { id: "mass_incarceration", label: "Mass incarceration", desc: "Disproportionate imprisonment devastating communities and separating families." },
          { id: "anti_lgbtq_law", label: "Anti-LGBTQI+ legislation", desc: "Laws restricting healthcare access, recognition, and protections." },
          { id: "reproductive_policy", label: "Reproductive rights restrictions", desc: "Policies limiting bodily autonomy, disproportionately affecting marginalized people." },
          { id: "voter_suppress", label: "Voter suppression", desc: "Disenfranchisement creating powerlessness and reinforcing marginalization." },
          { id: "immigration_system", label: "Immigration enforcement system", desc: "Detention, deportation, and family separation as state policy." },
        ],
      },
      {
        id: "cultural_norms",
        label: "Cultural Norms & Ideology",
        icon: "\u{1F310}",
        description: "Prevailing beliefs that normalize certain experiences and marginalize others.",
        traumas: [
          { id: "patriarchy", label: "Patriarchy & gender-based oppression", desc: "Systems normalizing gender-based violence, rigid roles, and subordination." },
          { id: "ableism", label: "Ableism & disability exclusion", desc: "Cultural devaluation, institutional barriers, forced compliance with 'normality.'" },
          { id: "heteronormativity", label: "Heteronormativity & cissexism", desc: "Assumption that heterosexual/cisgender is default." },
          { id: "religious_dominance", label: "Religious / cultural dominance", desc: "Dominant culture imposing values on minoritized groups." },
          { id: "meritocracy_myth", label: "Meritocracy mythology", desc: "Belief that success is purely individual, erasing systemic barriers." },
          { id: "war_conflict", label: "War, genocide & political violence", desc: "State-sponsored violence, mass displacement." },
        ],
      },
      {
        id: "historical_gen",
        label: "Historical & Generational Trauma",
        icon: "\u{1F4DC}",
        description: "Traumatic events persisting across generations.",
        traumas: [
          { id: "slavery_legacy", label: "Slavery & its enduring legacy", desc: "Multigenerational impact on Black Americans." },
          { id: "colonization", label: "Colonization & cultural genocide", desc: "Systematic destruction of Indigenous cultures, languages, and communities." },
          { id: "holocaust_genocide", label: "Holocaust & other genocides", desc: "Intergenerational trauma from mass atrocities worldwide." },
          { id: "forced_migration", label: "Forced migration & diaspora", desc: "Communities displaced by war, famine, or persecution." },
          { id: "internment", label: "Internment & forced relocation", desc: "Government-mandated displacement of communities." },
        ],
      },
    ],
  },
];

/* -- Learning Effect Domains -- */

const LEARNING_AREAS = [
  {
    id: "cognitive", label: "Cognitive Impacts", icon: "\u{1F9E0}", color: "#E63946",
    bg: "#1A0A0A", text: "#F8E0E0", border: "#E6394633",
    effects: [
      { id: "cog_memory", label: "Reduced working memory capacity" },
      { id: "cog_attention", label: "Impaired attention & concentration" },
      { id: "cog_problem", label: "Diminished problem-solving & abstract reasoning" },
      { id: "cog_exec", label: "Executive functioning deficits (planning, organizing, self-monitoring)" },
      { id: "cog_shift", label: "Difficulty shifting between tasks or mental sets" },
      { id: "cog_hypervig", label: "Hypervigilance redirecting cognitive resources to threat detection" },
    ],
    citation: "Gray, 2019; Stillerman, 2013; van der Kolk, 2014",
  },
  {
    id: "language", label: "Language & Communication", icon: "\u{1F4AC}", color: "#7EB8E0",
    bg: "#0C1520", text: "#DCF0FF", border: "#7EB8E033",
    effects: [
      { id: "lang_recept", label: "Impaired receptive language processing" },
      { id: "lang_express", label: "Reduced expressive language & vocabulary" },
      { id: "lang_pragmatic", label: "Pragmatic language difficulties (social cues, turn-taking)" },
      { id: "lang_narrative", label: "Narrative fragmentation — difficulty telling a coherent story" },
      { id: "lang_mutism", label: "Selective mutism or shutdown in stressful settings" },
      { id: "lang_tone", label: "Difficulty interpreting tone, sarcasm, or ambiguous language" },
    ],
    citation: "Gray, 2019; NCTSN, 2018",
  },
  {
    id: "behavior", label: "Behavior & Self-Regulation", icon: "⚖️", color: "#f4a78a",
    bg: "#1a110e", text: "#fce8df", border: "#f4a78a33",
    effects: [
      { id: "beh_aggress", label: "Aggression & externalizing behaviors" },
      { id: "beh_impuls", label: "Impulsivity & risk-taking" },
      { id: "beh_react", label: "Disproportionate emotional reactivity (fight/flight/freeze/fawn)" },
      { id: "beh_withdraw", label: "Withdrawal, dissociation, or 'checking out'" },
      { id: "beh_distract", label: "Distractibility & restlessness" },
      { id: "beh_sensory", label: "Sensory sensitivities or seeking behaviors" },
    ],
    citation: "Gray, 2019; Stillerman, 2013; Perry, 2006",
  },
  {
    id: "relationships", label: "Relationships & Social Skills", icon: "\u{1F91D}", color: "#f0d861",
    bg: "#1a1808", text: "#FAF5D8", border: "#f0d86133",
    effects: [
      { id: "rel_friends", label: "Difficulty forming & maintaining friendships" },
      { id: "rel_trust", label: "Mistrust of adults & authority figures" },
      { id: "rel_collab", label: "Challenges with collaboration & group work" },
      { id: "rel_boundary", label: "Boundary confusion — too rigid or too permeable" },
      { id: "rel_fawn", label: "People-pleasing / fawning as survival strategy" },
      { id: "rel_cues", label: "Misreading social cues leading to conflict" },
      { id: "rel_attach", label: "Attachment disruptions affecting all relationships" },
    ],
    citation: "Gray, 2019; Blaustein & Kinniburgh, 2018",
  },
  {
    id: "academic", label: "Academic Outcomes", icon: "\u{1F393}", color: "#27ae60",
    bg: "#081a10", text: "#D0F0DE", border: "#27ae6033",
    effects: [
      { id: "acad_absent", label: "Chronic absenteeism & school avoidance" },
      { id: "acad_engage", label: "Reduced effort, motivation, & engagement" },
      { id: "acad_disrupt", label: "Classroom disruption misidentified as behavioral disorder" },
      { id: "acad_profic", label: "Lower reading & math proficiency" },
      { id: "acad_retain", label: "Higher rates of grade retention & dropout" },
      { id: "acad_sped", label: "Increased referrals to special education" },
      { id: "acad_aspire", label: "Narrowed future aspirations & learned helplessness" },
    ],
    citation: "Gray, 2019; Stillerman, 2013; NCTSN, 2018",
  },
  {
    id: "somatic", label: "Somatic & Physiological", icon: "\u{1FAC0}", color: "#9B59B6",
    bg: "#140A1A", text: "#EAD8F4", border: "#9B59B633",
    effects: [
      { id: "som_pain", label: "Chronic headaches, stomachaches, unexplained pain" },
      { id: "som_sleep", label: "Sleep disturbances — insomnia, nightmares, hypersomnia" },
      { id: "som_startle", label: "Heightened startle response & autonomic arousal" },
      { id: "som_flash", label: "Somatic flashbacks & body memories" },
      { id: "som_fatigue", label: "Fatigue & low energy impacting performance" },
      { id: "som_eating", label: "Disordered eating patterns" },
    ],
    citation: "van der Kolk, 2014; Perry, 2006",
  },
];

/* ════════════════════════════════════════════════════════════════════
   THEME HELPERS
   ════════════════════════════════════════════════════════════════════ */

/** Get system-level color values adapted for current theme */
function sysColor(sc, dark) {
  if (dark) {
    return {
      cardBg: sc.light,         // e.g. "#7EB8E015"
      cardBgNone: "#111",
      border: sc.ring + "55",
      borderNone: "#2b3326",
      accent: sc.accent,
      ring: sc.ring,
      text: sc.text,
      labelText: "#e0edec",
      descText: "#6b8886",
      countBadgeBg: sc.ring,
      countBadgeText: "#0a0a0a",
      tagBg: sc.light,
      tagText: sc.accent,
      tagBorder: sc.ring + "22",
      checkBorderOff: "#2b3326",
      checkBgOn: sc.ring,
      checkTextOn: "#0a0a0a",
      traumaLabelOn: sc.text,
      traumaLabelOff: "#a3bfbd",
    };
  }
  return {
    cardBg: sc.accent + "10",
    cardBgNone: "#fff",
    border: sc.accent + "20",
    borderNone: "#ebebeb",
    accent: sc.accent,
    ring: sc.ring,
    text: "#0f1419",
    labelText: "#0f1419",
    descText: "#4a5560",
    countBadgeBg: sc.ring,
    countBadgeText: "#fff",
    tagBg: sc.accent + "10",
    tagText: sc.accent,
    tagBorder: sc.accent + "20",
    checkBorderOff: "#ebebeb",
    checkBgOn: sc.ring,
    checkTextOn: "#fff",
    traumaLabelOn: "#0f1419",
    traumaLabelOff: "#4a5560",
  };
}

/* ════════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ════════════════════════════════════════════════════════════════════ */

function Check({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M4 9.5L7.5 13L14 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chev({ open, dark }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", flexShrink: 0 }}>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -- Theme Toggle -- */

function ThemeToggle({ dark, toggle }) {
  return (
    <button onClick={toggle} style={{
      padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${dark ? "#2b3326" : "#ebebeb"}`,
      background: dark ? "#142322" : "#f0f0f0", color: dark ? "#e0edec" : "#0f1419",
      fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {dark ? "☀️" : "\u{1F319}"} {dark ? "Light" : "Dark"}
    </button>
  );
}

/* -- Interactive Ring Diagram -- */

function InteractiveRings({ activeLevel, setActiveLevel, selections, dark }) {
  const t = dark ? T.dark : T.light;
  const cx = 260, cy = 260;
  const rings = [
    { id: "macro", innerR: 200, outerR: 254, label: "Macrosystem", color: "#E89B2D", tc: "#1A1208" },
    { id: "exo", innerR: 146, outerR: 196, label: "Exosystem", color: "#27AE60", tc: "#081A10" },
    { id: "meso", innerR: 92, outerR: 142, label: "Mesosystem", color: "#9B59B6", tc: "#FFFFFF" },
    { id: "micro", innerR: 38, outerR: 88, label: "Microsystem", color: "#7EB8E0", tc: "#0C1520" },
  ];
  const sub = { micro: "Immediate", meso: "Connections", exo: "Indirect", macro: "Cultural/Societal" };
  const arc = (iR, oR) =>
    `M ${cx - oR} ${cy} A ${oR} ${oR} 0 1 1 ${cx + oR} ${cy} A ${oR} ${oR} 0 1 1 ${cx - oR} ${cy} Z ` +
    `M ${cx - iR} ${cy} A ${iR} ${iR} 0 1 0 ${cx + iR} ${cy} A ${iR} ${iR} 0 1 0 ${cx - iR} ${cy} Z`;

  const inactiveFillAlpha = dark ? "30" : "40";
  const inactiveStrokeAlpha = dark ? "55" : "55";

  return (
    <svg viewBox="0 0 520 520" style={{ width: "100%", maxWidth: 460, margin: "0 auto", display: "block", cursor: "pointer" }}>
      {rings.map((r) => {
        const a = activeLevel === r.id;
        const ct = selections[r.id]?.traumas?.length || 0;
        const m = (r.innerR + r.outerR) / 2;
        const activeTc = dark ? r.tc : (r.id === "meso" ? "#fff" : "#fff");
        return (
          <g key={r.id} onClick={() => setActiveLevel(r.id === activeLevel ? null : r.id)} style={{ cursor: "pointer" }}>
            <path d={arc(r.innerR, r.outerR)} fill={a ? r.color : r.color + inactiveFillAlpha} stroke={a ? r.color : r.color + inactiveStrokeAlpha} strokeWidth={a ? 3 : 1.5} fillRule="evenodd" style={{ transition: "all 0.3s" }} />
            <text x={cx} y={cy - m + 5} textAnchor="middle" dominantBaseline="middle" fill={a ? activeTc : r.color} fontSize={r.id === "macro" ? 13 : 12} fontWeight="700" fontFamily="'DM Sans', sans-serif" style={{ pointerEvents: "none" }}>{r.label}</text>
            {ct > 0 && (
              <g style={{ pointerEvents: "none" }}>
                <circle cx={cx} cy={cy - m + 18} r={10} fill={a ? activeTc : r.color} stroke={a ? r.color : r.color + inactiveStrokeAlpha} strokeWidth="1.5" />
                <text x={cx} y={cy - m + 19} textAnchor="middle" dominantBaseline="middle" fill={a ? r.color : (dark ? "#0a0a0a" : "#fff")} fontSize="10" fontWeight="700" fontFamily="'DM Sans', sans-serif">{ct}</text>
              </g>
            )}
            <text x={cx} y={cy + m - 1} textAnchor="middle" dominantBaseline="middle" fill={a ? activeTc : r.color + "88"} fontSize={10} fontWeight="500" fontFamily="'DM Sans', sans-serif" style={{ pointerEvents: "none" }}>{sub[r.id]}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={34} fill={t.ringCenter} stroke={t.ringStroke} strokeWidth="1" />
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle" fill={t.ringPersonFill} fontSize="18">{"\u{1F464}"}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fill={t.ringPersonLabel} fontSize="9" fontWeight="600" fontFamily="'DM Sans', sans-serif">Individual</text>
    </svg>
  );
}

/* -- Setting Accordion -- */

function SettingAccordion({ setting, sc, sel, onToggle, dark }) {
  const [open, setOpen] = useState(false);
  const t = dark ? T.dark : T.light;
  const c = sysColor(sc, dark);
  const ct = setting.traumas.filter((tr) => sel.includes(tr.id)).length;
  return (
    <div style={{ border: `1.5px solid ${ct > 0 ? c.border : t.border}`, borderRadius: 12, overflow: "hidden", backgroundColor: ct > 0 ? c.cardBg : t.card, transition: "all 0.2s", marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "none", cursor: "pointer", backgroundColor: "transparent", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{setting.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.labelText, display: "flex", alignItems: "center", gap: 6 }}>
            {setting.label}
            {ct > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 8, backgroundColor: c.countBadgeBg, color: c.countBadgeText, fontFamily: "'DM Sans', sans-serif" }}>{ct}</span>}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1, lineHeight: 1.35 }}>{setting.description}</div>
        </div>
        <Chev open={open} dark={dark} />
      </button>
      {open && (
        <div style={{ padding: "2px 14px 14px", borderTop: `1px solid ${t.border}` }}>
          {setting.traumas.map((tr) => {
            const s = sel.includes(tr.id);
            return (
              <button key={tr.id} onClick={() => onToggle(tr.id)} style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%", padding: "8px 10px", marginTop: 5, borderRadius: 8, border: `1.5px solid ${s ? c.border : t.border}`, backgroundColor: s ? c.cardBg : t.inputBg, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${s ? c.checkBgOn : c.checkBorderOff}`, backgroundColor: s ? c.checkBgOn : "transparent", color: c.checkTextOn, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>{s && <Check size={12} />}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s ? c.traumaLabelOn : c.traumaLabelOff }}>{tr.label}</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1, lineHeight: 1.4 }}>{tr.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -- Learning Domain Card -- */

function LearningDomain({ area, selectedEffects, onToggleEffect, dark }) {
  const [open, setOpen] = useState(false);
  const t = dark ? T.dark : T.light;
  const ct = area.effects.filter((e) => selectedEffects.includes(e.id)).length;
  const hasAny = ct > 0;

  const cardBg = dark ? (hasAny ? area.bg : "#142322") : (hasAny ? "#fff" : "#fff");
  const cardBorder = dark
    ? `1.5px solid ${hasAny ? area.color + "44" : area.color + "22"}`
    : `1.5px solid ${hasAny ? area.color + "40" : "#ebebeb"}`;
  const cardShadow = hasAny ? `0 0 30px ${area.color}10` : "none";

  const chipUnselBg = dark ? "#142322" : "#f5f5f5";
  const chipUnselColor = dark ? "#a3bfbd" : "#0f1419";
  const chipUnselBorder = dark ? "#2b3326" : "#ebebeb";
  const chipSelColor = dark ? "#0a0a0a" : "#fff";
  const chipCheckBg = dark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)";

  const iconBgInactive = dark ? area.color + "20" : area.color + "15";
  const countTextColor = dark ? "#0a0a0a" : "#fff";

  return (
    <div style={{ borderRadius: 14, marginBottom: 10, overflow: "hidden", transition: "all 0.25s ease", border: cardBorder, backgroundColor: cardBg, boxShadow: cardShadow }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: "none", cursor: "pointer", backgroundColor: "transparent", fontFamily: "inherit", textAlign: "left" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: hasAny ? area.color : iconBgInactive, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "all 0.25s ease", boxShadow: hasAny ? `0 4px 20px ${area.color}30` : "none" }}>
          {hasAny ? <span style={{ color: countTextColor, fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>{ct}</span> : <span>{area.icon}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: area.color }}>{area.label}</span>
            {hasAny && <span style={{ fontSize: 10, color: area.color, fontWeight: 600, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>{ct}/{area.effects.length}</span>}
          </div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 1, fontFamily: "'DM Sans', sans-serif" }}>{area.citation}</div>
        </div>
        <Chev open={open} dark={dark} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${dark ? (hasAny ? area.border : "#2b3326") : (hasAny ? area.color + "20" : "#ebebeb")}`, animation: "fadeIn 0.2s ease" }}>
          <p style={{ fontSize: 12, color: t.textMuted, margin: "12px 0 10px", fontWeight: 500 }}>Select specific effects relevant to your client population:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {area.effects.map((effect) => {
              const sel = selectedEffects.includes(effect.id);
              return (
                <button key={effect.id} className="effect-chip" onClick={() => onToggleEffect(effect.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: sel ? "8px 14px 8px 10px" : "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: sel ? 600 : 500, fontFamily: "inherit", lineHeight: 1.3, border: `1.5px solid ${sel ? area.color : chipUnselBorder}`, backgroundColor: sel ? area.color : chipUnselBg, color: sel ? chipSelColor : chipUnselColor, boxShadow: sel ? `0 2px 12px ${area.color}25` : "none" }}>
                  {sel && <span style={{ display: "flex", alignItems: "center", width: 16, height: 16, borderRadius: 4, backgroundColor: chipCheckBg, justifyContent: "center" }}><Check size={11} /></span>}
                  {effect.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => { area.effects.forEach((e) => { if (!selectedEffects.includes(e.id)) onToggleEffect(e.id); }); }} style={{ fontSize: 11, fontWeight: 600, color: area.color, backgroundColor: "transparent", border: `1px solid ${dark ? area.border : area.color + "30"}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>Select all</button>
            {hasAny && <button onClick={() => { area.effects.forEach((e) => { if (selectedEffects.includes(e.id)) onToggleEffect(e.id); }); }} style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, backgroundColor: "transparent", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('rtn-theme') === 'dark'; } catch (e) { return false; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('rtn-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }, [dark]);
  const [activeLevel, setActiveLevel] = useState(null);
  const [viewMode, setViewMode] = useState("systems");
  const [selections, setSelections] = useState({
    micro: { traumas: [], notes: "" },
    meso: { traumas: [], notes: "" },
    exo: { traumas: [], notes: "" },
    macro: { traumas: [], notes: "" },
    learningEffects: [],
  });
  const [studentName, setStudentName] = useState("");
  const [studentDate, setStudentDate] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  const detailRef = useRef(null);

  const t = dark ? T.dark : T.light;
  const toggleTheme = () => setDark((d) => !d);

  /* Sync body background */
  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.color = t.text;
  }, [dark, t.bg, t.text]);

  useEffect(() => {
    if (activeLevel && detailRef.current) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [activeLevel]);

  const toggleTrauma = (lid, tid) =>
    setSelections((p) => {
      const c = p[lid].traumas;
      return { ...p, [lid]: { ...p[lid], traumas: c.includes(tid) ? c.filter((x) => x !== tid) : [...c, tid] } };
    });

  const toggleLearningEffect = (eid) =>
    setSelections((p) => ({
      ...p,
      learningEffects: p.learningEffects.includes(eid) ? p.learningEffects.filter((e) => e !== eid) : [...p.learningEffects, eid],
    }));

  const updateNotes = (lid, n) => setSelections((p) => ({ ...p, [lid]: { ...p[lid], notes: n } }));

  const totalTraumas = ["micro", "meso", "exo", "macro"].reduce((s, k) => s + selections[k].traumas.length, 0);
  const totalEffects = selections.learningEffects.length;
  const totalAll = totalTraumas + totalEffects;
  const currentSystem = activeLevel ? SYSTEM_LEVELS.find((s) => s.id === activeLevel) : null;

  /* -- Print -- */
  const handlePrint = useCallback(() => {
    const esc = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sysSec = SYSTEM_LEVELS.map((sys) => {
      const sel = selections[sys.id];
      const parts = sys.settings.map((st) => {
        const pk = st.traumas.filter((tr) => sel.traumas.includes(tr.id));
        if (!pk.length) return "";
        return `<div style="margin-bottom:10px;"><div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:4px;">${st.icon} ${st.label}</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${pk.map((tr) => `<span style="font-size:11px;padding:3px 8px;border-radius:5px;background:${sys.color.light};color:${sys.color.accent};border:1px solid ${sys.color.ring}33;">${esc(tr.label)}</span>`).join("")}</div></div>`;
      }).filter(Boolean).join("");
      if (!parts && !sel.notes) return "";
      return `<div style="margin-bottom:16px;padding:12px 16px;border-left:4px solid ${sys.color.ring};background:#FAFBFC;border-radius:0 8px 8px 0;"><div style="font-size:15px;font-weight:700;color:${sys.color.accent};margin-bottom:6px;">${sys.label}</div>${parts}${sel.notes ? `<div style="margin-top:6px;padding:6px 10px;background:#F3F4F6;border-radius:5px;font-size:11px;color:#4B5563;font-style:italic;line-height:1.5;"><strong style="font-style:normal;">Notes:</strong> ${esc(sel.notes)}</div>` : ""}</div>`;
    }).filter(Boolean).join("");

    const lSec = selections.learningEffects.length > 0
      ? LEARNING_AREAS.map((a) => {
          const picked = a.effects.filter((e) => selections.learningEffects.includes(e.id));
          if (!picked.length) return "";
          return `<div style="margin-bottom:12px;padding:10px 14px;background:#f8f8f8;border-radius:8px;border:1.5px solid #ddd;"><div style="font-size:14px;font-weight:700;color:${a.color};margin-bottom:6px;">${a.icon} ${a.label} <span style="font-size:11px;font-weight:500;color:#999;">(${picked.length}/${a.effects.length})</span></div><div style="display:flex;flex-wrap:wrap;gap:4px;">${picked.map((e) => `<span style="font-size:11px;padding:4px 10px;border-radius:6px;background:${a.color};color:#fff;font-weight:500;">${esc(e.label)}</span>`).join("")}</div><div style="font-size:9px;color:#999;margin-top:6px;">${a.citation}</div></div>`;
        }).filter(Boolean).join("")
      : '<p style="font-size:12px;color:#999;font-style:italic;">None selected.</p>';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Trauma Explorer — ${esc(studentName) || "Submission"}</title><style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans', sans-serif;color:#1A1A2E}@media print{.np{display:none!important}@page{margin:.5in .6in;size:letter}}</style></head><body><div style="max-width:740px;margin:0 auto;padding:16px;"><div style="background:#1a1a1a;padding:20px 24px;border-radius:10px;margin-bottom:16px;color:#fff;"><div style="font-family:'DM Sans', sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;opacity:.5;">Trauma-Informed Practice</div><div style="font-size:22px;font-weight:800;margin:4px 0;">Ecological Systems & Trauma Explorer</div></div><table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px;"><tr><td style="padding:5px 0;border-bottom:1px solid #ddd;"><strong>Name:</strong> ${esc(studentName) || "___________________________"}</td><td style="padding:5px 0;border-bottom:1px solid #ddd;text-align:right;"><strong>Date:</strong> ${esc(studentDate)}</td></tr></table><div style="font-size:16px;font-weight:800;color:#333;margin-bottom:10px;">Trauma Across Ecological Systems</div>${sysSec || '<p style="font-size:12px;color:#999;">No selections.</p>'}<div style="font-size:16px;font-weight:800;color:#333;margin:18px 0 10px;">Learning Effects Identified</div>${lSec}<div style="margin-top:18px;padding:12px 16px;background:#f5f5f5;border-radius:6px;border:1px solid #ddd;font-size:10px;color:#666;line-height:1.7;"><strong style="font-size:11px;color:#333;">References</strong><br>Blaustein & Kinniburgh (2018). Guilford. · Bronfenbrenner (1979). Harvard UP. · Gray (2019). Springer. · NCTSN (2018). · Perry (2006). Guilford. · SAMHSA (2014). HHS. · Stillerman (2013). IL ACEs. · van der Kolk (2014). Viking.</div><div class="np" style="text-align:center;margin-top:24px;"><button onclick="window.print()" style="background:#2b446e;color:#fff;border:none;padding:10px 28px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Print / Save as PDF</button></div></div></body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  }, [selections, studentName, studentDate]);

  const tabStyle = (a) => ({
    padding: "9px 18px", borderRadius: 999,
    border: a ? "none" : `1px solid ${t.border}`,
    fontSize: 12, fontWeight: a ? 700 : 400, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    background: a ? "#2b446e" : "transparent",
    color: a ? "#fff" : t.textDim,
    boxShadow: a ? "0 3px 12px rgba(43,68,110,0.30)" : "none",
  });

  const cs = {
    backgroundColor: t.card, borderRadius: 14, padding: "18px 20px",
    border: `1px solid ${t.border}`,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.bg, transition: "background 0.3s" }}>
      {/* Header */}
      <header style={{ padding: "28px 16px 24px", textAlign: "center", borderBottom: `1px solid ${dark ? "#2b3326" : "#ebebeb"}` }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: t.textDim, fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 6px" }}>TRAUMA-INFORMED PRACTICE</p>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, color: t.text, margin: "0 0 8px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Ecological Systems &amp; Trauma Explorer</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <p style={{ color: t.textDim, fontSize: 13, margin: 0, lineHeight: 1.4 }}>Click each ring to map trauma, then identify specific learning effects.</p>
            <ThemeToggle dark={dark} toggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "20px 14px 80px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => setViewMode("systems")} style={tabStyle(viewMode === "systems")}>Ecological Systems{totalTraumas > 0 ? ` (${totalTraumas})` : ""}</button>
          <button onClick={() => { setViewMode("learning"); setActiveLevel(null); }} style={tabStyle(viewMode === "learning")}>Learning Effects{totalEffects > 0 ? ` (${totalEffects})` : ""}</button>
          <button onClick={() => { setViewMode("summary"); setActiveLevel(null); }} style={tabStyle(viewMode === "summary")}>Summary{totalAll > 0 ? ` (${totalAll})` : ""}</button>
        </div>

        {/* -- SYSTEMS VIEW -- */}
        {viewMode === "systems" && (
          <>
            <div style={{ ...cs, padding: "20px 12px", marginBottom: 16, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 12px" }}>Click a ring to explore that system level and identify trauma types.</p>
              <InteractiveRings activeLevel={activeLevel} setActiveLevel={(id) => { setActiveLevel(id); setViewMode("systems"); }} selections={selections} dark={dark} />
            </div>
            {currentSystem && (() => {
              const c = sysColor(currentSystem.color, dark);
              return (
                <div ref={detailRef} style={{ ...cs, borderLeft: `4px solid ${c.ring}`, marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "inline-block", fontFamily: "'DM Sans', sans-serif", backgroundColor: c.countBadgeBg, color: c.countBadgeText, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "3px 10px", borderRadius: 5, marginBottom: 6 }}>{currentSystem.label}</div>
                      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 2px", color: c.accent, letterSpacing: "-0.01em" }}>{currentSystem.label}</h2>
                      <p style={{ fontSize: 12, color: t.textMuted, margin: 0, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{currentSystem.subtitle}</p>
                    </div>
                    <button onClick={() => setActiveLevel(null)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, backgroundColor: t.btnBg, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, flexShrink: 0 }}>{"✕"}</button>
                  </div>
                  <p style={{ fontSize: 13, color: t.textSub, margin: "0 0 14px", lineHeight: 1.5 }}>{currentSystem.description}</p>
                  {selections[currentSystem.id].traumas.length > 0 && (
                    <div style={{ marginBottom: 14, padding: "8px 12px", backgroundColor: c.cardBg, borderRadius: 8, border: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.accent, fontFamily: "'DM Sans', sans-serif" }}>{selections[currentSystem.id].traumas.length} selected</span>
                    </div>
                  )}
                  <p style={{ fontSize: 13, fontWeight: 600, color: dark ? "#a3bfbd" : "#4a5560", marginBottom: 8 }}>Expand each setting to identify specific traumas:</p>
                  {currentSystem.settings.map((s) => <SettingAccordion key={s.id} setting={s} sc={currentSystem.color} sel={selections[currentSystem.id].traumas} onToggle={(tid) => toggleTrauma(currentSystem.id, tid)} dark={dark} />)}
                  <div style={{ marginTop: 12 }}>
                    <label htmlFor={`n-${currentSystem.id}`} style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 5, color: dark ? "#a3bfbd" : "#4a5560" }}>Clinical Reflection <span style={{ fontWeight: 400, color: t.textDim }}>(optional)</span></label>
                    <textarea id={`n-${currentSystem.id}`} placeholder="How does your client population experience trauma at this level?" value={selections[currentSystem.id].notes} onChange={(e) => updateNotes(currentSystem.id, e.target.value)} rows={3} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${t.border}`, fontSize: 12, fontFamily: "inherit", resize: "vertical", lineHeight: 1.5, color: t.text, backgroundColor: t.inputBg, boxSizing: "border-box", outline: "none" }} onFocus={(e) => (e.target.style.borderColor = c.ring)} onBlur={(e) => (e.target.style.borderColor = dark ? "#2b3326" : "#ebebeb")} />
                  </div>
                </div>
              );
            })()}
            {!activeLevel && <div style={{ textAlign: "center", padding: "16px 20px", color: t.textDim, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Select a ring above to begin.</div>}
          </>
        )}

        {/* -- LEARNING EFFECTS VIEW -- */}
        {viewMode === "learning" && (
          <>
            <div style={{ ...cs, marginBottom: 16, borderLeft: "4px solid #4ade80" }}>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#4ade80", letterSpacing: "-0.01em" }}>Effects on Learning</h2>
              <p style={{ fontSize: 13, color: t.textSub, margin: 0, lineHeight: 1.5 }}>Expand each domain and select the <strong style={{ color: t.text }}>individual effects</strong> most relevant to your client population.</p>
              {totalEffects > 0 && (
                <div style={{ marginTop: 10, padding: "7px 12px", backgroundColor: dark ? "#4ade8015" : "#4ade8010", borderRadius: 8, border: `1px solid ${dark ? "#4ade8033" : "#4ade8030"}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Sans', sans-serif" }}>
                    {totalEffects} effect{totalEffects !== 1 ? "s" : ""} selected across {LEARNING_AREAS.filter((a) => a.effects.some((e) => selections.learningEffects.includes(e.id))).length} domain{LEARNING_AREAS.filter((a) => a.effects.some((e) => selections.learningEffects.includes(e.id))).length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            {LEARNING_AREAS.map((a) => <LearningDomain key={a.id} area={a} selectedEffects={selections.learningEffects} onToggleEffect={toggleLearningEffect} dark={dark} />)}
          </>
        )}

        {/* -- SUMMARY VIEW -- */}
        {viewMode === "summary" && (
          <>
            <div style={{ ...cs, marginBottom: 14, borderLeft: "4px solid #7EB8E0" }}>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#7EB8E0", letterSpacing: "-0.01em" }}>Your Ecological Trauma Map</h2>
              <p style={{ fontSize: 13, color: t.textSub, margin: 0, lineHeight: 1.5 }}>Complete overview of trauma and learning effects identified.</p>
            </div>
            <div style={{ ...cs, padding: "16px 10px", marginBottom: 14, textAlign: "center" }}>
              <InteractiveRings activeLevel={null} setActiveLevel={(id) => { setActiveLevel(id); setViewMode("systems"); }} selections={selections} dark={dark} />
              <p style={{ fontSize: 11, color: t.textDim, margin: "8px 0 0", fontFamily: "'DM Sans', sans-serif" }}>Click a ring to edit</p>
            </div>

            {SYSTEM_LEVELS.map((sys) => {
              const sel = selections[sys.id];
              const has = sel.traumas.length > 0 || sel.notes;
              const c = sysColor(sys.color, dark);
              if (!has) return <div key={sys.id} style={{ ...cs, marginBottom: 8, borderLeft: `4px solid ${c.ring}22`, padding: "12px 18px", opacity: 0.4 }}><span style={{ fontSize: 14, fontWeight: 800, color: c.accent }}>{sys.label}</span><span style={{ fontSize: 11, color: t.textDim, marginLeft: 10, fontStyle: "italic" }}>No selections</span></div>;
              return (
                <div key={sys.id} style={{ ...cs, marginBottom: 10, borderLeft: `4px solid ${c.ring}`, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: c.accent }}>{sys.label}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.countBadgeText, backgroundColor: c.countBadgeBg, padding: "2px 8px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>{sel.traumas.length}</span>
                  </div>
                  {sys.settings.map((st) => {
                    const pk = st.traumas.filter((tr) => sel.traumas.includes(tr.id));
                    if (!pk.length) return null;
                    return (
                      <div key={st.id} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.textSub, marginBottom: 3 }}>{st.icon} {st.label}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {pk.map((tr) => <span key={tr.id} style={{ fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 5, backgroundColor: c.tagBg, color: c.tagText, border: `1px solid ${c.tagBorder}` }}>{tr.label}</span>)}
                        </div>
                      </div>
                    );
                  })}
                  {sel.notes && <div style={{ marginTop: 6, padding: "6px 10px", backgroundColor: t.inputBg, borderRadius: 5, fontSize: 11, color: t.textMuted, fontStyle: "italic", lineHeight: 1.45, borderLeft: `3px solid ${c.ring}33` }}>{sel.notes}</div>}
                </div>
              );
            })}

            {totalEffects > 0 && (
              <div style={{ ...cs, marginTop: 18, marginBottom: 10, borderLeft: "4px solid #4ade80", padding: "14px 18px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px", color: "#4ade80" }}>Learning Effects Identified <span style={{ fontSize: 12, fontWeight: 500, color: t.textDim, fontFamily: "'DM Sans', sans-serif" }}>({totalEffects} total)</span></h3>
                {LEARNING_AREAS.map((a) => {
                  const picked = a.effects.filter((e) => selections.learningEffects.includes(e.id));
                  if (!picked.length) return null;
                  const summaryCardBg = dark ? a.bg : "#fff";
                  const summaryCardBorder = dark ? `1.5px solid ${a.border}` : `1.5px solid ${a.color + "25"}`;
                  return (
                    <div key={a.id} style={{ marginBottom: 10, padding: "10px 14px", backgroundColor: summaryCardBg, borderRadius: 10, border: summaryCardBorder }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.color, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>{a.icon} {a.label}<span style={{ fontSize: 10, fontWeight: 500, color: t.textDim, fontFamily: "'DM Sans', sans-serif" }}>{picked.length}/{a.effects.length}</span></div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {picked.map((e) => <span key={e.id} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 7, backgroundColor: a.color, color: dark ? "#0a0a0a" : "#fff" }}>{e.label}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* References */}
            <div style={{ marginTop: 16, padding: "12px 16px", backgroundColor: t.card, borderRadius: 10, border: `1px solid ${t.border}`, fontSize: 10, color: t.textDim, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, marginBottom: 3, fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>References</div>
              Blaustein & Kinniburgh (2018). Guilford. {"·"} Bronfenbrenner (1979). Harvard UP. {"·"} Gray (2019). Springer. {"·"} NCTSN (2018). {"·"} Perry (2006). Guilford. {"·"} SAMHSA (2014). HHS. {"·"} Stillerman (2013). IL ACEs. {"·"} van der Kolk (2014). Viking.
            </div>

            {/* Save & Print */}
            <div style={{ ...cs, marginTop: 14 }}>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 19, fontWeight: 700, margin: "0 0 4px", color: t.text, letterSpacing: "-0.01em" }}>Save &amp; Submit</h3>
              <p style={{ fontSize: 11, color: t.textDim, margin: "0 0 12px" }}>Enter your name, then print or save as PDF.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label htmlFor="sn" style={{ fontSize: 10, fontWeight: 700, display: "block", marginBottom: 3, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>FULL NAME</label>
                  <input id="sn" type="text" placeholder="Your name" value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${t.border}`, fontSize: 12, fontFamily: "inherit", color: t.text, backgroundColor: t.inputBg, boxSizing: "border-box", outline: "none" }} onFocus={(e) => (e.target.style.borderColor = "#2b446e")} onBlur={(e) => (e.target.style.borderColor = dark ? "#2b3326" : "#ebebeb")} />
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <label htmlFor="sd" style={{ fontSize: 10, fontWeight: 700, display: "block", marginBottom: 3, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>DATE</label>
                  <input id="sd" type="text" value={studentDate} onChange={(e) => setStudentDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1.5px solid ${t.border}`, fontSize: 12, fontFamily: "inherit", color: t.text, backgroundColor: t.inputBg, boxSizing: "border-box", outline: "none" }} onFocus={(e) => (e.target.style.borderColor = "#2b446e")} onBlur={(e) => (e.target.style.borderColor = dark ? "#2b3326" : "#ebebeb")} />
                </div>
              </div>
              <button onClick={handlePrint} style={{ border: "none", borderRadius: 999, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "#2b446e", color: "#fff", width: "100%", textAlign: "center", letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s", boxShadow: "0 3px 14px rgba(43,68,110,0.30)" }}>{"\u{1F5A8}️"} Print / Save as PDF</button>
              <p style={{ fontSize: 9, color: t.textDim, margin: "6px 0 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Choose "Save as PDF" in print dialog to download.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
