# How to translate the webapp:

First of all, copy the `en_US.js` file en rename it accordingly to your country spoken language.
Then you can start translating the file. Once you have translated the file, add the newly added language to the `compliapp.js` file :

```js
import enUS from './resources/strings/en_US.js'
import <country><LANG> from './resources/strings/<country>_<LANG>.js'
// ...

const LANGS = {
  en: enUS,
  <country>: Object.merge({}, enUS, <country><LANG>), // (keep it alphabetically ordered please)
  // ...
}

```
> Where `country`/`LANG` is the shortcut name of your `country`/`language`

Finally you can make a pull request with those changes!

## Translation credits:

- [x] Brazilian Portuguese (_@PedroESP\_01_)
- English
- [x] French (_@Juknum_)
- [x] German (_@RobertR11_)