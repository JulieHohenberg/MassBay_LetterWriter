import {
  openingHooks,
  communityThemeSentences,
  transitions,
  askSentences,
  gratitudeClosings,
  signoffs,
  toneAdjusters,
  pointIntroVariants,
  pointParaphraseFrames,
  alternativesSentences
} from './phraseBank';
import { TalkingPoint } from './talkingPoints';
import { Recipient } from './highPriorityRecipients';

export function createPRNG(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateHeuristicLetter(params: {
  recipient: Recipient | null;
  sender: { name: string; town: string; state: string };
  tone: 'Respectful' | 'Urgent' | 'Firm';
  selectedPoints: TalkingPoint[];
  seed: number;
  includeAlternatives?: boolean;
}) {
  const rng = createPRNG(params.seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  
  const { recipient, sender, tone, selectedPoints, includeAlternatives = true } = params;

  // Date
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Salutation
  const isGovHealey = recipient?.name?.includes("Maura Healey");
  const isSelectBoard = recipient?.name?.includes("Wellesley Select Board");
  const salutation = isSelectBoard ? "Dear Wellesley Select Board," : `Dear ${recipient?.name || 'Recipient'},`;

  // Healey rule
  const healeySentence = "Maura Healey’s goal of 30% State Designated Conservation Land by 2030 is sorely needed in Wellesley’s Tree City.";

  // Point selection (weighted)
  // Always include at least 3 points. Randomly choose 3-5 points weighted by ranking.
  let numPointsToUse = Math.min(selectedPoints.length, Math.floor(rng() * 3) + 3); // 3, 4, or 5
  if (numPointsToUse < 3) numPointsToUse = selectedPoints.length;
  
  const pointsToUse: TalkingPoint[] = [];
  const availablePoints = [...selectedPoints];
  
  for (let i = 0; i < numPointsToUse; i++) {
    if (availablePoints.length === 0) break;
    // Bias towards earlier elements: Math.pow(rng(), 1.5) skews towards 0
    const index = Math.floor(Math.pow(rng(), 1.5) * availablePoints.length);
    pointsToUse.push(availablePoints[index]);
    availablePoints.splice(index, 1);
  }

  // Format points
  const formattedPoints = pointsToUse.map(p => {
    // Randomly decide if full sentence or compressed clause
    const useFrame = rng() > 0.5;
    let text = p.text;
    if (useFrame) {
      const firstChar = text.charAt(0);
      if (firstChar === firstChar.toUpperCase() && !text.startsWith("MassBay") && !text.startsWith("Centennial")) {
        text = text.charAt(0).toLowerCase() + text.slice(1);
      }
      return pick(pointParaphraseFrames).replace('{pointMeaning}', text.replace(/\.$/, ''));
    } else {
      return `${pick(pointIntroVariants)} ${text.charAt(0).toLowerCase() + text.slice(1)}`;
    }
  });

  // Outlines
  type Outline = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  const outlines: Outline[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const chosenOutline = pick(outlines);

  let paragraphs: string[] = [];

  const hook = pick(openingHooks);
  const comm = pick(communityThemeSentences);
  const ask = pick(askSentences);
  const thanks = pick(gratitudeClosings);
  const toneAdj = pick(toneAdjusters[tone]);
  const altSentence = pick(alternativesSentences);

  const buildPoints = (pts: string[]) => {
    if (pts.length === 0) return "";
    let res = pts[0];
    for (let i = 1; i < pts.length; i++) {
      res += ` ${pick(transitions)} ${pts[i].charAt(0).toLowerCase() + pts[i].slice(1)}`;
    }
    return res;
  };

  switch (chosenOutline) {
    case 'A':
      paragraphs.push(hook);
      paragraphs.push(buildPoints(formattedPoints));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(`${toneAdj} ${ask.charAt(0).toLowerCase() + ask.slice(1)}`);
      paragraphs.push(thanks);
      break;
    case 'B':
      paragraphs.push(hook);
      paragraphs.push(buildPoints(formattedPoints.slice(0, 2)));
      paragraphs.push(comm);
      paragraphs.push(buildPoints(formattedPoints.slice(2)));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(ask);
      break;
    case 'C':
      paragraphs.push(comm);
      paragraphs.push(hook);
      paragraphs.push(buildPoints(formattedPoints));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(ask);
      paragraphs.push(thanks);
      break;
    case 'D':
      paragraphs.push(hook);
      paragraphs.push(formattedPoints.join(" "));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(ask);
      break;
    case 'E':
      paragraphs.push(hook);
      paragraphs.push(buildPoints(formattedPoints.slice(0, 2)));
      if (includeAlternatives) {
        paragraphs.push(altSentence);
      } else {
        paragraphs.push("While there are alternatives for development, this forest is irreplaceable.");
      }
      paragraphs.push(buildPoints(formattedPoints.slice(2)));
      paragraphs.push(ask);
      break;
    case 'F':
      paragraphs.push(comm);
      paragraphs.push(hook);
      paragraphs.push(buildPoints(formattedPoints));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(ask);
      break;
    case 'G':
      paragraphs.push(`${pick(toneAdjusters['Firm'])} you protect this land.`);
      paragraphs.push(buildPoints(formattedPoints));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push(ask);
      break;
    case 'H':
      paragraphs.push(`${pick(toneAdjusters['Urgent'])} save this parcel.`);
      paragraphs.push(buildPoints(formattedPoints));
      if (includeAlternatives) paragraphs.push(altSentence);
      paragraphs.push("We are running out of time to secure this vital green space.");
      paragraphs.push(ask);
      break;
  }

  if (isGovHealey) {
    const insertIdx = Math.max(0, Math.floor(rng() * paragraphs.length));
    paragraphs[insertIdx] += ` ${healeySentence}`;
  }

  let bodyText = paragraphs.filter(p => p.trim().length > 0).join("\n\n");
  
  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const baseLetter = `${dateStr}\n\n${salutation}\n\n[BODY]\n\nSincerely,\n${sender.name}\n${sender.town}, ${sender.state}`;
  
  let currentWords = getWordCount(baseLetter.replace('[BODY]', bodyText));

  if (currentWords > 200) {
    if (formattedPoints.length > 3) {
      const lastPoint = formattedPoints[formattedPoints.length - 1];
      bodyText = bodyText.replace(lastPoint, "");
      currentWords = getWordCount(baseLetter.replace('[BODY]', bodyText));
    }
  }

  if (currentWords > 200) {
    transitions.forEach(t => {
      bodyText = bodyText.split(t).join("");
    });
    currentWords = getWordCount(baseLetter.replace('[BODY]', bodyText));
  }

  if (currentWords < 150) {
    bodyText += `\n\n${pick(communityThemeSentences)}`;
    currentWords = getWordCount(baseLetter.replace('[BODY]', bodyText));
  }
  if (currentWords < 150) {
    bodyText += ` ${pick(askSentences)}`;
  }

  bodyText = bodyText.replace(/\s{2,}/g, ' ').trim();

  let finalLetter = baseLetter.replace('[BODY]', bodyText);
  finalLetter = finalLetter.replace(/Title 97/g, "Article 97");

  return finalLetter;
}
