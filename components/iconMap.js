import { DiMsqlServer } from 'react-icons/di'
import {
  FaAws, FaBrain, FaCode, FaDatabase, FaFilePdf, FaJava, FaLinkedin, FaPlug, FaRobot, FaVial,
} from 'react-icons/fa'
import {
  SiApachemaven, SiBootstrap, SiCockroachlabs, SiCplusplus, SiDocker, SiExpress, SiGit, SiGithub, SiGitlab, SiHibernate, SiHtml5,
  SiJavascript, SiJest, SiJunit5, SiKubernetes, SiMongodb, SiMui, SiNextdotjs, SiNodedotjs,
  SiOpenapiinitiative, SiPostgresql, SiPrisma, SiPython, SiReact, SiRedux, SiSass, SiSonatype, SiSpringboot,
  SiTailwindcss, SiTypescript, SiVite, SiVitest, SiPytorch, SiHuggingface, SiMeta, SiKaggle,
  SiWeightsandbiases, SiSupabase, SiOllama, SiElectron, SiSqlite, SiRust,
} from 'react-icons/si'
import { TbBrandCSharp, TbBrandCss3, TbSql } from 'react-icons/tb'

export const FALLBACK_ICON = FaCode

const ICONS = {
  java: FaJava,
  csharp: TbBrandCSharp,
  javascript: SiJavascript,
  typescript: SiTypescript,
  python: SiPython,
  sql: TbSql,
  cplusplus: SiCplusplus,
  springboot: SiSpringboot,
  hibernate: SiHibernate,
  mybatis: FaDatabase,
  nodejs: SiNodedotjs,
  express: SiExpress,
  rest: FaPlug,
  openapi: SiOpenapiinitiative,
  react: SiReact,
  nextjs: SiNextdotjs,
  redux: SiRedux,
  responsive: TbBrandCss3,
  postgresql: SiPostgresql,
  cockroachdb: SiCockroachlabs,
  sqlserver: DiMsqlServer,
  maven: SiApachemaven,
  git: SiGit,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  aws: FaAws,
  nexus: SiSonatype,
  pdfbox: FaFilePdf,
  mongodb: SiMongodb,
  junit: SiJunit5,
  jest: SiJest,
  tdd: FaVial,
  'ai-agents': FaRobot,
  mcp: FaPlug,
  'model-training': FaBrain,
  html: SiHtml5,
  css: TbBrandCss3,
  bootstrap: SiBootstrap,
  sass: SiSass,
  mui: SiMui,
  tailwind: SiTailwindcss,
  prisma: SiPrisma,
  vite: SiVite,
  vitest: SiVitest,
  github: SiGithub,
  gitlab: SiGitlab,
  pytorch: SiPytorch,
  huggingface: SiHuggingface,
  meta: SiMeta,
  kaggle: SiKaggle,
  wandb: SiWeightsandbiases,
  supabase: SiSupabase,
  ollama: SiOllama,
  electron: SiElectron,
  sqlite: SiSqlite,
  rust: SiRust,
  linkedin: FaLinkedin,
}

const BRAND_COLORS = {
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  python: '#3776AB',
  react: '#61DAFB',
  nodejs: '#5FA04E',
  springboot: '#6DB33F',
  hibernate: '#59666C',
  maven: '#C71A36',
  docker: '#2496ED',
  kubernetes: '#326CE5',
  git: '#F03C2E',
  postgresql: '#4169E1',
  cockroachdb: '#6933FF',
  vite: '#646CFF',
  vitest: '#6E9F18',
  mongodb: '#47A248',
  junit: '#25A162',
  jest: '#C21325',
  redux: '#764ABC',
  sass: '#CC6699',
  bootstrap: '#7952B3',
  mui: '#007FFF',
  html: '#E34F26',
  css: '#1572B6',
  openapi: '#6BA539',
  cplusplus: '#00599C',
  pdfbox: '#34A5DA',
  nextjs: '#FFFFFF',
  express: '#FFFFFF',
  java: '#ED8B00',
  csharp: '#9B4F96',
  aws: '#FF9900',
}

export const KNOWN_ICON_KEYS = Object.keys(ICONS)

export function iconFor(iconKey) {
  return ICONS[iconKey] ?? FALLBACK_ICON
}

export function brandColorFor(iconKey) {
  return BRAND_COLORS[iconKey]
}
