import { act, renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { useFragmentData } from ".";

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const validUrl = "https://example.com/valid.bin";
const exampleUrl = "https://example.com/example.bin";

const server = setupServer(
  http.get(validUrl, () =>
    HttpResponse.arrayBuffer(
      new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0xff, 0xff, 0xff, 0xff]),
    ),
  ),
  http.get(exampleUrl, () =>
    HttpResponse.arrayBuffer(
      new Uint8Array([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa]),
    ),
  ),
  http.get("*", () => HttpResponse.error()),
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  window.location.hash = "";
});

afterAll(() => {
  server.close();
});

describe("useFragmentData Hook", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  test("fetches and sets valid data from the fragment payload", async () => {
    const fragmentPayload = {
      download: {
        url: validUrl,
      },
    };
    window.location.hash = encodeURIComponent(JSON.stringify(fragmentPayload));

    const { result } = renderHook(() => useFragmentData({}));

    await act(async () => {
      expect(result.current.isLoading).toBe(true);
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeInstanceOf(ArrayBuffer);
    expect(result.current.isExampleData).toBe(false);
    expect(result.current.isExpired).toBe(false);
  });

  test("shows an error for invalid fragment payload", async () => {
    window.location.hash = encodeURIComponent(JSON.stringify(42));

    const { result } = renderHook(() => useFragmentData({}));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/Invalid payload/i);
    expect(result.current.data).toBeNull();
  });

  test("uses example data when no fragment is provided", async () => {
    const { result } = renderHook(() => useFragmentData({ exampleDownloadUrl: exampleUrl }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeInstanceOf(ArrayBuffer);
    expect(result.current.isExampleData).toBe(true);
  });

  test("shows an error when fetch fails", async () => {
    window.location.hash = encodeURIComponent(
      JSON.stringify({ download: { url: "https://example.com/nonexistent.bin" } }),
    );

    const { result } = renderHook(() => useFragmentData({}));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/Failed to fetch/i);
    expect(result.current.data).toBeNull();
  });

  test("indicates when the download URL has expired", async () => {
    const expiredPayload = {
      download: {
        url: validUrl,
        expiresAt: "2022-01-01T00:00:00Z",
      },
    };
    window.location.hash = encodeURIComponent(JSON.stringify(expiredPayload));

    const { result } = renderHook(() => useFragmentData({}));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isExpired).toBe(true);
  });
});
