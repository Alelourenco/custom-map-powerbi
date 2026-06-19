"use strict";

/**
 * Brazil states SVG path data (simplified topographic outlines).
 * Each state has: code, name, path (SVG d), label position (cx, cy).
 */
export interface StateGeo {
    code: string;
    name: string;
    path: string;
    cx: number;
    cy: number;
}

export const BRAZIL_STATES: StateGeo[] = [
    { code: "AC", name: "Acre", path: "M62,218L82,215L88,225L95,230L85,240L72,238L60,230Z", cx: 75, cy: 228 },
    { code: "AL", name: "Alagoas", path: "M410,235L420,230L428,233L425,240L415,242Z", cx: 420, cy: 237 },
    { code: "AM", name: "Amazonas", path: "M95,140L140,130L175,135L190,150L185,175L175,190L155,200L130,205L110,210L95,215L85,200L80,180L82,160Z", cx: 135, cy: 172 },
    { code: "AP", name: "Amapá", path: "M230,100L248,95L258,105L255,120L245,130L232,125L228,112Z", cx: 243, cy: 112 },
    { code: "BA", name: "Bahia", path: "M350,240L375,235L400,238L410,250L415,270L410,290L400,310L385,320L365,315L350,305L340,290L335,270L340,255Z", cx: 375, cy: 278 },
    { code: "CE", name: "Ceará", path: "M385,175L405,170L420,175L425,188L418,200L405,205L390,200L383,190Z", cx: 405, cy: 188 },
    { code: "DF", name: "Distrito Federal", path: "M310,285L318,282L322,288L318,294L310,292Z", cx: 316, cy: 288 },
    { code: "ES", name: "Espírito Santo", path: "M385,320L400,318L405,328L400,340L388,338L383,330Z", cx: 393, cy: 330 },
    { code: "GO", name: "Goiás", path: "M280,270L310,265L330,272L338,285L335,305L320,315L300,318L285,310L275,295L275,280Z", cx: 305, cy: 292 },
    { code: "MA", name: "Maranhão", path: "M295,160L325,155L345,162L355,175L350,195L340,205L320,210L300,205L290,190L288,175Z", cx: 322, cy: 183 },
    { code: "MG", name: "Minas Gerais", path: "M310,310L345,305L370,312L385,325L380,345L365,360L340,365L315,358L300,345L298,325Z", cx: 342, cy: 335 },
    { code: "MS", name: "Mato Grosso do Sul", path: "M230,320L265,315L280,325L285,345L278,362L260,370L240,365L225,350L222,335Z", cx: 253, cy: 342 },
    { code: "MT", name: "Mato Grosso", path: "M180,210L220,200L260,205L280,218L285,240L280,265L265,280L240,285L215,280L195,265L178,245L175,225Z", cx: 230, cy: 242 },
    { code: "PA", name: "Pará", path: "M190,110L230,105L265,115L285,130L290,155L280,175L260,185L235,188L210,185L192,175L185,155L185,130Z", cx: 238, cy: 148 },
    { code: "PB", name: "Paraíba", path: "M400,210L418,207L430,212L428,220L415,223L400,220Z", cx: 415, cy: 215 },
    { code: "PE", name: "Pernambuco", path: "M390,222L415,218L432,222L430,232L415,235L390,232Z", cx: 412, cy: 227 },
    { code: "PI", name: "Piauí", path: "M345,190L370,185L385,192L388,210L380,225L365,230L348,225L340,212L340,198Z", cx: 363, cy: 208 },
    { code: "PR", name: "Paraná", path: "M265,370L300,365L325,372L332,385L325,398L305,405L280,400L262,390L258,380Z", cx: 295, cy: 385 },
    { code: "RJ", name: "Rio de Janeiro", path: "M345,365L370,360L385,368L382,380L368,385L348,380L342,372Z", cx: 365, cy: 372 },
    { code: "RN", name: "Rio Grande do Norte", path: "M405,195L422,192L432,198L428,207L418,210L405,207Z", cx: 419, cy: 201 },
    { code: "RO", name: "Rondônia", path: "M130,230L158,225L172,235L175,250L165,262L148,265L132,258L125,245Z", cx: 150, cy: 247 },
    { code: "RR", name: "Roraima", path: "M145,80L168,75L180,85L178,102L168,112L150,110L140,100L140,88Z", cx: 160, cy: 95 },
    { code: "RS", name: "Rio Grande do Sul", path: "M260,410L290,405L310,415L315,432L305,448L285,455L265,450L250,438L248,422Z", cx: 282, cy: 430 },
    { code: "SC", name: "Santa Catarina", path: "M278,400L308,395L322,402L320,415L305,420L280,415L272,408Z", cx: 298, cy: 408 },
    { code: "SE", name: "Sergipe", path: "M405,242L415,240L420,246L416,253L408,252L403,248Z", cx: 412, cy: 247 },
    { code: "SP", name: "São Paulo", path: "M290,350L325,345L350,352L358,365L350,380L330,388L305,385L285,378L278,365Z", cx: 320, cy: 365 },
    { code: "TO", name: "Tocantins", path: "M290,195L315,190L332,198L335,215L330,235L318,248L300,250L285,242L280,225L282,208Z", cx: 308, cy: 222 },
];

export const BRAZIL_VIEWBOX = "0 0 480 500";
