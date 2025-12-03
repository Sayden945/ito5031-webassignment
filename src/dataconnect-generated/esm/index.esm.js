import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'ito5032-web',
  location: 'us-east4'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const listCharitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCharities');
}
listCharitiesRef.operationName = 'ListCharities';

export function listCharities(dc) {
  return executeQuery(listCharitiesRef(dc));
}

export const registerForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RegisterForEvent', inputVars);
}
registerForEventRef.operationName = 'RegisterForEvent';

export function registerForEvent(dcOrVars, vars) {
  return executeMutation(registerForEventRef(dcOrVars, vars));
}

export const listMyDonationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyDonations');
}
listMyDonationsRef.operationName = 'ListMyDonations';

export function listMyDonations(dc) {
  return executeQuery(listMyDonationsRef(dc));
}

