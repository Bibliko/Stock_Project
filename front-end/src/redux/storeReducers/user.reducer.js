const userReducer = (action, state) => {
    const { method, whichPropsToChange } = action;

    if(method==="default") {
        //console.log('Changed');
        
        return { 
            ...state, 
            userSession: {
                ...state.userSession,
                ...whichPropsToChange
            }
        };
    }

    if(method==="logout") {
        return {
            ...state,
            userSession: {}
        }
    }

    if(method==="updateUserSharesValue") {
        return {
            ...state,
            userSharesValue: whichPropsToChange
        }
    }
};

export default userReducer;