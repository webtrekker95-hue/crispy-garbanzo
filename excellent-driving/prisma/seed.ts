import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@excellentdriving.sr" },
    update: {},
    create: {
      email: "admin@excellentdriving.sr",
      name: "School Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      language: "EN",
    },
  });

  const instructorSeeds = [
    {
      email: "carlos@excellentdriving.sr",
      name: "Carlos Martinus",
      yearsExperience: 12,
      bio: "Specializes in nervous beginners. Calm, patient teaching style with focus on road safety.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const,
    },
    {
      email: "sandra@excellentdriving.sr",
      name: "Sandra Pengel",
      yearsExperience: 8,
      bio: "Expert in city driving and parking techniques. Available Monday through Friday.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI"] as const,
    },
    {
      email: "roy@excellentdriving.sr",
      name: "Roy Apensa",
      yearsExperience: 15,
      bio: "Former driving examiner. Knows exactly what examiners look for. 97% pass rate.",
      schedule: ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const,
    },
  ];

  const instructorPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
  const instructors = [];

  for (const seed of instructorSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: {},
      create: {
        email: seed.email,
        name: seed.name,
        passwordHash: instructorPasswordHash,
        role: "INSTRUCTOR",
        language: "EN",
      },
    });

    const instructor = await prisma.instructor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: seed.bio,
        yearsExperience: seed.yearsExperience,
        isActive: true,
      },
    });

    await prisma.schedule.createMany({
      data: seed.schedule.map((dayOfWeek) => ({
        instructorId: instructor.id,
        dayOfWeek,
        startTime: dayOfWeek === "SAT" ? "09:00" : "08:00",
        endTime: dayOfWeek === "SAT" ? "13:00" : "17:00",
      })),
      skipDuplicates: true,
    });

    instructors.push(instructor);
  }

  const packageSeeds = [
    {
      id: "seed-pkg-starter",
      nameEn: "Starter",
      nameNl: "Starter",
      descriptionEn: "Perfect for beginners with no prior driving experience.",
      descriptionNl: "Perfect voor beginners zonder eerdere rijervaring.",
      price: 2500,
      featured: false,
    },
    {
      id: "seed-pkg-standard",
      nameEn: "Standard",
      nameNl: "Standaard",
      descriptionEn: "Our most popular package — comprehensive training for confident drivers.",
      descriptionNl: "Ons populairste pakket — uitgebreide training voor zelfverzekerde bestuurders.",
      price: 3000,
      featured: true,
    },
    {
      id: "seed-pkg-premium",
      nameEn: "Premium",
      nameNl: "Premium",
      descriptionEn: "Intensive program designed to get you exam-ready in minimum time.",
      descriptionNl: "Intensief programma om je in minimale tijd examenklaar te maken.",
      price: 3500,
      featured: false,
    },
    {
      id: "seed-pkg-refresher",
      nameEn: "Refresher",
      nameNl: "Opfriscursus",
      descriptionEn: "Already know how to drive? Brush up your skills for the exam.",
      descriptionNl: "Kun je al autorijden? Fris je vaardigheden op voor het examen.",
      price: 650,
      featured: false,
    },
  ];

  for (const pkg of packageSeeds) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {},
      create: {
        id: pkg.id,
        nameEn: pkg.nameEn,
        nameNl: pkg.nameNl,
        descriptionEn: pkg.descriptionEn,
        descriptionNl: pkg.descriptionNl,
        price: pkg.price,
        currency: "SRD",
        lessonCount: 0,
        includesTheory: true,
        featured: pkg.featured,
        isActive: true,
      },
    });
  }

  const faqSeeds = [
    {
      question: "How many lessons do I need to pass my exam?",
      answer:
        "Most students pass after 15–20 lessons, depending on their prior experience. Our instructors will guide you and let you know when you're ready for the exam.",
      language: "EN" as const,
      orderIndex: 1,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept cash payments at our location (Bonistraat 44) and bank transfers. After payment is confirmed by our admin, you'll receive a WhatsApp message with your course access details.",
      language: "EN" as const,
      orderIndex: 2,
    },
    {
      question: "Can I cancel or reschedule a lesson?",
      answer:
        "Yes! You can cancel or reschedule a lesson up to 24 hours before the scheduled time, directly from your student dashboard.",
      language: "EN" as const,
      orderIndex: 3,
    },
    {
      question: "Is the theory course available in Dutch?",
      answer:
        "Yes! Our full platform is available in both English and Dutch. You can switch languages at any time from your profile settings.",
      language: "EN" as const,
      orderIndex: 4,
    },
    {
      question: "Where are lessons conducted?",
      answer:
        "Lessons start and end at our school at Bonistraat 44, Paramaribo. Your instructor will drive through various routes around the city.",
      language: "EN" as const,
      orderIndex: 5,
    },
    {
      question: "Moet ik mijn eigen auto meenemen?",
      answer: "Nee — alle praktijklessen gebruiken onze volledig verzekerde lesauto's.",
      language: "NL" as const,
      orderIndex: 1,
    },
    {
      question: "Welke betaalmethoden accepteren jullie?",
      answer:
        "Wij accepteren contante betalingen op onze locatie (Bonistraat 44) en bankoverschrijvingen. Zodra de betaling is bevestigd, ontvang je een WhatsApp-bericht.",
      language: "NL" as const,
      orderIndex: 2,
    },
  ];

  for (const faq of faqSeeds) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question, language: faq.language },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
  }

  const trafficRegQuiz = {
    type: "QUIZ",
    passingScore: 70,
    questions: [
      {
        text: "At an uncontrolled intersection, who has the right of way?",
        options: ["The vehicle going straight", "The vehicle on the right", "The larger vehicle", "The vehicle that arrived first"],
        correct: 1,
        explanation: "At an uncontrolled intersection in Suriname, the vehicle on the <strong>right</strong> has the right of way, unless otherwise indicated by road signs.",
      },
      {
        text: "What is the maximum speed limit in a residential area (30 zone)?",
        options: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"],
        correct: 1,
        explanation: "In a marked 30-zone (residential area), the maximum speed limit is <strong>30 km/h</strong>. Always watch for pedestrians and children.",
      },
      {
        text: "When must you use your hazard lights?",
        options: ["When parking illegally", "When your vehicle is a hazard to others", "When driving in rain", "All of the above"],
        correct: 1,
        explanation: "Hazard lights should be used when your stationary or moving vehicle poses a <strong>hazard to other road users</strong> — for example, if you break down or need to stop suddenly.",
      },
      {
        text: "A solid white line at the side of the road indicates:",
        options: ["No overtaking allowed", "Edge of the road / carriageway", "Bus stop zone", "Pedestrian crossing ahead"],
        correct: 1,
        explanation: "A <strong>solid white line at the edge</strong> of the road marks the boundary of the carriageway. Do not drive on the other side of this line except in an emergency.",
      },
      {
        text: "What should you do when you see a yellow flashing traffic light?",
        options: ["Stop immediately", "Proceed with caution", "Treat it as a green light", "Honk and proceed"],
        correct: 1,
        explanation: "A <strong>yellow flashing light</strong> means proceed with caution. Slow down and be prepared to give way to other road users.",
      },
    ],
  };

  const speedZonesQuiz = {
    type: "QUIZ",
    passingScore: 70,
    questions: [
      {
        text: "What does a 'school zone' speed sign typically require?",
        options: ["No change from normal limits", "A reduced speed limit near schools", "Only applies on weekends", "Only applies to buses"],
        correct: 1,
        explanation: "School zone signs mark a <strong>reduced speed limit</strong> to protect children during school hours.",
      },
      {
        text: "On an open highway with no posted signs, what governs the speed limit?",
        options: ["There is no limit", "The default national speed limit applies", "Whatever feels safe", "60 km/h always"],
        correct: 1,
        explanation: "Suriname's <strong>default national speed limit</strong> applies wherever no specific sign overrides it.",
      },
    ],
  };

  const examPrepQuiz = {
    type: "QUIZ",
    passingScore: 70,
    questions: [
      {
        text: "Before starting the exam vehicle, what should you check first?",
        options: ["Radio settings", "Mirrors and seat position", "Phone notifications", "Air conditioning"],
        correct: 1,
        explanation: "Examiners expect you to adjust <strong>mirrors and seat position</strong> before moving off — it's one of the first things assessed.",
      },
      {
        text: "If you make a minor mistake during the driving exam, you should:",
        options: ["Stop the car and apologize", "Stay calm and continue driving safely", "Ask to restart the exam", "Panic and speed up"],
        correct: 1,
        explanation: "A single minor mistake rarely fails an exam on its own — <strong>staying calm and continuing safely</strong> is what examiners want to see.",
      },
    ],
  };

  // Real course content, sourced from materiaalrijonderricht/Maquette les 1.pdf.
  // Kept as its own module (not mixed into the example modules below) so it's
  // obvious which content is real curriculum vs. placeholder/demo material.
  const maquetteLes1Lessons = [
    {
      title: "Wat is de Maquette?",
      type: "TEXT" as const,
      content: {
        type: "TEXT",
        body:
          "<p>In moderne theorie-rijlessen wordt de traditionele maquette ook toegepast binnen e-learning. Een digitale maquette is een interactieve weergave van verkeerssituaties waarmee leerlingen online verkeersregels en verkeersinzicht kunnen oefenen. In plaats van een fysiek schaalmodel gebruikt de cursist een computer, tablet of smartphone om verkeersscenario's te bekijken en te analyseren.</p>" +
          "<p>Binnen e-learning helpt de digitale maquette leerlingen om:</p>" +
          "<ul>" +
          "<li>voorrangssituaties beter te begrijpen;</li>" +
          "<li>verkeersborden en wegmarkeringen correct toe te passen;</li>" +
          "<li>gevaarlijke situaties te herkennen;</li>" +
          "<li>inzicht te krijgen in verkeersstromen en rijgedrag;</li>" +
          "<li>zelfstandig en op eigen tempo te oefenen.</li>" +
          "</ul>" +
          "<p>Door animaties, interactieve opdrachten en simulaties wordt de leerstof duidelijker en realistischer weergegeven. Leerlingen kunnen verschillende verkeerssituaties herhalen totdat zij de regels volledig begrijpen. Hierdoor wordt theorie leren niet alleen eenvoudiger, maar ook aantrekkelijker en praktischer.</p>" +
          "<p>De digitale maquette vormt daarom een belangrijk hulpmiddel binnen moderne e-learning voor theorie rijles, omdat het theorie en praktijk op een visuele en interactieve manier met elkaar verbindt.</p>",
      },
    },
    {
      title: "Linksverkeer & Wettelijke Definities",
      type: "TEXT" as const,
      content: {
        type: "TEXT",
        body:
          "<h3>Verkeer in Suriname</h3>" +
          "<p>In Suriname hebben wij <strong>linksverkeer</strong>. Behoudens het bepaalde in de rijwet is de bestuurder verplicht op de door hem gevolgde weg links te houden. Hij mag zich daarbij niet verder van de linkerkant bevinden dan door de omstandigheden gerechtvaardigd wordt.</p>" +
          "<h3>Wegen, bestuurder en motorrijtuig</h3>" +
          "<p>In de rijwet worden verstaan:</p>" +
          "<ol>" +
          "<li>onder <strong>wegen</strong>: alle voor het openbaar verkeer openstaande wegen;</li>" +
          "<li>onder <strong>bestuurder van een motorrijtuig</strong>: hij die het motorrijtuig bestuurt, of hij die overeenkomstig de voorwaarden — te stellen bij het in artikel 17 lid 1 bedoeld staatsbesluit — geacht wordt het motorrijtuig onder zijn onmiddellijk toezicht te doen besturen;</li>" +
          "<li>onder <strong>motorrijtuigen</strong>: alle rij- of voertuigen, bestemd om uitsluitend of mede door een krachtwerktuig, op of aan het rij- of voertuig zelf aanwezig, anders dan langs spoorstaven te worden voortbewogen.</li>" +
          "</ol>",
      },
    },
    {
      title: "Oplossingsmethode voor Maquette-opgaven",
      type: "TEXT" as const,
      content: {
        type: "TEXT",
        body:
          "<p>Bij het oplossen van maquette problemen wordt de volgende volgorde toegepast:</p>" +
          "<ol>" +
          "<li>Bekijk en stel de wegsituatie vast.</li>" +
          "<li>Bespreek elk voertuig afzonderlijk.</li>" +
          "<li>Kijk naar de rijrichting van elk voertuig.</li>" +
          "<li>Bepaal de voorrang aan de hand van de wegsituatie en de rijrichting van de voertuigen.</li>" +
          "</ol>" +
          "<p>Volg deze vier stappen bij elke maquette-opgave, in deze volgorde — dat voorkomt dat je een voertuig of een wegkenmerk over het hoofd ziet.</p>",
      },
    },
    {
      title: "Voorrangsregels — LET OP",
      type: "TEXT" as const,
      content: {
        type: "TEXT",
        body:
          "<p>Let bij het bepalen van voorrang altijd op de volgende regels:</p>" +
          "<ol>" +
          "<li><strong>Zelfde richting behouden:</strong> verkeer dat dezelfde richting blijft volgen, heeft meestal voorrang. Dit geldt bijvoorbeeld voor voertuigen die op een voorrangsweg rijden of die hun richting behouden. Voorbeeld: twee voertuigen die elkaar tegemoetkomen en allebei rechtdoor rijden, mogen allebei doorrijden.</li>" +
          "<li><strong>Beide linksaf, tegenover elkaar:</strong> twee bestuurders die allebei linksaf slaan en tegenover elkaar staan, mogen tegelijkertijd afslaan.</li>" +
          "<li><strong>Kruisend verkeer:</strong> als een bestuurder het verkeer dat rechtdoor gaat wil kruisen, moet hij voorrang verlenen aan voertuigen die op dezelfde weg rijden en hun richting behouden. Dit geldt ook bij kruispunten en wanneer wegen samenkomen.</li>" +
          "<li><strong>Auto + (brom)fiets, beide linksaf:</strong> rijdt de auto niet samen met de (brom)fiets als er geen rijwielpad is in de richting waarin wordt afgeslagen.</li>" +
          "<li><strong>Auto + (brom)fiets, beide rechtsaf:</strong> rijdt de (brom)fiets niet samen met de auto als er geen rijwielpad is in de richting waarin wordt afgeslagen.</li>" +
          "<li><strong>Voorrangsweg:</strong> als je rijdt op een weg die door de Minister is aangewezen als voorrangsweg, heb je voorrang op het verkeer dat vanaf een andere weg komt.</li>" +
          "<li><strong>T-kruising:</strong> bij een T-kruising, waarbij één weg ophoudt en de andere weg doorloopt, heeft het verkeer op de doorgaande weg voorrang, als er geen andere verkeersregels of borden zijn.</li>" +
          "<li><strong>Verharde vs. onverharde weg:</strong> bij een kruising tussen een verharde weg en een onverharde weg heeft het verkeer op de verharde weg voorrang. Bij een T-kruising geldt echter dat het verkeer op de doorgaande weg voorrang heeft, als er geen andere aanwijzingen zijn.</li>" +
          "<li><strong>Verkeer van links:</strong> als geen van de bovenstaande regels van toepassing is, heeft het verkeer dat van links komt voorrang.</li>" +
          "<li><strong>Bijzondere voertuigen en colonnes:</strong> politie- en brandweervoertuigen en voertuigen van een ziekeninrichting hebben voorrang wanneer zij bij het naderen van een kruising of splitsing een sirene, bel, meertonige hoorn of een rood, oranjerood of blauw zwaailicht gebruiken. Ook begrafenisstoeten, militaire colonnes en politiecolonnes hebben voorrang op ander verkeer. Volgorde: politie-/brandweervoertuigen en voertuigen van een ziekeninrichting met de genoemde signalen gaan eerst.</li>" +
          "</ol>" +
          "<div class=\"callout\"><strong>Goudenregel:</strong> een rechtsaffer moet altijd voorrang verlenen aan een linksaffer en aan rechtdoorgaand verkeer dat tegenover hem staat.</div>",
      },
    },
    {
      title: "Legenda & Symbolen",
      type: "TEXT" as const,
      content: {
        type: "TEXT",
        body:
          "<p>Gebruik deze afkortingen en symbolen bij het lezen van een maquette-situatieschets:</p>" +
          "<table class=\"legend-table\">" +
          "<tr><td>Z.R.P.</td><td>zonder rijwielpad</td></tr>" +
          "<tr><td>M.R.P.</td><td>met rijwielpad</td></tr>" +
          "<tr><td>f</td><td>fiets</td></tr>" +
          "<tr><td>bf</td><td>bromfiets</td></tr>" +
          "<tr><td>mf</td><td>motorfiets</td></tr>" +
          "<tr><td>PS</td><td>politie met sirene</td></tr>" +
          "<tr><td>BS</td><td>brandweer met sirene</td></tr>" +
          "<tr><td>AS</td><td>ambulance met sirene</td></tr>" +
          "<tr><td>S</td><td>smalle weg</td></tr>" +
          "<tr><td>B</td><td>brede weg</td></tr>" +
          "<tr><td><span class=\"legend-dot\"></span></td><td>zandweg</td></tr>" +
          "<tr><td>1+2</td><td>1 en 2 rijden samen (1+2 is hetzelfde als 2+1)</td></tr>" +
          "<tr><td>1-2</td><td>1 rijdt eerst, daarna 2 (1-2 is niet hetzelfde als 2-1)</td></tr>" +
          "<tr><td>Linksaffer</td><td>bestuurder die links afslaat</td></tr>" +
          "<tr><td>Rechtsaffer</td><td>bestuurder die rechts afslaat</td></tr>" +
          "</table>" +
          "<p>Een <strong>zwarte cirkel</strong> in een situatietekening betekent altijd: <strong>zandweg</strong>.</p>",
      },
    },
  ];

  const moduleSeeds = [
    {
      titleEn: "Maquette — Right of Way (Lesson 1)",
      titleNl: "Maquette — Voorrangsregels (Les 1)",
      orderIndex: 0,
      lessons: maquetteLes1Lessons,
    },
    {
      titleEn: "Road Rules & Signs",
      titleNl: "Verkeersregels & Borden",
      orderIndex: 1,
      lessons: [
        { title: "Introduction to Suriname Road Signs", type: "TEXT" as const, content: { type: "TEXT", body: "Suriname uses road signs based on international conventions: warning signs (triangular, red border), regulatory signs (circular), and information signs (rectangular, blue). Learning to recognize these at a glance is the foundation of safe driving." } },
        { title: "Right of Way Basics", type: "TEXT" as const, content: { type: "TEXT", body: "Right of way determines who goes first when two vehicles' paths cross. At uncontrolled intersections, traffic from the right generally has priority. Roundabouts give priority to traffic already circulating." } },
        { title: "Pedestrian Crossings & Priority", type: "TEXT" as const, content: { type: "TEXT", body: "Pedestrians have the right of way at marked crossings once they have stepped onto the crossing. Always slow down when approaching a crossing, even if it looks empty." } },
      ],
    },
    {
      titleEn: "Traffic Regulations",
      titleNl: "Verkeersreglementen",
      orderIndex: 2,
      lessons: [
        { title: "Introduction to Traffic Laws", type: "TEXT" as const, content: { type: "TEXT", body: "Traffic laws exist to keep everyone safe and traffic flowing predictably. As a driver, you're responsible for knowing and following these rules at all times, not just when a police officer is watching." } },
        { title: "Speed Limits & Zones", type: "TEXT" as const, content: { type: "TEXT", body: "Speed limits vary by zone: residential (30 km/h), urban roads (50 km/h unless posted otherwise), and open highways (the national default unless signed). Always adjust for road and weather conditions." } },
        { title: "Right of Way Rules", type: "VIDEO" as const, content: { type: "VIDEO", description: "A short video walkthrough of right-of-way scenarios at intersections and roundabouts. (Video content placeholder — to be produced.)" } },
        { title: "Intersection Rules", type: "TEXT" as const, content: { type: "TEXT", body: "At intersections without signals, yield to traffic on your right. At four-way stops, the first vehicle to arrive goes first; if two arrive together, the vehicle on the right goes first." } },
        { title: "Quiz: Speed & Zones", type: "QUIZ" as const, content: speedZonesQuiz },
        { title: "Roundabout Rules", type: "TEXT" as const, content: { type: "TEXT", body: "When entering a roundabout, yield to traffic already circulating. Signal left when exiting. Stay in your lane throughout unless changing lanes is clearly safe and signaled." } },
        { title: "Quiz — Traffic Regulations Pt. 1", type: "QUIZ" as const, content: trafficRegQuiz },
        { title: "Advanced Road Rules", type: "TEXT" as const, content: { type: "TEXT", body: "Advanced topics: overtaking rules, use of hazard lights, driving in adverse weather, and rules specific to motorways. These build on everything covered earlier in this module." } },
      ],
    },
    {
      titleEn: "Practical Driving Skills",
      titleNl: "Praktische Rijvaardigheden",
      orderIndex: 3,
      lessons: [
        { title: "Vehicle Controls Overview", type: "TEXT" as const, content: { type: "TEXT", body: "Before your first practical lesson, familiarize yourself with the controls: steering, pedals, gear selector, mirrors, and indicators. Your instructor will walk through these in person, but knowing the names in advance speeds things up." } },
        { title: "Parking & Maneuvering Basics", type: "TEXT" as const, content: { type: "TEXT", body: "Parallel parking, reverse parking, and three-point turns are core maneuvering skills assessed in the practical exam. Practice the theory here, then apply it with your instructor." } },
      ],
    },
    {
      titleEn: "Highway & Motorway Driving",
      titleNl: "Snelweg Rijden",
      orderIndex: 4,
      lessons: [
        { title: "Merging & Lane Discipline", type: "TEXT" as const, content: { type: "TEXT", body: "When merging onto a highway, match your speed to traffic flow before merging. Stay in the appropriate lane for your speed and intentions — slower traffic keeps right." } },
        { title: "Overtaking Safely", type: "TEXT" as const, content: { type: "TEXT", body: "Only overtake when you can see the road ahead is clear, you have enough space to complete the maneuver, and it's legal to do so at that point in the road." } },
      ],
    },
    {
      titleEn: "Exam Preparation",
      titleNl: "Examenvoorbereiding",
      orderIndex: 5,
      lessons: [
        { title: "What to Expect on Exam Day", type: "TEXT" as const, content: { type: "TEXT", body: "Arrive 15 minutes early, bring valid ID and your learner documentation, and get a good night's sleep beforehand. The exam covers both a vehicle check and a supervised drive." } },
        { title: "Final Mock Exam", type: "QUIZ" as const, content: examPrepQuiz },
      ],
    },
  ];

  for (const mod of moduleSeeds) {
    const module = await prisma.module.upsert({
      where: { id: `seed-module-${mod.orderIndex}` },
      update: {},
      create: {
        id: `seed-module-${mod.orderIndex}`,
        titleEn: mod.titleEn,
        titleNl: mod.titleNl,
        orderIndex: mod.orderIndex,
        isPublished: true,
      },
    });

    for (let i = 0; i < mod.lessons.length; i++) {
      const lesson = mod.lessons[i];
      await prisma.lesson.upsert({
        where: { id: `${module.id}-lesson-${i + 1}` },
        update: {},
        create: {
          id: `${module.id}-lesson-${i + 1}`,
          moduleId: module.id,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          orderIndex: i + 1,
        },
      });
    }
  }

  console.log({
    admin: admin.email,
    instructors: instructors.length,
    packages: packageSeeds.length,
    faqs: faqSeeds.length,
    modules: moduleSeeds.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
