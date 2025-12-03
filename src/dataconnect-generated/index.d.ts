import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Article_Key {
  id: UUIDString;
  __typename?: 'Article_Key';
}

export interface Charity_Key {
  id: UUIDString;
  __typename?: 'Charity_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface Donation_Key {
  id: UUIDString;
  __typename?: 'Donation_Key';
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface ListCharitiesData {
  charities: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
  } & Charity_Key)[];
}

export interface ListMyDonationsData {
  donations: ({
    id: UUIDString;
    amount: number;
    currency?: string | null;
    donationDate: DateString;
    charity: {
      name: string;
    };
  } & Donation_Key)[];
}

export interface RegisterForEventData {
  registration_insert: Registration_Key;
}

export interface RegisterForEventVariables {
  eventId: UUIDString;
}

export interface Registration_Key {
  userId: UUIDString;
  eventId: UUIDString;
  __typename?: 'Registration_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListCharitiesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCharitiesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCharitiesData, undefined>;
  operationName: string;
}
export const listCharitiesRef: ListCharitiesRef;

export function listCharities(): QueryPromise<ListCharitiesData, undefined>;
export function listCharities(dc: DataConnect): QueryPromise<ListCharitiesData, undefined>;

interface RegisterForEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RegisterForEventVariables): MutationRef<RegisterForEventData, RegisterForEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RegisterForEventVariables): MutationRef<RegisterForEventData, RegisterForEventVariables>;
  operationName: string;
}
export const registerForEventRef: RegisterForEventRef;

export function registerForEvent(vars: RegisterForEventVariables): MutationPromise<RegisterForEventData, RegisterForEventVariables>;
export function registerForEvent(dc: DataConnect, vars: RegisterForEventVariables): MutationPromise<RegisterForEventData, RegisterForEventVariables>;

interface ListMyDonationsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyDonationsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyDonationsData, undefined>;
  operationName: string;
}
export const listMyDonationsRef: ListMyDonationsRef;

export function listMyDonations(): QueryPromise<ListMyDonationsData, undefined>;
export function listMyDonations(dc: DataConnect): QueryPromise<ListMyDonationsData, undefined>;

