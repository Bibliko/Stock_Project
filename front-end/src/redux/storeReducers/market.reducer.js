const marketReducer = (action, state) => {
    const { method } = action;

    if(method==="closeMarket") {
        //console.log('Changed');
        
        return { 
            ...state, 
            isMarketClosed: true
        };
    }

    if(method==="openMarket") {
        return {
            ...state,
            isMarketClosed: false
        }
    }
};

export default marketReducer;