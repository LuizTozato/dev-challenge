const fs = require("fs")
csv = fs.readFileSync('./input.csv')

//Step-by-step
//1º
let inputArray = csv.toString().split('\r\n')
inputArray.shift()
//2º
let cadastroUnitario = inputArray.map(substituirCaracteresERetornarEmArray)
cadastroUnitario.forEach(agruparGroupsETransformarEmArray)
//3º
cadastroUnitario.forEach(sanearEmail)
//4º
cadastroUnitario.forEach(sanearTelefones)
//5º
const cadastroUnitarioCopia = copiarArray(cadastroUnitario)
//6º
const cadastroUnitarioAgrupado = agruparPorEID(cadastroUnitarioCopia)
//7º
let cadastroUnitarioAgrupadoFiltrado = cadastroUnitarioAgrupado.map(removerDuplicidadeEmArray)
//8º
const arrayDeObjetos = construirArrayDeObjetos(cadastroUnitarioAgrupadoFiltrado)
//9º
fs.writeFileSync("output.json", JSON.stringify(arrayDeObjetos, null, 4))



// FUNCTIONS =================================
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
    
    element[2] = element[2].replace(/[&=_'+<>:() ]/g,"").split('/')
    element[4] = element[4].replace(/[&=_'+<>:() ]/g,"").split('/')
    element[6] = element[6].replace(/[&=_'+<>:() ]/g,"").split('/')

}

function sanearTelefones(element) {

    element[3] = substituirChars(element[3])
    element[5] = substituirChars(element[5])
    element[7] = substituirChars(element[7])

    function substituirChars(str) {
        
        let s = '55'

        for (let ch of str){
            if(Number.parseInt(ch) || ch == '0') {
                s += ch
            }
        }

        let arr = []
        if(s !== '55' && s.length == 13){
            arr.push(s)
        }

        return arr
    }
}

function copiarArray(array) {

    return JSON.parse(JSON.stringify(array))

}

function agruparPorEID(array) {

    let acumulador = []

    let ciclos = array.length

    for(let i = 0; i < ciclos; i++) {

        let valorAtual = array[i]

        if(i !== 0) {
            if( valorAtual[1] === acumulador[acumulador.length-1][1]){
                //logica para acumular com o array anterior
                for (let j = 2; j<=8 ; j++){
                    
                    valorAtual[j].forEach( valorAtual => {
                        if(valorAtual !== ''){
                            acumulador[acumulador.length-1][j].push(valorAtual)
                        }
                    })
                }
            }
            else {
                acumulador.push(valorAtual)
            }
        }
        else {
            acumulador.push(valorAtual)
        }
    }

    return acumulador

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

function construirArrayDeObjetos(cadastroUnitarioAgrupadoFiltrado) {

    let arr = []

    cadastroUnitarioAgrupadoFiltrado.forEach((element)=>{

        let obj = new Object()

        obj["fullname"]  = element[0]
        obj["eid"]       = element[1]
        obj["groups"]    = element[8]
        obj["addresses"] = construirArrayAddresses(element[1])
        obj["invisble"]  = booleanear( element[9] )
        obj["see_all"]   = booleanear( element[10] )

        arr.push(obj)
    })

    return arr

    //Funções auxiliares
    function construirArrayAddresses(eid) {

        let arr = []

        cadastroUnitario.forEach(el => {

            //Limitando o nº de ciclos para ganho de performance
            let maiorNumeroDeElementosDentroDoEl = 0
            for (let i = 2; i <= 7; i++) {
                if(el[i].length > maiorNumeroDeElementosDentroDoEl){
                    maiorNumeroDeElementosDentroDoEl = el[i].length
                }
            }

            if(el[1] === eid) {

                for (let j = 0; j < maiorNumeroDeElementosDentroDoEl; j++) {//coluna
            
                    for (let i = 2; i <= 7; i++) {//linha
                        
                        if(el[i][j]){
                            
                            let objAux = new Object()

                            let typeStr = i==2||i==4||i==6? "email" : "phone"
                            let tagStr  = i==2||i==3? ["Student"] : i==4||i==5? ["Pedagogical","Responsible"] : ["Financial","Responsible"]

                            objAux["type"] = typeStr
                            objAux["tags"] = tagStr
                            objAux["address"] = el[i][j]
                            arr.push(objAux)
                        }
                    }
                }
            }
            
        })

        return arr
    }

    function booleanear(el){
        
        if(Number.parseInt(el)){
            return !!Number.parseInt(el)
        } else {
            return el === 'yes'? true : false
        }
    }
    
}