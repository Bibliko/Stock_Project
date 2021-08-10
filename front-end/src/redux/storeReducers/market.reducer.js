const marketReducer = (action, state) => {
  const { method } = action;

  if (method==="openMarket") {
    //console.log('Changed');

    return {
      ...state,
      isMarketClosed: false
    };
  }

  if (method==="closeMarket") {
    return {
      ...state,
      isMarketClosed: true
    }
  }
};

export default marketReducer;
