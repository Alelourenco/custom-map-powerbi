"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ============================================================
// Map Settings Card
// ============================================================
class MapSettingsCard extends FormattingSettingsCard {
    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Cor da borda",
        value: { value: "#ffffff" }
    });

    borderWidth = new formattingSettings.NumUpDown({
        name: "borderWidth",
        displayName: "Espessura da borda",
        value: 0.5,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 5 } }
    });

    hoverColor = new formattingSettings.ColorPicker({
        name: "hoverColor",
        displayName: "Cor ao passar o mouse",
        value: { value: "#ffd700" }
    });

    showMissingStates = new formattingSettings.ToggleSwitch({
        name: "showMissingStates",
        displayName: "Mostrar estados sem dados",
        value: true
    });

    noDataOpacity = new formattingSettings.NumUpDown({
        name: "noDataOpacity",
        displayName: "Opacidade sem dados",
        value: 0.45,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 1 } }
    });

    mapPadding = new formattingSettings.NumUpDown({
        name: "mapPadding",
        displayName: "Margem interna do mapa",
        value: 10,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 0 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 80 } }
    });

    labelMode = new formattingSettings.AutoDropdown({
        name: "labelMode",
        displayName: "Conteúdo do rótulo",
        value: "uf"
    });

    showLabels = new formattingSettings.ToggleSwitch({
        name: "showLabels",
        displayName: "Mostrar rótulos",
        value: true
    });

    labelStroke = new formattingSettings.ToggleSwitch({
        name: "labelStroke",
        displayName: "Contorno nos rótulos",
        description: "Adiciona borda ao redor do texto para melhor legibilidade",
        value: false
    });

    labelColor = new formattingSettings.ColorPicker({
        name: "labelColor",
        displayName: "Cor dos rótulos",
        value: { value: "#333333" }
    });

    // FontControl composite for labels
    labelFont = new formattingSettings.FontControl({
        name: "labelFont",
        displayName: "Fonte dos rótulos",
        fontFamily: new formattingSettings.FontPicker({
            name: "labelFontFamily",
            displayName: "Família da fonte",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "labelFontSize",
            displayName: "Tamanho dos rótulos",
            value: 9,
            options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 6 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 18 } }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "labelBold",
            displayName: "Negrito",
            value: true
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "labelItalic",
            displayName: "Itálico",
            value: false
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "labelUnderline",
            displayName: "Sublinhado",
            value: false
        })
    });

    name: string = "mapSettings";
    displayName: string = "Mapa";
    slices: Array<FormattingSettingsSlice> = [
        this.borderColor, this.borderWidth,
        this.hoverColor, this.showMissingStates, this.noDataOpacity, this.mapPadding,
        this.showLabels, this.labelMode, this.labelFont, this.labelColor, this.labelStroke
    ];
}

// ============================================================
// Data Colors Card
// ============================================================
class DataColorsCard extends FormattingSettingsCard {
    // Single fill with ConstantOrRule: user clicks fx → gets gradient dialog
    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Cor do mapa",
        description: "Use o botão fx para configurar degradê por regra condicional",
        value: { value: "#4a90d9" }
    });

    nullColor = new formattingSettings.ColorPicker({
        name: "nullColor",
        displayName: "Cor para nulo / zero",
        description: "Cor de estados sem valor ou com valor zero",
        value: { value: "#e0e0e0" }
    });

    canvasColor = new formattingSettings.ColorPicker({
        name: "canvasColor",
        displayName: "Cor de fundo",
        description: "Fundo do visual (use transparent para herdar do relatório)",
        value: { value: "transparent" }
    });

    reverseScale = new formattingSettings.ToggleSwitch({
        name: "reverseScale",
        displayName: "Inverter escala",
        value: false
    });

    name: string = "dataColors";
    displayName: string = "Cores dos dados";
    slices: Array<FormattingSettingsSlice> = [
        this.fill, this.nullColor, this.canvasColor, this.reverseScale
    ];
}

// ============================================================
// Legend Card
// ============================================================
class LegendCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar legenda",
        value: true
    });

    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Posição",
        items: [
            { value: "right", displayName: "Direita" },
            { value: "left", displayName: "Esquerda" },
            { value: "top", displayName: "Topo (centro)" },
            { value: "bottom", displayName: "Rodapé (centro)" }
        ],
        value: { value: "right", displayName: "Direita" }
    });

    showBackground = new formattingSettings.ToggleSwitch({
        name: "showBackground",
        displayName: "Mostrar fundo",
        value: false
    });

    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Cor de fundo",
        value: { value: "#ffffff" }
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Cor do texto",
        value: { value: "#605e5c" }
    });

    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "Mostrar título",
        value: false
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Texto do título",
        value: "Legenda",
        placeholder: "Título da legenda"
    });

    legendFont = new formattingSettings.FontControl({
        name: "legendFont",
        displayName: "Fonte da legenda",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Família da fonte",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Tamanho da fonte",
            value: 11,
            options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "fontBold",
            displayName: "Negrito",
            value: false
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "fontItalic",
            displayName: "Itálico",
            value: false
        })
    });

    name: string = "legend";
    displayName: string = "Legenda";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.position, this.showBackground, this.backgroundColor,
        this.fontColor, this.showTitle, this.titleText, this.legendFont
    ];
}

