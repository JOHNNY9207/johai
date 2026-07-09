"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  Globe2,
  HelpCircle,
  Mail,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";
import FloatingChat from "@/components/FloatingChat";
import type { Language } from "@/app/lib/i18n";

type Room = "AI Employee" | "Industries" | "Customers" | "Pricing";

const rooms: Room[] = ["AI Employee", "Industries", "Customers", "Pricing"];
const landingLocaleStorageKey = "johai-landing-locale";

type LandingCopy = {
  nav: {
    product: string;
    demo: string;
    solutions: string;
    stories: string;
    pricing: string;
    dashboard: string;
    bookStrategyCall: string;
  };
  help: {
    title: string;
    detail: string;
    contactSupport: string;
    bookStrategyCall: string;
  };
  account: {
    signIn: string;
    createAccount: string;
    dashboard: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    openDashboard: string;
  };
  aiFlow: Array<{ label: string; detail: string }>;
  dashboard: {
    operatingSystem: string;
    executiveDashboard: string;
    live: string;
    activityFeed: string;
    metrics: string[];
    actions: string[];
    liveActions: Array<[string, string, string]>;
  };
  industries: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tags: string[];
    names: Record<string, string>;
    workflows: Record<string, string>;
  };
  customers: {
    eyebrow: string;
    title: string;
    businesses: Record<string, string>;
    stats: string[];
    timeline: string[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    monthly: string;
    yearly: string;
    viewPlan: string;
    start: string;
    estimatedRoi: string;
    projectedMonthlyValue: string;
    plans: Record<string, { text: string; features: string[] }>;
  };
  language: {
    title: string;
  };
};

