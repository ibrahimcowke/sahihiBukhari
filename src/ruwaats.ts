export interface Narrator {
  id: number;
  name: string;
  arabicName: string;
  totalNarrations: number;
  title: string;
  bio: string;
}

export const ruwaatsData: Narrator[] = [
  {
    id: 1,
    name: "Abu Hurayrah",
    arabicName: "أبو هريرة الدوسي",
    totalNarrations: 5374,
    title: "The Companion of Outstanding Memory",
    bio: "He spent only three years in the company of the Prophet Muhammad (ﷺ), but possessed an extraordinary memory. He dedicated his entire life to transmitting hadiths, serving as a preservation library for the early Muslim community."
  },
  {
    id: 2,
    name: "Aisha bint Abi Bakr",
    arabicName: "عائشة بنت أبي بكر",
    totalNarrations: 2210,
    title: "Mother of the Believers",
    bio: "The beloved wife of the Prophet (ﷺ), renowned for her sharp intellect, legal scholarship, and eloquence. She taught hundreds of companions and is the source of many personal, familial, and ritual directives of Islam."
  },
  {
    id: 3,
    name: "Anas ibn Malik",
    arabicName: "أنس بن مالك",
    totalNarrations: 2286,
    title: "The Servant of the Messenger",
    bio: "He served the Prophet Muhammad (ﷺ) personally for ten years in Madinah. This close access allowed him to narrate detailed accounts of the Prophet's character, daily conduct, and home environment."
  },
  {
    id: 4,
    name: "Abdullah ibn Umar",
    arabicName: "عبد الله بن عمر",
    totalNarrations: 2630,
    title: "The Scholar of Absolute Emulation",
    bio: "Son of the second Caliph, Umar ibn al-Khattab. He was famous for his strict adherence to the exact practices of the Prophet (ﷺ), recording actions with meticulous details and teaching the early generation of Madinan scholars."
  },
  {
    id: 5,
    name: "Jabir ibn Abdillah",
    arabicName: "جابر بن عبد الله",
    totalNarrations: 1540,
    title: "The Martyr's Son & Madinan Teacher",
    bio: "Participated in many campaigns and was present at the Pledge of Ridwan. He traveled extensively in search of single hadiths to verify them, eventually setting up a famous educational circle in the Prophet's Mosque."
  }
];
