import prisma from "@/lib/prisma";

interface ClientProjectInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  budget?: number | null;
  paid: number;
  stages?: { name: string; status: string }[];
  contractDate?: string | null;
}

export async function getAssistantResponse(
  userText: string,
  sessionUser?: {
    name?: string | null;
    company?: string | null;
    userId?: string | null;
    email?: string | null;
    projects?: ClientProjectInfo[];
  }
): Promise<string> {
  const text = (userText || "").toLowerCase();
  const userName = sessionUser?.name || "عزيزي العميل";
  const userCompany = sessionUser?.company || "شركتكم الموقرة";

  // Fetch client projects specifically if not provided
  let userProjects: ClientProjectInfo[] = sessionUser?.projects || [];

  if (!userProjects || userProjects.length === 0) {
    try {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            ...(sessionUser?.userId ? [{ userId: sessionUser.userId }] : []),
            ...(sessionUser?.email ? [{ email: sessionUser.email }] : []),
          ],
        },
        include: {
          projects: {
            include: {
              stages: { orderBy: { order: "asc" } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (client?.projects) {
        userProjects = client.projects;
      }
    } catch (e) {
      console.error("Assistant data retrieval error:", e);
    }
  }

  // Financial calculations for this client
  const totalBudget = userProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalPaid = userProjects.reduce((acc, p) => acc + (p.paid || 0), 0);
  const totalRemaining = Math.max(0, totalBudget - totalPaid);

  // Status mapping to Arabic
  const statusLabels: Record<string, string> = {
    requested: "طلب جديد (قيد المراجعة)",
    in_review: "قيد المراجعة والدراسة",
    in_progress: "قيد التطوير والتنفيذ",
    completed: "مكتمل وتم التسليم",
  };

  // Queries about existing projects & progress
  if (
    text.includes("project") ||
    text.includes("progress") ||
    text.includes("status") ||
    text.includes("مشروع") ||
    text.includes("مشاريع") ||
    text.includes("تطور") ||
    text.includes("تقدم") ||
    text.includes("إنجاز")
  ) {
    if (userProjects.length === 0) {
      return `مرحباً بك يا ${userName}. لا توجد أي من المشاريع (Projects) النشطة المسجلة حالياً في حسابك الخاص بـ ${userCompany}. يمكنك البدء فوراً بطلب مشروع جديد بالضغط على زر "New" أو "طلب مشروع جديد" في القائمة الجانبية وإدخال كافة المتطلبات والمواصفات!`;
    }

    const listStr = userProjects
      .map((p) => {
        const currentStage = p.stages?.find((s) => s.status === "current")?.name || (p.progress === 100 ? "مكتمل" : "مرحلة البداية");
        const statusAr = statusLabels[p.status] || p.status;
        return `• **${p.name}**\n  - الحالة: ${statusAr}\n  - نسبة التطور: ${p.progress}%\n  - المرحلة الحالية: ${currentStage}`;
      })
      .join("\n\n");

    return `أهلاً بك يا ${userName}، إليك تقرير حالة مشاريعك الحالية الخاصة بـ ${userCompany}:\n\n${listStr}\n\nيمكنك الانتقال لقسم المشاريع من القائمة للاطلاع على تفاصيل كل مرحلة وتصدير كشف الحساب المالي PDF!`;
  }

  // Queries about prices, payments, invoices, remaining balance
  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("payment") ||
    text.includes("paid") ||
    text.includes("remaining") ||
    text.includes("balance") ||
    text.includes("سعر") ||
    text.includes("تكلفة") ||
    text.includes("دفع") ||
    text.includes("سداد") ||
    text.includes("فلوس") ||
    text.includes("حساب") ||
    text.includes("متبقي") ||
    text.includes("فاتورة")
  ) {
    if (userProjects.length === 0) {
      return `يتم تسعير كل مشروع بدقة وفقاً للمتطلبات والمواصفات الفنية بعد دراسة طلب المشروع. يمكنك تقديم طلبك الجديد وسيوافيك فريقنا بعرض سعر مفصل. طرق الدفع المعتمدة تشمل التحويل البنكي، InstaPay، وفودافون كاش.`;
    }

    return `الموقف المالي لمشاريعك في ${userCompany}:\n• إجمالي قيمة المشاريع: **${totalBudget.toLocaleString("ar-EG")} ج.م**\n• إجمالي المبالغ المسددة: **${totalPaid.toLocaleString("ar-EG")} ج.م**\n• المتبقي المستحق: **${totalRemaining.toLocaleString("ar-EG")} ج.م**\n\nكما يمكنك تصدير كشف حساب مالي دقيق بصيغة PDF لأي مشروع مباشرة من صفحة تفاصيل المشروع. وسائل الدفع المعتمدة: InstaPay، تحويل بنكي، وفودافون كاش.`;
  }

  // Queries about requesting or adding a new project
  if (
    text.includes("طلب مشروع") ||
    text.includes("مشروع جديد") ||
    text.includes("ابدا مشروع") ||
    text.includes("ابدأ") ||
    text.includes("create project") ||
    text.includes("new project") ||
    text.includes("request")
  ) {
    return `يمكنك طلب مشروع جديد بكل سهولة من خلال الضغط على زر (+ New / طلب مشروع جديد) في القائمة الجانبية. قم بتحديد نوع المشروع (موقع ويب، تطبيق موبايل، نظام أتمتة، أو ديسكتوب ERP)، واكتب وصفاً شاملاً للمتطلبات والميزانية والموعد المتوقع. سيظهر الطلب مباشرة في حسابك بحالة "قيد المراجعة" وسيقوم مهندسونا بدراسته فوراً.`;
  }

  // Queries about website
  if (text.includes("website") || text.includes("web") || text.includes("store") || text.includes("موقع")) {
    return `فريق Moemen Team متخصص في تطوير مواقع الويب والمتاجر الإلكترونية المتطورة لشركة ${userCompany}. هل ترغب في موقع تعريفي للشركة، أم منصة تجارة إلكترونية متكاملة مع بوابات دفع إلكتروني وحجز مواعيد؟ يمكنك تقديم طلب المشروع في أي وقت لمناقشة التفاصيل.`;
  }

  // Queries about mobile apps
  if (text.includes("mobile") || text.includes("app") || text.includes("ios") || text.includes("android") || text.includes("تطبيق")) {
    return `تطبيقات الموبايل من أهم ركائز التحول الرقمي. نبني تطبيقات Native و Cross-platform تعمل بكفاءة عالية على iOS و Android مع دعم الإشعارات اللحظية وحسابات المستخدمين وبوابات الدفع. هل التطبيق مخصص للعملاء أم لإدارة الفروع والموظفين؟`;
  }

  // Queries about automation
  if (text.includes("automation") || text.includes("workflow") || text.includes("integration") || text.includes("اتمتة") || text.includes("أتمتة")) {
    return `أنظمة الأتمتة توفر مئات الساعات شهرياً؛ نربط مسارات عملك مع واتساب، أنظمة تتبع الشحنات والسيارات، ومزامنة المخزون وتنبيهات الدفع اللحظية. ما هي العمليات اليدوية الأكثر استهلاكاً لوقت فريقك حالياً؟`;
  }

  // Queries about desktop / ERP
  if (text.includes("desktop") || text.includes("erp") || text.includes("pos") || text.includes("hardware") || text.includes("برنامج") || text.includes("ديسكتوب")) {
    return `نطور برامج سطح مكتب قوية مخصصة لإدارة الشركات والمخازن ونقاط البيع (POS)، مع دعم العمل بدون إنترنت والربط المباشر مع طابعات الفواتير الحرارية وأجهزة الباركود. هل تبحث عن إدارة مخزون متعدد الفروع أم برنامج مالي متكامل؟`;
  }

  // Greetings
  if (text.includes("مرحب") || text.includes("اهلا") || text.includes("أهلا") || text.includes("hello") || text.includes("hi")) {
    return `أهلاً بك يا ${userName}! يسعدنا تواجدك في منصة Moemen Team. أنا المساعد الذكي الخاص بك، ويمكنني إفادتك بحالة مشاريعك الخاصة بـ ${userCompany}، نسب الإنجاز، الدفعات المالية، أو مساعدتك في صياغة وطلب مشروعك القادم. كيف يمكنني مساعدتك اليوم؟`;
  }

  // Default response
  return `أنا هنا لمساعدتك في كل ما يتعلق بمشاريعك الرقمية مع Moemen Team. يمكنك سؤالي عن: نسبة إنجاز مشاريعك الحالية، الموقف المالي وسجل الدفعات، أو كيفية تقديم طلب مشروع جديد في أي وقت!`;
}