const landingCopy: Record<Language, LandingCopy> = {
  en: {
    nav: {
      product: "Product",
      demo: "Demo",
      solutions: "Solutions",
      stories: "Stories",
      pricing: "Pricing",
      dashboard: "Dashboard",
      bookStrategyCall: "Book strategy call",
    },
    help: {
      title: "Need help?",
      detail: "Contact support or book a strategy call.",
      contactSupport: "Contact support",
      bookStrategyCall: "Book strategy call",
    },
    account: {
      signIn: "Sign in",
      createAccount: "Create account",
      dashboard: "Dashboard",
    },
    hero: {
      eyebrow: "JOHAI AI Employee",
      title: "Your business keeps moving. JOHAI handles the work behind it.",
      subtitle:
        "A calm AI operating layer that captures leads, answers questions, books meetings, sends follow-ups, and updates your CRM while your team serves customers.",
      openDashboard: "Open dashboard",
    },
    aiFlow: [
      { label: "Visitor asks", detail: "Can AI help my business book more customers?" },
      { label: "AI listening", detail: "JOHAI understands intent and urgency." },
      { label: "Knowledge retrieved", detail: "Services, FAQ, and policies are matched." },
      { label: "CRM record appears", detail: "Lead context is saved automatically." },
      { label: "Lead score rises", detail: "Opportunity is marked as high intent." },
      { label: "Calendar suggested", detail: "Booking appears only after qualification." },
      { label: "Email sent", detail: "Confirmation and follow-up are prepared." },
      { label: "Owner notified", detail: "The team sees what matters next." },
    ],
    dashboard: {
      operatingSystem: "JOHAI Operating System",
      executiveDashboard: "Executive Dashboard",
      live: "Live",
      activityFeed: "Live activity feed",
      metrics: ["Business Health", "Bookings", "Conversations", "Revenue Forecast"],
      actions: ["Urgent: call event lead", "Recommendation: upload pricing", "Calendar: 3 calls today"],
      liveActions: [
        ["09:12", "Conversation arrived", "Restaurant owner asked about private events"],
        ["09:13", "Knowledge searched", "Menu, event policy, pricing notes matched"],
        ["09:14", "Lead qualified", "High intent, booking ready"],
        ["09:16", "Meeting booked", "Strategy call added to calendar"],
        ["09:17", "CRM updated", "Timeline, notes, and next action saved"],
      ],
    },
    industries: {
      eyebrow: "Built for real businesses",
      title: "One AI layer. Every business rhythm.",
      subtitle:
        "Switch industries and watch JOHAI adapt its lead capture, booking flow, and follow-up rhythm to the business in front of it.",
      tags: ["Lead", "Booked", "CRM", "Follow-up"],
      names: {
        Restaurant: "Restaurant",
        Dental: "Dental",
        Beauty: "Beauty",
        "Real Estate": "Real Estate",
        Legal: "Legal",
        "Home Services": "Home Services",
      },
      workflows: {
        Restaurant: "Answers menu questions, captures private event leads, books reservations.",
        Dental: "Qualifies treatment requests and guides patients toward consultations.",
        Beauty: "Books consultations, answers service questions, and follows up gently.",
        "Real Estate": "Qualifies buyers, sellers, valuation requests, and meeting intent.",
        Legal: "Routes consultation requests and prepares intake context for the team.",
        "Home Services": "Captures urgent repair leads and keeps dispatch context organized.",
      },
    },
    customers: {
      eyebrow: "Customers",
      title: "Customer stories, not testimonials.",
      businesses: {
        Sarah: "Beauty salon owner",
        Marcus: "Restaurant operator",
      },
      stats: ["conversations answered", "consultations booked", "missed leads recovered", "saved this month"],
      timeline: ["Website question answered", "Consultation booked", "Follow-up sent", "CRM updated"],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Choose the AI layer your business needs.",
      monthly: "Monthly",
      yearly: "Yearly",
      viewPlan: "View plan",
      start: "Start",
      estimatedRoi: "Estimated ROI",
      projectedMonthlyValue: "Projected monthly value",
      plans: {
        Starter: {
          text: "For one business ready to automate the first conversation.",
          features: ["AI Employee", "Lead capture", "Calendly booking", "CRM updates"],
        },
        Professional: {
          text: "For teams that want follow-up, audit, and knowledge workflows.",
          features: ["Everything in Starter", "Follow-ups", "Knowledge Center", "AI Audit"],
        },
        Enterprise: {
          text: "For multi-location operators and agencies building an AI layer.",
          features: ["Multi-business", "Advanced automation", "Priority setup", "Custom workflows"],
        },
      },
    },
    language: {
      title: "Language + Region",
    },
  },
  fr: {
    nav: {
      product: "Produit",
      demo: "Démo",
      solutions: "Solutions",
      stories: "Histoires",
      pricing: "Tarifs",
      dashboard: "Dashboard",
      bookStrategyCall: "Réserver un appel",
    },
    help: {
      title: "Besoin d’aide ?",
      detail: "Contactez le support ou réservez un appel stratégique.",
      contactSupport: "Contacter le support",
      bookStrategyCall: "Réserver un appel",
    },
    account: {
      signIn: "Connexion",
      createAccount: "Créer un compte",
      dashboard: "Dashboard",
    },
    hero: {
      eyebrow: "Employé IA JOHAI",
      title: "Votre entreprise avance. JOHAI gère le travail en arrière-plan.",
      subtitle:
        "Une couche IA calme qui capture les leads, répond aux questions, réserve les rendez-vous, envoie les suivis et met le CRM à jour pendant que votre équipe sert les clients.",
      openDashboard: "Ouvrir le dashboard",
    },
    aiFlow: [
      { label: "Le visiteur demande", detail: "L’IA peut-elle aider mon entreprise à réserver plus de clients ?" },
      { label: "L’IA écoute", detail: "JOHAI comprend l’intention et l’urgence." },
      { label: "Connaissance trouvée", detail: "Services, FAQ et politiques sont associés." },
      { label: "Fiche CRM créée", detail: "Le contexte du lead est enregistré automatiquement." },
      { label: "Score du lead augmente", detail: "L’opportunité devient haute intention." },
      { label: "Calendrier proposé", detail: "La réservation apparaît seulement après qualification." },
      { label: "Email envoyé", detail: "Confirmation et suivi sont préparés." },
      { label: "Propriétaire notifié", detail: "L’équipe voit la prochaine action importante." },
    ],
    dashboard: {
      operatingSystem: "Système d’exploitation JOHAI",
      executiveDashboard: "Dashboard exécutif",
      live: "En direct",
      activityFeed: "Activité en direct",
      metrics: ["Santé business", "Réservations", "Conversations", "Prévision revenu"],
      actions: ["Urgent : appeler le lead événement", "Recommandation : ajouter les prix", "Calendrier : 3 appels aujourd’hui"],
      liveActions: [
        ["09:12", "Conversation reçue", "Un restaurant demande des événements privés"],
        ["09:13", "Connaissance cherchée", "Menu, politique événement et prix trouvés"],
        ["09:14", "Lead qualifié", "Forte intention, prêt à réserver"],
        ["09:16", "Rendez-vous réservé", "Appel stratégique ajouté au calendrier"],
        ["09:17", "CRM mis à jour", "Timeline, notes et prochaine action enregistrées"],
      ],
    },
    industries: {
      eyebrow: "Conçu pour les vraies entreprises",
      title: "Une couche IA. Chaque rythme d’entreprise.",
      subtitle:
        "Changez d’industrie et regardez JOHAI adapter capture de leads, réservation et suivi au contexte métier.",
      tags: ["Lead", "Réservé", "CRM", "Suivi"],
      names: {
        Restaurant: "Restaurant",
        Dental: "Clinique dentaire",
        Beauty: "Beauté",
        "Real Estate": "Immobilier",
        Legal: "Juridique",
        "Home Services": "Services à domicile",
      },
      workflows: {
        Restaurant: "Répond aux questions sur le menu, capture les leads événementiels et réserve les tables.",
        Dental: "Qualifie les demandes de traitement et guide les patients vers une consultation.",
        Beauty: "Réserve les consultations, répond aux questions services et relance avec tact.",
        "Real Estate": "Qualifie acheteurs, vendeurs, demandes d’estimation et intention de rendez-vous.",
        Legal: "Oriente les demandes de consultation et prépare le contexte d’accueil.",
        "Home Services": "Capture les demandes urgentes et garde le contexte d’intervention organisé.",
      },
    },
    customers: {
      eyebrow: "Clients",
      title: "Des histoires clients, pas des témoignages.",
      businesses: {
        Sarah: "Propriétaire d’un salon de beauté",
        Marcus: "Opérateur de restaurant",
      },
      stats: ["conversations traitées", "consultations réservées", "leads récupérés", "économisées ce mois-ci"],
      timeline: ["Question web répondue", "Consultation réservée", "Suivi envoyé", "CRM mis à jour"],
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Choisissez la couche IA dont votre entreprise a besoin.",
      monthly: "Mensuel",
      yearly: "Annuel",
      viewPlan: "Voir le plan",
      start: "Commencer",
      estimatedRoi: "ROI estimé",
      projectedMonthlyValue: "Valeur mensuelle projetée",
      plans: {
        Starter: {
          text: "Pour une entreprise prête à automatiser la première conversation.",
          features: ["Employé IA", "Capture de leads", "Réservation Calendly", "Mises à jour CRM"],
        },
        Professional: {
          text: "Pour les équipes qui veulent suivi, audit et workflows de connaissance.",
          features: ["Tout Starter", "Suivis", "Knowledge Center", "Audit IA"],
        },
        Enterprise: {
          text: "Pour les opérateurs multi-sites et agences qui construisent une couche IA.",
          features: ["Multi-business", "Automatisation avancée", "Configuration prioritaire", "Workflows personnalisés"],
        },
      },
    },
    language: {
      title: "Langue + Région",
    },
  },
  es: {
    nav: {
      product: "Producto",
      demo: "Demo",
      solutions: "Soluciones",
      stories: "Historias",
      pricing: "Precios",
      dashboard: "Panel",
      bookStrategyCall: "Reservar llamada",
    },
    help: {
      title: "¿Necesitas ayuda?",
      detail: "Contacta soporte o reserva una llamada estratégica.",
      contactSupport: "Contactar soporte",
      bookStrategyCall: "Reservar llamada",
    },
    account: {
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      dashboard: "Panel",
    },
    hero: {
      eyebrow: "Empleado IA JOHAI",
      title: "Tu negocio sigue avanzando. JOHAI maneja el trabajo detrás.",
      subtitle:
        "Una capa operativa de IA que captura leads, responde preguntas, agenda reuniones, envía seguimientos y actualiza tu CRM mientras tu equipo atiende clientes.",
      openDashboard: "Abrir panel",
    },
    aiFlow: [
      { label: "El visitante pregunta", detail: "¿La IA puede ayudar a mi negocio a reservar más clientes?" },
      { label: "La IA escucha", detail: "JOHAI entiende intención y urgencia." },
      { label: "Conocimiento encontrado", detail: "Servicios, FAQ y políticas se conectan." },
      { label: "Registro CRM creado", detail: "El contexto del lead se guarda automáticamente." },
      { label: "Sube el score", detail: "La oportunidad se marca como alta intención." },
      { label: "Calendario sugerido", detail: "La reserva aparece solo después de calificar." },
      { label: "Email enviado", detail: "Confirmación y seguimiento preparados." },
      { label: "Dueño notificado", detail: "El equipo ve lo que importa después." },
    ],
    dashboard: {
      operatingSystem: "Sistema operativo JOHAI",
      executiveDashboard: "Panel ejecutivo",
      live: "En vivo",
      activityFeed: "Actividad en vivo",
      metrics: ["Salud del negocio", "Reservas", "Conversaciones", "Pronóstico ingresos"],
      actions: ["Urgente: llamar lead de evento", "Recomendación: subir precios", "Calendario: 3 llamadas hoy"],
      liveActions: [
        ["09:12", "Conversación recibida", "Dueño de restaurante preguntó por eventos privados"],
        ["09:13", "Conocimiento buscado", "Menú, política de eventos y precios encontrados"],
        ["09:14", "Lead calificado", "Alta intención, listo para reservar"],
        ["09:16", "Reunión reservada", "Llamada estratégica añadida al calendario"],
        ["09:17", "CRM actualizado", "Timeline, notas y próxima acción guardadas"],
      ],
    },
    industries: {
      eyebrow: "Creado para negocios reales",
      title: "Una capa IA. Cada ritmo de negocio.",
      subtitle:
        "Cambia de industria y mira cómo JOHAI adapta captura de leads, reservas y seguimientos.",
      tags: ["Lead", "Reservado", "CRM", "Seguimiento"],
      names: {
        Restaurant: "Restaurante",
        Dental: "Dental",
        Beauty: "Belleza",
        "Real Estate": "Bienes raíces",
        Legal: "Legal",
        "Home Services": "Servicios del hogar",
      },
      workflows: {
        Restaurant: "Responde preguntas del menú, captura leads de eventos y gestiona reservas.",
        Dental: "Califica solicitudes de tratamiento y guía pacientes hacia consultas.",
        Beauty: "Reserva consultas, responde preguntas de servicios y hace seguimiento amable.",
        "Real Estate": "Califica compradores, vendedores, valoraciones e intención de reunión.",
        Legal: "Enruta consultas y prepara contexto de admisión para el equipo.",
        "Home Services": "Captura reparaciones urgentes y mantiene organizado el contexto.",
      },
    },
    customers: {
      eyebrow: "Clientes",
      title: "Historias de clientes, no testimonios.",
      businesses: {
        Sarah: "Dueña de salón de belleza",
        Marcus: "Operador de restaurante",
      },
      stats: ["conversaciones respondidas", "consultas reservadas", "leads recuperados", "ahorradas este mes"],
      timeline: ["Pregunta web respondida", "Consulta reservada", "Seguimiento enviado", "CRM actualizado"],
    },
    pricing: {
      eyebrow: "Precios",
      title: "Elige la capa IA que tu negocio necesita.",
      monthly: "Mensual",
      yearly: "Anual",
      viewPlan: "Ver plan",
      start: "Empezar",
      estimatedRoi: "ROI estimado",
      projectedMonthlyValue: "Valor mensual proyectado",
      plans: {
        Starter: {
          text: "Para un negocio listo para automatizar la primera conversación.",
          features: ["Empleado IA", "Captura de leads", "Reserva Calendly", "Actualizaciones CRM"],
        },
        Professional: {
          text: "Para equipos que quieren seguimientos, auditoría y conocimiento.",
          features: ["Todo Starter", "Seguimientos", "Knowledge Center", "Auditoría IA"],
        },
        Enterprise: {
          text: "Para operadores multi-sede y agencias construyendo una capa IA.",
          features: ["Multi-negocio", "Automatización avanzada", "Setup prioritario", "Workflows personalizados"],
        },
      },
    },
    language: {
      title: "Idioma + Región",
    },
  },
  pt: {
    nav: {
      product: "Produto",
      demo: "Demo",
      solutions: "Soluções",
      stories: "Histórias",
      pricing: "Preços",
      dashboard: "Painel",
      bookStrategyCall: "Agendar chamada",
    },
    help: {
      title: "Precisa de ajuda?",
      detail: "Fale com o suporte ou agende uma chamada estratégica.",
      contactSupport: "Contatar suporte",
      bookStrategyCall: "Agendar chamada",
    },
    account: {
      signIn: "Entrar",
      createAccount: "Criar conta",
      dashboard: "Painel",
    },
    hero: {
      eyebrow: "Funcionário IA JOHAI",
      title: "Seu negócio continua avançando. JOHAI cuida do trabalho nos bastidores.",
      subtitle:
        "Uma camada operacional de IA que captura leads, responde perguntas, agenda reuniões, envia follow-ups e atualiza o CRM enquanto sua equipe atende clientes.",
      openDashboard: "Abrir painel",
    },
    aiFlow: [
      { label: "Visitante pergunta", detail: "A IA pode ajudar meu negócio a reservar mais clientes?" },
      { label: "IA ouvindo", detail: "JOHAI entende intenção e urgência." },
      { label: "Conhecimento encontrado", detail: "Serviços, FAQ e políticas são conectados." },
      { label: "Registro CRM aparece", detail: "O contexto do lead é salvo automaticamente." },
      { label: "Score aumenta", detail: "A oportunidade vira alta intenção." },
      { label: "Calendário sugerido", detail: "Reserva aparece somente após qualificação." },
      { label: "Email enviado", detail: "Confirmação e follow-up preparados." },
      { label: "Dono notificado", detail: "A equipe vê o próximo ponto importante." },
    ],
    dashboard: {
      operatingSystem: "Sistema operacional JOHAI",
      executiveDashboard: "Painel executivo",
      live: "Ao vivo",
      activityFeed: "Atividade ao vivo",
      metrics: ["Saúde do negócio", "Reservas", "Conversas", "Previsão de receita"],
      actions: ["Urgente: ligar para lead de evento", "Recomendação: enviar preços", "Calendário: 3 chamadas hoje"],
      liveActions: [
        ["09:12", "Conversa recebida", "Restaurante perguntou sobre eventos privados"],
        ["09:13", "Conhecimento buscado", "Menu, política de eventos e preços encontrados"],
        ["09:14", "Lead qualificado", "Alta intenção, pronto para reservar"],
        ["09:16", "Reunião agendada", "Chamada estratégica adicionada ao calendário"],
        ["09:17", "CRM atualizado", "Timeline, notas e próxima ação salvas"],
      ],
    },
    industries: {
      eyebrow: "Criado para negócios reais",
      title: "Uma camada IA. Cada ritmo de negócio.",
      subtitle:
        "Troque de indústria e veja JOHAI adaptar captura de leads, reservas e follow-ups.",
      tags: ["Lead", "Reservado", "CRM", "Follow-up"],
      names: {
        Restaurant: "Restaurante",
        Dental: "Clínica dental",
        Beauty: "Beleza",
        "Real Estate": "Imobiliário",
        Legal: "Jurídico",
        "Home Services": "Serviços domésticos",
      },
      workflows: {
        Restaurant: "Responde perguntas do menu, captura leads de eventos e gerencia reservas.",
        Dental: "Qualifica pedidos de tratamento e guia pacientes para consultas.",
        Beauty: "Agenda consultas, responde dúvidas de serviços e faz follow-up com cuidado.",
        "Real Estate": "Qualifica compradores, vendedores, avaliações e intenção de reunião.",
        Legal: "Encaminha pedidos de consulta e prepara contexto para a equipe.",
        "Home Services": "Captura reparos urgentes e mantém o contexto organizado.",
      },
    },
    customers: {
      eyebrow: "Clientes",
      title: "Histórias de clientes, não depoimentos.",
      businesses: {
        Sarah: "Dona de salão de beleza",
        Marcus: "Operador de restaurante",
      },
      stats: ["conversas respondidas", "consultas agendadas", "leads recuperados", "economizadas este mês"],
      timeline: ["Pergunta do site respondida", "Consulta agendada", "Follow-up enviado", "CRM atualizado"],
    },
    pricing: {
      eyebrow: "Preços",
      title: "Escolha a camada IA que seu negócio precisa.",
      monthly: "Mensal",
      yearly: "Anual",
      viewPlan: "Ver plano",
      start: "Começar",
      estimatedRoi: "ROI estimado",
      projectedMonthlyValue: "Valor mensal projetado",
      plans: {
        Starter: {
          text: "Para um negócio pronto para automatizar a primeira conversa.",
          features: ["Funcionário IA", "Captura de leads", "Reserva Calendly", "Atualizações CRM"],
        },
        Professional: {
          text: "Para equipes que querem follow-up, auditoria e conhecimento.",
          features: ["Tudo Starter", "Follow-ups", "Knowledge Center", "Auditoria IA"],
        },
        Enterprise: {
          text: "Para operadores multiunidade e agências criando uma camada IA.",
          features: ["Multi-negócio", "Automação avançada", "Setup prioritário", "Workflows personalizados"],
        },
      },
    },
    language: {
      title: "Idioma + Região",
    },
  },
  zh: {
    nav: {
      product: "产品",
      demo: "演示",
      solutions: "解决方案",
      stories: "故事",
      pricing: "价格",
      dashboard: "仪表盘",
      bookStrategyCall: "预约策略通话",
    },
    help: {
      title: "需要帮助？",
      detail: "联系支持或预约一次策略通话。",
      contactSupport: "联系支持",
      bookStrategyCall: "预约策略通话",
    },
    account: {
      signIn: "登录",
      createAccount: "创建账户",
      dashboard: "仪表盘",
    },
    hero: {
      eyebrow: "JOHAI AI 员工",
      title: "你的业务继续前进。JOHAI 处理背后的工作。",
      subtitle:
        "一个平静的 AI 运营层，在团队服务客户时自动捕获线索、回答问题、预约会议、发送跟进并更新 CRM。",
      openDashboard: "打开仪表盘",
    },
    aiFlow: [
      { label: "访客提问", detail: "AI 能帮我的业务预约更多客户吗？" },
      { label: "AI 正在倾听", detail: "JOHAI 理解意图和紧急程度。" },
      { label: "检索知识", detail: "服务、FAQ 和政策被匹配。" },
      { label: "CRM 记录出现", detail: "线索上下文自动保存。" },
      { label: "线索评分提升", detail: "机会被标记为高意向。" },
      { label: "建议日程", detail: "只有资格确认后才显示预约。" },
      { label: "邮件已发送", detail: "确认和跟进已经准备好。" },
      { label: "通知负责人", detail: "团队看到下一步重点。" },
    ],
    dashboard: {
      operatingSystem: "JOHAI 操作系统",
      executiveDashboard: "执行仪表盘",
      live: "实时",
      activityFeed: "实时活动",
      metrics: ["业务健康", "预约", "对话", "收入预测"],
      actions: ["紧急：联系活动线索", "建议：上传价格", "日历：今天 3 个电话"],
      liveActions: [
        ["09:12", "收到对话", "餐厅老板询问私人活动"],
        ["09:13", "检索知识", "菜单、活动政策和价格说明已匹配"],
        ["09:14", "线索已确认", "高意向，准备预约"],
        ["09:16", "会议已预约", "策略通话已加入日历"],
        ["09:17", "CRM 已更新", "时间线、备注和下一步已保存"],
      ],
    },
    industries: {
      eyebrow: "为真实企业打造",
      title: "一个 AI 层。适配每种业务节奏。",
      subtitle:
        "切换行业，观看 JOHAI 如何适配线索捕获、预约流程和跟进节奏。",
      tags: ["线索", "已预约", "CRM", "跟进"],
      names: {
        Restaurant: "餐厅",
        Dental: "牙科",
        Beauty: "美容",
        "Real Estate": "房地产",
        Legal: "法律",
        "Home Services": "家庭服务",
      },
      workflows: {
        Restaurant: "回答菜单问题，捕获私人活动线索并管理预约。",
        Dental: "确认治疗需求，引导患者预约咨询。",
        Beauty: "预约咨询，回答服务问题，并温和跟进。",
        "Real Estate": "确认买家、卖家、估价请求和会议意向。",
        Legal: "分流咨询请求，并为团队准备接待上下文。",
        "Home Services": "捕获紧急维修线索，并保持派单上下文清晰。",
      },
    },
    customers: {
      eyebrow: "客户",
      title: "客户故事，而不是普通评价。",
      businesses: {
        Sarah: "美容沙龙老板",
        Marcus: "餐厅经营者",
      },
      stats: ["已回答对话", "已预约咨询", "找回流失线索", "本月节省"],
      timeline: ["网站问题已回答", "咨询已预约", "跟进已发送", "CRM 已更新"],
    },
    pricing: {
      eyebrow: "价格",
      title: "选择你的业务需要的 AI 层。",
      monthly: "月付",
      yearly: "年付",
      viewPlan: "查看方案",
      start: "开始",
      estimatedRoi: "预计 ROI",
      projectedMonthlyValue: "预计月价值",
      plans: {
        Starter: {
          text: "适合准备自动化第一段客户对话的企业。",
          features: ["AI 员工", "线索捕获", "Calendly 预约", "CRM 更新"],
        },
        Professional: {
          text: "适合需要跟进、审计和知识工作流的团队。",
          features: ["包含 Starter", "自动跟进", "知识中心", "AI 审计"],
        },
        Enterprise: {
          text: "适合多地点企业和正在构建 AI 层的机构。",
          features: ["多业务管理", "高级自动化", "优先设置", "自定义工作流"],
        },
      },
    },
    language: {
      title: "语言 + 地区",
    },
  },
};

