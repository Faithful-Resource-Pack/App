/**
 * German translation
 * - Translated by:
 *   - @author RobertR11 // GitHub: https://github.com/RobertRR11
 */

export default {
  global: {
    name: 'Faithful Webanwendung',
    logout: 'Abmelden',
    login: 'Über Discord anmelden',
    ends_success: 'Erfolgreich abgeschlossen',
    loading: 'Wird geladen, bitte warten...',
    no_results: 'Es wurden keine Ergebnisse gefunden.',
    btn: {
      add: 'Hinzufügen',
      add_download: 'Download hinzufügen',
      submit: 'Einreichen',
      cancel: 'Abbrechen',
      save: 'Speichern',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      ok: 'OK',
      yes: 'Ja',
      deny: 'Ablehnen',
      approve: 'Genehmigen',
      load_more: 'Mehr laden'
    },
    tabs: {
      user: {
        title: 'Benutzer',
        subtabs: {
          profile: 'Profil',
          statistics: 'Statistik',
          gallery: 'Gallery'
        }
      },
      addons: {
        title: 'add-ons',
        subtabs: {
          submissions: 'Einreichungen',
          upload: 'hochladen'
        }
      },
      modding: {
        title: 'modding',
        subtabs: {
          mod: 'Mod einreichen',
          modpack: 'Modpack einreichen'
        }
      },
      review: {
        title: 'Überprüfen',
        subtabs: {
          addons: 'add-ons',
          translations: 'Übersetzungen'
        }
      },
      database: {
        title: 'Datenbank',
        subtabs: {
          contributions: 'Beiträge',
          contributors: 'Mitwirkende',
          textures: 'Texturen',
          files: 'Dateien',
          mods: 'mods',
          modpacks: 'modpacks'
        }
      }
    }
  },
  database: {
    titles: {
      contributions: 'Beiträge',
      contributors: 'Beitragende',
      textures: 'Texturen',
      files: 'Dateien ',
      add_contributor: 'Neuen Mitwirkenden hinzufügen',
      add_textures: 'Neue Texturen hinzufügen',
      add_texture: 'Neue Textur hinzufügen',
      add_use: 'Neue Verwendung hinzufügen',
      add_path: 'Neuen Dateipfad hinzufügen',
      add_mc_version: 'Neue Minecraft-Version hinzufügen',
      change_path: 'Dateipfad bearbeiten',
      change_use: 'Verwendung bearbeiten',
      change_texture: 'Textur bearbeiten',
      change_contributor: 'Mitwirkende bearbeiten',
      change_mc_version: 'Eine Minecraft-Version ändern',
      confirm_deletion: 'Löschung bestätigen'
    },
    subtitles: {
      add_manually: 'Manuell hinzufügen',
      resolution: 'Auflösung',
      contributor: 'Mitwirkende/r',
      select_contributor_type: 'Mitwirkende/r-Typ auswählen',
      search: 'Suchen',
      texture_result: 'Texturergebnisse',
      import_json_data: 'JSON-Daten importieren',
      uses: 'Verwendung(en)',
      paths: 'Dateipfad(e)'
    },
    labels: {
      new_mc_version_edition: 'Edition, zu der die Version hinzugefügt werden soll',
      new_mc_version_path: 'Pfadversion, zu der die Version hinzugefügt werden soll',
      new_mc_version_name: 'Neuer Versionsname',
      nameless: 'Namenlos',
      add_textures_success: 'Texturen erfolgreich hinzugefügt',
      add_version_success: 'Version erfolgreich hinzugefügt',
      add_new_contributor: 'Neuen Mitwirkenden hinzufügen',
      add_new_texture: 'Neue Textur hinzufügen',
      add_new_path: 'Neuen Pfad hinzufügen',
      add_new_use: 'Neue Verwendung hinzufügen',
      add_texture: 'Texturen hinzufügen',
      add_mc_version: 'Neue Minecraft-Version hinzufügen',
      ask_deletion: 'Willst du %s (%d) löschen?',
      contributors_results: 'Mitwirkende Ergebnisse',
      contributor_type: 'Art des Mitwirkenden',
      discord_id: 'Discord-ID',
      edit_mc_version: 'Eine Minecraft-Version ändern',
      one_contributor: 'Bitte wähle mindestens einen Mitwirkenden',
      parse_json: 'JSON in Daten umwandeln',
      search_contributions: 'Beiträge suchen',
      search_username: 'Benutzernamen suchen',
      search_texture: 'Texturname suchen',
      select_texture_type: 'Texturtyp auswählen',
      username: 'Benutzername',
      uuid: 'Minecraft Profil UUID',
      texture_name: 'Texturname',
      texture_type: 'Textur-Typ',
      texture_id: 'Textur-ID',
      texture_uses: 'Textur-Verwendung(en)',
      use_name: 'Verwendungsname',
      use_id: 'Verwendungs-ID',
      use_edition: 'Verwendungsedition',
      path: 'Dateipfad',
      path_id: 'Dateipfad-ID',
      versions: 'Versionen',
      no_path_found: 'Keine Dateipfade für diese Verwendung gefunden.',
      no_use_found: 'Keine Verwendungen für diese Textur gefunden.',
      actual_mc_version: 'Aktuelle MC-Version',
      new_mc_version: 'Neue MC-Version'
    },
    hints: {
      texture_id: 'Das Ändern der Textur-ID kann alles kaputt machen',
      use_id: 'Das Ändern der Verwendungs-ID kann alles kaputt machen',
      path_id: 'Das Ändern der Dateipfad-ID kann alles kaputt machen',
      warning_path: 'Die Verwendung muss erstellt werden, bevor Dateipfade hinzugefügt werden können (derzeit nicht gut unterstützt und  etwas fehlerhaft), das Hinzufügen von Dateipfaden vor dem Erstellen der Verwendung ist geplant.',
      path: 'Der Dateipfad sollte mit dem Stammverzeichnis beginnen (Bsp.: assets/...)',
      example_scenario: 'Ändert alle Instanzen einer Minecraft-Version in der Datenbank in eine andere Version. (Bsp. 1.17 → 1.17.1)',
      example_scenario_warn: 'Bitte vergesse nicht, auch die Namen aller GitHub-Branches zu aktualisieren!'
    }
  },
  review: {
    titles: {
      addons: 'Add-ons überprüfen',
      translation: 'Übersetzungen überprüfen (bald)',
      pending: 'Genehmigung ausstehend',
      denied: 'Abgelehnt',
      approved: 'Genehmigt'
    },
    deny_window: {
      label: 'Schreibe einen Grund...',
      rule: 'Ein beliebiger Grund kann angegeben werden'
    },
    labels: {
      pending: 'Es gibt derzeit keine ausstehenden Add-ons!',
      denied: 'Es gibt derzeit keine abgelehnten Add-ons!',
      load_approved: 'Genehmigte Add-ons laden'
    },
    addon: {
      titles: {
        authors: 'Autor(en)',
        description: 'Beschreibung',
        links: 'Links',
        options: 'Optionen'
      },
      labels: {
        link: 'Link',
        comments: 'Kommentare',
        optifine: 'OptiFine',
        approved_by: 'Genehmigt von',
        denied_by: 'Abgelehnt von',
        reason: 'Grund',
        old_addon: 'Altes Add-on, keine Daten dafür vorhanden.'
      }
    }
  },
  addons: {
    titles: {
      submit: 'Ein neues Add-on einreichen',
      submissions: 'Einreichungen'
    },
    remove: {
      title: 'Löschung bestätigen',
      labels: {
        question: 'Willst du %s löschen?',
        warning: 'Du kannst diesen Vorgang nicht rückgängig machen.'
      }
    },
    general: {
      title: 'Allgemein',
      name: {},
      description: {
        label: 'Add-on Beschreibung',
        hint: 'Du kannst die Markdown-Formatierung verwenden, um deine Beschreibung zu verbessern!',
        rules: {
          description_required: 'Die Beschreibung ist erforderlich.',
          description_too_big: 'Die Beschreibung muss weniger als %s Zeichen enthalten.'
        }
      },
      authors: {
        label: 'Autoren für das Add-on auswählen',
        hint: 'Jeder Autor kann das Add-on ändern, sobald es eingereicht wurde! | Wenn du in der Liste niemanden finden kannst, der dort sein sollte, kontaktiere einen Administrator/Entwickler.'
      }
    },
    images: {
      title: 'Screenshots',
      header: {
        labels: {
          drop: 'Header-Bild hier ablegen oder zum Auswählen klicken.',
          normal: 'Header-Bild',
          replace: 'Header-Bild ersetzen'
        },
        rules: {
          image_size: 'Die Bild sollte weniger als %s KB groß sein! Benutze https://compressor.io/ es zu komprimieren.',
          image_ratio: 'Falsches Seitenverhältnis: Das bereitgestellte Bild hat nicht das Seitenverhältnis 16:9.',
          image_required: 'Ein Header-Bild ist erforderlich.'
        }
      },
      carousel: {
        labels: {
          drop: 'Weitere Bilder hier ablegen oder zum Auswählen klicken.',
          normal: 'Zusätzliche(s) Bild(er)',
          replace: 'Zusätzliche(s) Bild(er) ersetzen'
        },
        rule: 'Falsches Seitenverhältnis: Bilder ohne einem Seitenverhältnis von 16:9 wurden entfernt.'
      }
    },
    options: {
      title: 'Optionen',
      comments: {
        label: 'Kommentare einschalten'
      },
      optifine: {
        label: 'Benötigt OptiFine'
      },
      editions: {
        label: 'Unterstützte Edition(en)',
        rule: 'Du musst mindestens eine Edition auswählen.'
      },
      resolutions: {
        label: 'Unterstützte Auflösung(en)',
        rule: 'Du musst mindestens eine Auflösung auswählen.'
      }
    },
    downloads: {
      title: 'Downloads',
      name: {
        placeholder: 'CurseForge, GitHub...',
        label: 'Name',
        rules: {
          name_required: 'Ein Name ist erforderlich.',
          name_cannot_be_empty: 'Name kann nicht leer sein.'
        }
      },
      link: {
        placeholder: 'https://www.beispiel.de/',
        label: 'Link',
        rule: 'Die URL muss gültig sein.'
      }
    },
    status: {
      approved: 'Genehmigt',
      denied: 'Abgelehnt',
      pending: 'Ausstehend'
    }
  },
  statistics: {
    title: 'Beitragsstatistik',
    label: {
      textures: 'Texturen',
      contributors: 'Mitwirkende',
      contributions: 'Beiträge'
    }
  },
  profile: {
    title: 'Profil',
    general: {
      title: 'Allgemein',
      uuid: {
        label: 'Minecraft-Profil UUID',
        hint: 'Dein Skin wird auf Beiträgen angezeigt, die du verfasst hast.'
      },
      username: {
        label: 'Benutzername',
        hint: 'Dein Benutzername wird auf der Website angezeigt und für Beiträge, Add-ons usw. verwendet.'
      }
    },
    social: {
      title: 'Soziale Links',
      edit: {
        label: 'URL %s bearbeiten'
      },
      select: {
        label: 'Medien auswählen'
      },
      new: {
        placeholder: 'https://www.beispiel.de/',
        label: 'Neue soziale Medien'
      }
    }
  }
}
