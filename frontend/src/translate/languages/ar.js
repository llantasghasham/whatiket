/**
 * العربية (لبنان) - Lebanese Arabic / Modern Standard Arabic
 * RTL: the app should set dir="rtl" on document when this language is active.
 */
const messages = {
	ar: {
		translations: {
			layout: {
				menu: {
					painel: "لوحة التحكم",
					inbox: "الوارد",
					conversas: "المحادثات",
					chamadas: "المكالمات",
					kanban: "كانبان",
					funil: "المسار",
					etiquetas: "الوسوم",
					consultas: "الاستعلامات",
					usuarios: "المستخدمون",
					contatos: "جهات الاتصال",
					leads: "العملاء المحتملون",
					clientes: "العملاء",
					automacao: "الأتمتة",
					produtividade: "الإنتاجية",
					ajuda: "المساعدة",
					configuracoes: "الإعدادات",
					sistema: "النظام",
					dashboard: "لوحة التحكم",
					relatorios: "التقارير",
					dados: "البيانات",
					dividasCredito: "الديون والائتمان",
					juridico: "القانوني",
					veiculo: "المركبة",
					agenteIA: "وكيل الذكاء الاصطناعي",
					construtorFluxo: "منشئ سير العمل",
					disparos: "الإرسال",
					campanhas: "الحملات",
					respostasRapidas: "الردود السريعة",
					integracoes: "التكاملات",
					ferramentas: "الأدوات",
					produtos: "المنتجات",
					catalogo: "الكتالوج",
					servicos: "الخدمات",
					ordensServico: "أوامر الخدمة",
					agenda: "الجدول",
					projetos: "المشاريع",
					documentacao: "التوثيق",
					canais: "القنوات",
					departamentos: "الأقسام",
					pagamentos: "المدفوعات",
					faturas: "الفواتير",
					contasPagar: "الحسابات الدائنة",
					listaContatos: "قائمة جهات الاتصال",
					importarContatos: "استيراد جهات الاتصال",
					automacoes: "الأتمتة",
					financeiro: "المالية",
					lembretes: "التذكيرات",
					meuPainelAfiliado: "لوحة الشركاء",
					afiliados: "الشركاء",
					cupons: "الكوبونات",
					comissoes: "عمولات",
					saques: "السحوبات",
					banners: "اللافتات",
					videoTutorial: "فيديو تعليمي",
					traducoes: "الترجمات",
					whitelabel: "العلامة البيضاء",
					empresas: "الشركات",
					planos: "الخطط",
				},
				searchPlaceholder: "البحث في المحادثات...",
				searchModalTitle: "البحث في المحادثات",
				searchModalPlaceholder: "الاسم أو الرقم أو الرسالة...",
			},
			atendimentos: {
				title: "الدعم",
				selectMessage: "اختر تذكرة لعرض المحادثة",
				startNew: "أو ابدأ تذكرة جديدة",
				noTickets: "لا توجد تذاكر",
				tabs: {
					automation: "أتمتة",
					pending: "في الانتظار",
					attending: "قيد المعالجة",
					closed: "مغلقة",
					closedLabel: "مغلقة",
					groups: "المجموعات",
				},
				statusLabels: {
					pending: "في الانتظار",
					open: "قيد المعالجة",
					closed: "مغلقة",
				},
				tooltips: {
					verFinalizados: "عرض المغلق",
					clienteAguardando: "العميل ينتظر",
					atendenteAguardando: "الموظف ينتظر",
				},
			},
			signup: {
				title: "إنشاء حساب",
				toasts: {
					success: "تم إنشاء المستخدم بنجاح! يرجى تسجيل الدخول.",
					fail: "خطأ في إنشاء المستخدم. تحقق من البيانات.",
				},
				form: {
					name: "الاسم",
					email: "البريد الإلكتروني",
					password: "كلمة المرور",
				},
				buttons: {
					submit: "تسجيل",
					login: "لديك حساب؟ سجّل الدخول",
				},
			},
			empresaSignup: {
				title: "تسجيل الشركة",
				form: {
					companyName: "اسم الشركة",
					fullName: "اسمك الكامل",
					email: "أفضل بريدك الإلكتروني",
					password: "أنشئ كلمة مرور آمنة",
					confirmPassword: "أكد كلمة المرور",
					phone: "أدخل رقم هاتفك",
					document: "الهوية أو الرقم الضريبي",
					selectPlan: "اختر خطة",
				},
				progress: {
					title: "جاري التسجيل...",
					message: "يرجى الانتظار أثناء معالجة تسجيلك.",
				},
				success: {
					title: "تم التسجيل بنجاح!",
					message: "تهانينا! تم تسجيلك بنجاح.",
					submessage: "يمكن للشركة الآن الوصول إلى حسابها والبدء في استخدام منصتنا.",
					close: "إغلاق",
				},
				validation: {
					tooShort: "قصير جداً!",
					tooLong: "طويل جداً!",
					required: "مطلوب",
					passwordsNotMatch: "كلمات المرور غير متطابقة.",
					confirmPassword: "يرجى تأكيد كلمة المرور.",
					invalidEmail: "البريد الإلكتروني غير صالح",
					phoneRequired: "الهاتف مطلوب",
					documentRequired: "الهوية مطلوبة",
					documentInvalid: "الهوية غير صالحة",
				},
				currency: "USD",
				currencySymbol: "$",
			},
			login: {
				title: "تسجيل الدخول",
				form: {
					email: "البريد الإلكتروني",
					password: "كلمة المرور",
				},
				buttons: {
					submit: "دخول",
					register: "ليس لديك حساب؟ سجّل الآن",
				},
			},
			auth: {
				toasts: {
					success: "تم تسجيل الدخول بنجاح!",
				},
				dueDate: {
					expiration: "تنتهي اشتراكك خلال",
					days: "أيام!",
					day: "يوم!",
					expirationToday: "اشتراكك ينتهي اليوم!",
				},
				planExpired: {
					title: "انتهت صلاحية الخطة",
					message: "لمتابعة استخدام النظام، يرجى تسوية الدفع من صفحة المالية.",
					messageFeature: "انتهت صلاحية خطتك. للوصول إلى هذه الميزة، يرجى تسوية الدفع من صفحة المالية.",
					confirmText: "فهمت",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "التذاكر اليوم: ",
					},
				},
				painel: {
					title: "لوحة التحكم",
					welcome: "مرحباً",
					user: "المستخدم",
					breadcrumbHome: "الرئيسية",
					breadcrumbPainel: "لوحة التحكم",
					totalContacts: "إجمالي جهات الاتصال",
					baseCompleta: "القاعدة الكاملة",
					novosEsteMes: "جدد هذا الشهر",
					vsMesAnterior: "مقارنة بالشهر السابق",
					atendimentos: "التذاكر",
					estadosAlcancados: "الولايات المُبلغ عنها",
					de27estados: "من 27 ولاية",
					contatos: "جهات الاتصال",
					planoAtual: "الخطة الحالية",
					semPlano: "بدون خطة",
					periodoTeste: "فترة تجريبية",
					inicioContrato: "بداية العقد",
					novosContatos: "جهات اتصال جديدة",
					acumulado: "تراكمي",
					contatosPorTag: "جهات الاتصال حسب الوسم",
					contatosPorRegiao: "جهات الاتصال حسب المنطقة",
					nenhumaTagComContatos: "لا توجد وسوم بها جهات اتصال",
				},
			},
			connections: {
				title: "الاتصالات",
				toasts: {
					deleted: "تم حذف اتصال واتساب بنجاح!",
					disconnected: "تم قطع الاتصال بنجاح!",
				},
				confirmationModal: {
					deleteTitle: "حذف",
					deleteMessage: "هل أنت متأكد؟ لا يمكن التراجع.",
					disconnectTitle: "قطع الاتصال",
					disconnectMessage: "هل أنت متأكد؟ ستحتاج لقراءة رمز QR مرة أخرى.",
				},
				buttons: {
					add: "إضافة واتساب",
					disconnect: "قطع الاتصال",
					tryAgain: "إعادة المحاولة",
					qrcode: "رمز QR",
					newQr: "رمز QR جديد",
					connecting: "جاري الاتصال...",
				},
				table: {
					name: "الاسم",
					status: "الحالة",
					lastUpdate: "آخر تحديث",
					default: "افتراضي",
					actions: "إجراءات",
					session: "الجلسة",
				},
			},
			whatsappModal: {
				title: {
					add: "إضافة واتساب",
					edit: "تعديل واتساب",
				},
				form: {
					name: "الاسم",
					default: "افتراضي",
				},
				buttons: {
					okAdd: "إضافة",
					okEdit: "حفظ",
					cancel: "إلغاء",
				},
				success: "تم حفظ واتساب بنجاح.",
			},
			qrCode: {
				message: "امسح رمز QR لبدء الجلسة",
			},
			contacts: {
				title: "جهات الاتصال",
				toasts: {
					deleted: "تم حذف جهة الاتصال بنجاح!",
				},
				searchPlaceholder: "بحث...",
				confirmationModal: {
					deleteTitle: "حذف",
					importTitlte: "استيراد جهات الاتصال",
					deleteMessage: "هل أنت متأكد من حذف جهة الاتصال؟ ستُفقد جميع التذاكر المرتبطة.",
					importMessage: "هل تريد استيراد جميع جهات الاتصال من الهاتف؟",
				},
				buttons: {
					import: "استيراد جهات الاتصال",
					add: "إضافة جهة اتصال",
				},
				table: {
					name: "الاسم",
					whatsapp: "واتساب",
					email: "البريد الإلكتروني",
					actions: "إجراءات",
				},
			},
			contactModal: {
				title: {
					add: "إضافة جهة اتصال",
					edit: "تعديل جهة اتصال",
				},
				form: {
					mainInfo: "تفاصيل جهة الاتصال",
					extraInfo: "معلومات إضافية",
					name: "الاسم",
					number: "رقم واتساب",
					email: "البريد الإلكتروني",
					extraName: "اسم الحقل",
					extraValue: "القيمة",
				},
				buttons: {
					addExtraInfo: "إضافة معلومات",
					okAdd: "إضافة",
					okEdit: "حفظ",
					cancel: "إلغاء",
				},
				success: "تم حفظ جهة الاتصال بنجاح.",
			},
			queueModal: {
				title: {
					add: "إضافة طابور",
					edit: "تعديل الطابور",
				},
				form: {
					name: "الاسم",
					color: "اللون",
					greetingMessage: "رسالة الترحيب",
				},
				buttons: {
					okAdd: "إضافة",
					okEdit: "حفظ",
					cancel: "إلغاء",
				},
			},
			userModal: {
				title: {
					add: "إضافة مستخدم",
					edit: "تعديل المستخدم",
				},
				form: {
					name: "الاسم",
					email: "البريد الإلكتروني",
					profilePhoto: "صورة الملف الشخصي",
					password: "كلمة المرور",
					profile: "الملف",
				},
				buttons: {
					okAdd: "إضافة",
					okEdit: "حفظ",
					cancel: "إلغاء",
				},
				success: "تم حفظ المستخدم بنجاح.",
			},
			chat: {
				noTicketMessage: "اختر تذكرة لبدء المحادثة.",
			},
			ticketsManager: {
				buttons: {
					newTicket: "جديد",
				},
			},
			ticketsQueueSelect: {
				placeholder: "الطوابير",
			},
			tickets: {
				toasts: {
					deleted: "تم حذف التذكرة.",
				},
				notification: {
					message: "رسالة من",
				},
				tabs: {
					open: { title: "الوارد" },
					closed: { title: "المحلولة" },
					search: { title: "بحث" },
				},
				search: {
					placeholder: "البحث في التذاكر والرسائل.",
				},
				buttons: {
					showAll: "الكل",
					quickmessageflash: "رسالة سريعة",
				},
			},
			transferTicketModal: {
				title: "نقل التذكرة",
				fieldLabel: "ابحث عن مستخدم",
				noOptions: "لا يوجد مستخدم بهذا الاسم",
				buttons: {
					ok: "نقل",
					cancel: "إلغاء",
				},
			},
			ticketsList: {
				pendingHeader: "الطابور",
				assignedHeader: "يعمل عليه",
				noTicketsTitle: "لا يوجد شيء!",
				noTicketsMessage: "لا توجد تذاكر بهذه الحالة.",
				buttons: {
					accept: "قبول",
				},
			},
			newTicketModal: {
				title: "إنشاء تذكرة",
				fieldLabel: "ابحث عن جهة اتصال",
				add: "إضافة",
				buttons: {
					ok: "حفظ",
					cancel: "إلغاء",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "لوحة التحكم",
					connections: "الاتصالات",
					tickets: "التذاكر",
					contacts: "جهات الاتصال",
					queues: "الطوابير",
					administration: "الإدارة",
					users: "المستخدمون",
					settings: "الإعدادات",
				},
				appBar: {
					user: {
						profile: "الملف",
						logout: "تسجيل الخروج",
					},
				},
			},
			notifications: {
				noTickets: "لا توجد إشعارات.",
			},
			queues: {
				title: "الطوابير",
				table: {
					name: "الاسم",
					color: "اللون",
					greeting: "رسالة الترحيب",
					actions: "إجراءات",
				},
				buttons: {
					add: "إضافة طابور",
				},
				confirmationModal: {
					deleteTitle: "حذف",
					deleteMessage: "هل أنت متأكد؟ لا يمكن التراجع. التذاكر ستبقى لكن بدون طابور.",
				},
			},
			queueSelect: {
				inputLabel: "الطوابير",
			},
			users: {
				title: "المستخدمون",
				table: {
					name: "الاسم",
					email: "البريد الإلكتروني",
					profile: "الملف",
					actions: "إجراءات",
				},
				buttons: {
					add: "إضافة مستخدم",
				},
				toasts: {
					deleted: "تم حذف المستخدم بنجاح.",
				},
				confirmationModal: {
					deleteTitle: "حذف",
					deleteMessage: "ستُفقد جميع بيانات المستخدم. ستُنقل تذاكره إلى الطابور.",
				},
			},
			settings: {
				success: "تم حفظ الإعدادات بنجاح.",
				title: "الإعدادات",
				settings: {
					userCreation: {
						name: "إنشاء المستخدم",
						options: {
							enabled: "مفعّل",
							disabled: "معطّل",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "معين إلى:",
					buttons: {
						return: "رجوع",
						resolve: "حل",
						reopen: "إعادة فتح",
						accept: "قبول",
					},
				},
			},
			messagesInput: {
				placeholderOpen: "اكتب رسالة",
				placeholderClosed: "أعد فتح التذكرة أو اقبلها لإرسال رسالة.",
				signMessage: "التوقيع",
			},
			contactDrawer: {
				header: "تفاصيل جهة الاتصال",
				buttons: {
					edit: "تعديل جهة الاتصال",
				},
				extraInfo: "معلومات أخرى",
			},
			ticketOptionsMenu: {
				delete: "حذف",
				transfer: "نقل",
				confirmationModal: {
					title: "حذف التذكرة #",
					titleFrom: "من جهة الاتصال ",
					message: "تحذير! ستُفقد جميع الرسائل المرتبطة.",
				},
				buttons: {
					delete: "حذف",
					cancel: "إلغاء",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "موافق",
					cancel: "إلغاء",
				},
			},
			messageOptionsMenu: {
				delete: "حذف",
				reply: "رد",
				confirmationModal: {
					title: "حذف الرسالة؟",
					message: "لا يمكن التراجع عن هذا الإجراء.",
				},
			},
			translationManager: {
				title: "إدارة الترجمات",
				subtitle: "إدارة لغات وترجمات النظام. التغييرات تطبق على جميع الشركات.",
				languages: "اللغات",
				noLanguages: "لا توجد لغات مسجلة",
				new: "جديد",
				selectLanguage: "اختر لغة",
				selectLanguageHint: "اختر لغة من القائمة لتحرير ترجماتها",
				translations: "الترجمات",
				translated: "مترجم",
				pending: "قيد الانتظار",
				autoTranslate: "ترجمة تلقائية",
				translating: "جاري الترجمة...",
				export: "تصدير",
				import: "استيراد",
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP: "يجب أن يكون هناك اتصال واتساب افتراضي واحد على الأقل.",
				ERR_NO_DEF_WAPP_FOUND: "لم يتم العثور على واتساب افتراضي. تحقق من صفحة الاتصالات.",
				ERR_WAPP_NOT_INITIALIZED: "جلسة واتساب غير مهيأة. تحقق من صفحة الاتصالات.",
				ERR_WAPP_CHECK_CONTACT: "تعذر التحقق من جهة الاتصال. تحقق من صفحة الاتصالات.",
				ERR_WAPP_INVALID_CONTACT: "رقم واتساب غير صالح.",
				ERR_WAPP_DOWNLOAD_MEDIA: "تعذر تنزيل الوسائط. تحقق من صفحة الاتصالات.",
				ERR_INVALID_CREDENTIALS: "خطأ في المصادقة. حاول مرة أخرى.",
				ERR_SENDING_WAPP_MSG: "خطأ في إرسال الرسالة. تحقق من صفحة الاتصالات.",
				ERR_DELETE_WAPP_MSG: "تعذر حذف الرسالة من واتساب.",
				ERR_OTHER_OPEN_TICKET: "يوجد تذكرة مفتوحة بالفعل لهذه جهة الاتصال.",
				ERR_SESSION_EXPIRED: "انتهت الجلسة. يرجى تسجيل الدخول.",
				ERR_USER_CREATION_DISABLED: "تم تعطيل إنشاء المستخدمين من قبل المسؤول.",
				ERR_NO_PERMISSION: "ليس لديك صلاحية للوصول إلى هذا المورد.",
				ERR_DUPLICATED_CONTACT: "جهة اتصال بهذا الرقم موجودة مسبقاً.",
				ERR_NO_SETTING_FOUND: "لم يتم العثور على إعداد بهذا المعرّف.",
				ERR_NO_CONTACT_FOUND: "لم يتم العثور على جهة اتصال بهذا المعرّف.",
				ERR_NO_TICKET_FOUND: "لم يتم العثور على تذكرة بهذا المعرّف.",
				ERR_NO_USER_FOUND: "لم يتم العثور على مستخدم بهذا المعرّف.",
				ERR_NO_WAPP_FOUND: "لم يتم العثور على واتساب بهذا المعرّف.",
				ERR_CREATING_MESSAGE: "خطأ أثناء إنشاء الرسالة.",
				ERR_CREATING_TICKET: "خطأ أثناء إنشاء التذكرة.",
				ERR_FETCH_WAPP_MSG: "تعذر جلب الرسالة من واتساب، ربما قديمة.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "هذا اللون مستخدم. اختر لوناً آخر.",
				ERR_WAPP_GREETING_REQUIRED: "رسالة الترحيب مطلوبة إذا كان هناك أكثر من طابور واحد.",
			},
		},
	},
};

export { messages };
