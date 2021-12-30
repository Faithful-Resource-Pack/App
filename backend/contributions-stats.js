const contri = require('../helpers/firestorm/contributions')
const settings = require('../resources/settings.json')
const moment = require('moment')
const { Repository } = require("nodegit")
const { tmpdir } = require('os')
const { join, normalize } = require('path')
const { existsSync, readdirSync, statSync } = require('fs')
const { exec, series } = require('../helpers/exec').promises
const { mkdir, stat } = require('fs/promises')
const { sorterMC } = require('../helpers/sorterMC')

const includesNone = function (arr, val) {
  let result = true

  let i = 0
  while (i < arr.length && result) {
    result = !val.includes(arr[i])
    ++i
  }

  return result
}


const COMPLIANCE_REPOS = {
  java: {
    '32': settings.repositories.raw.c32.java + 'Jappa-',
    '64': settings.repositories.raw.c64.java + 'Jappa-'
  },
  bedrock: {
    '32': settings.repositories.raw.c32.bedrock + 'Jappa-',
    '64': settings.repositories.raw.c64.bedrock + 'Jappa-'
  }
}

const ESCAPER = '+'
const RES_REPLACER = ESCAPER + 'RES' + ESCAPER
const EDITION_REPLACER = ESCAPER + 'EDITION' + ESCAPER
const PERCENT_REPLACER = ESCAPER + 'PERCENT' + ESCAPER
const CHANNEL_NAME_TEMPLATE = `${RES_REPLACER}x ${EDITION_REPLACER}: ${PERCENT_REPLACER}%`

const normalizeArray = (arr) => arr.map(e => normalize(e))

const _getAllFilesFromFolder = function (dir, filter = []) {
  let results = []

  readdirSync(dir).forEach(function (file) {
    file = normalize(join(dir, file))
    const stat = statSync(file)

    if (!file.includes('.git')) {
      if (stat && stat.isDirectory()) {
        results = results.concat(_getAllFilesFromFolder(file, filter))
      } else {
        if (file.endsWith('.png') && includesNone(filter, file)) {
          results.push(file)
        }
      }
    }
  })
  return results
};

