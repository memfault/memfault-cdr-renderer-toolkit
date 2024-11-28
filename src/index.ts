import { useEffect, useState } from "react";
import { z } from "zod";

export const FragmentPayloadSchema = z.object({
  deviceSerial: z.string().optional(),
  deviceTimelineUrl: z.string().optional(),
  download: z.object({
    url: z.string(),
    expiresAt: z.string().optional(),
  }),
  mimetypes: z.array(z.string()).optional(),
  organizationSlug: z.string().optional(),
  projectSlug: z.string().optional(),
  softwareVersion: z.string().optional(),
  reason: z.string().optional(),
  timeRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});

export function decodeFragment() {
  return decodeURIComponent(window.location.hash).slice(1);
}

export type FragmentPayload = z.infer<typeof FragmentPayloadSchema>;

export type UseFragmentDataState = {
  data: ArrayBuffer | null;
  error: string | null;
  isLoading: boolean;
  isExampleData: boolean;
  isExpired: boolean;
};

export type UseFragmentDataArgs = {
  /** Fall back to this download if there is no data in the fragment. */
  exampleDownloadUrl?: string;
};

export function useFragmentData({ exampleDownloadUrl }: UseFragmentDataArgs): UseFragmentDataState {
  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExampleData, setIsExampleData] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const fragment = decodeFragment();
        let fileUrl: string;

        if (fragment) {
          const payload: FragmentPayload = FragmentPayloadSchema.parse(JSON.parse(fragment));
          fileUrl = payload.download.url;

          if (payload.download.expiresAt) {
            try {
              setIsExpired(new Date().getTime() > new Date(payload.download.expiresAt).getTime());
            } catch (err: unknown) {
              throw new Error(
                `Failed to fetch expiry date of download URL from '${payload.download.expiresAt}': ${String(err)}`,
              );
            }
          }
        } else if (exampleDownloadUrl) {
          fileUrl = exampleDownloadUrl;
          setIsExampleData(true);
        } else {
          return;
        }

        const response = await fetch(fileUrl);
        if (!response.ok) {
          const json = (await response.json()) as unknown;
          throw new Error(`Failed to fetch file: ${JSON.stringify(json)}`);
        }

        setData(await response.arrayBuffer());
        setError(null);
      } catch (err: unknown) {
        if (err instanceof z.ZodError) {
          setError(`Invalid payload: ${err.message}`);
        } else {
          setError(String(err) || "An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void fetchData();
  }, [exampleDownloadUrl]);

  return { data, error, isLoading, isExampleData, isExpired };
}
