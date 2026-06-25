<p align="center">
  <img src="assets/icon.png" alt="Logo" width="80" height="80">
</p>

<h1 align="center">🌎 Ale Maps — Power BI Custom Visual</h1>

<p align="center">
  Interactive choropleth map of the Americas for Microsoft Power BI.<br/>
  Mapa coroplético interativo das Américas para Microsoft Power BI.
</p>

<p align="center">
  <a href="https://github.com/Alelourenco/custom-map-powerbi/releases/latest"><img src="https://img.shields.io/badge/⬇_Download-.pbiviz-blue?style=for-the-badge" alt="Download"></a>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Power_BI-API_5.3-yellow?style=for-the-badge" alt="API Version">
  <img src="https://img.shields.io/badge/countries-29-orange?style=for-the-badge" alt="29 Countries">
</p>

---

## 🇺🇸 English

### About

Free & open-source custom visual that displays an **interactive choropleth map** for any country in the Americas — with state/province subdivisions, conditional formatting, cross-filtering, and full localization.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ **29 countries** | Select any country in the Americas (BR, AR, US, MX, CA, CO, CL, PE, and more) |
| 🌐 **Native localization** | UI follows Power BI language (English, Portuguese, Spanish) |
| 📊 **Display Units** | Auto, None, Thousands (K), Millions (M), Billions (B), Trillions (T) |
| 🎨 **Conditional formatting** | `fx` button for rule-based gradient — auto min/max colors |
| 🔍 **Zoom & pan** | Scroll to zoom, drag to pan |
| 🖱️ **Cross-filtering** | Click a state to filter other visuals |
| 📥 **Responds to filters** | Other visuals and slicers filter the map like a native visual |
| 📋 **Data table** | Top N regions with value, percentage, and proportional bar |
| 🏷️ **Flexible labels** | Code, Name, Value or combinations inside the map |
| 📐 **Gradient legend** | 4 positions (right, left, top, bottom) |
| 🔤 **Custom fonts** | Full FontControl for labels, table, legend, and tooltip |
| 💡 **Rich tooltip** | Primary value, secondary, category, and percentage |
| 📱 **Responsive** | Adapts to container size automatically |

### 🗺️ Supported Countries

**South America:** Brazil, Argentina, Chile, Colombia, Peru, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Suriname, Guyana

**Central America:** Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panama, Belize

**North America:** United States, Canada, Mexico, Cuba, Dominican Republic, Jamaica, Haiti, Bahamas, Trinidad & Tobago, Puerto Rico

### 📥 How to Install

1. **Download** the `.pbiviz` file from the [dist folder](https://github.com/Alelourenco/custom-map-powerbi/tree/main/dist) or [Releases](https://github.com/Alelourenco/custom-map-powerbi/releases)
2. In Power BI Desktop → **Visualizations** → **…** → **Import a visual from a file**
3. Select the downloaded `.pbiviz` file
4. The visual appears in the visualizations pane — drag it to your canvas!

### 🗂️ Data Fields

| Field | Required | Description |
|-------|:--------:|-------------|
| State | ✅ | State/province code or name |
| Primary value | ✅ | Metric for color and ranking |
| Category | ❌ | Grouping for tooltip/filter |
| Secondary value | ❌ | Extra metric for tooltip/table |
| Tooltip measure | ❌ | Additional metric for tooltip |

---

## 🇧🇷 Português

### Sobre

Visual customizado gratuito e open-source que exibe um **mapa coroplético interativo** de qualquer país das Américas — com subdivisões por estado/província, formatação condicional, cross-filtering e localização completa.

### ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| 🗺️ **29 países** | Selecione qualquer país das Américas (BR, AR, US, MX, CA, CO, CL, PE, e mais) |
| 🌐 **Localização nativa** | Interface segue o idioma do Power BI (Inglês, Português, Espanhol) |
| 📊 **Unidades de exibição** | Auto, Nenhum, Milhares (K), Milhões (M), Bilhões (B), Trilhões (T) |
| 🎨 **Formatação condicional** | Botão `fx` para degradê por regra — cores mín/máx automáticas |
| 🔍 **Zoom e pan** | Scroll para zoom, arraste para mover |
| 🖱️ **Cross-filtering** | Clique em um estado para filtrar outros visuais |
| 📥 **Responde a filtros** | Outros visuais e slicers filtram o mapa como um visual nativo |
| 📋 **Tabela de dados** | Top N regiões com valor, percentual e barra proporcional |
| 🏷️ **Rótulos flexíveis** | Código, Nome, Valor ou combinações dentro do mapa |
| 📐 **Legenda com gradiente** | 4 posições (direita, esquerda, topo, rodapé) |
| 🔤 **Fontes personalizáveis** | FontControl completo para rótulos, tabela, legenda e tooltip |
| 💡 **Tooltip rico** | Valor principal, secundário, categoria e percentual |
| 📱 **Responsivo** | Adapta-se ao tamanho do container automaticamente |

### 📥 Como Instalar

1. **Baixe** o arquivo `.pbiviz` da [pasta dist](https://github.com/Alelourenco/custom-map-powerbi/tree/main/dist) ou [Releases](https://github.com/Alelourenco/custom-map-powerbi/releases)
2. No Power BI Desktop → **Visualizações** → **…** → **Importar um visual de um arquivo**
3. Selecione o arquivo `.pbiviz` baixado
4. O visual aparecerá no painel de visualizações — arraste para o canvas!

### 🗂️ Campos de Dados

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| State (Estado) | ✅ | Código ou nome do estado/província |
| Primary value (Valor) | ✅ | Métrica para cor e ranking |
| Category (Categoria) | ❌ | Agrupamento para tooltip/filtro |
| Secondary value | ❌ | Métrica extra para tooltip/tabela |
| Tooltip measure | ❌ | Métrica adicional para tooltip |

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

### Tech Stack

- TypeScript + D3.js (geoIdentity projection)
- Power BI Visuals API 5.3.0
- powerbi-visuals-utils-formattingmodel
- @highcharts/map-collection (29 country GeoJSON files)
- Webpack + LESS
- stringResources (EN, PT-BR, ES)

---

## 📄 License

[MIT](LICENSE) — Free for personal and commercial use.

---

<p align="center">
  Made with ❤️ for the Power BI community<br/>
  <strong>Ale Maps</strong> by <a href="https://github.com/Alelourenco">@Alelourenco</a>
</p>
