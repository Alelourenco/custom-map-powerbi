"use strict";

/**
 * Dynamic GeoJSON loader for the Americas.
 * Supports: continent views (South, Central, North America, All)
 * and individual country subdivision views.
 */

// Country subdivision GeoJSON imports (Americas)
import brGeo from "@highcharts/map-collection/countries/br/br-all.geo.json";
import arGeo from "@highcharts/map-collection/countries/ar/ar-all.geo.json";
import coGeo from "@highcharts/map-collection/countries/co/co-all.geo.json";
import clGeo from "@highcharts/map-collection/countries/cl/cl-all.geo.json";
import peGeo from "@highcharts/map-collection/countries/pe/pe-all.geo.json";
import mxGeo from "@highcharts/map-collection/countries/mx/mx-all.geo.json";
import usGeo from "@highcharts/map-collection/countries/us/us-all.geo.json";
import caGeo from "@highcharts/map-collection/countries/ca/ca-all.geo.json";
import veGeo from "@highcharts/map-collection/countries/ve/ve-all.geo.json";
import ecGeo from "@highcharts/map-collection/countries/ec/ec-all.geo.json";
import boGeo from "@highcharts/map-collection/countries/bo/bo-all.geo.json";
import pyGeo from "@highcharts/map-collection/countries/py/py-all.geo.json";
import uyGeo from "@highcharts/map-collection/countries/uy/uy-all.geo.json";
import gtGeo from "@highcharts/map-collection/countries/gt/gt-all.geo.json";
import hnGeo from "@highcharts/map-collection/countries/hn/hn-all.geo.json";
import svGeo from "@highcharts/map-collection/countries/sv/sv-all.geo.json";
import niGeo from "@highcharts/map-collection/countries/ni/ni-all.geo.json";
import crGeo from "@highcharts/map-collection/countries/cr/cr-all.geo.json";
import paGeo from "@highcharts/map-collection/countries/pa/pa-all.geo.json";
import cuGeo from "@highcharts/map-collection/countries/cu/cu-all.geo.json";
import doGeo from "@highcharts/map-collection/countries/do/do-all.geo.json";
import jmGeo from "@highcharts/map-collection/countries/jm/jm-all.geo.json";
import bsGeo from "@highcharts/map-collection/countries/bs/bs-all.geo.json";
import htGeo from "@highcharts/map-collection/countries/ht/ht-all.geo.json";
import ttGeo from "@highcharts/map-collection/countries/tt/tt-all.geo.json";
import prGeo from "@highcharts/map-collection/countries/pr/pr-all.geo.json";
import srGeo from "@highcharts/map-collection/countries/sr/sr-all.geo.json";
import gyGeo from "@highcharts/map-collection/countries/gy/gy-all.geo.json";
import bzGeo from "@highcharts/map-collection/countries/bz/bz-all.geo.json";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface GeoFeature {
    properties: Record<string, string | number | null>;
    geometry: unknown;
    type?: string;
}

export interface GeoCollection {
    type: string;
    features: GeoFeature[];
}

export type MapScope = "all_americas" | "south_america" | "central_america" | "north_america" | string; // string for country codes

// ────────────────────────────────────────────────────────────────
// Country registry
// ────────────────────────────────────────────────────────────────

export interface CountryInfo {
    code: string;
    region: "south_america" | "central_america" | "north_america";
    names: { pt: string; en: string; es: string };
    geoData: GeoCollection;
}

