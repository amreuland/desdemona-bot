'use strict'

const R = require('ramda')

const BigNumber = require('big-number')

const accountTypeChars = {
  anonGameServer: 'A',
  gameServer: 'G',
  multiseat: 'M',
  pending: 'P',
  contentServer: 'C',
  clan: 'g',
  chat: 'T',
  invalid: 'I',
  individual: 'U',
  anonUser: 'a'
}

const UniverseInvalid = 0
const UniversePublic = 1
const UniverseBeta = 2
const UniverseInternal = 3
const UniverseDev = 4
const UniverseMax = 5

const TypeInvalid = 0
const TypeIndividual = 1
const TypeMultiseat = 2
const TypeGameServer = 3
const TypeAnonGameServer = 4
const TypePending = 5
const TypeContentServer = 6
const TypeClan = 7
const TypeChat = 8
const TypeP2PSuperSeeder = 9
const TypeAnonUser = 10

const AllInstances = 0
const DesktopInstance = 1
const ConsoleInstance = 2
const WebInstance = 4

const InstanceFlagClan = 524288
const InstanceFlagLobby = 262144
const InstanceFlagMMSLobby = 131072

const VanityIndividual = 1
const VanityGroup = 2
const VanityGameGroup = 3

class SteamID {
  constructor (value) {
    this.data = BigNumber(0)
    if (!value) {
      return
    }

    let matches = R.match(/^STEAM_([0-4]):([0-1]):([0-9]{1,10})$/, value)
    if (matches.length === 3) {
      this.accountId = matches[2]

      this.universe = parseInt(matches[0], 10)

      if (this.universe === UniverseInvalid) {
        this.universe = UniversePublic
      }

      this.authServer = parseInt(matches[1], 10)

      this.accountId = (parseInt(this.accountId, 10) << 1) | this.authServer

    }
  }


}

module.exports = SteamID
