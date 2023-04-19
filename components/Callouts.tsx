import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";

export function InfoCallout({
  text,
  details,
  href,
}: {
  text: string;
  details?: string;
  href?: string;
}) {
  return (
    <div className="bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            className="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">{text}</p>
          {details && (
            <p className="mt-3 text-sm md:ml-6 md:mt-0">
              <a
                href="#"
                className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
              >
                Details
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorCallout({
  text,
  details,
  href,
}: {
  text: string;
  details?: string;
  href?: string;
}) {
  return (
    <div className=" bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{text}</h3>
        </div>
      </div>
    </div>
  );
}

export function WarningCallout({
  text,
  details,
  href,
}: {
  text: string;
  details?: string;
  href?: string;
}) {
  return (
    <div className="bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{text}</h3>
          {details && (
            <div className="mt-2 text-sm text-yellow-700">
              <p>{details}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
