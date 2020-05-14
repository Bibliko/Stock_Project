const userReducer = (action, state) => {
    const { method, whichPropsToChange } = action;

    if(method==="default") {
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
};

export default userReducer;