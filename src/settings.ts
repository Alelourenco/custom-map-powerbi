"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ────────────────────────────────────────────────────────────
// Localization helper — resolved at runtime via ILocalizationManager
// ────────────────────────────────────────────────────────────
let _loc: powerbi.extensibility.ILocalizationManager | null = null;

export function setLocalizationManager(lm: powerbi.extensibility.ILocalizationManager): void {
    _loc = lm;
}

function loc(key: string, fallback: string): string {
    return _loc ? _loc.getDisplayName(key) : fallback;
}

// ============================================================
// Map Settings Card
// ============================================================
class MapSettingsCard extends FormattingSettingsCard {
    mapScope = new formattingSettings.AutoDropdown({ name: "mapScope", displayName: "Map region", value: "br" });
    displayUnits = new formattingSettings.AutoDropdown({ name: "displayUnits", displayName: "Display units", value: "0" });
    borderColor = new formattingSettings.ColorPicker({ name: "borderColor", displayName: "Border color", value: { value: "#ffffff" } });
    borderWidth = new formattingSettings.NumUpDown({ name: "borderWidth", displayName: "Border width", value: 0.5, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 5 } } });
    hoverColor = new formattingSettings.ColorPicker({ name: "hoverColor", displayName: "Hover color", value: { value: "#ffd700" } });
    showMissingStates = new formattingSettings.ToggleSwitch({ name: "showMissingStates", displayName: "Show regions without data", value: true });
    noDataOpacity = new formattingSettings.NumUpDown({ name: "noDataOpacity", displayName: "No data opacity", value: 0.45, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 1 } } });
    mapPadding = new formattingSettings.NumUpDown({ name: "mapPadding", displayName: "Map padding", value: 10, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 80 } } });
    labelMode = new formattingSettings.AutoDropdown({ name: "labelMode", displayName: "Label content", value: "uf" });
    showLabels = new formattingSettings.ToggleSwitch({ name: "showLabels", displayName: "Show labels", value: true });
    labelStroke = new formattingSettings.ToggleSwitch({ name: "labelStroke", displayName: "Label outline", value: false });
    labelColor = new formattingSettings.ColorPicker({ name: "labelColor", displayName: "Label color", value: { value: "#333333" } });
    labelFont = new formattingSettings.FontControl({
        name: "labelFont", displayName: "Label font",
        fontFamily: new formattingSettings.FontPicker({ name: "labelFontFamily", displayName: "Font family", value: "Segoe UI" }),
        fontSize: new formattingSettings.NumUpDown({ name: "labelFontSize", displayName: "Font size", value: 9, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 6 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 18 } } }),
        bold: new formattingSettings.ToggleSwitch({ name: "labelBold", displayName: "Bold", value: true }),
        italic: new formattingSettings.ToggleSwitch({ name: "labelItalic", displayName: "Italic", value: false }),
        underline: new formattingSettings.ToggleSwitch({ name: "labelUnderline", displayName: "Underline", value: false })
    });

    name: string = "mapSettings";
    displayName: string = "Map";
    slices: Array<FormattingSettingsSlice> = [
        this.mapScope, this.displayUnits, this.borderColor, this.borderWidth,
        this.hoverColor, this.showMissingStates, this.noDataOpacity, this.mapPadding,
        this.showLabels, this.labelMode, this.labelFont, this.labelColor, this.labelStroke
    ];

    applyLocalization(): void {
        this.displayName = loc("Visual_Map", "Map");
        this.mapScope.displayName = loc("Visual_MapScope", "Map region");
        this.displayUnits.displayName = loc("Visual_DisplayUnits", "Display units");
        this.borderColor.displayName = loc("Visual_BorderColor", "Border color");
        this.borderWidth.displayName = loc("Visual_BorderWidth", "Border width");
        this.hoverColor.displayName = loc("Visual_HoverColor", "Hover color");
        this.showMissingStates.displayName = loc("Visual_ShowMissing", "Show regions without data");
        this.noDataOpacity.displayName = loc("Visual_NoDataOpacity", "No data opacity");
        this.mapPadding.displayName = loc("Visual_MapPadding", "Map padding");
        this.labelMode.displayName = loc("Visual_LabelMode", "Label content");
        this.showLabels.displayName = loc("Visual_ShowLabels", "Show labels");
        this.labelStroke.displayName = loc("Visual_LabelStroke", "Label outline");
        this.labelColor.displayName = loc("Visual_LabelColor", "Label color");
        this.labelFont.displayName = loc("Visual_LabelFont", "Label font");
    }
}

// ============================================================
// Data Colors Card
// ============================================================
class DataColorsCard extends FormattingSettingsCard {
    fill = new formattingSettings.ColorPicker({ name: "fill", displayName: "Map color", value: { value: "#4a90d9" } });
    nullColor = new formattingSettings.ColorPicker({ name: "nullColor", displayName: "Null / zero color", value: { value: "#e0e0e0" } });
    canvasColor = new formattingSettings.ColorPicker({ name: "canvasColor", displayName: "Background color", value: { value: "transparent" } });
    reverseScale = new formattingSettings.ToggleSwitch({ name: "reverseScale", displayName: "Reverse scale", value: false });

