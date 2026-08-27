const sendMock = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe("notify (WhatsApp -> email fallback chain)", () => {
  const originalEnv = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    sendMock.mockReset();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses WhatsApp and never touches the email fallback when it succeeds", async () => {
    process.env.WHATSAPP_API_KEY = "test-key";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    fetchMock.mockResolvedValue({ ok: true });

    const { notify } = await import("@/lib/whatsapp");
    const result = await notify({ phone: "555-0100", email: "student@example.com", subject: "Hi", message: "Test" });

    expect(result).toEqual({ success: true, channel: "whatsapp" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("falls back to email when WhatsApp is not configured", async () => {
    delete process.env.WHATSAPP_API_KEY;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    process.env.RESEND_API_KEY = "test-resend-key";
    sendMock.mockResolvedValue({ data: { id: "1" }, error: null });

    const { notify } = await import("@/lib/whatsapp");
    const result = await notify({ phone: "555-0100", email: "student@example.com", subject: "Hi", message: "Test" });

    expect(result).toEqual({ success: true, channel: "email" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to email when the WhatsApp API call itself fails", async () => {
    process.env.WHATSAPP_API_KEY = "test-key";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    process.env.RESEND_API_KEY = "test-resend-key";
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => "invalid token" });
    sendMock.mockResolvedValue({ data: { id: "1" }, error: null });

    const { notify } = await import("@/lib/whatsapp");
    const result = await notify({ phone: "555-0100", email: "student@example.com", subject: "Hi", message: "Test" });

    expect(result).toEqual({ success: true, channel: "email" });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("skips WhatsApp entirely when no phone number is on file", async () => {
    process.env.WHATSAPP_API_KEY = "test-key";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    process.env.RESEND_API_KEY = "test-resend-key";
    sendMock.mockResolvedValue({ data: { id: "1" }, error: null });

    const { notify } = await import("@/lib/whatsapp");
    const result = await notify({ phone: null, email: "instructor@example.com", subject: "Hi", message: "Test" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.channel).toBe("email");
  });

  it("reports failure (but never throws) when both channels are unavailable", async () => {
    delete process.env.WHATSAPP_API_KEY;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.RESEND_API_KEY;

    const { notify } = await import("@/lib/whatsapp");
    const result = await notify({ phone: "555-0100", email: "student@example.com", subject: "Hi", message: "Test" });

    expect(result.success).toBe(false);
    expect(result.channel).toBe("none");
  });
});

describe("message templates", () => {
  it("interpolate all provided fields", async () => {
    const { templates } = await import("@/lib/whatsapp");

    expect(templates.bookingConfirmation({ name: "Ana", instructor: "Roy", date: "Monday", time: "9:00 AM", method: "Cash" })).toBe(
      "Hi Ana, your booking with Roy on Monday at 9:00 AM is confirmed. Payment: Cash."
    );
    expect(templates.bookingCancelled({ date: "Monday", time: "9:00 AM" })).toBe(
      "Your booking on Monday at 9:00 AM has been cancelled."
    );
  });
});
