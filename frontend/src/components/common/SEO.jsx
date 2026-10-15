import { useEffect } from 'react';

const PRODUCTION_DOMAIN = 'https://princedigitals.vercel.app';
const DEFAULT_IMAGE = `${PRODUCTION_DOMAIN}/PD_logo.png`;
const DEFAULT_TITLE = 'Prince Digital | Curated Fashion & Product Collections';
const DEFAULT_DESCRIPTION =
  "Discover curated fashion, men's formal wear, streetwear, gym essentials, and handpicked product collections at Prince Digital.";

/**
 * Universal SEO component for managing page titles, canonical URLs,
 * meta tags (robots, description, Open Graph, Twitter cards), and JSON-LD structured data.
 */
export const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = 'Prince Digital',
  noindex = false,
  structuredData = null,
}) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Helper to set or update meta tag by name or property
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (!content && content !== '') return;
      let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Meta Description
    setMetaTag('name', 'description', description);

    // 4. Meta Robots
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 5. Canonical Link (ensures production domain and clean normalization)
    let normalizedCanonical = canonicalUrl;
    if (!normalizedCanonical) {
      normalizedCanonical = PRODUCTION_DOMAIN;
    } else if (!normalizedCanonical.startsWith('http://') && !normalizedCanonical.startsWith('https://')) {
      const cleanPath = normalizedCanonical.startsWith('/') ? normalizedCanonical : `/${normalizedCanonical}`;
      normalizedCanonical = `${PRODUCTION_DOMAIN}${cleanPath}`;
    }
    // Remove trailing slash unless it's root
    if (normalizedCanonical.length > PRODUCTION_DOMAIN.length && normalizedCanonical.endsWith('/')) {
      normalizedCanonical = normalizedCanonical.slice(0, -1);
    }

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', normalizedCanonical);

    // 6. Ensure absolute image URL for social preview crawlers
    let absoluteOgImage = ogImage;
    if (absoluteOgImage && !absoluteOgImage.startsWith('http://') && !absoluteOgImage.startsWith('https://')) {
      const cleanImgPath = absoluteOgImage.startsWith('/') ? absoluteOgImage : `/${absoluteOgImage}`;
      absoluteOgImage = `${PRODUCTION_DOMAIN}${cleanImgPath}`;
    }

    // 7. Open Graph Tags
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Prince Digital');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', normalizedCanonical);
    setMetaTag('property', 'og:image', absoluteOgImage);
    setMetaTag('property', 'og:image:alt', ogImageAlt);
    setMetaTag('property', 'og:locale', 'en_US');

    // 8. Twitter / X Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', absoluteOgImage);
    setMetaTag('name', 'twitter:image:alt', ogImageAlt);

    // 9. JSON-LD Structured Data
    const SCRIPT_ID = 'seo-dynamic-structured-data';
    let scriptTag = document.getElementById(SCRIPT_ID);

    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup: If this page set noindex, restore to 'index, follow' on unmount
    return () => {
      if (noindex) {
        setMetaTag('name', 'robots', 'index, follow');
      }
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogType,
    ogImage,
    ogImageAlt,
    noindex,
    structuredData,
  ]);

  return null;
};
