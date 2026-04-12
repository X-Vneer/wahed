"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useTranslations } from "next-intl"

export default function ContactApiDocsPage() {
  const t = useTranslations()

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Contact Form API Documentation</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/contacts">
                {t("contacts.title")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>API Docs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-4xl" dir="ltr">
        <h2>Submit Contact Form</h2>
        <p>
          Use this endpoint to submit contact form messages from your website.
          This is a <strong>public endpoint</strong> and does not require
          authentication.
        </p>

        <h3>Endpoint</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>POST /api/public/website/contact</code>
        </pre>

        <h3>Headers</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>{`Content-Type: application/json`}</code>
        </pre>

        <h3>Request Body</h3>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>firstName</code>
              </td>
              <td>string</td>
              <td>Yes</td>
              <td>First name of the sender (الاسم الأول)</td>
            </tr>
            <tr>
              <td>
                <code>lastName</code>
              </td>
              <td>string</td>
              <td>Yes</td>
              <td>Last name of the sender (الاسم الثاني)</td>
            </tr>
            <tr>
              <td>
                <code>email</code>
              </td>
              <td>string</td>
              <td>Yes</td>
              <td>Email address (البريد الإلكتروني)</td>
            </tr>
            <tr>
              <td>
                <code>phone</code>
              </td>
              <td>string</td>
              <td>Yes</td>
              <td>Phone number (رقم الهاتف)</td>
            </tr>
            <tr>
              <td>
                <code>message</code>
              </td>
              <td>string</td>
              <td>Yes</td>
              <td>Message content (تفاصيل الرسالة)</td>
            </tr>
          </tbody>
        </table>

        <h3>Example Request</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {`fetch("https://your-domain.com/api/public/website/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    firstName: "محمد",
    lastName: "أحمد",
    email: "mohammed@example.com",
    phone: "+966500000000",
    message: "أرغب في الاستفسار عن مشاريعكم"
  }),
})`}
          </code>
        </pre>

        <h3>Success Response</h3>
        <p>
          <strong>Status:</strong> <code>201 Created</code>
        </p>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {`{
  "message": "Your message has been sent successfully"
}`}
          </code>
        </pre>

        <h3>Error Response - Validation Failed</h3>
        <p>
          <strong>Status:</strong> <code>400 Bad Request</code>
        </p>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {`{
  "error": "Validation failed",
  "details": {
    "firstName": "First name is required",
    "email": "Please enter a valid email address"
  }
}`}
          </code>
        </pre>

        <h3>TypeScript Type</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {`interface ContactFormData {
  firstName: string  // الاسم الأول
  lastName: string   // الاسم الثاني
  email: string      // البريد الإلكتروني
  phone: string      // رقم الهاتف
  message: string    // تفاصيل الرسالة
}

interface SuccessResponse {
  message: string
}

interface ErrorResponse {
  error: string
  details?: Record<string, string>
}`}
          </code>
        </pre>

        <h3>React Example</h3>
        <pre className="bg-muted rounded-lg p-4">
          <code>
            {`const handleSubmit = async (formData: ContactFormData) => {
  try {
    const response = await fetch(
      "https://your-domain.com/api/public/website/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      // Handle validation errors
      if (error.details) {
        // error.details contains field-level errors
        // e.g., { firstName: "First name is required" }
      }
      throw new Error(error.error)
    }

    const data = await response.json()
    // Success - show success message
    console.log(data.message)
  } catch (error) {
    // Handle error
    console.error(error)
  }
}`}
          </code>
        </pre>
      </div>
    </div>
  )
}
