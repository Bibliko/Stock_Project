const userReducer = (action, state) => {
    const { method, whichPropsToChangeOrWhatDataForChanging } = action;

    if(method==="default") {
        //console.log('Changed');
        
        return { 
            ...state, 
            userSession: {
                ...state.userSession,
                ...whichPropsToChangeOrWhatDataForChanging
            }
        };
    }

    if(method==="logout") {
        return {
            ...state,
            userSession: {}
        }
    }
};

export default userReducer;