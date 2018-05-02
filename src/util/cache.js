'use strict'

class CacheUtils {
  static getCachedDBSingle (model, cache, dbProps, cacheKey, flagKey) {
    return cache.get(cacheKey)
      .then(data => {
        if (!data) {
          return cache.get(flagKey)
            .then(flag => {
              if (flag) {
                return null
              }

              return model.findOne(dbProps)
                .then(dbItem => {
                  if (!dbItem || !dbItem.prefix) {
                    return cache.set(flagKey, 1, 'EX', 1800)
                      .return(null)
                  }

                  let prefix = dbItem.prefix
                  return cache.set(cacheKey, prefix, 'EX', 3600)
                    .return(prefix)
                })
            })
        }

        return data
      })
  }
}

module.exports = CacheUtils
