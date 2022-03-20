const fs = require("fs")
csv = fs.readFileSync('./input.csv')
    
let inputArray = csv.toString().split('\r\n') //split só em string. inputArray é um array de strings

const headers = inputArray[0].split(',')
headers.splice(9,1)
//console.log(headers)

inputArray.shift()
//console.log(inputArray)

let cadastroUnitario = inputArray.map(substituirCaracteresERetornarEmArray)
cadastroUnitario.forEach(agruparGroupsETransformarEmArray)
//console.log(cadastroUnitario)
cadastroUnitario.forEach(sanearEmail)
//console.log(cadastroUnitario)
cadastroUnitario.forEach(sanearTelefones)
//console.log(cadastroUnitario)
const cadastroUnitarioAgrupado = cadastroUnitario.reduce(agruparPorEID,[])
//console.log(cadastroUnitarioAgrupado)
let cadastroUnitarioAgrupadoFiltrado = cadastroUnitarioAgrupado.map(removerDuplicidadeEmArray)
console.log(cadastroUnitarioAgrupadoFiltrado)

//const arrayDeObjetos = construirArrayDeObjetos(headers, cadastroUnitario)
//console.log(arrayDeObjetos)

fs.writeFileSync("output.json", JSON.stringify(cadastroUnitarioAgrupadoFiltrado, null, 4))

// FUNCTIONS ---------------------
function substituirCaracteresERetornarEmArray(string) {
    
    let s = ''

    //Tratando blocos entre "aspas"
    let boolean = 0
    for (let ch of string) {
        if (ch === '"' && boolean === 0){
            boolean = 1
        }
        else if (ch === '"' && boolean === 1) {
            boolean = 0
        }

        if (ch === ',' && boolean === 1) {
            ch = '/'
        }
        if (ch !== '"') {
            s += ch
        }
    }

    let array = s.split(',')
    return array
}

function agruparGroupsETransformarEmArray(element) {
    if(element[9] !== '') {
        element[8] += "/"+element[9]
    }
    element.splice(9,1)
    element[8] = element[8].split('/').map((el) => el.trim())
}

function sanearEmail(element) {
    
    if(!element[2].includes('@')) {element[2] = ''}
    if(!element[4].includes('@')) {element[4] = ''}
    if(!element[6].includes('@')) {element[6] = ''}
    
    element[2] = element[2].split('/')
    element[4] = element[4].split('/')
    element[6] = element[6].split('/')

    element[2] = element[2].map(el => el.split('.com ',1).toString().trim())
    element[4] = element[4].map(el => el.split('.com ',1).toString().trim())
    element[6] = element[6].map(el => el.split('.com ',1).toString().trim())

}

function sanearTelefones(element) {

    element[3] = substituirChars(element[3])
    element[5] = substituirChars(element[5])
    element[7] = substituirChars(element[7])

    function substituirChars(str) {
        
        let s = '55'

        for (let ch of str){
            if(Number.parseInt(ch)) {
                s += ch
            }
        }

        let arr = []
        if(s !== '55'){
            arr.push(s)
        }

        return arr
    }
}

function agruparPorEID(acumulador, valorAtual, index, array) {

    let arrayLengh = array.length

    if(index !== 0) {
        if( valorAtual[1] === array[index - 1][1]){
            //logica para acumular com o array anterior
            
            for (let i = 2; i<=8 ; i++){
                
                valorAtual[i].forEach(valorAtual => {
                    if(valorAtual !== ''){
                        acumulador[index - 1][i].push(valorAtual)
                    }
                })
            }
        }
        else {
            acumulador.push(array[index])
        }
    }
    else {
        acumulador.push(array[index])
    }

    return acumulador
    /*
    console.log(array.length)
    console.log("Valor EID Atual: " + valorAtual[1] + ". Meu index: " + index)
    if(index < array.length - 1){
        console.log("Valor EID Atual: " + valorAtual[1] + ". Valor do proximo: " + array[index + 1][1])
    }
    console.log(".")
    */

}

function removerDuplicidadeEmArray(element, index, array) {
    
    let novoElement = []

    for (let i = 0; i < element.length; i++) {
        if(typeof(element[i]) === "object"){
            novoElement[i] = element[i].filter(filtrarDuplicados)
        } else {
            novoElement[i] = element[i]
        }
    }

    return novoElement

    function filtrarDuplicados(el, index, array)  {
        return array.indexOf(el) == index 
    }

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