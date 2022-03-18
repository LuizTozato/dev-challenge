const fs = require("fs")
csv = fs.readFileSync('./input.csv')

let inputArray = csv.toString().split('\r\n') //split só em string. inputArray é um array de strings

let headers = inputArray[0].split(',')
headers.splice(9,1)
//console.log(headers)

inputArray.shift()
//console.log(inputArray)

let cadastroUnitario = inputArray.map(substituirCaracteresERetornarEmArray)
cadastroUnitario.forEach(agruparGroups);
//console.log(cadastroUnitario)

let arrayDeObjetos = construirArrayDeObjetos(headers, cadastroUnitario)
console.log(arrayDeObjetos)

// FUNCTIONS ---------------------
function substituirCaracteresERetornarEmArray(string) {

    let s = ''

    //Tratando blocos entre "parenteses"
    let flag = 0
    for (let ch of string) {
        if (ch === '"' && flag === 0){
            flag = 1
        }
        else if (ch === '"' && flag === 1) {
            flag = 0
        }

        if (ch === ',' && flag === 1) {
            ch = '/'
        }
        if (ch !== '"') {
            s += ch
        }
    }

    let array = s.split(',')
    return array
}

function agruparGroups(element) {
    element[8] += "/"+element[9]
    element.splice(9,1)
}

function construirArrayDeObjetos(headers, cadastroUnitario) {

    let arr = []
    

    for( let i = 0; i < cadastroUnitario.length; i++ ) { //5
        
        let obj = new Object()

        for ( let j = 0; j < headers.length; j++ ) { //12

            
            obj[headers[j]] = cadastroUnitario[i][j]

            
        }

        arr.push(obj)

    }

    return arr
}