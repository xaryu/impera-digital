import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import i18n from "@/i18n";
import Footer from "./Footer";
import Services from "@/pages/Services";
import { ScrollOnNavigate } from "@/hooks/use-scroll-on-navigate";
import { services } from "@/config/services";
import { companyAddressLine } from "@/config/company";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const servicesHeading = (lang: string) =>
  ({ en: "Services", fr: "Services", nl: "Diensten" })[lang as "en" | "fr" | "nl"];

let navigate: NavigateFunction;
const Probe = () => {
  navigate = useNavigate();
  const { pathname, hash } = useLocation();
  return <output data-testid="location">{pathname + hash}</output>;
};

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={[path]}>
          <ScrollOnNavigate />
          <Probe />
          <Routes>
            <Route path="/" element={<Footer />} />
            <Route path="/contact" element={<Footer />} />
            <Route path="/services" element={<Services />} />
            <Route path="/:lang" element={<Footer />} />
            <Route path="/:lang/services" element={<Services />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

const footerServiceLinks = (lang: string) => {
  const heading = within(screen.getByRole("contentinfo")).getByRole("heading", { name: servicesHeading(lang) });
  return within(heading.parentElement as HTMLElement).getAllByRole("link");
};

const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalScrollTo = window.scrollTo;
let scrollIntoView: ReturnType<typeof vi.fn<(arg?: boolean | ScrollIntoViewOptions) => void>>;
let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  await i18n.changeLanguage("en");
  scrollIntoView = vi.fn<(arg?: boolean | ScrollIntoViewOptions) => void>();
  scrollTo = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
});

afterEach(async () => {
  cleanup();
  Element.prototype.scrollIntoView = originalScrollIntoView;
  window.scrollTo = originalScrollTo;
  await i18n.changeLanguage("en");
});

describe("Footer", () => {
  it.each(["en", "fr", "nl"])("lists the Services page's services with their anchors (%s)", async (lang) => {
    await i18n.changeLanguage(lang);
    renderAt(lang === "en" ? "/" : `/${lang}`);
    const links = footerServiceLinks(lang);
    const prefix = lang === "en" ? "" : `/${lang}`;

    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      services.map((s) => `${prefix}/services#${s.id}`),
    );
    expect(links.map((a) => a.textContent)).toEqual(
      services.map((s) => i18n.t(`servicesPage.${s.titleKey}`)),
    );
  });

  it("shows the office address and the Get in Touch button", () => {
    renderAt("/");
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText(companyAddressLine)).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Get in Touch" })).toHaveAttribute("href", "/contact");
  });
});

describe("scrolling on navigation", () => {
  it("opens the Services page at the clicked service and focuses that section", async () => {
    renderAt("/");
    const link = footerServiceLinks("en").find((a) => a.getAttribute("href") === "/services#digital-marketing")!;
    await act(async () => {
      fireEvent.click(link);
    });

    const section = document.getElementById("digital-marketing")!;
    expect(section).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(section);
    // Arriving from another page jumps straight there instead of animating through the page.
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(section).toHaveFocus();
    // An anchor link must not first throw the visitor back to the top of the page.
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("scrolls to the anchor on a direct visit to /services#id", () => {
    renderAt("/services#growth-strategy");
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById("growth-strategy"));
  });

  it("scrolls smoothly when the anchor is on the current page", async () => {
    renderAt("/services");
    expect(scrollIntoView).not.toHaveBeenCalled();
    const link = footerServiceLinks("en").find((a) => a.getAttribute("href") === "/services#web-development")!;
    await act(async () => {
      fireEvent.click(link);
    });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById("web-development"));
  });

  it("starts a new page at the top", async () => {
    renderAt("/");
    expect(scrollTo).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Get in Touch" }));
    });
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
  });

  it.each(["/services#does-not-exist", "/services#"])("falls back to the top when %s has no target", async (to) => {
    renderAt("/");
    await act(async () => {
      navigate(to);
    });
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 }));
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("leaves back/forward to the browser's own scroll restoration", async () => {
    renderAt("/services#growth-strategy");
    await act(async () => {
      navigate("/contact");
    });
    scrollIntoView.mockClear();
    scrollTo.mockClear();

    await act(async () => {
      navigate(-1);
    });
    expect(screen.getByTestId("location")).toHaveTextContent("/services#growth-strategy");
    await act(async () => {
      navigate(1);
    });
    expect(screen.getByTestId("location")).toHaveTextContent("/contact");
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("keeps the anchor and the reading position when switching language", async () => {
    renderAt("/services#digital-marketing");
    scrollIntoView.mockClear();

    // The Services page's navbar renders the switcher (desktop and mobile); use the first one.
    fireEvent.click(screen.getAllByRole("button", { name: "Switch language" })[0]);
    const dutch = screen.getAllByRole("menuitem").find((el) => el.textContent?.includes(i18n.t("languageSwitcher.nl")))!;
    await act(async () => {
      fireEvent.click(dutch);
    });

    expect(screen.getByTestId("location")).toHaveTextContent("/nl/services#digital-marketing");
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
