const gf = require('../globalfunctions.js'),
      gacha = require('../data/simulator.json'),
      typeList = require('../data/types.json'),
      dropList = require('../data/droplist.json'),
      fs = require('fs')

const max = 1000
const cutoff = 0.95

module.exports.run = async (bot,message,args) => {
  if(!gf.isAllowed(message, module.exports.help.ignore)) return;

  let capsule = args[0]
  let caps = Object.keys(dropList)
  if(capsule === undefined){
    return message.channel.send(`These are all the current Capsule categories:\n\`${caps.join(', ')}\``)
  }
  if(caps.indexOf(capsule) > -1) {
    let drops = Object.keys(capsule)
    if (args[1] === undefined) {
      return message.channel.send(`These are all the current drops:\n\`${drops.join(', ')}\``)
    else {
      let drop = args[1].toLowerCase()
      if (category.toLowerCase().indexOf(drop) > -1) {
        let N = 10

        if(args[2] !== undefined){
          if(!isNaN(parseInt(args[2])) { return message.channel.send(`Please enter a number between 1-${max}`) }
          else { N = ParseInt(args[2]) }
        }

        if(N < 1 || N > max) return message.channel.send(`Please enter a number between 1-${max}`)

        let probs = []
        let num_drops = Object.keys(drop).sort()
        
        if (capsule = 'gold') { //unique handling for gold capsule with tiers
          let n = 1;
          switch (drop.toLowerCase()) {
            case 'high':
              n = 6
              break
            case 'mid':
              n = 14
              break
            case 'low':
              n = 24
              break
            default:
              n = 1
          }
          probs[0] += (1 - probs[0])*(n-1)/n
          for (let k = 1; k <= num_drops[num_drops.length-1]; k++) { probs[k] = drop[k]/n || 0 }
        }
        else {
          for (let k = 0; k <= num_drops[num_drops.length-1]; k++) { probs[k] = drop[k] || 0 }
        }

        let probsum = 0
        let m = 1
        let prev = probs.slice()  //make a copy of drop's probability distribution
        let display_probs = {0.1:0,0.25:0,0.5:0,0.75:0,0.9:0}
        let ps = Object.keys(display_probs).sort()
        let p = 0

        while (prev.length <= N || probsum < cutoff) {
          if (prev.length > N) {
            probsum = prev.slice(N).reduce(function(a,b,ind,arr) {return a+ b;})
            while (probsum > ps[p] && display_probs[ps[p]] === 0) { //fill out dict for displaying later
                display_probs[ps[p]] = m
                p += 1
            }
          }
          prev = convolve(prev,probs)
          m += 1
        }
        
        let string = `Your chance of pulling ${N} args[1] is as follows:\n`
        for (key in display_probs) {
          string +=  `${key} - ${display_probs[key]} capsules\n`
        }
        return message.channel.send(`${string}`)

        /*
        let prizes = {}
        for(let i = 0; i < amount;i++){
          let prize = getPrize(gacha[category])
          let amount = 0
          if(isNaN(Number(prize[0]))) amount = 1
          else amount = Number(prize.shift())
          prize = prize.join(' ')
          if(args[2] === undefined || check.toLowerCase() == prize.toLowerCase()){
            if(prize.substr(prize.length - 1) !== 's'){
              prize += 's'
            }
            if (prize in prizes) prizes[prize] += amount
            else prizes[prize] = amount
          }
        }
        const ordered = {};
        Object.keys(prizes).sort().forEach(function(key) {
          ordered[key] = prizes[key]
        })
        prizes = ordered
        let string = ''
        for(key in prizes){
          string += `${prizes[key]} ${key}, `
        }
        return message.channel.send(`Here are the total drops:\n${string}`)
        */
      }
    }
    else{
      return message.channel.send(`Invalid Drop\nThese are all the current drops:\n\`${drops.join(', ')}\``)    
    }
    // if(character !== undefined){ 
    // }
    // else{      
    // }
    // const embed = gf.embedGacha(gacha[category])
    // return message.channel.send({embed})      
  }
  return message.channel.send(`Invalid Capsule!\nThese are all the current capsules:\n\`${caps.join(', ')}\``)
}

module.exports.help = {
  name: "calc_gacha",
  aliases: [
    "calculator",
    "calc",
    "gc"
  ],
  ignore : [
    "416432474193657867", //arena-of-war
    "429222755745923073"
  ]
}

function convolve(array1,array2) {
  let conv = [];
  let len1 = array1.length;
  let len2 = array2.length;
  for (let i=0; i < len1 + len2 - 1; i++) {
    let sum = 0;
    for (let j = Math.max(0,i-len2+1); j <= Math.min(i,len1-1); j++) {
      let sum += array1[j]*array2[i-j];
    }
    conv[i] = sum;
  }
  return conv;
  //document.write(conv)
} 

function weightedRand(probs,sizes) {    //selects tier (3,5,8,10,30) by weighted probability
  var i, sum = 0, r = Math.random();
  for (i in probs) {
    sum += (probs[i])/100 * sizes[i]
    if (r <= sum) {
      return probs[i]
    }
  }
  return probs[probs.length - 1]
}

function uniformRand (array){   //selects random hero from tier with equal probability
  return array[Math.floor(Math.random() * array.length)];
}

function getPrize(capsule){
    let sizes = []
    for(i in capsule){
      sizes.push(capsule[i].length)
    }
    let dRate = Object.keys(capsule).map(Number)
    let prizePool = String(weightedRand(dRate,sizes))
    return uniformRand(capsule[prizePool]).split(' ')
}