const COUNTRY_REGISTRY: CountryInfo[] = [
    // South America
    { code: "br", region: "south_america", names: { pt: "Brasil", en: "Brazil", es: "Brasil" }, geoData: brGeo as unknown as GeoCollection },
    { code: "ar", region: "south_america", names: { pt: "Argentina", en: "Argentina", es: "Argentina" }, geoData: arGeo as unknown as GeoCollection },
    { code: "co", region: "south_america", names: { pt: "Colômbia", en: "Colombia", es: "Colombia" }, geoData: coGeo as unknown as GeoCollection },
    { code: "cl", region: "south_america", names: { pt: "Chile", en: "Chile", es: "Chile" }, geoData: clGeo as unknown as GeoCollection },
    { code: "pe", region: "south_america", names: { pt: "Peru", en: "Peru", es: "Perú" }, geoData: peGeo as unknown as GeoCollection },
    { code: "ve", region: "south_america", names: { pt: "Venezuela", en: "Venezuela", es: "Venezuela" }, geoData: veGeo as unknown as GeoCollection },
    { code: "ec", region: "south_america", names: { pt: "Equador", en: "Ecuador", es: "Ecuador" }, geoData: ecGeo as unknown as GeoCollection },
    { code: "bo", region: "south_america", names: { pt: "Bolívia", en: "Bolivia", es: "Bolivia" }, geoData: boGeo as unknown as GeoCollection },
    { code: "py", region: "south_america", names: { pt: "Paraguai", en: "Paraguay", es: "Paraguay" }, geoData: pyGeo as unknown as GeoCollection },
    { code: "uy", region: "south_america", names: { pt: "Uruguai", en: "Uruguay", es: "Uruguay" }, geoData: uyGeo as unknown as GeoCollection },
    { code: "sr", region: "south_america", names: { pt: "Suriname", en: "Suriname", es: "Surinam" }, geoData: srGeo as unknown as GeoCollection },
    { code: "gy", region: "south_america", names: { pt: "Guiana", en: "Guyana", es: "Guyana" }, geoData: gyGeo as unknown as GeoCollection },
    // Central America
    { code: "gt", region: "central_america", names: { pt: "Guatemala", en: "Guatemala", es: "Guatemala" }, geoData: gtGeo as unknown as GeoCollection },
    { code: "hn", region: "central_america", names: { pt: "Honduras", en: "Honduras", es: "Honduras" }, geoData: hnGeo as unknown as GeoCollection },
    { code: "sv", region: "central_america", names: { pt: "El Salvador", en: "El Salvador", es: "El Salvador" }, geoData: svGeo as unknown as GeoCollection },
    { code: "ni", region: "central_america", names: { pt: "Nicarágua", en: "Nicaragua", es: "Nicaragua" }, geoData: niGeo as unknown as GeoCollection },
    { code: "cr", region: "central_america", names: { pt: "Costa Rica", en: "Costa Rica", es: "Costa Rica" }, geoData: crGeo as unknown as GeoCollection },
    { code: "pa", region: "central_america", names: { pt: "Panamá", en: "Panama", es: "Panamá" }, geoData: paGeo as unknown as GeoCollection },
    { code: "bz", region: "central_america", names: { pt: "Belize", en: "Belize", es: "Belice" }, geoData: bzGeo as unknown as GeoCollection },
    // North America
    { code: "us", region: "north_america", names: { pt: "Estados Unidos", en: "United States", es: "Estados Unidos" }, geoData: usGeo as unknown as GeoCollection },
    { code: "ca", region: "north_america", names: { pt: "Canadá", en: "Canada", es: "Canadá" }, geoData: caGeo as unknown as GeoCollection },
    { code: "mx", region: "north_america", names: { pt: "México", en: "Mexico", es: "México" }, geoData: mxGeo as unknown as GeoCollection },
    { code: "cu", region: "north_america", names: { pt: "Cuba", en: "Cuba", es: "Cuba" }, geoData: cuGeo as unknown as GeoCollection },
    { code: "do", region: "north_america", names: { pt: "República Dominicana", en: "Dominican Republic", es: "República Dominicana" }, geoData: doGeo as unknown as GeoCollection },
    { code: "jm", region: "north_america", names: { pt: "Jamaica", en: "Jamaica", es: "Jamaica" }, geoData: jmGeo as unknown as GeoCollection },
    { code: "ht", region: "north_america", names: { pt: "Haiti", en: "Haiti", es: "Haití" }, geoData: htGeo as unknown as GeoCollection },
    { code: "bs", region: "north_america", names: { pt: "Bahamas", en: "The Bahamas", es: "Bahamas" }, geoData: bsGeo as unknown as GeoCollection },
    { code: "tt", region: "north_america", names: { pt: "Trinidad e Tobago", en: "Trinidad and Tobago", es: "Trinidad y Tobago" }, geoData: ttGeo as unknown as GeoCollection },
    { code: "pr", region: "north_america", names: { pt: "Porto Rico", en: "Puerto Rico", es: "Puerto Rico" }, geoData: prGeo as unknown as GeoCollection },
];