const aiFlowIcons = [
  MessageCircle,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  CalendarCheck,
  Mail,
  UsersRound,
] as const;

function roomLabel(room: Room, copy: LandingCopy) {
  if (room === "AI Employee") return copy.nav.demo;
  if (room === "Industries") return copy.nav.solutions;
  if (room === "Customers") return copy.nav.stories;
  return copy.nav.pricing;
}

const industries = [
  {
    name: "Restaurant",
    color: "from-amber-200 via-orange-100 to-white",
    // Replace later with your restaurant photo at: /public/images/photo-restaurant.jpg
    photo: "/images/photo-restaurant.jpg",
    replacement: "/public/images/photo-restaurant.jpg",
    workflow: "Answers menu questions, captures private event leads, books reservations.",
  },
  {
    name: "Dental",
    color: "from-cyan-200 via-sky-100 to-white",
    // Replace later with your dental clinic photo at: /public/images/photo-dental.jpg
    photo: "/images/photo-dental.jpg",
    replacement: "/public/images/photo-dental.jpg",
    workflow: "Qualifies treatment requests and guides patients toward consultations.",
  },
  {
    name: "Beauty",
    color: "from-rose-200 via-pink-100 to-white",
    // Replace later with your beauty salon photo at: /public/images/photo-beauty.jpg
    photo: "/images/photo-beauty.jpg",
    replacement: "/public/images/photo-beauty.jpg",
    workflow: "Books consultations, answers service questions, and follows up gently.",
  },
  {
    name: "Real Estate",
    color: "from-blue-200 via-slate-100 to-white",
    // Replace later with your real estate office photo at: /public/images/photo-real-estate.jpg
    photo: "/images/photo-real-estate.jpg",
    replacement: "/public/images/photo-real-estate.jpg",
    workflow: "Qualifies buyers, sellers, valuation requests, and meeting intent.",
  },
  {
    name: "Legal",
    color: "from-stone-200 via-zinc-100 to-white",
    // Replace later with your law office photo at: /public/images/photo-legal.jpg
    photo: "/images/photo-legal.jpg",
    replacement: "/public/images/photo-legal.jpg",
    workflow: "Routes consultation requests and prepares intake context for the team.",
  },
  {
    name: "Home Services",
    color: "from-emerald-200 via-teal-100 to-white",
    // Replace later with your home services photo at: /public/images/photo-home-services.jpg
    photo: "/images/photo-home-services.jpg",
    replacement: "/public/images/photo-home-services.jpg",
    workflow: "Captures urgent repair leads and keeps dispatch context organized.",
  },
];