// ============================================================
// Tooltip Card
// ============================================================
class TooltipCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar tooltip",
        value: true
    });

    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Cor de fundo",
        value: { value: "#ffffff" }
    });

    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Cor do texto",
        value: { value: "#333333" }
    });

    tooltipFont = new formattingSettings.FontControl({
        name: "tooltipFont",
        displayName: "Fonte",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Família da fonte",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Tamanho da fonte",
            value: 12,
            options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "fontBold",
            displayName: "Negrito",
            value: false
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "fontItalic",
            displayName: "Itálico",
            value: false
        })
    });

    showValue = new formattingSettings.ToggleSwitch({
        name: "showValue",
        displayName: "Mostrar valor",
        value: true
    });

    showPercentage = new formattingSettings.ToggleSwitch({
        name: "showPercentage",
        displayName: "Mostrar percentual",
        value: true
    });

    showCategory = new formattingSettings.ToggleSwitch({
        name: "showCategory",
        displayName: "Mostrar categoria",
        value: true
    });

    showSecondaryValue = new formattingSettings.ToggleSwitch({
        name: "showSecondaryValue",
        displayName: "Mostrar valor secundário",
        value: true
    });

    showTooltipMeasure = new formattingSettings.ToggleSwitch({
        name: "showTooltipMeasure",
        displayName: "Mostrar medida adicional",
        value: true
    });

    name: string = "tooltip";
    displayName: string = "Dica de ferramenta";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.backgroundColor, this.textColor, this.tooltipFont,
        this.showValue, this.showPercentage, this.showCategory,
        this.showSecondaryValue, this.showTooltipMeasure
    ];
}

// ============================================================
// Data Table Card
// ============================================================
class DataTableCard extends FormattingSettingsCard {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Mostrar tabela",
        value: true
    });

    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Posição",
        items: [
            { value: "left", displayName: "Esquerda" },
            { value: "right", displayName: "Direita" }
        ],
        value: { value: "left", displayName: "Esquerda" }
    });

    topN = new formattingSettings.NumUpDown({
        name: "topN",
        displayName: "Top N estados",
        value: 5,
        options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 1 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 27 } }
    });

    showBars = new formattingSettings.ToggleSwitch({
        name: "showBars",
        displayName: "Mostrar barras",
        value: true
    });

    barColor = new formattingSettings.ColorPicker({
        name: "barColor",
        displayName: "Cor das barras",
        value: { value: "#1a5276" }
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Cor da fonte",
        value: { value: "#333333" }
    });

    tableFont = new formattingSettings.FontControl({
        name: "tableFont",
        displayName: "Fonte",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Família da fonte",
            value: "Segoe UI"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Tamanho da fonte",
            value: 12,
            options: { minValue: { type: powerbi.visuals.ValidatorType.Min, value: 8 }, maxValue: { type: powerbi.visuals.ValidatorType.Max, value: 20 } }
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "fontBold",
            displayName: "Negrito",
            value: false
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "fontItalic",
            displayName: "Itálico",
            value: false
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "fontUnderline",
            displayName: "Sublinhado",
            value: false
        })
    });

    showStateName = new formattingSettings.ToggleSwitch({
        name: "showStateName",
        displayName: "Mostrar nome do estado",
        value: true
    });

    showValue = new formattingSettings.ToggleSwitch({
        name: "showValue",
        displayName: "Mostrar valor",
        value: true
    });

    showPercentage = new formattingSettings.ToggleSwitch({
        name: "showPercentage",
        displayName: "Mostrar percentual",
        value: true
    });

    showSecondaryValue = new formattingSettings.ToggleSwitch({
        name: "showSecondaryValue",
        displayName: "Mostrar valor secundário",
        value: true
    });

    sortBy = new formattingSettings.ItemDropdown({
        name: "sortBy",
        displayName: "Ordenar por",
        items: [
            { value: "primary", displayName: "Valor principal" },
            { value: "secondary", displayName: "Valor secundário" },
            { value: "name", displayName: "Nome do estado" }
        ],
        value: { value: "primary", displayName: "Valor principal" }
    });

    name: string = "dataTable";
    displayName: string = "Tabela de dados";
    slices: Array<FormattingSettingsSlice> = [
        this.show, this.position, this.topN, this.showBars, this.barColor,
        this.tableFont, this.fontColor, this.showStateName, this.showValue,
        this.showPercentage, this.showSecondaryValue, this.sortBy
    ];
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

    cards = [
        this.mapSettingsCard,
        this.dataColorsCard,
        this.legendCard,
        this.tooltipCard,
        this.dataTableCard
    ];
}
