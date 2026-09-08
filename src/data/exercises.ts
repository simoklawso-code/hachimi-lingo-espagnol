export type ComprehensionQuestion = {
  q: string;
  options: string[];
  correct: number;
};

export type StoryComprehension = {
  storyId: string;
  questions: ComprehensionQuestion[];
};

/** أسئلة فهم الاستماع لكل قصة — مرتبطة بـ id ديال stories فـ extra.ts */
export const comprehension: StoryComprehension[] = [
  {
    storyId: "cafe",
    questions: [
      {
        q: "أي يوم راح الراوي للمقهى؟",
        options: ["السبت", "الأحد", "الجمعة"],
        correct: 0,
      },
      {
        q: "شنو طلب الراوي؟",
        options: ["شاي وكعك", "قهوة بالحليب وخبز حلو", "عصير وسندويش"],
        correct: 1,
      },
      {
        q: "فين جلس الراوي؟",
        options: ["قرب الباب", "قرب النافذة", "قرب المطبخ"],
        correct: 1,
      },
    ],
  },
  {
    storyId: "mercado",
    questions: [
      {
        q: "مع من راح الراوي للسوق؟",
        options: ["مع أخوه", "مع أمه", "مع صديقه"],
        correct: 1,
      },
      {
        q: "شنو شراو من الفواكه؟",
        options: ["تفاح وموز وبرتقال", "عنب وبطيخ", "فراولة وليمون"],
        correct: 0,
      },
      {
        q: "شحال كان ثمن الكيلو؟",
        options: ["عشرة بيزو", "عشرون بيزو", "ثلاثون بيزو"],
        correct: 1,
      },
    ],
  },
  {
    storyId: "viaje",
    questions: [
      {
        q: "فوقاش سافر الراوي للمكسيك؟",
        options: ["السنة الماضية", "هاد الصيف", "منذ شهر"],
        correct: 0,
      },
      {
        q: "شنو أعجب الراوي فالمكسيك؟",
        options: ["الطقس", "الطعام الحار", "المواصلات"],
        correct: 1,
      },
      {
        q: "فوقاش بغى يرجع؟",
        options: ["الشتاء الجاي", "الصيف الجاي", "ما بغاش يرجع"],
        correct: 1,
      },
    ],
  },
];

export function comprehensionFor(storyId: string): ComprehensionQuestion[] {
  return comprehension.find((c) => c.storyId === storyId)?.questions ?? [];
}
