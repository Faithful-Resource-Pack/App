/**
 * This file would be used as base for all languages
 */

export default {
  global: {
    name: 'Faithful Web Application',
    logout: 'Log Out',
    login: 'Log in via Discord',
    ends_success: 'Completed successfully',
    loading: 'Loading, please wait…',
    no_results: 'No results were found.',
    nyi: 'Not yet implemented.',
    snackbar_system_theme: {
      sentence: 'System theme changed to %s',
      themes: {
        light: 'light',
        dark: 'dark'
      }
    },
    btn: {
      add: 'Add',
      add_download: 'Add Download',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      ok: 'OK',
      yes: 'Yes',
      deny: 'Deny',
      approve: 'Approve',
      load_more: 'Load More'
    },
    tabs: {
      user: {
        title: 'user',
        subtabs: {
          profile: 'profile',
          statistics: 'statistics',
          gallery: 'gallery'
        }
      },
      addons: {
        title: 'add-ons',
        subtabs: {
          submissions: 'submissions',
          upload: 'upload'
        }
      },
      modding: {
        title: 'modding',
        subtabs: {
          mod: 'submit mod',
          modpack: 'submit modpack'
        }
      },
      review: {
        title: 'reviews',
        subtabs: {
          addons: 'add-ons',
          translations: 'translations'
        }
      },
      database: {
        title: 'database',
        subtabs: {
          contributions: 'contributions',
          users: 'users',
          textures: 'textures',
          files: 'files',
          mods: 'mods',
          modpacks: 'modpacks',
          settings: 'settings'
        }
      }
    },
    months: {
      jan: 'Jan',
      january: 'January',
      feb: 'Feb',
      february: 'February',
      mar: 'Mar',
      march: 'March',
      apr: 'Apr',
      april: 'April',
      may_: 'May', // longer
      may: 'May',
      jun: 'Jun',
      june: 'June',
      jul: 'Jul',
      july: 'July',
      aug: 'Aug',
      august: 'August',
      sep: 'Sep',
      september: 'September',
      oct: 'Oct',
      october: 'October',
      nov: 'Nov',
      november: 'November',
      dec: 'Dec',
      december: 'December'
    }
  },
  database: {
    titles: {
      contributions: 'Contributions',
      contributors: 'Contributors',
      textures: 'Textures',
      files: 'Files',
      add_contributor: 'Add new contributor',
      add_textures: 'Add new textures',
      add_texture: 'Add new texture',
      add_use: 'Add new use',
      add_path: 'Add new path',
      add_mc_version: 'Add new Minecraft version',
      change_path: 'Edit path',
      change_use: 'Edit use',
      change_texture: 'Edit texture',
      change_contributor: 'Edit contributor',
      change_mc_version: 'Modify a Minecraft Version',
      confirm_deletion: 'Confirm deletion'
    },
    subtitles: {
      add_manually: 'Add manually',
      resolution: 'Resolution',
      pack: 'Resource Packs',
      contributor: 'User',
      select_contributor_type: 'Select user roles',
      search: 'Search',
      texture_result: 'Texture results',
      import_json_data: 'Import JSON data',
      uses: 'Usage(s)',
      paths: 'Path(s)'
    },
    labels: {
      anonymous: 'Anonymous',
      anonymous_explain: 'If checked, the user\'s name will be displayed as "Anonymous" and their skin won\'t show up. Can only be changed by administrators!',
      mcmeta: 'Animated texture',
      new_mc_version_edition: 'Edition to add the version to',
      new_mc_version_path: 'Path version to add the version to',
      new_mc_version_name: 'New version name',
      nameless: 'Nameless',
      add_textures_success: 'Added textures successfully',
      add_version_success: 'Added version successfully',
      add_new_contributor: 'Add new user',
      add_new_texture: 'Add new texture',
      add_new_path: 'Add new path',
      add_new_use: 'Add new use',
      add_texture: 'Add textures',
      add_mc_version: 'Add new Minecraft Version',
      ask_deletion: 'Do you want to delete %s (%d)?',
      contributors_results: 'Users results',
      contributor_type: 'User roles',
      discord_id: 'Discord ID',
      edit_mc_version: 'Modify a Minecraft Version',
      one_contributor: 'Please choose at least one user',
      parse_json: 'Parse JSON to data',
      search_contributions: 'Search contributions',
      search_username: 'Search username',
      search_texture: 'Search texture name',
      select_texture_type: 'Select texture type',
      username: 'Username',
      uuid: 'Minecraft profile UUID',
      texture_name: 'Texture name',
      texture_type: 'Texture type',
      texture_id: 'Texture ID',
      texture_uses: 'Texture use(s)',
      use_name: 'Use name',
      use_id: 'Use ID',
      use_edition: 'Use edition',
      path: 'Path',
      path_id: 'Path ID',
      versions: 'Versions',
      no_path_found: 'No paths found for this use.',
      no_use_found: 'No uses found for this texture.',
      actual_mc_version: 'Current MC Version',
      new_mc_version: 'New MC Version'
    },
    hints: {
      texture_id: 'Changing the Texture ID can break everything!',
      use_id: 'Changing the Use ID can break everything!',
      path_id: 'Changing the Path ID can break everything!',
      warning_path: 'Use needs to be created before adding paths to it (currently not well supported and a bit buggy). Adding path before creating the use is planned.',
      path: 'The path should start from the root directory (ex: assets/…)',
      example_scenario: 'Changes all instances of a Minecraft version in the database to a different one. (ex. 1.17 → 1.17.1)',
      example_scenario_warn: "Please don't forget to update all GitHub branch names as well!"
    }
  },
  review: {
    titles: {
      addons: 'Review Add-ons',
      translation: 'Review Translations',
      pending: 'Pending Approval',
      denied: 'Denied',
      approved: 'Approved'
    },
    deny_window: {
      label: 'Write a reason…',
      rule: 'Any reason can be given'
    },
    labels: {
      pending: 'There are currently no pending add-ons!',
      denied: 'There are currently no denied add-ons!',
      load_approved: 'Load approved Add-ons'
    },
    addon: {
      titles: {
        authors: 'Author(s)',
        description: 'Description',
        links: 'Links',
        options: 'Options'
      },
      labels: {
        link: 'Link',
        comments: 'Comments',
        optifine: 'OptiFine',
        approved_by: 'Approved by',
        denied_by: 'Denied by',
        reason: 'Reason',
        old_addon: 'Old Add-on, no data present for it.'
      }
    },
    translations: {
      description: 'This page has been moved to'
    }
  },
  addons: {
    titles: {
      submit: 'Submit a new Add-on',
      edit: 'Edit addon',
      submissions: 'Submissions',
      details: 'Details'
    },
    remove: {
      title: 'Confirm deletion',
      labels: {
        question: 'Do you want to delete %s?',
        warning: "You can't undo this operation."
      }
    },
    general: {
      loading_addon: 'Loading addon',
      title: 'General',
      name: {
        label: 'Add-on name',
        hint: 'A short name is preferred.',
        rules: {
          name_required: 'A name is required.',
          name_too_big: 'Add-on name must be less than %s characters.',
          name_too_small: 'Add-on name must be at least %s characters long.',
          name_unavailable: 'This name is already taken!'
        }
      },
      description: {
        label: 'Add-on description',
        hint: 'You can use Markdown formatting to improve your description!',
        rules: {
          description_required: 'The description is required.',
          description_too_big: 'Description must be less than %s characters.',
          description_too_small: 'Description must be at least %s characters long.'
        }
      },
      authors: {
        label: 'Select authors for the add-on',
        hint: "Any author can modify the Add-on once it is submitted! | If you can't find anybody in the list, contact an Administrator/Developer"
      }
    },
    images: {
      title: 'Screenshots',
      header: {
        labels: {
          drop: 'Drop header image here, or click to select it.',
          normal: 'Header image',
          replace: 'Replace header image'
        },
        rules: {
          image_size: 'Image size should be less than %s KB! Use https://compressor.io/ to compress it.',
          image_ratio: "Wrong Ratio: The provided image doesn't have a 16:9 side ratio.",
          image_required: 'A header image is required.'
        }
      },
      carousel: {
        labels: {
          drop: 'Drop additional image(s) here, or click to select them.',
          normal: 'Additional image(s)',
          replace: 'Replace additional image(s)'
        },
        rule: 'Wrong Ratio: All images with a side ratio other than 16:9 have been removed.'
      }
    },
    options: {
      title: 'Options',
      comments: {
        label: 'Enable comments'
      },
      optifine: {
        label: 'Requires OptiFine'
      },
      editions: {
        label: 'Supported edition(s)',
        rule: 'You need to select at least 1 edition.'
      },
      resolutions: {
        label: 'Supported resolution(s)',
        rule: 'You need to select at least 1 resolution.'
      }
    },
    downloads: {
      title: 'Downloads',
      name: {
        placeholder: 'CurseForge, GitHub…',
        label: 'Name',
        rules: {
          name_required: 'A name is required.',
          name_cannot_be_empty: "Name can't be empty."
        }
      },
      link: {
        placeholder: 'https://www.example.com/',
        label: 'Link',
        rule: 'URL must be valid.'
      }
    },
    status: {
      approved: 'Approved',
      denied: 'Denied',
      pending: 'Pending'
    }
  },
  statistics: {
    title: 'Contribution Statistics',
    label: {
      textures: 'Textures',
      contributors: 'Contributors',
      contributions: 'Contributions'
    }
  },
  profile: {
    title: 'Profile',
    general: {
      title: 'General',
      uuid: {
        label: 'Minecraft profile UUID',
        hint: 'Your skin will be displayed in submissions you authored.'
      },
      username: {
        label: 'Username',
        hint: 'Your username will be displayed and used on the Website for contributions, add-ons etc.'
      }
    },
    social: {
      title: 'Social Links',
      edit: {
        label: 'Edit %s URL'
      },
      select: {
        label: 'Select media'
      },
      new: {
        placeholder: 'https://www.example.com/',
        label: 'New social media'
      }
    }
  },
  files: {
    general: {
      name: {
        label: 'File name',
        hint: 'Name describes shortly the file',
        rules: {
          name_required: 'A name is required.',
          name_too_big: 'File name must be less than %s characters.',
          name_too_small: 'File name must be at least %s characters long.'
        }
      },
      use: {
        label: 'File use',
        hint: 'Describes short use',
        rules: {
          name_required: 'A value is required.',
          name_too_big: 'File use must be less than %s characters.',
          name_too_small: 'File use must be at least %s characters long.'
        }
      }
    }
  },
  gallery: {
    title: 'Gallery',
    loading_message: {
      general: 'Loading…',
      textures: 'Getting textures…',
      paths: 'Getting texture paths…',
      uses: 'Getting texture uses…',
      contribution: 'Getting contributions…',
      contributors: 'Getting contributors…',
      tags: 'Getting texture tags…'
    },
    error_message: {
      texture_not_done: 'Texture not done!',
      user_anonymous: 'Anonymous',
      user_not_found: 'Unknown User',
      contribution_not_found: 'No contributions found in database!'
    },
    category: {
      search: 'Search',
      tags: 'Tags',
      mc_version: 'Minecraft Version',
      edition: 'Edition',
      resolution: 'Resolution'
    },
    all: 'all',
    modal: {
      items: {
        information: 'information',
        authors: 'authors',
        animated: 'animated',
        model: '3D'
      },
      type: {
        label: 'File type',
        hint: 'Describes the type of file giveb',
        rules: {
          name_required: 'A value is required.',
          name_too_big: 'File type must be less than %s characters.',
          name_too_small: 'File type must be at least %s characters long.'
        }
      },
      parent: {
        type: {
          label: 'File parent type',
          hint: 'Describes the file parent type',
          rules: {
            name_required: 'A file type is required.',
            name_too_big: 'File parent type must be less than %s characters.',
            name_too_small: 'File parent type must be at least %s characters long.'
          }
        },
        id: {
          label: 'File parent ID',
          hint: 'Describes the reference to the parent file',
          rules: {
            name_required: 'A file parent ID is required.',
            name_too_big: 'File parent ID must be less than %s characters.',
            name_too_small: 'File parent ID must be at least %s characters long.'
          }
        }
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
      infos: {
        texture: 'texture',
        uses: 'use(s)',
        paths: 'path(s)'
      },
      tabs: {
        date: 'Date',
        authors: 'Author(s)',
        id: 'ID',
        name: 'Name',
        tags: 'Tags/Types',
        use_id: 'Use ID',
        use_name: 'Use Name',
        editions: 'Edition',
        texture_id: 'Texture ID',
        path_id: 'Path ID',
        resource_pack_path: 'Resource Pack Path',
        mc_versions: 'Minecraft Version(s)'
      }
    },
    gallery: {
      title: 'Gallery',
      loading_message: {
        general: 'Loading…',
        textures: 'Getting textures…',
        paths: 'Getting texture paths…',
        uses: 'Getting texture uses…',
        contribution: 'Getting contributions…',
        contributors: 'Getting contributors…',
        tags: 'Getting texture tags…'
      },
      error_message: {
        texture_not_done: 'Texture not done!',
        user_not_found: 'Unknown User',
        contribution_not_found: 'No contributions found in database!'
      },
      category: {
        search: 'Search',
        tags: 'Tags',
        mc_version: 'Minecraft Version',
        edition: 'Edition',
        resolution: 'Resolution'
      }
    }
  },
  settings: {
    title: 'Settings',
    label: {
      edit_raw: 'Edit raw JSON',
      edit_editor: 'Edit with visual editor'
    }
  }
}
