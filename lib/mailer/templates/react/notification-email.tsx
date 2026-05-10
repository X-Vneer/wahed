import {
  Body,
  Container,
  Head,
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
  "'IBM Plex Sans Arabic', 'Helvetica Neue', Arial, sans-serif"
const FONT_EN =
  "'Inter', 'Helvetica Neue', Arial, sans-serif"

const PAPER = "#F4F4F5"
const CARD = "#FFFFFF"
const INK = "#0B0B0F"
const BODY_INK = "#52525B"
const MUTED = "#A1A1AA"
const SUBTLE = "#71717A"
const BORDER = "#E4E4E7"
const INSET = "#FAFAF9"
const INSET_BORDER = "#EFEFF1"

function formatDate(locale: EmailLocale): string {
  try {
    const fmt = new Intl.DateTimeFormat(
      locale === "ar" ? "ar" : "en-GB",
      { day: "2-digit", month: "short", year: "numeric" }
    )
    return fmt.format(new Date()).toUpperCase()
  } catch {
    return ""
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "•"
  const first = Array.from(parts[0])[0] ?? ""
  const second = parts[1] ? Array.from(parts[1])[0] ?? "" : ""
  return (first + second).toUpperCase()
}

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

  const isAr = locale === "ar"
  const dir = isAr ? "rtl" : "ltr"
  const font = isAr ? FONT_AR : FONT_EN
  const arrow = isAr ? "←" : "→"
  const date = formatDate(locale)

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
          backgroundColor: PAPER,
          fontFamily: font,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            width: "100%",
            margin: "0 auto",
            padding: "32px 16px 40px 16px",
          }}
        >
          {/* Card */}
          <Section
            dir={dir}
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Hero band */}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              width="100%"
              style={{
                width: "100%",
                backgroundColor: branding.primaryColor,
              }}
            >
              <tr>
                <td
                  align="center"
                  style={{
                    padding: "36px 24px 32px 24px",
                    textAlign: "center",
                  }}
                >
                  {/* Logo / initials in white circle */}
                  <table
                    role="presentation"
                    cellPadding={0}
                    cellSpacing={0}
                    border={0}
                    align="center"
                    style={{ margin: "0 auto" }}
                  >
                    <tr>
                      <td
                        align="center"
                        style={{
                          width: 60,
                          height: 60,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 30,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {branding.logoUrl ? (
                          <Img
                            src={branding.logoUrl}
                            alt={branding.systemName}
                            width="36"
                            height="36"
                            style={{
                              display: "inline-block",
                              border: 0,
                              outline: "none",
                              textDecoration: "none",
                              objectFit: "contain",
                              verticalAlign: "middle",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              color: branding.primaryColor,
                              fontWeight: 700,
                              fontSize: 18,
                              fontFamily: font,
                              letterSpacing: "0.04em",
                              lineHeight: "60px",
                            }}
                          >
                            {initials(branding.systemName)}
                          </span>
                        )}
                      </td>
                    </tr>
                  </table>

                  <Text
                    style={{
                      margin: "16px 0 0 0",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      fontFamily: font,
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    {branding.systemName}
                  </Text>
                </td>
              </tr>
            </table>

            {/* Content */}
            <div
              style={{
                padding: "40px 40px 44px 40px",
                textAlign: "center",
              }}
            >
              {/* Date */}
              <Text
                style={{
                  margin: 0,
                  color: MUTED,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontFamily: font,
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                {date}
              </Text>

              {/* Eyebrow pill */}
              {eyebrow && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  align="center"
                  style={{ margin: "20px auto 0 auto" }}
                >
                  <tr>
                    <td
                      style={{
                        backgroundColor: INSET,
                        border: `1px solid ${INSET_BORDER}`,
                        borderRadius: 999,
                        padding: "7px 14px",
                      }}
                    >
                      <Text
                        style={{
                          margin: 0,
                          color: branding.primaryColor,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontFamily: font,
                          lineHeight: 1,
                        }}
                      >
                        {eyebrow}
                      </Text>
                    </td>
                  </tr>
                </table>
              )}

              {/* Title */}
              <Text
                style={{
                  margin: "20px 0 0 0",
                  color: INK,
                  fontSize: 28,
                  lineHeight: 1.22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  fontFamily: font,
                  wordBreak: "break-word",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>

              {/* Title-to-body separator */}
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                align="center"
                style={{ margin: "24px auto 0 auto" }}
              >
                <tr>
                  <td
                    style={{
                      width: 36,
                      height: 3,
                      backgroundColor: branding.primaryColor,
                      borderRadius: 2,
                      lineHeight: "3px",
                      fontSize: 0,
                    }}
                  >
                    {" "}
                  </td>
                </tr>
              </table>

              {/* Greeting */}
              {greeting && (
                <Text
                  style={{
                    margin: "28px 0 0 0",
                    color: INK,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: font,
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  {greeting}
                </Text>
              )}

              {/* Body */}
              <Text
                style={{
                  margin: greeting ? "8px 0 0 0" : "28px 0 0 0",
                  color: BODY_INK,
                  fontSize: 15,
                  lineHeight: 1.7,
                  fontFamily: font,
                  textAlign: "center",
                }}
              >
                {body}
              </Text>

              {/* Highlight stack */}
              {highlightValue && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  width="100%"
                  style={{
                    width: "100%",
                    margin: "28px 0 0 0",
                    backgroundColor: INSET,
                    border: `1px solid ${INSET_BORDER}`,
                    borderRadius: 12,
                  }}
                >
                  <tr>
                    <td
                      align="center"
                      style={{
                        padding: "20px 24px",
                        textAlign: "center",
                      }}
                    >
                      {highlightLabel && (
                        <Text
                          style={{
                            margin: 0,
                            color: SUBTLE,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            fontFamily: font,
                            lineHeight: 1,
                            textAlign: "center",
                          }}
                        >
                          {highlightLabel}
                        </Text>
                      )}
                      <Text
                        style={{
                          margin: highlightLabel ? "10px 0 0 0" : 0,
                          color: INK,
                          fontSize: 17,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          fontFamily: font,
                          letterSpacing: "-0.005em",
                          textAlign: "center",
                          wordBreak: "break-word",
                        }}
                      >
                        {highlightValue}
                      </Text>
                    </td>
                  </tr>
                </table>
              )}

              {/* CTA */}
              {ctaLabel && ctaUrl && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  align="center"
                  style={{ margin: "32px auto 0 auto" }}
                >
                  <tr>
                    <td
                      style={{
                        backgroundColor: branding.primaryColor,
                        borderRadius: 999,
                      }}
                    >
                      <Link
                        href={ctaUrl}
                        style={{
                          display: "inline-block",
                          color: "#FFFFFF",
                          textDecoration: "none",
                          fontWeight: 600,
                          padding: "14px 32px",
                          fontFamily: font,
                          fontSize: 14,
                          letterSpacing: "0.06em",
                          lineHeight: 1.1,
                          borderRadius: 999,
                        }}
                      >
                        {ctaLabel}
                        <span
                          style={{
                            display: "inline-block",
                            paddingLeft: isAr ? 0 : 10,
                            paddingRight: isAr ? 10 : 0,
                            fontSize: 15,
                            color: "#FFFFFF",
                          }}
                        >
                          {arrow}
                        </span>
                      </Link>
                    </td>
                  </tr>
                </table>
              )}
            </div>
          </Section>

          {/* Footer */}
          <Section
            dir={dir}
            style={{
              paddingTop: 28,
              paddingLeft: 4,
              paddingRight: 4,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: 0,
                color: SUBTLE,
                fontSize: 12,
                lineHeight: 1.7,
                fontFamily: font,
                textAlign: "center",
              }}
            >
              {prefsHint}{" "}
              <Link
                href={prefsUrl}
                style={{
                  color: INK,
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                {prefsLink}
              </Link>
            </Text>
            <Text
              style={{
                margin: "6px 0 0 0",
                color: MUTED,
                fontSize: 11,
                fontFamily: font,
                textAlign: "center",
              }}
            >
              {`© ${new Date().getFullYear()} ${branding.systemName}`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