    name: string = "dataColors";
    displayName: string = "Data colors";
    slices: Array<FormattingSettingsSlice> = [this.fill, this.nullColor, this.canvasColor, this.reverseScale];

    applyLocalization(): void {
        this.displayName = loc("Visual_DataColors", "Data colors");
        this.fill.displayName = loc("Visual_FillColor", "Map color");
        this.nullColor.displayName = loc("Visual_NullColor", "Null / zero color");
        this.canvasColor.displayName = loc("Visual_CanvasColor", "Background color");
        this.reverseScale.displayName = loc("Visual_ReverseScale", "Reverse scale");
    }
}

// ============================================================
// Legend Card
// ============================================================
class LegendCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show legend", value: true });
    position = new formattingSettings.ItemDropdown({
        name: "position", displayName: "Position",
        items: [{ value: "right", displayName: "Right" }, { value: "left", displayName: "Left" }, { value: "top", displayName: "Top" }, { value: "bottom", displayName: "Bottom" }],
        value: { value: "right", displayName: "Right" }
    });
    showBackground = new formattingSettings.ToggleSwitch({ name: "showBackground", displayName: "Show background", value: false });
    backgroundColor = new formattingSettings.ColorPicker({ name: "backgroundColor", displayName: "Background color", value: { value: "#ffffff" } });
    fontColor = new formattingSettings.ColorPicker({ name: "fontColor", displayName: "Text color", value: { value: "#605e5c" } });
    showTitle = new formattingSettings.ToggleSwitch({ name: "showTitle", displayName: "Show title", value: false });
    titleText = new formattingSettings.TextInput({ name: "titleText", displayName: "Title text", value: "Legend", placeholder: "Legend title" });
    legendFont = new formattingSettings.FontControl({
        name: "legendFont", displayName: "Legend font",
        fontFamily: new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" }),
        fontSize: new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 11, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } } }),
        bold: new formattingSettings.ToggleSwitch({ name: "fontBold", displayName: "Bold", value: false }),
        italic: new formattingSettings.ToggleSwitch({ name: "fontItalic", displayName: "Italic", value: false })
    });

    name: string = "legend";
    displayName: string = "Legend";
    slices: Array<FormattingSettingsSlice> = [this.show, this.position, this.showBackground, this.backgroundColor, this.fontColor, this.showTitle, this.titleText, this.legendFont];

    applyLocalization(): void {
        this.displayName = loc("Visual_Legend", "Legend");
        this.show.displayName = loc("Visual_ShowLegend", "Show legend");
        this.position.displayName = loc("Visual_Position", "Position");
        this.showBackground.displayName = loc("Visual_ShowBackground", "Show background");
        this.backgroundColor.displayName = loc("Visual_BackgroundColor", "Background color");
        this.fontColor.displayName = loc("Visual_TextColor", "Text color");
        this.showTitle.displayName = loc("Visual_ShowTitle", "Show title");
        this.titleText.displayName = loc("Visual_TitleText", "Title text");
        this.legendFont.displayName = loc("Visual_LegendFont", "Legend font");
    }
}

// ============================================================
// Tooltip Card
// ============================================================
class TooltipCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show tooltip", value: true });
    backgroundColor = new formattingSettings.ColorPicker({ name: "backgroundColor", displayName: "Background color", value: { value: "#ffffff" } });
    textColor = new formattingSettings.ColorPicker({ name: "textColor", displayName: "Text color", value: { value: "#333333" } });
    tooltipFont = new formattingSettings.FontControl({
        name: "tooltipFont", displayName: "Font",
        fontFamily: new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" }),
        fontSize: new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 12, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } } }),
        bold: new formattingSettings.ToggleSwitch({ name: "fontBold", displayName: "Bold", value: false }),
        italic: new formattingSettings.ToggleSwitch({ name: "fontItalic", displayName: "Italic", value: false })
    });
    showValue = new formattingSettings.ToggleSwitch({ name: "showValue", displayName: "Show value", value: true });
    showPercentage = new formattingSettings.ToggleSwitch({ name: "showPercentage", displayName: "Show percentage", value: true });
    showCategory = new formattingSettings.ToggleSwitch({ name: "showCategory", displayName: "Show category", value: true });
    showSecondaryValue = new formattingSettings.ToggleSwitch({ name: "showSecondaryValue", displayName: "Show secondary value", value: true });
    showTooltipMeasure = new formattingSettings.ToggleSwitch({ name: "showTooltipMeasure", displayName: "Show additional measure", value: true });

    name: string = "tooltip";
    displayName: string = "Tooltip";
    slices: Array<FormattingSettingsSlice> = [this.show, this.backgroundColor, this.textColor, this.tooltipFont, this.showValue, this.showPercentage, this.showCategory, this.showSecondaryValue, this.showTooltipMeasure];

    applyLocalization(): void {
        this.displayName = loc("Visual_Tooltip", "Tooltip");
        this.show.displayName = loc("Visual_ShowTooltip", "Show tooltip");
        this.backgroundColor.displayName = loc("Visual_BackgroundColor", "Background color");
        this.textColor.displayName = loc("Visual_TextColor", "Text color");
        this.showValue.displayName = loc("Visual_ShowValue", "Show value");
        this.showPercentage.displayName = loc("Visual_ShowPercentage", "Show percentage");
        this.showCategory.displayName = loc("Visual_ShowCategory", "Show category");
        this.showSecondaryValue.displayName = loc("Visual_ShowSecondary", "Show secondary value");
        this.showTooltipMeasure.displayName = loc("Visual_ShowTooltipMeasure", "Show additional measure");
    }
}

