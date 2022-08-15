const defaultInt = 100
const defaultSample = 6

export const randInt = (exclMax = defaultInt) => Math.floor(Math.random() * exclMax)

export const randClt = (sample = defaultSample) => {
  let clt = 0

  for (let i = 0; i < sample; i++) clt += Math.random()

  return clt / sample
}

export const randIntClt = (exclMax = defaultInt, sample = defaultSample) => Math.floor(randClt(sample) * exclMax)
