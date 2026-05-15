"""
Email utility for the medicine-chat-ai platform.

Sends transactional e-mails via SMTP. Configure through environment variables:
    EMAIL_HOST      — SMTP host (e.g. smtp.gmail.com or smtp.sendgrid.net)
    EMAIL_PORT      — SMTP port (default 587 for STARTTLS)
    EMAIL_USER      — SMTP username / sender address
    EMAIL_PASSWORD  — SMTP password or API key
    EMAIL_FROM      — Display name + address (e.g. "MediCare AI <no-reply@example.com>")
    FRONTEND_URL    — Base URL of the frontend (used in reset-password links)
"""
import asyncio
import logging
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import lru_cache

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_smtp_config() -> dict:
    return {
        "host": os.getenv("EMAIL_HOST", "smtp.gmail.com"),
        "port": int(os.getenv("EMAIL_PORT", "587")),
        "user": os.getenv("EMAIL_USER", ""),
        "password": os.getenv("EMAIL_PASSWORD", ""),
        "from_addr": os.getenv("EMAIL_FROM", os.getenv("EMAIL_USER", "no-reply@medicinechat.ai")),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:5173"),
    }


def _send_smtp(to: str, subject: str, html_body: str) -> None:
    """Blocking SMTP send — called from a thread executor."""
    cfg = _get_smtp_config()

    if not cfg["user"] or not cfg["password"]:
        # Dev/test fallback — just log the e-mail content
        logger.warning(
            "[EMAIL DEV MODE] To: %s | Subject: %s\n%s",
            to,
            subject,
            html_body,
        )
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = cfg["from_addr"]
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP(cfg["host"], cfg["port"]) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(cfg["user"], cfg["password"])
        server.sendmail(cfg["from_addr"], to, msg.as_string())

    logger.info("E-mail sent to %s (subject: %s)", to, subject)


async def send_email_async(to: str, subject: str, html_body: str) -> None:
    """Non-blocking wrapper — runs SMTP in a thread pool to avoid blocking the event loop."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_smtp, to, subject, html_body)


# ── Template builders ─────────────────────────────────────────────────────────

def build_password_reset_email(reset_token: str, user_name: str = "usuário") -> tuple[str, str]:
    """Return (subject, html_body) for a password reset e-mail."""
    cfg = _get_smtp_config()
    reset_url = f"{cfg['frontend_url']}/reset-password?token={reset_token}"

    subject = "Redefinição de senha — MediCare AI"
    html_body = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Inter, Arial, sans-serif; background:#F8FAFC; padding:40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table width="520" style="background:#ffffff; border-radius:16px;
                   box-shadow:0 2px 16px rgba(0,0,0,0.08); padding:40px 48px;">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <h1 style="margin:0; font-size:22px; color:#1E3A5F;">MediCare AI</h1>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="color:#0F172A; font-size:16px;">Olá, <strong>{user_name}</strong>!</p>
                  <p style="color:#475569; font-size:15px; line-height:1.6;">
                    Recebemos uma solicitação para redefinir a senha da sua conta.
                    Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.
                  </p>
                  <div style="text-align:center; margin:32px 0;">
                    <a href="{reset_url}"
                       style="background:linear-gradient(135deg,#14B8A6,#0D9488);
                              color:#ffffff; text-decoration:none; padding:14px 32px;
                              border-radius:12px; font-weight:700; font-size:15px;
                              display:inline-block;">
                      Redefinir minha senha
                    </a>
                  </div>
                  <p style="color:#94A3B8; font-size:13px; text-align:center;">
                    Se você não solicitou a redefinição de senha, ignore este e-mail.<br>
                    Sua senha permanecerá a mesma.
                  </p>
                  <hr style="border:none; border-top:1px solid #E2E8F0; margin:24px 0;">
                  <p style="color:#CBD5E1; font-size:11px; text-align:center;">
                    MediCare AI — Simplificando bulas e receitas médicas<br>
                    <a href="{cfg['frontend_url']}" style="color:#14B8A6;">Acessar plataforma</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    return subject, html_body


async def send_password_reset_email(to: str, reset_token: str, user_name: str = "usuário") -> None:
    """High-level helper: build and dispatch the password reset e-mail."""
    subject, html_body = build_password_reset_email(reset_token, user_name)
    await send_email_async(to, subject, html_body)
