"use strict";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import DataView = powerbi.DataView;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VisualFormattingSettingsModel, setLocalizationManager } from "./settings";
import { applyGradientColors, buildLegendGradientCSS, getGradientDomain, GradientConfig, StateDataPoint } from "./colorEngine";
import { GeoFeature, GeoCollection, MapScope, Locale, resolveLocale, getGeoForScope, getFeatureCode, getFeatureName, buildAliasMap } from "./geoData";

/** Blend two hex colors at ratio t (0→color1, 1→color2). */
function interpolateHex(c1: string, c2: string, t: number): string {
    const parse = (h: string) => { const n = parseInt(h.replace("#", ""), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const a = parse(c1), b = parse(c2);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Lighten a hex color by mixing with white at given ratio (0=original, 1=white). */
function lightenHex(hex: string, ratio: number): string {
    return interpolateHex(hex, "#ffffff", ratio);
}

/** Format number with display units like native PBI visuals. */
function formatCompact(value: number, locale: string, displayUnits: number = 0): string {
    if (value == null || isNaN(value)) return "0";
    const abs = Math.abs(value);

    let divisor = 1;
    let suffix = "";

    if (displayUnits === 0) {
        // Auto: pick based on magnitude
        if (abs >= 1e12) { divisor = 1e12; suffix = "T"; }
        else if (abs >= 1e9) { divisor = 1e9; suffix = "B"; }
        else if (abs >= 1e6) { divisor = 1e6; suffix = "M"; }
        else if (abs >= 1e3) { divisor = 1e3; suffix = "K"; }
    } else if (displayUnits > 1) {
        divisor = displayUnits;
        if (displayUnits === 1000) suffix = "K";
        else if (displayUnits === 1e6) suffix = "M";
        else if (displayUnits === 1e9) suffix = "B";
        else if (displayUnits === 1e12) suffix = "T";
    }
    // displayUnits === 1 means "None" — no scaling

    const formatted = (value / divisor).toLocaleString(locale, {
        maximumFractionDigits: divisor > 1 ? 1 : 0
    });
    return formatted + suffix;
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: powerbi.extensibility.visual.IVisualHost;
    private localizationManager: powerbi.extensibility.ILocalizationManager;
    private selectionManager: ISelectionManager;

    // DOM
    private container: HTMLElement;
    private contentEl: HTMLElement;
    private dataTableEl: HTMLElement;
    private mapPanelEl: HTMLElement;   // flex row: [legend?] + [svg]
    private mapWrapperEl: HTMLElement;
    private legendEl: HTMLElement;
    private tooltipEl: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private statesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private labelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private zoomGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;

    private featureByUf: Map<string, GeoFeature>;
    private aliasesToUf: Map<string, string>;
    private resizeObserver: ResizeObserver;
    private lastColoredData: StateDataPoint[] = [];
    private lastGradientConfig: GradientConfig | null = null;

    // Dynamic geo state
    private currentScope: MapScope = "br";
    private currentGeoJson: GeoCollection;
    private currentFeatures: GeoFeature[] = [];
    private isCountryLevel: boolean = false;
    private locale: Locale = "pt";
    private displayUnitsValue: number = 0;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.localizationManager = options.host.createLocalizationManager();
        setLocalizationManager(this.localizationManager);
        this.selectionManager = options.host.createSelectionManager();
        this.selectionManager.registerOnSelectCallback(() => {
            // When external visuals change selection, re-render with updated opacity
            if (this.lastGradientConfig) {
                this.renderMapPaths(this.lastColoredData, this.lastGradientConfig);
            }
        });
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.target.style.overflow = "hidden";
        this.featureByUf = new Map<string, GeoFeature>();
        this.aliasesToUf = new Map<string, string>();
        this.locale = resolveLocale(this.host.locale);

        // Initialize with default scope (Brazil)
        const geo = getGeoForScope("br");
        this.currentGeoJson = geo.geoJson;
        this.currentFeatures = geo.features;
        this.isCountryLevel = geo.isCountryLevel;
        this.buildFeatureLookup();

        // Root container
        this.container = document.createElement("div");
        this.container.className = "brazil-map-visual";
        this.target.appendChild(this.container);

        // Content row: [table?] + [map panel]
        this.contentEl = document.createElement("div");
        this.contentEl.className = "bm-content";
        this.container.appendChild(this.contentEl);

        // Data table
        this.dataTableEl = document.createElement("div");
        this.dataTableEl.className = "bm-data-table";
        this.contentEl.appendChild(this.dataTableEl);

        // Map panel: [legend?] + [svg wrapper]
        this.mapPanelEl = document.createElement("div");
        this.mapPanelEl.className = "bm-map-panel";
        this.contentEl.appendChild(this.mapPanelEl);

        // Legend (inside map panel)
        this.legendEl = document.createElement("div");
        this.legendEl.className = "bm-legend";
        this.mapPanelEl.appendChild(this.legendEl);

        // SVG wrapper (inside map panel)
        this.mapWrapperEl = document.createElement("div");
        this.mapWrapperEl.className = "bm-map-wrapper";
        this.mapPanelEl.appendChild(this.mapWrapperEl);

        this.svg = d3.select(this.mapWrapperEl)
            .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("shape-rendering", "geometricPrecision")
            .style("text-rendering", "optimizeLegibility")
            .classed("bm-svg", true);

        this.zoomGroup = this.svg.append("g").attr("class", "bm-zoom-group");
        this.statesGroup = this.zoomGroup.append("g").attr("class", "bm-states");
        this.labelsGroup = this.zoomGroup.append("g").attr("class", "bm-labels");

        // Zoom/pan via scroll wheel and drag
        this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 8])
            .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
                this.zoomGroup.attr("transform", event.transform.toString());
            });
        this.svg.call(this.zoomBehavior);

        // Click on SVG background clears cross-filter selection
        this.svg.on("click", (event: MouseEvent) => {
            if ((event.target as Element).tagName === "svg" || (event.target as Element).classList.contains("bm-svg")) {
                this.selectionManager.clear().then(() => {
                    if (this.lastGradientConfig) {
                        this.renderMapPaths(this.lastColoredData, this.lastGradientConfig);
                    }
                });
            }
        });

        // Tooltip (fixed overlay on container)
        this.tooltipEl = document.createElement("div");
        this.tooltipEl.className = "bm-tooltip";
        this.tooltipEl.style.display = "none";
        this.container.appendChild(this.tooltipEl);

        // ResizeObserver to keep SVG crisp on resize
        this.resizeObserver = new ResizeObserver(() => {
            if (this.lastGradientConfig) {
                this.renderMapPaths(this.lastColoredData, this.lastGradientConfig);
            }
        });
        this.resizeObserver.observe(this.mapWrapperEl);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);

        try {
            const dataView: DataView = options.dataViews?.[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, dataView
            );

            // Apply localization to format pane labels
            this.formattingSettings.applyLocalization();

            // Read display units setting
            this.displayUnitsValue = Number(this.formattingSettings.mapSettingsCard.displayUnits.value) || 0;

            // Update locale from Power BI
            this.locale = resolveLocale(this.host.locale);

            // Check if map scope changed — reload geo data if so
            const newScope = String(this.formattingSettings.mapSettingsCard.mapScope.value) as MapScope;
            if (newScope !== this.currentScope) {
                this.currentScope = newScope;
                const geo = getGeoForScope(newScope);
                this.currentGeoJson = geo.geoJson;
                this.currentFeatures = geo.features;
                this.isCountryLevel = geo.isCountryLevel;
                this.buildFeatureLookup();
                // Reset zoom on scope change
                this.svg.call(this.zoomBehavior.transform, d3.zoomIdentity);
            }

            // Extract data
            const dataPoints = this.extractData(dataView);

            // Read per-row conditional formatting colors from dataView objects
            const rowColors = this.readConditionalColors(dataView);
            const nullColor = this.formattingSettings.dataColorsCard.nullColor.value.value;
            const reverseScale = this.formattingSettings.dataColorsCard.reverseScale.value;

            // Apply colors: if conditional formatting is active, use per-row colors
            // Otherwise fall back to a simple gradient using the single fill color
            const fillColor = this.formattingSettings.dataColorsCard.fill.value.value;
            let coloredData: StateDataPoint[];
            let gradientConfig: GradientConfig;

            if (rowColors.length > 0) {
                // Conditional formatting active: PBI resolved colors per row
                coloredData = dataPoints.map((dp, i) => ({
                    ...dp,
                    color: (dp.value == null || dp.value === 0) ? nullColor : (rowColors[i] ?? fillColor)
                }));
                // Determine gradient from the resolved colors for legend
                const uniqueColors = [...new Set(rowColors.filter(Boolean))];
                const first = uniqueColors[0] ?? fillColor;
                const last = uniqueColors[uniqueColors.length - 1] ?? fillColor;
                const mid = uniqueColors.length > 2 ? uniqueColors[Math.floor(uniqueColors.length / 2)] : interpolateHex(first, last, 0.5);
                gradientConfig = { style: "sequential", minColor: first, midColor: mid, maxColor: last, nullColor, reverseScale };
            } else {
                // No conditional formatting: use single fill color as max, lighten for min
                const maxC = fillColor || "#4a90d9";
                const minC = lightenHex(maxC, 0.75);
                const midC = interpolateHex(minC, maxC, 0.5);
                gradientConfig = { style: "sequential", minColor: minC, midColor: midC, maxColor: maxC, nullColor, reverseScale };
                coloredData = applyGradientColors(dataPoints, gradientConfig);
            }

            this.lastColoredData = coloredData;
            this.lastGradientConfig = gradientConfig;

            // When highlights active, re-color based on highlight values
            const hasActiveHighlights = coloredData.some(d => d.highlightValue != null);
            if (hasActiveHighlights) {
                // Create temporary data with highlight values for gradient calculation
                const highlightData = coloredData
                    .filter(d => (d.highlightValue ?? 0) > 0)
                    .map(d => ({ ...d, value: d.highlightValue! }));
                const recolored = applyGradientColors(highlightData, gradientConfig);
                const recolorMap = new Map(recolored.map(d => [d.stateCode, d.color]));
                coloredData = coloredData.map(d => ({
                    ...d,
                    color: (d.highlightValue ?? 0) > 0
                        ? (recolorMap.get(d.stateCode) ?? d.color)
                        : nullColor
                }));
                this.lastColoredData = coloredData;
            }

            // Render
            this.renderDataTable(coloredData);
            this.renderLegend(gradientConfig, coloredData);
            this.applyLayout(options.viewport);
            this.renderMapPaths(coloredData, gradientConfig);

            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    private extractData(dataView: DataView): StateDataPoint[] {
        const categories = dataView?.categorical?.categories ?? [];
        const values = dataView?.categorical?.values ?? [];

        if (!categories[0] || !values[0]) {
            return [];
        }

        const stateValues = categories[0].values;
        const categoryValues = categories[1]?.values ?? [];
        const primaryValues = values[0].values;
        const primaryHighlights = values[0].highlights;
        const hasHighlights = primaryHighlights != null && primaryHighlights.some(h => h != null);
        const secondaryValues = values[1]?.values ?? [];
        const tooltipValues = values[2]?.values ?? [];
        const aggregated = new Map<string, StateDataPoint & { categories: Set<string>; highlightSum: number; valueSum: number }>();
        let total = 0;

        for (let i = 0; i < stateValues.length; i++) {
            const stateCode = this.normalizeStateInput(stateValues[i]);
            if (!stateCode) {
                continue;
            }

            const feature = this.featureByUf.get(stateCode);
            const primaryValue = Number(primaryValues[i]) || 0;
            // When highlights are active, non-highlighted rows contribute 0
            const highlightValue = hasHighlights
                ? (primaryHighlights![i] != null ? Number(primaryHighlights![i]) : 0)
                : primaryValue;
            const secondaryValue = secondaryValues.length > i ? Number(secondaryValues[i]) || 0 : undefined;
            const tooltipValue = tooltipValues.length > i ? Number(tooltipValues[i]) || 0 : undefined;
            const category = categoryValues.length > i && categoryValues[i] != null ? String(categoryValues[i]) : "";

            // Create selectionId for the first row of each state
            const existing = aggregated.get(stateCode) ?? {
                stateCode,
                stateName: feature ? getFeatureName(feature, this.isCountryLevel, this.locale) : stateCode,
                value: 0,
                secondaryValue: 0,
                tooltipValue: 0,
                categories: new Set<string>(),
                highlightSum: 0,
                valueSum: 0,
                selectionId: this.host.createSelectionIdBuilder()
                    .withCategory(categories[0], i)
                    .createSelectionId()
            };

            existing.value += primaryValue;
            existing.valueSum += primaryValue;
            existing.highlightSum += highlightValue;
            existing.secondaryValue = (existing.secondaryValue ?? 0) + (secondaryValue ?? 0);
            existing.tooltipValue = (existing.tooltipValue ?? 0) + (tooltipValue ?? 0);

            if (category) {
                existing.categories.add(category);
            }

            aggregated.set(stateCode, existing);
            total += primaryValue;
        }

        return Array.from(aggregated.values()).map(point => ({
            stateCode: point.stateCode,
            stateName: point.stateName,
            category: Array.from(point.categories).join(", "),
            value: point.value,
            highlightValue: hasHighlights ? point.highlightSum : undefined,
            secondaryValue: point.secondaryValue,
            tooltipValue: point.tooltipValue,
            percentage: total > 0 ? (point.value / total) * 100 : 0,
            selectionId: point.selectionId,
            highlightRatio: hasHighlights ? (point.valueSum > 0 ? point.highlightSum / point.valueSum : 0) : undefined,
        }));
    }

    private renderMapPaths(data: StateDataPoint[], gradientConfig: GradientConfig): void {
        if (!this.formattingSettings) return;
        const mapS = this.formattingSettings.mapSettingsCard;
        const colorsS = this.formattingSettings.dataColorsCard;
        const tooltipS = this.formattingSettings.tooltipCard;
        const dataMap = new Map<string, StateDataPoint>();
        data.forEach(d => dataMap.set(d.stateCode, d));
        const noDataColor = colorsS.nullColor.value.value;
        const padding = Math.max(0, mapS.mapPadding.value);
        // Force reflow to get accurate dimensions after layout changes
        void this.mapWrapperEl.offsetHeight;
        const width = Math.max(100, this.mapWrapperEl.offsetWidth);
        const height = Math.max(100, this.mapWrapperEl.offsetHeight);

        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitExtent([[padding, padding], [Math.max(padding + 1, width - padding), Math.max(padding + 1, height - padding)]], this.currentGeoJson as unknown as d3.GeoPermissibleObjects);
        const pathGenerator = d3.geoPath(projection as never);

        this.svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        // Determine if any highlights are active (from external cross-filter via category)
        const hasHighlights = data.some(d => d.highlightRatio != null && d.highlightRatio < 1);

        // Determine if local selection is active (user clicked a state in THIS visual)
        const selectedIds = this.selectionManager.getSelectionIds() as ISelectionId[];
        const hasSelection = selectedIds.length > 0;

        // Build set of selected state codes for quick lookup
        const selectedStateCodes = new Set<string>();
        if (hasSelection) {
            data.forEach(d => {
                if (d.selectionId && selectedIds.some(sel => sel.equals(d.selectionId as ISelectionId))) {
                    selectedStateCodes.add(d.stateCode);
                }
            });
        }

        // Ensure defs element for clip paths
        let defs = this.svg.select<SVGDefsElement>("defs");
        if (defs.empty()) {
            defs = this.svg.insert("defs", ":first-child");
        }
        defs.selectAll("*").remove();

        // Remove old highlight overlays
        this.zoomGroup.selectAll(".bm-highlight-overlay").remove();

        const statesSelection = this.svg.select<SVGGElement>(".bm-states")
            .selectAll<SVGPathElement, GeoFeature>("path")
            .data(this.currentFeatures, feature => this.getFeatureUf(feature) ?? "")
            .join(
                enter => enter.append("path").attr("class", "bm-state-path"),
                update => update,
                exit => exit.remove()
            )
            .attr("data-state", feature => this.getFeatureUf(feature) ?? "")
            .attr("d", feature => pathGenerator(feature as never) ?? "")
            .attr("fill", feature => {
                const code = this.getFeatureUf(feature);
                const dp = code ? dataMap.get(code) : undefined;
                if (!dp && !mapS.showMissingStates.value) {
                    return "transparent";
                }
                // Selected states use hover color
                if (hasSelection && code && selectedStateCodes.has(code)) {
                    return mapS.hoverColor.value.value;
                }
                // States with zero highlight show null color
                if (hasHighlights && dp && dp.highlightRatio != null && dp.highlightRatio <= 0) {
                    return noDataColor;
                }
                return dp?.color ?? noDataColor;
            })
            .style("opacity", feature => {
                const code = this.getFeatureUf(feature);
                const dp = code ? dataMap.get(code) : undefined;
                if (!dp) return String(mapS.noDataOpacity.value);
                // When local selection active, dim non-selected states
                if (hasSelection && !selectedStateCodes.has(dp.stateCode)) {
                    return "0.3";
                }
                // When highlights active, treat like a filter: full or no-data
                if (hasHighlights && dp.highlightRatio != null && dp.highlightRatio <= 0) {
                    return String(mapS.noDataOpacity.value);
                }
                return "1";
            })
            .attr("stroke", mapS.borderColor.value.value)
            .attr("stroke-width", mapS.borderWidth.value)
            .on("mouseenter", (event: MouseEvent, feature: GeoFeature) => {
                const target = event.target as SVGPathElement;
                const code = this.getFeatureUf(feature);
                const dp = code ? dataMap.get(code) : undefined;

                // Only show hover color if state is not dimmed
                const isDimmed = (!dp)
                    || (hasSelection && !selectedStateCodes.has(code!))
                    || (hasHighlights && dp.highlightRatio != null && dp.highlightRatio <= 0);
                if (!isDimmed) {
                    target.setAttribute("fill", mapS.hoverColor.value.value);
                }

                if (tooltipS.show.value && code) {
                    this.showTooltip(dp ?? {
                        stateCode: code,
                        stateName: getFeatureName(feature, this.isCountryLevel, this.locale) || code,
                        value: 0,
                        percentage: 0,
                    }, event, !!dp);
                }
            })
            .on("mousemove", (event: MouseEvent) => {
                if (tooltipS.show.value) {
                    this.moveTooltip(event);
                }
            })
            .on("mouseleave", (event: MouseEvent, feature: GeoFeature) => {
                const target = event.target as SVGPathElement;
                const code = this.getFeatureUf(feature);
                const dp = code ? dataMap.get(code) : undefined;
                // Restore fill: selected states keep hover color, zero-highlight = null color
                if (hasSelection && code && selectedStateCodes.has(code)) {
                    target.setAttribute("fill", mapS.hoverColor.value.value);
                } else if (hasHighlights && dp && dp.highlightRatio != null && dp.highlightRatio <= 0) {
                    target.setAttribute("fill", noDataColor);
                } else {
                    target.setAttribute("fill", dp?.color ?? noDataColor);
                }
                // Restore opacity considering both selection and highlight states
                if (!dp) {
                    target.style.opacity = String(mapS.noDataOpacity.value);
                } else if (hasSelection && !selectedStateCodes.has(dp.stateCode)) {
                    target.style.opacity = "0.3";
                } else if (hasHighlights && dp.highlightRatio != null && dp.highlightRatio <= 0) {
                    target.style.opacity = String(mapS.noDataOpacity.value);
                } else {
                    target.style.opacity = "1";
                }
                this.hideTooltip();
            })
            .on("click", (_event: MouseEvent, feature: GeoFeature) => {
                const code = this.getFeatureUf(feature);
                const dp = code ? dataMap.get(code) : undefined;
                if (dp?.selectionId) {
                    this.selectionManager.select(dp.selectionId as ISelectionId, (_event as MouseEvent).ctrlKey || (_event as MouseEvent).metaKey).then(() => {
                        // Re-render to show selection state immediately
                        this.renderMapPaths(this.lastColoredData, this.lastGradientConfig!);
                    });
                } else {
                    this.selectionManager.clear().then(() => {
                        this.renderMapPaths(this.lastColoredData, this.lastGradientConfig!);
                    });
                }
            });



        this.labelsGroup.selectAll("*").remove();

        const labelMode = String(mapS.labelMode.value);
        if (mapS.showLabels.value && labelMode !== "none") {
            const lf = mapS.labelFont;
            const useStroke = mapS.labelStroke.value;
            this.currentFeatures.forEach(feature => {
                const code = this.getFeatureUf(feature);
                if (!code) {
                    return;
                }
                const dataPoint = dataMap.get(code);
                if (!dataPoint && !mapS.showMissingStates.value) {
                    return;
                }
                const centroid = pathGenerator.centroid(feature as never);
                if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) {
                    return;
                }

                // Build label text based on mode
                let labelText: string;
                const val = dataPoint ? formatCompact(dataPoint.value, this.host.locale, this.displayUnitsValue) : "";
                const featureName = getFeatureName(feature, this.isCountryLevel, this.locale);
                switch (labelMode) {
                    case "name":
                        labelText = featureName || code;
                        break;
                    case "value":
                        labelText = val || code;
                        break;
                    case "uf_value":
                        labelText = val ? `${code}\n${val}` : code;
                        break;
                    case "name_value":
                        labelText = val ? `${featureName || code}\n${val}` : (featureName || code);
                        break;
                    default: // "uf"
                        labelText = code;
                        break;
                }

                const lines = labelText.split("\n");
                if (lines.length === 1) {
                    this.labelsGroup.append("text")
                        .attr("x", centroid[0])
                        .attr("y", centroid[1])
                        .attr("class", "bm-label")
                        .attr("font-size", lf.fontSize.value)
                        .attr("font-family", lf.fontFamily.value)
                        .attr("font-weight", lf.bold?.value ? "bold" : "600")
                        .attr("font-style", lf.italic?.value ? "italic" : "normal")
                        .attr("text-decoration", lf.underline?.value ? "underline" : "none")
                        .attr("fill", mapS.labelColor.value.value)
                        .attr("paint-order", useStroke ? "stroke" : "normal")
                        .attr("stroke", useStroke ? "rgba(255,255,255,0.85)" : "none")
                        .attr("stroke-width", useStroke ? "2.5" : "0")
                        .attr("stroke-linejoin", "round")
                        .text(lines[0]);
                } else {
                    // Multi-line: use tspans
                    const textEl = this.labelsGroup.append("text")
                        .attr("x", centroid[0])
                        .attr("y", centroid[1])
                        .attr("class", "bm-label")
                        .attr("font-size", lf.fontSize.value)
                        .attr("font-family", lf.fontFamily.value)
                        .attr("font-weight", lf.bold?.value ? "bold" : "600")
                        .attr("font-style", lf.italic?.value ? "italic" : "normal")
                        .attr("text-decoration", lf.underline?.value ? "underline" : "none")
                        .attr("fill", mapS.labelColor.value.value)
                        .attr("paint-order", useStroke ? "stroke" : "normal")
                        .attr("stroke", useStroke ? "rgba(255,255,255,0.85)" : "none")
                        .attr("stroke-width", useStroke ? "2.5" : "0")
                        .attr("stroke-linejoin", "round");

                    const lineH = (lf.fontSize.value as number) * 1.15;
                    const startY = -(lineH * (lines.length - 1)) / 2;
                    lines.forEach((line, idx) => {
                        textEl.append("tspan")
                            .attr("x", centroid[0])
                            .attr("dy", idx === 0 ? startY : lineH)
                            .attr("font-size", idx > 0 ? (lf.fontSize.value as number) * 0.85 : lf.fontSize.value)
                            .text(line);
                    });
                }
            });
        }
    }

    private renderDataTable(data: StateDataPoint[]): void {
        const s = this.formattingSettings.dataTableCard;
        if (!s.show.value) {
            this.dataTableEl.style.display = "none";
            return;
        }

        this.dataTableEl.style.display = "flex";
        this.dataTableEl.style.fontSize = s.tableFont.fontSize.value + "px";
        this.dataTableEl.style.fontFamily = s.tableFont.fontFamily.value;
        this.dataTableEl.style.fontWeight = s.tableFont.bold?.value ? "bold" : "normal";
        this.dataTableEl.style.fontStyle = s.tableFont.italic?.value ? "italic" : "normal";
        this.dataTableEl.style.textDecoration = s.tableFont.underline?.value ? "underline" : "none";
        this.dataTableEl.style.color = s.fontColor.value.value;

        const sortMode = String(s.sortBy.value.value);
        // When highlights are active, filter to only highlighted states and use highlight values
        const hasHighlights = data.some(d => d.highlightValue != null);
        const filteredData = hasHighlights
            ? data.filter(d => d.highlightValue != null && d.highlightValue > 0)
            : data;
        const sorted = [...filteredData]
            .sort((a, b) => {
                if (sortMode === "name") {
                    return a.stateName.localeCompare(b.stateName, "pt-BR");
                }
                if (sortMode === "secondary") {
                    return (b.secondaryValue ?? 0) - (a.secondaryValue ?? 0);
                }
                const aVal = hasHighlights ? (a.highlightValue ?? 0) : a.value;
                const bVal = hasHighlights ? (b.highlightValue ?? 0) : b.value;
                return bVal - aVal;
            })
            .slice(0, s.topN.value);
        const maxVal = sorted.length > 0
            ? (hasHighlights ? (sorted[0].highlightValue ?? sorted[0].value) : sorted[0].value)
            : 1;

        this.clearElement(this.dataTableEl);
        // Recalculate percentages based on visible (filtered) total
        const visibleTotal = sorted.reduce((sum, d) => sum + (hasHighlights ? (d.highlightValue ?? 0) : d.value), 0);

        for (const item of sorted) {
            const displayValue = hasHighlights ? (item.highlightValue ?? 0) : item.value;
            const displayPct = visibleTotal > 0 ? (displayValue / visibleTotal) * 100 : 0;
            const barW = (displayValue / maxVal) * 100;
            const row = document.createElement("div");
            row.className = "bm-dt-row";

            // Click on row filters cross-visuals
            row.style.cursor = "pointer";
            row.addEventListener("click", (ev) => {
                if (item.selectionId) {
                    this.selectionManager.select(item.selectionId as ISelectionId, ev.ctrlKey || ev.metaKey).then(() => {
                        this.renderMapPaths(this.lastColoredData, this.lastGradientConfig!);
                    });
                }
            });

            const label = document.createElement("div");
            label.className = "bm-dt-label";
            label.textContent = s.showStateName.value ? `${item.stateCode} - ${item.stateName}` : item.stateCode;
            row.appendChild(label);

            if (s.showValue.value || s.showPercentage.value) {
                const values = document.createElement("div");
                values.className = "bm-dt-values";
                if (s.showValue.value) {
                    const valSpan = document.createElement("span");
                    valSpan.className = "bm-dt-value";
                    valSpan.textContent = formatCompact(displayValue, this.host.locale, this.displayUnitsValue);
                    values.appendChild(valSpan);
                }
                if (s.showPercentage.value) {
                    const pctSpan = document.createElement("span");
                    pctSpan.className = "bm-dt-pct";
                    pctSpan.textContent = displayPct.toFixed(1) + "%";
                    values.appendChild(pctSpan);
                }
                row.appendChild(values);
            }

            if (s.showSecondaryValue.value && item.secondaryValue != null && item.secondaryValue !== 0) {
                const secondary = document.createElement("div");
                secondary.className = "bm-dt-secondary";
                secondary.textContent = `${this.localizationManager.getDisplayName("Visual_SecondaryValue")}: ${formatCompact(item.secondaryValue, this.host.locale, this.displayUnitsValue)}`;
                row.appendChild(secondary);
            }

            if (s.showBars.value) {
                const track = document.createElement("div");
                track.className = "bm-dt-bar-track";
                const fill = document.createElement("div");
                fill.className = "bm-dt-bar-fill";
                fill.style.width = barW + "%";
                fill.style.background = item.color ?? s.barColor.value.value;
                track.appendChild(fill);
                row.appendChild(track);
            }

            this.dataTableEl.appendChild(row);
        }
    }

    private renderLegend(config: GradientConfig, data: StateDataPoint[]): void {
        const s = this.formattingSettings.legendCard;
        if (!s.show.value) {
            this.legendEl.style.display = "none";
            this.mapPanelEl.style.flexDirection = "row";
            return;
        }

        const position = String(s.position.value.value); // "left" | "right" | "top" | "bottom"
        const isHorizontal = position === "top" || position === "bottom";

        this.legendEl.style.display = "flex";
        this.legendEl.style.flexDirection = isHorizontal ? "row" : "column";
        this.legendEl.style.fontSize = s.legendFont.fontSize.value + "px";
        this.legendEl.style.fontFamily = s.legendFont.fontFamily.value;
        this.legendEl.style.fontWeight = s.legendFont.bold?.value ? "bold" : "normal";
        this.legendEl.style.fontStyle = s.legendFont.italic?.value ? "italic" : "normal";
        this.legendEl.style.color = s.fontColor.value.value;

        // Background
        if (s.showBackground.value) {
            this.legendEl.style.background = s.backgroundColor.value.value;
            this.legendEl.style.borderRadius = "6px";
            this.legendEl.style.padding = "8px 6px";
        } else {
            this.legendEl.style.background = "transparent";
            this.legendEl.style.borderRadius = "";
            this.legendEl.style.padding = "6px 4px";
        }

        const gradientDir = isHorizontal ? "to right" : "to top";
        const gradientCSS = buildLegendGradientCSS(config, gradientDir);
        const domain = getGradientDomain(data, config);
        this.clearElement(this.legendEl);

        // Title
        if (s.showTitle.value && s.titleText.value) {
            const titleEl = document.createElement("span");
            titleEl.className = "bm-legend-title";
            titleEl.textContent = s.titleText.value;
            titleEl.style.fontWeight = "600";
            titleEl.style.fontSize = "0.82em";
            titleEl.style.marginBottom = isHorizontal ? "0" : "4px";
            titleEl.style.marginRight = isHorizontal ? "6px" : "0";
            this.legendEl.appendChild(titleEl);
        }

        if (isHorizontal) {
            // Horizontal layout: minLabel - bar - maxLabel
            const minLabel = document.createElement("span");
            minLabel.className = "bm-legend-tick";
            minLabel.textContent = formatCompact(domain.min, this.host.locale, this.displayUnitsValue);
            this.legendEl.appendChild(minLabel);

            const bar = document.createElement("div");
            bar.className = "bm-legend-bar bm-legend-bar-h";
            bar.style.background = gradientCSS;
            this.legendEl.appendChild(bar);

            const maxLabel = document.createElement("span");
            maxLabel.className = "bm-legend-tick";
            maxLabel.textContent = formatCompact(domain.max, this.host.locale, this.displayUnitsValue);
            this.legendEl.appendChild(maxLabel);
        } else {
            // Vertical layout: maxLabel - bar - minLabel (top to bottom)
            const maxLabel = document.createElement("span");
            maxLabel.className = "bm-legend-tick";
            maxLabel.textContent = formatCompact(domain.max, this.host.locale, this.displayUnitsValue);
            this.legendEl.appendChild(maxLabel);

            const bar = document.createElement("div");
            bar.className = "bm-legend-bar";
            bar.style.background = gradientCSS;
            this.legendEl.appendChild(bar);

            const minLabel = document.createElement("span");
            minLabel.className = "bm-legend-tick";
            minLabel.textContent = formatCompact(domain.min, this.host.locale, this.displayUnitsValue);
            this.legendEl.appendChild(minLabel);
        }

        // Position: insert legend relative to the map wrapper
        if (position === "left" || position === "top") {
            this.mapPanelEl.insertBefore(this.legendEl, this.mapWrapperEl);
        } else {
            this.mapPanelEl.appendChild(this.legendEl);
        }

        // Adjust panel direction for top/bottom
        if (isHorizontal) {
            this.mapPanelEl.style.flexDirection = "column";
        } else {
            this.mapPanelEl.style.flexDirection = "row";
        }
    }

    private showTooltip(dp: StateDataPoint, event: MouseEvent, hasData: boolean): void {
        const s = this.formattingSettings.tooltipCard;
        this.tooltipEl.style.display = "block";
        this.tooltipEl.style.backgroundColor = s.backgroundColor.value.value;
        this.tooltipEl.style.color = s.textColor.value.value;
        this.tooltipEl.style.fontSize = s.tooltipFont.fontSize.value + "px";
        this.tooltipEl.style.fontFamily = s.tooltipFont.fontFamily.value;
        this.tooltipEl.style.fontWeight = s.tooltipFont.bold?.value ? "bold" : "normal";
        this.tooltipEl.style.fontStyle = s.tooltipFont.italic?.value ? "italic" : "normal";

        this.clearElement(this.tooltipEl);

        const titleDiv = document.createElement("div");
        titleDiv.className = "bm-tt-title";
        titleDiv.textContent = dp.stateName;
        this.tooltipEl.appendChild(titleDiv);

        if (s.showCategory.value && dp.category) {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "bm-tt-meta";
            categoryDiv.textContent = dp.category;
            this.tooltipEl.appendChild(categoryDiv);
        }

        if (s.showValue.value) {
            const valDiv = document.createElement("div");
            valDiv.className = "bm-tt-value";
            const displayVal = dp.highlightValue != null ? dp.highlightValue : dp.value;
            valDiv.textContent = hasData ? formatCompact(displayVal, this.host.locale, this.displayUnitsValue) : this.localizationManager.getDisplayName("Visual_NoData");
            this.tooltipEl.appendChild(valDiv);
        }
        if (s.showSecondaryValue.value && hasData && dp.secondaryValue != null && dp.secondaryValue !== 0) {
            const secDiv = document.createElement("div");
            secDiv.className = "bm-tt-meta";
            secDiv.textContent = `${this.localizationManager.getDisplayName("Visual_SecondaryValue")}: ${formatCompact(dp.secondaryValue, this.host.locale, this.displayUnitsValue)}`;
            this.tooltipEl.appendChild(secDiv);
        }
        if (s.showTooltipMeasure.value && hasData && dp.tooltipValue != null && dp.tooltipValue !== 0) {
            const tooltipMeasureDiv = document.createElement("div");
            tooltipMeasureDiv.className = "bm-tt-meta";
            tooltipMeasureDiv.textContent = `${this.localizationManager.getDisplayName("Visual_AdditionalMeasure")}: ${formatCompact(dp.tooltipValue, this.host.locale, this.displayUnitsValue)}`;
            this.tooltipEl.appendChild(tooltipMeasureDiv);
        }
        if (s.showPercentage.value && dp.percentage != null) {
            const pctDiv = document.createElement("div");
            pctDiv.className = "bm-tt-pct";
            // When highlights active, show highlight ratio as percentage
            const displayPct = dp.highlightRatio != null
                ? (dp.highlightRatio * 100)
                : dp.percentage;
            pctDiv.textContent = displayPct.toFixed(1) + "%";
            this.tooltipEl.appendChild(pctDiv);
        }
        this.moveTooltip(event);
    }

    private moveTooltip(event: MouseEvent): void {
        const rect = this.container.getBoundingClientRect();
        this.tooltipEl.style.left = (event.clientX - rect.left + 12) + "px";
        this.tooltipEl.style.top = (event.clientY - rect.top - 8) + "px";
    }

    private hideTooltip(): void {
        this.tooltipEl.style.display = "none";
    }

    private applyLayout(viewport: powerbi.IViewport): void {
        this.container.style.width = viewport.width + "px";
        this.container.style.height = viewport.height + "px";
        const canvasColor = this.formattingSettings.dataColorsCard.canvasColor.value.value;
        this.container.style.background = canvasColor === "transparent" ? "transparent" : canvasColor;

        // Data table position (left = before map panel, right = after)
        const tablePos = String(this.formattingSettings.dataTableCard.position.value.value);
        if (this.formattingSettings.dataTableCard.show.value) {
            this.dataTableEl.style.display = "flex";
            if (tablePos === "right") {
                this.contentEl.appendChild(this.dataTableEl);  // move to end
            } else {
                this.contentEl.insertBefore(this.dataTableEl, this.mapPanelEl);
            }
        }
    }

    private buildFeatureLookup(): void {
        this.featureByUf.clear();
        this.aliasesToUf.clear();

        // Build alias map from geoData module
        this.aliasesToUf = buildAliasMap(this.currentFeatures, this.isCountryLevel, this.locale);

        // Build feature lookup by canonical code
        this.currentFeatures.forEach(feature => {
            const code = getFeatureCode(feature, this.isCountryLevel);
            if (code) {
                this.featureByUf.set(code, feature);
            }
        });
    }

    /**
     * Reads per-row fill colors resolved by Power BI conditional formatting.
     * Returns array of hex colors (one per category row) if CF is active, else empty.
     */
    private readConditionalColors(dataView: DataView): string[] {
        const colors: string[] = [];
        const categories = dataView?.categorical?.categories;
        if (!categories || !categories[0]) return colors;

        const objects = categories[0].objects;
        if (!objects) return colors;

        for (let i = 0; i < categories[0].values.length; i++) {
            const obj = objects[i];
            if (obj && obj["dataColors"]) {
                const fill = (obj["dataColors"] as Record<string, unknown>)["fill"];
                if (fill && typeof fill === "object") {
                    const solid = (fill as Record<string, unknown>)["solid"];
                    if (solid && typeof solid === "object") {
                        const color = (solid as Record<string, unknown>)["color"];
                        if (typeof color === "string") {
                            colors.push(color);
                            continue;
                        }
                    }
                }
            }
            colors.push("");
        }
        return colors.some(c => c !== "") ? colors : [];
    }

    private getFeatureUf(feature: GeoFeature): string | null {
        const code = getFeatureCode(feature, this.isCountryLevel);
        return code || null;
    }

    private registerAlias(value: string, uf: string): void {
        this.aliasesToUf.set(this.normalizeText(value), uf);
    }

    private normalizeStateInput(value: unknown): string | null {
        if (value == null) {
            return null;
        }

        const normalized = this.normalizeText(String(value));
        return this.aliasesToUf.get(normalized) ?? null;
    }

    private normalizeText(value: string): string {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[.-]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
    }

    private clearElement(el: HTMLElement): void {
        while (el.firstChild) {
            el.firstChild.remove();
        }
    }

    /** Calculate bounding box from an SVG path d string using a temporary element. */
    private getPathBBox(pathD: string): { x: number; y: number; width: number; height: number } {
        const temp = document.createElementNS("http://www.w3.org/2000/svg", "path");
        temp.setAttribute("d", pathD);
        this.svg.node()!.appendChild(temp);
        const bbox = temp.getBBox();
        temp.remove();
        return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        const model = this.formattingSettingsService.buildFormattingModel(this.formattingSettings);

        // Enable conditional formatting (ConstantOrRule) on fill and nullColor
        if (model && model.cards) {
            for (const card of model.cards) {
                if (!("groups" in card)) continue;
                const fc = card as powerbi.visuals.FormattingCard;
                if (fc.displayName === this.formattingSettings.dataColorsCard.displayName) {
                    for (const group of fc.groups) {
                        if (!("slices" in group)) continue;
                        const fg = group as powerbi.visuals.FormattingGroup;
                        for (const slice of fg.slices) {
                            const s = slice as powerbi.visuals.FormattingSlice & { control?: { properties?: { descriptor?: Record<string, unknown> } } };
                            if (s.control?.properties?.descriptor) {
                                const desc = s.control.properties.descriptor;
                                if (desc.objectName === "dataColors" &&
                                    (desc.propertyName === "fill" || desc.propertyName === "nullColor")) {
                                    desc.instanceKind = VisualEnumerationInstanceKinds.ConstantOrRule;
                                }
                            }
                        }
                    }
                }
            }
        }

        return model;
    }
}