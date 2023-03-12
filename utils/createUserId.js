exports.createId = function(userName){
    userName = 'yetixx12'
    let userId = ''
    // 遍历userName
    for(let i in userName){
        if (!isNaN(parseFloat(userName[i]))) {
            userId+=userName[i]
        }else{
            userId+=userName[i].charCodeAt()+''
        }

    }
    return userId

}

