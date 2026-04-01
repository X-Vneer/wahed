"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWebsiteContent } from "@/app/[locale]/(system)/website/_components/use-website-content"
import { useTranslations } from "next-intl"

type ProjectCard = {
  title: string
  status: string
  description: string
}

type ProjectsContent = {
  cards: ProjectCard[]
}

export default function WebsiteProjectsPage() {
  const t = useTranslations("websiteCms.projects")
  const { content } = useWebsiteContent<ProjectsContent>("projects")
  const cards = content?.cards ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </header>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <Card key={`${card.title}-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{card.title}</span>
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {card.status}
                </Badge>
              </CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("actions.title")}</CardTitle>
          <CardDescription>{t("actions.description")}</CardDescription>
        </CardHeader>
        <div className="flex gap-2 px-6 pb-6">
          <Button>{t("actions.add")}</Button>
          <Button variant="outline">{t("actions.reorder")}</Button>
        </div>
      </Card>
    </div>
  )
}
