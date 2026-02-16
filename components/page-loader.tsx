import { Spinner } from "./ui/spinner"

const PageLoader = () => {
  return (
    <div className="flex flex-col rounded-md bg-white p-2">
      <div className="flex min-h-[calc(100svh-100px)] items-center justify-center">
        <Spinner className="text-muted-foreground size-8" />
      </div>
    </div>
  )
}

export default PageLoader