const BEDROCK_UI = [
  "ui/Black.png",
  "ui/5stars_empty.png",
  "ui/5stars_empty_white.png",
  "ui/5stars_full.png",
  "ui/CreateNewWorld.png",
  "ui/DarkBannerNoBorder.png",
  "ui/Gray.png",
  "ui/Grey.png",
  "ui/HowToPlayDivider.png",
  "ui/InvalidWorldDemoScreen.png",
  "ui/LoadingWorldDemoScreen.png",
  "ui/NetherPortal.png",
  "ui/NetherPortalMirror.png",
  "ui/PlaceholderStore.png",
  "ui/RTX_Sparkle.png",
  "ui/RealmDemoScreen.png",
  "ui/Scaffolding.png",
  "ui/ScrollRail.png",
  "ui/StoreTopBarFiller.png",
  "ui/ThinPlus.png",
  "ui/WorldDemoScreen.png",
  "ui/banners_no_border.png",
  "ui/banners_no_border_dark_hover.png",
  "ui/barely_visible_creeper.png",
  "ui/bonus_banner.png",
  "ui/box_number_grey.png",
  "ui/break.png",
  "ui/button_borderless_imagelesshoverbg.png",
  "ui/button_dark_color.png",
  "ui/control.png",
  "ui/dark_bg.png",
  "ui/dark_minus.png",
  "ui/dark_plus.png",
  "ui/disabledButtonNoBorder.png",
  "ui/divider",
  "ui/dropDownHoverBG.png",
  "ui/dropDownSelectBG.png",
  "ui/easily_visible_creeper.png",
  "ui/feedIcon.png",
  "ui/feed_background.png",
  "ui/first_of_three.png",
  "ui/first_of_two.png",
  "ui/glyph_mashup_pack.png",
  "ui/glyph_realms.png",
  "ui/glyph_resource_pack.png",
  "ui/glyph_skin_pack.png",
  "ui/glyph_world_template.png",
  "ui/hammersmashedits.png",
  "ui/highlight_slot.png",
  "ui/ic_send_white_48dp.png",
  "ui/icon_agent.png",
  "ui/imagetaggedcorner.png",
  "ui/imagetaggedcornergreen.png",
  "ui/imagetaggedcornergreenhover.png",
  "ui/imagetaggedcornergreenpressed.png",
  "ui/inventory_warning_xbox.png",
  "ui/lightgreybars.png",
  "ui/list_item_divider_line_light.png",
  "ui/massive_servers.png",
  "ui/menubackground.png",
  "ui/middle_strip.png",
  "ui/minus.png",
  "ui/newTouchScrollBox.png",
  "ui/normalArm.png",
  "ui/normalHeight.png",
  "ui/not_visible_creeper.png",
  "ui/numberBGBack.png",
  "ui/numberBGFront.png",
  "ui/packs_middle.png",
  "ui/particles",
  "ui/permissions_player_fade_overlay.png",
  "ui/pinksquare.png",
  "ui/pinktriangle.png",
  "ui/plus.png",
  "ui/pointer.png",
  "ui/profile_new_look.png",
  "ui/profile_new_look_small.png",
  "ui/promo_bee.png",
  "ui/promo_chicken.png",
  "ui/promo_creeper.png",
  "ui/promo_pig_sheep.png",
  "ui/promo_spider.png",
  "ui/promo_wolf.png",
  "ui/purple_gradient.png",
  "ui/rating_screen.png",
  "ui/ratings_fullstar.png",
  "ui/ratings_nostar.png",
  "ui/realmflagSmooth.png",
  "ui/realmflagtriangleSmooth.png",
  "ui/realms_art_icon.png",
  "ui/realms_key_art.png",
  "ui/realms_particles.png",
  "ui/realms_text_background.png",
  "ui/realmsparkle.png",
  "ui/realmsparkle1.png",
  "ui/recipe_book_pane_bg.png",
  "ui/recipe_book_pane_bg.png",
  "ui/ribbon_bar_text_background_hover.png",
  "ui/saleflag.png",
  "ui/saleflagtriangle.png",
  "ui/screen_background.png",
  "ui/screen_realms_plus_background.png",
  "ui/second_of_three.png",
  "ui/second_of_two.png",
  "ui/shadow.png",
  "ui/slider_background.png",
  "ui/slider_background_hover.png",
  "ui/slider_locked_transparent_fade.png",
  "ui/slider_progress.png",
  "ui/slider_progress_hover.png",
  "ui/slider_step_background.png",
  "ui/slider_step_background_hover.png",
  "ui/slider_step_progress.png",
  "ui/slider_step_progress_hover.png",
  "ui/smallHeight.png",
  "ui/smallerHeight.png",
  "ui/smithing-table-plus.png",
  "ui/solidtransparency.png",
  "ui/store_background.png",
  "ui/store_banner_no_border.png",
  "ui/store_play_button_mask.png",
  "ui/storexblsignin.png",
  "ui/strikethru.png",
  "ui/sunset_keyart.png",
  "ui/sunset_pending_keyart.png",
  "ui/tallHeight.png",
  "ui/third_of_three.png",
  "ui/thinArm.png",
  "ui/title.png",
  "ui/tooltip_notification_default_background.png",
  "ui/touchScrollBox.png",
  "ui/underline.png",
  "ui/underline_focus.png",
  "ui/unsynced_bg_hover.png",
  "ui/user_icon.png",
  "ui/user_icon_small.png",
  "ui/user_icon_white.png",
  "ui/vertical_divider.png",
  "ui/verticalgradient.png",
  "ui/warning_alex.png",
  "ui/white_background.png",
  "ui/whiteline.png",
  "ui/yellow_banner.png",
  "entity/horse2/armor/horse_armor_none.png",
  "entity/horse2/horse_markings_none"
]

const VANILLA_REPOS = {
  java: settings.repositories.raw.default.java,
  bedrock: settings.repositories.raw.default.bedrock
}

const REPLACE_URLS = [
  ['raw.githubusercontent.com', 'github.com'],
  ['Jappa-', '']
]

const _rawToRepoURL = function (val) {
  let result = val
  REPLACE_URLS.forEach(pair => {
    result = result.replace(pair[0], pair[1])
  })
  return result
}

const FOLDERS_NAMES = {
  vanilla: 'vanilla',
  compliance: 'compliance'
}

/**
 * @param {import('nodegit').Commit} commit Studied commit
 * @param {Array} vanilla_textures vanilla normalized textures list 
 * @returns {Promise}
 */
