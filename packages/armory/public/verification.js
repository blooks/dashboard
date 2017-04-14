// Write your package code here!

Armory = {}

var armoryRegex = /Watch-OnlyRootID:([asdfghjkwertuion]{18})Watch-OnlyRootData:([asdfghjkwertuion]{144})/
Armory.convertStringToRootData = function (string) {
  return string.replace(/\s/gm, '').match(armoryRegex)
}
