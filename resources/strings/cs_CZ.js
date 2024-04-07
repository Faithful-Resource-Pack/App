export default {
	global: {
		name: "Webová aplikace Faithful",
		logout: "Odhlásit se",
		login: "Přihlásit přes Discord",
		ends_success: "Povedlo se!",
		loading: "Načítám, prosím vyčkejte…",
		no_results: "Žádné výsledky.",
		nyi: "Zatím neimplementováno",
		snackbar_system_theme: {
			sentence: "Systémový motiv změněn na %s",
			themes: {
				light: "světlý",
				dark: "tmavý",
			},
		},
		btn: {
			add: "Přidat",
			add_download: "Přidat odkaz ke stažení",
			submit: "Odeslat",
			cancel: "Zrušit",
			close: "Zavřít",
			save: "Uložit",
			edit: "Upravit",
			delete: "Smazat",
			ok: "OK",
			yes: "Ano",
			deny: "Zamítnout",
			approve: "Schválit",
			load_more: "Načíst více",
		},
		tabs: {
			general: {
				subtabs: {
					dashboard: "nástěnka",
					profile: "profil",
					statistics: "statistiky",
					gallery: "galerie",
				},
			},
			addons: {
				title: "doplňky",
				subtabs: {
					submissions: "přihlášky",
					upload: "nahrát",
				},
			},
			modding: {
				title: "módy",
				subtabs: {
					mod: "nahrát mód",
					modpack: "nahrát modpack",
				},
			},
			review: {
				title: "schvalování",
				subtabs: {
					addons: "doplňky",
					translations: "překlady",
				},
			},
			database: {
				title: "databáze",
				subtabs: {
					contributions: "příspěvky",
					users: "uživatelé",
					textures: "textury",
					files: "soubory",
					mods: "módy",
					modpacks: "modpacky",
					settings: "nastavení",
				},
			},
		},
		months: {
			jan: "Led",
			january: "Leden",
			feb: "Úno",
			february: "Únor",
			mar: "Bře",
			march: "Březen",
			apr: "Dub",
			april: "Duben",
			may_: "Květen", // longer
			may: "Kvě",
			jun: "Čvn",
			june: "Červen",
			jul: "Čvc",
			july: "Červenec",
			aug: "Srp",
			august: "Srpen",
			sep: "Zář",
			september: "Září",
			oct: "Říj",
			october: "Říjen",
			nov: "Lis",
			november: "Listopad",
			dec: "Pro",
			december: "Prosinec",
		},
	},
	database: {
		titles: {
			contributions: "Příspěvky",
			contributors: "Přispěvatelé",
			textures: "Textury",
			files: "Soubory",
			add_user: "Přidat nového přispěvatele",
			add_textures: "Přidat nové textury",
			add_texture: "Přidat novou texturu",
			add_use: "Přidat nové využití",
			add_path: "Přidat novou cestu",
			add_mc_version: "Přidat novou verzi Minecraftu",
			change_path: "Upravit cestu",
			change_use: "Upravit využití",
			change_texture: "Upravit texturu",
			change_user: "Upravit přispěvatele",
			change_mc_version: "Upravit verzi Minecraftu",
			confirm_deletion: "Potvrdit smazání",
		},
		subtitles: {
			add_manually: "Přidat ručně",
			resolution: "Rozlišení",
			pack: "Resource Packy",
			user: "Uživatel",
			select_user_role: "Vyber role uživatele",
			search: "Vyhledat",
			texture_result: "Výsledky textur",
			import_json_data: "Importovat JSON data",
			uses: "Využití",
			paths: "Cesta/y",
		},
		labels: {
			anonymous: "Anonym",
			anonymous_explain:
				'Pokud je zatrženo, jméno uživatele bude zobrazeno jako "Anonym" a jeho skin nebude viditelný. Může být změněno pouze administrátory!',
			mcmeta: "Animovaná textura",
			new_mc_version_edition: "Edice, ke které bude verze přidána",
			new_mc_version_path: "Verze cesty, ke které bude verze přidána",
			new_mc_version_name: "Jméno nové verze",
			nameless: "Beze jména",
			add_textures_success: "Textury byly úspešně přidány",
			add_version_success: "Verze byla úspěšně přidána",
			add_new_user: "Přidat nového uživatele",
			add_new_texture: "Přidat novou texturu",
			add_new_path: "Přidat novou cestu",
			add_new_use: "Přidat nové využití",
			add_texture: "Přidat textury",
			add_mc_version: "Přidat novou verzi Minecraftu",
			ask_deletion: "Opravdu chceš smazat %s (%d)?",
			contributors_results: "Výsledky uživatelů",
			user_role: "Role uživatele",
			discord_id: "Discord ID",
			edit_mc_version: "Upravit verzi Minecraftu",
			one_contributor: "Prosím vyber alespoň jednoho uživatele",
			parse_json: "Převést JSON na data",
			search_contributions: "Vyhledat příspěvky",
			search_username: "Vyhledat uživatelské jméno",
			search_texture: "Vyhledat jméno textury",
			select_texture_tag: "Vybrat druh textury",
			username: "Uživatelské jméno",
			uuid: "UUID Minecraft profilu",
			texture_name: "Jméno textury",
			texture_tags: "Druh textury",
			texture_id: "ID textury",
			texture_uses: "Využití textury",
			use_name: "Jméno využití",
			use_id: "ID využití",
			use_edition: "Edice využití",
			path: "Cesta",
			path_id: "ID cesty",
			versions: "Verze",
			no_path_found: "Pro toto využití nebyly nalezeny žádné cesty.",
			no_use_found: "Pro tuto texturu nebyla nalezena žádná využití.",
			current_mc_version: "Aktuální verze Minecraftu",
			new_mc_version: "Nová verze Minecraftu",
		},
		hints: {
			texture_id: "Změna ID textury může všechno rozbít!",
			use_id: "Změna ID využití může všechno rozbít!",
			path_id: "Změna ID cesty může všechno rozbít!",
			warning_path:
				"Momentálně je třeba využití vytvořit předtím, než se k němu přidají cesty. Přidávání cest před přidáním využití je plánováno.",
			path: "Cesta by měla začínat od kořenového adresáře, např. assets/…",
			example_scenario:
				"Změní všechny výskyty určité verze Minecraftu v databázi na nějakou jinou, např. 1.17 → 1.17.1",
			example_scenario_warn: "Prosím nezapomeň aktualizovat všechny branche na GitHubu!",
		},
	},
	review: {
		titles: {
			addons: "Posoudit doplňky",
			translation: "Posoudit překlady",
			pending: "Čekající na schválení",
			denied: "Zamítnuto",
			approved: "Schváleno",
		},
		deny_window: {
			label: "Napiš důvod…",
			rule: "Může být udán jakýkoliv důvod",
		},
		labels: {
			pending: "Momentálně nejsou žádné doplňky čekající na schválení!",
			denied: "Momentálně nejsou žádné zamítnuté doplňky!",
			load_approved: "Načíst schválené doplňky",
		},
		addon: {
			titles: {
				authors: "Autor/Autoři",
				description: "Popis",
				links: "Odkazy",
				options: "Možnosti",
			},
			labels: {
				link: "Odkaz",
				comments: "Komentáře",
				optifine: "OptiFine",
				approved_by: "Schváleno administrátorem",
				denied_by: "Zamítnuto administrátorem",
				reason: "Důvod",
				old_addon: "Starý doplněk, nejsou pro něj žádná data.",
			},
		},
	},
	addons: {
		titles: {
			submit: "Nahrát nový doplněk",
			edit: "Upravit doplňky",
			submissions: "Přihlášky",
			details: "Podrobnosti",
		},
		remove: {
			title: "Potvrdit smazání",
			labels: {
				question: "Opravdu chceš smazat %s?",
				warning: "Tuto akci nelze odvolat.",
			},
		},
		general: {
			loading_addon: "Načítám doplněk…",
			title: "Obecné",
			name: {
				label: "Název doplňku",
				hint: "Čím kratší, tím lepší. (Ale nepřežeň to!)",
				rules: {
					name_required: "Název je vyžadován.",
					name_too_big: "Název doplňku musí být kratší než %s znaků.",
					name_too_small: "Název doplňku musí být alespoň %s znaků dlouhý.",
					name_unavailable: "Tento název už je používán jiným doplňkem!",
				},
			},
			description: {
				label: "Popisek doplňku",
				hint: "Popisek můžeš vyšperkovat formátováním Markdown!",
				rules: {
					description_required: "Popisek je vyžadován.",
					description_too_big: "Popisek musí být kratší než %s znaků.",
					description_too_small: "Popisek musí být alespoň %s znaků dlouhý.",
				},
			},
			authors: {
				label: "Vyber autory doplňku",
				hint: "Jakmile je doplněk nahrán, jakýkoliv autor ho může upravit! | Pokud v seznamu někoho nemůžeš najít, kontaktuj nějakého administrátora či vývojáře",
			},
		},
		images: {
			title: "Obrázky",
			header: {
				labels: {
					drop: "Kliknutím vyberte obrázek záhlaví",
					normal: "Hlavní obrázek",
					replace: "Změnit hlavní obrázek",
				},
				rules: {
					image_size:
						"Velikost obrázku musí být méně než %s KB! (Ke kompresi můžeš využít https://compressor.io/.)",
					image_ratio: "Nesprávný poměr stran: Nahraný obrázek musí mít poměr stran 16:9.",
					image_required: "Hlavní obrázek je vyžadován.",
				},
			},
			carousel: {
				labels: {
					drop: "Kliknutím vyberte další obrázky",
					normal: "Další obrázky",
					replace: "Změnit další obrázky",
				},
				rule: "Nesprávný poměr stran: Obrázky s poměrem stran jiným než 16:9 byly odstraněny.",
			},
		},
		options: {
			title: "Možnosti",
			comments: {
				label: "Povolit komentáře",
			},
			optifine: {
				label: "Vyžaduje OptiFine",
			},
			editions: {
				label: "Podporované edice",
				rule: "Je nutno vybrat alespoň jednu edici.",
			},
			resolutions: {
				label: "Podporovaná rozlišení",
				rule: "Je nutno vybrat alespoň jedno rozlišení.",
			},
		},
		downloads: {
			title: "Odkazy na stažení",
			name: {
				placeholder: "Odkaz na CurseForge, GitHub…",
				label: "Jméno",
				rules: {
					name_required: "Jméno je vyžadováno.",
					name_cannot_be_empty: "Jméno nemůže být prázdné.",
				},
			},
			link: {
				placeholder: "https://www.příklad.cz/",
				label: "Odkaz",
				rule: "URL musí být platné.",
			},
		},
		status: {
			approved: "Schváleno",
			denied: "Zamítnuto",
			pending: "Čeká na schválení",
		},
	},
	statistics: {
		title: "Statistiky příspěvků",
		label: {
			textures: "Textury",
			contributors: "Přispěvatelé",
			contributions: "Příspěvky",
		},
	},
	profile: {
		title: "Profil",
		general: {
			title: "Obecné",
			uuid: {
				label: "UUID Minecraft profilu",
				hint: "Tvůj skin se zobrazí na příspěvcích, ve kterých jsi autorem.",
			},
			username: {
				label: "Uživatelské jméno",
				hint: "Tvoje uživatelské jméno bude využito na webových stránkách pro příspěvky, doplňky atd.",
			},
		},
		social: {
			title: "Odkazy na sociální sítě",
			edit: {
				label: "Upravit %s URL",
			},
			select: {
				label: "Vybrat stránku",
			},
			new: {
				placeholder: "https://www.příklad.cz/",
				label: "Nová sociální síť",
			},
		},
	},
	files: {
		general: {
			name: {
				label: "Název souboru",
				hint: "Název by měl soubor stručně popisovat.",
				rules: {
					name_required: "Název je vyžadován.",
					name_too_big: "Název souboru musí být kratší než %s znaků.",
					name_too_small: "Název souboru musí být alespoň %s znaků dlouhý.",
				},
			},
			use: {
				label: "Název užití souboru",
				hint: "Stručně popisuje, jak je soubor využit",
				rules: {
					name_required: "Toto pole nelze zanechat prázdné.",
					name_too_big: "Název užití souboru musí být kratší než %s znaků.",
					name_too_small: "Název užití souboru musí být alespoň %s znaků dlouhý.",
				},
			},
		},
	},
	gallery: {
		title: "Galerie",
		loading_message: "Načítám…",
		error_message: {
			texture_not_done: "Textura chybí nebo byla schválně vynechána.",
			user_anonymous: "Anonym",
			user_not_found: "Neznámý uživatel",
			contribution_not_found: "V databázi nebyli nalezeni žádní autoři!",
		},
		category: {
			search: "Vyhledat",
			tags: "Kategorie",
			mc_version: "Minecraft verze",
			edition: "Edice",
			resolution: "Rozlišení",
		},
		all: "vše",
		modal: {
			tabs: {
				information: "informace",
				authors: "autoři",
				animated: "animace",
				model: "3D",
			},
			type: {
				label: "Druh souboru",
				hint: "Popisuje druh daného souboru",
				rules: {
					name_required: "Druh souboru je vyžadován.",
					name_too_big: "Druh souboru musí být kratší než %s znaků.",
					name_too_small: "Druh souboru musí být alespoň %s znaků dlouhý.",
				},
			},
			parent: {
				type: {
					label: "Název druhu nadřazeného souboru",
					hint: "Popisuje druh nadřazeného souboru",
					rules: {
						name_required: "Název druhu nadřazeného souboru je vyžadován.",
						name_too_big: "Název druhu nadřazeného souboru musí být kratší než %s znaků.",
						name_too_small: "Název druhu nadřazeného souboru musí být alespoň %s znaků dlouhý.",
					},
				},
				id: {
					label: "ID nadřazeného souboru",
					hint: "Popisuje odkaz na nadřazený soubor",
					rules: {
						name_required: "ID nadřazeného souboru je vyžadováno.",
						name_too_big: "ID nadřazeného souboru musí být kratší než %s znaků.",
						name_too_small: "ID nadřazeného souboru musí být alespoň %s znaků dlouhé.",
					},
				},
			},
			source: {
				label: "Zdroj souboru",
				hint: "URL zdroje souboru",
				rules: {
					name_required: "URL zdroje souboru je vyžadováno.",
					name_too_big: "URL zdroje souboru musí být kratší než %s znaků.",
					name_too_small: "URL zdroje souboru musí být alespoň %s znaků dlouhé.",
				},
			},
			info: {
				texture: "Textura",
				uses: "Využití",
				paths: "Cesty",
			},
			data: {
				date: "Datum",
				authors: "Autor/Autoři",
				id: "ID",
				name: "Jméno",
				tags: "Kategorie",
				use_id: "ID využití",
				use_name: "Jméno využití",
				editions: "Edice",
				texture_id: "ID textury",
				path_id: "ID cesty",
				resource_pack_path: "Cesta v resource packu",
				mc_versions: "Verze Minecraftu",
			},
		},
	},
	settings: {
		title: "Nastavení",
		label: {
			edit_raw: "Upravit surová JSON data",
			edit_editor: "Upravit ve vizuálním editoru",
		},
	},
	dashboard: {
		welcome_user: "Vítej, uživateli %USER%!",
		welcome: "Vítej!",
		totals: {
			authors: "autorů",
			contributions: "příspěvků",
			last_week: "příspěvků minulý týden",
			last_month: "příspěvků minulý měsíc",
		},
		activity: "aktivita %s",
		users: {
			total: "uživatelů",
			total_anonymous: "anonymních uživatelů",
			total_roles: "rolí",
		},
		locale: {
			on: " ",
			less: "Více",
			more: "Méně",
		},
	},
};
