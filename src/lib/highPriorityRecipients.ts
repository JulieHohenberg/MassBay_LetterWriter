export interface Recipient {
  id: string;
  name: string;
  title?: string;
  email?: string;
  mailingAddress?: string;
  type: 'high-priority' | 'legislator';
  contactUrl?: string;
}

export const highPriorityRecipients: Recipient[] = [
  {
    id: "gov-healey",
    name: "Governor Maura Healey",
    title: "Governor of Massachusetts",
    mailingAddress: "Office of the Governor, Massachusetts State House, 24 Beacon St., Room 280, Boston, MA 02133",
    type: "high-priority",
    contactUrl: "https://www.mass.gov/info-details/email-the-governors-office"
  },
  {
    id: "wellesley-select",
    name: "Wellesley Select Board",
    email: "sel@wellesleyma.gov",
    type: "high-priority"
  },
  {
    id: "massbay-bot",
    name: "MassBay Community College, Attn: Board of Trustees",
    mailingAddress: "MassBay Community College\nAttn: Board of Trustees\n50 Oakland Street\nWellesley Hills, MA 02481",
    type: "high-priority"
  },
  {
    id: "massbay-kbritton",
    name: "Karen Britton",
    title: "MassBay Executive Director & Board Liaison",
    email: "kbritton@massbay.edu",
    type: "high-priority"
  },
  {
    id: "massbay-pres",
    name: "President David Podell",
    title: "President, MassBay Community College",
    mailingAddress: "President David Podell\nMassachusetts Bay Community College\n50 Oakland Street\nWellesley Hills, MA 02481",
    type: "high-priority"
  }
];
