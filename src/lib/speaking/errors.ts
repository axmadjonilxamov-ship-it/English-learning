/**
 * Baholash jarayonidagi xatoliklar.
 *
 * `message` — foydalanuvchiga ko'rsatiladigan o'zbekcha matn. Xizmatlardan
 * kelgan asl xato matni hech qachon brauzerga uzatilmaydi: unda kalit yoki
 * ichki manzillar bo'lishi mumkin. Asl matn faqat server jurnaliga tushadi.
 */
export class SpeakingError extends Error {
  readonly status: number;

  constructor(message: string, status = 500, cause?: unknown) {
    super(message);
    this.name = "SpeakingError";
    this.status = status;
    if (cause !== undefined) this.cause = cause;
  }
}
