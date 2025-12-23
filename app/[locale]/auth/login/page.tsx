"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { gridBg, loginBg, logo, noise } from "@/assets"

export default function LoginPage() {
  const t = useTranslations("auth.login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center  ">
      <Image
        src={loginBg}
        className="absolute w-full h-full object-cover "
        alt="bg"
      />
      <Image
        src={noise}
        className="absolute w-full h-full object-cover  opacity-15 "
        alt="Noise"
      />
      <Image
        src={gridBg}
        className="absolute w-full h-full object-cover   "
        alt="grid"
      />

      <div
        style={{
          background:
            "radial-gradient(40.38% 50% at 50% 50%, #18181B 0%, rgba(24, 24, 27, 0.2) 100%);",
        }}
        className="absolute inset-0 opacity-35"
      ></div>
      <div
        style={{
          background:
            "linear-gradient(116.56deg, rgba(255, 255, 255, 0) 24.66%, rgba(255, 94, 39, 0.2) 138.88%);",
        }}
        className="absolute inset-0 opacity-30"
      ></div>
      {/* Login Card */}
      <Card className="relative  w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-col items-center gap-6 ">
          {/* Logo */}
          <Image src={logo} className="w-32 mx-auto" alt="Wahd Logo" />

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold ">{t("title")}</h1>

            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Field>
              <FieldLabel>{t("email")}</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </FieldContent>
            </Field>

            {/* Password Field */}
            <Field>
              <FieldLabel>{t("password")}</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white"
                />
              </FieldContent>
            </Field>

            {/* Login Button */}
            <Button type="submit" className="w-full font-medium py-6 text-base">
              {t("button")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
