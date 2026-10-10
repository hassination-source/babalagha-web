/** Arabic labels shared by admin server and client components. */
export const STATUS_LABEL = {
  NEW: "جديد",
  IN_PROGRESS: "قيد المتابعة",
  RESOLVED: "تمت المعالجة",
  ARCHIVED: "مؤرشف",
} as const;
export const STATUS_TONE = { NEW: "warn", IN_PROGRESS: "info", RESOLVED: "good", ARCHIVED: "neutral" } as const;

export const RETAILER_STATUS_LABEL = { PENDING: "بانتظار المراجعة", ACTIVE: "منشور", INACTIVE: "معطّل", REJECTED: "مرفوض" } as const;
export const RETAILER_STATUS_TONE = { PENDING: "warn", ACTIVE: "good", INACTIVE: "neutral", REJECTED: "bad" } as const;
export const RETAILER_TYPE_LABEL = {
  SUPERMARKET: "سوبرماركت",
  GROCERY: "محل مواد غذائية",
  DISTRIBUTOR: "موزّع",
  WHOLESALER: "بيع بالجملة",
  BAKERY_OUTLET: "منفذ باب الآغا",
  OTHER: "أخرى",
} as const;
export const KIND_LABEL = { GENERAL: "استفسار عام", PRODUCT: "سؤال عن منتج", RETAILER: "منافذ البيع والتوزيع", PARTNERSHIP: "شراكات", OTHER: "أخرى" } as const;