// ────────────────────────────────────────────────────────────────
// Localized subdivision names (alt-name field often contains translations)
// ────────────────────────────────────────────────────────────────

export type Locale = "pt" | "en" | "es";

/**
 * Resolves PBI locale string to our supported locale.
 */
export function resolveLocale(pbiLocale: string): Locale {
    const lang = (pbiLocale || "en").toLowerCase().slice(0, 2);
    if (lang === "pt") return "pt";
    if (lang === "es") return "es";
    return "en";
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

/**
 * Get list of countries available for selection, localized.
 */
export function getCountryList(locale: Locale): { code: string; name: string; region: string }[] {
    return COUNTRY_REGISTRY.map(c => ({
        code: c.code,
        name: c.names[locale] || c.names.en,
        region: c.region,
    }));
}

/**
 * Get the GeoJSON FeatureCollection and features for a given country code.
 * Returns subdivision-level (states/provinces as features).
 */
export function getGeoForScope(scope: MapScope): { geoJson: GeoCollection; features: GeoFeature[]; isCountryLevel: boolean } {
    const country = COUNTRY_REGISTRY.find(c => c.code === scope);
    if (country) {
        return { geoJson: country.geoData, features: country.geoData.features, isCountryLevel: false };
    }
    // Fallback to Brazil
    return { geoJson: brGeo as unknown as GeoCollection, features: (brGeo as unknown as GeoCollection).features, isCountryLevel: false };
}

/**
 * Get the unique code for a feature (used for data matching).
 * Returns postal-code or hc-a2 (e.g. "SP", "BA", "CA").
 */
export function getFeatureCode(feature: GeoFeature, _isCountryLevel?: boolean): string {
    const props = feature.properties;
    return String(props["postal-code"] ?? props["hc-a2"] ?? props["hc-key"] ?? "").toUpperCase();
}

/**
 * Get the display name for a feature (state/province).
 */
export function getFeatureName(feature: GeoFeature, _isCountryLevel?: boolean, _locale?: Locale): string {
    const props = feature.properties;
    return String(props["name"] ?? "");
}

/**
 * Build alias map for flexible data matching.
 * Maps various input forms (code, name, alt-name) → canonical code.
 */
export function buildAliasMap(features: GeoFeature[], isCountryLevel: boolean, locale: Locale): Map<string, string> {
    const aliases = new Map<string, string>();

    for (const feature of features) {
        const code = getFeatureCode(feature, isCountryLevel);
        if (!code) continue;

        const props = feature.properties;

        // Register the code itself
        aliases.set(code.toUpperCase(), code);
        aliases.set(code.toLowerCase(), code);

        // Register name
        const name = String(props["name"] ?? "");
        if (name) {
            aliases.set(name.toUpperCase(), code);
            aliases.set(name.toLowerCase(), code);
            aliases.set(name, code);
        }

        // Register hc-key
        const hcKey = String(props["hc-key"] ?? "");
        if (hcKey) {
            aliases.set(hcKey.toUpperCase(), code);
            aliases.set(hcKey.toLowerCase(), code);
        }

        // Register postal-code / hc-a2
        const postal = String(props["postal-code"] ?? "");
        if (postal && postal !== code) {
            aliases.set(postal.toUpperCase(), code);
            aliases.set(postal.toLowerCase(), code);
        }

        const hcA2 = String(props["hc-a2"] ?? "");
        if (hcA2 && hcA2 !== code) {
            aliases.set(hcA2.toUpperCase(), code);
            aliases.set(hcA2.toLowerCase(), code);
        }

        // Register alt-name variations
        const altName = String(props["alt-name"] ?? "");
        if (altName) {
            altName.split("|").forEach(alt => {
                const trimmed = alt.trim();
                if (trimmed) {
                    aliases.set(trimmed.toUpperCase(), code);
                    aliases.set(trimmed.toLowerCase(), code);
                    aliases.set(trimmed, code);
                }
            });
        }

        // Register woe-name
        const woeName = String(props["woe-name"] ?? "");
        if (woeName && woeName !== name) {
            aliases.set(woeName.toUpperCase(), code);
            aliases.set(woeName.toLowerCase(), code);
            aliases.set(woeName, code);
        }
    }

    return aliases;
}
