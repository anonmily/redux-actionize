// Miscellaneous Tools/Utilities
import _ from 'lodash'

export function upper(str) {
    return str ? String(str).toUpperCase() : ""
}

export function lower(str) {
    return str ? String(str).toLowerCase() : ""
}

export function proper(str){
    if(str){
        let result = ""
        _.words(str).forEach( (word, index) => {
            if( index !== 0 ){
                result += ' '
            }
            result += _.upperFirst(word)
        })
        return result
    }else{
        return ""
    }
}

export function to_underscore(str){
    return lower(str)
        .trim()
        .replace(/[ -]+/g, "_")
}