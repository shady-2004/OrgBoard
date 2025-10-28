// Arabic translations for the entire application
export const translations = {
  // Common
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    import: 'استيراد',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'خطأ',
    success: 'نجح',
    confirm: 'تأكيد',
    close: 'إغلاق',
    previous: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    of: 'من',
    showing: 'عرض',
    total: 'إجمالي',
    actions: 'الإجراءات',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب جديد',
    signingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    signInToAccount: 'تسجيل الدخول إلى حسابك',
    createYourAccount: 'إنشاء حسابك الجديد',
    enterEmail: 'أدخل بريدك الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    confirmYourPassword: 'أكد كلمة المرور',
    loginFailed: 'فشل تسجيل الدخول',
    registrationFailed: 'فشل إنشاء الحساب',
    passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
  },

  // Navigation
  nav: {
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    organizations: 'المنظمات',
    employees: 'الموظفون',
    dailyOperations: 'العمليات اليومية',
    officeOperations: 'عمليات المكتب',
    saudization: 'السعودة',
    settings: 'الإعدادات',
    welcome: 'مرحباً',
    user: 'مستخدم',
  },

  // Dashboard
  dashboard: {
    title: 'لوحة التحكم',
    subtitle: 'مرحباً بك في نظام إدارة المنظمات',
    totalOrganizations: 'إجمالي المنظمات',
    dailyOperations: 'العمليات اليومية',
    officeOperations: 'عمليات المكتب',
    activeUsers: 'المستخدمون النشطون',
    recentActivities: 'الأنشطة الأخيرة',
    noRecentActivities: 'لا توجد أنشطة حديثة',
  },

  // Organizations
  organizations: {
    title: 'المنظمات',
    subtitle: 'إدارة منظماتك',
    addOrganization: '+ إضافة منظمة',
    ownerName: 'اسم المالك',
    nationalId: 'الهوية الوطنية',
    commercialRecord: 'السجل التجاري',
    commercialRecordNumber: 'رقم السجل التجاري',
    commercialRecordDate: 'تاريخ السجل التجاري',
    sponsorAmount: 'مبلغ الكفيل السنوي (ريال)',
    transferredAmount: 'المبلغ المحول للكفيل',
    absherCode: 'كود أبشر',
    birthDate: 'تاريخ الميلاد',
    qawiSubscriptionDate: 'تاريخ انتهاء اشتراك قوى',
    absherSubscriptionDate: 'تاريخ انتهاء اشتراك أبشر',
    actions: 'الإجراءات',
    noOrganizations: 'لا توجد منظمات',
    loadingOrganizations: 'جاري تحميل المنظمات...',
    errorLoading: 'خطأ في تحميل المنظمات',
    sar: 'ريال',
  },

  // Users
  users: {
    title: 'المستخدمون',
    subtitle: 'إدارة مستخدمي النظام',
    addUser: '+ إضافة مستخدم',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    status: 'الحالة',
    actions: 'الإجراءات',
    noUsers: 'لا يوجد مستخدمون',
  },

  // Daily Operations
  dailyOperations: {
    title: 'العمليات اليومية',
    subtitle: 'إدارة العمليات اليومية',
    addOperation: '+ إضافة عملية',
    date: 'التاريخ',
    type: 'النوع',
    description: 'الوصف',
    amount: 'المبلغ',
    status: 'الحالة',
    actions: 'الإجراءات',
    noOperations: 'لا توجد عمليات',
  },

  // Office Operations
  officeOperations: {
    title: 'عمليات المكتب',
    subtitle: 'إدارة عمليات المكتب',
    addOperation: '+ إضافة عملية',
    noOperations: 'لا توجد عمليات',
  },

  // Saudization
  saudization: {
    title: 'السعودة',
    subtitle: 'إدارة السعودة',
    noData: 'لا توجد بيانات',
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    subtitle: 'إدارة إعدادات النظام',
    general: 'عام',
    profile: 'الملف الشخصي',
    security: 'الأمان',
    notifications: 'الإشعارات',
  },

  // Form Labels
  form: {
    required: 'مطلوب',
    optional: 'اختياري',
    select: 'اختر',
    selectOption: 'اختر خياراً',
    uploadFile: 'رفع ملف',
    dragAndDrop: 'اسحب وأفلت الملف هنا',
  },

  // Messages
  messages: {
    savedSuccessfully: 'تم الحفظ بنجاح',
    deletedSuccessfully: 'تم الحذف بنجاح',
    updatedSuccessfully: 'تم التحديث بنجاح',
    errorOccurred: 'حدث خطأ',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    noDataAvailable: 'لا توجد بيانات متاحة',
  },
};

// Helper function to get translation
export const t = (key) => {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) return key;
  }
  
  return value || key;
};
