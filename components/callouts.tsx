import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX, Info, TriangleAlert } from "lucide-react";

export function InfoCallout({
  text,
  details,
}: {
  text: string | React.ReactNode;
  details?: string;
}) {
  return (
    <Alert className="bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <AlertTitle className="text-sm text-blue-700">{text}</AlertTitle>
          {details && (
            <AlertDescription className="mt-3 text-sm md:ml-6 md:mt-0">
              <div className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                Details
                <span aria-hidden="true"> &rarr;</span>
              </div>
            </AlertDescription>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function ErrorCallout({
  text,
  details,
}: {
  text: string;
  details?: string;
}) {
  return (
    <Alert className="bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CircleX className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <AlertTitle className="text-sm text-red-700">{text}</AlertTitle>
          {details && (
            <AlertDescription className="mt-3 text-sm md:ml-6 md:mt-0">
              <div className="whitespace-nowrap font-medium text-red-700 hover:text-red-600">
                Details
                <span aria-hidden="true"> &rarr;</span>
              </div>
            </AlertDescription>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function WarningCallout({
  text,
  details,
}: {
  text: string;
  details?: string;
}) {
  return (
    <Alert className="bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <TriangleAlert
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <AlertTitle className="text-sm text-yellow-700">{text}</AlertTitle>
          {details && (
            <AlertDescription className="mt-3 text-sm md:ml-6 md:mt-0">
              <div className="whitespace-nowrap font-medium text-yellow-700 hover:text-blue-600">
                Details
                <span aria-hidden="true"> &rarr;</span>
              </div>
            </AlertDescription>
          )}
        </div>
      </div>
    </Alert>
  );
}
