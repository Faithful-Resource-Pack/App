/**
 * French translation
 * - Translated by:
 *   - @author Juknum // GitHub: https://github.com/Juknum
 */

export default {
  global: {
    name: 'Application Web Faithful',
    logout: 'Déconnexion',
    login: 'Se connecter via Discord',
    ends_success: 'Terminé avec succès',
    loading: 'Chargement, veuillez patienter...',
    no_results: 'Aucun résultat n\'a été trouvé.',
    nyi: 'N\'a pas encore été implémenté.',
    btn: {
      add: 'Ajouter',
      add_download: 'Ajouter un lien',
      submit: 'Soumettre',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Sauvegarder',
      edit: 'Éditer',
      delete: 'Supprimer',
      ok: 'OK',
      yes: 'Oui',
      deny: 'Refuser',
      approve: 'Approuver',
      load_more: 'Charger plus'
    },
    tabs: {
      user: {
        title: 'utilisateur',
        subtabs: {
          profile: 'profil',
          statistics: 'statistiques',
          gallery: 'galerie'
        }
      },
      addons: {
        title: 'add-on',
        subtabs: {
          submissions: 'mes add-ons',
          upload: 'upload'
        }
      },
      modding: {
        title: 'modding',
        subtabs: {
          mod: 'soumettre un mod',
          modpack: 'soumettre un modpack'
        }
      },
      review: {
        title: 'vérification',
        subtabs: {
          addons: 'add-ons',
          translations: 'traductions'
        }
      },
      database: {
        title: 'database',
        subtabs: {
          contributions: 'contributions',
          contributors: 'contributeurs',
          textures: 'textures',
          files: 'fichiers',
          mods: 'mods',
          modpacks: 'modpacks',
          settings: 'Paramètres'
        }
      }
    },
    months: {
      jan: 'Jan',
      january: 'Janvier',
      feb: 'Fév',
      february: 'Février',
      mar: 'Mar',
      march: 'Mars',
      apr: 'Avr',
      april: 'Avril',
      may_: 'Mai',
      may: 'Mai',
      jun: 'Juin',
      june: 'Juin',
      jul: 'Juil',
      july: 'Juillet',
      aug: 'Aoû',
      august: 'Août',
      sep: 'Sep',
      september: 'Septembre',
      oct: 'Oct',
      october: 'Octobre',
      nov: 'Nov',
      november: 'Novembre',
      dec: 'Déc',
      december: 'Décembre'
    }
  },
  database: {
    titles: {
      contributions: 'Contributions',
      contributors: 'Contributeurs',
      textures: 'Textures',
      files: 'Fichiers',
      add_contributor: 'Ajouter un contributeur',
      add_textures: 'Ajouter des textures',
      add_texture: 'Ajouter une texture',
      add_use: 'Ajouter une utilisation',
      add_path: 'Ajouter un chemin',
      add_mc_version: 'Ajouter une nouvelle version Minecraft',
      change_path: 'Éditer le chemin',
      change_use: 'Éditer l\'utilisation',
      change_texture: 'Éditer la texture',
      change_contributor: 'Éditer le contributeur',
      change_mc_version: 'Modifier une version de Minecraft',
      confirm_deletion: 'Confirmer la suppression'
    },
    subtitles: {
      add_manually: 'Ajouter manuellement',
      resolution: 'Résolution',
      pack: 'Packs de Ressources',
      contributor: 'Contributeur',
      select_contributor_type: 'Sélectionnez le type de contributeur',
      search: 'Rechercher',
      texture_result: 'Résultats des textures',
      import_json_data: 'Importer des données JSON',
      uses: 'Utilisation(s)',
      paths: 'Chemin(s)'
    },
    labels: {
      mcmeta: "Texture animée",
      new_mc_version_edition: 'Édition à laquelle ajouter une version',
      new_mc_version_path: 'Version du chemin auquel ajouter la version',
      new_mc_version_name: 'Nom de la nouvelle version',
      nameless: 'Sans nom',
      add_textures_success: 'Textures ajoutées avec succès',
      add_version_success: 'Version ajoutée avec succès',
      add_new_contributor: 'Ajouter un nouveau contributeur',
      add_new_texture: 'Ajouter une nouvelle texture',
      add_new_path: 'Ajouter un nouveau chemin',
      add_new_use: 'Ajouter une nouvelle utilisation',
      add_texture: 'Ajouter des textures',
      add_mc_version: 'Ajouter une nouvelle version Minecraft',
      ask_deletion: 'Voulez-vous supprimer %s (%d)?',
      contributors_results: 'Résultats des contributeurs',
      contributor_type: 'Type de contributeur',
      discord_id: 'ID Discord',
      edit_mc_version: 'Modifier une version Minecraft',
      one_contributor: 'Veuillez choisir au moins un contributeur',
      parse_json: 'Analyser le JSON en données',
      search_contributions: 'Rechercher des contributions',
      search_username: 'Rechercher un pseudonyme',
      search_texture: 'Rechercher un nom de texture',
      select_texture_type: 'Sélectionner un type de texture',
      username: 'Pseudonyme',
      uuid: 'UUID du profil Minecraft',
      texture_name: 'Nom de la texture',
      texture_type: 'Type de la texture',
      texture_id: 'ID de la texture',
      texture_uses: 'Utilisation(s) de la texture',
      use_name: 'Nom de l\'utilisation',
      use_id: 'ID de l\'utilisation',
      use_edition: 'Edition de l\'utilisation',
      path: 'Chemin',
      path_id: 'ID du chemin',
      versions: 'Versions',
      no_path_found: 'Aucun chemin trouvé pour cette utilisation',
      no_use_found: 'Aucune utilisation trouvée pour cette texture.',
      actual_mc_version: 'Version MC actuelle',
      new_mc_version: 'Nouvelle version MC'
    },
    hints: {
      texture_id: 'Changer l\'ID de la texture peut tout casser',
      use_id: 'Changer l\'ID de l\'utilisation peut tout casser',
      path_id: 'Changer l\'ID du chemin peut tout casser',
      warning_path: 'L\'utilisation doit être créée avant d\'y ajouter des chemins (actuellement pas très bien supporté et un peu bugué)',
      path: 'Le chemin doit commencer à partir du répertoire racine (ex: assets/...)',
      example_scenario: 'Hm, toute la base de donnée est configurée pour télécharger les textures pour la version 1.17 mais il existe désormais une version 1.17.1, cette option est faite pour vous !',
      example_scenario_warn: 'N\'oubliez pas de mettre également à jour toutes les branches GitHub !'
    }
  },
  review: {
    titles: {
      addons: 'Vérifier les Add-ons',
      translation: 'Vérifier les traductions (Bientôt)',
      pending: 'En attente de validation',
      denied: 'Refusé(s)',
      approved: 'Accepté(s)'
    },
    deny_window: {
      label: 'Écrivez une raison...',
      rule: 'Toute raison peut être donnée'
    },
    labels: {
      pending: 'Il n\'y a actuellement aucun add-on en attente !',
      denied: 'Il n\'y a actuellement aucun add-on refusé !',
      load_approved: 'Charger les add-on approuvés'
    },
    addon: {
      titles: {
        authors: 'Auteur(s)',
        description: 'Description',
        links: 'Liens',
        options: 'Options'
      },
      labels: {
        link: 'Lien',
        comments: 'Commentaires',
        optifine: 'OptiFine',
        approved_by: 'Approuvé par',
        denied_by: 'Refusé par',
        reason: 'Raison',
        old_addon: 'Ancien add-on, aucune données.'
      }
    }
  },
  addons: {
    titles: {
      submit: 'Soumettre un nouvel Add-on',
      edit: 'Éditer l\'addon',
      submissions: 'Mes Add-ons'
    },
    remove: {
      title: 'Confirmer la suppression',
      labels: {
        question: 'Voulez-vous vraiment supprimer %s?',
        warning: 'Vous ne pouvez pas revenir en arrière après cela.'
      }
    },
    general: {
      loading_addon: 'Chargement de l\'addon',
      title: 'Général',
      name: {
        label: 'Nom de l\'add-on',
        hint: 'Un nom court sera meilleur !',
        rules: {
          name_required: 'Le nom est requis.',
          name_too_big: 'Le nom doit faire moins que %s caractères.',
          name_unavailable: 'Ce nom est déjà pris !'
        }
      },
      description: {
        label: 'Description de l\'add-on',
        hint: 'Vous pouvez utilisez des balises Markdown pour améliorer votre description !',
        rules: {
          description_required: 'La description est requise.',
          description_too_big: 'La description ne doit pas dépasser %s caractères.'
        }
      },
      authors: {
        label: 'Sélectionner un ou des auteurs pour cet add-on',
        hint: 'N\'importe quel auteur peut modifier l\'add-on une fois soumis ! | Si vous ne trouvez pas quelqu\'un dans la liste, contactez un Administrateur/Développeur'
      }
    },
    images: {
      title: 'Captures d\'écran',
      header: {
        labels: {
          drop: 'Déposez l\'image d\'en-tête ici, ou cliquez pour la sélectionner.',
          normal: 'Image d\'en-tête',
          replace: 'Changer l\'image d\'en-tête'
        },
        rules: {
          image_size: 'L\'image doit faire moins de %s KB! Utilisez https://compressor.io/ pour le compresser.',
          image_ratio: 'Ratio incorrect: L\'image envoyée ne possède pas un ratio en 16/9.',
          image_required: 'Une image d\'en-tête est requise.'
        }
      },
      carousel: {
        labels: {
          drop: 'Déposez des image(s) additionnelles ici, or cliquez pour les sélectionner.',
          normal: 'Image(s) additionnelles',
          replace: 'Remplacer les images additionnelles'
        },
        rule: 'Ratio incorrect: Les images qui n\'ont pas un ratio en 16/9 ont été enlevées.'
      }
    },
    options: {
      title: 'Options',
      comments: {
        label: 'Activer les commentaires'
      },
      optifine: {
        label: 'Requière OptiFine'
      },
      editions: {
        label: 'Edition(s) supportées',
        rule: 'Vous devez choisir au moins 1 édition.'
      },
      resolutions: {
        label: 'Résolutions supportées',
        rule: 'Vous devez choisir au moins 1 résolution.'
      }
    },
    downloads: {
      title: 'Téléchargements',
      name: {
        placeholder: 'CurseForge, GitHub...',
        label: 'Nom',
        rules: {
          name_required: 'Un nom est requis.',
          name_cannot_be_empty: 'Le nom ne peut être vide.'
        }
      },
      link: {
        placeholder: 'https://www.exemple.com/',
        label: 'Lien',
        rule: 'L\'URL doit être valide.'
      }
    },
    status: {
      approved: 'Approuvé',
      denied: 'Refusé',
      pending: 'En attente'
    }
  },
  statistics: {
    title: 'Statistiques des contributions',
    label: {
      textures: 'Textures',
      contributors: 'Contributeurs',
      contributions: 'Contributions'
    }
  },
  profile: {
    title: 'Profil',
    general: {
      title: 'Général',
      uuid: {
        label: 'UUID du profil Minecraft',
        hint: 'Votre skin sera affiché sur vos pages.'
      },
      username: {
        label: 'Pseudonyme',
        hint: 'Votre pseudonyme sera affiché et utilisé sur le site pour les contributions, les add-ons et bien plus encore...'
      }
    },
    social: {
      title: 'Réseaux Sociaux',
      edit: {
        label: 'Éditer l\'URL de %s'
      },
      select: {
        label: 'Sélectionner un média'
      },
      new: {
        placeholder: 'https://www.exemple.com/',
        label: 'Nouveau réseau social'
      }
    }
  },
  files: {
    general: {
      name: {
        label: 'Nom de fichier',
        hint: 'Décrit brièvement le fichier',
        rules: {
          name_required: 'Un nom est requis.',
          name_too_big: 'Le nom de fichier doit faire moins de %s caractères.',
          name_too_small: 'Le nom de fichier doit faire plus de %s caractères.'
        }
      },
      use: {
        label: 'Utilisation de fichier',
        hint: 'Décrit l\'utilisation brièvement',
        rules: {
          name_required: 'Une valeur est requise.',
          name_too_big: 'L\'utilisation du fichier doit faire moins de %s caractères.',
          name_too_small: 'L\'utilisation du fichier doit faire plus de %s caractères.'
        }
      },
      type: {
        label: 'Type de fichier',
        hint: 'Décris le type de fichier',
        rules: {
          name_required: 'Une valeur est requise',
          name_too_big: 'Le type de fichier doit faire moins de %s caractères.',
          name_too_small: 'Le type de fichier doit faire plus de %s caractères.'
        }
      },
      parent: {
        type: {
          label: 'Type du parent du fichier',
          hint: 'Décris le type du parent du fichier',
          rules: {
            name_required: 'Une valeur est requise',
            name_too_big: 'Le type du parent du fichier doit faire moins de %s caractères.',
            name_too_small: 'Le type du parent du fichier doit faire plus de %s caractères.'
          }
        },
        id: {
          label: 'ID du parent du fichier',
          hint: 'Décris l\'ID du parent du fichier',
          rules: {
            name_required: 'Une valeur est requise',
            name_too_big: 'L\'ID du parent du fichier doit faire moins de %s caractères.',
            name_too_small: 'L\'ID   du parent du fichier doit faire plus de %s caractères.'
          }
        },
      },
      source: {
        label: 'File source',
        hint: 'File source URL',
        rules: {
          name_required: 'A file source URL is required.',
          name_too_big: 'File URL must be less than %s characters.',
          name_too_small: 'File URL must be at least %s characters long.'
        }
      },
      gallery: {
        title: 'Galerie',
        loading_message: {
          general: 'Chargement...',
          textures: 'Récupération des textures...',
          paths: 'Récupération des chemins de texture...',
          uses: 'Récupération des utilisations des textures...',
          contribution: 'Récupération des contributions...',
          contributors: 'Récupération des contributeurs...',
          tags: 'Récupération des tags de texture...'
        },
        error_message: {
          texture_not_done: 'La texture n\'a pas été faite !',
          user_not_found: 'Utilisateur Inconnu',
          contribution_not_found: 'Aucune contribution trouvée dans la base de donnée!'
        },
        category: {
          search: 'Rechercher',
          tags: 'Étiquettes',
          mc_version: 'Versions Minecraft',
          edition: 'Édition',
          resolution: 'Résolution'
        },
        modal: {
          items: {
            information: "information",
            authors: "auteurs",
            animated: "animée",
            model: "3D"
          },
          infos: {
            texture: "texture",
            uses: "utilisation(s)",
            paths: "chemin(s)"
          },
          tabs: {
            date: "Date",
            authors: "Auteur(s)",
            id: "ID",
            name: "Nom",
            tags: "Tags/Types",
            use_id: "ID de l'utilisation",
            use_name: "Nom de l'utilisation",
            editions: "Édition",
            texture_id: "ID de la texture",
            path_id: "ID du chemin",
            resource_pack_path: "Chemin dans le Resource Pack",
            mc_versions: "Version(s) Minecraft",
          }
        }
      }
    }
  },
  settings: {
    title: "Settings",
    label: {
      edit_raw: "Éditer le JSON",
      edit_editor: "Éditer avec l'éditeur visuel"
    }
  }
}