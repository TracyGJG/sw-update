# Service Worker update (sw-update)

Utility for updating the Service Worker script of a PWA via a node call.

```sh
Usage: update-sw [options] [command]

CLI to maintain the project's Service Worker (sw.js)

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  name <appName>      Updates the name of the application.
  major               Updates the major element of the semantic version.
  minor               Updates the minor element of the semantic version.
  patch               Updates the patch element of the semantic version.
  assets <assets...>  Updates the assets to be included.
  help [command]      display help for command

```