const addToHistory = function(commit, vanilla_textures) {
  const result = {}
  result.message = commit.message()
  result.date = commit.date()
  result.sha = commit.sha()
  result.files = {}

  return new Promise((resolve, reject) => {
    // resolve this commit diff
    let promises = [commit.getDiff()]

    // if parentId != null, there is a parent, so push the parent commit request to the promises
    if(!!commit.parentId(0)) promises.push(commit.parent(0))

    Promise.all(promises)
      .then(results => {
        // you get a diff array of the commit (only one element)
        // and if no parent the parent commit promises was not added so the value is undefined
        let [diffs, parent] = results

        // there is always one diff with one commit diff
        const diff = diffs[0]

        // if parent commit, get parent history, else there is no history so empty array
        const previousValue = !!parent ? addToHistory(parent, vanilla_textures) : Promise.resolve([])

        // resolva all promises please
        return Promise.all([diff.patches(), previousValue])
      })
      .then(results => {
        let [patches, previous] = results

        // get new file names, old ones not interesting
        const concernedFiles = patches.map(p => p.newFile())

        // get the normalized versions of paths concerned
        const concernedPaths = concernedFiles.map(f => f.path()).map(p => normalize(p))
  
        // use as key the path and as value a letter
        patches.forEach((patch, i) => {
          let val
          if(patch.isAdded()) val = 'A'
          else if(patch.isDeleted()) val = 'D'
          // else if(patch.isCopied()) val = 'C'
          // else if(patch.isRenamed()) val = 'R'
          // else if(patch.isModified()) val = 'M'
          else if(patch.isUntracked()) val = 'D'

          const path = concernedPaths[i]
          if(val && vanilla_textures.includes(path) && !BEDROCK_UI.includes(path)) {
            result.files[path] = val
          }
        })

        // agregate results smartly (if files)

        if(Object.keys(result.files).length > 0) {
          resolve([...previous, result]) 
        } else {
          resolve(previous)
        }
      }).catch(err => {
        reject(err)
      })
  })
}

