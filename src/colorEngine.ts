"use strict";

/**
 * Conditional Formatting Engine
 * Resolves colors dynamically using gradient interpolation based on data values.
 * Used in conjunction with Power BI's formatting model.
 */

export interface GradientConfig {
    style: "sequential" | "diverging";
    minColor: string;
    midColor: string;
    maxColor: string;
    nullColor: string;
    reverseScale: boolean;
}

export interface StateDataPoint {
    stateCode: string;
    stateName: string;
    category?: string;
    value: number;
    highlightValue?: number; // value after cross-filter highlight (undefined = no highlights active)
    secondaryValue?: number;
    tooltipValue?: number;
    percentage?: number;
    color?: string;
    selectionId?: unknown;
    highlightRatio?: number; // 0..1 — portion highlighted by cross-filter
}

/**
 * Interpolates between two hex colors by factor t (0..1).
 */
function interpolateColor(color1: string, color2: string, t: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const h = hex.replace("#", "");
    if (h.length !== 6) return null;
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16),
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

export function getGradientDomain(data: StateDataPoint[], config: GradientConfig): { min: number; max: number } {
    const hasHighlights = data.some(d => d.highlightValue != null);
    const values = data
        .map(d => hasHighlights ? (d.highlightValue ?? 0) : d.value)
        .filter(v => v != null && !isNaN(v) && v > 0);
    if (values.length === 0) {
        return { min: 0, max: 0 };
    }
    return {
        min: Math.min(...values),
        max: Math.max(...values)
    };
}

/**
 * Applies gradient-based color to each data point.
 */
export function applyGradientColors(data: StateDataPoint[], config: GradientConfig): StateDataPoint[] {
    const { min: dataMin, max: dataMax } = getGradientDomain(data, config);
    if (dataMax === 0 && dataMin === 0 && data.length === 0) return data;

    return data.map(point => {
        if (point.value == null || isNaN(point.value)) {
            return { ...point, color: config.nullColor };
        }

        const range = dataMax - dataMin;
        if (range === 0) {
            return { ...point, color: config.maxColor };
        }

        let normalized = clamp01((point.value - dataMin) / range);
        if (config.reverseScale) {
            normalized = 1 - normalized;
        }
        let color: string;

        if (config.style === "diverging") {
            if (normalized <= 0.5) {
                color = interpolateColor(config.minColor, config.midColor, normalized * 2);
            } else {
                color = interpolateColor(config.midColor, config.maxColor, (normalized - 0.5) * 2);
            }
        } else {
            // Sequential
            color = interpolateColor(config.minColor, config.maxColor, normalized);
        }

        return { ...point, color };
    });
}

/**
 * Generates a CSS gradient string for the legend bar.
 */
export function buildLegendGradientCSS(config: GradientConfig, direction: string = "to top"): string {
    const colors = config.reverseScale
        ? [config.maxColor, config.midColor, config.minColor]
        : [config.minColor, config.midColor, config.maxColor];

    if (config.style === "diverging") {
        return `linear-gradient(${direction}, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    }
    return `linear-gradient(${direction}, ${colors[0]}, ${colors[2]})`;
}
