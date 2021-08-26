/**
 * This file would be used as base for all languages
 */

export default {
  global: {
    name: 'Compliance Web Application',
    logout: 'Logout',
    login: 'Login via Discord',
    ends_success: 'Ended successfully',
    loading: 'Loading, please wait...',
    no_results: 'No results were found.',
    btn: {
      add: 'Add',
      add_download: 'Add Download',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      ok: 'OK',
      yes: 'yes',
      deny: 'Deny',
      approve: 'Approve',
      load_more: 'Load More'
    },
    tabs: {
      user: {
        title: 'user',
        subtabs: {
          profile: 'profile',
          statistics: 'statistics'
        }
      },
      addons: {
        title: 'add-on',
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
        title: 'review',
        subtabs: {
          addons: 'add-ons',
          translations: 'translations'
        }
      },
      database: {
        title: 'database',
        subtabs: {
          contributions: 'contributions',
          contributors: 'contributors',
          textures: 'textures',
          mods: 'mods',
          modpacks: 'modpacks'
        }
      }
    }
  },
  database: {
    titles: {
      contributions: 'Contributions',
      contributors: 'Contributors',
      textures: 'Textures',
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
      contributor: 'Contributor',
      select_contributor_type: 'Select contributor type',
      search: 'Search',
      texture_result: 'Texture results',
      import_json_data: 'Import JSON data',
      uses: 'Use(s)',
      paths: 'Path(s)'
    },
    labels: {
      new_mc_version_edition: 'Edition to add version to',
      new_mc_version_path: 'Path version to add version to',
      new_mc_version_name: 'New version name',
      nameless: 'Nameless',
      add_textures_success: 'Added textures successfully',
      add_version_success: 'Added version successfully',
      add_new_contributor: 'Add new Contributor',
      add_new_texture: 'Add new texture',
      add_new_path: 'Add new path',
      add_new_use: 'Add new use',
      add_texture: 'Add textures',
      add_mc_version: 'Add new Minecraft Version',
      ask_deletion: 'Do you want to delete %s (%d)?',
      contributors_results: 'Contributors results',
      contributor_type: 'Contributor type',
      discord_id: 'Discord ID',
      edit_mc_version: 'Modify a Minecraft Version',
      one_contributor: 'Please choose at least one contributor',
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
      no_path_found: 'No paths found for this texture.',
      no_use_found: 'No uses found for this texture.',
      actual_mc_version: 'Actual MC Version',
      new_mc_version: 'New MC Version'
    },
    hints: {
      texture_id: 'Changing the Texture ID can break everything',
      use_id: 'Changing the Use ID can break everything',
      path_id: 'Changing the Path ID can break everything',
      warning_path: 'Use needs to be created before adding paths to it (currently not well supported & kinda buggy), adding path before creating the use is planned.',
      path: 'The path should start from the root directory (ex: assets/...)',
      example_scenario: 'Hm, the whole database is setup to upload texture to the 1.17 branch but there is now a 1.17.1 available, this options is made for you!',
      example_scenario_warn: 'Please don\'t forget to also update all GitHub branches!'
    }
  },
  review: {
    titles: {
      addons: 'Review Add-ons',
      translation: 'Review Translations(Soon)',
      pending: 'Pending Approval'
    },
    deny_window: {
      label: 'Write a reason...',
      rule: 'Any reason needs to be given'
    },
    labels: {
      pending: 'There is currently no Pending add-ons!',
      denied: 'There is currently no Denied add-ons!',
      load_approved: 'Load Approved Add-ons'
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
        old_addon: 'Old Add-on, no data about it.'
      }
    }
  },
  addons: {
    titles: {
      submit: 'Submit a new Add-on',
      submissions: 'Submissions'
    },
    general: {
      title: 'General',
      addon_title: {
        label: 'Add-on title',
        hint: 'The title can\'t be changed after the submission!',
        rules: {
          title_required: 'A title is required',
          title_too_big: 'Title must be less than %s characters.',
          title_unavailable: 'This title is already taken!'
        }
      },
      description: {
        label: 'Add-on description',
        hint: 'You can use Markdown balises to improve your description!',
        rules: {
          description_required: 'The description is required',
          description_too_big: 'Description must be less than %s characters.'
        }
      },
      authors: {
        label: 'Select authors for that add-on',
        hint: 'Any authors can modify the Add-on once it is submitted | If you don\'t find someone in the list, contact an Administrator/Developer'
      }
    },
    images: {
      title: 'Screenshots',
      header: {
        labels: {
          normal: 'Header image',
          replace: 'Replace header image'
        },
        rules: {
          image_size: 'Image should be less than %s KB!',
          image_ratio: 'Wrong Ratio: The provided image doesn\'t have a 16:9 ratio.',
          image_required: 'A header image is required'
        }
      },
      carousel: {
        labels: {
          normal: 'Additional image(s)',
          replace: 'Replace additional image(s)'
        },
        rule: 'Wrong Ratio: Image(s) with non 16:9 ratio have been removed.'
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
        placeholder: 'CurseForge, GitHub...',
        label: 'Name',
        rules: {
          name_required: 'Title is required',
          name_cannot_be_empty: 'Title can\'t be empty'
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
    title: 'Contributions Statistics',
    label: {
      textures: 'Textures',
      contributores: 'Contributors',
      contributions: 'Contributions'
    }
  },
  profile: {
    title: 'Profile',
    general: {
      title: 'General',
      uuid: {
        label: 'Minecraft profile UUID',
        hint: 'Your skin will be displayed on your pages'
      },
      username: {
        label: 'Website Username',
        hint: 'Your username will be displayed and used on the Website for contributions, add-ons and more...'
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
  }
}
