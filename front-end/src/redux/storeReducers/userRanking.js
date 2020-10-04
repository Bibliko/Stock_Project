export const userRanking = (state= [], action) =>{
  if(action.type==='FETCH_USERRANKING'){
    return action.payload
  }
  else{
    return state
  }

  }
