const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'ito5032-web',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const listCharitiesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCharities');
}
listCharitiesRef.operationName = 'ListCharities';
exports.listCharitiesRef = listCharitiesRef;

exports.listCharities = function listCharities(dc) {
  return executeQuery(listCharitiesRef(dc));
};

const registerForEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RegisterForEvent', inputVars);
}
registerForEventRef.operationName = 'RegisterForEvent';
exports.registerForEventRef = registerForEventRef;

exports.registerForEvent = function registerForEvent(dcOrVars, vars) {
  return executeMutation(registerForEventRef(dcOrVars, vars));
};

const listMyDonationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyDonations');
}
listMyDonationsRef.operationName = 'ListMyDonations';
exports.listMyDonationsRef = listMyDonationsRef;

exports.listMyDonations = function listMyDonations(dc) {
  return executeQuery(listMyDonationsRef(dc));
};
