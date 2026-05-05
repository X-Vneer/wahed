import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

export type EmailLocale = "ar" | "en"

export type NotificationEmailProps = {
  locale: EmailLocale
  preheader: string
  eyebrow?: string
  title: string
  greeting?: string
  body: string
  highlightLabel?: string
  highlightValue?: string
  ctaLabel?: string
  ctaUrl?: string
  branding: {
    systemName: string
    logoUrl: string | null
    primaryColor: string
    accentColor: string
  }
  prefsUrl: string
  prefsHint: string
  prefsLink: string
}

const FONT_AR =
  "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
const FONT_EN =
  "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_SERIF_EN =
  "'Iowan Old Style', 'Apple Garamond', 'Baskerville', 'Times New Roman', serif"

const BG = "#f6f5f0"
const CARD_BG = "#ffffff"
const BORDER = "#e8e6df"
const TEXT_PRIMARY = "#0b1220"
const TEXT_BODY = "#3f4856"
const TEXT_MUTED = "#94a3b8"
const TEXT_FAINT = "#cbd5e1"

export function NotificationEmail(props: NotificationEmailProps) {
  const {
    locale,
    preheader,
    eyebrow,
    title,
    greeting,
    body,
    highlightLabel,
    highlightValue,
    ctaLabel,
    ctaUrl,
    branding,
    prefsUrl,
    prefsHint,
    prefsLink,
  } = props

  const dir = locale === "ar" ? "rtl" : "ltr"
  const font = locale === "ar" ? FONT_AR : FONT_EN
  const titleFont = locale === "ar" ? FONT_AR : FONT_SERIF_EN
  const arrow = locale === "ar" ? "←" : "→"

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preheader}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: BG,
          fontFamily: font,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: 580,
            width: "100%",
            margin: "0 auto",
            padding: "40px 16px",
          }}
        >
          {/* External wordmark */}
          <Section style={{ paddingBottom: 22 }} dir={dir}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
            >
              <tr>
                <td
                  style={{
                    verticalAlign: "middle",
                    paddingRight: locale === "ar" ? 0 : 12,
                    paddingLeft: locale === "ar" ? 12 : 0,
                  }}
                >
                  {branding.logoUrl ? (
                    <Img
                      src={branding.logoUrl}
                      alt={branding.systemName}
                      width="40"
                      height="40"
                      style={{
                        display: "block",
                        borderRadius: 10,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: branding.primaryColor,
                        color: "#ffffff",
                        textAlign: "center",
                        lineHeight: "40px",
                        fontWeight: 700,
                        fontSize: 16,
                        fontFamily: font,
                      }}
                    >
                      {initials(branding.systemName)}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    verticalAlign: "middle",
                    color: TEXT_PRIMARY,
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "0.005em",
                    fontFamily: font,
                  }}
                >
                  {branding.systemName}
                </td>
              </tr>
            </table>
          </Section>

          {/* Email card */}
          <Section
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(11, 18, 32, 0.04)",
            }}
          >
            <div
              style={{
                height: 4,
                background: `linear-gradient(90deg, ${branding.accentColor} 0%, ${branding.primaryColor} 100%)`,
              }}
            />
            <div
              style={{
                padding: "40px 40px 32px 40px",
                textAlign: locale === "ar" ? "right" : "left",
              }}
            >
              {eyebrow && (
                <Text
                  style={{
                    margin: "0 0 18px 0",
                    color: branding.accentColor,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontFamily: font,
                  }}
                >
                  {eyebrow}
                </Text>
              )}

              <Text
                style={{
                  margin: "0 0 18px 0",
                  color: TEXT_PRIMARY,
                  fontSize: 26,
                  lineHeight: 1.25,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  fontFamily: titleFont,
                }}
              >
                {title}
              </Text>

              {greeting && (
                <Text
                  style={{
                    margin: "0 0 14px 0",
                    color: TEXT_PRIMARY,
                    fontSize: 15,
                    fontWeight: 500,
                    fontFamily: font,
                  }}
                >
                  {greeting}
                </Text>
              )}

              <Text
                style={{
                  margin: "0 0 24px 0",
                  color: TEXT_BODY,
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontFamily: font,
                }}
              >
                {body}
              </Text>

              {highlightValue && (
                <div
                  style={{
                    backgroundColor: "#fafaf7",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    margin: "0 0 24px 0",
                    borderLeft:
                      locale === "ar"
                        ? `1px solid ${BORDER}`
                        : `3px solid ${branding.accentColor}`,
                    borderRight:
                      locale === "ar"
                        ? `3px solid ${branding.accentColor}`
                        : `1px solid ${BORDER}`,
                  }}
                >
                  {highlightLabel && (
                    <Text
                      style={{
                        margin: "0 0 4px 0",
                        color: TEXT_MUTED,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontFamily: font,
                      }}
                    >
                      {highlightLabel}
                    </Text>
                  )}
                  <Text
                    style={{
                      margin: 0,
                      color: TEXT_PRIMARY,
                      fontSize: 17,
                      fontWeight: 600,
                      lineHeight: 1.45,
                      fontFamily: font,
                    }}
                  >
                    {highlightValue}
                  </Text>
                </div>
              )}

              {ctaLabel && ctaUrl && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ marginTop: 8 }}
                >
                  <tr>
                    <td>
                      <Link
                        href={ctaUrl}
                        style={{
                          display: "inline-block",
                          backgroundColor: branding.primaryColor,
                          color: "#ffffff",
                          textDecoration: "none",
                          fontWeight: 600,
                          padding: "14px 30px",
                          borderRadius: 999,
                          fontFamily: font,
                          fontSize: 14,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {ctaLabel}{" "}
                        <span style={{ fontSize: 16 }}>{arrow}</span>
                      </Link>
                    </td>
                  </tr>
                </table>
              )}
            </div>
          </Section>

          {/* Footer */}
          <Section
            style={{
              paddingTop: 24,
              paddingLeft: 8,
              paddingRight: 8,
              textAlign: locale === "ar" ? "right" : "left",
            }}
          >
            <Hr
              style={{
                margin: "0 0 18px 0",
                border: 0,
                borderTop: `1px solid ${BORDER}`,
              }}
            />
            <Text
              style={{
                margin: "0 0 6px 0",
                color: TEXT_MUTED,
                fontSize: 12,
                lineHeight: 1.6,
                fontFamily: font,
              }}
            >
              {prefsHint}{" "}
              <Link
                href={prefsUrl}
                style={{
                  color: TEXT_PRIMARY,
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                {prefsLink}
              </Link>
            </Text>
            <Text
              style={{
                margin: 0,
                color: TEXT_FAINT,
                fontSize: 11,
                lineHeight: 1.6,
                fontFamily: font,
              }}
            >
              © {new Date().getFullYear()} {branding.systemName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "•"
  const first = Array.from(parts[0])[0] ?? ""
  const second = parts[1] ? Array.from(parts[1])[0] ?? "" : ""
  return (first + second).toUpperCase()
}
