<p align="center">
  <img src="assets/icon.png" alt="Logo" width="80" height="80">
</p>

<h1 align="center">🇧🇷 Mapa do Brasil — Power BI Custom Visual</h1>

<p align="center">
  Mapa coroplético interativo e gratuito do Brasil para Microsoft Power BI.<br/>
  Interactive choropleth map of Brazil for Microsoft Power BI — free & open-source.
</p>

<p align="center">
  <a href="https://github.com/Alelourenco/custom-map-powerbi/releases/latest"><img src="https://img.shields.io/badge/⬇_Download-.pbiviz-blue?style=for-the-badge" alt="Download"></a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Power_BI-API_5.3-yellow?style=for-the-badge" alt="API Version">
</p>

---

## 🇧🇷 Português

### Sobre

Visual customizado que exibe um **mapa coroplético do Brasil por UF** com funcionalidades avançadas que não existem no visual nativo de mapa do Power BI:

### ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| 🎨 **Formatação condicional** | Botão `fx` para degradê por regra — cores mín/máx automáticas |
| 🔍 **Zoom e pan** | Scroll para zoom, arraste para mover o mapa |
| 🖱️ **Cross-filtering** | Clique em um estado para filtrar outros visuais |
| 📊 **Responde a filtros** | Outros visuais e slicers filtram o mapa como um visual nativo |
| 📋 **Tabela de dados** | Top N estados com valor, percentual e barra proporcional |
| 🏷️ **Rótulos flexíveis** | UF, Nome, Valor ou combinações dentro do mapa |
| 📐 **Legenda com gradiente** | 4 posições (direita, esquerda, topo, rodapé) |
| 🔤 **Fontes personalizáveis** | FontControl completo para rótulos, tabela, legenda e tooltip |
| 💡 **Tooltip rico** | Valor principal, secundário, categoria e percentual |
| 📱 **Responsivo** | Adapta-se ao tamanho do container automaticamente |

### 📥 Como instalar

1. **Baixe** o arquivo `.pbiviz` na [página de Releases](https://github.com/Alelourenco/custom-map-powerbi/releases/latest)
2. No Power BI Desktop, vá em **Visualizações** → **…** → **Importar um visual de um arquivo**
3. Selecione o arquivo `.pbiviz` baixado
4. O visual aparecerá no painel de visualizações — arraste para o canvas!

### 🗂️ Campos de dados

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Estado | ✅ | UF (sigla) ou nome do estado |
| Valor principal | ✅ | Métrica para cor e ranking |
| Categoria | ❌ | Agrupamento para tooltip/filtro |
| Valor secundário | ❌ | Métrica extra para tooltip/tabela |
| Medida de tooltip | ❌ | Métrica adicional para tooltip |

---

## 🇺🇸 English

### About

Custom visual that displays an **interactive choropleth map of Brazil by state (UF)** with advanced features not available in Power BI's native map visual:

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Conditional formatting** | `fx` button for rule-based gradient — auto min/max colors |
| 🔍 **Zoom & pan** | Scroll to zoom, drag to pan |
| 🖱️ **Cross-filtering** | Click a state to filter other visuals |
| 📊 **Responds to filters** | Other visuals and slicers filter the map like a native visual |
| 📋 **Data table** | Top N states with value, percentage, and proportional bar |
| 🏷️ **Flexible labels** | UF, Name, Value or combinations inside the map |
| 📐 **Gradient legend** | 4 positions (right, left, top, bottom) |
| 🔤 **Custom fonts** | Full FontControl for labels, table, legend, and tooltip |
| 💡 **Rich tooltip** | Primary value, secondary, category, and percentage |
| 📱 **Responsive** | Adapts to container size automatically |

### 📥 How to install

1. **Download** the `.pbiviz` file from the [Releases page](https://github.com/Alelourenco/custom-map-powerbi/releases/latest)
2. In Power BI Desktop, go to **Visualizations** → **…** → **Import a visual from a file**
3. Select the downloaded `.pbiviz` file
4. The visual will appear in the visualizations pane — drag it to your canvas!

### 🗂️ Data fields

| Field | Required | Description |
|-------|:--------:|-------------|
| Estado (State) | ✅ | UF (abbreviation) or state name |
| Valor principal (Measure) | ✅ | Metric for color and ranking |
| Categoria (Category) | ❌ | Grouping for tooltip/filter |
| Valor secundário (Secondary) | ❌ | Extra metric for tooltip/table |
| Medida de tooltip (Tooltip) | ❌ | Additional metric for tooltip |

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm start

# Build .pbiviz package
npm run package
```

### Tech stack

- TypeScript + D3.js (geoIdentity projection)
- Power BI Visuals API 5.3.0
- powerbi-visuals-utils-formattingmodel
- GeoJSON: `@anthropic/map-collection` Brazil states
- Webpack + LESS

---

## 📄 License

[MIT](LICENSE) — Free for personal and commercial use.

---

<p align="center">
  Made with ❤️ for the Power BI community 🇧🇷
</p>