const customerStories = [
  {
    name: "Sarah",
    business: "Beauty salon owner",
    photo: "/images/photo-customer-sarah.jpg",
    replacement: "/public/images/photo-customer-sarah.jpg",
    stats: [
      ["284", "conversations answered"],
      ["41", "consultations booked"],
      ["18", "missed leads recovered"],
      ["21h", "saved this month"],
    ],
    timeline: ["Website question answered", "Consultation booked", "Follow-up sent", "CRM updated"],
  },
  {
    name: "Marcus",
    business: "Restaurant operator",
    photo: "/images/photo-customer-marcus.jpg",
    replacement: "/public/images/photo-customer-marcus.jpg",
    stats: [
      ["196", "guest questions answered"],
      ["33", "events captured"],
      ["27", "reservations influenced"],
      ["16h", "saved this month"],
    ],
    timeline: ["Menu question answered", "Private event lead scored", "Owner notified", "Follow-up scheduled"],
  },
];

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: 299,
    text: "For one business ready to automate the first conversation.",
    features: ["AI Employee", "Lead capture", "Calendly booking", "CRM updates"],
  },
  {
    name: "Professional",
    slug: "professional",
    price: 699,
    text: "For teams that want follow-up, audit, and knowledge workflows.",
    features: ["Everything in Starter", "Follow-ups", "Knowledge Center", "AI Audit"],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: 1499,
    text: "For multi-location operators and agencies building an AI layer.",
    features: ["Multi-business", "Advanced automation", "Priority setup", "Custom workflows"],
  },
];