// ============================================================
// Data Table Card
// ============================================================
class DataTableCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show table", value: true });
    position = new formattingSettings.ItemDropdown({
        name: "position", displayName: "Position",
        items: [{ value: "left", displayName: "Left" }, { value: "right", displayName: "Right" }],
        value: { value: "left", displayName: "Left" }
    });
    topN = new formattingSettings.NumUpDown({ name: "topN", displayName: "Top N regions", value: 5, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 1 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 27 } } });
    showBars = new formattingSettings.ToggleSwitch({ name: "showBars", displayName: "Show bars", value: true });
    barColor = new formattingSettings.ColorPicker({ name: "barColor", displayName: "Bar color", value: { value: "#1a5276" } });
    fontColor = new formattingSettings.ColorPicker({ name: "fontColor", displayName: "Font color", value: { value: "#333333" } });
    tableFont = new formattingSettings.FontControl({
        name: "tableFont", displayName: "Font",
        fontFamily: new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" }),
        fontSize: new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 12, options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } } }),
        bold: new formattingSettings.ToggleSwitch({ name: "fontBold", displayName: "Bold", value: false }),
        italic: new formattingSettings.ToggleSwitch({ name: "fontItalic", displayName: "Italic", value: false }),
        underline: new formattingSettings.ToggleSwitch({ name: "fontUnderline", displayName: "Underline", value: false })
    });
    showStateName = new formattingSettings.ToggleSwitch({ name: "showStateName", displayName: "Show region name", value: true });
    showValue = new formattingSettings.ToggleSwitch({ name: "showValue", displayName: "Show value", value: true });
    showPercentage = new formattingSettings.ToggleSwitch({ name: "showPercentage", displayName: "Show percentage", value: true });
    showSecondaryValue = new formattingSettings.ToggleSwitch({ name: "showSecondaryValue", displayName: "Show secondary value", value: true });
    sortBy = new formattingSettings.ItemDropdown({
        name: "sortBy", displayName: "Sort by",
        items: [{ value: "primary", displayName: "Primary value" }, { value: "secondary", displayName: "Secondary value" }, { value: "name", displayName: "Region name" }],
        value: { value: "primary", displayName: "Primary value" }
    });

    name: string = "dataTable";
    displayName: string = "Data table";
    slices: Array<FormattingSettingsSlice> = [this.show, this.position, this.topN, this.showBars, this.barColor, this.tableFont, this.fontColor, this.showStateName, this.showValue, this.showPercentage, this.showSecondaryValue, this.sortBy];

    applyLocalization(): void {
        this.displayName = loc("Visual_DataTable", "Data table");
        this.show.displayName = loc("Visual_ShowTable", "Show table");
        this.position.displayName = loc("Visual_Position", "Position");
        this.topN.displayName = loc("Visual_TopN", "Top N regions");
        this.showBars.displayName = loc("Visual_ShowBars", "Show bars");
        this.barColor.displayName = loc("Visual_BarColor", "Bar color");
        this.fontColor.displayName = loc("Visual_FontColor", "Font color");
        this.showStateName.displayName = loc("Visual_ShowStateName", "Show region name");
        this.showValue.displayName = loc("Visual_ShowValue", "Show value");
        this.showPercentage.displayName = loc("Visual_ShowPercentage", "Show percentage");
        this.showSecondaryValue.displayName = loc("Visual_ShowSecondary", "Show secondary value");
        this.sortBy.displayName = loc("Visual_SortBy", "Sort by");
    }
}

// ============================================================
// Full Formatting Model
// ============================================================
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    mapSettingsCard = new MapSettingsCard();
    dataColorsCard = new DataColorsCard();
    legendCard = new LegendCard();
    tooltipCard = new TooltipCard();
    dataTableCard = new DataTableCard();

    cards = [this.mapSettingsCard, this.dataColorsCard, this.legendCard, this.tooltipCard, this.dataTableCard];

    applyLocalization(): void {
        this.mapSettingsCard.applyLocalization();
        this.dataColorsCard.applyLocalization();
        this.legendCard.applyLocalization();
        this.tooltipCard.applyLocalization();
        this.dataTableCard.applyLocalization();
    }
}
