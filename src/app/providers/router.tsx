import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
      path: "/",
      lazy: async () => {
        const GalleryPage = await import("@/features/gallery/pages/GalleryPage.tsx");
        return { Component: GalleryPage.default };
      },
    },
    {
      path: "/artifact/:id",
      lazy: async () => {
        const ArtifactPage = await import("@/features/artifact/pages/ArtifactPage.tsx");
        return { Component: ArtifactPage.default };
      },
    },
  ]);