import { Spinner } from "@/components/ui/spinner"

export default function pageLoading() {
  return (
    <div className="flex flex-col rounded-md bg-white p-2">
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="text-muted-foreground size-8" />
      </div>
    </div>
  )
}
