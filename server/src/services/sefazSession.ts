import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";

const FORM_URL = "https://sped.fazenda.pr.gov.br/NFCe/webservices/sped/nfce/completa";
const BASE_URL = "https://sped.fazenda.pr.gov.br";
const SESSION_TTL_MS = 10 * 60 * 1000;

interface SefazSession {
  client: ReturnType<typeof wrapper>;
  captchaSid: string;
  captchaToken: string;
  formBuildId: string;
  captchaImagePath: string;
  createdAt: number;
}

const sessions = new Map<string, SefazSession>();

function cleanupExpired() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

export async function createCaptchaSession(): Promise<{ sessionId: string; captchaImageUrl: string }> {
  cleanupExpired();

  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      headers: { "User-Agent": "Mozilla/5.0" },
    } as any)
  );

  const { data: html } = await client.get(FORM_URL);
  const $ = cheerio.load(html);

  const captchaSid = $('input[name="captcha_sid"]').attr("value");
  const captchaToken = $('input[name="captcha_token"]').attr("value");
  const formBuildId = $('input[name="form_build_id"]').attr("value");
  const captchaImagePath = $("img[data-drupal-selector='edit-captcha-image']").attr("src");

  if (!captchaSid || !captchaToken || !formBuildId || !captchaImagePath) {
    throw new Error("Could not parse CAPTCHA form fields from SEFAZ page");
  }

  const sessionId = randomUUID();
  sessions.set(sessionId, {
    client,
    captchaSid,
    captchaToken,
    formBuildId,
    captchaImagePath,
    createdAt: Date.now(),
  });

  return { sessionId, captchaImageUrl: `/api/captcha/image/${sessionId}` };
}

export function getSession(sessionId: string): SefazSession | undefined {
  return sessions.get(sessionId);
}

export async function fetchCaptchaImage(sessionId: string): Promise<{ contentType: string; data: Buffer }> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("Unknown or expired CAPTCHA session");

  const response = await session.client.get(BASE_URL + session.captchaImagePath, {
    responseType: "arraybuffer",
  });

  return {
    contentType: String(response.headers["content-type"] ?? "image/png"),
    data: Buffer.from(response.data),
  };
}

export async function submitNfceForm(
  sessionId: string,
  accessKey: string,
  captchaResponse: string
): Promise<string> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("Unknown or expired CAPTCHA session");

  const body = new URLSearchParams({
    txRota: "nfce",
    txTipo: "completa",
    txOrigem: "formulario",
    txChave: accessKey,
    captcha_sid: session.captchaSid,
    captcha_token: session.captchaToken,
    captcha_response: captchaResponse,
    txAmbiente: "1",
    form_build_id: session.formBuildId,
    form_id: "sefa_sped_form",
    op: "Consultar",
  });

  const { data: html } = await session.client.post(FORM_URL, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  sessions.delete(sessionId);
  return html;
}

export { FORM_URL };
