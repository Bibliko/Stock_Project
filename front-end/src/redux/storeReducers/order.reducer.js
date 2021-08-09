/**
 * userOrder: {
 *   id: id of an existing order to amend. Leave empty for new order,
 *   type: the default type,
 *   companyCode: the default companyCode,
 *   quantity: the default quantity,
 *   option: the default option,
 *   limitPrice: the default limitPrice,
 *   amend: true if amend mode is on
 * }
 */

const orderReducer = (action, state) => {
  const { method, dataToChange } = action;

  if (method === "change") {
    return {
      ...state,
      userOrder: {
        ...state.userOrder,
        ...dataToChange,
      },
    };
  }

  if (method === "clear") {
    return {
      ...state,
      userOrder: {},
    };
  }
};

export default orderReducer;
