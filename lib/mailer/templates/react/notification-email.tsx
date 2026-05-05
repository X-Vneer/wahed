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
  "'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif"
const FONT_EN =
  "'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_SERIF_EN =
  "'Iowan Old Style', 'Apple Garamond', 'Baskerville', Garamond, 'Times New Roman', serif"
const FONT_MONO =
  "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"

const PAPER = "#F1EDE4"
const CARD = "#FFFFFF"
const HAIRLINE = "#E2DDD1"
const RULE_STRONG = "#1A1A1A"
const INK = "#111111"
const BODY_INK = "#3A3A3A"
const MUTED = "#8A847A"
const FAINT = "#BDB7AC"
const INSERT_BG = "#F8F5EE"

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
  const align: "left" | "right" = isAr ? "right" : "left"
  const opp: "left" | "right" = isAr ? "left" : "right"
  const font = isAr ? FONT_AR : FONT_EN
  const titleFont = isAr ? FONT_AR : FONT_SERIF_EN
  const arrow = isAr ? "←" : "→"
  const date = formatDate(locale)

  const tagline = isAr ? "العمرانية" : "Urban"

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
            padding: "48px 20px 56px 20px",
          }}
        >
          {/* Masthead */}
          <Section dir={dir} style={{ paddingBottom: 18 }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              width="100%"
              style={{ width: "100%" }}
            >
              <tr>
                <td
                  align={align}
                  style={{
                    verticalAlign: "middle",
                    width: "60%",
                  }}
                >
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
                          paddingRight: isAr ? 0 : 14,
                          paddingLeft: isAr ? 14 : 0,
                        }}
                      >
                        {branding.logoUrl ? (
                          <Img
                            src={branding.logoUrl}
                            alt={branding.systemName}
                            width="92"
                            height="52"
                            style={{
                              display: "block",
                              border: 0,
                              outline: "none",
                              textDecoration: "none",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              backgroundColor: branding.primaryColor,
                              color: "#FFFFFF",
                              textAlign: "center",
                              lineHeight: "44px",
                              fontWeight: 700,
                              fontSize: 16,
                              fontFamily: font,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {initials(branding.systemName)}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          verticalAlign: "middle",
                          borderLeft: isAr
                            ? "none"
                            : `1px solid ${HAIRLINE}`,
                          borderRight: isAr
                            ? `1px solid ${HAIRLINE}`
                            : "none",
                          paddingLeft: isAr ? 0 : 14,
                          paddingRight: isAr ? 14 : 0,
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            color: INK,
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            fontFamily: font,
                            lineHeight: 1.1,
                          }}
                        >
                          {branding.systemName}
                        </Text>
                        <Text
                          style={{
                            margin: "3px 0 0 0",
                            color: MUTED,
                            fontSize: 10,
                            fontWeight: 500,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            fontFamily: FONT_MONO,
                            lineHeight: 1.1,
                          }}
                        >
                          {tagline}
                        </Text>
                      </td>
                    </tr>
                  </table>
                </td>
                <td
                  align={opp}
                  style={{
                    verticalAlign: "middle",
                    color: MUTED,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    fontFamily: FONT_MONO,
                    textTransform: "uppercase",
                  }}
                >
                  {date}
                </td>
              </tr>
            </table>
          </Section>

          {/* Heavy rule */}
          <div
            style={{
              height: 2,
              backgroundColor: RULE_STRONG,
              lineHeight: "2px",
              fontSize: 0,
            }}
          />
          {/* Hairline gap */}
          <div
            style={{
              height: 4,
              fontSize: 0,
              lineHeight: "4px",
            }}
          />
          <div
            style={{
              height: 1,
              backgroundColor: RULE_STRONG,
              lineHeight: "1px",
              fontSize: 0,
            }}
          />

          {/* Card */}
          <Section
            style={{
              backgroundColor: CARD,
              border: `1px solid ${HAIRLINE}`,
              borderTop: "none",
              marginTop: 0,
            }}
          >
            {/* Brand accent bar */}
            <div
              style={{
                height: 6,
                backgroundColor: branding.primaryColor,
                lineHeight: "6px",
                fontSize: 0,
              }}
            />

            <div
              style={{
                padding: "44px 44px 40px 44px",
                textAlign: align,
              }}
            >
              {/* Eyebrow */}
              {eyebrow && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  style={{ marginBottom: 22 }}
                >
                  <tr>
                    <td
                      style={{
                        verticalAlign: "middle",
                        paddingRight: isAr ? 0 : 10,
                        paddingLeft: isAr ? 10 : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 1,
                          backgroundColor: branding.primaryColor,
                          lineHeight: "1px",
                          fontSize: 0,
                        }}
                      />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Text
                        style={{
                          margin: 0,
                          color: branding.primaryColor,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          fontFamily: FONT_MONO,
                          lineHeight: 1.1,
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
                  margin: "0 0 22px 0",
                  color: INK,
                  fontSize: 30,
                  lineHeight: 1.18,
                  fontWeight: isAr ? 700 : 500,
                  letterSpacing: isAr ? "-0.005em" : "-0.02em",
                  fontFamily: titleFont,
                }}
              >
                {title}
              </Text>

              {/* Greeting */}
              {greeting && (
                <Text
                  style={{
                    margin: "0 0 12px 0",
                    color: INK,
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "0.005em",
                    fontFamily: font,
                    lineHeight: 1.5,
                  }}
                >
                  {greeting}
                </Text>
              )}

              {/* Body */}
              <Text
                style={{
                  margin: "0 0 28px 0",
                  color: BODY_INK,
                  fontSize: 15,
                  lineHeight: 1.72,
                  fontFamily: font,
                }}
              >
                {body}
              </Text>

              {/* Highlight insert */}
              {highlightValue && (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  width="100%"
                  style={{
                    width: "100%",
                    marginBottom: ctaLabel ? 28 : 8,
                    backgroundColor: INSERT_BG,
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <tr>
                    <td
                      style={{
                        width: 6,
                        backgroundColor: branding.primaryColor,
                        lineHeight: "6px",
                        fontSize: 0,
                      }}
                    >
                      {" "}
                    </td>
                    <td style={{ padding: "18px 22px" }}>
                      {highlightLabel && (
                        <Text
                          style={{
                            margin: "0 0 6px 0",
                            color: MUTED,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.26em",
                            textTransform: "uppercase",
                            fontFamily: FONT_MONO,
                            lineHeight: 1.1,
                          }}
                        >
                          {`[ ${highlightLabel} ]`}
                        </Text>
                      )}
                      <Text
                        style={{
                          margin: 0,
                          color: INK,
                          fontSize: 17,
                          fontWeight: 600,
                          lineHeight: 1.5,
                          fontFamily: font,
                          letterSpacing: "-0.005em",
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
                >
                  <tr>
                    <td
                      style={{
                        backgroundColor: INK,
                      }}
                    >
                      <Link
                        href={ctaUrl}
                        style={{
                          display: "inline-block",
                          color: "#FFFFFF",
                          textDecoration: "none",
                          fontWeight: 600,
                          padding: "14px 26px",
                          fontFamily: font,
                          fontSize: 13,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          lineHeight: 1.1,
                        }}
                      >
                        {ctaLabel}
                        <span
                          style={{
                            display: "inline-block",
                            paddingLeft: isAr ? 0 : 12,
                            paddingRight: isAr ? 12 : 0,
                            fontSize: 14,
                            color: branding.primaryColor,
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
            style={{
              paddingTop: 28,
              paddingLeft: 4,
              paddingRight: 4,
            }}
            dir={dir}
          >
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              width="100%"
              style={{ width: "100%" }}
            >
              <tr>
                <td
                  align={align}
                  style={{
                    verticalAlign: "top",
                    width: "60%",
                    color: MUTED,
                    fontSize: 11,
                    lineHeight: 1.7,
                    fontFamily: font,
                  }}
                >
                  <Text
                    style={{
                      margin: 0,
                      color: MUTED,
                      fontSize: 11,
                      lineHeight: 1.7,
                      fontFamily: font,
                    }}
                  >
                    {prefsHint}{" "}
                    <Link
                      href={prefsUrl}
                      style={{
                        color: INK,
                        textDecoration: "none",
                        fontWeight: 600,
                        borderBottom: `1px solid ${INK}`,
                      }}
                    >
                      {prefsLink}
                    </Link>
                  </Text>
                </td>
                <td
                  align={opp}
                  style={{
                    verticalAlign: "top",
                    color: FAINT,
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    fontFamily: FONT_MONO,
                    textTransform: "uppercase",
                  }}
                >
                  {`Nº ${branding.systemName} · ${new Date().getFullYear()}`}
                </td>
              </tr>
            </table>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
