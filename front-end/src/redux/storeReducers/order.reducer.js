const orderReducer = (action, state) => {
  const { method, dataToChange } = action;

  if (method === "change") {
    return {
      ...state,
      userOrder: {
        ...state.userOrder,
        ...dataToChange,
        disabled: {
          ...state.userOrder.disabled,
          ...dataToChange.disabled,
        },
      },
    };
  }

  if (method === "clear") {
    return {
      ...state,
      userOrder: { disabled: {} },
    };
  }
};

export default orderReducer;
