/**
 * Brazilian translation:
 * - Translated by:
 *    - @author PedroESP_01#4432 // Discord: <@316356926701043712>
 */

export default {
  global: {
    name: 'Faithful Web Application',
    logout: 'Sair',
    login: 'Entrar com Discord',
    ends_success: 'Sucesso',
    loading: 'Carregando, aguarde...',
    no_results: 'Nenhum resultado encontrado.',
    nyi: 'Não implementado ainda.',
    btn: {
      add: 'Adicionar',
      add_download: 'Adicionar download',
      submit: 'Enviar',
      cancel: 'Cancelar',
      close: 'Fechar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      ok: 'OK',
      yes: 'Sim',
      deny: 'Negar',
      approve: 'Aprovar',
      load_more: 'Carregar mais'
    },
    tabs: {
      user: {
        title: 'usuário',
        subtabs: {
          profile: 'perfil',
          statistics: 'estatísticas',
          gallery: 'galeria'
        }
      },
      addons: {
        title: 'add-ons',
        subtabs: {
          submissions: 'enviados',
          upload: 'enviar'
        }
      },
      modding: {
        title: 'mods',
        subtabs: {
          mod: 'enviar mod',
          modpack: 'enviar modpack'
        }
      },
      review: {
        title: 'reviews',
        subtabs: {
          addons: 'add-ons',
          translations: 'traduções'
        }
      },
      database: {
        title: 'banco de dados',
        subtabs: {
          contributions: 'contribuições',
          contributors: 'contribuidores',
          textures: 'texturas',
          mods: 'mods',
          modpacks: 'modpacks'
        }
      }
    },
    months: {
      jan: 'Jan',
      january: 'Janeiro',
      feb: 'Fev',
      february: 'Fevereiro',
      mar: 'Mar',
      march: 'Março',
      apr: 'Abr',
      april: 'Abril',
      may_: 'Mai',
      may: 'Mai',
      jun: 'Jun',
      june: 'Junho',
      jul: 'Jul',
      july: 'Julho',
      aug: 'Ago',
      august: 'Agosto',
      sep: 'Set',
      september: 'Setembro',
      oct: 'Out',
      october: 'Outubro',
      nov: 'Nov',
      november: 'Novembro',
      dec: 'Dez',
      december: 'Dezembro'
    }
  },
  database: {
    titles: {
      contributions: 'Contribuições',
      contributors: 'Contribuidores',
      textures: 'Texturas',
      add_contributor: 'Adicionar novo contribuidor',
      add_textures: 'Adicionar novas texturas',
      add_texture: 'Adicionar nova textura',
      add_use: 'Adicionar novo uso',
      add_path: 'Adicionar novo caminho',
      add_mc_version: 'Adicionar nova versão do Minecraft',
      change_path: 'Editar caminho',
      change_use: 'Editar uso',
      change_texture: 'Editar textura',
      change_contributor: 'Editar contribuidor',
      change_mc_version: 'Modificar uma versão do Minecraft',
      confirm_deletion: 'Confirmar exclusão'
    },
    subtitles: {
      add_manually: 'Adicionar manualmente',
      resolution: 'Resolução',
      contributor: 'Contribuidor',
      select_contributor_type: 'Selecionar o tipo de contribuidor',
      search: 'Buscar',
      texture_result: 'Resultados da textura',
      import_json_data: 'Importar dados em JSON',
      uses: 'Uso(s)',
      paths: 'Caminho(s)'
    },
    labels: {
      mcmeta: "Textura animada",
      new_mc_version_edition: 'Edição a adicionar a versão',
      new_mc_version_path: 'Versão do caminho a adicionar a versão',
      new_mc_version_name: 'Novo nome de versão',
      nameless: 'Sem nome',
      add_textures_success: 'Texturas adicionadas com sucesso',
      add_version_success: 'Versão adicionada com sucesso',
      add_new_contributor: 'Adicionar novo contribuidor',
      add_new_texture: 'Adicionar nova textura',
      add_new_path: 'Adicionar novo caminho',
      add_new_use: 'Adicionar novo uso',
      add_texture: 'Adicionar texturas',
      add_mc_version: 'Adicionar nova versão do Minecraft',
      ask_deletion: 'Você deseja excluir %s (%d)?',
      contributors_results: 'Resultados do contribuidor',
      contributor_type: 'Tipo do contribuidor',
      discord_id: 'ID do Discord',
      edit_mc_version: 'Modificar uma versão do Minecraft',
      one_contributor: 'Por favor escolha pelo menos um contribuidor',
      parse_json: 'Analisar JSON para dados',
      search_contributions: 'Buscar contribuições',
      search_username: 'Buscar nome de usuário',
      search_texture: 'Buscar nome de textura',
      select_texture_type: 'Selecionar tipo de textura',
      username: 'Nome de usuário',
      uuid: 'UUID do perfil do Minecraft',
      texture_name: 'Nome da textura',
      texture_type: 'Tipo da textura',
      texture_id: 'ID da textura',
      texture_uses: 'Uso(s) da textura',
      use_name: 'Nome do uso',
      use_id: 'ID do uso',
      use_edition: 'Edição do uso',
      path: 'Caminho',
      path_id: 'ID do caminho',
      versions: 'Versões',
      no_path_found: 'Nenhum caminho encontrado para esse uso.',
      no_use_found: 'Nenhum uso encontrado para essa textura.',
      actual_mc_version: 'Versão atual do Minecraft',
      new_mc_version: 'Nova versão do Minecraft'
    },
    hints: {
      texture_id: 'Alterar o ID da textura pode quebrar tudo',
      use_id: 'Alterar o ID do uso pode quebrar tudo',
      path_id: 'Alterar o ID do caminho pode quebrar tudo',
      warning_path: 'Uso precisa ser criado antes de adicionar caminhos a ele (no momento não é bem suportado e um pouco falho), adicionar caminho antes de criar o uso é planejado.',
      path: 'O caminho deve começar na pasta-mãe (ex.: assets/...)',
      example_scenario: 'Altera todas as instâncias de uma versão do Minecraft no banco de dados para uma diferente. (ex.: 1.17 → 1.17.1)',
      example_scenario_warn: 'Por favor não se esqueça de atualizar todos os nomes das ramificações no GitHub também!'
    }
  },
  review: {
    titles: {
      addons: 'Analisar add-ons',
      translation: 'Analisar traduções (em breve)',
      pending: 'Esperando aprovação',
      denied: 'Negado',
      approved: 'Aprovado'
    },
    deny_window: {
      label: 'Escreva um motivo...',
      rule: 'Qualquer motivo pode ser dado'
    },
    labels: {
      pending: 'Não há nenhum add-on pendente no momento!',
      denied: 'Não há nenhum add-on negado no momento!',
      load_approved: 'Carregar add-ons aprovados'
    },
    addon: {
      titles: {
        authors: 'Autor(es)',
        description: 'Descrição',
        links: 'Links',
        options: 'Configurações'
      },
      labels: {
        link: 'Link',
        comments: 'Comentários',
        optifine: 'OptiFine',
        approved_by: 'Aprovado por',
        denied_by: 'Negado por',
        reason: 'Motivo',
        old_addon: 'Add-on antigo, sem dados presentes nele.'
      }
    }
  },
  addons: {
    titles: {
      submit: 'Enviar um novo add-on',
      submissions: 'Enviados'
    },
    remove: {
      title: 'Confirmar exclusão',
      labels: {
        question: 'Você deseja excluir %s?',
        warning: 'Não é possível reverter essa operação.'
      }
    },
    general: {
      title: 'Geral',
      addon_title: {
        label: 'Título do add-on',
        // hint: 'O título não pode ser alterado após o envio!', // deprecated
        rules: {
          title_required: 'Um título é necessário.',
          title_too_big: 'O título deve conter menos que %s caracteres.',
          title_unavailable: 'Esse título já está sendo usado!'
        }
      },
      description: {
        label: 'Descrição do add-on',
        hint: 'Você pode utilizar a formatação Markdown para melhorar sua descrição!',
        rules: {
          description_required: 'A descrição é necessária.',
          description_too_big: 'A descrição deve conter menos que %s caracteres.'
        }
      },
      authors: {
        label: 'Selecionar autores do add-on',
        hint: 'Qualquer autor pode modificar o add-on após seu envio! | Se você não encontrar ninguém na lista que deveria estar nela, contate um administrador/desenvolvedor'
      }
    },
    images: {
      title: 'Imagens',
      header: {
        labels: {
          drop: 'Solte a imagem de cabeçalho aqui ou clique para selecioná-la.',
          normal: 'Imagem de cabeçalho',
          replace: 'Substituir imagem de cabeçalho'
        },
        rules: {
          image_size: 'O tamanho da imagem deve ser menor que %s KB! Use https://compressor.io/ para comprimi-la.',
          image_ratio: 'Proporção errada: a imagem fornecida não tem uma proporção lateral de 16:9.',
          image_required: 'Uma imagem de cabeçalho é necessária.'
        }
      },
      carousel: {
        labels: {
          drop: 'Solte imagem(ns) adicional(is) aqui, ou clique para selecioná-la(s).',
          normal: 'Imagem(ns) adicional(is)',
          replace: 'Substituir imagem(ns) adicional(is)'
        },
        rule: 'Proporção errada: Imagem(ns) sem uma proporção lateral de 16:9 foram removidas.'
      }
    },
    options: {
      title: 'Configurações',
      comments: {
        label: 'Ativar comentários'
      },
      optifine: {
        label: 'Requer OptiFine'
      },
      editions: {
        label: 'Edição(ões) suportada(s)',
        rule: 'Você precisa selecionar pelo menos 1 edição.'
      },
      resolutions: {
        label: 'Resolução(ões) suportada(s)',
        rule: 'Você precisa selecionar pelo menos 1 resolução.'
      }
    },
    downloads: {
      title: 'Downloads',
      name: {
        placeholder: 'CurseForge, GitHub...',
        label: 'Nome',
        rules: {
          name_required: 'Um nome é necessário..',
          name_cannot_be_empty: 'O nome não pode ser vazio.'
        }
      },
      link: {
        placeholder: 'https://www.example.com/',
        label: 'Link',
        rule: 'URL deve ser válido.'
      }
    },
    status: {
      approved: 'Aprovado',
      denied: 'Negado',
      pending: 'Pendente'
    }
  },
  statistics: {
    title: 'Estatísticas de contribuição',
    label: {
      textures: 'Texturas',
      contributors: 'Contribuidores',
      contributions: 'Contribuições'
    }
  },
  profile: {
    title: 'Perfil',
    general: {
      title: 'Geral',
      uuid: {
        label: 'UUID do perfil do Minecraft',
        hint: 'Sua skin será mostrada em envios de sua autoria.'
      },
      username: {
        label: 'Nome de usuário',
        hint: 'Seu nome de usuário será mostrado e usado no Website em contribuições, add-ons etc.'
      }
    },
    social: {
      title: 'Links sociais',
      edit: {
        label: 'Editar URL de %s'
      },
      select: {
        label: 'Selecionar site'
      },
      new: {
        placeholder: 'https://www.example.com/',
        label: 'Nova rede social'
      }
    }
  },
  gallery: {
    title: 'Galeria',
    loading_message: {
      general: 'Carregando...',
      textures: 'Carregando texturas...',
      paths: 'Carregando caminhos das texturas...',
      uses: 'Carregando usos das texturas...',
      contribution: 'Carregando contribuições...',
      contributors: 'Carregando contribuidores...',
      tags: 'Carregando tags das texturas...'
    },
    error_message: {
      texture_not_done: 'Textura não concluída!',
      user_not_found: 'Usuário desconhecido',
      contribution_not_found: 'Nenhuma contribuição encontrada no banco de dados!'
    },
    category: {
      search: 'Buscar',
      tags: 'Tags',
      mc_version: 'Versão do Minecraft',
      edition: 'Edição',
      resolution: 'Resolução'
    },
    modal: {
      items: {
        information: "informações",
        authors: "autores",
        animated: "animadas",
        model: "3D"
      },
      infos: {
        texture: "textura",
        uses: "uso(s)",
        paths: "caminho(s)"
      },
      tabs: {
        date: "Data",
        authors: "Autor(es)",
        id: "ID",
        name: "Nome",
        tags: "Tags/Tipos",
        use_id: "ID do uso",
        use_name: "Nome do uso",
        editions: "Edição",
        texture_id: "ID da textura",
        path_id: "ID do caminho",
        resource_pack_path: "Caminho do pacote de recursos",
        mc_versions: "Versão(ões) do Minecraft",
      }
    }
  }
}