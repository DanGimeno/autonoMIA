export type Locale = 'es' | 'ca'

export type Translations = {
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    back: string
    loading: string
    saving: string
    deleting: string
    noResults: string
    confirm: string
    retry: string
    search: string
    filter: string
    all: string
    yes: string
    no: string
    hours: string
    total: string
    actions: string
  }
  nav: {
    dashboard: string
    projects: string
    workLogs: string
    invoices: string
    taxTasks: string
    settings: string
    docs: string
    signOut: string
    skipToContent: string
    mainNav: string
  }
  auth: {
    login: string
    signup: string
    email: string
    password: string
    confirmPassword: string
    loginTitle: string
    signupTitle: string
    noAccount: string
    hasAccount: string
    loggingIn: string
    signingUp: string
    signupSuccess: string
    passwordMinLength: string
    passwordMismatch: string
  }
  dashboard: {
    title: string
    subtitle: string
    activeProjects: string
    pendingInvoices: string
    collectedInvoices: string
    pendingTaxTasks: string
    overdue: string
    upcomingTaxTasks: string
    recentActivity: string
    viewAll: string
    noWorkLogs: string
    noPendingTasks: string
    noProject: string
  }
  projects: {
    title: string
    newProject: string
    editProject: string
    name: string
    client: string
    description: string
    status: string
    hourlyRate: string
    active: string
    paused: string
    completed: string
    noProjects: string
    createFirst: string
    deleteConfirm: string
  }
  workLogs: {
    title: string
    subtitle: string
    addHours: string
    editLog: string
    project: string
    noProject: string
    hoursLabel: string
    notes: string
    totalThisMonth: string
    hoursPerDay: string
    noLogs: string
    deleteConfirm: string
    prevMonth: string
    nextMonth: string
    hoursGreaterThanZero: string
    clickToEdit: string
  }
  invoices: {
    title: string
    newInvoice: string
    editInvoice: string
    invoiceNumber: string
    concept: string
    project: string
    noProject: string
    issueDate: string
    dueDate: string
    baseAmount: string
    vatPercent: string
    irpfPercent: string
    totalAmount: string
    status: string
    draft: string
    issued: string
    collected: string
    overdue: string
    sentToClient: string
    notes: string
    markCollected: string
    totalPending: string
    noInvoices: string
    createFirst: string
    deleteConfirm: string
  }
  taxTasks: {
    title: string
    newTask: string
    editTask: string
    taskTitle: string
    dueDate: string
    category: string
    status: string
    pending: string
    done: string
    overdue: string
    cuotaAutonomo: string
    other: string
    pendingTasks: string
    completedTasks: string
    noTasks: string
    createFirst: string
    deleteConfirm: string
  }
  settings: {
    title: string
    personalData: string
    taxSettings: string
    fullName: string
    nif: string
    address: string
    defaultVat: string
    defaultIrpf: string
    email: string
    saved: string
    language: string
    theme: string
    lightMode: string
    darkMode: string
    systemMode: string
  }
  notifications: {
    title: string
    noNotifications: string
    markAllRead: string
    overdueInvoice: string
    upcomingTaxTask: string
    today: string
    yesterday: string
  }
  errors: {
    somethingWentWrong: string
    unexpectedError: string
    goToDashboard: string
  }
  months: readonly string[]
  days: readonly string[]
}

export const DEFAULT_LOCALE: Locale = 'es'

export const SUPPORTED_LOCALES: Locale[] = ['es', 'ca']

export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Castellano',
  ca: 'Català',
}