module.exports = {
  stats: function() {
    return contri.read_raw()
      .then(res => {

        res = Object.values(res)

        let result = {
          totalTextures: 0,
          totalContributors: 0,
          totalContributions: res.length,
          contrib: []
        }

        const contributors = res.map(el => el.contributors).flat()
        const textures = res.map(el => el.textureID)
        let resolutions = res.map(el => el.res)
        resolutions.filter((el, index) => contributors.indexOf(el) === index)

        result.totalContributors = contributors.filter((el, index) => contributors.indexOf(el) === index).length
        result.totalTextures = textures.filter((el, index) => textures.indexOf(el) === index).length

        result.contrib = Object.values(res.reduce((ac, val) => {
          val.date = moment(new Date(val.date)).startOf('day').unix() * 1000

          if(!(val.date in ac)) {
            // start for date
            ac[val.date] = {
              date: val.date,
              res: {}
            }

            // start all res to 0
            resolutions.forEach(resval => {
              ac[val.date].res[resval] = 0
            })
          }

          ac[val.date].res[val.res]++

          return ac
        }, {}))

        result.contrib.sort((a, b) => a.date - b.date)

        return result
      })
  },
  history: async function() {
    let cbval // = undefined
    const out = () => { return Promise.resolve() }

    const edition = 'java'
    const res = '32'

    const vanilla_repo = _rawToRepoURL(VANILLA_REPOS[edition])
    const compliance_repo = _rawToRepoURL(COMPLIANCE_REPOS[edition][res])

    let tmp_filepath = normalize(tmpdir())
    let vanilla_tmp_path, compliance_tmp_path

    vanilla_tmp_path = join(tmp_filepath, 'missing-' + FOLDERS_NAMES.vanilla + '-' + edition)
    compliance_tmp_path = join(tmp_filepath, 'missing-' + FOLDERS_NAMES.compliance + '-' + edition + '-' + res)

    console.log(vanilla_tmp_path, compliance_tmp_path)
    
     let exists = existsSync(vanilla_tmp_path)
    if (!exists) {
      await out(`Downloading vanilla ${edition} pack...`).catch(err => {
        cbval = err
      })
      if(cbval !== undefined) return Promise.reject(cbval)

      await mkdir(vanilla_tmp_path)
      await exec(`git clone ${vanilla_repo} .`, {
        cwd: vanilla_tmp_path
      })
    }
    exists = existsSync(compliance_tmp_path)
    if (!exists) {
      await out(`Downloading Compliance ${res}x ${edition} pack...`).catch(err => {
        cbval = err
      })
      if(cbval !== undefined) return Promise.reject(cbval)

      await mkdir(compliance_tmp_path)
      await exec(`git clone ${compliance_repo} .`, {
        cwd: compliance_tmp_path
      })
  }

    await out('Updating packs with latest version known...').catch(err => {
      cbval = err
    })
    if(cbval !== undefined) return Promise.reject(cbval)

    const last_version = edition === 'bedrock' ? settings.versions.bedrock[0] : settings.versions.java.sort(sorterMC).reverse()[0]

    // anyway stash
    // checkout latest branch
    // pull
    await Promise.all([
      series([
        'git stash',
        `git checkout ${last_version}`,
        `git pull`
      ], {
        cwd: vanilla_tmp_path
      }),
      series([
        'git stash',
        `git checkout Jappa-${last_version}`,
        `git pull`
      ], {
        cwd: compliance_tmp_path
      })
    ]).catch(err => {
      cbval = err
    })
    if(cbval !== undefined) return Promise.reject(cbval)

    await out(`Searching for differences...`).catch(err => {
      cbval = err
    })
    if(cbval !== undefined) return Promise.reject(cbval)

    const edition_filter = edition === 'java' ? normalizeArray(['font/', 'colormap/', 'misc/shadow', 'presets/isles', 'realms/inspiration', 'realms/new_world', 'realms/survival_spawn', 'realms/upload', 'realms/adventure', 'realms/experience', 'environment/clouds', 'misc/nausea', 'misc/vignette', 'realms/darken', 'realms/plus_icon', 'models/armor/piglin_leather_layer_1', 'entity/phantom_eyes.png', 'misc/white.png', 'block/lightning_rod_on.png', 'gui/title/background/panorama_overlay.png', 'effect/dither.png', 'misc/unknown_server.png', 'entity/llama/spit.png', 'block/redstone_dust_overlay.png']) : normalizeArray([...BEDROCK_UI, 'font/', 'colormap/', '/gui/', 'environments/clouds', 'persona_thumbnails/', 'environment/end_portal_colors', 'textures/flame_atlas', 'textures/forcefield_atlas', 'blocks/bed_feet_', 'blocks/bed_head_', 'blocks/flower_paeonia', 'blocks/flower_rose_blue', 'blocks/structure_air', 'map/player_icon_background', 'misc/missing_texture', 'items/boat', 'items/egg_agent', 'items/quiver', 'items/ruby', 'entity/agent.png', 'entity/cape_invisible.png', 'entity/char.png', 'entity/horse/', 'entity/lead_rope.png', 'entity/loyalty_rope.png', 'entity/pig/pigzombie.png', 'entity/villager/', 'entity/wither_boss/wither_armor_blue.png', 'entity/zombie_villager/'])

    const vanilla_textures = _getAllFilesFromFolder(vanilla_tmp_path, edition_filter).map(f => normalize(f.replace(vanilla_tmp_path, '').substring(1)))
    const count_vanilla = vanilla_textures.length
    
    const repo = await Repository.open(compliance_tmp_path)

    const head_commit = await repo.getHeadCommit()

    return await addToHistory(head_commit, vanilla_textures, [])
      .then(list => {
        // group list by day
        const groupedByDay = list.reduce((acc, cur) => {
          let add = false
          let result
          if(acc.length === 0) {
            add = true
          } else {
            if(acc[acc.length - 1].date.toString().substring(0, 10) !== cur.date.toString().substring(0, 10)) {
              add = true
            }
          }

          if(add) {
            result = cur
            acc.push(result)
          } else {
            result = acc[acc.length - 1]
            result.files = Object.assign({}, result.files, cur.files)
            acc[acc.length - 1] = result
          }

          return acc
        }, [])

        return groupedByDay
      })
      .then(groupedByDay => {
        const dayAdditionList = []
        const finalList = {}

        let tmp
        groupedByDay.forEach(diff => {
          tmp = {
            date: diff.date
          }
          Object.keys(diff.files).forEach(path => {
            const val = diff.files[path]
            if(val === 'A') {
              finalList[path] = 'A'
            } else if(val === 'D') {
              delete finalList[path]
            }
          })
          tmp.files = JSON.parse(JSON.stringify(finalList))
          dayAdditionList.push(tmp)
        })

        return dayAdditionList
      })
      .then(dayAdditionList => {
        return dayAdditionList.map(da => {
          return {
            ...da,
            percent: Object.keys(da.files).length / count_vanilla,
          }
        })
      })
      .catch(err => {
        console.error(err)
        return Promise.reject(err)
      })
  }
}