function Counter({ value }: { value: string }) {
  const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!numeric) return;
    const controls = animate(0, numeric, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [numeric]);

  return (
    <span>
      {current}
      {suffix}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full px-5 py-3 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-2xl shadow-slate-900/18"
          : "border border-white/70 bg-white/68 text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-xl hover:bg-white hover:shadow-xl hover:shadow-slate-900/8"
      }`}
    >
      {children}
    </motion.button>
  );
}

function PhotoStage({
  src,
  alt,
  replacement,
  priority,
}: {
  src: string;
  alt: string;
  replacement: string;
  priority?: boolean;
}) {
  return (
    <div
      data-replacement={replacement}
      className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/60 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl"
    >
      {/* Replace this premium photo placeholder by dropping your JPG at: {replacement} */}
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1100}
        priority={priority}
        className="h-[58vh] min-h-[420px] w-full rounded-[2.45rem] object-cover"
      />
      <div className="absolute inset-3 rounded-[2.45rem] bg-gradient-to-t from-slate-950/35 via-transparent to-white/15" />
    </div>
  );
}

function IndustryImageStage({
  industry,
  copy,
}: {
  industry: (typeof industries)[number];
  copy: LandingCopy;
}) {
  const displayName = copy.industries.names[industry.name] ?? industry.name;
  const workflow = copy.industries.workflows[industry.name] ?? industry.workflow;

  return (
    <div
      data-replacement={industry.replacement}
      className="relative min-h-[560px] overflow-hidden rounded-[2.4rem] border border-white/70 bg-slate-950 shadow-[0_34px_90px_rgba(15,23,42,0.2)] sm:rounded-[3.2rem]"
    >
      {/* Replace this cinematic background image by dropping your JPG at: {industry.replacement} */}
      <motion.div
        key={industry.photo}
        initial={{ opacity: 0, scale: 1.08, y: 18 }}
        animate={{ opacity: 1, scale: 1.02, y: 0 }}
        exit={{ opacity: 0, scale: 1.12, y: -12 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={industry.photo}
          alt={`${industry.name} business using JOHAI`}
          width={1800}
          height={1200}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-slate-950/12 to-slate-950/62" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.32),transparent_26%)]" />

      <motion.div
        key={`${industry.name}-card`}
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="absolute bottom-5 left-5 right-5 rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl sm:bottom-8 sm:left-8 sm:right-8 sm:p-7"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">
              {displayName}
            </p>
            <p className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              {workflow}
            </p>
          </div>
          <div className="grid min-w-44 grid-cols-2 gap-2">
            {copy.industries.tags.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-center text-xs font-bold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AiEmployeeRoom({ copy }: { copy: LandingCopy }) {
  const [step, setStep] = useState(0);
  const aiFlow = copy.aiFlow.map((item, index) => ({
    ...item,
    icon: aiFlowIcons[index],
  }));

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % aiFlow.length);
    }, 1700);
    return () => window.clearInterval(id);
  }, [aiFlow.length]);

  const active = aiFlow[step];
  const ActiveIcon = active.icon;

  return (
    <RoomShell tone="from-cyan-100 via-white to-orange-50">
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <motion.div
          initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{copy.hero.eyebrow}</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
            {copy.hero.title}
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            {copy.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/executive-dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20">
              <ArrowRight size={17} />
              {copy.hero.openDashboard}
            </Link>
            <CalendlyBookingButton
              label={copy.nav.bookStrategyCall}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:bg-white"
            />
          </div>
        </motion.div>

        <ExecutiveDashboardMock active={active} ActiveIcon={ActiveIcon} step={step} copy={copy} />
      </div>
    </RoomShell>
  );
}

function ExecutiveDashboardMock({
  active,
  ActiveIcon,
  step,
  copy,
}: {
  active: LandingCopy["aiFlow"][number] & { icon: (typeof aiFlowIcons)[number] };
  ActiveIcon: (typeof aiFlowIcons)[number];
  step: number;
  copy: LandingCopy;
}) {
  return (
    <div className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/70 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(251,191,36,0.14),transparent_26%)]" />
      <div className="relative rounded-[2.4rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/20">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{copy.dashboard.operatingSystem}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.dashboard.executiveDashboard}</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            {copy.dashboard.live}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            [copy.dashboard.metrics[0], "92%", BarChart3],
            [copy.dashboard.metrics[1], "14", CalendarCheck],
            [copy.dashboard.metrics[2], "38", MessageCircle],
            [copy.dashboard.metrics[3], "$18k", TrendingUp],
          ].map(([label, value, Icon]) => (
            <motion.div
              key={label as string}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <Icon className="text-cyan-200" size={18} />
              <p className="mt-3 text-2xl font-semibold">{value as string}</p>
              <p className="mt-1 text-xs text-slate-400">{label as string}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
                <ActiveIcon size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">{active.label}</p>
                <p className="mt-1 text-sm text-slate-300">{active.detail}</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-cyan-300"
                animate={{ width: `${((step + 1) / copy.aiFlow.length) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{copy.dashboard.activityFeed}</p>
            <div className="space-y-2">
              {copy.dashboard.liveActions.slice(0, 5).map(([time, title, detail], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex gap-3 rounded-xl bg-slate-900/70 p-3"
                >
                  <span className="text-xs font-bold text-cyan-200">{time}</span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {copy.dashboard.actions.map((item) => (
            <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm text-cyan-50">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustriesRoom({ copy }: { copy: LandingCopy }) {
  const [active, setActive] = useState(0);
  const industry = industries[active];

  return (
    <RoomShell tone={industry.color}>
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.76fr_1.24fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{copy.industries.eyebrow}</p>
          <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
            {copy.industries.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {copy.industries.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {industries.map((item, index) => (
              <ActionButton key={item.name} active={index === active} onClick={() => setActive(index)}>
                {copy.industries.names[item.name] ?? item.name}
              </ActionButton>
            ))}
          </div>
        </div>

        <motion.div
          key={industry.name}
          initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <IndustryImageStage industry={industry} copy={copy} />
        </motion.div>
      </div>
    </RoomShell>
  );
}

function CustomersRoom({ copy }: { copy: LandingCopy }) {
  const [active, setActive] = useState(0);
  const story = customerStories[active];
  const business = copy.customers.businesses[story.name] ?? story.business;

  return (
    <RoomShell tone="from-rose-50 via-white to-cyan-50">
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{copy.customers.eyebrow}</p>
          <h2 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
            {copy.customers.title}
          </h2>
          <div className="mt-8 flex gap-2">
            {customerStories.map((item, index) => (
              <ActionButton key={item.name} active={index === active} onClick={() => setActive(index)}>
                {item.name}
              </ActionButton>
            ))}
          </div>
        </div>

        <motion.div
          key={story.name}
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <PhotoStage src={story.photo} alt={`${story.name} JOHAI customer story`} replacement={story.replacement} />
          <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">
              {story.name} - {business}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {story.stats.map(([value], index) => (
                <div key={`${story.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-2xl font-semibold text-slate-950">
                    <Counter value={value} />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{copy.customers.stats[index]}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.customers.timeline.map((item) => (
                <span key={item} className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </RoomShell>
  );
}

function PricingRoom({ copy }: { copy: LandingCopy }) {
  const [yearly, setYearly] = useState(false);
  const [expanded, setExpanded] = useState("Professional");
  const multiplier = yearly ? 10 : 1;
  const roi = yearly ? "$18k+" : "$1.8k+";

  return (
    <RoomShell tone="from-slate-50 via-white to-cyan-50">
      <div className="min-h-[calc(100vh-9rem)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">{copy.pricing.eyebrow}</p>
            <h2 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
              {copy.pricing.title}
            </h2>
          </div>
          <div className="flex rounded-full border border-white/70 bg-white/70 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <ActionButton active={!yearly} onClick={() => setYearly(false)}>{copy.pricing.monthly}</ActionButton>
            <ActionButton active={yearly} onClick={() => setYearly(true)}>{copy.pricing.yearly}</ActionButton>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const active = expanded === plan.name;
            const planCopy = copy.pricing.plans[plan.name as keyof typeof copy.pricing.plans];
            return (
              <motion.div
                key={plan.name}
                layout
                onClick={() => setExpanded(plan.name)}
                whileHover={{ y: -8 }}
                className={`cursor-pointer rounded-[2rem] border p-6 text-left shadow-2xl backdrop-blur-2xl transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-slate-900/25"
                    : "border-white/70 bg-white/70 text-slate-950 shadow-slate-900/8"
                }`}
              >
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="mt-5 text-5xl font-semibold">${plan.price * multiplier}</p>
                <p className={`mt-4 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}>{planCopy.text}</p>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-3 overflow-hidden"
                    >
                      {planCopy.features.map((feature) => (
                        <p key={feature} className="flex items-center gap-2 text-sm">
                          <Check size={15} className="text-cyan-300" />
                          {feature}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/pricing/${plan.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      active ? "bg-white text-slate-950" : "bg-slate-950 text-white"
                    }`}
                  >
                    {copy.pricing.viewPlan}
                  </Link>
                  <Link
                    href={`/pricing/${plan.slug}#checkout`}
                    onClick={(event) => event.stopPropagation()}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${
                      active ? "border-white/20 text-white" : "border-slate-200 text-slate-800"
                    }`}
                  >
                    {copy.pricing.start}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">{copy.pricing.estimatedRoi}</p>
              <p className="mt-2 text-3xl font-semibold">{copy.pricing.projectedMonthlyValue}: {roi}</p>
            </div>
            <CalendlyBookingButton
              label={copy.nav.bookStrategyCall}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
            />
          </div>
        </div>
      </div>
    </RoomShell>
  );
}

function RoomShell({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <motion.section
      key={tone}
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -28, filter: "blur(12px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${tone} px-5 pb-12 pt-28 sm:pt-32 lg:px-8`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(125,211,252,0.34),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(253,186,116,0.28),transparent_28%)]" />
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

const localeOptions: Array<{
  label: string;
  region: string;
  language: Language;
}> = [
  { label: "English", region: "United States", language: "en" },
  { label: "French", region: "France", language: "fr" },
  { label: "French", region: "Canada", language: "fr" },
  { label: "Spanish", region: "United States", language: "es" },
  { label: "Spanish", region: "Latin America", language: "es" },
  { label: "Portuguese", region: "Brazil", language: "pt" },
  { label: "Chinese", region: "Global", language: "zh" },
];

function HeaderIconMenu({
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={onToggle}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/76 text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10 ${
          open ? "bg-white text-cyan-700" : ""
        }`}
      >
        {icon}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/70 bg-white/92 p-3 shadow-2xl shadow-slate-900/14 backdrop-blur-2xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [room, setRoom] = useState<Room>("AI Employee");
  const [openMenu, setOpenMenu] = useState<"help" | "language" | "account" | null>(null);
  const [selectedLocale, setSelectedLocale] = useState(localeOptions[0]);
  const copy = landingCopy[selectedLocale.language];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedLocale = window.localStorage.getItem(landingLocaleStorageKey);

      if (!storedLocale) return;

      const locale = localeOptions.find(
        (option) => `${option.language}:${option.region}` === storedLocale
      );

      if (locale) {
        setSelectedLocale(locale);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function chooseLocale(locale: (typeof localeOptions)[number]) {
    setSelectedLocale(locale);
    window.localStorage.setItem(
      landingLocaleStorageKey,
      `${locale.language}:${locale.region}`
    );
    setOpenMenu(null);
  }

  return (
    <main id="experience" className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button
            type="button"
            onClick={() => setRoom("AI Employee")}
            className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-lg shadow-slate-900/5 backdrop-blur-2xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
              <Sparkles size={18} />
            </span>
            <span className="text-sm font-semibold">JOHAI</span>
          </button>
          <div className="hidden rounded-full border border-white/70 bg-white/72 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-2xl md:flex">
            <Link
              href="/product"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            >
              {copy.nav.product}
            </Link>
            {rooms.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRoom(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  room === item ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white"
                }`}
              >
                {roomLabel(item, copy)}
              </button>
            ))}
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            >
              {copy.nav.dashboard}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <HeaderIconMenu
                label="Help"
                icon={<HelpCircle size={18} />}
                open={openMenu === "help"}
                onToggle={() => setOpenMenu((current) => (current === "help" ? null : "help"))}
              >
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-700">
                  {copy.help.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.help.detail}
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="mailto:support@johai.ai"
                    onClick={() => setOpenMenu(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    {copy.help.contactSupport}
                  </Link>
                  <CalendlyBookingButton
                    label={copy.help.bookStrategyCall}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  />
                </div>
              </HeaderIconMenu>

              <HeaderIconMenu
                label="Language and region"
                icon={<Globe2 size={18} />}
                open={openMenu === "language"}
                onToggle={() => setOpenMenu((current) => (current === "language" ? null : "language"))}
              >
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  {copy.language.title}
                </p>
                <p className="mx-2 mb-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                  {selectedLocale.label} - {selectedLocale.region}
                </p>
                <div className="max-h-80 overflow-y-auto">
                  {localeOptions.map((option) => {
                    const active =
                      option.label === selectedLocale.label &&
                      option.region === selectedLocale.region;

                    return (
                      <button
                        key={`${option.label}-${option.region}`}
                        type="button"
                        onClick={() => chooseLocale(option)}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100"
                      >
                        <span>
                          <span className="block text-sm font-bold text-slate-900">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                            {option.region}
                          </span>
                        </span>
                        {active && <CheckCircle2 size={17} className="text-cyan-700" />}
                      </button>
                    );
                  })}
                </div>
              </HeaderIconMenu>

              <HeaderIconMenu
                label="Account"
                icon={<UserRound size={18} />}
                open={openMenu === "account"}
                onToggle={() => setOpenMenu((current) => (current === "account" ? null : "account"))}
              >
                <div className="grid gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setOpenMenu(null)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    {copy.account.signIn}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setOpenMenu(null)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    {copy.account.createAccount}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpenMenu(null)}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {copy.account.dashboard}
                  </Link>
                </div>
              </HeaderIconMenu>
            </div>
            <CalendlyBookingButton
              label={copy.nav.bookStrategyCall}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl shadow-slate-900/16 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-900/24 sm:px-5 sm:text-sm"
            />
          </div>
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {room === "AI Employee" && <AiEmployeeRoom key="ai" copy={copy} />}
        {room === "Industries" && <IndustriesRoom key="industries" copy={copy} />}
        {room === "Customers" && <CustomersRoom key="customers" copy={copy} />}
        {room === "Pricing" && <PricingRoom key="pricing" copy={copy} />}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:hidden">
        {rooms.map((item) => (
          <button
            key={`mobile-${item}`}
            type="button"
            onClick={() => setRoom(item)}
            className={`rounded-full px-3 py-2 text-xs font-bold ${
              room === item ? "bg-slate-950 text-white" : "text-slate-700"
            }`}
          >
            {roomLabel(item, copy).split(" ")[0]}
          </button>
        ))}
      </div>

      <FloatingChat />
    </main>
  );
}
